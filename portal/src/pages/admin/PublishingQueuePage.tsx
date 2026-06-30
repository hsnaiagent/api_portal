import { useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { ClassificationBadge } from '@/components/shared/ClassificationBadge';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { CLASSIFICATIONS } from '@/config/classification';
import type { Classification } from '@/types';

export function PublishingQueuePage() {
  const { state, dispatch } = usePortal();
  const testing = state.apis.filter((a) => a.lifecycle_status === 'in_testing');
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = useMemo(() => {
    return testing.filter((api) => {
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [testing, query, classFilter]);

  const hasActiveFilters = Boolean(query || classFilter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Publishing Queue</h1>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search APIs awaiting publish..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setClassFilter('');
        }}
        resultLabel={`${filtered.length} of ${testing.length} APIs`}
      >
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All classifications</option>
          {(Object.keys(CLASSIFICATIONS) as Classification[]).map((c) => (
            <option key={c} value={c}>{CLASSIFICATIONS[c].label}</option>
          ))}
        </select>
      </ListFilterBar>
      {filtered.map((api) => (
        <div key={api.api_id} className="rounded-xl border bg-brand-white p-6 flex justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold">{api.name}</p>
            <ClassificationBadge classification={api.classification} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: 'published' } } })} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Approve publish</button>
            <button type="button" onClick={() => dispatch({ type: 'UPDATE_API', payload: { api_id: api.api_id, patch: { lifecycle_status: 'in_development' } } })} className="rounded-lg border px-4 py-2 text-sm">Return to dev</button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && <p className="text-slate-500">No APIs match your filters.</p>}
    </div>
  );
}
