import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';

import { initialApis } from '@/data/apis';

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
  isSeedCurrent,
  PERSIST_POLL_MS,
  PERSIST_SAVE_DEBOUNCE_MS,
  savePersistedState,
} from './persistence';

import type { PortalState } from '@/types';

import type { PortalAction } from './actions';



interface PortalContextValue {

  state: PortalState;

  dispatch: React.Dispatch<PortalAction>;

  syncStatus: 'loading' | 'synced' | 'offline';

}



const PortalContext = createContext<PortalContextValue | null>(null);



const seedData = {

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

  const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'offline'>('loading');

  const revisionRef = useRef(0);

  const bootstrappedRef = useRef(false);

  const applyingRemoteRef = useRef(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();



  const persistedSnapshot = useMemo(

    () => extractPersistedData(state),

    [

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



  useEffect(() => {

    let cancelled = false;



    (async () => {

      try {

        const envelope = await fetchPersistedState();

        if (cancelled) return;



        if (isSeedCurrent(envelope)) {

          dispatch({ type: 'INIT_DATA', payload: envelope.data! });

          revisionRef.current = envelope._revision;

        } else {

          dispatch({ type: 'INIT_DATA', payload: seedData });

          const saved = await savePersistedState(seedData);

          revisionRef.current = saved._revision;

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



  useEffect(() => {

    if (!bootstrappedRef.current || applyingRemoteRef.current || state.apis.length === 0) return;



    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {

      try {

        const saved = await savePersistedState(persistedSnapshot);

        revisionRef.current = saved._revision;

        setSyncStatus('synced');

      } catch {

        setSyncStatus('offline');

      }

    }, PERSIST_SAVE_DEBOUNCE_MS);



    return () => {

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    };

  }, [persistedSnapshot, state.apis.length]);



  useEffect(() => {

    if (!bootstrappedRef.current) return;



    const poll = async () => {

      try {

        const envelope = await fetchPersistedState();

        if (envelope._revision > revisionRef.current && envelope.data) {

          applyingRemoteRef.current = true;

          revisionRef.current = envelope._revision;

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
