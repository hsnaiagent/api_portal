import { generateGeminiContent } from './gemini-proxy.mjs';
import { buildPrecomputeSdkPrompt, buildSingleLanguageSdkPrompt } from './sdk-prompts.mjs';
import { buildFallbackOnDemandSnippet, buildFallbackSnippets } from './sdk-fallback.mjs';

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function precomputeSdkArtifacts(openapiSpecContent, apiName, env = process.env) {
  const prompt = buildPrecomputeSdkPrompt(openapiSpecContent, apiName);
  const result = await generateGeminiContent({ prompt, jsonMode: true }, env);

  if (result.ok && result.text) {
    const parsed = parseJson(result.text);
    if (parsed?.curl && parsed?.python && parsed?.nodejs) {
      return {
        curl: String(parsed.curl),
        python: String(parsed.python),
        nodejs: String(parsed.nodejs),
        model: result.model ?? 'gemini',
        source: 'gemini',
      };
    }
  }

  const fallback = buildFallbackSnippets(openapiSpecContent, apiName);
  return {
    ...fallback,
    model: 'fallback-template',
    source: 'fallback',
  };
}

export async function generateOnDemandSdk(openapiSpecContent, language, apiName, env = process.env) {
  const prompt = buildSingleLanguageSdkPrompt(openapiSpecContent, language, apiName);
  const result = await generateGeminiContent({ prompt, jsonMode: true }, env);

  if (result.ok && result.text) {
    const parsed = parseJson(result.text);
    if (parsed?.code) {
      return {
        code: String(parsed.code),
        model: result.model ?? 'gemini',
        source: 'gemini',
      };
    }
  }

  return {
    code: buildFallbackOnDemandSnippet(openapiSpecContent, language, apiName),
    model: 'fallback-template',
    source: 'fallback',
  };
}

export function registerSdkRoutes(app) {
  app.post('/api/sdk/precompute', async (req, res) => {
    const body = req.body ?? {};
    const spec = body.openapi_spec_content;
    const apiName = body.api_name ?? 'API';

    if (!spec || typeof spec !== 'object') {
      res.status(400).json({ error: 'openapi_spec_content is required' });
      return;
    }

    try {
      const artifacts = await precomputeSdkArtifacts(spec, apiName);
      res.json(artifacts);
    } catch (err) {
      console.error('[sdk] precompute failed:', err);
      res.status(500).json({ error: 'SDK precompute failed' });
    }
  });

  app.post('/api/sdk/generate', async (req, res) => {
    const body = req.body ?? {};
    const spec = body.openapi_spec_content;
    const language = body.language;
    const apiName = body.api_name ?? 'API';

    if (!spec || typeof spec !== 'object') {
      res.status(400).json({ error: 'openapi_spec_content is required' });
      return;
    }
    if (!language || typeof language !== 'string') {
      res.status(400).json({ error: 'language is required' });
      return;
    }

    try {
      const result = await generateOnDemandSdk(spec, language, apiName);
      res.json(result);
    } catch (err) {
      console.error('[sdk] generate failed:', err);
      res.status(500).json({ error: 'SDK generation failed' });
    }
  });
}
