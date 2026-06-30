import { SUBSCRIPTION_COLORS, SUBSCRIPTION_LABELS } from '@/config/subscription';

import type { SubscriptionStatus } from '@/types';

import { cn } from '@/lib/utils';

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        SUBSCRIPTION_COLORS[status],
      )}
    >
      {SUBSCRIPTION_LABELS[status]}
    </span>
  );
}
