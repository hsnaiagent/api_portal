import type { ProviderAccessRequest } from '@/types';

export const initialProviderAccessRequests: ProviderAccessRequest[] = [
  {
    request_id: 'par_001',
    user_id: 'user_developer',
    domain_id: 'dom_hr',
    justification:
      'I lead the HR analytics team and need to publish internal APIs for our leadership dashboard integrations.',
    status: 'approved',
    reviewer_id: 'user_portal_admin',
    reviewer_comment: 'Approved — HR domain publisher access granted.',
    created_at: '2026-06-01T09:00:00Z',
    reviewed_at: '2026-06-02T10:00:00Z',
  },
  {
    request_id: 'par_002',
    user_id: 'user_murad',
    domain_id: 'dom_finance',
    justification:
      'I maintain the finance reporting APIs and need publisher access to manage budget and ledger integrations.',
    status: 'approved',
    reviewer_id: 'user_portal_admin',
    reviewer_comment: 'Approved — Finance domain publisher access granted.',
    created_at: '2026-06-03T09:00:00Z',
    reviewed_at: '2026-06-04T10:00:00Z',
  },
  {
    request_id: 'par_004',
    user_id: 'user_ali',
    domain_id: 'dom_sales',
    justification:
      'I would like to publish sales APIs for our CRM and revenue analytics integrations.',
    status: 'rejected',
    reviewer_id: 'user_portal_admin',
    reviewer_comment: 'Please provide a detailed data-governance plan before publisher access is granted.',
    created_at: '2026-06-20T14:00:00Z',
    reviewed_at: '2026-06-21T10:00:00Z',
  },
];
