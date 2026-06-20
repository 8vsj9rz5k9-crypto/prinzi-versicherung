import Link from 'next/link';
import { Claim } from '@/services/api';

type ClaimCardProps = {
  claim: Claim;
};

export default function ClaimCard({ claim }: ClaimCardProps) {
  return (
    <Link href={`/claims/${claim.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{claim.type} claim</p>
          <p className="mt-1 text-sm text-slate-500">Claim #{claim.id}</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{claim.status}</span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{claim.description}</p>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-slate-500">Adjuster: {claim.adjuster}</span>
        <span className="font-semibold text-slate-900">${claim.amount.toLocaleString()}</span>
      </div>
    </Link>
  );
}
