import type {

  API,

  Application,

  AuditLog,

  Credential,

  LLMSubscriptionRequest,

  Notification,

  PortalRole,

  ProviderAccessRequest,

  Subscription,

  User,

  WorkflowInstance,

} from '@/types';



export type PortalAction =

  | {

      type: 'INIT_DATA';

      payload: {

        apis: API[];

        subscriptions: Subscription[];

        applications: Application[];

        workflows: WorkflowInstance[];

        credentials: Credential[];

        auditLogs: AuditLog[];

        providerAccessRequests: ProviderAccessRequest[];

        llmSubscriptionRequests: LLMSubscriptionRequest[];

      };

    }

  | { type: 'LOGIN'; payload: { user: User; role: PortalRole } }

  | { type: 'LOGOUT' }

  | { type: 'SET_ROLE'; payload: PortalRole }

  | { type: 'ADD_NOTIFICATION'; payload: Notification }

  | { type: 'MARK_NOTIFICATION_READ'; payload: string }

  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }

  | { type: 'UPDATE_SUBSCRIPTION'; payload: { subscription_id: string; patch: Partial<Subscription> } }

  | { type: 'ADD_APPLICATION'; payload: Application }

  | { type: 'UPDATE_APPLICATION'; payload: { application_id: string; patch: Partial<Application> } }

  | { type: 'ADD_API'; payload: API }

  | { type: 'UPDATE_API'; payload: { api_id: string; patch: Partial<API> } }

  | { type: 'ADD_WORKFLOW'; payload: WorkflowInstance }

  | { type: 'UPDATE_WORKFLOW'; payload: { workflow_instance_id: string; patch: Partial<WorkflowInstance> } }

  | { type: 'ADD_CREDENTIAL'; payload: Credential }

  | { type: 'ADD_AUDIT'; payload: AuditLog }

  | { type: 'ADD_PROVIDER_REQUEST'; payload: ProviderAccessRequest }

  | { type: 'UPDATE_PROVIDER_REQUEST'; payload: { request_id: string; patch: Partial<ProviderAccessRequest> } }

  | { type: 'GRANT_PROVIDER_DOMAIN'; payload: { user_id: string; domain_id: string } }

  | { type: 'ADD_LLM_REQUEST'; payload: LLMSubscriptionRequest }

  | { type: 'UPDATE_LLM_REQUEST'; payload: { llm_request_id: string; patch: Partial<LLMSubscriptionRequest> } }

  | { type: 'SET_PLANNER'; payload: { description: string; selected?: string[] } }

  | { type: 'SET_PLANNER_SELECTION'; payload: string[] };


