import { Dialog, Transition } from '@headlessui/react';
import {
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UserGroupIcon },
  { name: 'Policies', href: '/policies', icon: ShieldCheckIcon },
  { name: 'Claims', href: '/claims', icon: ClipboardDocumentListIcon },
  { name: 'Conversations', href: '/conversations', icon: ChatBubbleLeftRightIcon },
  { name: 'Admin', href: '/admin', icon: WrenchScrewdriverIcon }
];

function SidebarContent() {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col bg-slate-950 px-5 py-6 text-white">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">Prinzi</p>
        <h2 className="mt-2 text-xl font-semibold">AI Insurance Agent</h2>
        <p className="mt-2 text-sm text-slate-400">Customer, policy, claims, and conversations in one responsive workspace.</p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active ? 'bg-white text-slate-950 shadow-soft' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">AI coverage note</p>
        <p className="mt-2">Mock-safe services keep this interface usable even when backend APIs are unavailable.</p>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <Transition.Root show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60" />
          </Transition.Child>
          <div className="fixed inset-0 flex max-w-xs">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="w-full">
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <aside className="fixed inset-y-0 hidden w-72 border-r border-slate-200 lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
