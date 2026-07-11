import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { BRAND } from '@/config/brand';
import { usePortal } from '@/store/AppStore';
import { buildPortalNavSections, type PortalNavSection } from '@/lib/build-nav-sections';
import type { PortalRole } from '@/types';

const roleLabels: Record<PortalRole, string> = {
  developer: 'Developer',
  llm_admin: 'LLM & AI Admin',
  portal_admin: 'Portal Admin',
};

export function Sidebar({
  sections,
  collapsed = false,
  onNavigate,
}: {
  sections?: PortalNavSection[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { state } = usePortal();
  const user = state.currentUser;
  const role = state.activeRole;

  const navSections =
    sections ??
    (role && user ? buildPortalNavSections(role, user.provider_domains) : []);

  const providerSuffix =
    user && user.provider_domains.length > 0 ? ' · Publisher' : '';

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-sidebar-border',
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-5',
        )}
      >
        {collapsed ? (
          <img
            src={BRAND.greenLogoPath}
            alt={BRAND.name}
            className="size-9 shrink-0 rounded-lg object-contain"
          />
        ) : (
          <div className="min-w-0">
            <img src={BRAND.greenLogoPath} alt={BRAND.name} className="h-8 w-auto object-contain" />
            <p className="truncate text-xs text-sidebar-muted">{BRAND.tagline}</p>
          </div>
        )}
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navSections.map((section, sectionIdx) => (
          <div key={section.label ?? `section-${sectionIdx}`}>
            {!collapsed && section.label && (
              <p className="px-2 pb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-sidebar-muted">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={() => onNavigate?.()}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center rounded-lg text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
                          collapsed ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2',
                          isActive
                            ? 'bg-sidebar-active text-sidebar-active-foreground'
                            : 'text-sidebar-muted hover:bg-muted hover:text-sidebar-foreground',
                        )
                      }
                    >
                      <Icon className="size-[1.15rem] shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                'rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold',
                                item.badge === 'AI'
                                  ? 'bg-link-subtle text-link-hover'
                                  : 'bg-brand text-brand-foreground',
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div
          className={cn(
            'flex shrink-0 items-center border-t border-sidebar-border',
            collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5',
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-xs font-semibold text-accent-foreground">
            {user.display_name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.display_name}
              </p>
              <p className="truncate text-xs text-sidebar-muted">
                {role ? roleLabels[role] : ''}
                {providerSuffix}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
