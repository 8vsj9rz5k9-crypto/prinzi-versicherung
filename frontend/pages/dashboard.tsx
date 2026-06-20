import { formatDistanceToNowStrict } from 'date-fns';
import { useQuery } from 'react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { claimsService } from '@/services/claims';
import { mockNotifications, monthlyPerformance } from '@/services/api';
import { customersService } from '@/services/customers';
import { policiesService } from '@/services/policies';

const sentimentMix = [
  { name: 'Positive', value: 58, color: '#376ff5' },
  { name: 'Neutral', value: 30, color: '#94a3b8' },
  { name: 'Escalation', value: 12, color: '#f97316' }
];

export default function DashboardPage() {
  const { data, isLoading } = useQuery(['dashboard-data'], async () => {
    const [customers, policies, claims] = await Promise.all([
      customersService.listCustomers(),
      policiesService.listPolicies(),
      claimsService.listClaims()
    ]);

    return { customers, policies, claims };
  });

  if (isLoading || !data) {
    return <LoadingSpinner fullScreen label="Loading dashboard…" />;
  }

  const renewalCount = data.policies.filter((policy) => policy.status === 'Renewal Due').length;
  const openClaims = data.claims.filter((claim) => claim.status !== 'Resolved').length;
  const totalPremium = data.customers.reduce((sum, customer) => sum + customer.premium, 0);

  return (
    <Layout title="Dashboard">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Customers', `${data.customers.length}`, 'Active portfolio accounts'],
          ['Annual premium', `$${totalPremium.toLocaleString()}`, 'Tracked across mock-safe services'],
          ['Open claims', `${openClaims}`, 'Awaiting review or resolution'],
          ['Renewals due', `${renewalCount}`, 'Due within current operating window']
        ].map(([label, value, note]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Premium vs claim volume</h2>
              <p className="text-sm text-slate-500">Monthly operations trend across the AI-assisted book.</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="premium" fill="#376ff5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="claims" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Conversation sentiment</h2>
            <p className="text-sm text-slate-500">Live mix of AI-routed customer interactions.</p>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {sentimentMix.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Retention trend</h2>
            <p className="text-sm text-slate-500">Projected retention lifted by proactive AI-led renewal outreach.</p>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="retention" stroke="#0f172a" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent alerts</h2>
          <div className="mt-5 space-y-4">
            {mockNotifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{notification.description}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNowStrict(new Date(notification.time), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
