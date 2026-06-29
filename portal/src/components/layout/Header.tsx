import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { ChevronDown, Bell, LogOut } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { usePortal } from '@/store/AppStore';

import { users } from '@/data/users';

import { domains } from '@/data/domains';

import { ROUTES } from '@/config/routes';

import type { PortalRole } from '@/types';



const roleLabels: Record<PortalRole, string> = {

  developer: 'Developer',

  llm_admin: 'LLM & AI Admin',

  portal_admin: 'Portal Admin',

};



function getHomeRoute(role: PortalRole) {

  if (role === 'portal_admin') return ROUTES.admin.dashboard;

  if (role === 'llm_admin') return ROUTES.llmAdmin.dashboard;

  return ROUTES.consumer.dashboard;

}



export function RoleSwitcher() {

  const { state, dispatch } = usePortal();

  const navigate = useNavigate();

  const user = state.currentUser;

  if (!user) return null;



  const switchPersona = (u: typeof users[number]) => {

    dispatch({ type: 'LOGIN', payload: { user: u, role: u.portal_roles[0] } });

    navigate(getHomeRoute(u.portal_roles[0]));

  };



  const providerBadges = user.provider_domains

    .map((id) => domains.find((d) => d.domain_id === id)?.code.toUpperCase())

    .filter(Boolean);



  return (

    <DropdownMenu.Root>

      <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg border border-slate-200 bg-brand-white px-3 py-1.5 text-sm hover:bg-slate-50">

        <div className="h-7 w-7 rounded-full bg-brand-green text-brand-white flex items-center justify-center text-xs font-bold">

          {user.display_name.charAt(0)}

        </div>

        <div className="text-left hidden sm:block">

          <p className="font-medium text-slate-800">{user.display_name}</p>

          <p className="text-xs text-slate-500">

            {roleLabels[state.activeRole!]}

            {providerBadges.length > 0 && (

              <span className="ml-1 text-brand-green">· Publisher: {providerBadges.join(', ')}</span>

            )}

          </p>

        </div>

        <ChevronDown className="h-4 w-4 text-slate-400" />

      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>

        <DropdownMenu.Content className="min-w-[240px] rounded-lg border border-slate-200 bg-brand-white p-1 shadow-lg z-50">

          <DropdownMenu.Label className="px-2 py-1.5 text-xs text-slate-500">Switch persona</DropdownMenu.Label>

          {users.map((u) => (

            <DropdownMenu.Item

              key={u.user_id}

              className="rounded px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-slate-50"

              onSelect={() => switchPersona(u)}

            >

              {u.display_name} — {roleLabels[u.portal_roles[0]]}

              {u.portal_roles[0] === 'developer' && (

                <span className={u.provider_domains.length > 0 ? 'text-brand-green' : 'text-slate-400'}>

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



export function Header() {

  const { state, dispatch, syncStatus } = usePortal();

  const navigate = useNavigate();

  const unread = state.notifications.filter((n) => !n.read).length;



  return (

    <header className="h-14 border-b border-slate-200 bg-brand-white flex items-center justify-between px-4">

      <h1 className="text-lg font-semibold text-slate-800">Enterprise API Portal</h1>

      <div className="flex items-center gap-3">

        <span
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            syncStatus === 'synced'
              ? 'bg-brand-green-light text-brand-green'
              : syncStatus === 'loading'
                ? 'bg-slate-100 text-slate-500'
                : 'bg-orange-100 text-orange-700'
          }`}
          title={
            syncStatus === 'synced'
              ? 'Changes are saved and shared across all users'
              : syncStatus === 'loading'
                ? 'Loading shared data…'
                : 'Could not reach the shared data server'
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              syncStatus === 'synced' ? 'bg-brand-green' : syncStatus === 'loading' ? 'bg-slate-400 animate-pulse' : 'bg-orange-500'
            }`}
          />
          {syncStatus === 'synced' ? 'Live' : syncStatus === 'loading' ? 'Syncing…' : 'Offline'}
        </span>

        <button type="button" className="relative p-2 rounded-lg hover:bg-slate-50" aria-label="Notifications">

          <Bell className="h-5 w-5 text-slate-500" />

          {unread > 0 && (

            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />

          )}

        </button>

        <RoleSwitcher />

        <button

          type="button"

          onClick={() => {

            dispatch({ type: 'LOGOUT' });

            navigate(ROUTES.login);

          }}

          className="p-2 rounded-lg hover:bg-slate-50 text-slate-500"

          aria-label="Logout"

        >

          <LogOut className="h-5 w-5" />

        </button>

      </div>

    </header>

  );

}


