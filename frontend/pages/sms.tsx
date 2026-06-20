import { useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import type { SMSMessage } from "../types";

export default function SmsPage() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [history, setHistory] = useState<SMSMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastSent, setLastSent] = useState<SMSMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!to.trim() || !body.trim()) {
      setError("Bitte Telefonnummer und Nachricht eingeben.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const msg = await api.sendSms(to.trim(), body.trim());
      setLastSent(msg);
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Senden");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    setError(null);
    try {
      const msgs = await api.smsHistory(filterPhone.trim() || undefined);
      setHistory(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setHistoryLoading(false);
    }
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      sent: "bg-green-100 text-green-700",
      delivered: "bg-blue-100 text-blue-700",
      failed: "bg-red-100 text-red-700",
      received: "bg-purple-100 text-purple-700",
      queued: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">SMS</h1>

        {/* Send SMS */}
        <section className="border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold">SMS senden</h2>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1.5 text-sm flex-1"
              placeholder="Telefonnummer (z.B. +49123456789)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <textarea
            className="border rounded px-3 py-2 text-sm w-full resize-none"
            rows={3}
            placeholder="Nachricht eingeben…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? "Wird gesendet…" : "Senden"}
          </button>

          {lastSent && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
              <p className="font-medium text-green-800">✓ SMS gespeichert</p>
              <p className="text-gray-600">An: {lastSent.to}</p>
              <p className="text-gray-600">Status: {statusBadge(lastSent.status)}</p>
              <p className="text-gray-500 text-xs mt-1">
                Quelle: {lastSent.source === "fallback" ? "⚙️ Fallback" : "📱 Twilio"}
              </p>
            </div>
          )}
        </section>

        {/* SMS History */}
        <section className="border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold">SMS-Verlauf</h2>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1.5 text-sm flex-1"
              placeholder="Nach Nummer filtern (optional)"
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
            />
            <button
              onClick={loadHistory}
              disabled={historyLoading}
              className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
            >
              {historyLoading ? "Lädt…" : "Laden"}
            </button>
          </div>

          {history.length > 0 ? (
            <ul className="space-y-2">
              {history.map((msg) => (
                <li key={msg.id} className="border rounded p-3 text-sm bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs font-medium mr-2 ${msg.direction === "inbound" ? "text-purple-600" : "text-blue-600"}`}>
                        {msg.direction === "inbound" ? "⬇ Eingehend" : "⬆ Ausgehend"}
                      </span>
                      {statusBadge(msg.status)}
                    </div>
                    <span className="text-xs text-gray-400">
                      {msg.source === "fallback" ? "⚙️" : "📱"}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-500 text-xs">Von: {msg.from_} → An: {msg.to}</p>
                  <p className="mt-1 text-gray-800">{msg.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            history.length === 0 && !historyLoading && (
              <p className="text-gray-400 text-sm">Klicken Sie auf &quot;Laden&quot;, um den Verlauf anzuzeigen.</p>
            )
          )}
        </section>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </Layout>
  );
}
