function commonPathPrefix(paths) {
  if (paths.length === 0) return null;
  if (paths.length === 1) {
    const single = paths[0];
    const lastSlash = single.lastIndexOf('/');
    return lastSlash > 0 ? single.slice(0, lastSlash) || single : single;
  }

  const segments = paths.map((p) => p.split('/').filter(Boolean));
  const common = [];
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

function getApiBasepath(api) {
  if (typeof api.gateway_path_prefix === 'string' && api.gateway_path_prefix.trim()) {
    return api.gateway_path_prefix.trim();
  }

  const paths = Array.isArray(api.endpoints)
    ? api.endpoints.map((e) => e?.path).filter((p) => typeof p === 'string' && p.startsWith('/'))
    : [];

  if (paths.length > 0) return commonPathPrefix(paths);

  const spec = api.openapi_spec_content;
  if (spec && typeof spec === 'object' && spec.paths && typeof spec.paths === 'object') {
    const specPaths = Object.keys(spec.paths).filter((p) => p.startsWith('/'));
    if (specPaths.length > 0) return commonPathPrefix(specPaths);
  }

  return null;
}

function normalizePrefix(prefix) {
  if (typeof prefix !== 'string') return '';
  const trimmed = prefix.trim();
  if (!trimmed.startsWith('/')) return '';
  return trimmed.replace(/\/+$/, '') || trimmed;
}

function prefixesConflict(requested, existing) {
  const a = normalizePrefix(requested);
  const b = normalizePrefix(existing);
  if (!a || !b) return false;
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

export function registerBasepathRoutes(app, readEnvelope) {
  app.get('/api/basepath/availability', async (req, res) => {
    const prefix = normalizePrefix(req.query.prefix);
    const excludeApiId = typeof req.query.excludeApiId === 'string' ? req.query.excludeApiId : '';

    if (!prefix) {
      res.status(400).json({ error: 'prefix query parameter is required' });
      return;
    }

    try {
      const envelope = await readEnvelope();
      const apis = envelope?.data?.apis ?? [];

      for (const api of apis) {
        if (!api || typeof api !== 'object') continue;
        if (excludeApiId && api.api_id === excludeApiId) continue;

        const existing = getApiBasepath(api);
        if (existing && prefixesConflict(prefix, existing)) {
          res.json({ available: false, conflictingApiId: api.api_id });
          return;
        }
      }

      res.json({ available: true });
    } catch (err) {
      console.error('[basepath] availability check failed:', err);
      res.status(500).json({ error: 'Failed to check basepath availability' });
    }
  });
}
