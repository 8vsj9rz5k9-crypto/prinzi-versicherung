import type { AppProps } from 'next/app';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/hooks/useAuth';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
