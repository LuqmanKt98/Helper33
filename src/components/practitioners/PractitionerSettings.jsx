import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Settings, Bell, Calendar, Mail, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PractitionerSettings({ profile }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    auto_confirm_appointments: false,
    send_confirmation_emails: true,
    send_reminder_emails: true,
    reminder_hours_before: 24,
    auto_respond_inquiries: false,
    accept_new_clients: true,
    require_deposit: false,
    instant_booking_enabled: false
  });

  useEffect(() => {
    if (profile?.practitioner_settings) {
      setSettings({ ...settings, ...profile.practitioner_settings });
    }
  }, [profile]);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      await base44.entities.PractitionerProfile.update(profile.id, {
        practitioner_settings: newSettings
      });
      queryClient.invalidateQueries(['practitionerProfile']);
      toast.success('Settings updated! ⚙️');
    } catch (error) {
      toast.error('Failed to update settings');
      setSettings(settings);
    }
  };

  const automationOptions = [
    {
      key: 'send_confirmation_emails',
      icon: Mail,
      label: 'Automatic Confirmation Emails',
      description: 'Send confirmation emails when you approve appointments',
      color: 'from-green-500 to-emerald-500'
    },
    {
      key: 'send_reminder_emails',
      icon: Clock,
      label: 'Automatic Appointment Reminders',
      description: 'Send reminder emails 24 hours before appointments',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'accept_new_clients',
      icon: Calendar,
      label: 'Accept New Clients',
      description: 'Allow new clients to book appointments with you',
      color: 'from-purple-500 to-pink-500'
    },
    {
      key: 'instant_booking_enabled',
      icon: Zap,
      label: 'Instant Booking (Coming Soon)',
      description: 'Let clients book available slots without approval',
      color: 'from-amber-500 to-orange-500',
      disabled: true
    }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Automation & Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-700">
            <strong>💡 Tip:</strong> Enable automation to save time and provide a better experience for your clients. 
            Helper33 will handle notifications automatically.
          </p>
        </div>

        {automationOptions.map((option, idx) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 ${
                option.disabled ? 'opacity-60' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-800">{option.label}</h4>
                  <Switch
                    checked={settings[option.key]}
                    onCheckedChange={() => handleToggle(option.key)}
                    disabled={option.disabled}
                  />
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </motion.div>
          );
        })}

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">How Automation Works:</p>
              <ul className="space-y-1 text-xs">
                <li>• When you confirm an appointment, clients receive instant confirmation</li>
                <li>• 24 hours before appointments, automatic reminders are sent</li>
                <li>• New inquiries are tracked in your chat messages</li>
                <li>• All notifications respect client preferences (email/SMS)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}