import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Calendar,
  CheckCircle,
  Loader2,
  ExternalLink,
  Settings,
  Zap,
  Apple,
  Download,
  AlertCircle,
  Send,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import { sendOneSignalNotification } from '@/functions/sendOneSignalNotification';

export default function NotificationHub() {
  const queryClient = useQueryClient();
  const [testingSend, setTestingSend] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: googleIntegration } = useQuery({
    queryKey: ['googleIntegration', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const integrations = await base44.entities.PlatformIntegration.filter({
        created_by: user.email,
        platform_name: 'google'
      });
      return integrations[0] || null;
    },
    enabled: !!user
  });

  // Check push notification status
  useEffect(() => {
    const checkPushStatus = async () => {
      if (!('Notification' in window)) {
        setPushSupported(false);
        return;
      }

      if (Notification.permission === 'granted') {
        setPushEnabled(true);
      }

      // Check OneSignal status
      if (window.OneSignal) {
        try {
          const isSubscribed = await window.OneSignal.User?.PushSubscription?.optedIn;
          setPushEnabled(isSubscribed || false);
        } catch (e) {
          console.log('OneSignal check failed:', e);
        }
      }
    };

    checkPushStatus();
  }, []);

  const enablePushNotifications = async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Push notifications are not supported in this browser');
        return;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setPushEnabled(true);
        toast.success('🔔 Push notifications enabled!');

        // Try to opt-in via OneSignal
        if (window.OneSignal) {
          await window.OneSignal.User?.PushSubscription?.optIn();
        }
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Please enable in browser settings.');
      }
    } catch (error) {
      console.error('Push notification error:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const sendTestNotification = async () => {
    setTestingSend(true);
    try {
      // First try browser notification
      if (Notification.permission === 'granted') {
        new Notification('🎉 Helper33 Test', {
          body: 'Push notifications are working perfectly!',
          icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png',
          badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png'
        });
        toast.success('Test notification sent!');
      }

      // Also try OneSignal
      if (user?.onesignal_player_id) {
        await sendOneSignalNotification({
          title: '🎉 Helper33 Test Notification',
          message: 'Your notifications are set up correctly!'
        });
      }
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setTestingSend(false);
    }
  };

  const connectGoogleCalendar = () => {
    window.location.href = '/api/googleAuth';
  };

  const generateICSFile = (eventTitle, eventDate, eventDescription) => {
    const start = new Date(eventDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Helper33//Wellness App//EN
BEGIN:VEVENT
UID:${Date.now()}@helper33.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${eventTitle}
DESCRIPTION:${eventDescription}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  };

  const addToAppleCalendar = () => {
    const icsContent = generateICSFile(
      'Helper33 Wellness Reminder',
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      'Time for your daily wellness check-in with Helper33!'
    );

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'helper33-reminder.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('📅 Calendar file downloaded! Open it to add to Apple Calendar.');
  };

  const isGoogleConnected = googleIntegration?.is_connected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl"
        >
          <Bell className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Notification Center
        </h2>
        <p className="text-gray-600 mt-2">Stay connected with gentle reminders</p>
      </div>

      {/* Push Notifications Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={`border-2 transition-all ${
          pushEnabled 
            ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  pushEnabled 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-orange-500 to-amber-600'
                }`}>
                  {pushEnabled ? (
                    <Volume2 className="w-7 h-7 text-white" />
                  ) : (
                    <VolumeX className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Push Notifications
                    {pushEnabled ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-400 text-orange-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Get instant notifications on your device
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!pushSupported ? (
              <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <p className="text-sm text-red-700">
                  Push notifications are not supported in this browser. Try Chrome, Firefox, or Safari.
                </p>
              </div>
            ) : pushEnabled ? (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Notifications are active!</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    You'll receive reminders for tasks, wellness check-ins, and more.
                  </p>
                </div>

                <Button
                  onClick={sendTestNotification}
                  disabled={testingSend}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {testingSend ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Send Test Notification</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border-2 border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Why Enable?
                  </h4>
                  <ul className="space-y-2 text-sm text-orange-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Task reminders when you need them</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Wellness check-in nudges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Family updates and messages</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={enablePushNotifications}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-6"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Enable Push Notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Google Calendar Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={`border-2 transition-all ${
          isGoogleConnected 
            ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg text-3xl">
                  📅
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Google Calendar
                    {isGoogleConnected && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Sync tasks & get calendar reminders
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isGoogleConnected ? (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Calendar synced!</span>
                  </div>
                  {googleIntegration?.platform_email && (
                    <p className="text-xs text-gray-600 mt-1">
                      Connected as: {googleIntegration.platform_email}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => window.location.href = '/IntegrationsHub'}
                  variant="outline"
                  className="w-full border-2 border-blue-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Calendar Settings
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border-2 border-blue-200">
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Auto-sync Helper33 tasks to your calendar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Get Google Calendar reminders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>View events across all devices</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={connectGoogleCalendar}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-6"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Connect Google Calendar
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Apple Calendar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg">
                <Apple className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle>Apple Calendar</CardTitle>
                <CardDescription>
                  Add events to iPhone, iPad, or Mac
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Download .ics files for Apple Calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Works with iPhone, iPad, and Mac</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Includes reminder alerts</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={addToAppleCalendar}
              variant="outline"
              className="w-full border-2 border-gray-400 hover:bg-gray-100 py-6"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Sample Reminder (.ics)
            </Button>

            <p className="text-xs text-center text-gray-500">
              Tasks with due dates will have "Add to Calendar" buttons
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl border-2 border-purple-300"
      >
        <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-purple-700">
          <li>• Enable push notifications for instant reminders</li>
          <li>• Connect Google Calendar for automatic task syncing</li>
          <li>• Download .ics files for Apple devices</li>
          <li>• All reminder preferences can be customized in Settings</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}