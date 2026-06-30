import { Link } from 'react-router-dom';

import { ROUTES } from '@/config/routes';

import { usePortal } from '@/store/AppStore';

export function LLMAdminDashboard() {
  const { state } = usePortal();

  const llmApis = state.apis.filter((a) => a.domain_id === 'dom_ai');

  const pendingRequests = state.llmSubscriptionRequests.filter((r) => r.status === 'pending');

  const approvedRequests = state.llmSubscriptionRequests.filter((r) => r.status === 'approved');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">LLM & AI Platform Admin</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-brand-white p-4">
          <p className="text-sm text-slate-500">Published LLM APIs</p>

          <p className="text-3xl font-bold text-brand-green">
            {llmApis.filter((a) => a.lifecycle_status === 'published').length}
          </p>
        </div>

        <div className="rounded-xl border bg-brand-white p-4">
          <p className="text-sm text-slate-500">Pending access requests</p>

          <p className="text-3xl font-bold text-brand-blue">{pendingRequests.length}</p>
        </div>

        <div className="rounded-xl border bg-brand-white p-4">
          <p className="text-sm text-slate-500">Approved use cases</p>

          <p className="text-3xl font-bold">{approvedRequests.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to={ROUTES.llmAdmin.myApis}
          className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm"
        >
          Manage LLM APIs
        </Link>

        <Link to={ROUTES.llmAdmin.accessRequests} className="rounded-lg border px-4 py-2 text-sm">
          Review Access Requests ({pendingRequests.length})
        </Link>

        <Link to={ROUTES.llmAdmin.register} className="rounded-lg border px-4 py-2 text-sm">
          Register LLM API
        </Link>
      </div>
    </div>
  );
}
