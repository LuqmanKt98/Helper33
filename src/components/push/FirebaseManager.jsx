import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Note: Firebase SDKs must be loaded via CDN or script tags in the layout/index if npm packages are restricted.
// For this implementation, we will dynamically load the scripts.

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module'; // Firebase v9 uses modules usually, but compat libs are easier for CDN
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function FirebaseManager({ config }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!config) return;

    const initFirebase = async () => {
      try {
        // Load Firebase App and Messaging (compat versions for easier CDN usage without build steps)
        // Using compat libraries allows us to use window.firebase
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

        if (window.firebase && !window.firebase.apps.length) {
            try {
                const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
                window.firebase.initializeApp(parsedConfig);
                console.log('🔥 Firebase Initialized');
                
                const messaging = window.firebase.messaging();
                
                // Request Permission
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    // Try to get existing SW registration to avoid default SW 404
                    let registration;
                    try {
                         registration = await navigator.serviceWorker.ready;
                    } catch (e) {
                        console.warn('No active SW registration found', e);
                    }

                    const token = await messaging.getToken({
                        vapidKey: parsedConfig.vapidKey,
                        serviceWorkerRegistration: registration
                    });
                    
                    if (token) {
                        console.log('🔥 FCM Token:', token);
                        // Save token to user
                        await base44.auth.updateMe({
                            firebase_fcm_token: token
                        });
                    }
                }
                
                setIsInitialized(true);

                messaging.onMessage((payload) => {
                    console.log('🔥 Message received:', payload);
                    toast(payload.notification.title, {
                        description: payload.notification.body
                    });
                });
                
            } catch (e) {
                console.error('Error parsing firebase config or init:', e);
            }
        }
      } catch (error) {
        console.error('Failed to load Firebase SDK:', error);
      }
    };

    initFirebase();
  }, [config]);

  return null;
}