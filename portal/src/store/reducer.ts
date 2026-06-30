import type { PortalAction } from './actions';

import type { PortalState } from '@/types';

export type { PortalAction };

export const initialState: PortalState = {
  currentUser: null,

  activeRole: null,

  users: [],

  domains: [],

  apis: [],

  subscriptions: [],

  applications: [],

  workflows: [],

  credentials: [],

  auditLogs: [],

  notifications: [],

  providerAccessRequests: [],

  llmSubscriptionRequests: [],

  plannerDescription: '',

  plannerSelectedApiIds: [],

  catalogFilters: { query: '', domainFilter: '', classFilter: '' },
};

function preserveData(state: PortalState): Partial<PortalState> {
  return {
    users: state.users,

    domains: state.domains,

    apis: state.apis,

    subscriptions: state.subscriptions,

    applications: state.applications,

    workflows: state.workflows,

    credentials: state.credentials,

    auditLogs: state.auditLogs,

    providerAccessRequests: state.providerAccessRequests,

    llmSubscriptionRequests: state.llmSubscriptionRequests,
  };
}

export function portalReducer(state: PortalState, action: PortalAction): PortalState {
  switch (action.type) {
    case 'INIT_DATA':
      return {
        ...state,

        ...action.payload,

        users: action.payload.users ?? state.users,

        domains: action.payload.domains ?? state.domains,
      };

    case 'LOGIN':
      return {
        ...state,

        currentUser: action.payload.user,

        activeRole: action.payload.role,
      };

    case 'LOGOUT':
      return { ...initialState, ...preserveData(state) };

    case 'SET_ROLE':
      return { ...state, activeRole: action.payload };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,

        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n,
        ),
      };

    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [...state.subscriptions, action.payload] };

    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,

        subscriptions: state.subscriptions.map((s) =>
          s.subscription_id === action.payload.subscription_id
            ? { ...s, ...action.payload.patch }
            : s,
        ),
      };

    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.payload] };

    case 'UPDATE_APPLICATION':
      return {
        ...state,

        applications: state.applications.map((a) =>
          a.application_id === action.payload.application_id
            ? { ...a, ...action.payload.patch }
            : a,
        ),
      };

    case 'ADD_API':
      return { ...state, apis: [...state.apis, action.payload] };

    case 'UPDATE_API':
      return {
        ...state,

        apis: state.apis.map((a) =>
          a.api_id === action.payload.api_id ? { ...a, ...action.payload.patch } : a,
        ),
      };

    case 'ADD_WORKFLOW':
      return { ...state, workflows: [...state.workflows, action.payload] };

    case 'UPDATE_WORKFLOW':
      return {
        ...state,

        workflows: state.workflows.map((w) =>
          w.workflow_instance_id === action.payload.workflow_instance_id
            ? { ...w, ...action.payload.patch }
            : w,
        ),
      };

    case 'ADD_CREDENTIAL':
      return { ...state, credentials: [...state.credentials, action.payload] };

    case 'ADD_AUDIT':
      return { ...state, auditLogs: [action.payload, ...state.auditLogs] };

    case 'ADD_PROVIDER_REQUEST':
      return {
        ...state,
        providerAccessRequests: [...state.providerAccessRequests, action.payload],
      };

    case 'UPDATE_PROVIDER_REQUEST':
      return {
        ...state,

        providerAccessRequests: state.providerAccessRequests.map((r) =>
          r.request_id === action.payload.request_id ? { ...r, ...action.payload.patch } : r,
        ),
      };

    case 'GRANT_PROVIDER_DOMAIN': {
      const { user_id, domain_id } = action.payload;

      const updatedUser =
        state.currentUser?.user_id === user_id &&
        !state.currentUser.provider_domains.includes(domain_id)
          ? {
              ...state.currentUser,

              provider_domains: [...state.currentUser.provider_domains, domain_id],
            }
          : state.currentUser;

      return {
        ...state,

        currentUser: updatedUser,

        users: state.users.map((u) =>
          u.user_id === user_id && !u.provider_domains.includes(domain_id)
            ? { ...u, provider_domains: [...u.provider_domains, domain_id] }
            : u,
        ),
      };
    }

    case 'UPDATE_USER':
      return {
        ...state,

        users: state.users.map((u) =>
          u.user_id === action.payload.user_id ? { ...u, ...action.payload.patch } : u,
        ),

        currentUser:
          state.currentUser?.user_id === action.payload.user_id
            ? { ...state.currentUser, ...action.payload.patch }
            : state.currentUser,
      };

    case 'ADD_DOMAIN':
      return { ...state, domains: [...state.domains, action.payload] };

    case 'UPDATE_DOMAIN':
      return {
        ...state,

        domains: state.domains.map((d) =>
          d.domain_id === action.payload.domain_id ? { ...d, ...action.payload.patch } : d,
        ),
      };

    case 'DELETE_DOMAIN':
      return { ...state, domains: state.domains.filter((d) => d.domain_id !== action.payload) };

    case 'ADD_LLM_REQUEST':
      return {
        ...state,
        llmSubscriptionRequests: [...state.llmSubscriptionRequests, action.payload],
      };

    case 'UPDATE_LLM_REQUEST':
      return {
        ...state,

        llmSubscriptionRequests: state.llmSubscriptionRequests.map((r) =>
          r.llm_request_id === action.payload.llm_request_id
            ? { ...r, ...action.payload.patch }
            : r,
        ),
      };

    case 'SET_PLANNER':
      return {
        ...state,
        plannerDescription: action.payload.description,
        plannerSelectedApiIds: action.payload.selected ?? state.plannerSelectedApiIds,
      };

    case 'SET_PLANNER_SELECTION':
      return { ...state, plannerSelectedApiIds: action.payload };

    case 'SET_CATALOG_FILTERS':
      return { ...state, catalogFilters: action.payload };

    default:
      return state;
  }
}
