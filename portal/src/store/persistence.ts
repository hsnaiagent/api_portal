import type {
  API,
  Application,
  AuditLog,
  Credential,
  LLMSubscriptionRequest,
  PortalState,
  ProviderAccessRequest,
  Subscription,
  WorkflowInstance,
} from '@/types';
import { SEED_VERSION } from '@/config/seed';

export const PERSIST_POLL_MS = 3000;
export const PERSIST_SAVE_DEBOUNCE_MS = 600;

export interface PersistedPortalData {
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

export function extractPersistedData(state: PortalState): PersistedPortalData {
  return {
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

async function parseEnvelope(response: Response): Promise<StateEnvelope> {
  if (!response.ok) {
    throw new Error(`State API error: ${response.status}`);
  }
  return response.json() as Promise<StateEnvelope>;
}

export async function fetchPersistedState(): Promise<StateEnvelope> {
  const response = await fetch('/api/state', { cache: 'no-store' });
  return parseEnvelope(response);
}

export async function savePersistedState(data: PersistedPortalData): Promise<StateEnvelope> {
  const response = await fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, _seedVersion: SEED_VERSION }),
  });
  return parseEnvelope(response);
}

export function isSeedCurrent(envelope: StateEnvelope): boolean {
  return envelope._seedVersion === SEED_VERSION && hasPersistedData(envelope.data);
}
