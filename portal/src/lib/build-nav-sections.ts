import {
  Activity,
  AppWindow,
  BookOpen,
  Boxes,
  Brain,
  ClipboardList,
  FileKey,
  KeyRound,
  LayoutDashboard,
  PlusCircle,
  Search,
  Server,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/config/routes';
import { domains } from '@/data/domains';
import type { PortalRole } from '@/types';

export type PortalNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string;
};

export type PortalNavSection = {
  label?: string;
  items: PortalNavItem[];
};

function buildDeveloperNav(providerDomains: string[]): PortalNavSection[] {
  const sections: PortalNavSection[] = [
    {
      label: 'Consumer',
      items: [
        {
          to: ROUTES.consumer.dashboard,
          label: 'Dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        { to: ROUTES.consumer.catalog, label: 'API Catalog', icon: Search },
        {
          to: ROUTES.consumer.planner,
          label: 'Application Planner',
          icon: Sparkles,
          badge: 'AI',
        },
        {
          to: ROUTES.consumer.subscriptions,
          label: 'My Subscriptions',
          icon: FileKey,
        },
        {
          to: ROUTES.consumer.applications,
          label: 'My Applications',
          icon: AppWindow,
        },
      ],
    },
  ];

  if (providerDomains.length > 0) {
    const domainLabel = providerDomains
      .map((id) => domains.find((d) => d.domain_id === id)?.name ?? id)
      .join(', ');

    sections.push({
      label: `Publisher (${domainLabel})`,
      items: [
        {
          to: ROUTES.provider.dashboard,
          label: 'Provider Dashboard',
          icon: LayoutDashboard,
          end: true,
        },
        { to: ROUTES.provider.myApis, label: 'My APIs', icon: Server },
        { to: ROUTES.provider.register, label: 'Publish API', icon: PlusCircle },
        {
          to: ROUTES.provider.requests,
          label: 'Consumer Requests',
          icon: Users,
        },
      ],
    });
  } else {
    sections.push({
      items: [
        {
          to: ROUTES.developer.requestProvider,
          label: 'Request Publisher Access',
          icon: KeyRound,
        },
      ],
    });
  }

  return sections;
}

const llmAdminNav: PortalNavSection[] = [
  {
    label: 'LLM Admin',
    items: [
      {
        to: ROUTES.llmAdmin.dashboard,
        label: 'Dashboard',
        icon: LayoutDashboard,
        end: true,
      },
      { to: ROUTES.llmAdmin.myApis, label: 'My LLM APIs', icon: Brain },
      {
        to: ROUTES.llmAdmin.register,
        label: 'Register LLM API',
        icon: PlusCircle,
      },
      {
        to: ROUTES.llmAdmin.accessRequests,
        label: 'Access Requests',
        icon: ClipboardList,
      },
    ],
  },
];

const portalAdminNav: PortalNavSection[] = [
  {
    label: 'Portal Admin',
    items: [
      {
        to: ROUTES.admin.dashboard,
        label: 'Admin Dashboard',
        icon: LayoutDashboard,
        end: true,
      },
      { to: ROUTES.admin.proposals, label: 'Proposals Queue', icon: ClipboardList },
      { to: ROUTES.admin.publishing, label: 'Publishing Queue', icon: BookOpen },
      { to: ROUTES.admin.allApis, label: 'All APIs', icon: Server },
      {
        to: ROUTES.admin.providerRequests,
        label: 'Provider Access Requests',
        icon: KeyRound,
      },
      { to: ROUTES.admin.rbac, label: 'RBAC', icon: Shield },
      { to: ROUTES.admin.domains, label: 'Domain Registry', icon: Boxes },
      { to: ROUTES.admin.audit, label: 'Audit Log', icon: Activity },
      { to: ROUTES.consumer.catalog, label: 'Catalog (view)', icon: Search },
    ],
  },
];

export function buildPortalNavSections(
  role: PortalRole,
  providerDomains: string[],
): PortalNavSection[] {
  if (role === 'developer') return buildDeveloperNav(providerDomains);
  if (role === 'llm_admin') return llmAdminNav;
  return portalAdminNav;
}
