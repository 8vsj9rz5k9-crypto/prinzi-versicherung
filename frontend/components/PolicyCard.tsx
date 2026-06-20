import Link from 'next/link';
import { Policy } from '@/services/api';

type PolicyCardProps = {
  policy: Policy;
};

export default function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <Link href={`/policies/${policy.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{policy.type} policy</p>
          <p className="mt-1 text-sm text-slate-500">Policy #{policy.id}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{policy.status}</span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Coverage</dt>
          <dd className="font-medium text-slate-900">${policy.coverage.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Premium</dt>
          <dd className="font-medium text-slate-900">${policy.premium.toLocaleString()}</dd>
        </div>
      </dl>
    </Link>
  );
}
