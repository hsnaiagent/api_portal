import type { SubscriptionStatus } from '@/types';



export const SUBSCRIPTION_LABELS: Record<SubscriptionStatus, string> = {

  pending: 'Pending',

  workflow_in_progress: 'Approval in progress',

  workflow_approved: 'Workflow approved',

  workflow_rejected: 'Rejected',

  provider_pending: 'Pending provider',

  active: 'Subscribed',

  revoked: 'Revoked',

  expired: 'Expired',

};



export const SUBSCRIPTION_COLORS: Record<SubscriptionStatus, string> = {

  pending: 'bg-yellow-100 text-yellow-800',

  workflow_in_progress: 'bg-yellow-100 text-yellow-800',

  workflow_approved: 'bg-brand-blue-light text-brand-blue-dark',

  workflow_rejected: 'bg-red-100 text-red-700',

  provider_pending: 'bg-orange-100 text-orange-700',

  active: 'bg-brand-green-light text-brand-green',

  revoked: 'bg-slate-100 text-slate-500',

  expired: 'bg-slate-100 text-slate-600',

};
