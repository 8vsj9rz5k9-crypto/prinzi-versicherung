import Link from 'next/link';
import { useQuery } from 'react-query';
import CustomerCard from '@/components/CustomerCard';
import DataTable from '@/components/DataTable';
import type { DataTableColumn } from '@/components/DataTable';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Customer } from '@/services/api';
import { customersService } from '@/services/customers';

export default function CustomersPage() {
  const { data, isLoading } = useQuery(['customers'], customersService.listCustomers);

  if (isLoading || !data) {
    return <LoadingSpinner fullScreen label="Loading customers…" />;
  }

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (customer: Customer) => (
        <div>
          <p className="font-semibold text-slate-900">{customer.name}</p>
          <p className="text-xs text-slate-500">{customer.email}</p>
        </div>
      )
    },
    { key: 'tier', header: 'Tier', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'advisor', header: 'Advisor', sortable: true },
    {
      key: 'premium',
      header: 'Annual premium',
      sortable: true,
      render: (customer: Customer) => <span className="font-medium text-slate-900">${customer.premium.toLocaleString()}</span>
    },
    {
      key: 'id',
      header: 'Open',
      render: (customer: Customer) => (
        <Link className="font-semibold text-primary-600" href={`/customers/${customer.id}`}>
          View details
        </Link>
      )
    }
  ];

  return (
    <Layout title="Customers">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Customer portfolio</h2>
          <p className="text-sm text-slate-500">Monitor relationship health, premium value, and advisor coverage.</p>
        </div>
        <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-700">
          Mock-friendly dataset remains available when backend services are offline.
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </section>

      <DataTable columns={columns} data={data} searchPlaceholder="Search by name, email, advisor, or tier" />
    </Layout>
  );
}
