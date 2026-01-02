import { useEffect, useState, useRef } from 'react';
import userCache from './UserCache';
import { isAppMySite } from './hooks/useAppMySite';
import { base44 } from '@/api/base44Client';

export default function NotificationManager() {
  const [isInitialized, setIsInitialized] = useState(false);
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initAttemptedRef.current) {
      return;
    }
    initAttemptedRef.current = true;

    const initOneSignal = async () => {
      try {
        // Check if already initialized
        if (window.OneSignalInitialized) {
          console.log('✅ OneSignal already initialized');
          setIsInitialized(true);
          return;
        }

        // Fetch configuration
        let oneSignalAppId = '4a798c34-90cc-47d2-9c0f-bb350eafb514';
        try {
          const config = await base44.functions.invoke('getPublicConfig');
          if (config?.oneSignalAppId) {
            oneSignalAppId = config.oneSignalAppId;
          }
        } catch (e) {
          console.warn('Failed to fetch public config, using default App ID');
        }

        // Check if we're on the correct domain
        const currentHost = window.location.hostname;
        const currentPath = window.location.pathname;
        
        // Skip OneSignal in Base44 preview/editor mode
        const isBase44Preview = currentHost.includes('base44.com') && currentPath.includes('/preview');
        const isBase44Editor = currentHost.includes('base44.com') && currentPath.includes('/editor');
        
        if (isBase44Preview || isBase44Editor) {
          console.log('ℹ️ Skipping OneSignal in Base44 preview/editor mode');
          return;
        }
        
        const isProduction = currentHost === 'dobrylife.com' || currentHost === 'www.dobrylife.com' || currentHost === 'thedobrylife.com';
        const isDevelopment = currentHost === 'localhost';
        const isApp = isAppMySite();

        if (!isProduction && !isDevelopment && !isApp) {
          console.warn('⚠️ OneSignal disabled: Domain not whitelisted and not in AppMySite');
          return;
        }

        // OneSignal SDK v16 initialization
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        
        window.OneSignalDeferred.push(async function(OneSignal) {
          try {
            // Initialize OneSignal with proper settings
            await OneSignal.init({
              appId: oneSignalAppId,
              allowLocalhostAsSecureOrigin: isDevelopment,
              notifyButton: {
                enable: false,
              },
            });

            // Identify user for AppMySite / Cross-platform sync
            const user = await userCache.getUser();
            if (user?.id) {
              // Login with external ID (matches AppMySite native app)
              await OneSignal.login(user.id);
              // Also set email if available
              if (user.email) {
                 OneSignal.User.addEmail(user.email);
              }
            }

            window.OneSignalInitialized = true;
            console.log('✅ OneSignal initialized successfully');

            // Listen for subscription changes
            OneSignal.User.PushSubscription.addEventListener('change', async function(event) {
              console.log('🔔 Push subscription changed:', event);
              
              if (event.current.id && event.current.optedIn) {
                // Add significant delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                try {
                  const user = await userCache.getUser();
                  if (user && user.onesignal_player_id !== event.current.id) {
                    await userCache.updateUser({
                      onesignal_player_id: event.current.id
                    });
                    console.log('✅ Saved OneSignal player ID:', event.current.id);
                  }
                } catch (error) {
                  console.warn('Could not save player ID (will retry on next change):', error);
                }
              }
            });

            // Check current subscription state (with delay)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const isSubscribed = OneSignal.User.PushSubscription.optedIn;
            const playerId = OneSignal.User.PushSubscription.id;

            if (isSubscribed && playerId) {
              try {
                const user = await userCache.getUser();
                if (user && user.onesignal_player_id !== playerId) {
                  await userCache.updateUser({
                    onesignal_player_id: playerId
                  });
                  console.log('✅ Saved OneSignal player ID on init:', playerId);
                }
              } catch (error) {
                console.warn('Could not save player ID on init (non-critical):', error);
              }
            }

            setIsInitialized(true);
          } catch (error) {
            console.error('❌ Error in OneSignal setup:', error);
            
            if (error.message && error.message.includes('dobrylife.com')) {
              console.log('ℹ️ OneSignal is configured for production (dobrylife.com)');
              console.log('ℹ️ Current URL:', window.location.href);
              console.log('ℹ️ Push notifications will work when deployed to dobrylife.com');
            }
          }
        });

        // Load OneSignal SDK (only if not already loaded)
        if (!document.getElementById('onesignal-sdk')) {
          const script = document.createElement('script');
          script.id = 'onesignal-sdk';
          script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
          script.defer = true;
          document.head.appendChild(script);
        }

      } catch (error) {
        console.error('Error initializing OneSignal:', error);
      }
    };

    initOneSignal();
  }, []);

  return null;
}