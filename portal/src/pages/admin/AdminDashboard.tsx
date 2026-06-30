import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { ROUTES } from '@/config/routes';

export function AdminDashboard() {
  const { state } = usePortal();
  const [health, setHealth] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIResponse('AI_13_CatalogHealthSummary', {
      totalApis: state.apis.length,
      publishedApis: state.apis.filter((a) => a.lifecycle_status === 'published').length,
      proposedApis: state.apis.filter((a) => a.lifecycle_status === 'proposed').length,
      deprecatedApis: state.apis.filter((a) => a.lifecycle_status === 'deprecated').length,
      subscriptions: state.subscriptions.length,
      pendingProviderRequests: state.providerAccessRequests.filter((r) => r.status === 'pending').length,
    }).then((r) => {
      setHealth(r?.text);
      setLoading(false);
    });
  }, [state.apis, state.subscriptions, state.providerAccessRequests]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-brand-white p-4"><p className="text-sm text-slate-500">Total APIs</p><p className="text-3xl font-bold">{state.apis.length}</p></div>
        <div className="rounded-xl border bg-brand-white p-4"><p className="text-sm text-slate-500">Subscriptions</p><p className="text-3xl font-bold">{state.subscriptions.length}</p></div>
        <div className="rounded-xl border bg-brand-white p-4"><p className="text-sm text-slate-500">Proposed</p><p className="text-3xl font-bold text-brand-blue">{state.apis.filter((a) => a.lifecycle_status === 'proposed').length}</p></div>
        <div className="rounded-xl border bg-brand-white p-4"><p className="text-sm text-slate-500">Pending provider requests</p><p className="text-3xl font-bold text-orange-500">{state.providerAccessRequests.filter((r) => r.status === 'pending').length}</p></div>
      </div>
      <div className="rounded-xl border border-brand-blue/30 bg-brand-blue-light p-6">
        <h2 className="font-semibold text-brand-dark-gray mb-2">AI Catalog Health Summary (AI-13)</h2>
        <AIThinkingOverlay loading={loading} text={!loading ? health : undefined} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.admin.proposals} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Proposals Queue</Link>
        <Link to={ROUTES.admin.publishing} className="rounded-lg border px-4 py-2 text-sm">Publishing Queue</Link>
        <Link to={ROUTES.admin.allApis} className="rounded-lg border px-4 py-2 text-sm">All APIs</Link>
        <Link to={ROUTES.admin.providerRequests} className="rounded-lg border px-4 py-2 text-sm">Provider Access Requests</Link>
        <Link to={ROUTES.admin.rbac} className="rounded-lg border px-4 py-2 text-sm">RBAC</Link>
        <Link to={ROUTES.admin.domains} className="rounded-lg border px-4 py-2 text-sm">Domain Registry</Link>
        <Link to={ROUTES.admin.audit} className="rounded-lg border px-4 py-2 text-sm">Audit Log</Link>
      </div>
    </div>
  );
}
