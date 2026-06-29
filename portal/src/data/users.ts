import type { User } from '@/types';



export const users: User[] = [

  {

    user_id: 'user_developer',

    email: 'ahmad.alrashidi@example.com',

    display_name: 'Ahmad Al-Rashidi',

    portal_roles: ['developer'],

    team_ids: ['team_hr_analytics'],

    domain_id: 'dom_hr',

    provider_domains: ['dom_hr'],

  },

  {

    user_id: 'user_murad',

    email: 'murad.alqahtani@example.com',

    display_name: 'Murad',

    portal_roles: ['developer'],

    team_ids: ['team_fin_reporting', 'team_sales_crm'],

    domain_id: 'dom_finance',

    provider_domains: ['dom_finance', 'dom_sales'],

  },

  {

    user_id: 'user_ali',

    email: 'ali.alfarsi@example.com',

    display_name: 'Ali',

    portal_roles: ['developer'],

    team_ids: ['team_sales_crm'],

    domain_id: 'dom_sales',

    provider_domains: [],

  },

  {

    user_id: 'user_llm_admin',

    email: 'saleh.hassan@example.com',

    display_name: 'Saleh',

    portal_roles: ['llm_admin'],

    team_ids: ['team_ai_platform'],

    domain_id: 'dom_ai',

    provider_domains: [],

  },

  {

    user_id: 'user_portal_admin',

    email: 'admin.platform@example.com',

    display_name: 'Platform Admin',

    portal_roles: ['portal_admin'],

    team_ids: ['team_ai_platform'],

    domain_id: 'dom_ai',

    provider_domains: [],

  },

];



export function getUserById(id: string) {

  return users.find((u) => u.user_id === id);

}
