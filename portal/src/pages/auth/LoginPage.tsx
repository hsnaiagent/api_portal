import { Navigate } from 'react-router-dom';

import { Code2, Brain, Shield } from 'lucide-react';

import { BRAND } from '@/config/brand';

import { users } from '@/data/users';

import { usePortal } from '@/store/AppStore';

import { ROUTES } from '@/config/routes';

import type { PortalRole } from '@/types';



const personas = [

  {

    userId: 'user_llm_admin',

    role: 'llm_admin' as PortalRole,

    title: 'LLM & AI APIs Admin',

    description: 'Publish and govern AI model APIs. Review ROI-justified access requests.',

    icon: Brain,

    accent: 'border-brand-blue hover:bg-brand-blue-light/30',

    iconBg: 'bg-brand-blue-light text-brand-blue',

  },

  {

    userId: 'user_portal_admin',

    role: 'portal_admin' as PortalRole,

    title: 'Portal Admin',

    description: 'Full platform control. RBAC, audit, provider elevation, all APIs.',

    icon: Shield,

    accent: 'border-slate-400 hover:bg-slate-50',

    iconBg: 'bg-slate-100 text-slate-700',

  },

];



const developers = [

  {

    userId: 'user_developer',

    title: 'Ahmad Al-Rashidi',

    description: 'HR API publisher · owns HR & Procurement APIs',

    accent: 'border-brand-green hover:bg-brand-green-light/30',

  },

  {

    userId: 'user_murad',

    title: 'Murad',

    description: 'Finance & Sales publisher · owns Finance, Sales & Operations APIs',

    accent: 'border-brand-blue hover:bg-brand-blue-light/30',

  },

  {

    userId: 'user_ali',

    title: 'Ali',

    description: 'Consumer only · no publisher access',

    accent: 'border-slate-300 hover:bg-slate-50',

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

    const user = users.find((u) => u.user_id === userId)!;

    dispatch({ type: 'LOGIN', payload: { user, role } });

  };



  return (

    <div className="min-h-screen flex">

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-green via-brand-green to-brand-blue-dark text-brand-white flex-col justify-center p-12">

        <img src={BRAND.logoPath} alt="" className="h-12 mb-8 invert brightness-0" />

        <h1 className="text-4xl font-bold">{BRAND.name}</h1>

        <p className="text-xl mt-4 opacity-90">{BRAND.tagline}</p>

        <p className="mt-8 opacity-80 max-w-md">

          Discover, govern, and connect enterprise APIs across HR, Finance, Operations, Procurement, Sales, and AI Platform — with intelligent assistance at every step.

        </p>

      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">

        <div className="w-full max-w-lg space-y-6">

          <div className="lg:hidden text-center mb-4">

            <img src={BRAND.logoPath} alt="" className="h-10 mx-auto" />

            <h1 className="text-2xl font-bold mt-4">{BRAND.name}</h1>

          </div>



          <button

            type="button"

            onClick={() => loginAs('user_developer', 'developer')}

            className="w-full rounded-lg bg-brand-green py-3 text-brand-white font-semibold hover:bg-brand-green-dark transition-colors"

          >

            Sign in with OAuth2

          </button>

          <p className="text-center text-xs text-slate-500">Enterprise SSO — signs in as Ahmad (HR publisher) by default</p>



          <div className="border-t border-slate-200 pt-6 space-y-3">

            <p className="text-sm font-medium text-slate-700">Developers</p>

            {developers.map(({ userId, title, description, accent }) => (

              <button

                key={userId}

                type="button"

                onClick={() => loginAs(userId, 'developer')}

                className={`w-full text-left rounded-xl border-2 bg-brand-white p-4 transition-colors ${accent}`}

              >

                <div className="flex items-start gap-3">

                  <div className="rounded-lg p-2 bg-brand-green-light text-brand-green">

                    <Code2 className="h-5 w-5" />

                  </div>

                  <div className="flex-1">

                    <p className="font-semibold text-slate-800">{title}</p>

                    <p className="text-sm text-slate-500 mt-1">{description}</p>

                  </div>

                </div>

              </button>

            ))}

          </div>



          <div className="border-t border-slate-200 pt-6 space-y-3">

            <p className="text-sm font-medium text-slate-700">Platform admins</p>

            {personas.map(({ userId, role, title, description, icon: Icon, accent, iconBg }) => {

              const user = users.find((u) => u.user_id === userId)!;

              return (

                <button

                  key={userId}

                  type="button"

                  onClick={() => loginAs(userId, role)}

                  className={`w-full text-left rounded-xl border-2 bg-brand-white p-4 transition-colors ${accent}`}

                >

                  <div className="flex items-start gap-3">

                    <div className={`rounded-lg p-2 ${iconBg}`}>

                      <Icon className="h-5 w-5" />

                    </div>

                    <div className="flex-1">

                      <p className="font-semibold text-slate-800">{title}</p>

                      <p className="text-sm text-slate-500 mt-1">{description}</p>

                      <p className="text-xs text-brand-green mt-2 font-medium">

                        → Sign in as {user.display_name}

                      </p>

                    </div>

                  </div>

                </button>

              );

            })}

          </div>

        </div>

      </div>

    </div>

  );

}


