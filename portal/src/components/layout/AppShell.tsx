import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PortalShell } from '@/components/portal/portal-shell';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { usePortal } from '@/store/AppStore';
import { ROUTES } from '@/config/routes';
import { buildBreadcrumbs } from '@/lib/breadcrumbs';
import { buildPortalNavSections } from '@/lib/build-nav-sections';

export function AppShell() {
  const { state } = usePortal();
  const location = useLocation();

  if (!state.currentUser) return <Navigate to={ROUTES.login} replace />;

  const role = state.activeRole;
  const sections =
    role && state.currentUser
      ? buildPortalNavSections(role, state.currentUser.provider_domains)
      : [];

  const breadcrumbs = buildBreadcrumbs(location.pathname, role);

  return (
    <>
      <PortalShell breadcrumbs={breadcrumbs} sections={sections}>
        <Outlet />
      </PortalShell>
      <ToastContainer />
      <AIAssistant />
    </>
  );
}
