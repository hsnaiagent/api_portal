import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { getManagedApis } from '@/lib/roles';
import { isProviderActionable } from '@/lib/subscriptions';
import { provisionSubscription } from '@/mocks/GatewayAdapter';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type RequestAction = 'accept' | 'reject';

type DialogState = { subId: string; action: RequestAction };

type QueueState = {
  dialog: DialogState | null;
  processingId: string | null;
};

const idleQueue: QueueState = { dialog: null, processingId: null };

export function ConsumerRequestsPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [query, setQuery] = useState('');
  const [queue, setQueue] = useState<QueueState>(idleQueue);

  const audit = (action: string, subId: string) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action,
        entity_type: 'subscription',
        entity_id: subId,
      },
    });
  };

  const myApis = getManagedApis(state.apis, state.currentUser, state.activeRole);
  const myApiIds = new Set(myApis.map((a) => a.api_id));
  const pending = state.subscriptions.filter(
    (s) => myApiIds.has(s.api_id) && isProviderActionable(s),
  );

  const filtered = useMemo(() => {
    return pending.filter((sub) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const api = state.apis.find((a) => a.api_id === sub.api_id);
      const app = state.applications.find((a) => a.application_id === sub.application_id);
      return (
        api?.name.toLowerCase().includes(q) ||
        app?.name.toLowerCase().includes(q) ||
        sub.purpose.toLowerCase().includes(q)
      );
    });
  }, [pending, state.apis, state.applications, query]);

  const acceptRequest = async (subId: string) => {
    const sub = state.subscriptions.find((s) => s.subscription_id === subId);
    if (!sub) return;

    await provisionSubscription(sub);
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: {
        subscription_id: subId,
        patch: {
          status: 'active',
          provider_status: 'accepted',
          approved_at: new Date().toISOString(),
        },
      },
    });
    audit('subscription.provider_accepted', subId);
    notify('Consumer accepted', 'Credentials provisioned via gateway', 'success');
  };

  const rejectRequest = (subId: string) => {
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: {
        subscription_id: subId,
        patch: { status: 'revoked', provider_status: 'rejected' },
      },
    });
    audit('subscription.provider_rejected', subId);
    notify('Consumer rejected', 'Subscription request denied', 'warning');
  };

  const openDialog = (subId: string, action: RequestAction) => {
    if (queue.dialog !== null) return;
    if (queue.processingId === subId) return;
    setQueue((prev) => ({ ...prev, dialog: { subId, action } }));
  };

  const closeDialog = () => {
    setQueue((prev) => ({ ...prev, dialog: null }));
  };

  const isRowBusy = (subId: string) =>
    queue.dialog?.subId === subId || queue.processingId === subId;

  const handleConfirm = async () => {
    const dialog = queue.dialog;
    if (!dialog || queue.processingId !== null) return;

    const { subId, action } = dialog;
    setQueue((prev) => ({ ...prev, processingId: subId }));

    try {
      if (action === 'accept') {
        await acceptRequest(subId);
      } else {
        rejectRequest(subId);
      }
      setQueue(idleQueue);
    } catch {
      setQueue((prev) => ({ ...prev, processingId: null }));
      notify(
        'Provisioning failed',
        'Could not provision the subscription. Please try again.',
        'error',
      );
    }
  };

  const dialogSub = queue.dialog
    ? state.subscriptions.find((s) => s.subscription_id === queue.dialog?.subId)
    : null;
  const dialogApi = dialogSub ? state.apis.find((a) => a.api_id === dialogSub.api_id) : null;
  const isAccept = queue.dialog?.action === 'accept';
  const dialogPending =
    queue.dialog !== null && queue.processingId === queue.dialog.subId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Consumer Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and approve subscription requests for your APIs
        </p>
      </div>

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by API, application, or purpose..."
        hasActiveFilters={Boolean(query)}
        onClear={() => setQuery('')}
        resultLabel={`${filtered.length} of ${pending.length} pending requests`}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title={
            pending.length === 0
              ? 'No pending consumer requests'
              : 'No requests match your filters'
          }
          description={
            pending.length === 0
              ? 'When consumers request access to your APIs, they will appear here for review.'
              : 'Try adjusting your search criteria.'
          }
          action={
            query ? (
              <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((sub) => {
            const api = state.apis.find((a) => a.api_id === sub.api_id);
            const app = state.applications.find((a) => a.application_id === sub.application_id);
            const rowBusy = isRowBusy(sub.subscription_id);
            const rowProcessing = queue.processingId === sub.subscription_id;

            return (
              <Card key={sub.subscription_id}>
                <CardContent className="space-y-3 p-6">
                  <p className="font-semibold text-foreground">{api?.name}</p>
                  <p className="text-sm text-muted-foreground">Application: {app?.name}</p>
                  <p className="text-sm text-muted-foreground">{sub.purpose}</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => openDialog(sub.subscription_id, 'accept')}
                      disabled={rowBusy}
                      loading={rowProcessing && queue.dialog?.action === 'accept'}
                    >
                      {rowProcessing && queue.dialog?.action === 'accept'
                        ? 'Provisioning…'
                        : 'Accept'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openDialog(sub.subscription_id, 'reject')}
                      disabled={rowBusy}
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={queue.dialog !== null}
        onOpenChange={(open) => {
          if (!open && !dialogPending) closeDialog();
        }}
        title={
          isAccept
            ? `Accept request for "${dialogApi?.name ?? 'this API'}"?`
            : `Reject request for "${dialogApi?.name ?? 'this API'}"?`
        }
        description={
          isAccept
            ? 'Credentials will be provisioned via the gateway and the consumer will be notified.'
            : 'The consumer will be notified that their subscription request was denied.'
        }
        confirmLabel={isAccept ? 'Accept' : 'Reject'}
        pendingLabel={isAccept ? 'Provisioning…' : 'Rejecting…'}
        confirmVariant={isAccept ? 'primary' : 'destructive'}
        pending={dialogPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
