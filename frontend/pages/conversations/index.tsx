import { useMemo } from 'react';
import ConversationChat from '@/components/ConversationChat';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import PhoneDialer from '@/components/PhoneDialer';
import { useConversation } from '@/hooks/useConversation';

export default function ConversationsPage() {
  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    setSelectedConversationId,
    isLoading,
    isSending,
    sendMessage
  } = useConversation();

  const liveCount = useMemo(
    () => conversations.filter((conversation) => conversation.status === 'Live').length,
    [conversations]
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Loading conversations…" />;
  }

  return (
    <Layout title="Conversations">
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['Queue size', `${conversations.length}`],
          ['Live handoffs', `${liveCount}`],
          ['Selected channel', selectedConversation?.channel ?? '—']
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px,1fr,340px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Conversation queue</h2>
            <p className="text-sm text-slate-500">Review active AI threads and manual follow-ups.</p>
          </div>
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  conversation.id === selectedConversationId ? 'border-primary-200 bg-primary-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{conversation.channel} · {conversation.agentName}</p>
                    <p className="mt-1 text-sm text-slate-500">{conversation.messages[conversation.messages.length - 1]?.content}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">{conversation.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <ConversationChat conversation={selectedConversation} onSendMessage={sendMessage} isSending={isSending} />

        <PhoneDialer initialNumber={selectedConversation?.phoneNumber ?? ''} />
      </section>
    </Layout>
  );
}
