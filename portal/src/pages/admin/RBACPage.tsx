import { useMemo, useState } from 'react';

import { usePortal } from '@/store/AppStore';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FilterSelect } from '@/components/ui/filter-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PortalRole, User } from '@/types';

const roleLabels: Record<PortalRole, string> = {
  developer: 'Developer',
  llm_admin: 'LLM & AI Admin',
  portal_admin: 'Portal Admin',
};

const roleBadgeVariant = (role: PortalRole) => {
  if (role === 'portal_admin') return 'brand' as const;
  if (role === 'llm_admin') return 'info' as const;
  return 'neutral' as const;
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
          u.display_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          roleLabels[primaryRole].toLowerCase().includes(q) ||
          domainNames.includes(q)
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

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        id: 'user',
        header: 'User',
        cell: (u) => <span className="font-medium">{u.display_name}</span>,
      },
      { id: 'email', header: 'Email', cell: (u) => u.email },
      {
        id: 'role',
        header: 'Role',
        cell: (u) => (
          <Badge variant={roleBadgeVariant(u.portal_roles[0])}>
            {roleLabels[u.portal_roles[0]]}
          </Badge>
        ),
      },
      {
        id: 'domains',
        header: 'Publisher Domains',
        cell: (u) =>
          u.provider_domains.length ? u.provider_domains.map(domainName).join(', ') : '—',
      },
      {
        id: 'actions',
        header: '',
        headerClassName: 'w-16',
        cellClassName: 'text-right',
        cell: (u) => (
          <Button type="button" variant="link" size="sm" onClick={() => startEdit(u)}>
            Edit
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.domains],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">RBAC Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign portal roles and publisher domains. Changes are saved and audited.
        </p>
      </div>

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
        <FilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="All roles"
          options={(Object.keys(roleLabels) as PortalRole[]).map((role) => ({
            value: role,
            label: roleLabels[role],
          }))}
          className="w-44"
        />
      </ListFilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(u) => u.user_id}
        emptyTitle={state.users.length === 0 ? 'No users yet' : 'No users match your filters'}
        emptyDescription={
          state.users.length === 0
            ? 'Users appear here once they sign in to the portal.'
            : 'Try adjusting your search or filter criteria.'
        }
        emptyAction={
          hasActiveFilters ? (
            <button
              type="button"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              onClick={() => {
                setQuery('');
                setRoleFilter('');
              }}
            >
              Clear filters
            </button>
          ) : undefined
        }
      />

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.display_name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label htmlFor="rbac-role" className="mb-1 block text-sm font-medium text-foreground">
                Portal role
              </label>
              <Select
                value={draftRole}
                onValueChange={(v) => v && setDraftRole(v as PortalRole)}
              >
                <SelectTrigger id="rbac-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(roleLabels) as PortalRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {draftRole === 'developer' && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Publisher domains</p>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {state.domains.map((d) => (
                    <label key={d.domain_id} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={draftDomains.includes(d.domain_id)}
                        onChange={() => toggleDomain(d.domain_id)}
                        className="rounded border-input"
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
