import type {
  API,
  Application,
  AuditLog,
  Credential,
  Domain,
  LLMSubscriptionRequest,
  PortalState,
  ProviderAccessRequest,
  Subscription,
  User,
  WorkflowInstance,
} from '@/types';
import { SEED_VERSION } from '@/config/seed';
import { COLLECTION_ID_FIELDS, COLLECTION_KEYS, normalizePersistedData } from './schema';

export const PERSIST_POLL_MS = 3000;
export const PERSIST_SAVE_DEBOUNCE_MS = 600;

export interface PersistedPortalData {
  users: User[];
  domains: Domain[];
  apis: API[];
  subscriptions: Subscription[];
  applications: Application[];
  workflows: WorkflowInstance[];
  credentials: Credential[];
  auditLogs: AuditLog[];
  providerAccessRequests: ProviderAccessRequest[];
  llmSubscriptionRequests: LLMSubscriptionRequest[];
}

export interface StateEnvelope {
  _revision: number;
  _updatedAt: string | null;
  _seedVersion: number;
  data: PersistedPortalData | null;
}

export class RevisionConflictError extends Error {
  current: StateEnvelope;
  constructor(current: StateEnvelope) {
    super('revision_conflict');
    this.name = 'RevisionConflictError';
    this.current = current;
  }
}

export function extractPersistedData(state: PortalState): PersistedPortalData {
  return {
    users: state.users,
    domains: state.domains,
    apis: state.apis,
    subscriptions: state.subscriptions,
    applications: state.applications,
    workflows: state.workflows,
    credentials: state.credentials,
    auditLogs: state.auditLogs,
    providerAccessRequests: state.providerAccessRequests,
    llmSubscriptionRequests: state.llmSubscriptionRequests,
  };
}

export function hasPersistedData(data: PersistedPortalData | null | undefined): boolean {
  return Boolean(data && data.apis.length > 0);
}

/**
 * Merge two persisted datasets by record id. `overlay` records win over `base`
 * records with the same id; records unique to either side are preserved. Used
 * for (a) seed-version migration (existing data overlaid on new seed defaults)
 * and (b) revision-conflict resolution (local edits overlaid on remote state)
 * so no insert from either writer is silently lost.
 */
export function mergeCollectionsById(
  base: PersistedPortalData,
  overlay: PersistedPortalData,
): PersistedPortalData {
  const result = {} as Record<string, unknown[]>;
  for (const key of COLLECTION_KEYS) {
    const idField = COLLECTION_ID_FIELDS[key];
    const byId = new Map<string, unknown>();
    for (const item of (base[key] as unknown[]) ?? []) {
      byId.set(String((item as Record<string, unknown>)[idField]), item);
    }
    for (const item of (overlay[key] as unknown[]) ?? []) {
      byId.set(String((item as Record<string, unknown>)[idField]), item);
    }
    result[key] = [...byId.values()];
  }
  return result as unknown as PersistedPortalData;
}

/** Normalize an envelope's data so the UI always receives complete collections. */
export function normalizeEnvelope(envelope: StateEnvelope): StateEnvelope {
  return {
    ...envelope,
    data: envelope.data ? normalizePersistedData(envelope.data) : null,
  };
}

async function parseEnvelope(response: Response): Promise<StateEnvelope> {
  if (!response.ok) {
    throw new Error(`State API error: ${response.status}`);
  }
  return normalizeEnvelope((await response.json()) as StateEnvelope);
}

export async function fetchPersistedState(): Promise<StateEnvelope> {
  const response = await fetch('/api/state', { cache: 'no-store' });
  return parseEnvelope(response);
}

/**
 * Persist state with optimistic concurrency. `baseRevision` is the revision the
 * caller based its edit on; the server returns 409 if it has since advanced, in
 * which case we throw RevisionConflictError carrying the latest envelope.
 */
export async function savePersistedState(
  data: PersistedPortalData,
  baseRevision?: number,
): Promise<StateEnvelope> {
  const response = await fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, _seedVersion: SEED_VERSION, _baseRevision: baseRevision }),
  });

  if (response.status === 409) {
    const body = (await response.json()) as { current: StateEnvelope };
    throw new RevisionConflictError(normalizeEnvelope(body.current));
  }

  return parseEnvelope(response);
}

export function isSeedCurrent(envelope: StateEnvelope): boolean {
  return envelope._seedVersion === SEED_VERSION && hasPersistedData(envelope.data);
}
