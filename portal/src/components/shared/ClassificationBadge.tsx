import { CLASSIFICATIONS } from '@/config/classification';
import { Badge } from '@/components/ui/badge';
import { classificationBadgeVariant } from '@/lib/catalog-badges';
import type { Classification } from '@/types';

export function ClassificationBadge({
  classification,
  showHandling,
}: {
  classification: Classification;
  showHandling?: boolean;
}) {
  const c = CLASSIFICATIONS[classification];
  return (
    <Badge
      variant={classificationBadgeVariant(classification)}
      title={showHandling ? c.handling : undefined}
    >
      {c.label}
    </Badge>
  );
}
