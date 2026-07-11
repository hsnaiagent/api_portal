import { useMemo, useState } from 'react';
import { AppWindow, Pencil, Trash2 } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { useNotify } from '@/hooks/useNotify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Application } from '@/types';

type Environment = Application['environment'];

const emptyDraft = {
  name: '',
  desc: '',
  appDesc: '',
  environment: 'sandbox' as Environment,
};

export function ApplicationsPage() {
  const { state, dispatch } = usePortal();
  const notify = useNotify();
  const apps = state.applications.filter(
    (a) => a.owner_user_id === state.currentUser?.user_id && a.status !== 'deleted',
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [query, setQuery] = useState('');
  const [envFilter, setEnvFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      if (envFilter && app.environment !== envFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          app.name.toLowerCase().includes(q) ||
          (app.description?.toLowerCase().includes(q) ?? false) ||
          (app.application_description?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [apps, query, envFilter]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setShowForm(true);
  };

  const openEdit = (app: Application) => {
    setEditingId(app.application_id);
    setDraft({
      name: app.name,
      desc: app.description ?? '',
      appDesc: app.application_description ?? '',
      environment: app.environment,
    });
    setShowForm(true);
  };

  const save = () => {
    if (!draft.name.trim() || !state.currentUser) return;
    if (editingId) {
      dispatch({
        type: 'UPDATE_APPLICATION',
        payload: {
          application_id: editingId,
          patch: {
            name: draft.name.trim(),
            description: draft.desc,
            application_description: draft.appDesc,
            environment: draft.environment,
          },
        },
      });
      notify('Application updated', `${draft.name} has been saved.`, 'success');
    } else {
      const app: Application = {
        application_id: `app_${Date.now()}`,
        team_id: state.currentUser.team_ids[0] ?? '',
        name: draft.name.trim(),
        description: draft.desc,
        application_description: draft.appDesc,
        owner_user_id: state.currentUser.user_id,
        environment: draft.environment,
        status: 'active',
      };
      dispatch({ type: 'ADD_APPLICATION', payload: app });
      notify('Application created', `${app.name} is ready to use for subscriptions.`, 'success');
    }
    setShowForm(false);
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const remove = (app: Application) => {
    setDeleteTarget(app);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: { application_id: deleteTarget.application_id, patch: { status: 'deleted' } },
    });
    notify('Application deleted', `${deleteTarget.name} has been removed.`, 'info');
    setDeleteTarget(null);
  };

  const hasActiveFilters = Boolean(query || envFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <Button onClick={openCreate}>Register Application</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Applications are machine consumers of APIs. The application description powers AI
        personalization across SDK, sandbox, and Application Planner.
      </p>
      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search applications..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setEnvFilter('');
        }}
        resultLabel={`${filtered.length} of ${apps.length} applications`}
      >
        <Select
          value={envFilter || 'all'}
          onValueChange={(v) => setEnvFilter(!v || v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All environments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All environments</SelectItem>
            <SelectItem value="sandbox">Sandbox</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
      </ListFilterBar>

      {apps.length === 0 ? (
        <EmptyState
          icon={<AppWindow />}
          title="No applications yet"
          description="Register your first application to start requesting API subscriptions."
          action={<Button onClick={openCreate}>Register Application</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No applications match your filters"
          description="Try adjusting your search or environment filter."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setEnvFilter('');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((app) => (
            <Card key={app.application_id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{app.name}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(app)}
                      aria-label={`Edit ${app.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(app)}
                      aria-label={`Delete ${app.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{app.description}</p>
                {app.application_description && (
                  <p className="mt-2 line-clamp-2 text-xs italic text-link">
                    {app.application_description}
                  </p>
                )}
                <Badge variant="neutral" className="mt-2 capitalize">
                  {app.environment}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Application' : 'Register Application'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div>
              <label htmlFor="app-name" className="mb-1 block text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="app-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Application name"
              />
            </div>
            <div>
              <label htmlFor="app-desc" className="mb-1 block text-sm font-medium">
                Short description
              </label>
              <Input
                id="app-desc"
                value={draft.desc}
                onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                placeholder="Short description"
              />
            </div>
            <div>
              <label htmlFor="app-ai-desc" className="mb-1 block text-sm font-medium">
                Application description (for AI)
              </label>
              <Textarea
                id="app-ai-desc"
                value={draft.appDesc}
                onChange={(e) => setDraft({ ...draft, appDesc: e.target.value })}
                placeholder="What it does, what data it needs..."
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="app-env" className="mb-1 block text-sm font-medium">
                Environment
              </label>
              <Select
                value={draft.environment}
                onValueChange={(v) =>
                  v && setDraft({ ...draft, environment: v as Environment })
                }
              >
                <SelectTrigger id="app-env" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.name.trim()}>
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
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone. Any subscriptions tied to this application will remain in the system."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
