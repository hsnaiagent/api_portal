import { useMemo, useState } from 'react';

import { usePortal } from '@/store/AppStore';
import { useNotify } from '@/hooks/useNotify';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Domain } from '@/types';

const emptyDraft = { name: '', code: '', description: '' };

export function DomainsPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [deleteTarget, setDeleteTarget] = useState<Domain | null>(null);

  const apiCountByDomain = (domainId: string) =>
    state.apis.filter((a) => a.domain_id === domainId).length;

  const audit = (action: string, domainId: string, payload?: Record<string, unknown>) => {
    if (!state.currentUser) return;
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        audit_id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor_user_id: state.currentUser.user_id,
        actor_type: 'user',
        action,
        entity_type: 'domain',
        entity_id: domainId,
        payload,
      },
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setShowForm(true);
  };

  const openEdit = (d: Domain) => {
    setEditingId(d.domain_id);
    setDraft({ name: d.name, code: d.code, description: d.description });
    setShowForm(true);
  };

  const save = () => {
    if (!draft.name.trim() || !draft.code.trim()) return;
    const code = draft.code.trim().toLowerCase().replace(/\s+/g, '_');
    if (editingId) {
      dispatch({
        type: 'UPDATE_DOMAIN',
        payload: {
          domain_id: editingId,
          patch: { name: draft.name.trim(), code, description: draft.description },
        },
      });
      audit('domain.updated', editingId);
      notify('Domain updated', `${draft.name} saved.`, 'success');
    } else {
      const domain_id = `dom_${code}`;
      if (state.domains.some((d) => d.domain_id === domain_id)) {
        notify('Duplicate domain', `A domain with code "${code}" already exists.`, 'error');
        return;
      }
      dispatch({
        type: 'ADD_DOMAIN',
        payload: { domain_id, name: draft.name.trim(), code, description: draft.description },
      });
      audit('domain.created', domain_id);
      notify('Domain created', `${draft.name} added to the registry.`, 'success');
    }
    setShowForm(false);
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const d = deleteTarget;
    dispatch({ type: 'DELETE_DOMAIN', payload: d.domain_id });
    audit('domain.deleted', d.domain_id);
    notify('Domain deleted', `${d.name} removed from the registry.`, 'info');
    setDeleteTarget(null);
  };

  const columns = useMemo<DataTableColumn<Domain>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (d) => <span className="font-medium">{d.name}</span>,
      },
      {
        id: 'code',
        header: 'Code',
        cell: (d) => <span className="font-mono text-xs">{d.code}</span>,
      },
      {
        id: 'description',
        header: 'Description',
        cell: (d) => <span className="text-muted-foreground">{d.description}</span>,
      },
      {
        id: 'apis',
        header: 'APIs',
        cell: (d) => apiCountByDomain(d.domain_id),
      },
      {
        id: 'actions',
        header: '',
        headerClassName: 'w-28',
        cellClassName: 'text-right whitespace-nowrap',
        cell: (d) => (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="link" size="sm" onClick={() => openEdit(d)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                const count = apiCountByDomain(d.domain_id);
                if (count > 0) {
                  notify(
                    'Cannot delete domain',
                    `${d.name} still has ${count} API${count === 1 ? '' : 's'} assigned.`,
                    'warning',
                  );
                  return;
                }
                setDeleteTarget(d);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [state.apis, notify],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Domain Registry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Business domains group APIs for discovery, ownership, and visibility rules.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Add Domain
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={state.domains}
        keyExtractor={(d) => d.domain_id}
        emptyTitle="No domains registered yet"
        emptyDescription="Add a domain to organize APIs by business area."
        emptyAction={
          <Button size="sm" onClick={openCreate}>
            Add Domain
          </Button>
        }
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Domain' : 'Add Domain'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label htmlFor="dom-name" className="mb-1 block text-sm font-medium text-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="dom-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="dom-code" className="mb-1 block text-sm font-medium text-foreground">
                Code <span className="text-destructive">*</span>
              </label>
              <Input
                id="dom-code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="e.g. logistics"
                disabled={Boolean(editingId)}
              />
            </div>
            <div>
              <label htmlFor="dom-desc" className="mb-1 block text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="dom-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.name.trim() || !draft.code.trim()}>
              {editingId ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete domain "${deleteTarget?.name ?? ''}"?`}
        description="This removes the domain from the registry. Domains with assigned APIs cannot be deleted."
        confirmLabel="Delete domain"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
