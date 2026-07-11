import { Navigate } from 'react-router-dom';
import { Code2, Brain, Shield, type LucideIcon } from 'lucide-react';
import { users } from '@/data/users';
import { usePortal } from '@/store/AppStore';
import { ROUTES } from '@/config/routes';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import type { PortalRole } from '@/types';

const platformAdmins = [
  {
    userId: 'user_portal_admin',
    role: 'portal_admin' as PortalRole,
    title: 'Portal Admin',
    description: 'Full platform control. RBAC, audit, provider elevation, all APIs.',
    icon: Shield,
    accent: 'border-border hover:border-border-strong hover:bg-muted/40',
    iconBg: 'bg-muted text-foreground',
  },
];

const developers: {
  userId: string;
  role: PortalRole;
  title: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  iconBg: string;
}[] = [
  {
    userId: 'user_developer',
    role: 'developer',
    title: 'Ahmad Al-Rashidi',
    description: 'HR API publisher · owns HR APIs',
    accent: 'border-primary/30 hover:border-primary/50 hover:bg-brand-subtle/40',
    icon: Code2,
    iconBg: 'bg-brand-subtle text-brand',
  },
  {
    userId: 'user_murad',
    role: 'developer',
    title: 'Murad',
    description: 'Finance publisher · owns Finance APIs',
    accent: 'border-link/30 hover:border-link/50 hover:bg-link-subtle/40',
    icon: Code2,
    iconBg: 'bg-brand-subtle text-brand',
  },
  {
    userId: 'user_ali',
    role: 'developer',
    title: 'Ali',
    description: 'Consumer only · no publisher access',
    accent: 'border-border hover:border-border-strong hover:bg-muted/40',
    icon: Code2,
    iconBg: 'bg-brand-subtle text-brand',
  },
  {
    userId: 'user_llm_admin',
    role: 'llm_admin',
    title: 'LLM & AI APIs Admin',
    description: 'Publish and govern AI model APIs. Review ROI-justified access requests.',
    accent: 'border-link/30 hover:border-link/50 hover:bg-link-subtle/40',
    icon: Brain,
    iconBg: 'bg-link-subtle text-link',
  },
];

function getHomeRoute(role: PortalRole) {
  if (role === 'portal_admin') return ROUTES.admin.dashboard;
  if (role === 'llm_admin') return ROUTES.llmAdmin.dashboard;
  return ROUTES.consumer.dashboard;
}

export function LoginPage() {
  const { state, dispatch } = usePortal();

  if (state.currentUser) {
    return <Navigate to={getHomeRoute(state.activeRole ?? 'developer')} replace />;
  }

  const loginAs = (userId: string, role: PortalRole) => {
    const user = users.find((u) => u.user_id === userId);
    if (!user) return;
    dispatch({ type: 'LOGIN', payload: { user, role } });
  };

  return (
    <AuthLayout>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={() => loginAs('user_developer', 'developer')}
      >
        Sign in with OAuth2
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Enterprise SSO — signs in as Ahmad (HR publisher) by default
      </p>

      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-sm font-medium text-foreground">Developers</p>
        {developers.map(({ userId, role, title, description, accent, icon: Icon, iconBg }) => {
          const user = users.find((u) => u.user_id === userId)!;
          return (
            <button
              key={userId}
              type="button"
              onClick={() => loginAs(userId, role)}
              className={`w-full rounded-xl border-2 bg-card p-4 text-left transition-colors ${accent}`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${iconBg}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  {title !== user.display_name && (
                    <p className="mt-2 text-xs font-medium text-brand">
                      → Sign in as {user.display_name}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-sm font-medium text-foreground">Platform admins</p>
        {platformAdmins.map(({ userId, role, title, description, icon: Icon, accent, iconBg }) => {
          const user = users.find((u) => u.user_id === userId)!;
          return (
            <button
              key={userId}
              type="button"
              onClick={() => loginAs(userId, role)}
              className={`w-full rounded-xl border-2 bg-card p-4 text-left transition-colors ${accent}`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${iconBg}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  <p className="mt-2 text-xs font-medium text-brand">
                    → Sign in as {user.display_name}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </AuthLayout>
  );
}
