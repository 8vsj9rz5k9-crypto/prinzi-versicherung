import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Conversation } from '@/services/api';

type ConversationChatProps = {
  conversation: Conversation | null;
  onSendMessage: (message: string) => Promise<void>;
  isSending?: boolean;
};

export default function ConversationChat({ conversation, onSendMessage, isSending }: ConversationChatProps) {
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  if (!conversation) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Select a conversation to review AI transcripts, send messages, or prepare a live handoff.
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    const nextMessage = message;
    setMessage('');
    await onSendMessage(nextMessage);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{conversation.channel} conversation</h3>
            <p className="text-sm text-slate-500">Agent: {conversation.agentName} · Sentiment: {conversation.sentiment}</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{conversation.status}</span>
        </div>
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto px-6 py-5">
        {conversation.messages.map((item) => {
          const mine = item.sender === 'agent';
          return (
            <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${mine ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                <p>{item.content}</p>
                <p className={`mt-2 text-[11px] ${mine ? 'text-primary-100' : 'text-slate-500'}`}>
                  {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="border-t border-slate-200 px-6 py-4" onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <textarea
            className="min-h-[52px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-primary-400"
            placeholder="Send a follow-up message or summary..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSending}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
