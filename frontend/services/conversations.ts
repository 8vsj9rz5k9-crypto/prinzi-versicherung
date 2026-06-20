import { io, Socket } from 'socket.io-client';
import {
  Conversation,
  ConversationMessage,
  apiClient,
  cloneData,
  fetchOrMock,
  hasApiBaseUrl,
  isBrowser,
  mockConversations,
  socketUrl
} from '@/services/api';

let conversationStore = cloneData(mockConversations);

export const conversationsService = {
  async listConversations(): Promise<Conversation[]> {
    return fetchOrMock(() => apiClient.get<Conversation[]>('/conversations'), conversationStore);
  },
  async getConversationById(id: string): Promise<Conversation | null> {
    const fallback = conversationStore.find((conversation) => conversation.id === id) ?? null;
    return fetchOrMock(() => apiClient.get<Conversation>(`/conversations/${id}`), fallback);
  },
  async sendMessage(conversationId: string, content: string): Promise<Conversation | null> {
    const timestamp = new Date().toISOString();
    const newMessage: ConversationMessage = {
      id: `msg-${Math.random().toString(36).slice(2, 10)}`,
      sender: 'agent',
      content,
      timestamp
    };

    conversationStore = conversationStore.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            status: 'Live',
            lastMessageAt: timestamp,
            messages: [...conversation.messages, newMessage]
          }
        : conversation
    );

    const fallback = conversationStore.find((conversation) => conversation.id === conversationId) ?? null;

    return fetchOrMock(
      () => apiClient.post<Conversation>(`/conversations/${conversationId}/messages`, { content }),
      fallback,
      80
    );
  },
  connectConversationStream(): Socket | null {
    if (!isBrowser() || !socketUrl || !hasApiBaseUrl) {
      return null;
    }

    return io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true
    });
  }
};
