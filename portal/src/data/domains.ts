import type { Domain, Team } from '@/types';

export const domains: Domain[] = [
  { domain_id: 'dom_hr', name: 'Human Resources', code: 'hr', description: 'Employee and organizational data' },
  { domain_id: 'dom_finance', name: 'Finance', code: 'finance', description: 'Financial reporting and ledger' },
  { domain_id: 'dom_ops', name: 'Operations', code: 'operations', description: 'Production and logistics' },
  { domain_id: 'dom_proc', name: 'Procurement', code: 'procurement', description: 'Vendors and contracts' },
  { domain_id: 'dom_sales', name: 'Sales', code: 'sales', description: 'CRM and revenue' },
  { domain_id: 'dom_ai', name: 'AI Platform', code: 'ai', description: 'LLM, RAG, and MCP services' },
];

export const initialDomains = domains;

const domainById = new Map(domains.map((d) => [d.domain_id, d]));

export function getDomainById(id: string): Domain | undefined {
  return domainById.get(id);
}

export function getDomainName(id: string): string | undefined {
  return domainById.get(id)?.name;
}

export const teams: Team[] = [
  { team_id: 'team_hr_analytics', domain_id: 'dom_hr', name: 'HR Analytics' },
  { team_id: 'team_hr_ops', domain_id: 'dom_hr', name: 'HR Operations' },
  { team_id: 'team_fin_reporting', domain_id: 'dom_finance', name: 'Financial Reporting' },
  { team_id: 'team_ops_plant', domain_id: 'dom_ops', name: 'Plant Operations' },
  { team_id: 'team_proc_vendor', domain_id: 'dom_proc', name: 'Vendor Management' },
  { team_id: 'team_sales_crm', domain_id: 'dom_sales', name: 'Sales CRM' },
  { team_id: 'team_ai_platform', domain_id: 'dom_ai', name: 'AI Platform Engineering' },
];
