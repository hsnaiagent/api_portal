import { Link } from 'react-router-dom';
import { AppWindow, ArrowRight, Calendar, KeyRound } from 'lucide-react';

import { ROUTES } from '@/config/routes';
import { ClassificationBadge } from './ClassificationBadge';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { WorkflowTracker } from './WorkflowTracker';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, cn } from '@/lib/utils';
import type { API, Application, Credential, Subscription, SubscriptionStatus } from '@/types';

function accentColor(status: SubscriptionStatus): string {
  if (status === 'active') return 'border-l-status-active';
  if (status === 'workflow_rejected' || status === 'revoked') return 'border-l-destructive';
  if (status === 'expired') return 'border-l-muted-foreground';
  if (status === 'provider_pending') return 'border-l-status-pending';
  return 'border-l-status-pending';
}

function showWorkflow(status: SubscriptionStatus): boolean {
  return status !== 'active';
}

interface SubscriptionCardProps {
  subscription: Subscription;
  api: API;
  application?: Application;
  domainName?: string;
  credential?: Credential;
}

export function SubscriptionCard({
  subscription,
  api,
  application,
  domainName,
  credential,
}: SubscriptionCardProps) {
  const showCreds = credential && subscription.status === 'active';

  return (
    <Card
      className={cn('overflow-hidden border-l-4', accentColor(subscription.status))}
    >
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Link
              to={ROUTES.consumer.apiDetail(api.api_id)}
              className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-link"
            >
              {api.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {domainName} · v{api.version} · Tier {api.gateway_tier}
            </p>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          <ClassificationBadge classification={api.classification} />
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {subscription.purpose}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {application && (
            <span className="inline-flex items-center gap-1.5">
              <AppWindow className="size-3.5 shrink-0" />
              {application.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            Requested {formatDate(subscription.created_at)}
          </span>
          {subscription.approved_at && (
            <span className="inline-flex items-center gap-1.5 text-brand">
              Approved {formatDate(subscription.approved_at)}
            </span>
          )}
        </div>

        {showWorkflow(subscription.status) && (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Approval progress
            </p>
            <WorkflowTracker
              status={subscription.status}
              providerStatus={subscription.provider_status}
            />
          </div>
        )}

        {showCreds && (
          <div className="space-y-2 rounded-lg border border-brand/20 bg-brand-subtle/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-brand">
              <KeyRound className="size-4" />
              API credentials
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="mb-0.5 text-xs text-muted-foreground">Client ID</p>
                <p className="truncate font-mono text-foreground">{credential.client_id}</p>
              </div>
              <div className="rounded-md border border-border bg-card px-3 py-2">
                <p className="mb-0.5 text-xs text-muted-foreground">Client secret</p>
                <p className="font-mono text-foreground">{credential.client_secret_masked}</p>
              </div>
            </div>
          </div>
        )}

        <Link
          to={ROUTES.consumer.apiDetail(api.api_id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors hover:text-link-hover"
        >
          View API details
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
