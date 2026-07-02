const STRICT_RULES = `STRICT RULES:
- Translate ONLY what is defined in the OpenAPI schema. Do NOT invent endpoints, fields, or business logic.
- Include production boilerplate: Bearer auth header, explicit timeouts, HTTP error handling.
- Use base URL https://api.internal and credential placeholder YOUR_TOKEN.
- Do not add endpoints or parameters not present in the schema.`;

export function buildSingleLanguageSdkPrompt(
  spec: Record<string, unknown>,
  language: string,
  apiName: string,
): string {
  return `You are an enterprise API SDK code generator. Generate a ${language} code snippet/client for this API.

API name: ${JSON.stringify(apiName)}

OpenAPI schema (sole source of truth):
${JSON.stringify(spec, null, 2)}

${STRICT_RULES}

Language-specific requirements:
${languageRequirements(language)}

Return JSON only: { "code": "complete code snippet as a string with \\n for newlines" }`;
}

export function buildPrecomputeSdkPrompt(
  spec: Record<string, unknown>,
  apiName: string,
): string {
  return `You are an enterprise API SDK code generator. Generate three code artifacts from this OpenAPI schema.

API name: ${JSON.stringify(apiName)}

OpenAPI schema (sole source of truth):
${JSON.stringify(spec, null, 2)}

${STRICT_RULES}

Generate:
1. curl — cURL commands for each operation with -H headers, --max-time 30, --fail-with-body
2. python — lightweight SDK using requests.Session, timeout=30, raise_for_status(), auth helper
3. nodejs — lightweight async SDK using fetch with AbortSignal.timeout(30000), try/catch for HTTP errors

Return JSON only:
{
  "curl": "string",
  "python": "string",
  "nodejs": "string"
}`;
}

function languageRequirements(language: string): string {
  switch (language) {
    case 'curl':
      return '- cURL with -H Authorization Bearer YOUR_TOKEN, --max-time 30, --fail-with-body';
    case 'python':
      return '- Python with requests.Session, timeout=30, raise_for_status(), Bearer auth';
    case 'nodejs':
      return '- Node.js with async/await, fetch, AbortSignal.timeout(30000), try/catch';
    case 'javascript':
    case 'typescript':
      return '- Modern fetch with async/await, AbortSignal.timeout, typed where applicable';
    case 'java':
      return '- Java 11+ HttpClient with timeout, Bearer auth header';
    case 'go':
      return '- Go net/http with context timeout, Bearer auth header';
    default:
      return '- Production-grade HTTP client with auth and error handling';
  }
}
