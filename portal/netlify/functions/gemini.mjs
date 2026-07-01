import {
  generateGeminiContent,
  isGeminiApiKeyConfigured,
} from '../../server/gemini-proxy.mjs';

export async function handler(event) {
  const path = event.path.replace(/^\/\.netlify\/functions\/gemini\/?/, '');

  if (event.httpMethod === 'GET' && (path === '' || path === 'status' || event.path.endsWith('/status'))) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        configured: isGeminiApiKeyConfigured(),
        mode: 'netlify-function',
      }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const result = await generateGeminiContent({
      prompt: body.prompt,
      jsonMode: body.jsonMode !== false,
      model: body.model,
    });

    if (!result.ok) {
      return {
        statusCode: result.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: result.error, model: result.model ?? null }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: result.text, model: result.model }),
    };
  } catch (err) {
    console.error('[gemini] netlify function failed:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'gemini_proxy_failed' }),
    };
  }
}
