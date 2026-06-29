import type { LLMSubscriptionRequest } from '@/types';



export const initialLLMSubscriptionRequests: LLMSubscriptionRequest[] = [

  {

    llm_request_id: 'llm_req_001',

    subscription_id: 'sub_004',

    api_id: 'api_ai_llm',

    requested_by_user_id: 'user_developer',

    application_id: 'app_hr_dashboard',

    use_case_name: 'HR Report Narrative Generator',

    estimated_value: 'SAR 120,000/year',

    admin_area: 'Human Resources',

    deployment_date: '2026-07-01',

    task_description: 'Generate executive narrative summaries from monthly HR statistics reports.',

    frequency_before: 4,

    frequency_after: 4,

    time_before_minutes: 120,

    time_after_minutes: 15,

    expected_users: 8,

    contact: 'ahmad.alrashidi@example.com',

    status: 'approved',

    reviewer_id: 'user_llm_admin',

    reviewer_comment: 'Strong ROI case — approved for production use.',

    created_at: '2026-06-08T08:00:00Z',

    reviewed_at: '2026-06-09T11:00:00Z',

  },

  {

    llm_request_id: 'llm_req_002',

    subscription_id: 'sub_006',

    api_id: 'api_ai_rag',

    requested_by_user_id: 'user_developer',

    application_id: 'app_hr_dashboard',

    use_case_name: 'Policy Document Q&A Assistant',

    estimated_value: 'SAR 85,000/year',

    admin_area: 'Human Resources',

    deployment_date: '2026-08-15',

    task_description: 'Answer HR policy questions using retrieval-augmented generation over internal policy corpus.',

    frequency_before: 20,

    frequency_after: 20,

    time_before_minutes: 45,

    time_after_minutes: 5,

    expected_users: 25,

    contact: 'ahmad.alrashidi@example.com',

    status: 'pending',

    created_at: '2026-06-26T10:00:00Z',

  },

];


