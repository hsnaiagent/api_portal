import { useEffect, useMemo, useState } from 'react';

import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AuditLogTable } from '@/components/shared/AuditLogTable';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { AIBadge } from '@/components/ai/AIBadge';
import { getUserById } from '@/data/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterSelect } from '@/components/ui/filter-select';

export function AuditLogPage() {
  const { state } = usePortal();
  const [anomalyAlert, setAnomalyAlert] = useState<string>();
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  useEffect(() => {
    getAIResponse('AI_12_AuditAnomalyAlerts', {
      auditLogs: state.auditLogs.slice(0, 50).map((log) => ({
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        actor_type: log.actor_type,
        timestamp: log.timestamp,
      })),
    }).then((r) => setAnomalyAlert(r?.text));
  }, [state.auditLogs]);

  const actionOptions = useMemo(
    () => [...new Set(state.auditLogs.map((l) => l.action))].sort(),
    [state.auditLogs],
  );

  const filtered = useMemo(() => {
    return state.auditLogs.filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false;
      if (actorFilter && log.actor_type !== actorFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const actorName = log.actor_user_id
          ? (getUserById(log.actor_user_id)?.display_name?.toLowerCase() ?? log.actor_user_id)
          : log.actor_type;
        return (
          log.action.toLowerCase().includes(q) ||
          log.entity_type.toLowerCase().includes(q) ||
          log.entity_id.toLowerCase().includes(q) ||
          actorName.includes(q)
        );
      }
      return true;
    });
  }, [state.auditLogs, query, actionFilter, actorFilter]);

  const hasActiveFilters = Boolean(query || actionFilter || actorFilter);
  const { page, setPage, pageItems, totalPages, total, pageStart, pageEnd } = usePagination(
    filtered,
    15,
  );

  const exportCsv = () => {
    const header = ['timestamp', 'actor', 'actor_type', 'action', 'entity_type', 'entity_id'];
    const rows = filtered.map((log) => {
      const actor = log.actor_user_id
        ? (getUserById(log.actor_user_id)?.display_name ?? log.actor_user_id)
        : log.actor_type;
      return [log.timestamp, actor, log.actor_type, log.action, log.entity_type, log.entity_id]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Immutable record of portal actions for compliance and investigation
        </p>
      </div>

      {anomalyAlert && (
        <Card className="border-status-warning/30 bg-status-warning/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AIBadge label="AI-12" /> Anomaly Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{anomalyAlert}</p>
          </CardContent>
        </Card>
      )}

      <ListFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search actor, action, or entity..."
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setQuery('');
          setActionFilter('');
          setActorFilter('');
        }}
        resultLabel={`${filtered.length} of ${state.auditLogs.length} entries`}
      >
        <FilterSelect
          value={actionFilter}
          onChange={setActionFilter}
          placeholder="All actions"
          options={actionOptions.map((action) => ({ value: action, label: action }))}
          className="w-52"
        />
        <FilterSelect
          value={actorFilter}
          onChange={setActorFilter}
          placeholder="All actor types"
          options={[
            { value: 'user', label: 'User' },
            { value: 'system', label: 'System' },
            { value: 'webhook', label: 'Webhook' },
          ]}
          className="w-40"
        />
      </ListFilterBar>

      <AuditLogTable logs={pageItems} />

      {filtered.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onPageChange={setPage}
          unit="entries"
        />
      )}

      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={exportCsv}
        disabled={filtered.length === 0}
      >
        Export {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} as CSV
      </Button>
    </div>
  );
}
