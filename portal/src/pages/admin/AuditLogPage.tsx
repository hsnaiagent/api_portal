import { useEffect, useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AuditLogTable } from '@/components/shared/AuditLogTable';
import { ListFilterBar } from '@/components/shared/ListFilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { AIBadge } from '@/components/ai/AIBadge';
import { getUserById } from '@/data/users';

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
      <h1 className="text-2xl font-bold">Audit Log</h1>
      {anomalyAlert && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium flex items-center gap-2">
            <AIBadge label="AI-12" /> Anomaly Alert
          </p>
          <p className="text-sm text-orange-800 mt-1">{anomalyAlert}</p>
        </div>
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
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          {actionOptions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All actor types</option>
          <option value="user">User</option>
          <option value="system">System</option>
          <option value="webhook">Webhook</option>
        </select>
      </ListFilterBar>
      <AuditLogTable logs={pageItems} />
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageStart={pageStart}
        pageEnd={pageEnd}
        onPageChange={setPage}
        unit="entries"
      />
      <button
        type="button"
        onClick={exportCsv}
        disabled={filtered.length === 0}
        className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline disabled:opacity-50"
      >
        Export {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} as CSV
      </button>
    </div>
  );
}
