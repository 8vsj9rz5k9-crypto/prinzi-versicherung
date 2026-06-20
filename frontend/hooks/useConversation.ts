import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Conversation } from '@/services/api';
import { conversationsService } from '@/services/conversations';

export function useConversation(initialConversationId?: string) {
  const { data, isLoading } = useQuery(['conversations'], conversationsService.listConversations);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(initialConversationId);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (data) {
      setConversations(data);
      if (!selectedConversationId) {
        setSelectedConversationId(initialConversationId ?? data[0]?.id);
      }
    }
  }, [data, initialConversationId, selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const sendMessage = async (content: string) => {
    if (!selectedConversationId || !content.trim()) {
      return;
    }

    setIsSending(true);
    const updatedConversation = await conversationsService.sendMessage(selectedConversationId, content.trim());
    if (updatedConversation) {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedConversationId ? updatedConversation : conversation
        )
      );
    }
    setIsSending(false);
  };

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    setSelectedConversationId,
    isLoading,
    isSending,
    sendMessage
  };
}
