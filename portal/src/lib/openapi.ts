import type { OpenAPIEndpoint } from '@/types';

export interface ParsedSpec {
  version?: string;
  title?: string;
  endpoints: OpenAPIEndpoint[];
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

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

/**
 * Parse an OpenAPI document (JSON) into the portal's endpoint shape. Returns null
 * if the text is not valid JSON (e.g. YAML) so callers can fall back gracefully.
 * No external parser dependency is added — JSON only by design.
 */
export function parseOpenApiSpec(raw: string): ParsedSpec | null {
  if (!raw.trim()) return null;
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!doc || typeof doc !== 'object') return null;

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
  };
}

/** Lightweight validation for the spec textarea. JSON is fully validated; non-JSON (YAML) is allowed but flagged. */
export function describeSpec(raw: string): { ok: boolean; note?: string; endpointCount: number; version?: string } {
  if (!raw.trim()) return { ok: false, note: 'Paste an OpenAPI spec to continue.', endpointCount: 0 };
  const parsed = parseOpenApiSpec(raw);
  if (!parsed) {
    return {
      ok: true,
      note: 'Spec could not be parsed as JSON — AI analysis will still run, but endpoints will not be auto-extracted.',
      endpointCount: 0,
    };
  }
  return {
    ok: true,
    note:
      parsed.endpoints.length > 0
        ? `Parsed ${parsed.endpoints.length} endpoint${parsed.endpoints.length === 1 ? '' : 's'}.`
        : 'No paths found in spec; a default endpoint will be used.',
    endpointCount: parsed.endpoints.length,
    version: parsed.version,
  };
}
