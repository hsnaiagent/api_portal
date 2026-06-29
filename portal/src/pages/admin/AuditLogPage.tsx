import { useEffect, useState } from 'react';
import { usePortal } from '@/store/AppStore';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AuditLogTable } from '@/components/shared/AuditLogTable';
import { AIBadge } from '@/components/ai/AIBadge';

export function AuditLogPage() {
  const { state } = usePortal();
  const [anomalyAlert, setAnomalyAlert] = useState<string>();

  useEffect(() => {
    getAIResponse('AI_12_AuditAnomalyAlerts', {}).then((r) => setAnomalyAlert(r?.text));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      {anomalyAlert && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium flex items-center gap-2"><AIBadge label="AI-12" /> Anomaly Alert</p>
          <p className="text-sm text-orange-800 mt-1">{anomalyAlert}</p>
        </div>
      )}
      <AuditLogTable logs={state.auditLogs} />
      <button type="button" onClick={() => window.alert('Export simulated')} className="text-sm text-brand-blue hover:text-brand-blue-dark hover:underline">Export audit log (demo)</button>
    </div>
  );
}
