import { useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import type { Conversation, Message } from "../types";

type ChatEntry = { role: "user" | "assistant"; content: string; source?: string };

export default function ConversationsPage() {
  const [customerId, setCustomerId] = useState("");
  const [input, setInput] = useState("");
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startOrSend() {
    if (!input.trim()) return;
    if (!customerId.trim()) {
      setError("Bitte Kunden-ID eingeben.");
      return;
    }
    setError(null);
    setLoading(true);
    const userMessage = input.trim();
    setInput("");

    try {
      if (!activeConvo) {
        // Start new conversation
        const convo = await api.createConversation({
          customer_id: customerId,
          message: userMessage,
          channel: "web",
        });
        setActiveConvo(convo);
        setChat([
          { role: "user", content: userMessage },
          { role: "assistant", content: convo.response, source: convo.source },
        ]);
      } else {
        // Continue existing conversation
        setChat((prev) => [...prev, { role: "user", content: userMessage }]);
        const msg: Message = await api.addMessage(activeConvo.id, userMessage);
        setChat((prev) => [
          ...prev,
          { role: "assistant", content: msg.content, source: msg.source },
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Senden");
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setActiveConvo(null);
    setChat([]);
    setError(null);
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">AI Insurance Agent</h1>

        {/* Customer ID input */}
        <div className="mb-4 flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700 w-28 shrink-0">Kunden-ID:</label>
          <input
            className="border rounded px-3 py-1.5 text-sm flex-1"
            placeholder="Kunden-ID eingeben"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={!!activeConvo}
          />
          {activeConvo && (
            <button
              onClick={resetConversation}
              className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
            >
              Neu starten
            </button>
          )}
        </div>

        {/* Chat window */}
        <div className="border rounded-lg bg-gray-50 h-80 overflow-y-auto p-3 mb-3 space-y-3">
          {chat.length === 0 && (
            <p className="text-gray-400 text-sm text-center mt-8">
              Stellen Sie dem Insurance Agent eine Frage…
            </p>
          )}
          {chat.map((entry, i) => (
            <div
              key={i}
              className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                  entry.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{entry.content}</p>
                {entry.role === "assistant" && entry.source && (
                  <span
                    className={`text-xs mt-1 block ${
                      entry.source === "openai" ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {entry.source === "openai" ? "🤖 AI" : "⚙️ Fallback"}
                  </span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-lg px-3 py-2 text-sm text-gray-400 animate-pulse">
                Antwort wird generiert…
              </div>
            </div>
          )}
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 text-sm flex-1"
            placeholder="Ihre Nachricht…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && startOrSend()}
            disabled={loading}
          />
          <button
            onClick={startOrSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
          >
            Senden
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {activeConvo && (
          <p className="text-xs text-gray-400 mt-2">Konversation: {activeConvo.id}</p>
        )}
      </div>
    </Layout>
  );
}
