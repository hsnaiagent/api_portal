import { precomputeSdkArtifacts, generateOnDemandSdk } from '../../server/sdk-routes.mjs';

export async function handler(event) {
  const path = event.path.replace(/^\/\.netlify\/functions\/sdk\/?/, '');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    if (path === 'precompute' || event.path.endsWith('/precompute')) {
      const spec = body.openapi_spec_content;
      const apiName = body.api_name ?? 'API';
      if (!spec || typeof spec !== 'object') {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'openapi_spec_content is required' }),
        };
      }
      const artifacts = await precomputeSdkArtifacts(spec, apiName);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artifacts),
      };
    }

    if (path === 'generate' || event.path.endsWith('/generate')) {
      const spec = body.openapi_spec_content;
      const language = body.language;
      const apiName = body.api_name ?? 'API';
      if (!spec || typeof spec !== 'object') {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'openapi_spec_content is required' }),
        };
      }
      if (!language) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'language is required' }),
        };
      }
      const result = await generateOnDemandSdk(spec, language, apiName);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      };
    }

    return { statusCode: 404, body: 'Not Found' };
  } catch (err) {
    console.error('[sdk] netlify function failed:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'sdk_function_failed' }),
    };
  }
}
