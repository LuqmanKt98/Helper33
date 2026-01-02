import React, { useEffect } from 'react';
import SecurityHeaders from './SecurityHeaders';

export default function SecurityFramework({ children }) {
  useEffect(() => {
    // Whitelist of known safe domains
    const safeDomains = [
      'base44.com',
      'supabase.co', 
      'stripe.com',
      'gofundme.com',
      'googleapis.com',
      'gstatic.com',
      'googletagmanager.com',
      'onesignal.com',
      'dobrylife.com',
      'elevenlabs.io',
      'spoonacular.com',
      'openweathermap.org'
    ];

    // Log script loads for monitoring (non-blocking)
    const scriptObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT' && node.src) {
            const isSafe = safeDomains.some(domain => node.src.includes(domain));
            
            if (!isSafe) {
              // Log only, don't block
              console.info('[Security] External script loaded:', node.src);
            }
          }
        });
      });
    });

    scriptObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return () => scriptObserver.disconnect();
  }, []);

  return (
    <>
      <SecurityHeaders />
      {children}
    </>
  );
}