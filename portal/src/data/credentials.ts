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
];
