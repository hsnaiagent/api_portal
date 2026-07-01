import {
  generateGeminiContent,
  getGeminiApiKey,
  isGeminiApiKeyConfigured,
} from './gemini-proxy.mjs';

export function registerGeminiRoutes(app) {
  app.get('/api/gemini/status', (_req, res) => {
    res.json({
      configured: isGeminiApiKeyConfigured(),
      mode: 'server-proxy',
    });
  });

  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const body = req.body ?? {};
      const result = await generateGeminiContent({
        prompt: body.prompt,
        jsonMode: body.jsonMode !== false,
        model: body.model,
      });

      if (!result.ok) {
        res.status(result.status).json({
          error: result.error,
          model: result.model ?? null,
        });
        return;
      }

      res.json({ text: result.text, model: result.model });
    } catch (err) {
      console.error('[gemini] proxy failed:', err);
      res.status(500).json({ error: 'gemini_proxy_failed' });
    }
  });
}

export function createGeminiDevMiddleware(env) {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0];

    if (url === '/api/gemini/status') {
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          configured: Boolean(getGeminiApiKey(env)),
          mode: 'vite-dev-proxy',
        }),
      );
      return;
    }

    if (url !== '/api/gemini/generate' || req.method !== 'POST') {
      next();
      return;
    }

    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      const result = await generateGeminiContent(
        {
          prompt: body.prompt,
          jsonMode: body.jsonMode !== false,
          model: body.model,
        },
        env,
      );

      res.setHeader('Content-Type', 'application/json');
      if (!result.ok) {
        res.statusCode = result.status;
        res.end(JSON.stringify({ error: result.error, model: result.model ?? null }));
        return;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ text: result.text, model: result.model }));
    } catch (err) {
      console.error('[gemini] vite dev proxy failed:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'gemini_proxy_failed' }));
    }
  };
}
