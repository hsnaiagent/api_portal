import * as React from 'react';
import { SearchX } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { useVisibleApis } from '@/hooks/useVisibleApis';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePagination } from '@/hooks/usePagination';
import { matchesSearchIndex, getSearchMatchSummary } from '@/lib/search-index';
import { buildUserSubscriptionMap } from '@/lib/subscriptions';
import { domains, getDomainName } from '@/data/domains';
import { CLASSIFICATIONS } from '@/config/classification';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SmartSearch } from './smart-search';
import { AiSummary } from './ai-summary';
import { CatalogFilters } from './catalog-filters';
import { CatalogApiCard } from './api-card';
import { Pagination } from './pagination';
import type { CatalogFilters as CatalogFiltersState, CatalogSortKey, Classification } from '@/types';

const PAGE_SIZE = 12;

export function ApiCatalog() {
  const { state, dispatch } = usePortal();
  const visible = useVisibleApis(state.apis);
  const filters = state.catalogFilters;

  const [rawQuery, setRawQuery] = React.useState(filters.query);
  const query = useDebouncedValue(rawQuery, 300);
  const searching = rawQuery !== query;
  const [loading, setLoading] = React.useState(false);

  const subMap = React.useMemo(
    () => buildUserSubscriptionMap(state.subscriptions, state.currentUser?.user_id),
    [state.subscriptions, state.currentUser?.user_id],
  );

  const setFilters = (patch: Partial<CatalogFiltersState>) => {
    dispatch({
      type: 'SET_CATALOG_FILTERS',
      payload: { ...state.catalogFilters, ...patch },
    });
  };

  React.useEffect(() => {
    setFilters({ query });
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const domainKey = filters.domains.join('|');
  const classKey = filters.classifications.join('|');

  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, [query, domainKey, classKey, filters.sort, filters.aiEnabled]);

  const results = React.useMemo(() => {
    const list = visible.filter((api) => {
      if (filters.domains.length && !filters.domains.includes(api.domain_id)) return false;
      if (
        filters.classifications.length &&
        !filters.classifications.includes(api.classification)
      )
        return false;
      if (query && !matchesSearchIndex(api, query)) return false;
      return true;
    });

    const sorted = [...list];
    if (filters.sort === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === 'domain') {
      sorted.sort(
        (a, b) =>
          (getDomainName(a.domain_id) ?? a.domain_id).localeCompare(
            getDomainName(b.domain_id) ?? b.domain_id,
          ) || a.name.localeCompare(b.name),
      );
    }
    return sorted;
  }, [visible, query, filters.sort, filters.domains, filters.classifications]);

  const domainCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const api of visible) {
      if (
        filters.classifications.length &&
        !filters.classifications.includes(api.classification)
      )
        continue;
      if (query && !matchesSearchIndex(api, query)) continue;
      counts[api.domain_id] = (counts[api.domain_id] ?? 0) + 1;
    }
    return counts;
  }, [visible, query, filters.classifications]);

  const { page, setPage, pageItems, totalPages } = usePagination(results, PAGE_SIZE);

  const hasFilters = filters.domains.length > 0 || filters.classifications.length > 0;
  const isFiltering = hasFilters || query.length > 0;

  const toggleDomain = (domainId: string) => {
    const next = filters.domains.includes(domainId)
      ? filters.domains.filter((d) => d !== domainId)
      : [...filters.domains, domainId];
    setFilters({ domains: next });
    setPage(1);
  };

  const toggleClassification = (c: Classification) => {
    const next = filters.classifications.includes(c)
      ? filters.classifications.filter((x) => x !== c)
      : [...filters.classifications, c];
    setFilters({ classifications: next });
    setPage(1);
  };

  const clearAll = () => {
    setFilters({ domains: [], classifications: [] });
    setPage(1);
  };

  const clearEverything = () => {
    clearAll();
    setRawQuery('');
    setFilters({ query: '', aiContext: undefined });
  };

  const summaryText = React.useMemo(() => {
    if (!filters.aiEnabled || !isFiltering) return undefined;

    if (query) {
      const matches = results;
      if (matches.length > 0) {
        const summary =
          getSearchMatchSummary(matches[0], query) ??
          `Found ${matches.length} API${matches.length === 1 ? '' : 's'} matching "${query}" via indexed search terms.`;
        return summary;
      }
      return `No APIs matched "${query}" in name, description, tags, or pre-computed search index.`;
    }

    const parts: string[] = [];
    if (filters.domains.length) {
      const names = filters.domains
        .map((id) => getDomainName(id) ?? id)
        .slice(0, 2);
      parts.push(
        `in ${names.join(' & ')}${filters.domains.length > 2 ? ` +${filters.domains.length - 2}` : ''}`,
      );
    }
    if (filters.classifications.length) {
      parts.push(
        `classified as ${filters.classifications.map((c) => c).join(', ')}`,
      );
    }
    const suffix = parts.length ? ` ${parts.join(', ')}` : ' across the catalog';
    const noun = results.length === 1 ? 'API' : 'APIs';
    return `Found ${results.length} ${noun}${suffix}.`;
  }, [query, results, filters.aiEnabled, isFiltering, filters.domains, filters.classifications]);

  React.useEffect(() => {
    if (summaryText) setFilters({ aiContext: summaryText });
    else if (!query) setFilters({ aiContext: undefined });
  }, [summaryText]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-5 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            API Catalog
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Browse, search, and subscribe to APIs across every domain. Turn on AI Smart
            Search to find capabilities in plain language.
          </p>
        </div>
        <div className="mx-auto w-full max-w-3xl text-left">
          <SmartSearch
            value={rawQuery}
            onChange={setRawQuery}
            aiEnabled={filters.aiEnabled}
            onToggleAi={(enabled) => setFilters({ aiEnabled: enabled })}
            searching={searching}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <CatalogFilters
          domainList={domains}
          domains={filters.domains}
          classifications={filters.classifications}
          onToggleDomain={toggleDomain}
          onToggleClassification={toggleClassification}
          onClearAll={clearAll}
          domainCounts={domainCounts}
        />
      </div>

      {filters.aiEnabled && isFiltering && !loading && summaryText && (
        <AiSummary text={summaryText} />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {hasFilters ? (
              <>
                {filters.domains.map((id) => (
                  <FilterChip
                    key={id}
                    label={getDomainName(id) ?? id}
                    active
                    onRemove={() => toggleDomain(id)}
                    onToggle={() => toggleDomain(id)}
                  />
                ))}
                {filters.classifications.map((c) => (
                  <FilterChip
                    key={c}
                    label={CLASSIFICATIONS[c].label}
                    active
                    onRemove={() => toggleClassification(c)}
                    onToggle={() => toggleClassification(c)}
                  />
                ))}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                {loading ? 'Searching…' : `${results.length} APIs available`}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">Sort by</span>
            <Select
              value={filters.sort}
              onValueChange={(v) => setFilters({ sort: v as CatalogSortKey })}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="No APIs match your search"
            description="Try a different search term, enable AI Smart Search, or clear your filters to see more results."
            action={
              <Button variant="secondary" onClick={clearEverything}>
                Clear search & filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((api) => (
              <CatalogApiCard
                key={api.api_id}
                api={api}
                subscription={subMap.get(api.api_id) ?? null}
                domainName={getDomainName(api.domain_id)}
              />
            ))}
          </div>
        )}
      </div>

      {!loading && results.length > 0 && (
        <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
