import { useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { ClassificationBadge } from '@/components/shared/ClassificationBadge';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { CLASSIFICATIONS } from '@/config/classification';
import type { Classification, LifecycleStatus } from '@/types';

export function PublishingQueuePage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const testing = state.apis.filter((a) => a.lifecycle_status === 'in_testing');

  const move = (apiId: string, name: string, next: LifecycleStatus, message: string) => {
    if (next === 'published' && !window.confirm(`Publish "${name}"? It will become visible and subscribable.`)) return;
    dispatch({ type: 'UPDATE_API', payload: { api_id: apiId, patch: { lifecycle_status: next } } });
    if (state.currentUser) {
      dispatch({
        type: 'ADD_AUDIT',
        payload: {
          audit_id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor_user_id: state.currentUser.user_id,
          actor_type: 'user',
          action: 'api.lifecycle.changed',
          entity_type: 'api',
          entity_id: apiId,
          payload: { to: next },
        },
      });
    }
    notify('Lifecycle updated', message, 'success');
  };
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
            <button type="button" onClick={() => move(api.api_id, api.name, 'published', `${api.name} is now published.`)} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Approve publish</button>
            <button type="button" onClick={() => move(api.api_id, api.name, 'in_development', `${api.name} returned to development.`)} className="rounded-lg border px-4 py-2 text-sm">Return to dev</button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-slate-500">{testing.length === 0 ? 'No APIs are awaiting publish.' : 'No APIs match your filters.'}</p>
      )}
    </div>
  );
}
