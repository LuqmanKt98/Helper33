import React, { useEffect } from 'react';

// Advanced security monitoring - NON-INTRUSIVE MODE
export default function ComprehensiveSecurity({ children }) {
  useEffect(() => {
    // Whitelist of allowed script sources
    const allowedScriptSources = [
      'base44.com',
      'supabase.co',
      'googleapis.com',
      'gstatic.com',
      'stripe.com',
      'js.stripe.com',
      'googletagmanager.com',
      'google-analytics.com',
      'onesignal.com',
      'gofundme.com',
      'dobrylife.com',
      'localhost',
      'webpack',
      'vite',
      'react',
      'elevenlabs.io'
    ];

    // Monitor scripts in a non-blocking way
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const src = node.src || '';
            
            // Only flag truly suspicious scripts (not from known sources)
            const isAllowed = allowedScriptSources.some(source => src.includes(source)) || 
                             !src || // Inline scripts are allowed
                             src.startsWith('blob:') || // Blob URLs are allowed
                             src.startsWith('data:'); // Data URLs are allowed
            
            if (!isAllowed && src) {
              console.warn('[Security] External script detected:', src);
              // Log but don't block - let security headers handle actual blocking
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  // Monitor for suspicious activity patterns (non-blocking)
  useEffect(() => {
    let clickCount = 0;
    let resetTimer;

    const handleClick = (e) => {
      clickCount++;
      
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        clickCount = 0;
      }, 1000);

      // Only warn on extremely suspicious patterns (100+ clicks per second)
      if (clickCount > 100) {
        console.warn('[Security] Unusual click pattern detected');
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      clearTimeout(resetTimer);
    };
  }, []);

  // Monitor console (logging only, no blocking)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      
      const errorMessage = args.join(' ');
      
      // Log security-relevant errors only
      if (errorMessage.toLowerCase().includes('security') || 
          errorMessage.toLowerCase().includes('xss') ||
          errorMessage.toLowerCase().includes('injection')) {
        console.warn('[Security Monitor]', errorMessage);
      }
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
}