import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';

import { usePortal } from '@/store/AppStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  buildBasepathCheckItem,
  checkHttpsEnforced,
  checkLinting,
  checkValidRoutingTarget,
  getApiBasepathFromRecord,
  hasHardBlockerFailure,
  type ReadinessCheckItem,
} from '@/lib/openapi-registration';

interface ReadinessChecklistProps {
  targetUrl: string;
  basepath: string;
  specContent: Record<string, unknown> | null;
  onBlockersChange?: (blocked: boolean) => void;
}

function statusStyles(status: ReadinessCheckItem['status']): string {
  switch (status) {
    case 'pass':
      return 'text-status-active-foreground';
    case 'fail':
      return 'text-destructive';
    case 'warning':
      return 'text-status-pending-foreground';
    case 'pending':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
}

function StatusIcon({ status }: { status: ReadinessCheckItem['status'] }) {
  if (status === 'pass') return <Check className="size-4 shrink-0" />;
  if (status === 'fail') return <X className="size-4 shrink-0" />;
  if (status === 'pending') return <Loader2 className="size-4 shrink-0 animate-spin" />;
  return <span className="size-4 shrink-0 text-center text-xs font-bold">!</span>;
}

async function fetchBasepathAvailability(
  prefix: string,
): Promise<{ available: boolean; conflictingApiId?: string }> {
  const params = new URLSearchParams({ prefix });
  const res = await fetch(`/api/basepath/availability?${params.toString()}`);
  if (!res.ok) throw new Error('availability check failed');
  return res.json() as Promise<{ available: boolean; conflictingApiId?: string }>;
}

function checkBasepathClient(
  prefix: string,
  apis: { api_id: string; gateway_path_prefix?: string; endpoints?: { path: string }[] }[],
): { available: boolean; conflictingApiId?: string } {
  const normalized = prefix.trim().replace(/\/+$/, '') || prefix.trim();
  for (const api of apis) {
    const existing = getApiBasepathFromRecord(api);
    if (!existing) continue;
    const existingNorm = existing.replace(/\/+$/, '') || existing;
    if (
      normalized === existingNorm ||
      normalized.startsWith(`${existingNorm}/`) ||
      existingNorm.startsWith(`${normalized}/`)
    ) {
      return { available: false, conflictingApiId: api.api_id };
    }
  }
  return { available: true };
}

export function ReadinessChecklist({
  targetUrl,
  basepath,
  specContent,
  onBlockersChange,
}: ReadinessChecklistProps) {
  const { state } = usePortal();
  const debouncedBasepath = useDebouncedValue(basepath.trim(), 400);
  const [basepathAvailable, setBasepathAvailable] = useState<boolean | null>(null);
  const [conflictingApiId, setConflictingApiId] = useState<string | undefined>();
  const [basepathChecking, setBasepathChecking] = useState(false);

  useEffect(() => {
    if (!debouncedBasepath || !debouncedBasepath.startsWith('/')) {
      setBasepathAvailable(null);
      setConflictingApiId(undefined);
      setBasepathChecking(false);
      return;
    }

    let cancelled = false;
    setBasepathChecking(true);
    setBasepathAvailable(null);

    fetchBasepathAvailability(debouncedBasepath)
      .then((result) => {
        if (cancelled) return;
        setBasepathAvailable(result.available);
        setConflictingApiId(result.conflictingApiId);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = checkBasepathClient(debouncedBasepath, state.apis);
        setBasepathAvailable(fallback.available);
        setConflictingApiId(fallback.conflictingApiId);
      })
      .finally(() => {
        if (!cancelled) setBasepathChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedBasepath, state.apis]);

  const checks = useMemo(() => {
    const basepathStatus: boolean | null = basepathChecking ? null : basepathAvailable;
    return [
      checkHttpsEnforced(targetUrl),
      checkValidRoutingTarget(targetUrl),
      buildBasepathCheckItem(basepath, basepathStatus, conflictingApiId),
      checkLinting(specContent),
    ];
  }, [targetUrl, basepath, specContent, basepathAvailable, basepathChecking, conflictingApiId]);

  useEffect(() => {
    onBlockersChange?.(hasHardBlockerFailure(checks));
  }, [checks, onBlockersChange]);

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Readiness Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {checks.map((check) => (
            <li
              key={check.id}
              className={cn('flex gap-2 text-sm', statusStyles(check.status))}
            >
              <StatusIcon status={check.status} />
              <div>
                <span className="font-medium">{check.label}</span>
                {check.hardBlocker && check.status === 'fail' && (
                  <span className="ml-1 text-xs text-destructive">(required)</span>
                )}
                {!check.hardBlocker && check.status === 'warning' && (
                  <span className="ml-1 text-xs text-status-pending-foreground">
                    (recommended)
                  </span>
                )}
                {check.message && (
                  <p className="mt-0.5 text-xs opacity-90">{check.message}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export { hasHardBlockerFailure };
