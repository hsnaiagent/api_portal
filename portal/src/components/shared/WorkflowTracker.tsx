import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { SubscriptionStatus } from '@/types';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'submitted', label: 'Request Submitted' },
  { key: 'workflow', label: 'Workflow Approval' },
  { key: 'provider', label: 'Provider Review' },
  { key: 'active', label: 'Access Granted' },
];

function stepIndex(status: SubscriptionStatus, providerStatus: string) {
  if (status === 'active') return 4;
  if (status === 'provider_pending' || (status === 'workflow_approved' && providerStatus === 'pending')) return 3;
  if (status === 'workflow_in_progress' || status === 'pending') return 2;
  if (status === 'workflow_rejected' || status === 'revoked') return -1;
  return 1;
}

export function WorkflowTracker({ status, providerStatus }: { status: SubscriptionStatus; providerStatus: string }) {
  const current = stepIndex(status, providerStatus);
  const rejected = current === -1;

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center">
      {steps.map((step, i) => {
        const done = i + 1 < current;
        const active = i + 1 === current;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-brand-green" />
              ) : active ? (
                rejected ? (
                  <Circle className="h-5 w-5 text-red-500" />
                ) : (
                  <Loader2 className="h-5 w-5 text-brand-green animate-spin" />
                )
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className={cn('text-sm', active ? 'font-medium text-slate-800' : 'text-slate-500')}>{step.label}</span>
            </div>
            {i < steps.length - 1 && <div className="hidden sm:block flex-1 h-px bg-slate-200 mx-3" />}
          </div>
        );
      })}
    </div>
  );
}
