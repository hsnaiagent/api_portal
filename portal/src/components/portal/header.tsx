import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { usePortal } from '@/store/AppStore';
import { users } from '@/data/users';
import { domains } from '@/data/domains';
import { roleLandingPath } from '@/lib/navigation';
import type { PortalRole } from '@/types';

export type Crumb = { label: string; href?: string };

const roleLabels: Record<PortalRole, string> = {
  developer: 'Developer',
  llm_admin: 'LLM & AI Admin',
  portal_admin: 'Portal Admin',
};

function RoleSwitcher() {
  const { state, dispatch } = usePortal();
  const navigate = useNavigate();
  const user = state.currentUser;

  if (!user) return null;

  const switchPersona = (u: (typeof users)[number]) => {
    dispatch({ type: 'LOGIN', payload: { user: u, role: u.portal_roles[0] } });
    navigate(roleLandingPath(u.portal_roles[0]));
  };

  const providerBadges = user.provider_domains
    .map((id) => domains.find((d) => d.domain_id === id)?.code.toUpperCase())
    .filter(Boolean);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted">
        <div className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
          {user.display_name.charAt(0)}
        </div>
        <div className="hidden text-left sm:block">
          <p className="font-medium text-foreground">{user.display_name}</p>
          <p className="text-xs text-muted-foreground">
            {state.activeRole ? roleLabels[state.activeRole] : ''}
            {providerBadges.length > 0 && (
              <span className="ml-1 text-brand">· Publisher: {providerBadges.join(', ')}</span>
            )}
          </p>
        </div>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-50 min-w-[240px] rounded-lg border border-border bg-popover p-1 shadow-lg">
          <DropdownMenu.Label className="px-2 py-1.5 text-xs text-muted-foreground">
            Switch persona
          </DropdownMenu.Label>
          {users.map((u) => (
            <DropdownMenu.Item
              key={u.user_id}
              className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
              onSelect={() => switchPersona(u)}
            >
              {u.display_name} — {roleLabels[u.portal_roles[0]]}
              {u.portal_roles[0] === 'developer' && (
                <span
                  className={
                    u.provider_domains.length > 0 ? 'text-brand' : 'text-muted-foreground'
                  }
                >
                  {u.provider_domains.length > 0 ? ' · publisher' : ' · consumer'}
                </span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function Header({
  breadcrumbs,
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}: {
  breadcrumbs: Crumb[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}) {
  const { state, dispatch, syncStatus } = usePortal();
  const navigate = useNavigate();
  const unread = state.notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobile}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-pressed={collapsed}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </Button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span aria-current="page" className="truncate font-medium text-foreground">
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <Link
                    to={crumb.href}
                    className={cn(
                      'truncate text-muted-foreground outline-none transition-colors hover:text-link focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/50',
                      i === 0 && 'hidden sm:inline',
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate text-muted-foreground">{crumb.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            'hidden items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex',
            syncStatus === 'synced'
              ? 'bg-status-active-bg text-status-active-foreground'
              : syncStatus === 'loading'
                ? 'bg-muted text-muted-foreground'
                : 'bg-status-pending-bg text-status-pending-foreground',
          )}
          title={
            syncStatus === 'synced'
              ? 'Changes are saved and shared across all users'
              : syncStatus === 'loading'
                ? 'Loading shared data…'
                : 'Could not reach the shared data server'
          }
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              syncStatus === 'synced'
                ? 'bg-status-active'
                : syncStatus === 'loading'
                  ? 'animate-pulse bg-muted-foreground'
                  : 'bg-status-pending',
            )}
          />
          {syncStatus === 'synced' ? 'Live' : syncStatus === 'loading' ? 'Syncing…' : 'Offline'}
        </span>

        <Button
          variant="ghost"
          size="icon"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          className="relative"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>

        <RoleSwitcher />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            dispatch({ type: 'LOGOUT' });
            navigate(ROUTES.login);
          }}
          aria-label="Logout"
        >
          <LogOut className="size-5" />
        </Button>
      </div>
    </header>
  );
}
