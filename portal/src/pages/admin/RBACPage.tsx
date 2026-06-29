import { users } from '@/data/users';

import { domains } from '@/data/domains';

import type { PortalRole } from '@/types';



const roleLabels: Record<PortalRole, string> = {

  developer: 'Developer',

  llm_admin: 'LLM & AI Admin',

  portal_admin: 'Portal Admin',

};



export function RBACPage() {

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">RBAC Management</h1>

      <p className="text-sm text-slate-500">Three-persona model — demo users and assigned portal roles (read-only in mockup)</p>

      <div className="overflow-x-auto rounded-xl border bg-brand-white">

        <table className="w-full text-sm">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-4 py-3 text-left">User</th>

              <th className="px-4 py-3">Email</th>

              <th className="px-4 py-3">Role</th>

              <th className="px-4 py-3">Publisher Domains</th>

            </tr>

          </thead>

          <tbody>

            {users.map((u) => (

              <tr key={u.user_id} className="border-t">

                <td className="px-4 py-3 font-medium">{u.display_name}</td>

                <td className="px-4 py-3">{u.email}</td>

                <td className="px-4 py-3">{roleLabels[u.portal_roles[0]]}</td>

                <td className="px-4 py-3">

                  {u.provider_domains.length

                    ? u.provider_domains.map((id) => domains.find((d) => d.domain_id === id)?.name ?? id).join(', ')

                    : '—'}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}


