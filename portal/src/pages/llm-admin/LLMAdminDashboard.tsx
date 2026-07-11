import { Link } from 'react-router-dom';

import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { buttonVariants } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';

export function LLMAdminDashboard() {
  const { state } = usePortal();

  const llmApis = state.apis.filter((a) => a.domain_id === 'dom_ai');
  const pendingRequests = state.llmSubscriptionRequests.filter((r) => r.status === 'pending');
  const approvedRequests = state.llmSubscriptionRequests.filter((r) => r.status === 'approved');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">LLM & AI Platform Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage LLM APIs and review ROI-justified access requests
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Published LLM APIs"
          value={llmApis.filter((a) => a.lifecycle_status === 'published').length}
          valueClassName="text-brand"
        />
        <StatCard
          label="Pending access requests"
          value={pendingRequests.length}
          valueClassName="text-link"
        />
        <StatCard label="Approved use cases" value={approvedRequests.length} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.llmAdmin.myApis} className={buttonVariants({ variant: 'primary' })}>
          Manage LLM APIs
        </Link>
        <Link to={ROUTES.llmAdmin.accessRequests} className={buttonVariants({ variant: 'secondary' })}>
          Review Access Requests ({pendingRequests.length})
        </Link>
        <Link to={ROUTES.llmAdmin.register} className={buttonVariants({ variant: 'secondary' })}>
          Register LLM API
        </Link>
      </div>
    </div>
  );
}
