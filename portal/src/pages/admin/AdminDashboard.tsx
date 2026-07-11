import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AIThinkingOverlay } from '@/components/ai/AIThinkingOverlay';
import { ROUTES } from '@/config/routes';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';

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
      pendingProviderRequests: state.providerAccessRequests.filter((r) => r.status === 'pending')
        .length,
    }).then((r) => {
      setHealth(r?.text);
      setLoading(false);
    });
  }, [state.apis, state.subscriptions, state.providerAccessRequests]);

  const proposedCount = state.apis.filter((a) => a.lifecycle_status === 'proposed').length;
  const pendingProviderCount = state.providerAccessRequests.filter(
    (r) => r.status === 'pending',
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Portal-wide catalog health, queues, and governance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total APIs" value={state.apis.length} />
        <StatCard label="Subscriptions" value={state.subscriptions.length} />
        <StatCard label="Proposed" value={proposedCount} valueClassName="text-link" />
        <StatCard
          label="Pending provider requests"
          value={pendingProviderCount}
          valueClassName="text-link"
        />
      </div>

      <Card className="border-link/30 bg-link-subtle/30">
        <CardHeader>
          <CardTitle className="text-base">AI Catalog Health Summary (AI-13)</CardTitle>
        </CardHeader>
        <CardContent>
          <AIThinkingOverlay loading={loading} text={!loading ? health : undefined} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.admin.proposals} className={buttonVariants({ variant: 'primary' })}>
          Proposals Queue
        </Link>
        <Link to={ROUTES.admin.publishing} className={buttonVariants({ variant: 'secondary' })}>
          Publishing Queue
        </Link>
        <Link to={ROUTES.admin.allApis} className={buttonVariants({ variant: 'secondary' })}>
          All APIs
        </Link>
        <Link to={ROUTES.admin.providerRequests} className={buttonVariants({ variant: 'secondary' })}>
          Provider Access Requests
        </Link>
        <Link to={ROUTES.admin.rbac} className={buttonVariants({ variant: 'secondary' })}>
          RBAC
        </Link>
        <Link to={ROUTES.admin.domains} className={buttonVariants({ variant: 'secondary' })}>
          Domain Registry
        </Link>
        <Link to={ROUTES.admin.audit} className={buttonVariants({ variant: 'secondary' })}>
          Audit Log
        </Link>
      </div>
    </div>
  );
}
