import { ROUTES } from '@/config/routes';
import type { PortalRole } from '@/types';

/** The dashboard a given role should land on after login or when hitting `/`. */
export function roleLandingPath(role: PortalRole | null): string {
  if (role === 'portal_admin') return ROUTES.admin.dashboard;
  if (role === 'llm_admin') return ROUTES.llmAdmin.dashboard;
  return ROUTES.consumer.dashboard;
}
