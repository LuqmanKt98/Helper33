
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Info,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkbtas6ssbtKLispob5Rh8ZlsgyJHimBDSTdhmYTckIXO3-8YGE3x3qYQhN5wvdMCyWkZI5Qkc';

export default function PushNotificationManager({ onStatusChange }) {
  const [pushState, setPushState] = useState('checking'); // checking, setup, pending, blocked, active
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const checkPushSupport = () => {
    // Check if we're in preview/development environment
    const isPreviewEnv = window.location.hostname.includes('preview--') || 
                         window.location.hostname.includes('localhost') ||
                         window.location.hostname.includes('127.0.0.1');
    
    if (isPreviewEnv) {
      return { supported: false, reason: 'Push notifications are not available in preview environments. They will work in production.' };
    }

    if (!('serviceWorker' in navigator)) {
      return { supported: false, reason: 'Service Workers not supported' };
    }
    if (!('PushManager' in window)) {
      return { supported: false, reason: 'Push API not supported' };
    }
    if (!('Notification' in window)) {
      return { supported: false, reason: 'Notifications not supported' };
    }
    return { supported: true };
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const checkCurrentStatus = async () => {
    try {
      const support = checkPushSupport();
      if (!support.supported) {
        setPushState('unsupported');
        setErrorDetails(support.reason);
        onStatusChange?.('unsupported');
        return;
      }

      const permission = Notification.permission;
      
      if (permission === 'denied') {
        setPushState('blocked');
        onStatusChange?.('blocked');
        return;
      }

      // Check if service worker is registered
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        setPushState('setup');
        onStatusChange?.('setup');
        return;
      }

      // Check if we have an active subscription
      const currentSub = await registration.pushManager.getSubscription();
      
      if (!currentSub) {
        setPushState(permission === 'granted' ? 'setup' : 'setup');
        onStatusChange?.(permission === 'granted' ? 'setup' : 'setup');
        return;
      }

      setSubscription(currentSub);
      setPushState('active');
      onStatusChange?.('active');

    } catch (error) {
      console.error('Error checking push status:', error);
      setPushState('setup');
      onStatusChange?.('setup');
    }
  };

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('Service Worker registered:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw new Error('Failed to register service worker');
    }
  };

  const subscribeToPush = async (registration) => {
    try {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  };

  const saveSubscriptionToServer = async (subscription) => {
    try {
      const subscriptionData = subscription.toJSON();
      
      await base44.entities.PushSubscription.create({
        subscription_endpoint: subscription.endpoint,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
        platform: getBrowserName(),
        user_agent: navigator.userAgent,
        device_name: `${getBrowserName()} on ${navigator.platform}`,
        is_active: true
      });

      console.log('Subscription saved to server');
    } catch (error) {
      console.error('Failed to save subscription:', error);
      throw new Error('Failed to save subscription to server');
    }
  };

  const handleEnablePush = async () => {
    setIsProcessing(true);
    setErrorDetails(null);

    try {
      // Check support
      const support = checkPushSupport();
      if (!support.supported) {
        throw new Error(support.reason);
      }

      // Request notification permission
      setPushState('pending');
      const permission = await Notification.requestPermission();
      
      if (permission === 'denied') {
        setPushState('blocked');
        toast.error('Push notifications blocked', {
          description: 'Please enable notifications in your browser settings'
        });
        return;
      }

      if (permission === 'default') {
        setPushState('setup');
        toast.info('Permission not granted', {
          description: 'You can try again when ready'
        });
        return;
      }

      // Permission granted - proceed with registration
      toast.loading('Setting up push notifications...', { id: 'push-setup' });

      // Register service worker
      const registration = await registerServiceWorker();

      // Subscribe to push
      const subscription = await subscribeToPush(registration);
      setSubscription(subscription);

      // Save to server
      await saveSubscriptionToServer(subscription);

      // Update user preferences
      await base44.auth.updateMe({
        notification_preferences: {
          push_enabled: true,
          last_push_setup_at: new Date().toISOString()
        }
      });

      setPushState('active');
      onStatusChange?.('active');
      
      toast.success('Push notifications enabled!', {
        id: 'push-setup',
        description: 'You\'ll now receive push notifications'
      });

    } catch (error) {
      console.error('Enable push error:', error);
      setErrorDetails(error.message);
      setPushState('setup');
      toast.error('Failed to enable push', {
        id: 'push-setup',
        description: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestPush = async () => {
    setIsTesting(true);
    try {
      const { data } = await base44.functions.invoke('testPushNotification');
      
      if (data?.success) {
        toast.success('Test push sent!', {
          description: 'Check your device for the notification'
        });
      } else {
        throw new Error(data?.error || 'Failed to send test push');
      }
    } catch (error) {
      console.error('Test push error:', error);
      toast.error('Could not send test push', {
        description: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisablePush = async () => {
    setIsProcessing(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Mark subscriptions as inactive
      const subs = await base44.entities.PushSubscription.filter({ is_active: true });
      for (const sub of subs) {
        await base44.entities.PushSubscription.update(sub.id, { is_active: false });
      }

      await base44.auth.updateMe({
        notification_preferences: {
          push_enabled: false
        }
      });

      setSubscription(null);
      setPushState('setup');
      onStatusChange?.('setup');
      
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Disable push error:', error);
      toast.error('Failed to disable push');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStateDisplay = () => {
    switch (pushState) {
      case 'checking':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-gray-500" />,
          badge: <Badge variant="outline">Checking...</Badge>,
          action: null
        };
      
      case 'unsupported':
        return {
          icon: <XCircle className="w-5 h-5 text-gray-400" />,
          badge: <Badge variant="outline" className="border-gray-300 text-gray-600">Not Supported</Badge>,
          action: null
        };
      
      case 'setup':
        return {
          icon: <Bell className="w-5 h-5 text-gray-400" />,
          badge: <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">Setup Required</Badge>,
          action: (
            <Button
              onClick={handleEnablePush}
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Push Notifications
                </>
              )}
            </Button>
          )
        };
      
      case 'pending':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-blue-500" />,
          badge: <Badge className="bg-blue-100 text-blue-700 border-blue-300">Waiting for Permission</Badge>,
          action: (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Check your browser for the permission prompt...
            </div>
          )
        };
      
      case 'blocked':
        return {
          icon: <BellOff className="w-5 h-5 text-red-500" />,
          badge: <Badge className="bg-red-100 text-red-700 border-red-300">Blocked</Badge>,
          action: (
            <Button
              onClick={() => setShowHelpModal(true)}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              How to Enable
            </Button>
          )
        };
      
      case 'active':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          badge: <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>,
          action: (
            <div className="flex gap-2">
              <Button
                onClick={handleTestPush}
                disabled={isTesting}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Push
                  </>
                )}
              </Button>
              <Button
                onClick={handleDisablePush}
                disabled={isProcessing}
                variant="outline"
                className="border-gray-300"
              >
                Disable
              </Button>
            </div>
          )
        };
      
      default:
        return {
          icon: <Bell className="w-5 h-5 text-gray-400" />,
          badge: <Badge variant="outline">Unknown</Badge>,
          action: null
        };
    }
  };

  const display = getStateDisplay();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {display.icon}
            <div>
              <p className="font-semibold text-gray-900 text-lg">Push Notifications</p>
              <p className="text-sm text-gray-600">Browser push notifications</p>
            </div>
          </div>
          {display.badge}
        </div>

        {pushState === 'unsupported' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <Info className="w-4 h-4 inline mr-1" />
              {errorDetails || 'Push notifications require a production domain to function properly'}
            </p>
          </div>
        )}

        {errorDetails && pushState !== 'unsupported' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {errorDetails}
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
          <Info className="w-4 h-4 inline mr-1" />
          Push works only on this site. Make sure you're on <strong>{window.location.hostname}</strong>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {display.action}
          {pushState !== 'checking' && (
            <Button
              onClick={checkCurrentStatus}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
        </div>
      </motion.div>

      {/* Help Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Push blocked — how to re-enable</DialogTitle>
            <DialogDescription>
              You previously blocked notifications for this site. Follow the steps below for your browser:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Chrome / Edge</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Click the lock icon in the address bar</li>
                <li>Find "Notifications" and change to "Allow"</li>
                <li>Reload this page and try enabling push again</li>
              </ol>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Firefox</h4>
              <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                <li>Click the lock icon in the address bar</li>
                <li>Click "Clear permissions and cookies"</li>
                <li>Reload and try enabling push again</li>
              </ol>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Safari</h4>
              <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                <li>Open Safari Preferences</li>
                <li>Go to Websites → Notifications</li>
                <li>Find this site and select "Allow"</li>
                <li>Reload and try enabling push again</li>
              </ol>
            </div>
          </div>

          <Button onClick={() => setShowHelpModal(false)} className="mt-4 w-full">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
