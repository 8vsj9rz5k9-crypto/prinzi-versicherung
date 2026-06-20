import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useApiList } from "../hooks/useApiList";
import { api } from "../lib/api";
import type { Claim } from "../types";

export default function ClaimsPage() {
  const { data, loading, error } = useApiList<Claim>(api.claims);

  return (
    <Layout>
      <DataTable title="Claims" loading={loading} error={error}>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id}>{item.description} - €{item.amount}</li>
          ))}
        </ul>
      </DataTable>
    </Layout>
  );
}
