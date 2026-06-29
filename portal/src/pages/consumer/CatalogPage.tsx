import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { usePortal } from '@/store/AppStore';
import { useVisibleApis } from '@/hooks/useVisibleApis';
import { ApiCard } from '@/components/shared/ApiCard';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { AIBadge } from '@/components/ai/AIBadge';
import { getAIResponse } from '@/mocks/AIAdapter';
import { domains } from '@/data/domains';
import { CLASSIFICATIONS } from '@/config/classification';
import type { CatalogFilters, Classification } from '@/types';

export function CatalogPage() {
  const { state, dispatch } = usePortal();
  const visible = useVisibleApis(state.apis);
  const { query, domainFilter, classFilter, aiContext } = state.catalogFilters;
  const [aiLoading, setAiLoading] = useState(false);

  const setFilters = (patch: Partial<CatalogFilters>) => {
    dispatch({ type: 'SET_CATALOG_FILTERS', payload: { ...state.catalogFilters, ...patch } });
  };

  const search = async () => {
    if (!query.trim()) return;
    setAiLoading(true);
    await getAIResponse('AI_15_NaturalLanguageSearch', { query });
    const res = await getAIResponse('AI_2_SemanticSearch', { query });
    setFilters({ aiContext: res?.text });
    setAiLoading(false);
  };

  const filtered = useMemo(() => {
    return visible.filter((api) => {
      if (domainFilter && api.domain_id !== domainFilter) return false;
      if (classFilter && api.classification !== classFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q) || api.tags.some((t) => t.includes(q));
      }
      return true;
    });
  }, [visible, query, domainFilter, classFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">API Catalog</h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setFilters({ query: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder='Try: "APIs for employee salary statistics" or keyword search'
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <button type="button" onClick={search} className="rounded-lg bg-brand-blue text-brand-white px-4 py-2 text-sm font-medium hover:bg-brand-blue-dark flex items-center gap-2 justify-center">
          <AIBadge label="AI Search" /> Search
        </button>
      </div>

      <AIThinkingOverlay loading={aiLoading} text={!aiLoading ? aiContext : undefined} />

      <div className="flex flex-wrap gap-3">
        <select value={domainFilter} onChange={(e) => setFilters({ domainFilter: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All domains</option>
          {domains.map((d) => <option key={d.domain_id} value={d.domain_id}>{d.name}</option>)}
        </select>
        <select value={classFilter} onChange={(e) => setFilters({ classFilter: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All classifications</option>
          {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
            <option key={c} value={c}>{CLASSIFICATIONS[c].label}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-500">{filtered.length} APIs found</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((api) => <ApiCard key={api.api_id} api={api} />)}
      </div>
    </div>
  );
}
