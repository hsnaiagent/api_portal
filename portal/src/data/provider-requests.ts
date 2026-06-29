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

    user_id: 'user_developer',

    domain_id: 'dom_ops',

    justification:

      'Expanding our production metrics integration to Operations APIs for plant-level dashboards.',

    status: 'pending',

    created_at: '2026-06-25T14:00:00Z',

  },

];


