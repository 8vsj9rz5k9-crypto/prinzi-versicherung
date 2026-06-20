import { PhoneIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

type PhoneDialerProps = {
  initialNumber?: string;
  onCall?: (phoneNumber: string) => void;
};

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export default function PhoneDialer({ initialNumber = '', onCall }: PhoneDialerProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [status, setStatus] = useState('Ready for outbound handoff');

  useEffect(() => {
    setPhoneNumber(initialNumber);
  }, [initialNumber]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Phone dialer</h3>
          <p className="text-sm text-slate-500">Prepare manual handoff or callback from the conversation queue.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{status}</span>
      </div>

      <input
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400"
        value={phoneNumber}
        onChange={(event) => setPhoneNumber(event.target.value)}
        placeholder="Enter phone number"
      />

      <div className="mt-4 grid grid-cols-3 gap-3">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 transition hover:border-primary-200 hover:bg-primary-50"
            onClick={() => setPhoneNumber((current) => `${current}${digit}`)}
          >
            {digit}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="flex-1 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          onClick={() => {
            setStatus('Dialing simulated line');
            onCall?.(phoneNumber);
          }}
        >
          <span className="inline-flex items-center gap-2">
            <PhoneIcon className="h-4 w-4" />
            Place call
          </span>
        </button>
        <button
          type="button"
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          onClick={() => setPhoneNumber((current) => current.slice(0, -1))}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
