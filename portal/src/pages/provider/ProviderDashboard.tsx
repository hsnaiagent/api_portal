import { Link } from 'react-router-dom';

import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { getManagedApis } from '@/lib/roles';
import { isProviderActionable } from '@/lib/subscriptions';
import { buttonVariants } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';

export function ProviderDashboard() {
  const { state } = usePortal();

  const myApis = getManagedApis(state.apis, state.currentUser, state.activeRole);
  const myApiIds = new Set(myApis.map((a) => a.api_id));
  const pending = state.subscriptions.filter(
    (s) => myApiIds.has(s.api_id) && isProviderActionable(s),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your APIs and review consumer access requests
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="My APIs" value={myApis.length} />
        <StatCard
          label="Published"
          value={myApis.filter((a) => a.lifecycle_status === 'published').length}
          valueClassName="text-brand"
        />
        <StatCard
          label="Pending consumer approvals"
          value={pending.length}
          valueClassName="text-link"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.provider.register} className={buttonVariants({ variant: 'primary' })}>
          Register New API
        </Link>
        <Link to={ROUTES.provider.requests} className={buttonVariants({ variant: 'secondary' })}>
          Consumer Requests ({pending.length})
        </Link>
      </div>
    </div>
  );
}
