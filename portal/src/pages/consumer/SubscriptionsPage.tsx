import { Link } from 'react-router-dom';
import { usePortal } from '@/store/AppStore';
import { WorkflowTracker } from '@/components/shared/WorkflowTracker';
import { ROUTES } from '@/config/routes';

export function SubscriptionsPage() {
  const { state } = usePortal();
  const subs = state.subscriptions.filter((s) => s.requested_by_user_id === state.currentUser?.user_id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Subscriptions</h1>
      <div className="space-y-4">
        {subs.map((sub) => {
          const api = state.apis.find((a) => a.api_id === sub.api_id);
          const cred = state.credentials.find((c) => c.subscription_id === sub.subscription_id);
          return (
            <div key={sub.subscription_id} className="rounded-xl border border-slate-200 bg-brand-white p-6 space-y-4">
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <Link to={ROUTES.consumer.apiDetail(sub.api_id)} className="font-semibold text-brand-blue hover:text-brand-blue-dark hover:underline">{api?.name}</Link>
                  <p className="text-sm text-slate-500 mt-1">{sub.purpose}</p>
                </div>
                <span className="text-xs rounded-full bg-slate-100 px-3 py-1 capitalize">{sub.status.replace(/_/g, ' ')}</span>
              </div>
              <WorkflowTracker status={sub.status} providerStatus={sub.provider_status} />
              {cred && sub.status === 'active' && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm font-mono">
                  OAuth2 Client ID: {cred.client_id} · Secret: {cred.client_secret_masked}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
