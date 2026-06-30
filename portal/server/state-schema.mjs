// Runtime shape definition for the persisted portal state.
// Mirrored on the client in src/store/schema.ts — keep both in sync.

export const COLLECTION_ID_FIELDS = {
  apis: 'api_id',
  subscriptions: 'subscription_id',
  applications: 'application_id',
  workflows: 'workflow_instance_id',
  credentials: 'credential_id',
  auditLogs: 'audit_id',
  providerAccessRequests: 'request_id',
  llmSubscriptionRequests: 'llm_request_id',
};

export const COLLECTION_KEYS = Object.keys(COLLECTION_ID_FIELDS);

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Coerce arbitrary parsed JSON into a complete PersistedPortalData object.
 * Missing/invalid collections default to []; non-object items are dropped.
 */
export function normalizeData(data) {
  const result = {};
  const source = isPlainObject(data) ? data : {};
  for (const key of COLLECTION_KEYS) {
    const idField = COLLECTION_ID_FIELDS[key];
    const value = source[key];
    result[key] = Array.isArray(value)
      ? value.filter((item) => isPlainObject(item) && typeof item[idField] === 'string' && item[idField].length > 0)
      : [];
  }
  return result;
}

/**
 * Validate that `data` is a usable PersistedPortalData payload.
 * Returns { valid, errors }. Used by the server to reject bad PUTs (400).
 */
export function validateData(data) {
  const errors = [];
  if (!isPlainObject(data)) {
    return { valid: false, errors: ['data must be an object'] };
  }
  for (const key of COLLECTION_KEYS) {
    const idField = COLLECTION_ID_FIELDS[key];
    const value = data[key];
    if (value === undefined) continue; // missing collection is tolerated (defaults to [])
    if (!Array.isArray(value)) {
      errors.push(`${key} must be an array`);
      continue;
    }
    value.forEach((item, i) => {
      if (!isPlainObject(item)) {
        errors.push(`${key}[${i}] must be an object`);
      } else if (typeof item[idField] !== 'string' || item[idField].length === 0) {
        errors.push(`${key}[${i}] is missing required "${idField}"`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

export function emptyEnvelope() {
  return { _revision: 0, _updatedAt: null, _seedVersion: 0, data: null };
}
