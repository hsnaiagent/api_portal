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

function progress(status: SubscriptionStatus, providerStatus: string): { current: number; outcome: Outcome } {
  if (status === 'active') return { current: 4, outcome: 'active' };
  if (status === 'workflow_rejected' || status === 'revoked') return { current: -1, outcome: 'rejected' };
  if (status === 'expired') return { current: -1, outcome: 'expired' };
  if (status === 'provider_pending' || (status === 'workflow_approved' && providerStatus === 'pending')) {
    return { current: 3, outcome: 'in_progress' };
  }
  if (status === 'workflow_approved') return { current: 3, outcome: 'in_progress' };
  if (status === 'workflow_in_progress' || status === 'pending') return { current: 2, outcome: 'in_progress' };
  return { current: 1, outcome: 'in_progress' };
}

export function WorkflowTracker({ status, providerStatus }: { status: SubscriptionStatus; providerStatus: string }) {
  const { current, outcome } = progress(status, providerStatus);
  const terminalBad = outcome === 'rejected' || outcome === 'expired';

  return (
    <div className="space-y-2">
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
                  terminalBad ? (
                    <XCircle className="h-5 w-5 text-red-500" />
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
      {outcome === 'rejected' && <p className="text-xs font-medium text-red-600">This request was rejected.</p>}
      {outcome === 'expired' && <p className="text-xs font-medium text-slate-500">This subscription has expired.</p>}
    </div>
  );
}
