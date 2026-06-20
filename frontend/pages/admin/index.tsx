import { useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { useNotifications } from '@/hooks/useNotifications';
import { hasApiBaseUrl } from '@/services/api';
import { hasSupabaseConfig } from '@/services/auth';

export default function AdminPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { unreadCount, notifications } = useNotifications();

  return (
    <Layout title="Admin">
      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ['Backend API', hasApiBaseUrl ? 'Configured' : 'Mock mode'],
          ['Supabase auth', hasSupabaseConfig ? 'Enabled' : 'Fallback auth'],
          ['Unread alerts', `${unreadCount}`],
          ['Feature flag', 'AI handoff active']
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Runtime configuration</h2>
              <p className="text-sm text-slate-500">This frontend safely falls back to local mock data when services are not configured.</p>
            </div>
            <button
              type="button"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setModalOpen(true)}
            >
              Review checklist
            </button>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Environment placeholders</p>
              <p className="mt-2">Use <code>.env.local</code> to provide NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_SOCKET_URL.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Security posture</p>
              <p className="mt-2">No real secrets are embedded. Browser APIs are guarded and the interface renders without backend connectivity.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Operational note</p>
              <p className="mt-2">Next 13 pages router is used per requirement. Production deployment should review upstream advisories before internet-facing rollout.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent alerts</h2>
          <div className="mt-5 space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-2 text-sm text-slate-500">{notification.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title="Deployment checklist"
        description="Recommended final checks before connecting this frontend to live insurance workloads."
        onClose={() => setModalOpen(false)}
      >
        <ul className="space-y-3 text-sm text-slate-600">
          <li>• Verify env values are supplied via secure deployment secrets, not committed files.</li>
          <li>• Confirm backend API routes align with the wrappers under services/.</li>
          <li>• Reassess Next 13 security advisories before exposing the app publicly.</li>
          <li>• Enable monitoring for authentication failures and claim escalation latency.</li>
        </ul>
      </Modal>
    </Layout>
  );
}
