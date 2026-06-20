import Layout from "../components/Layout";
import Card from "../components/Card";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>Customers, policies, claims and conversations overview.</Card>
        <Card>Use sidebar navigation to manage records.</Card>
      </div>
    </Layout>
  );
}
