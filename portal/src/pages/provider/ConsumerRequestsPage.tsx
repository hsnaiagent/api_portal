import { useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { getManagedApis } from '@/lib/roles';
import { isProviderActionable } from '@/lib/subscriptions';
import { provisionSubscription } from '@/mocks/GatewayAdapter';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';

export function ConsumerRequestsPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [query, setQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const accept = async (subId: string) => {
    const sub = state.subscriptions.find((s) => s.subscription_id === subId);
    if (!sub) return;
    setProcessingId(subId);
    try {
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
    } catch {
      notify(
        'Provisioning failed',
        'Could not provision the subscription. Please try again.',
        'error',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const reject = (subId: string) => {
    if (
      !window.confirm('Reject this consumer request? They will be notified the request was denied.')
    )
      return;
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Consumer Requests</h1>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by API, application, or purpose..."
        hasActiveFilters={Boolean(query)}
        onClear={() => setQuery('')}
        resultLabel={`${filtered.length} of ${pending.length} pending requests`}
      />
      {filtered.length === 0 && (
        <p className="text-slate-500">
          {pending.length === 0
            ? 'No pending consumer requests right now.'
            : 'No requests match your filters.'}
        </p>
      )}
      {filtered.map((sub) => {
        const api = state.apis.find((a) => a.api_id === sub.api_id);
        const app = state.applications.find((a) => a.application_id === sub.application_id);
        return (
          <div key={sub.subscription_id} className="rounded-xl border bg-brand-white p-6 space-y-3">
            <p className="font-semibold">{api?.name}</p>
            <p className="text-sm">Application: {app?.name}</p>
            <p className="text-sm text-slate-600">{sub.purpose}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => accept(sub.subscription_id)}
                disabled={processingId === sub.subscription_id}
                className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm disabled:opacity-50"
              >
                {processingId === sub.subscription_id ? 'Provisioning…' : 'Accept'}
              </button>
              <button
                type="button"
                onClick={() => reject(sub.subscription_id)}
                disabled={processingId === sub.subscription_id}
                className="rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
