import Link from 'next/link';
import { format } from 'date-fns';
import { useQuery } from 'react-query';
import DataTable from '@/components/DataTable';
import type { DataTableColumn } from '@/components/DataTable';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import PolicyCard from '@/components/PolicyCard';
import { Policy } from '@/services/api';
import { policiesService } from '@/services/policies';

export default function PoliciesPage() {
  const { data, isLoading } = useQuery(['policies'], policiesService.listPolicies);

  if (isLoading || !data) {
    return <LoadingSpinner fullScreen label="Loading policies…" />;
  }

  const columns: DataTableColumn<Policy>[] = [
    { key: 'type', header: 'Type', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    {
      key: 'coverage',
      header: 'Coverage',
      sortable: true,
      render: (policy: Policy) => <span className="font-medium text-slate-900">${policy.coverage.toLocaleString()}</span>
    },
    {
      key: 'startDate',
      header: 'Start date',
      sortable: true,
      render: (policy: Policy) => format(new Date(policy.startDate), 'MMM d, yyyy')
    },
    {
      key: 'id',
      header: 'Open',
      render: (policy: Policy) => (
        <Link className="font-semibold text-primary-600" href={`/policies/${policy.id}`}>
          View policy
        </Link>
      )
    }
  ];

  return (
    <Layout title="Policies">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Policy center</h2>
        <p className="text-sm text-slate-500">Track active coverage, renewals, risk scores, and billing cadence.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </section>
      <DataTable columns={columns} data={data} searchPlaceholder="Search by policy type, status, or cadence" />
    </Layout>
  );
}
