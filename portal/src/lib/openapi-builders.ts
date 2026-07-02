import type { OpenAPIEndpoint } from '@/types';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

function paramSchema(type: string) {
  const t = type.toLowerCase();
  if (t === 'integer') return { type: 'integer' };
  if (t === 'number') return { type: 'number' };
  if (t === 'boolean') return { type: 'boolean' };
  return { type: 'string' };
}

function buildOperation(
  method: string,
  ep: OpenAPIEndpoint,
): Record<string, unknown> {
  const op: Record<string, unknown> = {
    summary: ep.summary,
    operationId: `${method.toLowerCase()}${ep.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/json': {
            schema: { type: 'object' },
            ...(ep.responseExample ? { example: ep.responseExample } : {}),
          },
        },
      },
      '401': { description: 'Unauthorized' },
      '403': { description: 'Forbidden' },
      '500': { description: 'Internal Server Error' },
    },
  };

  const parameters: Record<string, unknown>[] = [];
  for (const p of ep.parameters ?? []) {
    parameters.push({
      name: p.name,
      in: p.in,
      required: p.required ?? p.in === 'path',
      schema: paramSchema(p.type),
    });
  }
  if (parameters.length > 0) op.parameters = parameters;

  if (ep.requestBody) {
    op.requestBody = {
      required: true,
      content: { 'application/json': { schema: { type: 'object' } } },
    };
  }

  return op;
}

export function buildOpenApiSpecFromApi(input: {
  name: string;
  slug: string;
  version: string;
  description: string;
  endpoints: OpenAPIEndpoint[];
}): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const ep of input.endpoints) {
    const method = ep.method.toLowerCase();
    if (!HTTP_METHODS.includes(method as (typeof HTTP_METHODS)[number])) continue;
    if (!paths[ep.path]) paths[ep.path] = {};
    paths[ep.path][method] = buildOperation(method, ep);
  }

  return {
    openapi: '3.0.3',
    info: {
      title: input.name,
      version: input.version,
      description: input.description,
    },
    servers: [{ url: 'https://api.internal' }],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  };
}
