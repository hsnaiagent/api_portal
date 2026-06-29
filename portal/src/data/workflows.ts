import type { WorkflowInstance } from '@/types';



export const initialWorkflows: WorkflowInstance[] = [

  {

    workflow_instance_id: 'wf_001',

    external_workflow_id: 'ext_wf_001',

    correlation_id: 'sub_002',

    workflow_template_id: 'api-access-confidential',

    subscription_id: 'sub_002',

    api_id: 'api_hr_salary',

    status: 'in_progress',

    approvers: [

      { user_id: 'user_developer', role: 'data_owner', decision: 'pending' },

    ],

    triggered_at: '2026-06-20T14:05:00Z',

  },

  {

    workflow_instance_id: 'wf_002',

    external_workflow_id: 'ext_wf_002',

    correlation_id: 'sub_003',

    workflow_template_id: 'api-access-confidential',

    subscription_id: 'sub_003',

    api_id: 'api_fin_budget',

    status: 'approved',

    approvers: [

      { user_id: 'user_developer', role: 'data_owner', decision: 'approved', decided_at: '2026-06-23T09:00:00Z', comment: 'Approved for forecasting use' },

    ],

    triggered_at: '2026-06-22T11:05:00Z',

    completed_at: '2026-06-23T09:00:00Z',

  },

  {

    workflow_instance_id: 'wf_003',

    external_workflow_id: 'ext_wf_003',

    correlation_id: 'sub_005',

    workflow_template_id: 'api-access-internal',

    subscription_id: 'sub_005',

    api_id: 'api_sales_crm',

    status: 'rejected',

    approvers: [

      { user_id: 'user_developer', role: 'team_lead', decision: 'rejected', decided_at: '2026-06-16T10:00:00Z', comment: 'Purpose not aligned with team policy' },

    ],

    triggered_at: '2026-06-15T16:05:00Z',

    completed_at: '2026-06-16T10:00:00Z',

  },

];


