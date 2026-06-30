import { usePortal } from '@/store/AppStore';
import type { Notification } from '@/types';

export function useNotify() {
  const { dispatch } = usePortal();

  return (title: string, message: string, type: Notification['type'] = 'info') => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif_${Date.now()}`,
        title,
        message,
        type,
        created_at: new Date().toISOString(),
        read: false,
      },
    });
  };
}
