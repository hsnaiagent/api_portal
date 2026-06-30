import type { Credential } from '@/types';

export const initialCredentials: Credential[] = [
  {
    credential_id: 'cred_001',
    subscription_id: 'sub_001',
    application_id: 'app_hr_dashboard',
    type: 'oauth2_client',
    client_id: 'client_hr_dashboard_001',
    client_secret_masked: 'sec••••••••7890',
    status: 'active',
  },
  {
    credential_id: 'cred_002',
    subscription_id: 'sub_004',
    application_id: 'app_hr_dashboard',
    type: 'oauth2_client',
    client_id: 'client_hr_dashboard_llm',
    client_secret_masked: 'sec••••••••4521',
    status: 'active',
  },
  {
    credential_id: 'cred_003',
    subscription_id: 'sub_007',
    application_id: 'app_fin_forecast',
    type: 'oauth2_client',
    client_id: 'client_fin_forecast_org',
    client_secret_masked: 'sec••••••••3312',
    status: 'active',
  },
  {
    credential_id: 'cred_004',
    subscription_id: 'sub_008',
    application_id: 'app_sales_insights',
    type: 'oauth2_client',
    client_id: 'client_sales_insights_fx',
    client_secret_masked: 'sec••••••••8841',
    status: 'active',
  },
  {
    credential_id: 'cred_005',
    subscription_id: 'sub_010',
    application_id: 'app_ops_monitor',
    type: 'oauth2_client',
    client_id: 'client_ops_monitor_prod',
    client_secret_masked: 'sec••••••••1190',
    status: 'active',
  },
];
