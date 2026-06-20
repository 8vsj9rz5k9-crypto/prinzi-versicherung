import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useApiList } from "../hooks/useApiList";
import { api } from "../lib/api";
import type { Policy } from "../types";

export default function PoliciesPage() {
  const { data, loading, error } = useApiList<Policy>(api.policies);

  return (
    <Layout>
      <DataTable title="Policies" loading={loading} error={error}>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id}>{item.policy_type} - {item.status}</li>
          ))}
        </ul>
      </DataTable>
    </Layout>
  );
}
