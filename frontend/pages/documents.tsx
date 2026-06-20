import { useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import type { Document } from "../types";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selected, setSelected] = useState<Document | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ text: string; source: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New document form
  const [filename, setFilename] = useState("");
  const [docText, setDocText] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadDocuments() {
    setLoading(true);
    setError(null);
    try {
      const docs = await api.documents();
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }

  async function createDocument() {
    if (!filename.trim() || !docText.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const doc = await api.createDocument({
        filename: filename.trim(),
        content_type: "text/plain",
        text: docText.trim(),
      });
      setDocuments((prev) => [doc, ...prev]);
      setFilename("");
      setDocText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Erstellen");
    } finally {
      setCreating(false);
    }
  }

  async function analyze(doc: Document) {
    setAnalyzing(true);
    setError(null);
    try {
      const updated = await api.analyzeDocument(doc.id);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (selected?.id === updated.id) setSelected(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyse-Fehler");
    } finally {
      setAnalyzing(false);
    }
  }

  async function askQuestion() {
    if (!selected || !question.trim()) return;
    setLoading(true);
    setAnswer(null);
    setError(null);
    try {
      const res = await api.askDocument(selected.id, question.trim());
      setAnswer({ text: res.answer, source: res.source });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Frage-Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Dokumente</h1>

        {/* Create document */}
        <div className="border rounded-lg p-4 mb-6 bg-white">
          <h2 className="font-semibold mb-3">Neues Dokument hinzufügen</h2>
          <div className="space-y-2">
            <input
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Dateiname (z.B. police_2024.txt)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <textarea
              className="border rounded px-3 py-2 text-sm w-full h-28 resize-none"
              placeholder="Dokumenttext hier einfügen…"
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
            />
            <button
              onClick={createDocument}
              disabled={creating || !filename.trim() || !docText.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
            >
              {creating ? "Wird gespeichert…" : "Dokument speichern"}
            </button>
          </div>
        </div>

        {/* Load button */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={loadDocuments}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
          >
            Dokumente laden
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document list */}
          <div>
            <h2 className="font-semibold mb-2">Dokumente ({documents.length})</h2>
            {documents.length === 0 && (
              <p className="text-gray-400 text-sm">Keine Dokumente geladen.</p>
            )}
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  onClick={() => { setSelected(doc); setAnswer(null); setQuestion(""); }}
                  className={`border rounded-lg p-3 cursor-pointer hover:bg-blue-50 ${
                    selected?.id === doc.id ? "border-blue-500 bg-blue-50" : "bg-white"
                  }`}
                >
                  <p className="font-medium text-sm">{doc.filename}</p>
                  <p className="text-xs text-gray-400">{doc.content_type}</p>
                  {doc.summary && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.summary}</p>
                  )}
                  <span
                    className={`text-xs mt-1 inline-block ${
                      doc.summary_source === "openai" ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {doc.summary ? (doc.summary_source === "openai" ? "🤖 AI-Analyse" : "⚙️ Fallback") : "Nicht analysiert"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Selected document detail */}
          {selected && (
            <div className="border rounded-lg p-4 bg-white">
              <h2 className="font-semibold mb-2">{selected.filename}</h2>
              <p className="text-xs text-gray-500 mb-3 break-all">ID: {selected.id}</p>

              <button
                onClick={() => analyze(selected)}
                disabled={analyzing}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded mb-3"
              >
                {analyzing ? "Analysiere…" : "Dokument analysieren"}
              </button>

              {selected.summary && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium text-xs text-gray-500 mb-1">Zusammenfassung:</p>
                  <p className="whitespace-pre-wrap text-xs">{selected.summary}</p>
                </div>
              )}

              {/* Q&A */}
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Fragen Sie das Dokument:</p>
                <div className="flex gap-2">
                  <input
                    className="border rounded px-2 py-1.5 text-xs flex-1"
                    placeholder="Ihre Frage…"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                  />
                  <button
                    onClick={askQuestion}
                    disabled={loading || !question.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded"
                  >
                    Fragen
                  </button>
                </div>
                {answer && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <p className="whitespace-pre-wrap">{answer.text}</p>
                    <span className={`text-xs mt-1 block ${answer.source === "openai" ? "text-green-600" : "text-gray-400"}`}>
                      {answer.source === "openai" ? "🤖 AI" : "⚙️ Fallback"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
