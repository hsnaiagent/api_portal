import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { API, Subscription } from '@/types';
import { isBlockingSubscription } from '@/lib/subscriptions';
import { ClassificationBadge } from './ClassificationBadge';
import { LifecycleBadge } from './LifecycleBadge';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { AIBadge } from '@/components/ai/AIBadge';
import { cn } from '@/lib/utils';

export interface ApiCardProps {
  api: API;
  /** The current user's subscription for this API, if any (lifted from the parent to avoid per-card store reads). */
  subscription?: Subscription | null;
  domainName?: string;
  score?: number;
  reason?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export const ApiCard = memo(function ApiCard({
  api,
  subscription,
  domainName,
  score,
  reason,
  selectable,
  selected,
  onSelect,
}: ApiCardProps) {
  const alreadySubscribed = subscription ? isBlockingSubscription(subscription.status) : false;
  const content = (
    <div
      className={cn(
        'rounded-xl border bg-brand-white p-4 hover:shadow-sm transition-all h-full flex flex-col',
        subscription ? 'border-brand-green/30' : 'border-slate-200 hover:border-brand-green/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-800">{api.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{domainName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {subscription && <SubscriptionStatusBadge status={subscription.status} />}
          {score != null && <AIBadge label={`${score}%`} />}
        </div>
      </div>
      <p className="text-sm text-slate-600 mt-2 flex-1 line-clamp-2">{api.description}</p>
      {reason && <p className="text-xs text-brand-blue mt-2 italic">{reason}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        <ClassificationBadge classification={api.classification} />
        <LifecycleBadge status={api.lifecycle_status} />
      </div>
      {selectable && (
        <label
          className={cn(
            'mt-3 flex items-center gap-2 text-sm',
            alreadySubscribed ? 'text-slate-400 cursor-not-allowed' : 'cursor-pointer',
          )}
        >
          <input
            type="checkbox"
            checked={selected}
            disabled={alreadySubscribed}
            onChange={() => !alreadySubscribed && onSelect?.(api.api_id)}
            className="rounded border-slate-300 disabled:opacity-50"
          />
          {alreadySubscribed ? 'Already subscribed' : 'Select for bundle'}
        </label>
      )}
    </div>
  );

  if (selectable) return content;
  return <Link to={ROUTES.consumer.apiDetail(api.api_id)}>{content}</Link>;
});
