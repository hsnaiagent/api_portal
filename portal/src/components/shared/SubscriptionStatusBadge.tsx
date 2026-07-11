import { SUBSCRIPTION_LABELS } from '@/config/subscription';
import { Badge } from '@/components/ui/badge';
import { subscriptionBadgeVariant } from '@/lib/catalog-badges';
import type { SubscriptionStatus } from '@/types';

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <Badge variant={subscriptionBadgeVariant(status)} withDot>
      {SUBSCRIPTION_LABELS[status]}
    </Badge>
  );
}
