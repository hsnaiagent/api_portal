import type { API, User } from '@/types';



export function getManagedApis(apis: API[], user: User | null, role: string | null): API[] {

  if (!user) return [];

  if (role === 'llm_admin') return apis.filter((a) => a.domain_id === 'dom_ai');

  if (role === 'developer') {

    return apis.filter(

      (a) => user.provider_domains.includes(a.domain_id) || a.owner_user_id === user.user_id,

    );

  }

  return apis.filter((a) => a.owner_user_id === user.user_id);

}



export function canManageApi(api: API, user: User | null, role: string | null): boolean {

  return getManagedApis([api], user, role).length > 0;

}



export function isLlmApi(api: { domain_id: string }) {

  return api.domain_id === 'dom_ai';

}



export function calculateLlmRoi(fields: {

  frequency_before: number;

  frequency_after: number;

  time_before_minutes: number;

  time_after_minutes: number;

  expected_users: number;

}) {

  const timeSavedPerUse = Math.max(0, fields.time_before_minutes - fields.time_after_minutes);

  const frequencyReduction = Math.max(0, fields.frequency_before - fields.frequency_after);

  const perUserWeekly =

    timeSavedPerUse * fields.frequency_before +

    fields.time_after_minutes * frequencyReduction;

  const totalWeekly = perUserWeekly * Math.max(1, fields.expected_users);

  return {

    timeSavedPerUse,

    frequencyReduction,

    perUserWeeklyMinutes: perUserWeekly,

    totalWeeklyMinutes: totalWeekly,

    totalWeeklyHours: Math.round((totalWeekly / 60) * 10) / 10,

  };

}


