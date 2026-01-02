import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, Save, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import PushNotificationManager from '@/components/push/PushNotificationManager';

export default function NotificationSettings() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    new_messages: true,
    friend_requests: true,
    event_reminders: true,
    task_reminders: true,
    mentions: true,
    comments: true,
    system_updates: true,
    achievements: true,
    marketing_emails: false,
    fallback_enabled: true
  });

  const [pushStatus, setPushStatus] = useState('setup');

  useEffect(() => {
    if (user?.notification_preferences) {
      setPreferences({ ...preferences, ...user.notification_preferences });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async (newPreferences) => {
      await base44.auth.updateMe({
        notification_preferences: newPreferences
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Notification preferences saved!');
    }
  });

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  const notificationTypes = [
    { key: 'new_messages', label: 'New Messages', description: 'Get notified when someone sends you a message', icon: '💬' },
    { key: 'friend_requests', label: 'Friend Requests', description: 'Connection and friend requests', icon: '👥' },
    { key: 'event_reminders', label: 'Event Reminders', description: 'Reminders for upcoming events', icon: '📅' },
    { key: 'task_reminders', label: 'Task Reminders', description: 'Reminders for your tasks and to-dos', icon: '✅' },
    { key: 'mentions', label: 'Mentions', description: 'When someone mentions you', icon: '@' },
    { key: 'comments', label: 'Comments & Reactions', description: 'Comments and reactions on your posts', icon: '💬' },
    { key: 'system_updates', label: 'System Updates', description: 'Important platform updates and announcements', icon: '🔔' },
    { key: 'achievements', label: 'Achievements & Badges', description: 'When you unlock achievements or badges', icon: '🏆' },
    { key: 'marketing_emails', label: 'Marketing Emails', description: 'Tips, features, and promotional content', icon: '📧' }
  ];

  return (
    <>
      <SEO 
        title="Notification Settings - Helper33"
        description="Manage your notification preferences"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
                <p className="text-gray-600">Manage how you receive notifications</p>
              </div>
            </div>
          </motion.div>

          {/* Notification Channels */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">Email Notifications</p>
                      <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.email_notifications}
                  onCheckedChange={() => handleToggle('email_notifications')}
                />
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">SMS Notifications</p>
                      <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.sms_notifications}
                  onCheckedChange={() => handleToggle('sms_notifications')}
                />
              </div>

              {/* Push - New Manager Component */}
              <PushNotificationManager onStatusChange={setPushStatus} />

              {/* Fallback Option */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-900">Enable Fallback</p>
                    <p className="text-sm text-amber-700">
                      If push fails, send via SMS or Email instead
                    </p>
                  </div>
                  <Switch
                    checked={preferences.fallback_enabled}
                    onCheckedChange={() => handleToggle('fallback_enabled')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificationTypes.map((type, index) => (
                <motion.div
                  key={type.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences[type.key]}
                    onCheckedChange={() => handleToggle(type.key)}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-end"
          >
            <Button
              onClick={handleSave}
              disabled={saveMutation.isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              size="lg"
            >
              {saveMutation.isLoading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}