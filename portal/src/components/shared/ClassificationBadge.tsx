import { CLASSIFICATIONS } from '@/config/classification';
import type { Classification } from '@/types';
import { cn } from '@/lib/utils';

export function ClassificationBadge({
  classification,
  showHandling,
}: {
  classification: Classification;
  showHandling?: boolean;
}) {
  const c = CLASSIFICATIONS[classification];
  return (
    <span
      title={showHandling ? c.handling : undefined}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        c.bg,
        c.color,
      )}
    >
      {c.label}
    </span>
  );
}
