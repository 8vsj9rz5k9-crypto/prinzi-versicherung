import { Bars3Icon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/hooks/useAuth';

type NavbarProps = {
  onMenuClick: () => void;
};

const pageTitles: Record<string, string> = {
  '/dashboard': 'Operations Dashboard',
  '/customers': 'Customer Portfolio',
  '/policies': 'Policy Center',
  '/claims': 'Claims Hub',
  '/conversations': 'AI Conversations',
  '/admin': 'Admin Console'
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-600">Prinzi AI Insurance Agent</p>
            <h1 className="text-lg font-semibold text-slate-900">{pageTitles[router.pathname] ?? 'AI Insurance Agent'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name ?? 'Agent'}</p>
            <p className="text-xs text-slate-500">{user?.role ?? 'Insurance Agent'}</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={async () => {
              await logout();
              await router.push('/login');
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
