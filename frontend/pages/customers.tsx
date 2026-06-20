import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useApiList } from "../hooks/useApiList";
import { api } from "../lib/api";
import type { Customer } from "../types";

export default function CustomersPage() {
  const { data, loading, error } = useApiList<Customer>(api.customers);

  return (
    <Layout>
      <DataTable title="Customers" loading={loading} error={error}>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id}>{item.name} ({item.email})</li>
          ))}
        </ul>
      </DataTable>
    </Layout>
  );
}
