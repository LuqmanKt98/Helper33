import React from 'react';
import { useQuery } from '@tanstack/react-query';

export default function RequestValidator({ children }) {
  const { data: isSecure } = useQuery({
    queryKey: ['security-check'],
    queryFn: async () => {
      // Check if running on HTTPS
      if (typeof window !== 'undefined') {
        const isHttps = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost';
        return isHttps || isLocalhost;
      }
      return true;
    },
    staleTime: Infinity,
  });

  // Show warning if not secure (only in production)
  if (isSecure === false && process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insecure Connection</h2>
          <p className="text-gray-600 mb-4">
            This site must be accessed via HTTPS for security reasons.
          </p>
          <button
            onClick={() => {
              window.location.href = window.location.href.replace('http://', 'https://');
            }}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Switch to HTTPS
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}