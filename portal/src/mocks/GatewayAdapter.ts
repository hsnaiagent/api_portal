import type { Subscription } from '@/types';
import { delay } from '@/lib/utils';

export async function provisionSubscription(subscription: Subscription) {
  await delay(600);
  return {
    gateway_subscription_id: `gw_${subscription.subscription_id}`,
    status: 'active',
    client_id: `client_${subscription.application_id.slice(-8)}`,
  };
}

export async function revokeSubscription(subscriptionId: string) {
  await delay(400);
  return { subscription_id: subscriptionId, status: 'revoked' };
}
