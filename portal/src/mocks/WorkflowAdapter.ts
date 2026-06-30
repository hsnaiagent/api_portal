import type { Subscription } from '@/types';
import { delay } from '@/lib/utils';

export async function triggerWorkflow(subscription: Subscription) {
  await delay(800);
  return {
    workflow_instance_id: `wf_${Date.now()}`,
    correlation_id: subscription.subscription_id,
    status: 'in_progress' as const,
  };
}

export async function pollWorkflowComplete(workflowId: string) {
  await delay(2000);
  return { workflow_instance_id: workflowId, status: 'approved' as const };
}
