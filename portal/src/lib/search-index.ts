import type { API } from '@/types';

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function haystackForApi(api: API): string[] {
  const terms = [
    api.name,
    api.description,
    api.slug,
    ...api.tags,
    ...(api.search_index?.fluctuations ?? []),
    ...(api.search_index?.synonyms ?? []),
    ...(api.search_index?.business_terms ?? []),
  ];

  return terms.map(normalize).filter(Boolean);
}

export function matchesSearchIndex(api: API, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;

  return haystackForApi(api).some((term) => term.includes(q));
}

export function getSearchMatchSummary(api: API, query: string): string | undefined {
  const q = normalize(query);
  if (!q || !api.search_index) return undefined;

  const categories: [string, string[]][] = [
    ['synonym', api.search_index.synonyms],
    ['business term', api.search_index.business_terms],
    ['name variant', api.search_index.fluctuations],
  ];

  for (const [label, terms] of categories) {
    const hit = terms.find((term) => normalize(term).includes(q));
    if (hit) return `Matched via ${label}: "${hit}"`;
  }

  return undefined;
}

export function getRecommendationsFromIndex(
  api: API,
  allApis: API[],
): { id: string; label: string; reason?: string }[] {
  const relatedIds = api.search_index?.related_api_ids ?? [];
  return relatedIds
    .map((id) => allApis.find((candidate) => candidate.api_id === id))
    .filter((candidate): candidate is API => Boolean(candidate))
    .map((candidate) => ({
      id: candidate.api_id,
      label: candidate.name,
      reason: 'Commonly used alongside this API',
    }));
}
