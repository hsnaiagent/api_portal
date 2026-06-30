import type { AuditLog } from '@/types';



const now = new Date();

const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();



export const initialAuditLogs: AuditLog[] = [

  { audit_id: 'aud_001', timestamp: daysAgo(0), actor_user_id: 'user_developer', actor_type: 'user', action: 'subscription.requested', entity_type: 'subscription', entity_id: 'sub_002', payload: { api_id: 'api_hr_salary' } },

  { audit_id: 'aud_002', timestamp: daysAgo(1), actor_user_id: 'user_developer', actor_type: 'user', action: 'api.lifecycle.changed', entity_type: 'api', entity_id: 'api_hr_leave', payload: { from: 'in_development', to: 'in_testing' } },

  { audit_id: 'aud_003', timestamp: daysAgo(2), actor_type: 'webhook', action: 'workflow.approved', entity_type: 'workflow', entity_id: 'wf_002', payload: { subscription_id: 'sub_003' } },

  { audit_id: 'aud_004', timestamp: daysAgo(3), actor_user_id: 'user_portal_admin', actor_type: 'user', action: 'api.proposal.accepted', entity_type: 'api', entity_id: 'api_fin_report', payload: {} },

  { audit_id: 'aud_005', timestamp: daysAgo(4), actor_user_id: 'user_developer', actor_type: 'user', action: 'application.created', entity_type: 'application', entity_id: 'app_hr_dashboard', payload: {} },

  { audit_id: 'aud_006', timestamp: daysAgo(5), actor_user_id: 'user_developer', actor_type: 'user', action: 'subscription.provider_accepted', entity_type: 'subscription', entity_id: 'sub_001', payload: {} },

  { audit_id: 'aud_007', timestamp: daysAgo(6), actor_type: 'system', action: 'credential.provisioned', entity_type: 'credential', entity_id: 'cred_001', payload: { gateway: 'mock' } },

  { audit_id: 'aud_008', timestamp: daysAgo(7), actor_user_id: 'user_portal_admin', actor_type: 'user', action: 'provider_access.approved', entity_type: 'user', entity_id: 'user_developer', payload: { domain_id: 'dom_hr' } },

  { audit_id: 'aud_009', timestamp: daysAgo(8), actor_user_id: 'user_developer', actor_type: 'user', action: 'sandbox.request', entity_type: 'api', entity_id: 'api_hr_salary', payload: { mode: 'demo' } },

  { audit_id: 'aud_010', timestamp: daysAgo(9), actor_user_id: 'user_murad', actor_type: 'user', action: 'api.registered', entity_type: 'api', entity_id: 'api_fin_budget', payload: {} },

  { audit_id: 'aud_011', timestamp: daysAgo(10), actor_user_id: 'user_developer', actor_type: 'user', action: 'ai.planner.used', entity_type: 'application', entity_id: 'app_hr_dashboard', payload: { apis_suggested: 4 } },

  { audit_id: 'aud_012', timestamp: daysAgo(0.1), actor_user_id: 'user_developer', actor_type: 'user', action: 'llm_access.requested', entity_type: 'llm_request', entity_id: 'llm_req_002', payload: { api_id: 'api_ai_rag' } },

  { audit_id: 'aud_013', timestamp: daysAgo(6.5), actor_user_id: 'user_portal_admin', actor_type: 'user', action: 'provider_access.approved', entity_type: 'user', entity_id: 'user_murad', payload: { domain_id: 'dom_finance' } },

  { audit_id: 'aud_014', timestamp: daysAgo(5.5), actor_user_id: 'user_ali', actor_type: 'user', action: 'subscription.requested', entity_type: 'subscription', entity_id: 'sub_008', payload: { api_id: 'api_fin_rates' } },

  { audit_id: 'aud_015', timestamp: daysAgo(4.5), actor_user_id: 'user_murad', actor_type: 'user', action: 'subscription.provider_accepted', entity_type: 'subscription', entity_id: 'sub_008', payload: {} },

  { audit_id: 'aud_016', timestamp: daysAgo(3.5), actor_user_id: 'user_portal_admin', actor_type: 'user', action: 'provider_access.rejected', entity_type: 'user', entity_id: 'user_ali', payload: { domain_id: 'dom_sales' } },

];
