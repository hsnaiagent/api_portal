import type { API, Classification, LifecycleStatus } from '@/types';

const defaultEndpoints = (base: string) => [
  {
    method: 'GET',
    path: base,
    summary: 'List resources',
    parameters: [{ name: 'limit', in: 'query', type: 'integer' }],
    responseExample: { items: [{ id: '1', name: 'Sample' }], total: 1 },
  },
  {
    method: 'GET',
    path: `${base}/{id}`,
    summary: 'Get by ID',
    parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }],
    responseExample: { id: '1', name: 'Sample' },
  },
];

function api(
  id: string,
  domain_id: string,
  name: string,
  slug: string,
  description: string,
  classification: Classification,
  lifecycle_status: LifecycleStatus,
  owner: string,
  tags: string[],
  tier: 1 | 2 | 3 = 2,
  dataOwner?: string,
): API {
  return {
    api_id: id,
    domain_id,
    name,
    slug,
    description,
    classification,
    lifecycle_status,
    owner_user_id: owner,
    data_owner_user_id: dataOwner,
    gateway_tier: tier,
    tags,
    version: '1.0.0',
    endpoints: defaultEndpoints(`/v1/${slug}`),
  };
}

export const initialApis: API[] = [
  // HR
  api('api_hr_directory', 'dom_hr', 'Employee Directory API', 'employee-directory', 'Public employee directory and org chart data.', 'public', 'published', 'user_developer', ['hr', 'directory']),
  api('api_hr_salary', 'dom_hr', 'Employee Salary Statistics API', 'salary-stats', 'Aggregated salary statistics for HR reporting.', 'confidential', 'published', 'user_developer', ['hr', 'payroll', 'salary'], 2, 'user_developer'),
  api('api_hr_org', 'dom_hr', 'Organization Structure API', 'org-structure', 'Department hierarchy and reporting lines.', 'internal', 'published', 'user_developer', ['hr', 'org']),
  api('api_hr_benefits', 'dom_hr', 'Benefits Enrollment API', 'benefits', 'Employee benefits enrollment status.', 'confidential', 'published', 'user_developer', ['hr', 'benefits'], 2, 'user_developer'),
  api('api_hr_pii', 'dom_hr', 'Employee PII Vault API', 'pii-vault', 'Restricted personal identity data access.', 'restricted', 'published', 'user_developer', ['hr', 'pii'], 3, 'user_developer'),
  api('api_hr_leave', 'dom_hr', 'Leave Management API', 'leave', 'Leave balances and requests.', 'internal', 'in_testing', 'user_developer', ['hr', 'leave']),
  api('api_hr_recruit', 'dom_hr', 'Recruitment Pipeline API', 'recruitment', 'Open positions and candidate pipeline.', 'internal', 'proposed', 'user_developer', ['hr', 'recruitment']),
  // Finance
  api('api_fin_ledger', 'dom_finance', 'General Ledger API', 'ledger', 'Chart of accounts and ledger entries.', 'confidential', 'published', 'user_developer', ['finance', 'ledger'], 2, 'user_developer'),
  api('api_fin_budget', 'dom_finance', 'Budget Forecast API', 'budget-forecast', 'Budget vs actual forecast data.', 'confidential', 'published', 'user_developer', ['finance', 'budget'], 2, 'user_developer'),
  api('api_fin_invoice', 'dom_finance', 'Invoice Processing API', 'invoices', 'Vendor invoice status and payments.', 'internal', 'published', 'user_developer', ['finance', 'invoices']),
  api('api_fin_rates', 'dom_finance', 'Exchange Rates API', 'exchange-rates', 'Daily FX rates for reporting.', 'public', 'published', 'user_developer', ['finance', 'fx']),
  api('api_fin_audit', 'dom_finance', 'Financial Audit Trail API', 'audit-trail', 'Restricted audit log access.', 'restricted', 'published', 'user_developer', ['finance', 'audit'], 3, 'user_developer'),
  api('api_fin_report', 'dom_finance', 'Quarterly Reports API', 'quarterly-reports', 'Quarterly financial report extracts.', 'confidential', 'under_review', 'user_developer', ['finance', 'reports'], 2, 'user_developer'),
  // Operations
  api('api_ops_assets', 'dom_ops', 'Asset Management API', 'assets', 'Plant asset registry and maintenance.', 'internal', 'published', 'user_developer', ['operations', 'assets']),
  api('api_ops_production', 'dom_ops', 'Production Metrics API', 'production', 'Daily production output metrics.', 'internal', 'published', 'user_developer', ['operations', 'production']),
  api('api_ops_safety', 'dom_ops', 'Safety Incidents API', 'safety', 'Safety incident reporting data.', 'confidential', 'published', 'user_developer', ['operations', 'safety'], 2, 'user_developer'),
  api('api_ops_logistics', 'dom_ops', 'Logistics Tracking API', 'logistics', 'Shipment and logistics tracking.', 'internal', 'draft', 'user_developer', ['operations', 'logistics']),
  // Procurement
  api('api_proc_vendors', 'dom_proc', 'Vendor Registry API', 'vendors', 'Approved vendor master data.', 'internal', 'published', 'user_developer', ['procurement', 'vendors']),
  api('api_proc_contracts', 'dom_proc', 'Contract Management API', 'contracts', 'Active procurement contracts.', 'confidential', 'published', 'user_developer', ['procurement', 'contracts'], 2, 'user_developer'),
  api('api_proc_po', 'dom_proc', 'Purchase Orders API', 'purchase-orders', 'PO creation and status.', 'internal', 'published', 'user_developer', ['procurement', 'po']),
  api('api_proc_rfp', 'dom_proc', 'RFP Workflow API', 'rfp', 'Request for proposal lifecycle.', 'internal', 'in_development', 'user_developer', ['procurement', 'rfp']),
  // Sales
  api('api_sales_crm', 'dom_sales', 'CRM Customer API', 'crm-customers', 'Customer master and contact data.', 'internal', 'published', 'user_developer', ['sales', 'crm']),
  api('api_sales_orders', 'dom_sales', 'Sales Orders API', 'orders', 'Order history and pipeline.', 'internal', 'published', 'user_developer', ['sales', 'orders']),
  api('api_sales_revenue', 'dom_sales', 'Revenue Analytics API', 'revenue', 'Revenue breakdown by region and product.', 'confidential', 'published', 'user_developer', ['sales', 'revenue'], 2, 'user_developer'),
  api('api_sales_forecast', 'dom_sales', 'Sales Forecast API', 'sales-forecast', 'Sales forecasting models output.', 'confidential', 'deprecated', 'user_developer', ['sales', 'forecast'], 2, 'user_developer'),
  // AI Platform
  api('api_ai_llm', 'dom_ai', 'Enterprise LLM Completion API', 'llm-completion', 'Internal GPT-class model completions.', 'internal', 'published', 'user_llm_admin', ['ai', 'llm', 'model']),
  api('api_ai_embeddings', 'dom_ai', 'Embedding Service API', 'embeddings', 'Text embedding generation for semantic search.', 'internal', 'published', 'user_llm_admin', ['ai', 'embeddings']),
  api('api_ai_rag', 'dom_ai', 'RAG Query API', 'rag-query', 'Retrieval-augmented generation over enterprise corpus.', 'confidential', 'published', 'user_llm_admin', ['ai', 'rag'], 2, 'user_llm_admin'),
  api('api_ai_mcp', 'dom_ai', 'MCP Tools Gateway API', 'mcp-tools', 'Model Context Protocol tool invocation.', 'internal', 'published', 'user_llm_admin', ['ai', 'mcp', 'agents']),
  api('api_ai_classify', 'dom_ai', 'Document Classification API', 'doc-classify', 'Auto-classify documents by sensitivity.', 'confidential', 'in_testing', 'user_llm_admin', ['ai', 'classification'], 2, 'user_llm_admin'),
];

export function getApiById(id: string) {
  return initialApis.find((a) => a.api_id === id);
}

export function getPublishedApis() {
  return initialApis.filter((a) => a.lifecycle_status === 'published');
}
