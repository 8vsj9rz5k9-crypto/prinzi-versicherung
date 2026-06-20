import axios, { AxiosResponse } from 'axios';

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Review' | 'At Risk';
  tier: 'Platinum' | 'Gold' | 'Silver';
  advisor: string;
  lastContact: string;
  policies: number;
  claims: number;
  premium: number;
  address: string;
  notes: string;
};

export type Policy = {
  id: string;
  customerId: string;
  type: 'Auto' | 'Home' | 'Life' | 'Commercial';
  status: 'Active' | 'Pending' | 'Renewal Due';
  premium: number;
  coverage: number;
  startDate: string;
  endDate: string;
  riskScore: number;
  paymentFrequency: 'Monthly' | 'Quarterly' | 'Annual';
  deductible: number;
};

export type Claim = {
  id: string;
  customerId: string;
  policyId: string;
  type: 'Collision' | 'Property' | 'Medical' | 'Liability';
  status: 'Open' | 'Investigating' | 'Resolved';
  amount: number;
  submittedAt: string;
  updatedAt: string;
  description: string;
  adjuster: string;
};

export type ConversationMessage = {
  id: string;
  sender: 'agent' | 'customer' | 'system';
  content: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  customerId: string;
  channel: 'SMS' | 'Voice' | 'Email';
  status: 'Live' | 'Follow-up' | 'Resolved';
  sentiment: 'Positive' | 'Neutral' | 'Escalation';
  agentName: string;
  phoneNumber: string;
  lastMessageAt: string;
  messages: ConversationMessage[];
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: 'info' | 'warning' | 'success';
  read: boolean;
};

export const isBrowser = () => typeof window !== 'undefined';
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '';
export const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || '';
export const hasApiBaseUrl = Boolean(apiBaseUrl);

export const apiClient = axios.create({
  baseURL: hasApiBaseUrl ? apiBaseUrl : undefined,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const cloneData = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchOrMock<T>(
  request: () => Promise<AxiosResponse<T>>,
  fallback: T,
  delay = 180
): Promise<T> {
  if (!hasApiBaseUrl) {
    await sleep(delay);
    return cloneData(fallback);
  }

  try {
    const response = await request();
    return response.data;
  } catch {
    await sleep(120);
    return cloneData(fallback);
  }
}

export const mockCustomers: Customer[] = [
  {
    id: 'cus-1001',
    name: 'Amelia Johnson',
    email: 'amelia.johnson@example.com',
    phone: '+1 (415) 555-0101',
    status: 'Active',
    tier: 'Platinum',
    advisor: 'Maya Chen',
    lastContact: '2026-06-18T10:24:00.000Z',
    policies: 3,
    claims: 1,
    premium: 7420,
    address: '240 Market Street, San Francisco, CA',
    notes: 'Interested in bundling cyber protection with existing commercial plan.'
  },
  {
    id: 'cus-1002',
    name: 'Noah Patel',
    email: 'noah.patel@example.com',
    phone: '+1 (646) 555-0112',
    status: 'Review',
    tier: 'Gold',
    advisor: 'Sophia Wright',
    lastContact: '2026-06-19T14:05:00.000Z',
    policies: 2,
    claims: 2,
    premium: 4380,
    address: '85 Madison Avenue, New York, NY',
    notes: 'Requested premium comparison before July renewal.'
  },
  {
    id: 'cus-1003',
    name: 'Olivia Garcia',
    email: 'olivia.garcia@example.com',
    phone: '+1 (312) 555-0188',
    status: 'Active',
    tier: 'Silver',
    advisor: 'Maya Chen',
    lastContact: '2026-06-15T08:45:00.000Z',
    policies: 1,
    claims: 0,
    premium: 1840,
    address: '14 Lake Shore Drive, Chicago, IL',
    notes: 'High CSAT after automated onboarding conversation.'
  },
  {
    id: 'cus-1004',
    name: 'Ethan Brooks',
    email: 'ethan.brooks@example.com',
    phone: '+1 (206) 555-0176',
    status: 'At Risk',
    tier: 'Gold',
    advisor: 'Jordan Bell',
    lastContact: '2026-06-10T16:30:00.000Z',
    policies: 2,
    claims: 1,
    premium: 3960,
    address: '901 Pine Street, Seattle, WA',
    notes: 'Recent billing complaint; prioritize follow-up this week.'
  }
];

export const mockPolicies: Policy[] = [
  {
    id: 'pol-2001',
    customerId: 'cus-1001',
    type: 'Commercial',
    status: 'Active',
    premium: 4120,
    coverage: 500000,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
    riskScore: 22,
    paymentFrequency: 'Quarterly',
    deductible: 5000
  },
  {
    id: 'pol-2002',
    customerId: 'cus-1001',
    type: 'Auto',
    status: 'Renewal Due',
    premium: 1980,
    coverage: 150000,
    startDate: '2025-08-01T00:00:00.000Z',
    endDate: '2026-08-01T00:00:00.000Z',
    riskScore: 36,
    paymentFrequency: 'Monthly',
    deductible: 1000
  },
  {
    id: 'pol-2003',
    customerId: 'cus-1002',
    type: 'Home',
    status: 'Active',
    premium: 2460,
    coverage: 380000,
    startDate: '2026-03-01T00:00:00.000Z',
    endDate: '2027-03-01T00:00:00.000Z',
    riskScore: 29,
    paymentFrequency: 'Annual',
    deductible: 2500
  },
  {
    id: 'pol-2004',
    customerId: 'cus-1004',
    type: 'Life',
    status: 'Pending',
    premium: 2160,
    coverage: 300000,
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2027-07-01T00:00:00.000Z',
    riskScore: 18,
    paymentFrequency: 'Monthly',
    deductible: 0
  }
];

export const mockClaims: Claim[] = [
  {
    id: 'clm-3001',
    customerId: 'cus-1001',
    policyId: 'pol-2002',
    type: 'Collision',
    status: 'Investigating',
    amount: 8200,
    submittedAt: '2026-06-11T09:15:00.000Z',
    updatedAt: '2026-06-19T13:20:00.000Z',
    description: 'Rear-end collision with minor frame damage and rental reimbursement request.',
    adjuster: 'Priya Nair'
  },
  {
    id: 'clm-3002',
    customerId: 'cus-1002',
    policyId: 'pol-2003',
    type: 'Property',
    status: 'Open',
    amount: 14600,
    submittedAt: '2026-06-13T11:50:00.000Z',
    updatedAt: '2026-06-18T08:10:00.000Z',
    description: 'Kitchen water damage following appliance leak.',
    adjuster: 'Marcus Lee'
  },
  {
    id: 'clm-3003',
    customerId: 'cus-1004',
    policyId: 'pol-2004',
    type: 'Medical',
    status: 'Resolved',
    amount: 5400,
    submittedAt: '2026-05-08T15:40:00.000Z',
    updatedAt: '2026-05-22T09:00:00.000Z',
    description: 'Emergency care reimbursement after covered accident.',
    adjuster: 'Lena Ortiz'
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-4001',
    customerId: 'cus-1001',
    channel: 'SMS',
    status: 'Live',
    sentiment: 'Positive',
    agentName: 'Maya Chen',
    phoneNumber: '+1 (415) 555-0101',
    lastMessageAt: '2026-06-20T05:46:00.000Z',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        content: 'Can you confirm if my rental car coverage is active while the claim is under review?',
        timestamp: '2026-06-20T05:42:00.000Z'
      },
      {
        id: 'msg-2',
        sender: 'agent',
        content: 'Yes, your active auto policy includes rental reimbursement up to 30 days. I can text the coverage summary now.',
        timestamp: '2026-06-20T05:46:00.000Z'
      }
    ]
  },
  {
    id: 'conv-4002',
    customerId: 'cus-1002',
    channel: 'Voice',
    status: 'Follow-up',
    sentiment: 'Neutral',
    agentName: 'Sophia Wright',
    phoneNumber: '+1 (646) 555-0112',
    lastMessageAt: '2026-06-19T16:18:00.000Z',
    messages: [
      {
        id: 'msg-3',
        sender: 'system',
        content: 'Voice transcription imported from inbound call.',
        timestamp: '2026-06-19T16:02:00.000Z'
      },
      {
        id: 'msg-4',
        sender: 'customer',
        content: 'I want to compare my renewal premium against a higher deductible option.',
        timestamp: '2026-06-19T16:04:00.000Z'
      }
    ]
  },
  {
    id: 'conv-4003',
    customerId: 'cus-1004',
    channel: 'Email',
    status: 'Resolved',
    sentiment: 'Escalation',
    agentName: 'Jordan Bell',
    phoneNumber: '+1 (206) 555-0176',
    lastMessageAt: '2026-06-18T12:10:00.000Z',
    messages: [
      {
        id: 'msg-5',
        sender: 'customer',
        content: 'Billing still looks incorrect after last month\'s policy adjustment.',
        timestamp: '2026-06-18T11:35:00.000Z'
      },
      {
        id: 'msg-6',
        sender: 'agent',
        content: 'We corrected the endorsement fee and issued a credit memo. Finance will apply it within 2 business days.',
        timestamp: '2026-06-18T12:10:00.000Z'
      }
    ]
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'noti-5001',
    title: 'High-priority claim escalation',
    description: 'Claim clm-3002 has been waiting for document review for 48 hours.',
    time: '2026-06-20T05:50:00.000Z',
    severity: 'warning',
    read: false
  },
  {
    id: 'noti-5002',
    title: 'AI handoff completed',
    description: 'Conversation conv-4001 was transferred to Maya Chen with sentiment positive.',
    time: '2026-06-20T04:20:00.000Z',
    severity: 'success',
    read: false
  },
  {
    id: 'noti-5003',
    title: 'Renewal risk identified',
    description: '2 policies are due for renewal within 45 days.',
    time: '2026-06-19T19:10:00.000Z',
    severity: 'info',
    read: true
  }
];

export const monthlyPerformance = [
  { name: 'Jan', premium: 48, claims: 12, retention: 94 },
  { name: 'Feb', premium: 52, claims: 15, retention: 95 },
  { name: 'Mar', premium: 58, claims: 10, retention: 96 },
  { name: 'Apr', premium: 60, claims: 13, retention: 96 },
  { name: 'May', premium: 67, claims: 11, retention: 97 },
  { name: 'Jun', premium: 71, claims: 9, retention: 98 }
];
