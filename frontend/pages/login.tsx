import { ArrowRightIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import type { LoginInput } from '@/services/auth';

type LoginFormValues = LoginInput;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginFormValues>({
    defaultValues: {
      email: 'agent@prinzi.ai',
      password: 'password123'
    }
  });
  const { login, loading, isAuthenticated } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      void router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const onSubmit = handleSubmit(async (values) => {
    setError('');
    try {
      await login(values);
      await router.push('/dashboard');
    } catch {
      setError('Unable to sign in. Check your credentials or use the mock defaults.');
    }
  });

  return (
    <>
      <Head>
        <title>Sign in | Prinzi AI Insurance</title>
      </Head>
      <div className="flex min-h-screen bg-slate-950 text-white">
        <div className="hidden w-1/2 flex-col justify-between p-12 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-300">Prinzi</p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight">AI Insurance Agent frontend</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Manage customers, policies, claims, and AI-assisted conversations from a production-ready operations cockpit.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              ['99.2%', 'Renewal readiness'],
              ['14 min', 'Avg. claim triage'],
              ['24/7', 'AI availability']
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-semibold">{value}</p>
                <p className="mt-2 text-sm text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-soft backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-200">Secure sign in</p>
            <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-300">Works with Supabase when configured, or with local mock auth defaults.</p>
            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-primary-300 focus:outline-none"
                  type="email"
                  {...register('email', { required: true })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-primary-300 focus:outline-none"
                  type="password"
                  {...register('password', { required: true })}
                />
              </div>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                Enter workspace
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
