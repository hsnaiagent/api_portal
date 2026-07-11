import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { getUserById } from '@/data/users';
import { getApiById } from '@/data/apis';
import { LLMSubscriptionForm } from '@/components/shared/LLMSubscriptionForm';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { provisionSubscription } from '@/mocks/GatewayAdapter';
import { calculateLlmAnnualSpending, formatLlmAnnualSpending } from '@/lib/roles';
import { llmRequestBadgeVariant } from '@/lib/catalog-badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterSelect } from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import type { LLMSubscriptionRequest } from '@/types';

type RequestAction = 'approve' | 'reject';

type DialogState = {
  llmRequestId: string;
  subscriptionId: string;
  action: RequestAction;
};

type QueueState = {
  dialog: DialogState | null;
  processingId: string | null;
};

const idleQueue: QueueState = { dialog: null, processingId: null };

export function LLMSubscriptionQueuePage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [queue, setQueue] = useState<QueueState>(idleQueue);

  const audit = (action: string, llmRequestId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action,
        entity_type: 'llm_request',
        entity_id: llmRequestId,
      },
    });
  };

  const pending = state.llmSubscriptionRequests.filter((r) => r.status === 'pending');
  const reviewed = state.llmSubscriptionRequests.filter((r) => r.status !== 'pending');

  const matchesFilters = (
    req: (typeof state.llmSubscriptionRequests)[number],
    isPending: boolean,
  ) => {
    if (statusFilter === 'pending' && !isPending) return false;
    if (statusFilter === 'approved' && req.status !== 'approved') return false;
    if (statusFilter === 'rejected' && req.status !== 'rejected') return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const user = getUserById(req.requested_by_user_id);
      const api = getApiById(req.api_id);
      return (
        req.use_case_name.toLowerCase().includes(q) ||
        user?.display_name.toLowerCase().includes(q) ||
        api?.name.toLowerCase().includes(q)
      );
    }
    return true;
  };

  const filteredPending = useMemo(
    () => pending.filter((r) => matchesFilters(r, true)),
    [pending, query, statusFilter],
  );
  const filteredReviewed = useMemo(
    () => reviewed.filter((r) => matchesFilters(r, false)),
    [reviewed, query, statusFilter],
  );

  const hasActiveFilters = Boolean(query || statusFilter);

  const approveRequest = async (llmRequestId: string, subscriptionId: string) => {
    if (!state.currentUser) return;
    const sub = state.subscriptions.find((s) => s.subscription_id === subscriptionId);
    if (sub) await provisionSubscription(sub);
    dispatch({
      type: 'UPDATE_LLM_REQUEST',
      payload: {
        llm_request_id: llmRequestId,
        patch: {
          status: 'approved',
          reviewer_id: state.currentUser.user_id,
          reviewer_comment: comment[llmRequestId] || 'Approved',
          reviewed_at: new Date().toISOString(),
        },
      },
    });
    if (sub) {
      dispatch({
        type: 'UPDATE_SUBSCRIPTION',
        payload: {
          subscription_id: subscriptionId,
          patch: {
            status: 'active',
            provider_status: 'accepted',
            approved_at: new Date().toISOString(),
          },
        },
      });
    }
    audit('llm_access.approved', llmRequestId);
    notify('LLM access approved', 'Subscription activated and credentials provisioned.', 'success');
  };

  const rejectRequest = (llmRequestId: string, subscriptionId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'UPDATE_LLM_REQUEST',
      payload: {
        llm_request_id: llmRequestId,
        patch: {
          status: 'rejected',
          reviewer_id: state.currentUser.user_id,
          reviewer_comment: comment[llmRequestId] || 'Rejected',
          reviewed_at: new Date().toISOString(),
        },
      },
    });
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: {
        subscription_id: subscriptionId,
        patch: { status: 'revoked', provider_status: 'rejected' },
      },
    });
    audit('llm_access.rejected', llmRequestId);
    notify('LLM access rejected', 'Developer has been notified.', 'warning');
  };

  const openDialog = (llmRequestId: string, subscriptionId: string, action: RequestAction) => {
    if (queue.dialog !== null) return;
    if (queue.processingId === llmRequestId) return;
    setQueue((prev) => ({ ...prev, dialog: { llmRequestId, subscriptionId, action } }));
  };

  const closeDialog = () => {
    setQueue((prev) => ({ ...prev, dialog: null }));
  };

  const isRowBusy = (llmRequestId: string) =>
    queue.dialog?.llmRequestId === llmRequestId || queue.processingId === llmRequestId;

  const handleConfirm = async () => {
    const dialog = queue.dialog;
    if (!dialog || queue.processingId !== null) return;

    const { llmRequestId, subscriptionId, action } = dialog;
    setQueue((prev) => ({ ...prev, processingId: llmRequestId }));

    try {
      if (action === 'approve') {
        await approveRequest(llmRequestId, subscriptionId);
      } else {
        rejectRequest(llmRequestId, subscriptionId);
      }
      setQueue(idleQueue);
    } catch {
      setQueue((prev) => ({ ...prev, processingId: null }));
      notify('Approval failed', 'Could not provision the subscription. Please try again.', 'error');
    }
  };

  const dialogReq = queue.dialog
    ? state.llmSubscriptionRequests.find((r) => r.llm_request_id === queue.dialog?.llmRequestId)
    : null;
  const isApprove = queue.dialog?.action === 'approve';
  const dialogPending =
    queue.dialog !== null && queue.processingId === queue.dialog.llmRequestId;

  const reviewedColumns = useMemo<DataTableColumn<LLMSubscriptionRequest>[]>(
    () => [
      {
        id: 'use_case',
        header: 'Use case',
        cell: (r) => r.use_case_name,
      },
      {
        id: 'requester',
        header: 'Requester',
        cell: (r) => getUserById(r.requested_by_user_id)?.display_name ?? '—',
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => (
          <Badge variant={llmRequestBadgeVariant(r.status)} withDot>
            {r.status}
          </Badge>
        ),
      },
      {
        id: 'spend',
        header: 'Est. API spend',
        cell: (r) => formatLlmAnnualSpending(calculateLlmAnnualSpending(r).annualSpendingUsd),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">LLM Access Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review ROI-justified LLM API access requests before approving subscriptions.
        </p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search use case, requester, or API..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setStatusFilter('');
        }}
        resultLabel={`${filteredPending.length} pending · ${filteredReviewed.length} reviewed`}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { value: 'pending', label: 'Pending only' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          className="w-40"
        />
      </ListFilterBar>

      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-sm">Pending ({filteredPending.length})</CardTitle>
        </CardHeader>
        {filteredPending.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title="No pending LLM access requests"
            description={
              hasActiveFilters
                ? 'No pending requests match your filters.'
                : 'When developers submit LLM access requests, they will appear here for review.'
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('');
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {filteredPending.map((req) => {
              const user = getUserById(req.requested_by_user_id);
              const api = getApiById(req.api_id);
              const isOpen = expanded === req.llm_request_id;
              const rowBusy = isRowBusy(req.llm_request_id);
              const rowProcessing = queue.processingId === req.llm_request_id;

              return (
                <CardContent key={req.llm_request_id} className="space-y-3 p-4">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : req.llm_request_id)}
                    className="flex w-full flex-wrap justify-between gap-2 text-left"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{req.use_case_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.display_name} · {api?.name} ·{' '}
                        {formatLlmAnnualSpending(calculateLlmAnnualSpending(req).annualSpendingUsd)}
                      </p>
                    </div>
                    <span className="text-xs text-link">
                      {isOpen ? 'Hide details' : 'Show details'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                      <LLMSubscriptionForm value={req} onChange={() => {}} readOnly showRoi />
                    </div>
                  )}
                  <Input
                    type="text"
                    placeholder="Reviewer comment (optional)"
                    value={comment[req.llm_request_id] ?? ''}
                    onChange={(e) =>
                      setComment({ ...comment, [req.llm_request_id]: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        openDialog(req.llm_request_id, req.subscription_id, 'approve')
                      }
                      disabled={rowBusy}
                      loading={rowProcessing && queue.dialog?.action === 'approve'}
                    >
                      {rowProcessing && queue.dialog?.action === 'approve'
                        ? 'Provisioning…'
                        : 'Approve'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        openDialog(req.llm_request_id, req.subscription_id, 'reject')
                      }
                      disabled={rowBusy}
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
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
            keyExtractor={(r) => r.llm_request_id}
            emptyTitle="No reviewed requests match your filters"
            emptyDescription="Try adjusting your search or filter criteria."
            emptyAction={
              hasActiveFilters ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('');
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </div>
      )}

      <ConfirmDialog
        open={queue.dialog !== null}
        onOpenChange={(open) => {
          if (!open && !dialogPending) closeDialog();
        }}
        title={
          isApprove
            ? `Approve access for "${dialogReq?.use_case_name ?? 'this use case'}"?`
            : `Reject access for "${dialogReq?.use_case_name ?? 'this use case'}"?`
        }
        description={
          isApprove
            ? 'The subscription will be activated and credentials provisioned via the gateway.'
            : 'The developer will be notified that their LLM access request was denied.'
        }
        confirmLabel={isApprove ? 'Approve' : 'Reject'}
        pendingLabel={isApprove ? 'Provisioning…' : 'Rejecting…'}
        confirmVariant={isApprove ? 'primary' : 'destructive'}
        pending={dialogPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
