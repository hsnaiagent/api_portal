import type { API } from '@/types';
import { matchesSearchIndex } from '@/lib/search-index';

export interface PlannerBundleItem {
  id: string;
  label: string;
  score?: number;
  reason?: string;
}

type RawPlannerItem = {
  id?: string;
  api_id?: string;
  label?: string;
  name?: string;
  score?: number;
  reason?: string;
};

function coerceItems(raw: unknown): RawPlannerItem[] {
  if (!raw || typeof raw !== 'object') return [];
  const record = raw as Record<string, unknown>;

  const candidates = record.items ?? record.apis ?? record.recommendations ?? record.bundle;
  if (!Array.isArray(candidates)) return [];
  return candidates as RawPlannerItem[];
}

/** Map Gemini planner output to valid catalog API IDs. */
export function normalizePlannerItems(
  raw: unknown,
  apis: API[],
): PlannerBundleItem[] {
  const items = coerceItems(raw);
  if (!items.length) return [];

  const published = apis.filter((api) => api.lifecycle_status === 'published');
  const byId = new Map(published.map((api) => [api.api_id, api]));
  const byName = new Map(published.map((api) => [api.name.toLowerCase(), api]));

  const seen = new Set<string>();
  const normalized: PlannerBundleItem[] = [];

  for (const item of items) {
    const rawId = item.id ?? item.api_id;
    let api = rawId ? byId.get(rawId) : undefined;

    const label = item.label ?? item.name;
    if (!api && label) {
      const key = label.toLowerCase();
      api =
        byName.get(key)
        ?? published.find((candidate) => candidate.name.toLowerCase().includes(key))
        ?? published.find((candidate) => key.includes(candidate.name.toLowerCase()));
    }

    if (!api || seen.has(api.api_id)) continue;

    seen.add(api.api_id);
    normalized.push({
      id: api.api_id,
      label: api.name,
      score: typeof item.score === 'number' ? item.score : undefined,
      reason: item.reason,
    });
  }

  return normalized;
}

/** Keyword fallback when the model returns text but no valid bundle items. */
export function suggestPlannerBundleFromDescription(
  description: string,
  apis: API[],
  limit = 6,
): PlannerBundleItem[] {
  const published = apis.filter((api) => api.lifecycle_status === 'published');
  const matches = published.filter((api) => matchesSearchIndex(api, description));

  return matches.slice(0, limit).map((api, index) => ({
    id: api.api_id,
    label: api.name,
    score: Math.max(60, 95 - index * 5),
    reason: 'Matched from catalog search terms for your description',
  }));
}

export function buildPlannerCatalog(apis: API[]) {
  return apis
    .filter((api) => api.lifecycle_status === 'published')
    .map((api) => ({
      api_id: api.api_id,
      name: api.name,
      description: api.description,
      tags: api.tags,
      domain_id: api.domain_id,
      classification: api.classification,
    }));
}
