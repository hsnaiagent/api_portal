import { LIFECYCLE_LABELS } from '@/config/lifecycle';
import { Badge } from '@/components/ui/badge';
import { lifecycleBadgeVariant } from '@/lib/catalog-badges';
import type { LifecycleStatus } from '@/types';

export function LifecycleBadge({ status }: { status: LifecycleStatus }) {
  return (
    <Badge variant={lifecycleBadgeVariant(status)} withDot>
      {LIFECYCLE_LABELS[status]}
    </Badge>
  );
}
