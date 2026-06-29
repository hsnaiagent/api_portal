import type { Application } from '@/types';



export const initialApplications: Application[] = [

  {

    application_id: 'app_hr_dashboard',

    team_id: 'team_hr_analytics',

    name: 'HR Leadership Dashboard',

    description: 'Executive HR reporting application',

    application_description:

      'A dashboard for HR leadership showing monthly salary statistics, headcount trends, and organizational structure for workforce planning.',

    owner_user_id: 'user_developer',

    environment: 'sandbox',

    status: 'active',

  },

  {

    application_id: 'app_fin_forecast',

    team_id: 'team_fin_reporting',

    name: 'Finance Forecast Tool',

    description: 'Budget forecasting integration',

    application_description:

      'Integrates budget forecasts with actuals for quarterly financial planning reports.',

    owner_user_id: 'user_murad',

    environment: 'sandbox',

    status: 'active',

  },

  {

    application_id: 'app_sales_insights',

    team_id: 'team_sales_crm',

    name: 'Sales Insights Bot',

    description: 'CRM analytics assistant',

    application_description: 'Pulls CRM order data and customer metrics for sales team dashboards.',

    owner_user_id: 'user_ali',

    environment: 'production',

    status: 'active',

  },

  {

    application_id: 'app_ops_monitor',

    team_id: 'team_ops_plant',

    name: 'Plant Operations Monitor',

    description: 'Real-time production and safety metrics',

    application_description:

      'Monitors daily production output and safety incident trends across plant operations.',

    owner_user_id: 'user_murad',

    environment: 'sandbox',

    status: 'active',

  },

];
