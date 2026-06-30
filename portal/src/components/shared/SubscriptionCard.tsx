import { Link } from 'react-router-dom';
import { AppWindow, ArrowRight, Calendar, KeyRound } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { ClassificationBadge } from './ClassificationBadge';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { WorkflowTracker } from './WorkflowTracker';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { API, Application, Credential, Subscription, SubscriptionStatus } from '@/types';

function accentColor(status: SubscriptionStatus): string {
  if (status === 'active') return 'border-l-brand-green';
  if (status === 'workflow_rejected' || status === 'revoked') return 'border-l-red-400';
  if (status === 'expired') return 'border-l-slate-400';
  if (status === 'provider_pending') return 'border-l-orange-400';
  return 'border-l-amber-400';
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
    <article
      className={cn(
        'rounded-xl border border-slate-200 bg-brand-white border-l-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden',
        accentColor(subscription.status),
      )}
    >
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <Link
              to={ROUTES.consumer.apiDetail(api.api_id)}
              className="font-semibold text-slate-900 hover:text-brand-blue transition-colors line-clamp-1"
            >
              {api.name}
            </Link>
            <p className="text-xs text-slate-500">
              {domainName} · v{api.version} · Tier {api.gateway_tier}
            </p>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          <ClassificationBadge classification={api.classification} />
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
          {subscription.purpose}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          {application && (
            <span className="inline-flex items-center gap-1.5">
              <AppWindow className="h-3.5 w-3.5 shrink-0" />
              {application.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Requested {formatDate(subscription.created_at)}
          </span>
          {subscription.approved_at && (
            <span className="inline-flex items-center gap-1.5 text-brand-green">
              Approved {formatDate(subscription.approved_at)}
            </span>
          )}
        </div>

        {showWorkflow(subscription.status) && (
          <div className="rounded-lg bg-slate-50/80 border border-slate-100 px-4 py-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
              Approval progress
            </p>
            <WorkflowTracker
              status={subscription.status}
              providerStatus={subscription.provider_status}
            />
          </div>
        )}

        {showCreds && (
          <div className="rounded-lg border border-brand-green/20 bg-brand-green-light/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-green">
              <KeyRound className="h-4 w-4" />
              API credentials
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-brand-white/80 border border-slate-100 px-3 py-2">
                <p className="text-xs text-slate-500 mb-0.5">Client ID</p>
                <p className="font-mono text-slate-800 truncate">{credential.client_id}</p>
              </div>
              <div className="rounded-md bg-brand-white/80 border border-slate-100 px-3 py-2">
                <p className="text-xs text-slate-500 mb-0.5">Client secret</p>
                <p className="font-mono text-slate-800">{credential.client_secret_masked}</p>
              </div>
            </div>
          </div>
        )}

        <Link
          to={ROUTES.consumer.apiDetail(api.api_id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:text-brand-blue-dark transition-colors"
        >
          View API details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
