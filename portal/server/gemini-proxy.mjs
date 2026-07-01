const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

export function getGeminiApiKey(env = process.env) {
  const raw = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  return raw.trim().replace(/^['"]|['"]$/g, '');
}

export function isGeminiApiKeyConfigured(env = process.env) {
  return Boolean(getGeminiApiKey(env));
}

export async function generateGeminiContent({ prompt, jsonMode = true, model }, env = process.env) {
  const apiKey = getGeminiApiKey(env);
  if (!apiKey) {
    return { ok: false, status: 503, error: 'missing_api_key', text: null };
  }

  const models = model ? [model, ...MODEL_CANDIDATES.filter((m) => m !== model)] : MODEL_CANDIDATES;
  let lastError = 'unknown_error';

  for (const candidate of models) {
    const url = `${GEMINI_BASE}/models/${candidate}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
      }),
    });

    if (!response.ok) {
      lastError = await response.text();
      if (response.status === 404) continue;
      return { ok: false, status: response.status, error: lastError, text: null, model: candidate };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (!text) {
      lastError = 'empty_response';
      continue;
    }

    return { ok: true, status: 200, text, model: candidate, error: null };
  }

  return { ok: false, status: 502, error: lastError, text: null };
}
