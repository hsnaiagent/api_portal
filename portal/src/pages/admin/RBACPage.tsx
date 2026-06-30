import { useMemo, useState } from 'react';
import { users } from '@/data/users';
import { domains } from '@/data/domains';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import type { PortalRole } from '@/types';

const roleLabels: Record<PortalRole, string> = {
  developer: 'Developer',
  llm_admin: 'LLM & AI Admin',
  portal_admin: 'Portal Admin',
};

export function RBACPage() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const primaryRole = u.portal_roles[0];
      if (roleFilter && primaryRole !== roleFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const domainNames = u.provider_domains
          .map((id) => domains.find((d) => d.domain_id === id)?.name ?? id)
          .join(' ')
          .toLowerCase();
        return (
          u.display_name.toLowerCase().includes(q)
          || u.email.toLowerCase().includes(q)
          || roleLabels[primaryRole].toLowerCase().includes(q)
          || domainNames.includes(q)
        );
      }
      return true;
    });
  }, [query, roleFilter]);

  const hasActiveFilters = Boolean(query || roleFilter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">RBAC Management</h1>
      <p className="text-sm text-slate-500">Three-persona model — demo users and assigned portal roles (read-only in mockup)</p>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name, email, or domain..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setRoleFilter('');
        }}
        resultLabel={`${filtered.length} of ${users.length} users`}
      >
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All roles</option>
          {(Object.keys(roleLabels) as PortalRole[]).map((role) => (
            <option key={role} value={role}>{roleLabels[role]}</option>
          ))}
        </select>
      </ListFilterBar>
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
            {filtered.map((u) => (
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
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No users match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
