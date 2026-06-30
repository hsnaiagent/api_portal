import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePortal } from '@/store/AppStore';

const TOAST_TTL_MS = 5000;
const MAX_VISIBLE = 4;

const colors = {
  info: 'bg-brand-blue',
  success: 'bg-brand-green',
  warning: 'bg-orange-500',
  error: 'bg-red-600',
} as const;

export function ToastContainer() {
  const { state, dispatch } = usePortal();
  const unread = state.notifications.filter((n) => !n.read);
  const scheduled = useRef(new Set<string>());

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const n of unread) {
      if (scheduled.current.has(n.id)) continue;
      scheduled.current.add(n.id);
      timers.push(
        setTimeout(() => {
          dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id });
          scheduled.current.delete(n.id);
        }, TOAST_TTL_MS),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [unread, dispatch]);

  if (unread.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {unread.slice(0, MAX_VISIBLE).map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`max-w-sm rounded-lg px-4 py-3 text-brand-white shadow-lg ${colors[toast.type]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">{toast.title}</p>
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: toast.id })}
              className="shrink-0 opacity-80 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
