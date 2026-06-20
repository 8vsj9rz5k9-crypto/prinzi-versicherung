import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { claimsService } from '@/services/claims';
import { customersService } from '@/services/customers';
import { policiesService } from '@/services/policies';

export default function CustomerDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  const customerQuery = useQuery(['customer', id], () => customersService.getCustomerById(id as string), { enabled: Boolean(id) });
  const policiesQuery = useQuery(['policies'], policiesService.listPolicies);
  const claimsQuery = useQuery(['claims'], claimsService.listClaims);

  if (!id || customerQuery.isLoading || policiesQuery.isLoading || claimsQuery.isLoading) {
    return <LoadingSpinner fullScreen label="Loading customer profile…" />;
  }

  const customer = customerQuery.data;
  if (!customer) {
    return (
      <Layout title="Customer not found">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Customer not found.</div>
      </Layout>
    );
  }

  const customerPolicies = (policiesQuery.data ?? []).filter((policy) => policy.customerId === customer.id);
  const customerClaims = (claimsQuery.data ?? []).filter((claim) => claim.customerId === customer.id);

  return (
    <Layout title={customer.name}>
      <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Customer profile</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">{customer.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{customer.email} · {customer.phone}</p>
              <p className="text-sm text-slate-500">{customer.address}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <p className="text-sm text-slate-500">Relationship tier</p>
              <p className="text-xl font-semibold text-slate-900">{customer.tier}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Advisor', customer.advisor],
              ['Annual premium', `$${customer.premium.toLocaleString()}`],
              ['Last contact', format(new Date(customer.lastContact), 'MMM d, yyyy')]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Advisor notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{customer.notes}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Policies</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{customerPolicies.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Claims</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{customerClaims.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Customer status</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{customer.status}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Policies</h3>
          <div className="mt-4 space-y-4">
            {customerPolicies.map((policy) => (
              <div key={policy.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{policy.type}</p>
                    <p className="text-sm text-slate-500">Policy #{policy.id}</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{policy.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Coverage ${policy.coverage.toLocaleString()}</span>
                  <span>Premium ${policy.premium.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Claims</h3>
          <div className="mt-4 space-y-4">
            {customerClaims.map((claim) => (
              <div key={claim.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{claim.type}</p>
                    <p className="text-sm text-slate-500">Claim #{claim.id}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{claim.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{claim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
