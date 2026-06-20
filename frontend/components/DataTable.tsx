import type { PropsWithChildren } from "react";

type Props = {
  title: string;
  loading: boolean;
  error: string | null;
};

export default function DataTable({ title, loading, error, children }: PropsWithChildren<Props>) {
  return (
    <div className="rounded border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : <div>{children}</div>}
    </div>
  );
}
