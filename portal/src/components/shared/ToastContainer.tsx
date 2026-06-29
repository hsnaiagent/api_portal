import { useEffect } from 'react';
import { usePortal } from '@/store/AppStore';

export function ToastContainer() {
  const { state, dispatch } = usePortal();
  const latest = state.notifications[0];

  useEffect(() => {
    if (!latest || latest.read) return;
    const t = setTimeout(() => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: latest.id });
    }, 5000);
    return () => clearTimeout(t);
  }, [latest, dispatch]);

  if (!latest || latest.read) return null;

  const colors = {
    info: 'bg-brand-blue',
    success: 'bg-brand-green',
    warning: 'bg-orange-500',
    error: 'bg-red-600',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-brand-white shadow-lg ${colors[latest.type]}`}>
      <p className="font-semibold text-sm">{latest.title}</p>
      <p className="text-sm opacity-90">{latest.message}</p>
    </div>
  );
}
