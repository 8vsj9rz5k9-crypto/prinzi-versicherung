import Link from 'next/link';
import { Customer } from '@/services/api';

type CustomerCardProps = {
  customer: Customer;
};

export default function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Link href={`/customers/${customer.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{customer.name}</p>
          <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
          <p className="text-sm text-slate-500">{customer.phone}</p>
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{customer.tier}</span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Advisor</dt>
          <dd className="font-medium text-slate-900">{customer.advisor}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Annual premium</dt>
          <dd className="font-medium text-slate-900">${customer.premium.toLocaleString()}</dd>
        </div>
      </dl>
    </Link>
  );
}
