import { buildSeedSdkSnippets } from '@/lib/sdk-api';
import type { OpenAPIEndpoint } from '@/types';

export interface SdkSnippetSet {
  curl: string;
  python: string;
  nodejs: string;
}

/** Build production-grade SDK snippets for a seed API from its endpoint metadata. */
export function getSdkSnippetsForApi(
  apiId: string,
  name: string,
  slug: string,
  description: string,
  endpoints: OpenAPIEndpoint[],
): SdkSnippetSet {
  return buildSeedSdkSnippets(apiId, name, slug, description, endpoints);
}
