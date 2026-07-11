import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileKey } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { SubscriptionCard } from '@/components/shared/SubscriptionCard';
import { domains, getDomainName } from '@/data/domains';
import { ROUTES } from '@/config/routes';
import { isPendingSubscription, isRejectedSubscription } from '@/lib/subscriptions';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { buttonVariants, Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const clearFilters = () => {
    setQuery('');
    setDomainFilter('');
    setAppFilter('');
    setStatusFilter('all');
  };

  const hasActiveFilters = Boolean(
    query || domainFilter || appFilter || statusFilter !== 'all',
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Subscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track API access, approval status, and credentials
          </p>
        </div>
        <Link
          to={ROUTES.consumer.catalog}
          className={buttonVariants({ variant: 'link', size: 'sm' })}
        >
          Browse catalog for more APIs
        </Link>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {statusChips.map((chip) => (
          <FilterChip
            key={chip.value}
            label={chip.label}
            count={chip.count}
            active={statusFilter === chip.value}
            onToggle={() => setStatusFilter(chip.value)}
          />
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by API name, purpose, application, or domain…"
        />

        <div className="flex flex-wrap gap-3">
          <Select
            value={domainFilter || 'all'}
            onValueChange={(v) => setDomainFilter(!v || v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d.domain_id} value={d.domain_id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={appFilter || 'all'}
            onValueChange={(v) => setAppFilter(!v || v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All applications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All applications</SelectItem>
              {myApps.map((a) => (
                <SelectItem key={a.application_id} value={a.application_id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {mySubs.length} subscription{mySubs.length === 1 ? '' : 's'}
      </p>

      {mySubs.length === 0 ? (
        <EmptyState
          icon={<FileKey />}
          title="No subscriptions yet"
          description="Browse the API catalog to request access to enterprise APIs for your applications."
          action={
            <Link to={ROUTES.consumer.catalog} className={buttonVariants({ variant: 'primary' })}>
              Browse API catalog
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No subscriptions match your filters"
          description="Try adjusting your search or filter criteria."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear all filters
            </Button>
          }
        />
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
