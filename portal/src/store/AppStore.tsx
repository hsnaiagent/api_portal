import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { initialApis } from '@/data/apis';
import { initialUsers } from '@/data/users';
import { initialDomains } from '@/data/domains';
import { initialApplications } from '@/data/applications';
import { initialAuditLogs } from '@/data/audit-log';
import { initialCredentials } from '@/data/credentials';
import { initialLLMSubscriptionRequests } from '@/data/llm-requests';
import { initialProviderAccessRequests } from '@/data/provider-requests';
import { initialSubscriptions } from '@/data/subscriptions';
import { initialWorkflows } from '@/data/workflows';

import { initialState, portalReducer } from './reducer';
import {
  extractPersistedData,
  fetchPersistedState,
  hasPersistedData,
  isSeedCurrent,
  mergeCollectionsById,
  PERSIST_POLL_MS,
  PERSIST_SAVE_DEBOUNCE_MS,
  RevisionConflictError,
  savePersistedState,
  type PersistedPortalData,
} from './persistence';

import type { PortalState } from '@/types';
import type { PortalAction } from './actions';

type SyncStatus = 'loading' | 'synced' | 'offline';

interface PortalContextValue {
  state: PortalState;
  dispatch: React.Dispatch<PortalAction>;
  syncStatus: SyncStatus;
}

const PortalContext = createContext<PortalContextValue | null>(null);

const seedData: PersistedPortalData = {
  users: initialUsers,
  domains: initialDomains,
  apis: initialApis,
  subscriptions: initialSubscriptions,
  applications: initialApplications,
  workflows: initialWorkflows,
  credentials: initialCredentials,
  auditLogs: initialAuditLogs,
  providerAccessRequests: initialProviderAccessRequests,
  llmSubscriptionRequests: initialLLMSubscriptionRequests,
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(portalReducer, initialState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');

  const revisionRef = useRef(0);
  const bootstrappedRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // Snapshot of the last data we know is persisted, used to skip no-op saves.
  const lastSavedJsonRef = useRef<string>('');

  const persistedSnapshot = useMemo(
    () => extractPersistedData(state),
    [
      state.users,
      state.domains,
      state.apis,
      state.subscriptions,
      state.applications,
      state.workflows,
      state.credentials,
      state.auditLogs,
      state.providerAccessRequests,
      state.llmSubscriptionRequests,
    ],
  );

  // Bootstrap: load persisted state, migrate on seed change, or seed a fresh store.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const envelope = await fetchPersistedState();
        if (cancelled) return;

        if (isSeedCurrent(envelope)) {
          dispatch({ type: 'INIT_DATA', payload: envelope.data! });
          revisionRef.current = envelope._revision;
          lastSavedJsonRef.current = JSON.stringify(envelope.data);
        } else if (hasPersistedData(envelope.data)) {
          // Seed version changed but the user has data — migrate by merging new
          // seed defaults under existing records (existing wins) so we add new
          // fixtures without losing any user-created/edited records.
          const migrated = mergeCollectionsById(seedData, envelope.data!);
          dispatch({ type: 'INIT_DATA', payload: migrated });
          const saved = await savePersistedState(migrated, envelope._revision);
          revisionRef.current = saved._revision;
          lastSavedJsonRef.current = JSON.stringify(migrated);
        } else {
          dispatch({ type: 'INIT_DATA', payload: seedData });
          const saved = await savePersistedState(seedData, envelope._revision);
          revisionRef.current = saved._revision;
          lastSavedJsonRef.current = JSON.stringify(seedData);
        }
        setSyncStatus('synced');
      } catch {
        if (!cancelled) {
          dispatch({ type: 'INIT_DATA', payload: seedData });
          setSyncStatus('offline');
        }
      } finally {
        if (!cancelled) bootstrappedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist local changes (debounced, no-op-skipped, conflict-aware).
  useEffect(() => {
    if (!bootstrappedRef.current || applyingRemoteRef.current || state.apis.length === 0) return;

    const json = JSON.stringify(persistedSnapshot);
    if (json === lastSavedJsonRef.current) return; // nothing changed — avoid write amplification

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const saved = await savePersistedState(persistedSnapshot, revisionRef.current);
        revisionRef.current = saved._revision;
        lastSavedJsonRef.current = json;
        setSyncStatus('synced');
      } catch (err) {
        if (err instanceof RevisionConflictError && err.current.data) {
          // Another writer advanced the revision. Overlay our local edits on the
          // remote state (our records win, their inserts preserved) and retry once.
          const merged = mergeCollectionsById(err.current.data, persistedSnapshot);
          try {
            const saved = await savePersistedState(merged, err.current._revision);
            revisionRef.current = saved._revision;
            lastSavedJsonRef.current = JSON.stringify(merged);
            applyingRemoteRef.current = true;
            dispatch({ type: 'INIT_DATA', payload: merged });
            window.setTimeout(() => {
              applyingRemoteRef.current = false;
            }, 100);
            setSyncStatus('synced');
            return;
          } catch {
            // Fall through to offline on repeated conflict/failure.
          }
        }
        setSyncStatus('offline');
      }
    }, PERSIST_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [persistedSnapshot]);

  // Poll for remote changes (multi-tab sync).
  useEffect(() => {
    if (!bootstrappedRef.current) return;

    const poll = async () => {
      try {
        const envelope = await fetchPersistedState();
        if (envelope._revision > revisionRef.current && envelope.data) {
          applyingRemoteRef.current = true;
          revisionRef.current = envelope._revision;
          lastSavedJsonRef.current = JSON.stringify(envelope.data);
          dispatch({ type: 'INIT_DATA', payload: envelope.data });
          setSyncStatus('synced');
          window.setTimeout(() => {
            applyingRemoteRef.current = false;
          }, 100);
        } else {
          setSyncStatus('synced');
        }
      } catch {
        setSyncStatus('offline');
      }
    };

    const interval = window.setInterval(poll, PERSIST_POLL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <PortalContext.Provider value={{ state, dispatch, syncStatus }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within AppStoreProvider');
  return ctx;
}
