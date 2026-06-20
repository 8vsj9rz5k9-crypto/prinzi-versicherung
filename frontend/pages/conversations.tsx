import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { useApiList } from "../hooks/useApiList";
import { api } from "../lib/api";
import type { Conversation } from "../types";

export default function ConversationsPage() {
  const { data, loading, error } = useApiList<Conversation>(api.conversations);

  return (
    <Layout>
      <DataTable title="Conversations" loading={loading} error={error}>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id}>{item.message} → {item.response}</li>
          ))}
        </ul>
      </DataTable>
    </Layout>
  );
}
