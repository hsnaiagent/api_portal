import type { Subscription, SubscriptionStatus } from '@/types';

const BLOCKING_STATUSES: SubscriptionStatus[] = [
  'pending',
  'workflow_in_progress',
  'workflow_approved',
  'provider_pending',
  'active',
];

// Shared status groupings so dashboards and list pages never drift.
export const PENDING_STATUSES: SubscriptionStatus[] = [
  'pending',
  'workflow_in_progress',
  'workflow_approved',
  'provider_pending',
];

export const REJECTED_STATUSES: SubscriptionStatus[] = ['workflow_rejected', 'revoked', 'expired'];

export function isPendingSubscription(status: SubscriptionStatus): boolean {
  return PENDING_STATUSES.includes(status);
}

export function isRejectedSubscription(status: SubscriptionStatus): boolean {
  return REJECTED_STATUSES.includes(status);
}

export function getDeveloperSubscriptionForApi(
  subscriptions: Subscription[],
  userId: string | undefined,
  apiId: string,
): Subscription | undefined {
  if (!userId) return undefined;
  return subscriptions.find(
    (s) => s.api_id === apiId && s.requested_by_user_id === userId && s.status !== 'revoked',
  );
}

/**
 * Index the current user's (non-revoked) subscriptions by api_id so list views
 * can look up subscription state in O(1) instead of scanning per card.
 */
export function buildUserSubscriptionMap(
  subscriptions: Subscription[],
  userId: string | undefined,
): Map<string, Subscription> {
  const map = new Map<string, Subscription>();
  if (!userId) return map;
  for (const s of subscriptions) {
    if (s.requested_by_user_id === userId && s.status !== 'revoked' && !map.has(s.api_id)) {
      map.set(s.api_id, s);
    }
  }
  return map;
}

export function isBlockingSubscription(status: SubscriptionStatus): boolean {
  return BLOCKING_STATUSES.includes(status);
}

/**
 * Whether a subscription is awaiting a provider's accept/reject decision.
 * Shared by the provider dashboard and the Consumer Requests queue so their
 * pending counts always agree.
 */
export function isProviderActionable(sub: Subscription): boolean {
  return (
    sub.status === 'provider_pending' ||
    sub.status === 'workflow_approved' ||
    (sub.status === 'workflow_in_progress' && sub.provider_status === 'pending')
  );
}
