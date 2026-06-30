import { useMemo } from 'react';
import { usePortal } from '@/store/AppStore';
import type { API } from '@/types';

/**
 * Catalog visibility per security-model / W4:
 * - portal_admin sees everything.
 * - llm_admin sees every AI-domain API (it manages them) and, like a consumer,
 *   published APIs from other domains.
 * - everyone else sees only published APIs, minus restricted, minus confidential
 *   outside their own domain.
 */
export function useVisibleApis(apis: API[]) {
  const { state } = usePortal();
  const user = state.currentUser;
  const role = state.activeRole;

  return useMemo(() => {
    if (!user) return [];
    return apis.filter((api) => {
      if (role === 'portal_admin') return true;
      if (role === 'llm_admin' && api.domain_id === 'dom_ai') return true;
      if (api.lifecycle_status !== 'published') return false;
      if (api.classification === 'restricted') return false;
      if (api.classification === 'confidential' && api.domain_id !== user.domain_id) return false;
      return true;
    });
  }, [apis, user, role]);
}

export function canViewApi(api: API, userDomainId?: string, role?: string | null) {
  if (role === 'portal_admin' || role === 'llm_admin') return true;
  if (api.classification === 'restricted') return false;
  if (api.classification === 'confidential' && api.domain_id !== userDomainId) return false;
  return true;
}
