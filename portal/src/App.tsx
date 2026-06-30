import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AppStoreProvider, usePortal } from '@/store/AppStore';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ROUTES } from '@/config/routes';
import { roleLandingPath } from '@/lib/navigation';

const named = <T extends object>(p: Promise<T>, key: keyof T) =>
  p.then((m) => ({ default: m[key] as React.ComponentType }));

const ConsumerDashboard = lazy(() =>
  named(import('@/pages/consumer/ConsumerDashboard'), 'ConsumerDashboard'),
);
const CatalogPage = lazy(() => named(import('@/pages/consumer/CatalogPage'), 'CatalogPage'));
const ApiDetailPage = lazy(() => named(import('@/pages/consumer/ApiDetailPage'), 'ApiDetailPage'));
const SubscriptionsPage = lazy(() =>
  named(import('@/pages/consumer/SubscriptionsPage'), 'SubscriptionsPage'),
);
const ApplicationsPage = lazy(() =>
  named(import('@/pages/consumer/ApplicationsPage'), 'ApplicationsPage'),
);
const ApplicationPlanner = lazy(() =>
  named(import('@/pages/consumer/ApplicationPlanner'), 'ApplicationPlanner'),
);
const ProviderAccessRequestPage = lazy(() =>
  named(import('@/pages/developer/ProviderAccessRequestPage'), 'ProviderAccessRequestPage'),
);
const ProviderDashboard = lazy(() =>
  named(import('@/pages/provider/ProviderDashboard'), 'ProviderDashboard'),
);
const MyApisPage = lazy(() => named(import('@/pages/provider/MyApisPage'), 'MyApisPage'));
const RegisterApiPage = lazy(() =>
  named(import('@/pages/provider/RegisterApiPage'), 'RegisterApiPage'),
);
const ApiManagePage = lazy(() => named(import('@/pages/provider/ApiManagePage'), 'ApiManagePage'));
const ConsumerRequestsPage = lazy(() =>
  named(import('@/pages/provider/ConsumerRequestsPage'), 'ConsumerRequestsPage'),
);
const LLMAdminDashboard = lazy(() =>
  named(import('@/pages/llm-admin/LLMAdminDashboard'), 'LLMAdminDashboard'),
);
const LLMApiManagePage = lazy(() =>
  named(import('@/pages/llm-admin/LLMApiManagePage'), 'LLMApiManagePage'),
);
const LLMApiManageDetailPage = lazy(() =>
  named(import('@/pages/llm-admin/LLMApiManageDetailPage'), 'LLMApiManageDetailPage'),
);
const RegisterLLMApiPage = lazy(() =>
  named(import('@/pages/llm-admin/RegisterLLMApiPage'), 'RegisterLLMApiPage'),
);
const LLMSubscriptionQueuePage = lazy(() =>
  named(import('@/pages/llm-admin/LLMSubscriptionQueuePage'), 'LLMSubscriptionQueuePage'),
);
const AdminDashboard = lazy(() => named(import('@/pages/admin/AdminDashboard'), 'AdminDashboard'));
const ProposalsQueuePage = lazy(() =>
  named(import('@/pages/admin/ProposalsQueuePage'), 'ProposalsQueuePage'),
);
const PublishingQueuePage = lazy(() =>
  named(import('@/pages/admin/PublishingQueuePage'), 'PublishingQueuePage'),
);
const AllApisPage = lazy(() => named(import('@/pages/admin/AllApisPage'), 'AllApisPage'));
const ProviderAccessQueuePage = lazy(() =>
  named(import('@/pages/admin/ProviderAccessQueuePage'), 'ProviderAccessQueuePage'),
);
const RBACPage = lazy(() => named(import('@/pages/admin/RBACPage'), 'RBACPage'));
const AuditLogPage = lazy(() => named(import('@/pages/admin/AuditLogPage'), 'AuditLogPage'));
const DomainsPage = lazy(() => named(import('@/pages/admin/DomainsPage'), 'DomainsPage'));

function RootRedirect() {
  const { state } = usePortal();
  if (!state.currentUser) return <Navigate to={ROUTES.login} replace />;
  return <Navigate to={roleLandingPath(state.activeRole)} replace />;
}

function RouteFallback() {
  return (
    <div className="flex h-full items-center justify-center py-16 text-sm text-slate-500">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Outlet />
                </Suspense>
              }
            >
              <Route path="/" element={<RootRedirect />} />
              <Route path={ROUTES.consumer.dashboard} element={<ConsumerDashboard />} />
              <Route path={ROUTES.consumer.catalog} element={<CatalogPage />} />
              <Route path="/consumer/apis/:id" element={<ApiDetailPage />} />
              <Route path={ROUTES.consumer.subscriptions} element={<SubscriptionsPage />} />
              <Route path={ROUTES.consumer.applications} element={<ApplicationsPage />} />
              <Route path={ROUTES.consumer.planner} element={<ApplicationPlanner />} />
              <Route
                path={ROUTES.developer.requestProvider}
                element={<ProviderAccessRequestPage />}
              />
              <Route path={ROUTES.provider.dashboard} element={<ProviderDashboard />} />
              <Route path={ROUTES.provider.myApis} element={<MyApisPage />} />
              <Route path={ROUTES.provider.register} element={<RegisterApiPage />} />
              <Route path="/provider/apis/:id/manage" element={<ApiManagePage />} />
              <Route path={ROUTES.provider.requests} element={<ConsumerRequestsPage />} />
              <Route path={ROUTES.llmAdmin.dashboard} element={<LLMAdminDashboard />} />
              <Route path={ROUTES.llmAdmin.myApis} element={<LLMApiManagePage />} />
              <Route path={ROUTES.llmAdmin.register} element={<RegisterLLMApiPage />} />
              <Route path="/llm-admin/apis/:id/manage" element={<LLMApiManageDetailPage />} />
              <Route path={ROUTES.llmAdmin.accessRequests} element={<LLMSubscriptionQueuePage />} />
              <Route path={ROUTES.admin.dashboard} element={<AdminDashboard />} />
              <Route path={ROUTES.admin.proposals} element={<ProposalsQueuePage />} />
              <Route path={ROUTES.admin.publishing} element={<PublishingQueuePage />} />
              <Route path={ROUTES.admin.allApis} element={<AllApisPage />} />
              <Route path={ROUTES.admin.providerRequests} element={<ProviderAccessQueuePage />} />
              <Route path={ROUTES.admin.rbac} element={<RBACPage />} />
              <Route path={ROUTES.admin.domains} element={<DomainsPage />} />
              <Route path={ROUTES.admin.audit} element={<AuditLogPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStoreProvider>
  );
}
