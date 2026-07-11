import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock, Lock } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIBadge } from '@/components/ai/AIBadge';
import { ROUTES } from '@/config/routes';
import { CLASSIFICATIONS } from '@/config/classification';
import { LIFECYCLE_LABELS } from '@/config/lifecycle';
import {
  classificationBadgeVariant,
  lifecycleBadgeVariant,
} from '@/lib/catalog-badges';
import { isBlockingSubscription, isPendingSubscription } from '@/lib/subscriptions';
import type { API, Subscription } from '@/types';
import { cn } from '@/lib/utils';

function SubscriptionPill({ subscription }: { subscription?: Subscription | null }) {
  if (!subscription) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Not subscribed
      </span>
    );
  }

  if (subscription.status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-active-foreground">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Subscribed
      </span>
    );
  }

  if (isPendingSubscription(subscription.status)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-pending-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        Pending approval
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Lock className="size-3.5" aria-hidden="true" />
      Not subscribed
    </span>
  );
}

export function CatalogApiCard({
  api,
  subscription,
  domainName,
  selectable,
  selected,
  onSelect,
  score,
  reason,
}: {
  api: API;
  subscription?: Subscription | null;
  domainName?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  score?: number;
  reason?: string;
}) {
  const alreadySubscribed = subscription ? isBlockingSubscription(subscription.status) : false;

  return (
    <Card
      interactive={!selectable}
      className={cn(
        'group relative h-full',
        selectable && selected && 'border-primary ring-1 ring-primary/30',
        selectable && subscription && 'border-brand/30',
      )}
    >
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{domainName ?? api.domain_id}</Badge>
          <Badge variant={lifecycleBadgeVariant(api.lifecycle_status)} withDot>
            {LIFECYCLE_LABELS[api.lifecycle_status]}
          </Badge>
        </div>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>
            {selectable ? (
              <span>{api.name}</span>
            ) : (
              <Link
                to={ROUTES.consumer.apiDetail(api.api_id)}
                className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {api.name}
              </Link>
            )}
          </CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {score != null && <AIBadge label={`${score}%`} />}
            <span className="font-mono text-xs text-muted-foreground">{api.version}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {api.description}
        </p>
        {reason && (
          <p className="mt-2 text-xs italic text-link">{reason}</p>
        )}
        <div className="mt-4">
          <Badge variant={classificationBadgeVariant(api.classification)}>
            {CLASSIFICATIONS[api.classification].label}
          </Badge>
        </div>
        {selectable && (
          <label
            className={cn(
              'mt-4 flex items-center gap-2 text-sm',
              alreadySubscribed ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer',
            )}
          >
            <input
              type="checkbox"
              checked={selected}
              disabled={alreadySubscribed}
              onChange={() => !alreadySubscribed && onSelect?.(api.api_id)}
              className="rounded border-input disabled:opacity-50"
            />
            {alreadySubscribed ? 'Already subscribed' : 'Select for bundle'}
          </label>
        )}
      </CardContent>
      {!selectable && (
      <CardFooter className="justify-between">
        <SubscriptionPill subscription={subscription} />
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium text-link transition-transform',
            'group-hover:translate-x-0.5',
          )}
          aria-hidden="true"
        >
          View
          <ArrowUpRight className="size-3.5" />
        </span>
      </CardFooter>
      )}
    </Card>
  );
}
