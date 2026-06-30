import type { AuditLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { getUserById } from '@/data/users';

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-brand-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Timestamp</th>
            <th className="px-4 py-3 font-medium">Actor</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Entity</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No audit entries match your filters.</td>
            </tr>
          ) : logs.map((log) => (
            <tr key={log.audit_id} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.timestamp)}</td>
              <td className="px-4 py-3">{log.actor_user_id ? getUserById(log.actor_user_id)?.display_name ?? log.actor_user_id : log.actor_type}</td>
              <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
              <td className="px-4 py-3">{log.entity_type}:{log.entity_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
