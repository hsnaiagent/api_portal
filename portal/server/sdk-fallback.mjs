const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function extractPaths(spec) {
  const paths = spec?.paths ?? {};
  const ops = [];
  for (const [path, methods] of Object.entries(paths)) {
    if (!methods || typeof methods !== 'object') continue;
    for (const method of HTTP_METHODS) {
      if (methods[method]) {
        ops.push({ method: method.toUpperCase(), path });
      }
    }
  }
  return ops;
}

export function buildFallbackSnippets(spec, apiName = 'API') {
  const ops = extractPaths(spec);
  const listOp = ops.find((o) => o.method === 'GET' && !o.path.includes('{')) ?? ops[0];
  const getByIdOp =
    ops.find((o) => o.method === 'GET' && o.path.includes('{')) ??
    ops.find((o) => o.path.includes('{'));

  const basePath = listOp?.path ?? '/v1/resource';
  const idPath = getByIdOp?.path ?? `${basePath}/{id}`;
  const listUrl = `https://api.internal${basePath}`;
  const getUrl = `https://api.internal${idPath.replace('{id}', 'RESOURCE_ID')}`;

  const safeName = apiName.replace(/[^a-zA-Z0-9]/g, '');
  const clientClass = safeName || 'ApiClient';

  const curl = `# ${apiName} — cURL examples
# List resources
curl --fail-with-body --max-time 30 -X GET "${listUrl}?limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Accept: application/json"

# Get by ID
curl --fail-with-body --max-time 30 -X GET "${getUrl}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Accept: application/json"`;

  const python = `"""${apiName} — lightweight Python SDK."""
from __future__ import annotations

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://api.internal"
TIMEOUT_SECONDS = 30


class ${clientClass}Error(Exception):
    """Raised when the API returns a non-success HTTP status."""


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
        url = f"{BASE_URL}{path}"
        response = self._session.request(method, url, timeout=TIMEOUT_SECONDS, **kwargs)
        try:
            response.raise_for_status()
        except requests.HTTPError as exc:
            raise ${clientClass}Error(f"{response.status_code}: {response.text}") from exc
        return response.json()

    def list_resources(self, limit: int = 10) -> dict:
        return self._request("GET", "${basePath}", params={"limit": limit})

    def get_by_id(self, resource_id: str) -> dict:
        return self._request("GET", "${idPath.replace('{id}', '{resource_id}')}".format(resource_id=resource_id))


if __name__ == "__main__":
    client = ${clientClass}(access_token="YOUR_TOKEN")
    print(client.list_resources())
    print(client.get_by_id("1"))`;

  const nodejs = `/**
 * ${apiName} — lightweight Node.js SDK
 */
const BASE_URL = 'https://api.internal';
const TIMEOUT_MS = 30_000;

class ${clientClass}Error extends Error {
  constructor(status, body) {
    super(\`HTTP \${status}: \${body}\`);
    this.status = status;
  }
}

class ${clientClass} {
  /** @param {string} accessToken Bearer token */
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
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new ${clientClass}Error(response.status, text);
    }
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

export { ${clientClass}, ${clientClass}Error };

// Usage:
// const client = new ${clientClass}('YOUR_TOKEN');
// const items = await client.listResources();
// const item = await client.getById('1');`;

  return { curl, python, nodejs };
}

export function buildFallbackOnDemandSnippet(spec, language, apiName = 'API') {
  const { curl, python, nodejs } = buildFallbackSnippets(spec, apiName);
  const map = {
    curl,
    python,
    nodejs,
    javascript: nodejs.replace('export {', '// CommonJS: module.exports = {').replace('};', '};'),
    typescript: nodejs,
    java: buildJavaFallback(spec, apiName),
    go: buildGoFallback(spec, apiName),
  };
  return map[language] ?? curl;
}

function buildJavaFallback(spec, apiName) {
  const ops = extractPaths(spec);
  const listOp = ops.find((o) => o.method === 'GET' && !o.path.includes('{')) ?? ops[0];
  const basePath = listOp?.path ?? '/v1/resource';
  return `// ${apiName} — Java HttpClient example
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class ${apiName.replace(/[^a-zA-Z0-9]/g, '')}Client {
    private static final String BASE = "https://api.internal";
    private final HttpClient client;
    private final String token;

    public ${apiName.replace(/[^a-zA-Z0-9]/g, '')}Client(String accessToken) {
        this.token = accessToken;
        this.client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    }

    public String listResources() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE + "${basePath}?limit=10"))
            .timeout(Duration.ofSeconds(30))
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/json")
            .GET()
            .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }
        return response.body();
    }
}`;
}

function buildGoFallback(spec, apiName) {
  const ops = extractPaths(spec);
  const listOp = ops.find((o) => o.method === 'GET' && !o.path.includes('{')) ?? ops[0];
  const basePath = listOp?.path ?? '/v1/resource';
  return `// ${apiName} — Go net/http example
package main

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "time"
)

const baseURL = "https://api.internal"

func listResources(ctx context.Context, token string) ([]byte, error) {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"${basePath}?limit=10", nil)
    if err != nil {
        return nil, err
    }
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Accept", "application/json")

    client := &http.Client{Timeout: 30 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }
    if resp.StatusCode >= 400 {
        return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
    }
    return body, nil
}`;
}
