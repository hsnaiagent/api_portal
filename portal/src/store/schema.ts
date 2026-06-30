import type { PersistedPortalData } from './persistence';

// Runtime shape definition for persisted portal state.
// Mirrors server/state-schema.mjs — keep both in sync.

export const COLLECTION_ID_FIELDS = {
  users: 'user_id',
  domains: 'domain_id',
  apis: 'api_id',
  subscriptions: 'subscription_id',
  applications: 'application_id',
  workflows: 'workflow_instance_id',
  credentials: 'credential_id',
  auditLogs: 'audit_id',
  providerAccessRequests: 'request_id',
  llmSubscriptionRequests: 'llm_request_id',
} as const;

export const COLLECTION_KEYS = Object.keys(
  COLLECTION_ID_FIELDS,
) as (keyof typeof COLLECTION_ID_FIELDS)[];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Coerce arbitrary parsed JSON into a complete PersistedPortalData object so a
 * partial/corrupt payload can never crash the UI: missing collections become [],
 * and items without a valid id are dropped.
 */
export function normalizePersistedData(data: unknown): PersistedPortalData {
  const source = isPlainObject(data) ? data : {};
  const result = {} as Record<string, unknown[]>;
  for (const key of COLLECTION_KEYS) {
    const idField = COLLECTION_ID_FIELDS[key];
    const value = source[key];
    result[key] = Array.isArray(value)
      ? value.filter(
          (item) =>
            isPlainObject(item) &&
            typeof item[idField] === 'string' &&
            (item[idField] as string).length > 0,
        )
      : [];
  }
  return result as unknown as PersistedPortalData;
}
