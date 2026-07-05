import { useEffect, useMemo, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
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
      return 'text-brand-green';
    case 'fail':
      return 'text-red-600';
    case 'warning':
      return 'text-amber-600';
    case 'pending':
      return 'text-slate-500';
    default:
      return 'text-slate-600';
  }
}

function statusIcon(status: ReadinessCheckItem['status']): string {
  switch (status) {
    case 'pass':
      return '✓';
    case 'fail':
      return '✗';
    case 'warning':
      return '⚠';
    case 'pending':
      return '…';
    default:
      return '•';
  }
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-slate-800">Readiness Checklist</h3>
      <ul className="space-y-2">
        {checks.map((check) => (
          <li key={check.id} className={`text-sm flex gap-2 ${statusStyles(check.status)}`}>
            <span className="font-medium shrink-0">{statusIcon(check.status)}</span>
            <div>
              <span className="font-medium">{check.label}</span>
              {check.hardBlocker && check.status === 'fail' && (
                <span className="ml-1 text-xs text-red-500">(required)</span>
              )}
              {!check.hardBlocker && check.status === 'warning' && (
                <span className="ml-1 text-xs text-amber-600">(recommended)</span>
              )}
              {check.message && <p className="text-xs mt-0.5 opacity-90">{check.message}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { hasHardBlockerFailure };
