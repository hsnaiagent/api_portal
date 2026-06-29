import type { Subscription } from '@/types';



export const initialSubscriptions: Subscription[] = [

  {

    subscription_id: 'sub_001',

    api_id: 'api_hr_directory',

    application_id: 'app_hr_dashboard',

    requested_by_user_id: 'user_developer',

    purpose: 'Display org chart on leadership dashboard',

    min_api_version: '1.0.0',

    status: 'active',

    provider_status: 'accepted',

    approved_at: '2026-06-01T10:00:00Z',

    created_at: '2026-05-28T09:00:00Z',

  },

  {

    subscription_id: 'sub_002',

    api_id: 'api_hr_salary',

    application_id: 'app_hr_dashboard',

    requested_by_user_id: 'user_developer',

    purpose: 'Monthly salary statistics for HR leadership reporting',

    min_api_version: '1.0.0',

    status: 'workflow_in_progress',

    provider_status: 'pending',

    workflow_instance_id: 'wf_001',

    created_at: '2026-06-20T14:00:00Z',

  },

  {

    subscription_id: 'sub_003',

    api_id: 'api_fin_budget',

    application_id: 'app_fin_forecast',

    requested_by_user_id: 'user_developer',

    purpose: 'Quarterly budget vs actual forecasting',

    min_api_version: '1.0.0',

    status: 'provider_pending',

    provider_status: 'pending',

    workflow_instance_id: 'wf_002',

    created_at: '2026-06-22T11:00:00Z',

  },

  {

    subscription_id: 'sub_004',

    api_id: 'api_ai_llm',

    application_id: 'app_hr_dashboard',

    requested_by_user_id: 'user_developer',

    purpose: 'Generate narrative summaries for HR reports',

    min_api_version: '1.0.0',

    status: 'active',

    provider_status: 'accepted',

    approved_at: '2026-06-10T08:00:00Z',

    created_at: '2026-06-08T08:00:00Z',

  },

  {

    subscription_id: 'sub_005',

    api_id: 'api_sales_crm',

    application_id: 'app_sales_insights',

    requested_by_user_id: 'user_developer',

    purpose: 'CRM customer data for sales analytics',

    min_api_version: '1.0.0',

    status: 'workflow_rejected',

    provider_status: 'rejected',

    workflow_instance_id: 'wf_003',

    created_at: '2026-06-15T16:00:00Z',

  },

  {

    subscription_id: 'sub_006',

    api_id: 'api_ai_rag',

    application_id: 'app_hr_dashboard',

    requested_by_user_id: 'user_developer',

    purpose: 'Policy document Q&A using RAG over HR policy corpus',

    min_api_version: '1.0.0',

    status: 'provider_pending',

    provider_status: 'pending',

    created_at: '2026-06-26T10:00:00Z',

  },

];


