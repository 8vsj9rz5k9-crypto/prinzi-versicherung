import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      void router.replace(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isAuthenticated, loading, router]);

  return <LoadingSpinner fullScreen label="Routing to your workspace…" />;
}
