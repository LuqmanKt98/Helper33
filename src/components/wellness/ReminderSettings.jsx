import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Droplet,
  Brain,
  Moon,
  Sun,
  Activity,
  Bell,
  Clock,
  Sparkles,
  Heart,
  Eye,
  Timer,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const REMINDER_TYPES = [
  {
    key: 'water',
    label: 'Water Intake',
    icon: Droplet,
    description: 'Stay hydrated throughout the day',
    defaultInterval: 60,
    gradient: 'from-blue-400 to-cyan-500',
    messages: [
      "Time for a refreshing glass of water! 💧",
      "Your body needs hydration - drink some water! 🌊",
      "Stay healthy - have a glass of water now! 💙"
    ]
  },
  {
    key: 'breaks',
    label: 'Movement Breaks',
    icon: Activity,
    description: 'Short breaks to stretch and move',
    defaultInterval: 90,
    gradient: 'from-green-400 to-emerald-500',
    messages: [
      "Time to stretch! Stand up and move for 2 minutes 🧘",
      "Take a quick movement break - your body will thank you! 💪",
      "Stretch time! Move around and refresh yourself 🌿"
    ]
  },
  {
    key: 'mindfulness',
    label: 'Mindfulness Moments',
    icon: Brain,
    description: 'Gentle reminders for breathing exercises',
    defaultInterval: 120,
    gradient: 'from-purple-400 to-pink-500',
    messages: [
      "Take 3 deep breaths and center yourself 🧘‍♀️",
      "Mindful moment: Notice your breath for 30 seconds 🌸",
      "Pause and breathe - you deserve this moment 💜"
    ]
  },
  {
    key: 'eye_rest',
    label: 'Screen Break',
    icon: Eye,
    description: 'Rest your eyes from screens',
    defaultInterval: 45,
    gradient: 'from-amber-400 to-orange-500',
    messages: [
      "Look away from the screen - focus on something 20 feet away for 20 seconds 👀",
      "Eye rest time! Give your eyes a break 🌅",
      "Screen break: Look out the window for a moment 🪟"
    ]
  },
  {
    key: 'posture',
    label: 'Posture Check',
    icon: Activity,
    description: 'Reminder to adjust your posture',
    defaultInterval: 60,
    gradient: 'from-indigo-400 to-blue-500',
    messages: [
      "Posture check! Sit up straight and roll your shoulders back 💪",
      "How's your posture? Adjust and feel better! 🧍",
      "Straighten up - your spine will thank you! ✨"
    ]
  },
  {
    key: 'gratitude',
    label: 'Gratitude Moment',
    icon: Heart,
    description: 'Pause to appreciate something',
    defaultInterval: 180,
    gradient: 'from-rose-400 to-pink-500',
    messages: [
      "What's one thing you're grateful for right now? 💖",
      "Take a moment to appreciate something beautiful today 🌸",
      "Gratitude moment: Notice something good in your life 🙏"
    ]
  },
  {
    key: 'bedtime',
    label: 'Bedtime Wind-down',
    icon: Moon,
    description: 'Reminder to start winding down for sleep',
    defaultInterval: null,
    usesTime: true,
    gradient: 'from-indigo-500 to-purple-600',
    messages: [
      "Time to start winding down for better sleep 🌙",
      "Begin your bedtime routine for restful sleep 😴",
      "Wind-down time - prepare for a peaceful night 💤"
    ]
  },
  {
    key: 'morning',
    label: 'Morning Check-in',
    icon: Sun,
    description: 'Start your day with intention',
    defaultInterval: null,
    usesTime: true,
    gradient: 'from-yellow-400 to-orange-500',
    messages: [
      "Good morning! How are you feeling today? ☀️",
      "Rise and shine! Take a moment to set your intention 🌅",
      "Morning check-in: What's your focus for today? ✨"
    ]
  }
];

export default function ReminderSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [reminderSettings, setReminderSettings] = useState({});

  useEffect(() => {
    if (user?.wellness_reminder_settings) {
      setReminderSettings(user.wellness_reminder_settings);
    } else {
      // Initialize with defaults based on user goals
      const userGoals = user?.life_goals || [];
      const defaults = {};
      
      REMINDER_TYPES.forEach(reminder => {
        const shouldEnable = 
          (reminder.key === 'water' && userGoals.includes('wellness')) ||
          (reminder.key === 'mindfulness' && (userGoals.includes('wellness') || userGoals.includes('grief'))) ||
          (reminder.key === 'breaks' && userGoals.includes('wellness')) ||
          (reminder.key === 'gratitude' && (userGoals.includes('journaling') || userGoals.includes('grief')));

        defaults[reminder.key] = {
          enabled: shouldEnable,
          interval: reminder.defaultInterval,
          time: reminder.usesTime ? (reminder.key === 'bedtime' ? '22:00' : '07:00') : null,
          sound_enabled: true,
          push_enabled: true
        };
      });

      setReminderSettings(defaults);
    }
  }, [user]);

  const updateReminder = (key, updates) => {
    setReminderSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        wellness_reminder_settings: reminderSettings
      });

      await queryClient.invalidateQueries(['user']);
      toast.success('Reminder settings saved! 🎉');
    } catch (error) {
      console.error('Error saving reminders:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const enabledCount = Object.values(reminderSettings).filter(r => r?.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            Wellness Reminders
          </h2>
          <p className="text-gray-600 mt-1">
            Personalized nudges to support your wellbeing
          </p>
        </div>
        
        <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0">
          {enabledCount} active
        </Badge>
      </div>

      {/* Quick Stats */}
      {user?.life_goals?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
        >
          <p className="text-sm text-purple-900">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Based on your goals: <strong>{user.life_goals.join(', ')}</strong>
          </p>
        </motion.div>
      )}

      {/* Reminder Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {REMINDER_TYPES.map((reminder, idx) => {
          const settings = reminderSettings[reminder.key] || {};
          const isEnabled = settings.enabled || false;

          return (
            <motion.div
              key={reminder.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`transition-all ${
                isEnabled 
                  ? 'border-2 border-purple-300 shadow-md' 
                  : 'border border-gray-200'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${reminder.gradient} text-white shadow-md`}>
                        <reminder.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{reminder.label}</CardTitle>
                        <CardDescription className="text-xs">
                          {reminder.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => updateReminder(reminder.key, { enabled: checked })}
                    />
                  </div>
                </CardHeader>

                {isEnabled && (
                  <CardContent className="space-y-4">
                    {/* Interval/Time Settings */}
                    {reminder.usesTime ? (
                      <div>
                        <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time
                        </Label>
                        <Input
                          type="time"
                          value={settings.time || ''}
                          onChange={(e) => updateReminder(reminder.key, { time: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Every {settings.interval || reminder.defaultInterval} minutes
                        </Label>
                        <Slider
                          value={[settings.interval || reminder.defaultInterval]}
                          onValueChange={([value]) => updateReminder(reminder.key, { interval: value })}
                          min={15}
                          max={240}
                          step={15}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>15 min</span>
                          <span>4 hours</span>
                        </div>
                      </div>
                    )}

                    {/* Notification Options */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Push Notifications</span>
                      </div>
                      <Switch
                        checked={settings.push_enabled !== false}
                        onCheckedChange={(checked) => updateReminder(reminder.key, { push_enabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">In-App Alerts</span>
                      </div>
                      <Switch
                        checked={settings.sound_enabled !== false}
                        onCheckedChange={(checked) => updateReminder(reminder.key, { sound_enabled: checked })}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quiet Hours */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-purple-600" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause reminders during your rest time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Quiet Hours</Label>
            <Switch
              checked={reminderSettings.quiet_hours?.enabled || false}
              onCheckedChange={(checked) => 
                setReminderSettings(prev => ({
                  ...prev,
                  quiet_hours: { ...prev.quiet_hours, enabled: checked }
                }))
              }
            />
          </div>

          {reminderSettings.quiet_hours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Start Time</Label>
                <Input
                  type="time"
                  value={reminderSettings.quiet_hours?.start || '22:00'}
                  onChange={(e) => 
                    setReminderSettings(prev => ({
                      ...prev,
                      quiet_hours: { ...prev.quiet_hours, start: e.target.value }
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">End Time</Label>
                <Input
                  type="time"
                  value={reminderSettings.quiet_hours?.end || '07:00'}
                  onChange={(e) => 
                    setReminderSettings(prev => ({
                      ...prev,
                      quiet_hours: { ...prev.quiet_hours, end: e.target.value }
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Smart Reminders</p>
              <p>
                Your reminders are personalized based on your goals and activity patterns. 
                We'll only send reminders when you're active in the app.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}