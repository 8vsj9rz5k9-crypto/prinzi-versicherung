import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { customersService } from '@/services/customers';
import { policiesService } from '@/services/policies';

export default function PolicyDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  const policyQuery = useQuery(['policy', id], () => policiesService.getPolicyById(id as string), { enabled: Boolean(id) });
  const customersQuery = useQuery(['customers'], customersService.listCustomers);

  if (!id || policyQuery.isLoading || customersQuery.isLoading) {
    return <LoadingSpinner fullScreen label="Loading policy details…" />;
  }

  const policy = policyQuery.data;
  if (!policy) {
    return (
      <Layout title="Policy not found">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Policy not found.</div>
      </Layout>
    );
  }

  const customer = customersQuery.data?.find((item) => item.id === policy.customerId);

  return (
    <Layout title={`Policy ${policy.id}`}>
      <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Policy overview</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{policy.type} coverage</h2>
          <p className="mt-2 text-sm text-slate-500">Policy #{policy.id} · Customer: {customer?.name ?? policy.customerId}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['Coverage amount', `$${policy.coverage.toLocaleString()}`],
              ['Annual premium', `$${policy.premium.toLocaleString()}`],
              ['Deductible', `$${policy.deductible.toLocaleString()}`],
              ['Risk score', `${policy.riskScore}`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Term details</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-semibold text-slate-900">{policy.status}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Payment cadence</dt>
              <dd className="font-semibold text-slate-900">{policy.paymentFrequency}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Start date</dt>
              <dd className="font-semibold text-slate-900">{format(new Date(policy.startDate), 'MMM d, yyyy')}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">End date</dt>
              <dd className="font-semibold text-slate-900">{format(new Date(policy.endDate), 'MMM d, yyyy')}</dd>
            </div>
          </dl>
        </div>
      </section>
    </Layout>
  );
}
