import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { customersService } from '@/services/customers';
import { policiesService } from '@/services/policies';
import { claimsService } from '@/services/claims';

export default function ClaimDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  const claimQuery = useQuery(['claim', id], () => claimsService.getClaimById(id as string), { enabled: Boolean(id) });
  const customersQuery = useQuery(['customers'], customersService.listCustomers);
  const policiesQuery = useQuery(['policies'], policiesService.listPolicies);

  if (!id || claimQuery.isLoading || customersQuery.isLoading || policiesQuery.isLoading) {
    return <LoadingSpinner fullScreen label="Loading claim details…" />;
  }

  const claim = claimQuery.data;
  if (!claim) {
    return (
      <Layout title="Claim not found">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Claim not found.</div>
      </Layout>
    );
  }

  const customer = customersQuery.data?.find((item) => item.id === claim.customerId);
  const policy = policiesQuery.data?.find((item) => item.id === claim.policyId);

  return (
    <Layout title={`Claim ${claim.id}`}>
      <section className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Claim summary</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{claim.type} claim</h2>
          <p className="mt-2 text-sm text-slate-500">Claim #{claim.id} · {customer?.name ?? claim.customerId}</p>
          <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">{claim.description}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Case details</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-semibold text-slate-900">{claim.status}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Amount</dt>
              <dd className="font-semibold text-slate-900">${claim.amount.toLocaleString()}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Adjuster</dt>
              <dd className="font-semibold text-slate-900">{claim.adjuster}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Submitted</dt>
              <dd className="font-semibold text-slate-900">{format(new Date(claim.submittedAt), 'MMM d, yyyy')}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Policy</dt>
              <dd className="font-semibold text-slate-900">{policy?.type ?? claim.policyId}</dd>
            </div>
          </dl>
        </div>
      </section>
    </Layout>
  );
}
