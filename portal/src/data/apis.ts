import type { API, ApiSearchIndex, Classification, LifecycleStatus } from '@/types';

const GENERATED_AT = '2026-06-30T00:00:00Z';

const hardcoded = (
  fluctuations: string[],
  synonyms: string[],
  business_terms: string[],
  related_api_ids: string[],
): ApiSearchIndex => ({
  fluctuations,
  synonyms,
  business_terms,
  related_api_ids,
  generated_at: GENERATED_AT,
  model: 'hardcoded',
});

export const API_SEARCH_INDEXES: Record<string, ApiSearchIndex> = {
  api_hr_directory: hardcoded(
    ['employee-directory', 'emp directory', 'employee directory', 'staff directory', 'org chart'],
    ['staff list', 'workforce directory', 'employee lookup', 'people finder', 'headcount'],
    ['HRIS', 'org chart', 'employee master', 'workforce', 'personnel'],
    ['api_hr_org', 'api_hr_salary'],
  ),
  api_hr_salary: hardcoded(
    ['salary-stats', 'salary stats', 'salary statistics', 'emp salary', 'payroll stats'],
    ['compensation', 'wages', 'remuneration', 'earnings', 'pay data'],
    ['WPS', 'wage protection', 'GOSI', 'payslip', 'net pay', 'payroll reporting'],
    ['api_hr_benefits', 'api_hr_org'],
  ),
  api_hr_org: hardcoded(
    ['org-structure', 'org structure', 'organization structure', 'reporting lines', 'dept hierarchy'],
    ['hierarchy', 'reporting structure', 'department tree', 'org chart data'],
    ['reporting line', 'department hierarchy', 'span of control', 'manager chain'],
    ['api_hr_directory', 'api_hr_salary'],
  ),
  api_hr_benefits: hardcoded(
    ['benefits-enrollment', 'benefits enrollment', 'benefit enrollment', 'employee benefits'],
    ['health plan', 'insurance enrollment', 'benefits status', 'coverage'],
    ['medical plan', 'dental', 'dependent coverage', 'open enrollment'],
    ['api_hr_salary', 'api_hr_directory'],
  ),
  api_hr_pii: hardcoded(
    ['pii-vault', 'pii vault', 'employee pii', 'identity vault', 'personal identity'],
    ['personal data', 'identity data', 'sensitive employee data', 'national id'],
    ['Iqama', 'national ID', 'passport data', 'PII access', 'identity vault'],
    ['api_hr_directory'],
  ),
  api_hr_leave: hardcoded(
    ['leave-management', 'leave management', 'leave balance', 'time off', 'vacation api'],
    ['absence', 'PTO', 'annual leave', 'sick leave', 'holiday balance'],
    ['leave balance', 'absence management', 'time off request'],
    ['api_hr_directory', 'api_hr_benefits'],
  ),
  api_hr_recruit: hardcoded(
    ['recruitment-pipeline', 'recruitment pipeline', 'hiring pipeline', 'candidate pipeline'],
    ['hiring', 'talent acquisition', 'open positions', 'job openings'],
    ['ATS', 'candidate tracking', 'requisition', 'headcount planning'],
    ['api_hr_directory', 'api_hr_org'],
  ),
  api_fin_ledger: hardcoded(
    ['general-ledger', 'general ledger', 'gl api', 'chart of accounts', 'ledger entries'],
    ['accounting ledger', 'journal entries', 'COA', 'financial ledger'],
    ['GL', 'chart of accounts', 'journal', 'posting', 'SAP FI'],
    ['api_fin_budget', 'api_fin_invoice'],
  ),
  api_fin_budget: hardcoded(
    ['budget-forecast', 'budget forecast', 'budget vs actual', 'forecast api'],
    ['budget planning', 'variance analysis', 'financial forecast', 'spending plan'],
    ['FP&A', 'variance', 'budget cycle', 'forecast model'],
    ['api_fin_ledger', 'api_fin_report'],
  ),
  api_fin_invoice: hardcoded(
    ['invoice-processing', 'invoice processing', 'vendor invoice', 'accounts payable'],
    ['AP', 'invoice status', 'payment processing', 'vendor payment'],
    ['AP invoice', 'vendor payment', 'three-way match', 'invoice approval'],
    ['api_fin_ledger', 'api_proc_vendors'],
  ),
  api_fin_rates: hardcoded(
    ['exchange-rates', 'exchange rates', 'fx rates', 'currency rates', 'forex'],
    ['FX', 'foreign exchange', 'currency conversion', 'daily rates'],
    ['SAR USD', 'FX rate', 'currency table', 'treasury rates'],
    ['api_fin_ledger', 'api_fin_budget'],
  ),
  api_fin_audit: hardcoded(
    ['financial-audit-trail', 'audit trail', 'finance audit', 'financial audit log'],
    ['audit log', 'compliance trail', 'financial controls', 'SOX trail'],
    ['SOX', 'internal audit', 'financial controls', 'audit evidence'],
    ['api_fin_ledger', 'api_fin_report'],
  ),
  api_fin_report: hardcoded(
    ['quarterly-reports', 'quarterly reports', 'financial reports', 'quarterly financials'],
    ['financial statements', 'QBR reports', 'period close reports', 'earnings report'],
    ['quarter close', 'financial statement', 'management reporting'],
    ['api_fin_ledger', 'api_fin_budget'],
  ),
  api_ops_assets: hardcoded(
    ['asset-management', 'asset management', 'plant assets', 'equipment registry'],
    ['maintenance assets', 'asset registry', 'equipment tracking', 'fixed assets ops'],
    ['CMMS', 'maintenance record', 'asset tag', 'plant equipment'],
    ['api_ops_production', 'api_ops_safety'],
  ),
  api_ops_production: hardcoded(
    ['production-metrics', 'production metrics', 'output metrics', 'daily production'],
    ['throughput', 'yield data', 'production output', 'manufacturing metrics'],
    ['OEE', 'throughput', 'daily output', 'plant performance'],
    ['api_ops_assets', 'api_ops_safety'],
  ),
  api_ops_safety: hardcoded(
    ['safety-incidents', 'safety incidents', 'incident reporting', 'HSE incidents'],
    ['accident report', 'safety events', 'incident data', 'workplace safety'],
    ['HSE', 'LTI', 'near miss', 'incident investigation'],
    ['api_ops_production', 'api_ops_assets'],
  ),
  api_ops_logistics: hardcoded(
    ['logistics-tracking', 'logistics tracking', 'shipment tracking', 'supply chain tracking'],
    ['shipments', 'freight tracking', 'delivery status', 'transport logistics'],
    ['shipment status', 'freight', 'dispatch', 'in-transit'],
    ['api_proc_po', 'api_ops_production'],
  ),
  api_proc_vendors: hardcoded(
    ['vendor-registry', 'vendor registry', 'supplier master', 'approved vendors'],
    ['supplier list', 'vendor master data', 'supplier registry', 'vendor onboarding'],
    ['supplier master', 'vendor onboarding', 'approved supplier list'],
    ['api_proc_contracts', 'api_fin_invoice'],
  ),
  api_proc_contracts: hardcoded(
    ['contract-management', 'contract management', 'procurement contracts', 'vendor contracts'],
    ['contract registry', 'active contracts', 'supplier agreements', 'contract lifecycle'],
    ['MSA', 'SOW', 'contract renewal', 'procurement agreement'],
    ['api_proc_vendors', 'api_proc_po'],
  ),
  api_proc_po: hardcoded(
    ['purchase-orders', 'purchase orders', 'PO status', 'procurement orders'],
    ['PO creation', 'purchase order', 'procurement PO', 'order status'],
    ['PR to PO', 'purchase requisition', 'PO approval', 'procurement order'],
    ['api_proc_vendors', 'api_proc_contracts'],
  ),
  api_proc_rfp: hardcoded(
    ['rfp-workflow', 'rfp workflow', 'request for proposal', 'RFP lifecycle'],
    ['tender process', 'bid management', 'proposal request', 'sourcing RFP'],
    ['RFP', 'RFQ', 'tender', 'bid evaluation', 'sourcing event'],
    ['api_proc_vendors', 'api_proc_contracts'],
  ),
  api_sales_crm: hardcoded(
    ['crm-customers', 'crm customers', 'customer master', 'customer contacts'],
    ['customer data', 'client registry', 'account master', 'contact management'],
    ['CRM', 'account master', 'customer 360', 'client data'],
    ['api_sales_orders', 'api_sales_revenue'],
  ),
  api_sales_orders: hardcoded(
    ['sales-orders', 'sales orders', 'order pipeline', 'order history'],
    ['order book', 'sales pipeline', 'customer orders', 'order status'],
    ['order backlog', 'sales pipeline', 'bookings', 'fulfillment status'],
    ['api_sales_crm', 'api_sales_revenue'],
  ),
  api_sales_revenue: hardcoded(
    ['revenue-analytics', 'revenue analytics', 'sales revenue', 'revenue breakdown'],
    ['revenue reporting', 'sales performance', 'regional revenue', 'product revenue'],
    ['top line', 'revenue by region', 'sales KPI', 'bookings vs revenue'],
    ['api_sales_orders', 'api_sales_forecast'],
  ),
  api_sales_forecast: hardcoded(
    ['sales-forecast', 'sales forecast', 'forecast models', 'pipeline forecast'],
    ['demand forecast', 'sales projection', 'forecast output', 'predictive sales'],
    ['forecast model', 'pipeline forecast', 'sales projection', 'quota planning'],
    ['api_sales_revenue', 'api_sales_orders'],
  ),
  api_ai_llm: hardcoded(
    ['llm-completion', 'llm completion', 'gpt completion', 'enterprise llm', 'text generation'],
    ['language model', 'chat completion', 'generative AI', 'text generation API'],
    ['GPT', 'LLM', 'gen AI', 'prompt completion', 'foundation model'],
    ['api_ai_embeddings', 'api_ai_rag'],
  ),
  api_ai_embeddings: hardcoded(
    ['embedding-service', 'embeddings', 'text embeddings', 'vector embeddings'],
    ['semantic vectors', 'embedding generation', 'vector search prep', 'text vectors'],
    ['vector DB', 'semantic search', 'embedding model', 'RAG prep'],
    ['api_ai_rag', 'api_ai_llm'],
  ),
  api_ai_rag: hardcoded(
    ['rag-query', 'rag query', 'retrieval augmented generation', 'enterprise rag'],
    ['document QA', 'knowledge retrieval', 'grounded generation', 'corpus search'],
    ['RAG', 'retrieval', 'knowledge base QA', 'enterprise corpus'],
    ['api_ai_embeddings', 'api_ai_llm'],
  ),
  api_ai_mcp: hardcoded(
    ['mcp-tools', 'mcp tools', 'model context protocol', 'tool gateway', 'agent tools'],
    ['tool invocation', 'MCP gateway', 'agent tools API', 'LLM tools'],
    ['MCP', 'tool calling', 'agent gateway', 'function calling'],
    ['api_ai_llm', 'api_ai_classify'],
  ),
  api_ai_classify: hardcoded(
    ['doc-classify', 'document classification', 'auto classify', 'sensitivity classification'],
    ['document tagging', 'content classification', 'data sensitivity', 'document labeling'],
    ['DLP', 'sensitivity label', 'document tagging', 'content moderation'],
    ['api_ai_llm', 'api_ai_embeddings'],
  ),
};

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
    search_index: API_SEARCH_INDEXES[id],
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
  // Finance — Murad (Finance & Sales publisher)
  api('api_fin_ledger', 'dom_finance', 'General Ledger API', 'ledger', 'Chart of accounts and ledger entries.', 'confidential', 'published', 'user_murad', ['finance', 'ledger'], 2, 'user_murad'),
  api('api_fin_budget', 'dom_finance', 'Budget Forecast API', 'budget-forecast', 'Budget vs actual forecast data.', 'confidential', 'published', 'user_murad', ['finance', 'budget'], 2, 'user_murad'),
  api('api_fin_invoice', 'dom_finance', 'Invoice Processing API', 'invoices', 'Vendor invoice status and payments.', 'internal', 'published', 'user_murad', ['finance', 'invoices']),
  api('api_fin_rates', 'dom_finance', 'Exchange Rates API', 'exchange-rates', 'Daily FX rates for reporting.', 'public', 'published', 'user_murad', ['finance', 'fx']),
  api('api_fin_audit', 'dom_finance', 'Financial Audit Trail API', 'audit-trail', 'Restricted audit log access.', 'restricted', 'published', 'user_murad', ['finance', 'audit'], 3, 'user_murad'),
  api('api_fin_report', 'dom_finance', 'Quarterly Reports API', 'quarterly-reports', 'Quarterly financial report extracts.', 'confidential', 'under_review', 'user_murad', ['finance', 'reports'], 2, 'user_murad'),
  // Operations — Murad
  api('api_ops_assets', 'dom_ops', 'Asset Management API', 'assets', 'Plant asset registry and maintenance.', 'internal', 'published', 'user_murad', ['operations', 'assets']),
  api('api_ops_production', 'dom_ops', 'Production Metrics API', 'production', 'Daily production output metrics.', 'internal', 'published', 'user_murad', ['operations', 'production']),
  api('api_ops_safety', 'dom_ops', 'Safety Incidents API', 'safety', 'Safety incident reporting data.', 'confidential', 'published', 'user_murad', ['operations', 'safety'], 2, 'user_murad'),
  api('api_ops_logistics', 'dom_ops', 'Logistics Tracking API', 'logistics', 'Shipment and logistics tracking.', 'internal', 'draft', 'user_murad', ['operations', 'logistics']),
  // Procurement
  api('api_proc_vendors', 'dom_proc', 'Vendor Registry API', 'vendors', 'Approved vendor master data.', 'internal', 'published', 'user_developer', ['procurement', 'vendors']),
  api('api_proc_contracts', 'dom_proc', 'Contract Management API', 'contracts', 'Active procurement contracts.', 'confidential', 'published', 'user_developer', ['procurement', 'contracts'], 2, 'user_developer'),
  api('api_proc_po', 'dom_proc', 'Purchase Orders API', 'purchase-orders', 'PO creation and status.', 'internal', 'published', 'user_developer', ['procurement', 'po']),
  api('api_proc_rfp', 'dom_proc', 'RFP Workflow API', 'rfp', 'Request for proposal lifecycle.', 'internal', 'in_development', 'user_developer', ['procurement', 'rfp']),
  // Sales — Ali (consumer; publisher access pending)
  api('api_sales_crm', 'dom_sales', 'CRM Customer API', 'crm-customers', 'Customer master and contact data.', 'internal', 'published', 'user_ali', ['sales', 'crm']),
  api('api_sales_orders', 'dom_sales', 'Sales Orders API', 'orders', 'Order history and pipeline.', 'internal', 'published', 'user_ali', ['sales', 'orders']),
  api('api_sales_revenue', 'dom_sales', 'Revenue Analytics API', 'revenue', 'Revenue breakdown by region and product.', 'confidential', 'published', 'user_ali', ['sales', 'revenue'], 2, 'user_ali'),
  api('api_sales_forecast', 'dom_sales', 'Sales Forecast API', 'sales-forecast', 'Sales forecasting models output.', 'confidential', 'deprecated', 'user_ali', ['sales', 'forecast'], 2, 'user_ali'),
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
