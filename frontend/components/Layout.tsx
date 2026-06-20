import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';

type LayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function Layout({ title, children }: LayoutProps) {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      void router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return <LoadingSpinner fullScreen label="Preparing workspace…" />;
  }

  return (
    <>
      <Head>
        <title>{title} | Prinzi AI Insurance</title>
      </Head>
      <div className="min-h-screen bg-slate-50">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="lg:pl-72">
          <Navbar onMenuClick={() => setMobileOpen(true)} />
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
