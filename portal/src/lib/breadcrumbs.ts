import { matchPath } from 'react-router-dom';

import { ROUTES } from '@/config/routes';
import { roleLandingPath } from '@/lib/navigation';
import type { PortalRole } from '@/types';
import type { Crumb } from '@/components/portal/header';

const ROUTE_LABELS: { pattern: string; label: string; parent?: string }[] = [
  { pattern: ROUTES.consumer.dashboard, label: 'Dashboard' },
  { pattern: ROUTES.consumer.catalog, label: 'API Catalog' },
  { pattern: '/consumer/apis/:id', label: 'API Detail', parent: ROUTES.consumer.catalog },
  { pattern: ROUTES.consumer.subscriptions, label: 'My Subscriptions' },
  { pattern: ROUTES.consumer.applications, label: 'My Applications' },
  { pattern: ROUTES.consumer.planner, label: 'Application Planner' },
  { pattern: ROUTES.developer.requestProvider, label: 'Request Publisher Access' },
  { pattern: ROUTES.provider.dashboard, label: 'Provider Dashboard' },
  { pattern: ROUTES.provider.myApis, label: 'My APIs' },
  { pattern: ROUTES.provider.register, label: 'Publish API' },
  { pattern: '/provider/apis/:id/manage', label: 'Manage API', parent: ROUTES.provider.myApis },
  { pattern: ROUTES.provider.requests, label: 'Consumer Requests' },
  { pattern: ROUTES.llmAdmin.dashboard, label: 'LLM Admin Dashboard' },
  { pattern: ROUTES.llmAdmin.myApis, label: 'My LLM APIs' },
  { pattern: ROUTES.llmAdmin.register, label: 'Register LLM API' },
  { pattern: '/llm-admin/apis/:id/manage', label: 'Manage LLM API', parent: ROUTES.llmAdmin.myApis },
  { pattern: ROUTES.llmAdmin.accessRequests, label: 'Access Requests' },
  { pattern: ROUTES.admin.dashboard, label: 'Admin Dashboard' },
  { pattern: ROUTES.admin.proposals, label: 'Proposals Queue' },
  { pattern: ROUTES.admin.publishing, label: 'Publishing Queue' },
  { pattern: ROUTES.admin.allApis, label: 'All APIs' },
  { pattern: ROUTES.admin.providerRequests, label: 'Provider Access Requests' },
  { pattern: ROUTES.admin.rbac, label: 'RBAC' },
  { pattern: ROUTES.admin.domains, label: 'Domain Registry' },
  { pattern: ROUTES.admin.audit, label: 'Audit Log' },
];

export function buildBreadcrumbs(pathname: string, role: PortalRole | null): Crumb[] {
  const home = { label: 'Home', href: roleLandingPath(role) };
  const match = ROUTE_LABELS.find((r) => matchPath({ path: r.pattern, end: true }, pathname));

  if (!match) return [home, { label: 'Page' }];

  const crumbs: Crumb[] = [home];

  if (match.parent) {
    const parent = ROUTE_LABELS.find((r) => r.pattern === match.parent);
    if (parent) crumbs.push({ label: parent.label, href: parent.pattern });
  }

  crumbs.push({ label: match.label });
  return crumbs;
}
