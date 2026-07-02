import type { OpenAPIEndpoint } from '@/types';

export interface ParsedSpec {
  version?: string;
  title?: string;
  endpoints: OpenAPIEndpoint[];
  content: Record<string, unknown>;
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

export interface OpenApiValidationResult {
  valid: boolean;
  errors: string[];
}

function extractResponseExample(op: Record<string, unknown>): object | undefined {
  const responses = op.responses as Record<string, unknown> | undefined;
  if (!responses) return undefined;
  const success =
    (responses['200'] as Record<string, unknown>) ??
    (responses['201'] as Record<string, unknown>) ??
    (responses.default as Record<string, unknown>);
  if (!success) return undefined;
  const content = success.content as Record<string, unknown> | undefined;
  const json = content?.['application/json'] as Record<string, unknown> | undefined;
  const example = json?.example ?? (json?.schema as Record<string, unknown> | undefined)?.example;
  return example && typeof example === 'object' ? (example as object) : undefined;
}

export function validateOpenApiSpec(doc: Record<string, unknown>): OpenApiValidationResult {
  const errors: string[] = [];

  const hasOpenApi = typeof doc.openapi === 'string' && doc.openapi.length > 0;
  const hasSwagger = typeof doc.swagger === 'string' && doc.swagger.length > 0;
  if (!hasOpenApi && !hasSwagger) {
    errors.push('Spec must include an "openapi" or "swagger" version field.');
  }

  const paths = doc.paths as Record<string, unknown> | undefined;
  if (!paths || typeof paths !== 'object' || Object.keys(paths).length === 0) {
    errors.push('Spec must define at least one path in "paths".');
    return { valid: false, errors };
  }

  let operationCount = 0;
  for (const opsRaw of Object.values(paths)) {
    const ops = opsRaw as Record<string, unknown> | null;
    if (!ops || typeof ops !== 'object') continue;
    for (const method of HTTP_METHODS) {
      if (ops[method]) operationCount += 1;
    }
  }

  if (operationCount === 0) {
    errors.push('Spec must define at least one HTTP operation under "paths".');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Parse raw OpenAPI JSON text into the full document plus portal endpoint shape.
 * Returns null if the text is not valid JSON.
 */
export function parseOpenApiSpecContent(raw: string): ParsedSpec | null {
  if (!raw.trim()) return null;
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!doc || typeof doc !== 'object') return null;

  const validation = validateOpenApiSpec(doc);
  if (!validation.valid) return null;

  const endpoints: OpenAPIEndpoint[] = [];
  const paths = doc.paths as Record<string, unknown> | undefined;
  if (paths && typeof paths === 'object') {
    for (const [path, opsRaw] of Object.entries(paths)) {
      const ops = opsRaw as Record<string, unknown> | null;
      if (!ops || typeof ops !== 'object') continue;
      for (const method of HTTP_METHODS) {
        const op = ops[method] as Record<string, unknown> | undefined;
        if (!op || typeof op !== 'object') continue;
        const params = Array.isArray(op.parameters)
          ? (op.parameters as Record<string, unknown>[]).map((p) => ({
              name: String(p.name ?? ''),
              in: String(p.in ?? 'query'),
              required: Boolean(p.required),
              type: String(
                (p.schema as Record<string, unknown> | undefined)?.type ?? p.type ?? 'string',
              ),
            }))
          : undefined;
        endpoints.push({
          method: method.toUpperCase(),
          path,
          summary: String(op.summary ?? op.description ?? `${method.toUpperCase()} ${path}`),
          parameters: params,
          responseExample: extractResponseExample(op),
        });
      }
    }
  }

  const info = doc.info as Record<string, unknown> | undefined;
  return {
    version: info?.version ? String(info.version) : undefined,
    title: info?.title ? String(info.title) : undefined,
    endpoints,
    content: doc,
  };
}

/**
 * Parse an OpenAPI document (JSON) into the portal's endpoint shape. Returns null
 * if the text is not valid JSON (e.g. YAML) so callers can fall back gracefully.
 */
export function parseOpenApiSpec(raw: string): ParsedSpec | null {
  return parseOpenApiSpecContent(raw);
}

/** Lightweight validation for the spec textarea. JSON is fully validated; non-JSON (YAML) is allowed but flagged. */
export function describeSpec(raw: string): {
  ok: boolean;
  note?: string;
  endpointCount: number;
  version?: string;
  errors?: string[];
} {
  if (!raw.trim())
    return { ok: false, note: 'Paste an OpenAPI spec to continue.', endpointCount: 0 };

  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {
      ok: false,
      note: 'OpenAPI spec must be valid JSON. YAML is not supported in this version.',
      endpointCount: 0,
    };
  }

  const validation = validateOpenApiSpec(doc);
  if (!validation.valid) {
    return {
      ok: false,
      note: validation.errors.join(' '),
      endpointCount: 0,
      errors: validation.errors,
    };
  }

  const parsed = parseOpenApiSpecContent(raw);
  if (!parsed) {
    return { ok: false, note: 'Could not parse OpenAPI spec.', endpointCount: 0 };
  }

  return {
    ok: true,
    note:
      parsed.endpoints.length > 0
        ? `Parsed ${parsed.endpoints.length} endpoint${parsed.endpoints.length === 1 ? '' : 's'}.`
        : 'No paths found in spec.',
    endpointCount: parsed.endpoints.length,
    version: parsed.version,
  };
}
