import { usePortal } from '@/store/AppStore';

import { getManagedApis } from '@/lib/roles';

import { provisionSubscription } from '@/mocks/GatewayAdapter';

import { useNotify } from '@/hooks/useNotify';



export function ConsumerRequestsPage() {

  const { state, dispatch } = usePortal();

  const notify = useNotify();

  const myApis = getManagedApis(state.apis, state.currentUser, state.activeRole);

  const myApiIds = myApis.map((a) => a.api_id);

  const pending = state.subscriptions.filter(

    (s) => myApiIds.includes(s.api_id) && (s.status === 'provider_pending' || s.status === 'workflow_approved' || (s.status === 'workflow_in_progress' && s.provider_status === 'pending')),

  );



  const accept = async (subId: string) => {

    const sub = state.subscriptions.find((s) => s.subscription_id === subId)!;

    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: { subscription_id: subId, patch: { status: 'active', provider_status: 'accepted', approved_at: new Date().toISOString() } } });

    await provisionSubscription(sub);

    notify('Consumer accepted', 'Credentials provisioned via gateway', 'success');

  };



  const reject = (subId: string) => {

    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: { subscription_id: subId, patch: { status: 'revoked', provider_status: 'rejected' } } });

    notify('Consumer rejected', 'Subscription request denied', 'warning');

  };



  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Consumer Requests</h1>

      {pending.length === 0 && <p className="text-slate-500">No pending requests</p>}

      {pending.map((sub) => {

        const api = state.apis.find((a) => a.api_id === sub.api_id);

        const app = state.applications.find((a) => a.application_id === sub.application_id);

        return (

          <div key={sub.subscription_id} className="rounded-xl border bg-brand-white p-6 space-y-3">

            <p className="font-semibold">{api?.name}</p>

            <p className="text-sm">Application: {app?.name}</p>

            <p className="text-sm text-slate-600">{sub.purpose}</p>

            <div className="flex gap-2">

              <button type="button" onClick={() => accept(sub.subscription_id)} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Accept</button>

              <button type="button" onClick={() => reject(sub.subscription_id)} className="rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm">Reject</button>

            </div>

          </div>

        );

      })}

    </div>

  );

}


