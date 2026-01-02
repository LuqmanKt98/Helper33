import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Calendar, Star, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationPreferences({ user }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    communication_method: 'email',
    email_notifications: true,
    sms_notifications: false,
    email_appointment_confirmed: true,
    email_appointment_reminder: true,
    email_new_message: true,
    email_review_response: true
  });

  useEffect(() => {
    if (user?.notification_preferences) {
      setPreferences({ ...preferences, ...user.notification_preferences });
    }
  }, [user]);

  const handleToggle = async (key) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);

    try {
      await base44.auth.updateMe({
        notification_preferences: newPreferences
      });
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Preferences updated! 🔔');
    } catch (error) {
      toast.error('Failed to update preferences');
      setPreferences(preferences);
    }
  };

  const handleCommunicationMethodChange = async (method) => {
    const newPreferences = {
      ...preferences,
      communication_method: method,
      email_notifications: method === 'email' || method === 'both',
      sms_notifications: method === 'sms' || method === 'both'
    };
    setPreferences(newPreferences);

    try {
      await base44.auth.updateMe({
        notification_preferences: newPreferences
      });
      queryClient.invalidateQueries(['currentUser']);
      toast.success('Communication method updated! 📱');
    } catch (error) {
      toast.error('Failed to update preferences');
      setPreferences(preferences);
    }
  };

  const notificationOptions = [
    {
      key: 'email_appointment_confirmed',
      icon: Calendar,
      label: 'Appointment Confirmations',
      description: 'Get notified when a practitioner confirms your appointment',
      color: 'from-green-500 to-emerald-500'
    },
    {
      key: 'email_appointment_reminder',
      icon: Calendar,
      label: 'Appointment Reminders',
      description: 'Receive reminders 24 hours before your appointments',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'email_new_message',
      icon: MessageSquare,
      label: 'New Messages',
      description: 'Get notified of new scheduling messages from practitioners',
      color: 'from-purple-500 to-pink-500'
    },
    {
      key: 'email_review_response',
      icon: Star,
      label: 'Review Responses',
      description: 'Get notified when practitioners respond to your reviews',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            Communication Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCommunicationMethodChange('email')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              preferences.communication_method === 'email'
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md'
                : 'border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                preferences.communication_method === 'email' ? 'bg-purple-500' : 'bg-purple-200'
              }`}>
                <Mail className={`w-5 h-5 ${preferences.communication_method === 'email' ? 'text-white' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Email Only</p>
                <p className="text-xs text-gray-600">Receive notifications via email</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCommunicationMethodChange('sms')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              preferences.communication_method === 'sms'
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md'
                : 'border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                preferences.communication_method === 'sms' ? 'bg-blue-500' : 'bg-blue-200'
              }`}>
                <MessageSquare className={`w-5 h-5 ${preferences.communication_method === 'sms' ? 'text-white' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">SMS/Text Only</p>
                <p className="text-xs text-gray-600">Receive notifications via text message</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCommunicationMethodChange('both')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              preferences.communication_method === 'both'
                ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md'
                : 'border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                preferences.communication_method === 'both' ? 'bg-green-500' : 'bg-green-200'
              }`}>
                <Bell className={`w-5 h-5 ${preferences.communication_method === 'both' ? 'text-white' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Both Email & SMS</p>
                <p className="text-xs text-gray-600">Receive notifications via both channels</p>
              </div>
            </div>
          </motion.button>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationOptions.map((option, idx) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-800">{option.label}</h4>
                    <Switch
                      checked={preferences[option.key]}
                      onCheckedChange={() => handleToggle(option.key)}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </motion.div>
            );
          })}

          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> In-app notifications are always enabled. These settings control {
                preferences.communication_method === 'email' ? 'email notifications only' :
                preferences.communication_method === 'sms' ? 'SMS notifications only' :
                'both email and SMS notifications'
              }.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}