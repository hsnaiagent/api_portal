import { useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { ClassificationBadge } from '@/components/shared/ClassificationBadge';
import { LifecycleBadge } from '@/components/shared/LifecycleBadge';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { domains } from '@/data/domains';
import { CLASSIFICATIONS } from '@/config/classification';
import { LIFECYCLE_LABELS } from '@/config/lifecycle';
import type { Classification, LifecycleStatus } from '@/types';

export function AllApisPage() {
  const { state, dispatch } = usePortal();
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = useMemo(() => {
    return state.apis.filter((api) => {
      if (domainFilter && api.domain_id !== domainFilter) return false;
      if (statusFilter && api.lifecycle_status !== statusFilter) return false;
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [state.apis, query, domainFilter, statusFilter, classFilter]);

  const hasActiveFilters = Boolean(query || domainFilter || statusFilter || classFilter);
  const { page, setPage, pageItems, totalPages, total, pageStart, pageEnd } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All APIs</h1>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name or description..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setDomainFilter('');
          setStatusFilter('');
          setClassFilter('');
        }}
        resultLabel={`${filtered.length} of ${state.apis.length} APIs`}
      >
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All domains</option>
          {domains.map((d) => <option key={d.domain_id} value={d.domain_id}>{d.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {(Object.keys(LIFECYCLE_LABELS) as LifecycleStatus[]).map((s) => (
            <option key={s} value={s}>{LIFECYCLE_LABELS[s]}</option>
          ))}
        </select>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All classifications</option>
          {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
            <option key={c} value={c}>{CLASSIFICATIONS[c].label}</option>
          ))}
        </select>
      </ListFilterBar>
      <div className="overflow-x-auto rounded-xl border bg-brand-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {pageItems.map((api) => (
              <tr key={api.api_id} className="border-t">
                <td className="px-4 py-3 font-medium">{api.name}</td>
                <td className="px-4 py-3"><LifecycleBadge status={api.lifecycle_status} /></td>
                <td className="px-4 py-3"><ClassificationBadge classification={api.classification} /></td>
                <td className="px-4 py-3">
                  {api.lifecycle_status !== 'emergency_retired' && (
                    <button type="button" onClick={() => dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: 'emergency_retired' } } })} className="text-xs text-red-600 hover:underline">Emergency retire</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">{state.apis.length === 0 ? 'No APIs in the catalog yet.' : 'No APIs match your filters.'}</td></tr>
            )}
          </tbody>
        </table>
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
