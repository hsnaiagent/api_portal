import type { Classification, LifecycleStatus, SubscriptionStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/badge';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export function classificationBadgeVariant(classification: Classification): BadgeVariant {
  const map: Record<Classification, BadgeVariant> = {
    public: 'info',
    internal: 'neutral',
    confidential: 'outline',
    restricted: 'brand',
  };
  return map[classification];
}

export function lifecycleBadgeVariant(status: LifecycleStatus): BadgeVariant {
  if (status === 'published') return 'active';
  if (status === 'deprecated' || status === 'retired' || status === 'emergency_retired')
    return 'deprecated';
  if (
    status === 'proposed' ||
    status === 'under_review' ||
    status === 'in_development' ||
    status === 'in_testing'
  )
    return 'pending';
  if (status === 'rejected') return 'rejected';
  return 'neutral';
}

export function subscriptionBadgeVariant(status: SubscriptionStatus): BadgeVariant {
  if (status === 'active') return 'active';
  if (status === 'workflow_rejected' || status === 'revoked') return 'rejected';
  if (status === 'expired') return 'deprecated';
  if (status === 'workflow_approved') return 'info';
  if (
    status === 'pending' ||
    status === 'workflow_in_progress' ||
    status === 'provider_pending'
  ) {
    return 'pending';
  }
  return 'neutral';
}

export function llmRequestBadgeVariant(
  status: 'pending' | 'approved' | 'rejected',
): BadgeVariant {
  if (status === 'approved') return 'active';
  if (status === 'rejected') return 'rejected';
  return 'pending';
}

export function providerAccessBadgeVariant(
  status: 'pending' | 'approved' | 'rejected',
): BadgeVariant {
  if (status === 'approved') return 'active';
  if (status === 'rejected') return 'rejected';
  return 'pending';
}
