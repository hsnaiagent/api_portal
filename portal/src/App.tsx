import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppStoreProvider } from '@/store/AppStore';

import { AppShell } from '@/components/layout/AppShell';

import { LoginPage } from '@/pages/auth/LoginPage';

import { ConsumerDashboard } from '@/pages/consumer/ConsumerDashboard';

import { CatalogPage } from '@/pages/consumer/CatalogPage';

import { ApiDetailPage } from '@/pages/consumer/ApiDetailPage';

import { SubscriptionsPage } from '@/pages/consumer/SubscriptionsPage';

import { ApplicationsPage } from '@/pages/consumer/ApplicationsPage';

import { ApplicationPlanner } from '@/pages/consumer/ApplicationPlanner';

import { ProviderAccessRequestPage } from '@/pages/developer/ProviderAccessRequestPage';

import { ProviderDashboard } from '@/pages/provider/ProviderDashboard';

import { MyApisPage } from '@/pages/provider/MyApisPage';

import { RegisterApiPage } from '@/pages/provider/RegisterApiPage';

import { ApiManagePage } from '@/pages/provider/ApiManagePage';

import { ConsumerRequestsPage } from '@/pages/provider/ConsumerRequestsPage';

import { LLMAdminDashboard } from '@/pages/llm-admin/LLMAdminDashboard';

import { LLMApiManagePage } from '@/pages/llm-admin/LLMApiManagePage';

import { LLMApiManageDetailPage } from '@/pages/llm-admin/LLMApiManageDetailPage';

import { RegisterLLMApiPage } from '@/pages/llm-admin/RegisterLLMApiPage';

import { LLMSubscriptionQueuePage } from '@/pages/llm-admin/LLMSubscriptionQueuePage';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';

import { ProposalsQueuePage } from '@/pages/admin/ProposalsQueuePage';

import { PublishingQueuePage } from '@/pages/admin/PublishingQueuePage';

import { AllApisPage } from '@/pages/admin/AllApisPage';

import { ProviderAccessQueuePage } from '@/pages/admin/ProviderAccessQueuePage';

import { RBACPage } from '@/pages/admin/RBACPage';

import { AuditLogPage } from '@/pages/admin/AuditLogPage';

import { ROUTES } from '@/config/routes';

import { usePortal } from '@/store/AppStore';

import { roleLandingPath } from '@/lib/navigation';



function RootRedirect() {

  const { state } = usePortal();

  if (!state.currentUser) return <Navigate to={ROUTES.login} replace />;

  return <Navigate to={roleLandingPath(state.activeRole)} replace />;

}



export default function App() {

  return (

    <AppStoreProvider>

      <BrowserRouter>

        <Routes>

          <Route path={ROUTES.login} element={<LoginPage />} />

          <Route element={<AppShell />}>

            <Route path="/" element={<RootRedirect />} />

            <Route path={ROUTES.consumer.dashboard} element={<ConsumerDashboard />} />

            <Route path={ROUTES.consumer.catalog} element={<CatalogPage />} />

            <Route path="/consumer/apis/:id" element={<ApiDetailPage />} />

            <Route path={ROUTES.consumer.subscriptions} element={<SubscriptionsPage />} />

            <Route path={ROUTES.consumer.applications} element={<ApplicationsPage />} />

            <Route path={ROUTES.consumer.planner} element={<ApplicationPlanner />} />

            <Route path={ROUTES.developer.requestProvider} element={<ProviderAccessRequestPage />} />

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

            <Route path={ROUTES.admin.audit} element={<AuditLogPage />} />

          </Route>

        </Routes>

      </BrowserRouter>

    </AppStoreProvider>

  );

}


