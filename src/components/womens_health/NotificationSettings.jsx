import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Heart, Baby, Calendar, Moon, CheckCircle2, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function NotificationSettings({ onClose }) {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  const [settings, setSettings] = useState(
    user?.womens_health_notifications || {
      enabled: true,
      weekly_pregnancy_tips: true,
      weekly_pregnancy_day: 'monday',
      weekly_pregnancy_time: '09:00',
      baby_development_alerts: true,
      milestone_celebrations: true,
      appointment_reminders: true,
      appointment_reminder_hours: 24,
      postpartum_checkup_reminders: true,
      cycle_predictions: true,
      fertile_window_alerts: false,
      period_reminders: true,
      symptom_logging_reminders: false,
      delivery_method: ['push'],
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00'
    }
  );

  const saveMutation = useMutation({
    mutationFn: async (newSettings) => {
      if (!authUser) return;
      const { data, error } = await supabase
        .from('profiles')
        .update({ womens_health_notifications: newSettings })
        .eq('id', authUser.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('✅ Notification preferences saved!');
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  const handleToggle = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const toggleDeliveryMethod = (method) => {
    setSettings(prev => {
      const current = prev.delivery_method || [];
      const updated = current.includes(method)
        ? current.filter(m => m !== method)
        : [...current, method];
      return { ...prev, delivery_method: updated };
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Customize when and how you receive Women's Health updates</p>
      </div>

      {/* Master Switch */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Bell className="w-6 h-6 text-purple-600" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <Label className="text-lg font-bold text-gray-900">
                  Women's Health Notifications
                </Label>
                <p className="text-sm text-gray-600">
                  {settings.enabled ? 'All notifications enabled' : 'All notifications paused'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(val) => handleToggle('enabled', val)}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pregnancy Notifications */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-blue-600" />
            Pregnancy & Baby Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Weekly Pregnancy Tips</Label>
              <p className="text-sm text-gray-600">Personalized tips based on your pregnancy week</p>
            </div>
            <Switch
              checked={settings.weekly_pregnancy_tips}
              onCheckedChange={(val) => handleToggle('weekly_pregnancy_tips', val)}
              disabled={!settings.enabled}
            />
          </div>

          {settings.weekly_pregnancy_tips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid md:grid-cols-2 gap-4 ml-4 p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Day of Week</Label>
                <Select
                  value={settings.weekly_pregnancy_day}
                  onValueChange={(val) => handleToggle('weekly_pregnancy_day', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Time</Label>
                <Select
                  value={settings.weekly_pregnancy_time}
                  onValueChange={(val) => handleToggle('weekly_pregnancy_time', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Baby Development Alerts</Label>
              <p className="text-sm text-gray-600">Updates on baby's growth milestones</p>
            </div>
            <Switch
              checked={settings.baby_development_alerts}
              onCheckedChange={(val) => handleToggle('baby_development_alerts', val)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Milestone Celebrations</Label>
              <p className="text-sm text-gray-600">Special alerts for big moments (heartbeat, movement, etc.)</p>
            </div>
            <Switch
              checked={settings.milestone_celebrations}
              onCheckedChange={(val) => handleToggle('milestone_celebrations', val)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointments & Check-ups */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600" />
            Appointments & Check-ups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Appointment Reminders</Label>
              <p className="text-sm text-gray-600">Reminders for prenatal appointments</p>
            </div>
            <Switch
              checked={settings.appointment_reminders}
              onCheckedChange={(val) => handleToggle('appointment_reminders', val)}
              disabled={!settings.enabled}
            />
          </div>

          {settings.appointment_reminders && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="ml-4 p-4 bg-gray-50 rounded-lg"
            >
              <Label className="text-sm text-gray-700 mb-2 block">Remind me before appointment:</Label>
              <Select
                value={settings.appointment_reminder_hours?.toString()}
                onValueChange={(val) => handleToggle('appointment_reminder_hours', parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour before</SelectItem>
                  <SelectItem value="2">2 hours before</SelectItem>
                  <SelectItem value="6">6 hours before</SelectItem>
                  <SelectItem value="24">24 hours before</SelectItem>
                  <SelectItem value="48">2 days before</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}

          <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Postpartum Check-up Reminders</Label>
              <p className="text-sm text-gray-600">6-week check-up and other postpartum appointments</p>
            </div>
            <Switch
              checked={settings.postpartum_checkup_reminders}
              onCheckedChange={(val) => handleToggle('postpartum_checkup_reminders', val)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cycle Tracking Notifications */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Cycle Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Period Predictions</Label>
              <p className="text-sm text-gray-600">Alerts when your period is expected</p>
            </div>
            <Switch
              checked={settings.period_reminders}
              onCheckedChange={(val) => handleToggle('period_reminders', val)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Fertile Window Alerts</Label>
              <p className="text-sm text-gray-600">Notifications during ovulation window</p>
            </div>
            <Switch
              checked={settings.fertile_window_alerts}
              onCheckedChange={(val) => handleToggle('fertile_window_alerts', val)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Cycle Predictions</Label>
              <p className="text-sm text-gray-600">AI-powered cycle insights and predictions</p>
            </div>
            <Switch
              checked={settings.cycle_predictions}
              onCheckedChange={(val) => handleToggle('cycle_predictions', val)}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Daily Symptom Logging Reminders</Label>
              <p className="text-sm text-gray-600">Gentle reminders to log symptoms</p>
            </div>
            <Switch
              checked={settings.symptom_logging_reminders}
              onCheckedChange={(val) => handleToggle('symptom_logging_reminders', val)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle>How to Receive Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onClick={() => toggleDeliveryMethod('push')}
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${settings.delivery_method?.includes('push')
                ? 'bg-purple-100 border-2 border-purple-400'
                : 'bg-gray-50 border-2 border-gray-200'
              }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone className={`w-5 h-5 ${settings.delivery_method?.includes('push') ? 'text-purple-600' : 'text-gray-400'}`} />
              <div>
                <Label className="font-semibold">Push Notifications</Label>
                <p className="text-xs text-gray-600">In-app alerts</p>
              </div>
            </div>
            {settings.delivery_method?.includes('push') && (
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            )}
          </div>

          <div
            onClick={() => toggleDeliveryMethod('sms')}
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${settings.delivery_method?.includes('sms')
                ? 'bg-blue-100 border-2 border-blue-400'
                : 'bg-gray-50 border-2 border-gray-200'
              }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className={`w-5 h-5 ${settings.delivery_method?.includes('sms') ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <Label className="font-semibold">SMS Text Messages</Label>
                <p className="text-xs text-gray-600">Requires phone number in profile</p>
              </div>
            </div>
            {settings.delivery_method?.includes('sms') && (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <div
            onClick={() => toggleDeliveryMethod('email')}
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${settings.delivery_method?.includes('email')
                ? 'bg-pink-100 border-2 border-pink-400'
                : 'bg-gray-50 border-2 border-gray-200'
              }`}
          >
            <div className="flex items-center gap-3">
              <Mail className={`w-5 h-5 ${settings.delivery_method?.includes('email') ? 'text-pink-600' : 'text-gray-400'}`} />
              <div>
                <Label className="font-semibold">Email</Label>
                <p className="text-xs text-gray-600">Weekly summaries and updates</p>
              </div>
            </div>
            {settings.delivery_method?.includes('email') && (
              <CheckCircle2 className="w-5 h-5 text-pink-600" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
            <div className="flex-1">
              <Label className="font-semibold text-gray-900">Enable Quiet Hours</Label>
              <p className="text-sm text-gray-600">Pause notifications during sleep hours</p>
            </div>
            <Switch
              checked={settings.quiet_hours_enabled}
              onCheckedChange={(val) => handleToggle('quiet_hours_enabled', val)}
              disabled={!settings.enabled}
            />
          </div>

          {settings.quiet_hours_enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid md:grid-cols-2 gap-4 ml-4 p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Start Time</Label>
                <Select
                  value={settings.quiet_hours_start}
                  onValueChange={(val) => handleToggle('quiet_hours_start', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">End Time</Label>
                <Select
                  value={settings.quiet_hours_end}
                  onValueChange={(val) => handleToggle('quiet_hours_end', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3 justify-end">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}