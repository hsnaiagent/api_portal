import type { LifecycleStatus, PortalRole } from '@/types';

export const LIFECYCLE_LABELS: Record<LifecycleStatus, string> = {
  draft: 'Draft',

  proposed: 'Proposed',

  under_review: 'Under Review',

  approved: 'Approved',

  in_development: 'In Development',

  in_testing: 'In Testing',

  published: 'Published',

  deprecated: 'Deprecated',

  retired: 'Retired',

  rejected: 'Rejected',

  emergency_retired: 'Emergency Retired',
};

export const LIFECYCLE_COLORS: Record<LifecycleStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',

  proposed: 'bg-brand-blue-light text-brand-blue-dark',

  under_review: 'bg-yellow-100 text-yellow-800',

  approved: 'bg-brand-green-light text-brand-green',

  in_development: 'bg-brand-blue-light text-brand-blue-dark',

  in_testing: 'bg-brand-blue-light text-brand-blue',

  published: 'bg-brand-green-light text-brand-green',

  deprecated: 'bg-orange-100 text-orange-700',

  retired: 'bg-slate-100 text-slate-500',

  rejected: 'bg-red-100 text-red-700',

  emergency_retired: 'bg-red-200 text-red-900',
};

export interface LifecycleTransition {
  next: LifecycleStatus[];

  allowedRoles: PortalRole[];
}

export const LIFECYCLE_TRANSITIONS: Partial<Record<LifecycleStatus, LifecycleTransition>> = {
  draft: { next: ['proposed'], allowedRoles: ['developer', 'llm_admin', 'portal_admin'] },

  proposed: { next: ['under_review', 'rejected'], allowedRoles: ['portal_admin'] },

  under_review: { next: ['approved', 'rejected'], allowedRoles: ['portal_admin', 'llm_admin'] },

  approved: { next: ['in_development'], allowedRoles: ['developer', 'llm_admin', 'portal_admin'] },

  in_development: {
    next: ['in_testing'],
    allowedRoles: ['developer', 'llm_admin', 'portal_admin'],
  },

  in_testing: {
    next: ['published', 'in_development'],
    allowedRoles: ['llm_admin', 'portal_admin'],
  },

  published: {
    next: ['deprecated', 'emergency_retired'],
    allowedRoles: ['developer', 'llm_admin', 'portal_admin'],
  },

  deprecated: { next: ['retired'], allowedRoles: ['developer', 'llm_admin', 'portal_admin'] },

  rejected: { next: ['draft'], allowedRoles: ['developer', 'llm_admin', 'portal_admin'] },
};
