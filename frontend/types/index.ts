export type Customer = { id: string; name: string; email: string; phone: string };
export type Policy = { id: string; customer_id: string; policy_type: string; status: string; premium: number };
export type Claim = { id: string; policy_id: string; customer_id: string; description: string; status: string; amount: number };
export type Conversation = { id: string; customer_id: string; message: string; channel: string; response: string; source: string };
