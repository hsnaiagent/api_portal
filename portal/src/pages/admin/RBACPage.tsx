import { useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import type { PortalRole, User } from '@/types';

const roleLabels: Record<PortalRole, string> = {
  developer: 'Developer',
  llm_admin: 'LLM & AI Admin',
  portal_admin: 'Portal Admin',
};

export function RBACPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [draftRole, setDraftRole] = useState<PortalRole>('developer');
  const [draftDomains, setDraftDomains] = useState<string[]>([]);

  const domainName = (id: string) => state.domains.find((d) => d.domain_id === id)?.name ?? id;

  const filtered = useMemo(() => {
    return state.users.filter((u) => {
      const primaryRole = u.portal_roles[0];
      if (roleFilter && primaryRole !== roleFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const domainNames = u.provider_domains.map(domainName).join(' ').toLowerCase();
        return (
          u.display_name.toLowerCase().includes(q)
          || u.email.toLowerCase().includes(q)
          || roleLabels[primaryRole].toLowerCase().includes(q)
          || domainNames.includes(q)
        );
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.users, state.domains, query, roleFilter]);

  const hasActiveFilters = Boolean(query || roleFilter);

  const startEdit = (u: User) => {
    setEditing(u);
    setDraftRole(u.portal_roles[0]);
    setDraftDomains(u.provider_domains);
  };

  const toggleDomain = (id: string) => {
    setDraftDomains((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const save = () => {
    if (!editing || !state.currentUser) return;
    // Only developers can hold publisher domains.
    const provider_domains = draftRole === 'developer' ? draftDomains : [];
    dispatch({
      type: 'UPDATE_USER',
      payload: { user_id: editing.user_id, patch: { portal_roles: [draftRole], provider_domains } },
    });
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action: 'rbac.user.updated',
        entity_type: 'user',
        entity_id: editing.user_id,
        payload: { role: draftRole, provider_domains },
      },
    });
    notify('User updated', `${editing.display_name} is now ${roleLabels[draftRole]}.`, 'success');
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">RBAC Management</h1>
      <p className="text-sm text-slate-500">Assign portal roles and publisher domains. Changes are saved and audited.</p>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name, email, or domain..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setRoleFilter('');
        }}
        resultLabel={`${filtered.length} of ${state.users.length} users`}
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
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Publisher Domains</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.user_id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.display_name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{roleLabels[u.portal_roles[0]]}</td>
                <td className="px-4 py-3">
                  {u.provider_domains.length ? u.provider_domains.map(domainName).join(', ') : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => startEdit(u)} className="text-brand-blue hover:text-brand-blue-dark hover:underline">Edit</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">{state.users.length === 0 ? 'No users yet.' : 'No users match your filters.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-brand-white p-6 space-y-4">
            <h2 className="font-bold">Edit {editing.display_name}</h2>
            <div>
              <label htmlFor="rbac-role" className="block text-sm font-medium mb-1">Portal role</label>
              <select id="rbac-role" value={draftRole} onChange={(e) => setDraftRole(e.target.value as PortalRole)} className="w-full rounded-lg border px-3 py-2 text-sm">
                {(Object.keys(roleLabels) as PortalRole[]).map((role) => (
                  <option key={role} value={role}>{roleLabels[role]}</option>
                ))}
              </select>
            </div>
            {draftRole === 'developer' && (
              <div>
                <p className="text-sm font-medium mb-1">Publisher domains</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {state.domains.map((d) => (
                    <label key={d.domain_id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={draftDomains.includes(d.domain_id)} onChange={() => toggleDomain(d.domain_id)} />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm">Cancel</button>
              <button type="button" onClick={save} className="rounded-lg bg-brand-green px-4 py-2 text-brand-white text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
