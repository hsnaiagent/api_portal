export const ROUTES = {

  login: '/login',

  consumer: {

    root: '/consumer',

    dashboard: '/consumer',

    catalog: '/consumer/catalog',

    apiDetail: (id: string) => `/consumer/apis/${id}`,

    subscriptions: '/consumer/subscriptions',

    applications: '/consumer/applications',

    planner: '/consumer/planner',

  },

  developer: {

    requestProvider: '/developer/request-provider',

  },

  provider: {

    root: '/provider',

    dashboard: '/provider',

    myApis: '/provider/apis',

    register: '/provider/register',

    manage: (id: string) => `/provider/apis/${id}/manage`,

    requests: '/provider/requests',

  },

  llmAdmin: {

    root: '/llm-admin',

    dashboard: '/llm-admin',

    myApis: '/llm-admin/apis',

    register: '/llm-admin/register',

    manage: (id: string) => `/llm-admin/apis/${id}/manage`,

    accessRequests: '/llm-admin/access-requests',

  },

  admin: {

    root: '/admin',

    dashboard: '/admin',

    proposals: '/admin/proposals',

    publishing: '/admin/publishing',

    allApis: '/admin/apis',

    providerRequests: '/admin/provider-requests',

    rbac: '/admin/rbac',

    audit: '/admin/audit',

  },

} as const;


