import { useEffect } from 'react';

export default function ServiceWorkerInstaller() {
  useEffect(() => {
    // Only register service worker in production, not in preview/development
    const hostname = window.location.hostname;
    const isPreview = hostname.includes('checkpoint') || 
                      hostname.includes('localhost') || 
                      hostname.includes('127.0.0.1') ||
                      hostname.includes('.base44.app');
    
    if (isPreview) {
      console.log('Service Worker registration skipped - running in preview/development mode');
      return;
    }

    // Only proceed if in production environment
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}