import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileKey, Search } from 'lucide-react';
import { usePortal } from '@/store/AppStore';
import { SubscriptionCard } from '@/components/shared/SubscriptionCard';
import { domains, getDomainName } from '@/data/domains';
import { ROUTES } from '@/config/routes';
import { isPendingSubscription, isRejectedSubscription } from '@/lib/subscriptions';
import type { SubscriptionStatus } from '@/types';

type StatusFilter = 'all' | 'active' | 'pending' | 'rejected';

function matchesStatusFilter(status: SubscriptionStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return status === 'active';
  if (filter === 'pending') return isPendingSubscription(status);
  if (filter === 'rejected') return isRejectedSubscription(status);
  return true;
}

export function SubscriptionsPage() {
  const { state } = usePortal();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [domainFilter, setDomainFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');

  const mySubs = state.subscriptions.filter(
    (s) => s.requested_by_user_id === state.currentUser?.user_id,
  );
  const myApps = state.applications.filter((a) => a.owner_user_id === state.currentUser?.user_id);

  // Pre-index reference collections so filtering/rendering is O(1) per row.
  const apiById = useMemo(() => new Map(state.apis.map((a) => [a.api_id, a])), [state.apis]);
  const appById = useMemo(
    () => new Map(state.applications.map((a) => [a.application_id, a])),
    [state.applications],
  );
  const credBySub = useMemo(
    () => new Map(state.credentials.map((c) => [c.subscription_id, c])),
    [state.credentials],
  );

  const stats = useMemo(
    () => ({
      total: mySubs.length,
      active: mySubs.filter((s) => s.status === 'active').length,
      pending: mySubs.filter((s) => isPendingSubscription(s.status)).length,
      rejected: mySubs.filter((s) => isRejectedSubscription(s.status)).length,
    }),
    [mySubs],
  );

  const filtered = useMemo(() => {
    return mySubs.filter((sub) => {
      const api = apiById.get(sub.api_id);
      if (!api) return false;

      if (domainFilter && api.domain_id !== domainFilter) return false;
      if (appFilter && sub.application_id !== appFilter) return false;
      if (!matchesStatusFilter(sub.status, statusFilter)) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const app = appById.get(sub.application_id);
        return (
          api.name.toLowerCase().includes(q) ||
          sub.purpose.toLowerCase().includes(q) ||
          (app?.name.toLowerCase().includes(q) ?? false) ||
          (getDomainName(api.domain_id)?.toLowerCase().includes(q) ?? false)
        );
      }

      return true;
    });
  }, [mySubs, apiById, appById, query, statusFilter, domainFilter, appFilter]);

  const statusChips: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'pending', label: 'In progress', count: stats.pending },
    { value: 'rejected', label: 'Rejected', count: stats.rejected },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track API access, approval status, and credentials
          </p>
        </div>
        <Link
          to={ROUTES.consumer.catalog}
          className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline"
        >
          Browse catalog for more APIs
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statusChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setStatusFilter(chip.value)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              statusFilter === chip.value
                ? 'border-brand-blue bg-brand-blue-light/50 ring-1 ring-brand-blue/30'
                : 'border-slate-200 bg-brand-white hover:border-slate-300'
            }`}
          >
            <p className="text-sm text-slate-500">{chip.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{chip.count}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-brand-white p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by API name, purpose, application, or domain…"
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-brand-white"
          >
            <option value="">All domains</option>
            {domains.map((d) => (
              <option key={d.domain_id} value={d.domain_id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-brand-white"
          >
            <option value="">All applications</option>
            {myApps.map((a) => (
              <option key={a.application_id} value={a.application_id}>
                {a.name}
              </option>
            ))}
          </select>

          {(query || domainFilter || appFilter || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDomainFilter('');
                setAppFilter('');
                setStatusFilter('all');
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {filtered.length} of {mySubs.length} subscription{mySubs.length === 1 ? '' : 's'}
      </p>

      {mySubs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center space-y-3">
          <FileKey className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="font-medium text-slate-700">No subscriptions yet</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Browse the API catalog to request access to enterprise APIs for your applications.
          </p>
          <Link
            to={ROUTES.consumer.catalog}
            className="inline-block rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm font-medium hover:bg-brand-green-dark"
          >
            Browse API catalog
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-brand-white p-10 text-center">
          <p className="text-slate-600">No subscriptions match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDomainFilter('');
              setAppFilter('');
              setStatusFilter('all');
            }}
            className="mt-3 text-sm text-brand-blue hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((sub) => {
            const api = apiById.get(sub.api_id);
            if (!api) return null;
            const application = appById.get(sub.application_id);
            const domainName = getDomainName(api.domain_id);
            const cred = credBySub.get(sub.subscription_id);

            return (
              <SubscriptionCard
                key={sub.subscription_id}
                subscription={sub}
                api={api}
                application={application}
                domainName={domainName}
                credential={cred}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
