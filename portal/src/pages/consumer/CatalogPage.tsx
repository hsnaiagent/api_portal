import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { usePortal } from '@/store/AppStore';
import { useVisibleApis } from '@/hooks/useVisibleApis';
import { ApiCard } from '@/components/shared/ApiCard';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { AIBadge } from '@/components/ai/AIBadge';
import { matchesSearchIndex, getSearchMatchSummary } from '@/lib/search-index';
import { domains, getDomainName } from '@/data/domains';
import { buildUserSubscriptionMap } from '@/lib/subscriptions';
import { CLASSIFICATIONS } from '@/config/classification';
import type { CatalogFilters, Classification } from '@/types';

export function CatalogPage() {
  const { state, dispatch } = usePortal();
  const visible = useVisibleApis(state.apis);
  const { query, domainFilter, classFilter, aiContext } = state.catalogFilters;
  const [searchContext, setSearchContext] = useState<string>();

  const subMap = useMemo(
    () => buildUserSubscriptionMap(state.subscriptions, state.currentUser?.user_id),
    [state.subscriptions, state.currentUser?.user_id],
  );

  const setFilters = (patch: Partial<CatalogFilters>) => {
    dispatch({ type: 'SET_CATALOG_FILTERS', payload: { ...state.catalogFilters, ...patch } });
  };

  const runSearch = () => {
    if (!query.trim()) {
      setSearchContext(undefined);
      setFilters({ aiContext: undefined });
      return;
    }

    const matches = visible.filter((api) => matchesSearchIndex(api, query));
    const summary =
      matches.length > 0
        ? (getSearchMatchSummary(matches[0], query) ??
          `Found ${matches.length} API${matches.length === 1 ? '' : 's'} matching "${query}" via indexed search terms.`)
        : `No APIs matched "${query}" in name, description, tags, or pre-computed search index.`;

    setSearchContext(summary);
    setFilters({ aiContext: summary });
  };

  const filtered = useMemo(() => {
    return visible.filter((api) => {
      if (domainFilter && api.domain_id !== domainFilter) return false;
      if (classFilter && api.classification !== classFilter) return false;
      if (query) return matchesSearchIndex(api, query);
      return true;
    });
  }, [visible, query, domainFilter, classFilter]);

  const contextMessage = searchContext ?? aiContext;
  const { page, setPage, pageItems, totalPages, total, pageStart, pageEnd } = usePagination(
    filtered,
    12,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">API Catalog</h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setFilters({ query: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder='Try: "compensation", "WPS", or "employee salary"'
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <button
          type="button"
          onClick={runSearch}
          className="rounded-lg bg-brand-blue text-brand-white px-4 py-2 text-sm font-medium hover:bg-brand-blue-dark flex items-center gap-2 justify-center"
        >
          <AIBadge label="Indexed Search" /> Search
        </button>
      </div>

      {contextMessage && (
        <p className="text-sm text-slate-600 rounded-lg border border-brand-blue-light bg-brand-blue-light/30 px-4 py-3">
          {contextMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <select
          value={domainFilter}
          onChange={(e) => setFilters({ domainFilter: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All domains</option>
          {domains.map((d) => (
            <option key={d.domain_id} value={d.domain_id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={classFilter}
          onChange={(e) => setFilters({ classFilter: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All classifications</option>
          {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
            <option key={c} value={c}>
              {CLASSIFICATIONS[c].label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} APIs found</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageItems.map((api) => (
          <ApiCard
            key={api.api_id}
            api={api}
            subscription={subMap.get(api.api_id) ?? null}
            domainName={getDomainName(api.domain_id)}
          />
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageStart={pageStart}
        pageEnd={pageEnd}
        onPageChange={setPage}
        unit="APIs"
      />
    </div>
  );
}
