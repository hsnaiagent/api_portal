import type { OnDemandSdkLanguage, PrecomputedSdkLanguage, SDKLanguage } from '@/types';
import { buildOpenApiSpecFromApi } from '@/lib/openapi-builders';
import type { OpenAPIEndpoint } from '@/types';

export interface PrecomputedSdkResult {
  curl: string;
  python: string;
  nodejs: string;
  model: string;
  source?: string;
}

export interface OnDemandSdkResult {
  code: string;
  model: string;
  source?: string;
}

const PRECOMPUTED_LANGS: PrecomputedSdkLanguage[] = ['curl', 'python', 'nodejs'];
const ON_DEMAND_LANGS: OnDemandSdkLanguage[] = ['javascript', 'typescript', 'java', 'go'];

export function isPrecomputedLanguage(lang: string): lang is PrecomputedSdkLanguage {
  return PRECOMPUTED_LANGS.includes(lang as PrecomputedSdkLanguage);
}

export function isOnDemandLanguage(lang: string): lang is OnDemandSdkLanguage {
  return ON_DEMAND_LANGS.includes(lang as OnDemandSdkLanguage);
}

function buildFallbackFromEndpoints(
  name: string,
  slug: string,
  description: string,
  version: string,
  endpoints: OpenAPIEndpoint[],
) {
  const spec = buildOpenApiSpecFromApi({ name, slug, version, description, endpoints });
  const listOp = endpoints.find((e) => e.method === 'GET' && !e.path.includes('{')) ?? endpoints[0];
  const getOp = endpoints.find((e) => e.method === 'GET' && e.path.includes('{'));
  const basePath = listOp?.path ?? `/v1/${slug}`;
  const idPath = getOp?.path ?? `${basePath}/{id}`;
  const listUrl = `https://api.internal${basePath}`;
  const getUrl = `https://api.internal${idPath.replace('{id}', 'RESOURCE_ID')}`;
  const clientClass = name.replace(/[^a-zA-Z0-9]/g, '') || 'ApiClient';

  const curl = `# ${name} — cURL examples
curl --fail-with-body --max-time 30 -X GET "${listUrl}?limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Accept: application/json"

curl --fail-with-body --max-time 30 -X GET "${getUrl}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Accept: application/json"`;

  const python = `"""${name} — lightweight Python SDK."""
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://api.internal"
TIMEOUT_SECONDS = 30


class ${clientClass}Error(Exception):
    pass


class ${clientClass}:
    def __init__(self, access_token: str) -> None:
        self._session = requests.Session()
        self._session.headers.update({
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        })
        retry = Retry(total=2, backoff_factor=0.5, status_forcelist=[502, 503, 504])
        adapter = HTTPAdapter(max_retries=retry)
        self._session.mount("https://", adapter)

    def _request(self, method: str, path: str, **kwargs) -> dict:
        response = self._session.request(
            method, f"{BASE_URL}{path}", timeout=TIMEOUT_SECONDS, **kwargs
        )
        response.raise_for_status()
        return response.json()

    def list_resources(self, limit: int = 10) -> dict:
        return self._request("GET", "${basePath}", params={"limit": limit})

    def get_by_id(self, resource_id: str) -> dict:
        path = "${idPath}".replace("{id}", resource_id)
        return self._request("GET", path)`;

  const nodejs = `/** ${name} — lightweight Node.js SDK */
const BASE_URL = 'https://api.internal';
const TIMEOUT_MS = 30_000;

class ${clientClass}Error extends Error {
  constructor(status, body) {
    super(\`HTTP \${status}: \${body}\`);
    this.status = status;
  }
}

class ${clientClass} {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async #request(method, path, options = {}) {
    const url = new URL(path, BASE_URL);
    if (options.searchParams) {
      for (const [k, v] of Object.entries(options.searchParams)) {
        url.searchParams.set(k, String(v));
      }
    }
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: \`Bearer \${this.accessToken}\`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await response.text();
    if (!response.ok) throw new ${clientClass}Error(response.status, text);
    return text ? JSON.parse(text) : {};
  }

  async listResources(limit = 10) {
    return this.#request('GET', '${basePath}', { searchParams: { limit } });
  }

  async getById(resourceId) {
    const path = '${idPath}'.replace('{id}', encodeURIComponent(resourceId));
    return this.#request('GET', path);
  }
}

export { ${clientClass}, ${clientClass}Error };`;

  return { curl, python, nodejs, spec };
}

export async function precomputeSdkArtifacts(
  openapiSpecContent: Record<string, unknown>,
  apiName: string,
): Promise<PrecomputedSdkResult> {
  try {
    const response = await fetch('/api/sdk/precompute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openapi_spec_content: openapiSpecContent, api_name: apiName }),
    });
    if (response.ok) {
      const data = (await response.json()) as PrecomputedSdkResult;
      if (data.curl && data.python && data.nodejs) return data;
    }
  } catch (err) {
    console.warn('[sdk-api] precompute failed, using fallback', err);
  }

  const endpoints = extractEndpointsFromSpec(openapiSpecContent);
  const slug = String(
    (openapiSpecContent.info as Record<string, unknown> | undefined)?.title ?? apiName,
  )
    .toLowerCase()
    .replace(/\s+/g, '-');
  const version = String(
    (openapiSpecContent.info as Record<string, unknown> | undefined)?.version ?? '1.0.0',
  );
  const description = String(
    (openapiSpecContent.info as Record<string, unknown> | undefined)?.description ?? apiName,
  );
  const fallback = buildFallbackFromEndpoints(apiName, slug, description, version, endpoints);
  return {
    curl: fallback.curl,
    python: fallback.python,
    nodejs: fallback.nodejs,
    model: 'fallback-template',
    source: 'fallback',
  };
}

export async function generateSdkForLanguage(
  openapiSpecContent: Record<string, unknown>,
  language: SDKLanguage,
  apiName: string,
): Promise<OnDemandSdkResult> {
  try {
    const response = await fetch('/api/sdk/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        openapi_spec_content: openapiSpecContent,
        language,
        api_name: apiName,
      }),
    });
    if (response.ok) {
      const data = (await response.json()) as OnDemandSdkResult;
      if (data.code) return data;
    }
  } catch (err) {
    console.warn('[sdk-api] generate failed, using fallback', err);
  }

  const endpoints = extractEndpointsFromSpec(openapiSpecContent);
  const slug = apiName.toLowerCase().replace(/\s+/g, '-');
  const fallback = buildFallbackFromEndpoints(apiName, slug, apiName, '1.0.0', endpoints);

  const allMap: Record<SDKLanguage, string> = {
    curl: fallback.curl,
    python: fallback.python,
    nodejs: fallback.nodejs,
    javascript: fallback.nodejs,
    typescript: fallback.nodejs,
    java: buildJavaFallback(apiName, endpoints),
    go: buildGoFallback(apiName, endpoints),
  };

  return {
    code: allMap[language],
    model: 'fallback-template',
    source: 'fallback',
  };
}

export async function generateOnDemandSdk(
  openapiSpecContent: Record<string, unknown>,
  language: OnDemandSdkLanguage,
  apiName: string,
): Promise<OnDemandSdkResult> {
  return generateSdkForLanguage(openapiSpecContent, language, apiName);
}

function extractEndpointsFromSpec(spec: Record<string, unknown>): OpenAPIEndpoint[] {
  const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;
  if (!paths) return [];
  const endpoints: OpenAPIEndpoint[] = [];
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
      const operation = op as Record<string, unknown>;
      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: String(operation.summary ?? `${method.toUpperCase()} ${path}`),
      });
    }
  }
  return endpoints;
}

function buildJavaFallback(name: string, endpoints: OpenAPIEndpoint[]): string {
  const listOp = endpoints.find((e) => e.method === 'GET' && !e.path.includes('{')) ?? endpoints[0];
  const basePath = listOp?.path ?? '/v1/resource';
  const cls = name.replace(/[^a-zA-Z0-9]/g, '') || 'ApiClient';
  return `// ${name} — Java HttpClient
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class ${cls} {
    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(30)).build();
    private final String token;

    public ${cls}(String accessToken) { this.token = accessToken; }

    public String listResources() throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create("https://api.internal${basePath}?limit=10"))
            .timeout(Duration.ofSeconds(30))
            .header("Authorization", "Bearer " + token)
            .GET().build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 400) throw new RuntimeException(resp.body());
        return resp.body();
    }
}`;
}

function buildGoFallback(name: string, endpoints: OpenAPIEndpoint[]): string {
  const listOp = endpoints.find((e) => e.method === 'GET' && !e.path.includes('{')) ?? endpoints[0];
  const basePath = listOp?.path ?? '/v1/resource';
  return `// ${name} — Go example
package main

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "time"
)

func listResources(ctx context.Context, token string) ([]byte, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET", "https://api.internal${basePath}?limit=10", nil)
    req.Header.Set("Authorization", "Bearer "+token)
    client := &http.Client{Timeout: 30 * time.Second}
    resp, err := client.Do(req)
    if err != nil { return nil, err }
    defer resp.Body.Close()
    body, _ := io.ReadAll(resp.Body)
    if resp.StatusCode >= 400 { return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, body) }
    return body, nil
}`;
}

/** Build curated snippets for seed APIs from their metadata. */
export function buildSeedSdkSnippets(
  apiId: string,
  name: string,
  slug: string,
  description: string,
  endpoints: OpenAPIEndpoint[],
): { curl: string; python: string; nodejs: string } {
  const { curl, python, nodejs } = buildFallbackFromEndpoints(
    name,
    slug,
    description,
    '1.0.0',
    endpoints,
  );
  void apiId;
  return { curl, python, nodejs };
}
