export type Classification = 'restricted' | 'confidential' | 'internal' | 'public';

export type LifecycleStatus =
  | 'draft'
  | 'proposed'
  | 'under_review'
  | 'approved'
  | 'in_development'
  | 'in_testing'
  | 'published'
  | 'deprecated'
  | 'retired'
  | 'rejected'
  | 'emergency_retired';

export type PortalRole = 'developer' | 'llm_admin' | 'portal_admin';

export type GatewayTier = 1 | 2 | 3;

export type SubscriptionStatus =
  | 'pending'
  | 'workflow_in_progress'
  | 'workflow_approved'
  | 'workflow_rejected'
  | 'provider_pending'
  | 'active'
  | 'revoked'
  | 'expired';

export type ProviderStatus = 'pending' | 'accepted' | 'rejected';

export type WorkflowStatus =
  'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export type SDKLanguage =
  | 'curl'
  | 'python'
  | 'nodejs'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'go';

export type PrecomputedSdkLanguage = 'curl' | 'python' | 'nodejs';

export type OnDemandSdkLanguage = 'javascript' | 'typescript' | 'java' | 'go';

export type ProviderAccessStatus = 'pending' | 'approved' | 'rejected';

export type LLMRequestStatus = 'pending' | 'approved' | 'rejected';

export interface Domain {
  domain_id: string;

  name: string;

  code: string;

  description: string;
}

export interface Team {
  team_id: string;

  domain_id: string;

  name: string;

  description?: string;
}

export interface User {
  user_id: string;

  email: string;

  display_name: string;

  portal_roles: PortalRole[];

  team_ids: string[];

  domain_id: string;

  provider_domains: string[];
}

export interface Application {
  application_id: string;

  team_id: string;

  name: string;

  description?: string;

  application_description?: string;

  owner_user_id: string;

  environment: 'sandbox' | 'production';

  status: 'active' | 'suspended' | 'deleted';
}

export interface OpenAPIEndpoint {
  method: string;

  path: string;

  summary: string;

  parameters?: { name: string; in: string; required?: boolean; type: string }[];

  requestBody?: object;

  responseExample?: object;
}

export interface ApiSearchIndex {
  fluctuations: string[];

  synonyms: string[];

  business_terms: string[];

  related_api_ids: string[];

  generated_at: string;

  model: string;
}

export interface LlmConfig {
  model?: string;

  rate_limit_per_min?: number;

  monthly_token_budget?: number;
}

export interface ApiSdkArtifacts {
  curl: string;

  python: string;

  nodejs: string;

  generated_at: string;

  model: string;

  approved_at: string;

  approved_by_user_id: string;
}

export interface API {
  api_id: string;

  domain_id: string;

  name: string;

  slug: string;

  description: string;

  classification: Classification;

  lifecycle_status: LifecycleStatus;

  owner_user_id: string;

  data_owner_user_id?: string;

  gateway_tier: GatewayTier;

  tags: string[];

  version: string;

  endpoints: OpenAPIEndpoint[];

  openapi_spec_content?: Record<string, unknown>;

  sdk_artifacts?: ApiSdkArtifacts;

  search_index?: ApiSearchIndex;

  llm_config?: LlmConfig;
}

export interface Subscription {
  subscription_id: string;

  api_id: string;

  application_id: string;

  requested_by_user_id: string;

  purpose: string;

  min_api_version: string;

  status: SubscriptionStatus;

  provider_status: ProviderStatus;

  workflow_instance_id?: string;

  approved_at?: string;

  created_at: string;
}

export interface ProviderAccessRequest {
  request_id: string;

  user_id: string;

  domain_id: string;

  justification: string;

  status: ProviderAccessStatus;

  reviewer_id?: string;

  reviewer_comment?: string;

  created_at: string;

  reviewed_at?: string;
}

export interface LLMSubscriptionRequest {
  llm_request_id: string;

  subscription_id: string;

  api_id: string;

  requested_by_user_id: string;

  application_id: string;

  use_case_name: string;

  estimated_value: string;

  admin_area: string;

  deployment_date: string;

  task_description: string;

  frequency_before: number;

  frequency_after: number;

  time_before_minutes: number;

  time_after_minutes: number;

  expected_users: number;

  contact: string;

  status: LLMRequestStatus;

  reviewer_id?: string;

  reviewer_comment?: string;

  created_at: string;

  reviewed_at?: string;
}

export interface WorkflowApprover {
  user_id: string;

  role: string;

  decision?: 'approved' | 'rejected' | 'pending';

  decided_at?: string;

  comment?: string;
}

export interface WorkflowInstance {
  workflow_instance_id: string;

  external_workflow_id?: string;

  correlation_id: string;

  workflow_template_id: string;

  subscription_id?: string;

  api_id?: string;

  status: WorkflowStatus;

  approvers: WorkflowApprover[];

  triggered_at: string;

  completed_at?: string;
}

export interface Credential {
  credential_id: string;

  subscription_id: string;

  application_id: string;

  type: 'oauth2_client';

  client_id: string;

  client_secret_masked: string;

  status: 'active' | 'rotated' | 'revoked';
}

export interface AuditLog {
  audit_id: string;

  timestamp: string;

  actor_user_id?: string;

  actor_type: 'user' | 'system' | 'webhook';

  action: string;

  entity_type: string;

  entity_id: string;

  payload?: Record<string, unknown>;
}

export interface Notification {
  id: string;

  title: string;

  message: string;

  type: 'info' | 'success' | 'warning' | 'error';

  created_at: string;

  read: boolean;
}

export interface AIResponse {
  text?: string;

  items?: { id: string; label: string; score?: number; reason?: string }[];

  classification?: Classification;

  tags?: string[];

  checklist?: { item: string; passed: boolean }[];

  code?: string;

  links?: { label: string; path: string }[];
}

export interface CatalogFilters {
  query: string;

  domainFilter: string;

  classFilter: string;

  aiContext?: string;
}

export interface PortalState {
  currentUser: User | null;

  activeRole: PortalRole | null;

  users: User[];

  domains: Domain[];

  apis: API[];

  subscriptions: Subscription[];

  applications: Application[];

  workflows: WorkflowInstance[];

  credentials: Credential[];

  auditLogs: AuditLog[];

  notifications: Notification[];

  providerAccessRequests: ProviderAccessRequest[];

  llmSubscriptionRequests: LLMSubscriptionRequest[];

  plannerDescription: string;

  plannerSelectedApiIds: string[];

  catalogFilters: CatalogFilters;
}

export type LLMSubscriptionFormData = Omit<
  LLMSubscriptionRequest,
  | 'llm_request_id'
  | 'subscription_id'
  | 'api_id'
  | 'requested_by_user_id'
  | 'application_id'
  | 'status'
  | 'reviewer_id'
  | 'reviewer_comment'
  | 'created_at'
  | 'reviewed_at'
>;
