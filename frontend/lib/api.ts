import type { Claim, Conversation, Customer, Policy } from "../types";

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
  login: (username: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};
