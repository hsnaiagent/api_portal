import { LIFECYCLE_COLORS, LIFECYCLE_LABELS } from '@/config/lifecycle';
import type { LifecycleStatus } from '@/types';
import { cn } from '@/lib/utils';

export function LifecycleBadge({ status }: { status: LifecycleStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', LIFECYCLE_COLORS[status])}>
      {LIFECYCLE_LABELS[status]}
    </span>
  );
}
