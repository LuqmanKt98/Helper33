import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Optimized query client configuration to reduce API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Increase stale time to reduce refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Reduce refetch frequency
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      
      // Retry with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Handle rate limit errors
      onError: (error) => {
        if (error?.response?.status === 429) {
          console.warn('[Query] Rate limit hit, backing off...');
        }
      },
    },
    mutations: {
      // Retry mutations with backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      onError: (error) => {
        if (error?.response?.status === 429) {
          console.error('[Mutation] Rate limit hit');
        }
      },
    },
  },
});

export default function OptimizedQueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}