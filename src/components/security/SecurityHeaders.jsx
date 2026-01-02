import { useEffect } from 'react';

export default function SecurityHeaders() {
  useEffect(() => {
    // Log security initialization
    console.log('[Security] Initializing security headers...');
    
    // Only apply strict clickjacking prevention in production
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isDevEnvironment = hostname === 'localhost' || 
                            hostname === '127.0.0.1' || 
                            hostname.includes('preview') ||
                            hostname.includes('base44.app') ||
                            hostname.includes('dev.');
    
    // Prevent clickjacking only in production
    if (!isDevEnvironment && typeof window !== 'undefined') {
      if (window.self !== window.top) {
        try {
          window.top.location = window.self.location;
        } catch (e) {
          // Silently fail if cross-origin
          console.warn('[Security] Cross-origin frame detected');
        }
      }
    }
    
    console.log('[Security] Security headers initialized');
  }, []);

  return null;
}