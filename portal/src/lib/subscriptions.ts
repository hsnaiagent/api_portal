import type { Subscription, SubscriptionStatus } from '@/types';



const BLOCKING_STATUSES: SubscriptionStatus[] = [

  'pending',

  'workflow_in_progress',

  'workflow_approved',

  'provider_pending',

  'active',

];



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



export function isBlockingSubscription(status: SubscriptionStatus): boolean {

  return BLOCKING_STATUSES.includes(status);

}
