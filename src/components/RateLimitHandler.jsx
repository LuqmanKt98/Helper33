import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RateLimitHandler({ children }) {
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    // Intercept fetch to handle rate limits
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        
        // Check for rate limit response
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('Retry-After');
          const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader) : 60;
          
          setRateLimited(true);
          setRetryAfter(retrySeconds);
          
          // Auto-retry after delay
          setTimeout(() => {
            setRateLimited(false);
            window.location.reload();
          }, retrySeconds * 1000);
          
          console.warn('[Rate Limit] Too many requests. Retry after:', retrySeconds);
        }
        
        return response;
      } catch (error) {
        console.error('[Fetch Error]', error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (rateLimited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-md w-full">
          <Alert className="border-orange-300 bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="ml-2">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-orange-900 mb-2">Rate Limit Reached</h3>
                  <p className="text-sm text-orange-800">
                    Too many requests to the API. The page will automatically refresh in {retryAfter} seconds.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Waiting {retryAfter}s before retry...</span>
                </div>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return children;
}