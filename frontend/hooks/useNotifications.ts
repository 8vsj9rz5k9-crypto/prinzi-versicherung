import { useMemo, useState } from 'react';
import { NotificationItem, cloneData, mockNotifications } from '@/services/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => cloneData(mockNotifications));

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
