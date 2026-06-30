import type { AIAgentId } from '@/config/ai';
import type { AIResponse } from '@/types';

type ResponseMap = Record<string, AIResponse>;

export const AI_RESPONSES: Record<AIAgentId, ResponseMap> = {
  AI_1_ApplicationPlanner: {
    default: {
      text: 'Based on your description, I identified APIs that cover salary statistics, org structure, and HR reporting.',
      items: [
        {
          id: 'api_hr_salary',
          label: 'Employee Salary Statistics API',
          score: 96,
          reason: 'Direct match for salary statistics reporting',
        },
        {
          id: 'api_hr_org',
          label: 'Organization Structure API',
          score: 91,
          reason: 'Org hierarchy for workforce planning views',
        },
        {
          id: 'api_hr_directory',
          label: 'Employee Directory API',
          score: 85,
          reason: 'Headcount and employee metadata',
        },
        {
          id: 'api_ai_llm',
          label: 'Enterprise LLM Completion API',
          score: 72,
          reason: 'Generate narrative summaries for leadership reports',
        },
      ],
    },
    payroll: {
      text: 'Matching payroll and compensation related APIs.',
      items: [
        {
          id: 'api_hr_salary',
          label: 'Employee Salary Statistics API',
          score: 98,
          reason: 'Payroll aggregation',
        },
        {
          id: 'api_hr_benefits',
          label: 'Benefits Enrollment API',
          score: 80,
          reason: 'Benefits data alongside compensation',
        },
      ],
    },
  },
  AI_2_SemanticSearch: {
    default: {
      text: 'Interpreted your query as a request for employee compensation and workforce analytics APIs.',
    },
  },
  AI_3_PurposeHelper: {
    default: {
      text: 'This application requires access to aggregated salary statistics and organizational structure data to produce monthly HR leadership reports for workforce planning and compliance review.',
    },
  },
  AI_4_Recommendations: {
    default: {
      items: [
        {
          id: 'api_hr_benefits',
          label: 'Benefits Enrollment API',
          score: 78,
          reason: 'Often used alongside salary reporting',
        },
        {
          id: 'api_ai_embeddings',
          label: 'Embedding Service API',
          score: 65,
          reason: 'Semantic search within HR documents',
        },
      ],
    },
  },
  AI_5_ContextualSDK: {
    default: {
      code: `# Personalized for your HR Leadership Dashboard\nimport requests\n\nBASE = "https://api.internal/v1/salary-stats"\n\ndef fetch_leadership_salary_report(access_token: str, month: str):\n    headers = {"Authorization": f"Bearer {access_token}"}\n    params = {"month": month, "aggregate": "department"}\n    response = requests.get(BASE, headers=headers, params=params)\n    response.raise_for_status()\n    return response.json()`,
    },
  },
  AI_6_DescriptionGenerator: {
    default: {
      text: 'Provides REST endpoints for querying aggregated employee salary statistics by department, grade, and time period. Supports filtering and pagination for HR analytics dashboards.',
    },
  },
  AI_7_TagSuggester: {
    default: {
      tags: ['hr', 'payroll', 'salary', 'analytics', 'reporting'],
    },
  },
  AI_8_ClassificationAdvisor: {
    default: {
      classification: 'confidential',
      text: 'Recommended classification: Confidential. The API exposes aggregated salary data which is sensitive business information. Requires TPC-52 compliant transit and Data Owner approval.',
    },
  },
  AI_9_DuplicationDetector: {
    default: {
      text: 'Found similar APIs in the catalog. Review before creating a new API.',
      items: [
        {
          id: 'api_hr_salary',
          label: 'Employee Salary Statistics API',
          score: 88,
          reason: 'Similar endpoints and data domain',
        },
        {
          id: 'api_hr_benefits',
          label: 'Benefits Enrollment API',
          score: 62,
          reason: 'Partial overlap in compensation domain',
        },
      ],
    },
  },
  AI_10_SpecQualityChecker: {
    default: {
      checklist: [
        { item: 'All operations have descriptions', passed: false },
        { item: 'Response examples provided', passed: false },
        { item: 'Error codes documented (4xx, 5xx)', passed: true },
        { item: 'Security scheme defined', passed: true },
        { item: 'Pagination parameters documented', passed: true },
      ],
    },
  },
  AI_11_WorkflowSuggester: {
    default: {
      text: 'Recommended workflow template: api-access-confidential. Data Owner approval required due to Confidential classification and finance domain sensitivity.',
    },
  },
  AI_12_AuditAnomalyAlerts: {
    default: {
      text: 'Anomaly detected: Subscription request submitted outside business hours for Confidential API (api_hr_salary). Review recommended.',
      items: [
        {
          id: 'aud_012',
          label: 'Off-hours subscription request',
          score: 85,
          reason: 'Timestamp 22:14 local time',
        },
      ],
    },
  },
  AI_13_CatalogHealthSummary: {
    default: {
      text: 'Catalog health: 4 APIs have been in Draft or Proposed state for over 7 days. HR domain shows highest cross-domain subscription demand. 2 Confidential APIs lack an assigned Data Owner. AI Platform domain added 3 new published APIs this month.',
    },
  },
  AI_14_PortalAssistant: {
    default: {
      text: 'I can help you discover APIs, explain subscriptions, or start the Application Planner. What would you like to do?',
      links: [
        { label: 'Browse API Catalog', path: '/consumer/catalog' },
        { label: 'Application Planner', path: '/consumer/planner' },
        { label: 'My Subscriptions', path: '/consumer/subscriptions' },
      ],
    },
    how_subscribe: {
      text: 'To subscribe: open an API → Request Access → select your Application → provide a business purpose → workflow approval runs for Internal+ APIs → provider accepts → credentials are provisioned.',
      links: [{ label: 'View Catalog', path: '/consumer/catalog' }],
    },
    find_salary: {
      text: 'For salary statistics, try the Employee Salary Statistics API (Confidential). Use the Application Planner to get a full bundle recommendation.',
      links: [
        { label: 'Salary Stats API', path: '/consumer/apis/api_hr_salary' },
        { label: 'Application Planner', path: '/consumer/planner' },
      ],
    },
  },
  AI_15_NaturalLanguageSearch: {
    default: {
      text: 'Searching catalog for APIs related to your natural language query. Prioritizing semantic matches over keyword overlap.',
    },
  },
};

export function hashInput(input: object): string {
  const str = JSON.stringify(input).toLowerCase();
  if (str.includes('payroll') || str.includes('salary')) return 'payroll';
  if (str.includes('subscribe') || str.includes('access')) return 'how_subscribe';
  if (str.includes('salary') || str.includes('compensation')) return 'find_salary';
  return 'default';
}
