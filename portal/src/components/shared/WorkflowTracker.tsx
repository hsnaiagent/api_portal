import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

import type { SubscriptionStatus } from '@/types';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'submitted', label: 'Request Submitted' },
  { key: 'workflow', label: 'Workflow Approval' },
  { key: 'provider', label: 'Provider Review' },
  { key: 'active', label: 'Access Granted' },
];

type Outcome = 'active' | 'rejected' | 'expired' | 'in_progress';

function progress(
  status: SubscriptionStatus,
  providerStatus: string,
): { current: number; outcome: Outcome } {
  if (status === 'active') return { current: 4, outcome: 'active' };
  if (status === 'workflow_rejected' || status === 'revoked')
    return { current: -1, outcome: 'rejected' };
  if (status === 'expired') return { current: -1, outcome: 'expired' };
  if (
    status === 'provider_pending' ||
    (status === 'workflow_approved' && providerStatus === 'pending')
  ) {
    return { current: 3, outcome: 'in_progress' };
  }
  if (status === 'workflow_approved') return { current: 3, outcome: 'in_progress' };
  if (status === 'workflow_in_progress' || status === 'pending')
    return { current: 2, outcome: 'in_progress' };
  return { current: 1, outcome: 'in_progress' };
}

export function WorkflowTracker({
  status,
  providerStatus,
}: {
  status: SubscriptionStatus;
  providerStatus: string;
}) {
  const { current, outcome } = progress(status, providerStatus);
  const terminalBad = outcome === 'rejected' || outcome === 'expired';

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((step, i) => {
          const done = i + 1 < current;
          const active = i + 1 === current;
          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex items-center gap-2">
                {done ? (
                  <CheckCircle2 className="size-5 text-status-active" />
                ) : active ? (
                  terminalBad ? (
                    <XCircle className="size-5 text-destructive" />
                  ) : (
                    <Loader2 className="size-5 animate-spin text-status-active" />
                  )
                ) : (
                  <Circle className="size-5 text-muted-foreground/40" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    active ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-3 hidden h-px flex-1 bg-border sm:block" />
              )}
            </div>
          );
        })}
      </div>
      {outcome === 'rejected' && (
        <p className="text-xs font-medium text-destructive">This request was rejected.</p>
      )}
      {outcome === 'expired' && (
        <p className="text-xs font-medium text-muted-foreground">
          This subscription has expired.
        </p>
      )}
    </div>
  );
}
