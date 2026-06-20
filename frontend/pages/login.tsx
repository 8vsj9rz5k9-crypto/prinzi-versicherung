import { FormEvent, useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const result = await api.login(username, password);
      setToken(result.access_token);
    } catch {
      setError("Login failed");
    }
  };

  return (
    <Layout>
      <form onSubmit={onSubmit} className="max-w-sm space-y-3 rounded border bg-white p-4">
        <h1 className="text-xl font-semibold">Login</h1>
        <input className="w-full rounded border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">Sign in</button>
        {token ? <p className="text-green-700">Token: {token}</p> : null}
        {error ? <p className="text-red-700">{error}</p> : null}
      </form>
    </Layout>
  );
}
