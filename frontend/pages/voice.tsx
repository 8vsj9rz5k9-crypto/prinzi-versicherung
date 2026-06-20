import { useState } from "react";
import Layout from "../components/Layout";
import { api } from "../lib/api";
import type { CallRecording, VoiceCall } from "../types";

const IVR_MENU = [
  { digit: "1", label: "Policen-Status prüfen" },
  { digit: "2", label: "Schaden melden" },
  { digit: "3", label: "Mit Mitarbeiter sprechen" },
  { digit: "4", label: "Häufige Fragen" },
];

export default function VoicePage() {
  const [callTo, setCallTo] = useState("");
  const [activeCall, setActiveCall] = useState<VoiceCall | null>(null);
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ivrBase] = useState(
    (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/voice/ivr"
  );

  async function handleCall() {
    if (!callTo.trim()) {
      setError("Bitte Telefonnummer eingeben.");
      return;
    }
    setError(null);
    setCallLoading(true);
    try {
      const call = await api.initiateCall(callTo.trim());
      setActiveCall(call);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Anruf");
    } finally {
      setCallLoading(false);
    }
  }

  async function loadRecordings() {
    setRecLoading(true);
    setError(null);
    try {
      const recs = await api.voiceRecordings();
      setRecordings(recs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setRecLoading(false);
    }
  }

  function callStatusBadge(status: string) {
    const colors: Record<string, string> = {
      queued: "bg-yellow-100 text-yellow-700",
      ringing: "bg-blue-100 text-blue-700",
      "in-progress": "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
      failed: "bg-red-100 text-red-700",
      "no-answer": "bg-orange-100 text-orange-700",
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
        <h1 className="text-2xl font-bold">Voice & IVR</h1>

        {/* IVR Menu preview */}
        <section className="border rounded-lg p-4 space-y-3 bg-blue-50">
          <h2 className="text-lg font-semibold">IVR Menü</h2>
          <p className="text-sm text-gray-600">
            TwiML-Endpunkt:{" "}
            <a href={ivrBase} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {ivrBase}
            </a>
          </p>
          <ul className="space-y-1">
            {IVR_MENU.map((item) => (
              <li key={item.digit} className="flex gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  {item.digit}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Outbound call */}
        <section className="border rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold">Ausgehender Anruf</h2>
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-1.5 text-sm flex-1"
              placeholder="Telefonnummer (z.B. +49123456789)"
              value={callTo}
              onChange={(e) => setCallTo(e.target.value)}
            />
            <button
              onClick={handleCall}
              disabled={callLoading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
            >
              {callLoading ? "Wird verbunden…" : "📞 Anrufen"}
            </button>
          </div>

          {activeCall && (
            <div className="bg-gray-50 border rounded p-3 text-sm space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-medium">Anruf gestartet</p>
                {callStatusBadge(activeCall.status)}
              </div>
              <p className="text-gray-500">An: {activeCall.to}</p>
              <p className="text-gray-400 text-xs">
                Quelle: {activeCall.source === "fallback" ? "⚙️ Fallback" : "☎️ Twilio"}
              </p>
            </div>
          )}
        </section>

        {/* Call recordings */}
        <section className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Anrufaufzeichnungen</h2>
            <button
              onClick={loadRecordings}
              disabled={recLoading}
              className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm"
            >
              {recLoading ? "Lädt…" : "Laden"}
            </button>
          </div>

          {recordings.length > 0 ? (
            <ul className="space-y-2">
              {recordings.map((rec) => (
                <li key={rec.id} className="border rounded p-3 text-sm bg-gray-50 space-y-1">
                  <p className="text-gray-500 text-xs">Anruf-ID: {rec.call_id}</p>
                  {rec.duration != null && (
                    <p className="text-gray-600">Dauer: {rec.duration}s</p>
                  )}
                  <audio controls src={rec.recording_url} className="w-full mt-1">
                    <a href={rec.recording_url} target="_blank" rel="noopener noreferrer">
                      Aufzeichnung herunterladen
                    </a>
                  </audio>
                </li>
              ))}
            </ul>
          ) : (
            !recLoading && (
              <p className="text-gray-400 text-sm">
                Klicken Sie auf &quot;Laden&quot;, um Aufzeichnungen anzuzeigen.
              </p>
            )
          )}
        </section>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </Layout>
  );
}
