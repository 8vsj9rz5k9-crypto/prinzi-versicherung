export type Customer = { id: string; name: string; email: string; phone: string };
export type Policy = { id: string; customer_id: string; policy_type: string; status: string; premium: number };
export type Claim = { id: string; policy_id: string; customer_id: string; description: string; status: string; amount: number };
export type Conversation = { id: string; customer_id: string; message: string; channel: string; response: string; source: string; created_at?: string };
export type Message = { id: string; conversation_id: string; role: string; content: string; source: string; rating?: number | null; created_at?: string };
export type ConversationHistory = { conversation: Conversation; messages: Message[] };
export type Document = { id: string; filename: string; content_type: string; text: string; summary: string; summary_source: string; created_at?: string };
// Phase 3
export type SMSMessage = { id: string; from_: string; to: string; body: string; direction: string; status: string; source: string; created_at?: string };
export type VoiceCall = { id: string; from_: string; to: string; status: string; direction: string; duration?: number | null; recording_url?: string | null; source: string; created_at?: string };
export type CallRecording = { id: string; call_id: string; recording_url: string; duration?: number | null; created_at?: string };
