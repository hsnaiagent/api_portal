import type { AuditLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { getUserById } from '@/data/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No audit entries match your filters.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.audit_id}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </TableCell>
                <TableCell>
                  {log.actor_user_id
                    ? (getUserById(log.actor_user_id)?.display_name ?? log.actor_user_id)
                    : log.actor_type}
                </TableCell>
                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell>
                  {log.entity_type}:{log.entity_id}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
