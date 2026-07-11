import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { getUserById } from '@/data/users';
import { domains } from '@/data/domains';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { providerAccessBadgeVariant } from '@/lib/catalog-badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterSelect } from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import type { ProviderAccessRequest } from '@/types';

type RejectTarget = {
  requestId: string;
  userId: string;
  domainId: string;
  displayName: string;
};

export function ProviderAccessQueuePage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [comment, setComment] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  const pending = state.providerAccessRequests.filter((r) => r.status === 'pending');
  const reviewed = state.providerAccessRequests.filter((r) => r.status !== 'pending');

  const matchesFilters = (userId: string, domainId: string) => {
    if (domainFilter && domainId !== domainFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const user = getUserById(userId);
      const domain = domains.find((d) => d.domain_id === domainId);
      return (
        user?.display_name.toLowerCase().includes(q) ||
        user?.email.toLowerCase().includes(q) ||
        domain?.name.toLowerCase().includes(q)
      );
    }
    return true;
  };

  const filteredPending = useMemo(
    () => pending.filter((r) => matchesFilters(r.user_id, r.domain_id)),
    [pending, query, domainFilter],
  );
  const filteredReviewed = useMemo(
    () => reviewed.filter((r) => matchesFilters(r.user_id, r.domain_id)),
    [reviewed, query, domainFilter],
  );

  const hasActiveFilters = Boolean(query || domainFilter);

  const approve = (requestId: string, userId: string, domainId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'UPDATE_PROVIDER_REQUEST',
      payload: {
        request_id: requestId,
        patch: {
          status: 'approved',
          reviewer_id: state.currentUser.user_id,
          reviewer_comment: comment[requestId] || 'Approved',
          reviewed_at: new Date().toISOString(),
        },
      },
    });
    dispatch({ type: 'GRANT_PROVIDER_DOMAIN', payload: { user_id: userId, domain_id: domainId } });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action: 'provider_access.approved',
        entity_type: 'provider_access_request',
        entity_id: requestId,
        payload: { user_id: userId, domain_id: domainId },
      },
    });
    notify('Access granted', 'Developer publisher capability updated.', 'success');
  };

  const reject = () => {
    if (!rejectTarget || !state.currentUser) return;
    const { requestId, userId, domainId } = rejectTarget;
    dispatch({
      type: 'UPDATE_PROVIDER_REQUEST',
      payload: {
        request_id: requestId,
        patch: {
          status: 'rejected',
          reviewer_id: state.currentUser.user_id,
          reviewer_comment: comment[requestId] || 'Rejected',
          reviewed_at: new Date().toISOString(),
        },
      },
    });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action: 'provider_access.rejected',
        entity_type: 'provider_access_request',
        entity_id: requestId,
        payload: { user_id: userId, domain_id: domainId },
      },
    });
    notify('Request rejected', 'Developer has been notified.', 'warning');
    setRejectTarget(null);
  };

  const reviewedColumns = useMemo<DataTableColumn<ProviderAccessRequest>[]>(
    () => [
      {
        id: 'developer',
        header: 'Developer',
        cell: (r) => getUserById(r.user_id)?.display_name ?? '—',
      },
      {
        id: 'domain',
        header: 'Domain',
        cell: (r) => domains.find((d) => d.domain_id === r.domain_id)?.name ?? r.domain_id,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => (
          <Badge variant={providerAccessBadgeVariant(r.status)} withDot>
            {r.status}
          </Badge>
        ),
      },
      {
        id: 'comment',
        header: 'Comment',
        cell: (r) => (
          <span className="text-muted-foreground">{r.reviewer_comment ?? '—'}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Provider Access Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review developer requests for domain-scoped publisher capability.
        </p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by developer or domain..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setDomainFilter('');
        }}
        resultLabel={`${filteredPending.length} pending · ${filteredReviewed.length} reviewed`}
      >
        <FilterSelect
          value={domainFilter}
          onChange={setDomainFilter}
          placeholder="All domains"
          options={domains
            .filter((d) => d.domain_id !== 'dom_ai')
            .map((d) => ({ value: d.domain_id, label: d.name }))}
          className="w-44"
        />
      </ListFilterBar>

      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-sm">Pending ({filteredPending.length})</CardTitle>
        </CardHeader>
        {filteredPending.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title="No pending requests"
            description={
              hasActiveFilters
                ? 'No pending requests match your filters.'
                : 'Developer publisher access requests will appear here.'
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setDomainFilter('');
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {filteredPending.map((r) => {
              const user = getUserById(r.user_id);
              const domain = domains.find((d) => d.domain_id === r.domain_id);
              return (
                <CardContent key={r.request_id} className="space-y-3 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{user?.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email} · {domain?.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground">
                    {r.justification}
                  </p>
                  <Input
                    type="text"
                    placeholder="Reviewer comment (optional)"
                    value={comment[r.request_id] ?? ''}
                    onChange={(e) => setComment({ ...comment, [r.request_id]: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => approve(r.request_id, r.user_id, r.domain_id)}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      onClick={() =>
                        setRejectTarget({
                          requestId: r.request_id,
                          userId: r.user_id,
                          domainId: r.domain_id,
                          displayName: user?.display_name ?? 'this developer',
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              );
            })}
          </div>
        )}
      </Card>

      {reviewed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Review history</h2>
          <DataTable
            columns={reviewedColumns}
            data={filteredReviewed}
            keyExtractor={(r) => r.request_id}
            emptyTitle="No reviewed requests match your filters"
            emptyDescription="Try adjusting your search or filter criteria."
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current developer publisher domains</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-foreground">
            {state.users
              .filter((u) => u.portal_roles.includes('developer'))
              .map((u) => (
                <li key={u.user_id}>
                  <strong>{u.display_name}:</strong>{' '}
                  {u.provider_domains.length
                    ? u.provider_domains
                        .map((id) => state.domains.find((d) => d.domain_id === id)?.name ?? id)
                        .join(', ')
                    : 'None'}
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        title={`Reject access for ${rejectTarget?.displayName ?? 'this developer'}?`}
        description="The developer will be notified that their publisher access request was denied."
        confirmLabel="Reject request"
        confirmVariant="destructive"
        onConfirm={reject}
      />
    </div>
  );
}
