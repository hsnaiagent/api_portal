import { useMemo } from 'react';

import { usePortal } from '@/store/AppStore';

import type { API } from '@/types';



export function useVisibleApis(apis: API[]) {

  const { state } = usePortal();

  const user = state.currentUser;



  return useMemo(() => {

    if (!user) return [];

    return apis.filter((api) => {

      if (api.lifecycle_status !== 'published' && state.activeRole !== 'portal_admin' && state.activeRole !== 'llm_admin') {

        return false;

      }

      if (state.activeRole === 'portal_admin' || state.activeRole === 'llm_admin') {

        if (state.activeRole === 'llm_admin' && api.domain_id !== 'dom_ai' && api.lifecycle_status !== 'published') {

          return api.domain_id === 'dom_ai';

        }

        return state.activeRole === 'portal_admin' || api.domain_id === 'dom_ai';

      }

      if (api.lifecycle_status !== 'published') return false;

      if (api.classification === 'restricted') return false;

      if (api.classification === 'confidential' && api.domain_id !== user.domain_id) return false;

      return true;

    });

  }, [apis, user, state.activeRole]);

}



export function canViewApi(api: API, userDomainId?: string, role?: string | null) {

  if (role === 'portal_admin' || role === 'llm_admin') return true;

  if (api.classification === 'restricted') return false;

  if (api.classification === 'confidential' && api.domain_id !== userDomainId) return false;

  return true;

}


