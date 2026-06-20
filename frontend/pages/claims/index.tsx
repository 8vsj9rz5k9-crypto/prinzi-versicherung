import Link from 'next/link';
import { format } from 'date-fns';
import { useQuery } from 'react-query';
import ClaimCard from '@/components/ClaimCard';
import DataTable from '@/components/DataTable';
import type { DataTableColumn } from '@/components/DataTable';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Claim } from '@/services/api';
import { claimsService } from '@/services/claims';

export default function ClaimsPage() {
  const { data, isLoading } = useQuery(['claims'], claimsService.listClaims);

  if (isLoading || !data) {
    return <LoadingSpinner fullScreen label="Loading claims…" />;
  }

  const columns: DataTableColumn<Claim>[] = [
    { key: 'type', header: 'Claim type', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (claim: Claim) => <span className="font-medium text-slate-900">${claim.amount.toLocaleString()}</span>
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      sortable: true,
      render: (claim: Claim) => format(new Date(claim.submittedAt), 'MMM d, yyyy')
    },
    {
      key: 'id',
      header: 'Open',
      render: (claim: Claim) => (
        <Link className="font-semibold text-primary-600" href={`/claims/${claim.id}`}>
          View claim
        </Link>
      )
    }
  ];

  return (
    <Layout title="Claims">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Claims hub</h2>
        <p className="text-sm text-slate-500">Coordinate review queues, financial exposure, and adjuster assignments.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </section>
      <DataTable columns={columns} data={data} searchPlaceholder="Search by claim type, status, or adjuster" />
    </Layout>
  );
}
