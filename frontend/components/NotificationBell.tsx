import { BellIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNowStrict } from 'date-fns';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-primary-200 hover:text-primary-600"
        onClick={() => setOpen((current) => !current)}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">Operational alerts and AI activity</p>
            </div>
            <button className="text-xs font-medium text-primary-600" onClick={markAllAsRead}>
              Mark all read
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  notification.read ? 'border-slate-200 bg-slate-50' : 'border-primary-100 bg-primary-50/60'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{notification.description}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatDistanceToNowStrict(new Date(notification.time), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
