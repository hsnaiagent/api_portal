const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const;

const ROUTING_BLOCKLIST = [
  'example.com',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '10.',
  '192.168.',
  '172.16.',
] as const;

export interface RegistrationFields {
  name: string;
  description: string;
  version: string;
  backendUrl: string;
  gatewayPathPrefix: string;
}

export type ReadinessStatus = 'pass' | 'fail' | 'warning' | 'pending';

export interface ReadinessCheckItem {
  id: string;
  label: string;
  status: ReadinessStatus;
  message?: string;
  hardBlocker: boolean;
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractServerUrl(doc: Record<string, unknown>): string {
  const servers = doc.servers as unknown[] | undefined;
  if (!Array.isArray(servers) || servers.length === 0) return '';
  const first = servers[0] as Record<string, unknown> | undefined;
  return first?.url ? String(first.url).trim() : '';
}

export function extractCommonPathPrefix(doc: Record<string, unknown>): string {
  const paths = doc.paths as Record<string, unknown> | undefined;
  if (!paths || typeof paths !== 'object') return '';

  const pathKeys = Object.keys(paths).filter((p) => p.startsWith('/'));
  if (pathKeys.length === 0) return '';

  if (pathKeys.length === 1) {
    const single = pathKeys[0];
    const lastSlash = single.lastIndexOf('/');
    return lastSlash > 0 ? single.slice(0, lastSlash) || single : single;
  }

  const segments = pathKeys.map((p) => p.split('/').filter(Boolean));
  const common: string[] = [];

  for (let i = 0; i < segments[0].length; i++) {
    const seg = segments[0][i];
    if (segments.every((s) => s[i] === seg)) {
      common.push(seg);
    } else {
      break;
    }
  }

  return common.length > 0 ? `/${common.join('/')}` : pathKeys[0];
}

export function extractRegistrationFields(doc: Record<string, unknown>): RegistrationFields {
  const info = doc.info as Record<string, unknown> | undefined;
  const name = info?.title ? String(info.title).trim() : '';
  const description = info?.description ? String(info.description).trim() : '';
  const version = info?.version ? String(info.version).trim() : '1.0.0';
  const backendUrl = extractServerUrl(doc);
  let gatewayPathPrefix = extractCommonPathPrefix(doc);

  if (!gatewayPathPrefix && name) {
    gatewayPathPrefix = `/v1/${slugifyName(name)}`;
  }

  return {
    name,
    description,
    version,
    backendUrl,
    gatewayPathPrefix,
  };
}

export function checkHttpsEnforced(targetUrl: string): ReadinessCheckItem {
  const trimmed = targetUrl.trim();
  if (!trimmed) {
    return {
      id: 'https',
      label: 'HTTPS Enforced',
      status: 'fail',
      message: 'Target URL is required.',
      hardBlocker: true,
    };
  }
  const pass = trimmed.toLowerCase().startsWith('https://');
  return {
    id: 'https',
    label: 'HTTPS Enforced',
    status: pass ? 'pass' : 'fail',
    message: pass ? undefined : 'Target URL must start with https://.',
    hardBlocker: true,
  };
}

export function checkValidRoutingTarget(targetUrl: string): ReadinessCheckItem {
  const trimmed = targetUrl.trim().toLowerCase();
  if (!trimmed) {
    return {
      id: 'routing',
      label: 'Valid Routing Target',
      status: 'fail',
      message: 'Target URL is required.',
      hardBlocker: true,
    };
  }

  const blocked = ROUTING_BLOCKLIST.find((token) => trimmed.includes(token));
  return {
    id: 'routing',
    label: 'Valid Routing Target',
    status: blocked ? 'fail' : 'pass',
    message: blocked
      ? 'Target URL cannot use placeholder or private network addresses.'
      : undefined,
    hardBlocker: true,
  };
}

export function checkLinting(doc: Record<string, unknown> | null): ReadinessCheckItem {
  if (!doc) {
    return {
      id: 'linting',
      label: 'Linting',
      status: 'warning',
      message: 'No OpenAPI spec available for lint checks.',
      hardBlocker: false,
    };
  }

  const info = doc.info as Record<string, unknown> | undefined;
  const hasDescription =
    typeof info?.description === 'string' && info.description.trim().length > 0;

  let has401And500 = false;
  const paths = doc.paths as Record<string, unknown> | undefined;
  if (paths && typeof paths === 'object') {
    for (const opsRaw of Object.values(paths)) {
      const ops = opsRaw as Record<string, unknown> | null;
      if (!ops || typeof ops !== 'object') continue;
      for (const method of HTTP_METHODS) {
        const op = ops[method] as Record<string, unknown> | undefined;
        if (!op || typeof op !== 'object') continue;
        const responses = op.responses as Record<string, unknown> | undefined;
        if (responses?.['401'] && responses?.['500']) {
          has401And500 = true;
          break;
        }
      }
      if (has401And500) break;
    }
  }

  const pass = hasDescription && has401And500;
  const messages: string[] = [];
  if (!hasDescription) messages.push('Missing global description in info.');
  if (!has401And500) messages.push('Operations should document 401 and 500 responses.');

  return {
    id: 'linting',
    label: 'Linting',
    status: pass ? 'pass' : 'warning',
    message: pass ? undefined : messages.join(' '),
    hardBlocker: false,
  };
}

export function buildBasepathCheckItem(
  basepath: string,
  available: boolean | null,
  conflictingApiId?: string,
): ReadinessCheckItem {
  const trimmed = basepath.trim();
  if (!trimmed) {
    return {
      id: 'basepath',
      label: 'Basepath Availability',
      status: 'fail',
      message: 'Basepath is required.',
      hardBlocker: true,
    };
  }

  if (!trimmed.startsWith('/')) {
    return {
      id: 'basepath',
      label: 'Basepath Availability',
      status: 'fail',
      message: 'Basepath must start with /.',
      hardBlocker: true,
    };
  }

  if (available === null) {
    return {
      id: 'basepath',
      label: 'Basepath Availability',
      status: 'pending',
      message: 'Checking availability…',
      hardBlocker: true,
    };
  }

  return {
    id: 'basepath',
    label: 'Basepath Availability',
    status: available ? 'pass' : 'fail',
    message: available
      ? undefined
      : conflictingApiId
        ? `Basepath is already registered (${conflictingApiId}).`
        : 'Basepath is already registered by another API.',
    hardBlocker: true,
  };
}

export function hasHardBlockerFailure(checks: ReadinessCheckItem[]): boolean {
  return checks.some((c) => c.hardBlocker && (c.status === 'fail' || c.status === 'pending'));
}

export function patchSpecContent(
  content: Record<string, unknown>,
  fields: {
    name: string;
    description: string;
    version: string;
    backendUrl: string;
  },
): Record<string, unknown> {
  const patched = JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
  const info = (patched.info as Record<string, unknown> | undefined) ?? {};
  patched.info = {
    ...info,
    title: fields.name,
    description: fields.description,
    version: fields.version,
  };

  const servers = patched.servers as unknown[] | undefined;
  if (Array.isArray(servers) && servers.length > 0) {
    const first = servers[0] as Record<string, unknown>;
    patched.servers = [{ ...first, url: fields.backendUrl }, ...servers.slice(1)];
  } else {
    patched.servers = [{ url: fields.backendUrl }];
  }

  return patched;
}

export function getApiBasepathFromRecord(api: {
  gateway_path_prefix?: string;
  endpoints?: { path: string }[];
}): string | null {
  if (api.gateway_path_prefix?.trim()) return api.gateway_path_prefix.trim();

  const paths = api.endpoints?.map((e) => e.path).filter(Boolean) ?? [];
  if (paths.length === 0) return null;

  if (paths.length === 1) {
    const single = paths[0];
    const lastSlash = single.lastIndexOf('/');
    return lastSlash > 0 ? single.slice(0, lastSlash) || single : single;
  }

  const segments = paths.map((p) => p.split('/').filter(Boolean));
  const common: string[] = [];
  for (let i = 0; i < segments[0].length; i++) {
    const seg = segments[0][i];
    if (segments.every((s) => s[i] === seg)) {
      common.push(seg);
    } else {
      break;
    }
  }
  return common.length > 0 ? `/${common.join('/')}` : paths[0];
}
