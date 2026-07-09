import { NavLink } from 'react-router-dom';

import { ROUTES } from '@/config/routes';

import { usePortal } from '@/store/AppStore';

import { domains } from '@/data/domains';

import type { PortalRole } from '@/types';

import {
  LayoutDashboard,
  Search,
  FileKey,
  AppWindow,
  Sparkles,
  Server,
  PlusCircle,
  Users,
  Shield,
  ClipboardList,
  BookOpen,
  Activity,
  KeyRound,
  Brain,
  Boxes,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { BRAND } from '@/config/brand';

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

type NavSection = { type: 'item'; item: NavItem } | { type: 'divider'; label: string };

function buildDeveloperNav(providerDomains: string[]): NavSection[] {
  const sections: NavSection[] = [
    {
      type: 'item',
      item: { to: ROUTES.consumer.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
    },

    { type: 'item', item: { to: ROUTES.consumer.catalog, label: 'API Catalog', icon: Search } },

    {
      type: 'item',
      item: { to: ROUTES.consumer.planner, label: 'Application Planner', icon: Sparkles },
    },

    {
      type: 'item',
      item: { to: ROUTES.consumer.subscriptions, label: 'My Subscriptions', icon: FileKey },
    },

    {
      type: 'item',
      item: { to: ROUTES.consumer.applications, label: 'My Applications', icon: AppWindow },
    },
  ];

  if (providerDomains.length > 0) {
    const domainLabel = providerDomains

      .map((id) => domains.find((d) => d.domain_id === id)?.name ?? id)

      .join(', ');

    sections.push({ type: 'divider', label: `Publisher (${domainLabel})` });

    sections.push({
      type: 'item',
      item: {
        to: ROUTES.provider.dashboard,
        label: 'Provider Dashboard',
        icon: LayoutDashboard,
        end: true,
      },
    });

    sections.push({
      type: 'item',
      item: { to: ROUTES.provider.myApis, label: 'My APIs', icon: Server },
    });

    sections.push({
      type: 'item',
      item: { to: ROUTES.provider.register, label: 'Publish API', icon: PlusCircle },
    });

    sections.push({
      type: 'item',
      item: { to: ROUTES.provider.requests, label: 'Consumer Requests', icon: Users },
    });
  } else {
    sections.push({
      type: 'item',
      item: {
        to: ROUTES.developer.requestProvider,
        label: 'Request Publisher Access',
        icon: KeyRound,
      },
    });
  }

  return sections;
}

const llmAdminNav: NavItem[] = [
  { to: ROUTES.llmAdmin.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },

  { to: ROUTES.llmAdmin.myApis, label: 'My LLM APIs', icon: Brain },

  { to: ROUTES.llmAdmin.register, label: 'Register LLM API', icon: PlusCircle },

  { to: ROUTES.llmAdmin.accessRequests, label: 'Access Requests', icon: ClipboardList },
];

const portalAdminNav: NavItem[] = [
  { to: ROUTES.admin.dashboard, label: 'Admin Dashboard', icon: LayoutDashboard, end: true },

  { to: ROUTES.admin.proposals, label: 'Proposals Queue', icon: ClipboardList },

  { to: ROUTES.admin.publishing, label: 'Publishing Queue', icon: BookOpen },

  { to: ROUTES.admin.allApis, label: 'All APIs', icon: Server },

  { to: ROUTES.admin.providerRequests, label: 'Provider Access Requests', icon: KeyRound },

  { to: ROUTES.admin.rbac, label: 'RBAC', icon: Shield },

  { to: ROUTES.admin.domains, label: 'Domain Registry', icon: Boxes },

  { to: ROUTES.admin.audit, label: 'Audit Log', icon: Activity },

  { to: ROUTES.consumer.catalog, label: 'Catalog (view)', icon: Search },
];

function getNavSections(role: PortalRole, providerDomains: string[]): NavSection[] | NavItem[] {
  if (role === 'developer') return buildDeveloperNav(providerDomains);

  if (role === 'llm_admin') return llmAdminNav;

  return portalAdminNav;
}

export function Sidebar() {
  const { state } = usePortal();

  const role = state.activeRole;

  const user = state.currentUser;

  if (!role || !user) return null;

  const nav = getNavSections(role, user.provider_domains);

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-brand-white flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <img src={BRAND.greenLogoPath} alt={BRAND.name} className="h-8" />

        <p className="text-xs text-slate-500 mt-2">{BRAND.tagline}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {Array.isArray(nav) && 'type' in (nav[0] ?? {})
          ? (nav as NavSection[]).map((section, idx) =>
              section.type === 'divider' ? (
                <p
                  key={idx}
                  className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {section.label}
                </p>
              ) : (
                <NavLink
                  key={section.item.to}

                  to={section.item.to}

                  end={section.item.end}

                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',

                      isActive
                        ? 'bg-brand-green-light text-brand-green'
                        : 'text-slate-600 hover:bg-slate-50',
                    )
                  }
                >
                  <section.item.icon className="h-4 w-4" />

                  {section.item.label}
                </NavLink>
              ),
            )
          : (nav as NavItem[]).map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}

                to={to}

                end={end}

                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',

                    isActive
                      ? 'bg-brand-green-light text-brand-green'
                      : 'text-slate-600 hover:bg-slate-50',
                  )
                }
              >
                <Icon className="h-4 w-4" />

                {label}
              </NavLink>
            ))}
      </nav>
    </aside>
  );
}
