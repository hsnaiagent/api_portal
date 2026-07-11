import { Link } from 'react-router-dom';
import { Sparkles, FileKey } from 'lucide-react';

import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { isPendingSubscription } from '@/lib/subscriptions';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';

export function ConsumerDashboard() {
  const { state } = usePortal();
  const mySubs = state.subscriptions.filter(
    (s) => s.requested_by_user_id === state.currentUser?.user_id,
  );
  const active = mySubs.filter((s) => s.status === 'active').length;
  const pending = mySubs.filter((s) => isPendingSubscription(s.status)).length;
  const appCount = state.applications.filter(
    (a) => a.owner_user_id === state.currentUser?.user_id,
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {state.currentUser?.display_name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover and consume enterprise APIs with AI assistance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active subscriptions" value={active} valueClassName="text-brand" />
        <StatCard label="Pending approvals" value={pending} valueClassName="text-link" />
        <StatCard label="Applications" value={appCount} />
      </div>

      <Link to={ROUTES.consumer.planner} className="block">
        <Card
          interactive
          className="border-2 border-dashed border-link/30 bg-link-subtle/30 hover:border-link/50"
        >
          <CardContent className="flex items-center gap-3 p-6">
            <Sparkles className="size-8 shrink-0 text-link" />
            <div>
              <h2 className="font-semibold text-foreground">AI Application Planner</h2>
              <p className="text-sm text-muted-foreground">
                Describe your application — get a ranked bundle of APIs matched to your needs
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link
        to={ROUTES.consumer.subscriptions}
        className={buttonVariants({ variant: 'link', size: 'sm' })}
      >
        <FileKey className="size-4" />
        View all subscriptions
      </Link>
    </div>
  );
}
