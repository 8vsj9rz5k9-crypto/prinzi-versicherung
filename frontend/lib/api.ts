import type { Claim, Conversation, ConversationHistory, Customer, Document, Message, Policy } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/health"),
  customers: () => request<Customer[]>("/customers"),
  policies: () => request<Policy[]>("/policies"),
  claims: () => request<Claim[]>("/claims"),
  conversations: () => request<Conversation[]>("/conversations"),
  createConversation: (payload: { customer_id: string; message: string; channel?: string }) =>
    request<Conversation>("/conversations", { method: "POST", body: JSON.stringify(payload) }),
  getConversation: (id: string) => request<Conversation>(`/conversations/${id}`),
  getConversationHistory: (id: string) =>
    request<ConversationHistory>(`/conversations/${id}/history`),
  addMessage: (id: string, message: string) =>
    request<Message>(`/conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  documents: () => request<Document[]>("/documents"),
  createDocument: (payload: { filename: string; content_type: string; text: string }) =>
    request<Document>("/documents/text", { method: "POST", body: JSON.stringify(payload) }),
  getDocument: (id: string) => request<Document>(`/documents/${id}`),
  analyzeDocument: (id: string) =>
    request<Document>(`/documents/${id}/analyze`, { method: "POST", body: JSON.stringify({}) }),
  askDocument: (id: string, question: string) =>
    request<{ document_id: string; question: string; answer: string; source: string }>(
      `/documents/${id}/qa`,
      { method: "POST", body: JSON.stringify({ question }) },
    ),
  login: (username: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};
