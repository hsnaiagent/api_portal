import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { ClassificationBadge } from '@/components/shared/ClassificationBadge';
import { LifecycleBadge } from '@/components/shared/LifecycleBadge';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { CLASSIFICATIONS } from '@/config/classification';
import { LIFECYCLE_LABELS } from '@/config/lifecycle';
import type { Classification, LifecycleStatus } from '@/types';

export function LLMApiManagePage() {
  const { state } = usePortal();
  const llmApis = state.apis.filter((a) => a.domain_id === 'dom_ai');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = useMemo(() => {
    return llmApis.filter((api) => {
      if (statusFilter && api.lifecycle_status !== statusFilter) return false;
      if (classFilter && api.classification !== classFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [llmApis, query, statusFilter, classFilter]);

  const hasActiveFilters = Boolean(query || statusFilter || classFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">My LLM APIs</h1>
        <Link to={ROUTES.llmAdmin.register} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">
          Register LLM API
        </Link>
      </div>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name or description..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setStatusFilter('');
          setClassFilter('');
        }}
        resultLabel={`${filtered.length} of ${llmApis.length} APIs`}
      >
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
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Classification</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((api) => (
              <tr key={api.api_id} className="border-t">
                <td className="px-4 py-3 font-medium">{api.name}</td>
                <td className="px-4 py-3"><LifecycleBadge status={api.lifecycle_status} /></td>
                <td className="px-4 py-3"><ClassificationBadge classification={api.classification} /></td>
                <td className="px-4 py-3">Tier {api.gateway_tier}</td>
                <td className="px-4 py-3">
                  <Link to={ROUTES.llmAdmin.manage(api.api_id)} className="text-brand-blue hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No APIs match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
