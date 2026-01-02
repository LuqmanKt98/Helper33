import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Palette,
  Bell,
  Sparkles,
  Quote,
  ToyBrick,
  Info,
  Zap,
  Mail,
  Save,
  CheckCircle2,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

export default function AppSettingsManager() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [settings, setSettings] = useState({
    gamification_enabled: true,
    theme: 'default',
    notification_preference: 'all',
    animation_level: 'full',
    sound_enabled: true,
    quote_preference: 'general',
    kids_features_enabled: true,
    kids_mode_active: false,
    encouragement_tone: 'calm',
    automation_enabled: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user?.app_settings) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...user.app_settings
      }));
      if (user.app_settings.theme) {
        applyTheme(user.app_settings.theme);
      }
      if (user.app_settings.animation_level === 'none') {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      await base44.auth.updateMe({ app_settings: newSettings });
      return newSettings;
    },
    onSuccess: (newSettings) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setHasChanges(false);
      toast.success('Settings saved successfully!', {
        description: 'Your preferences have been updated.',
      });

      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }

      if (newSettings.animation_level === 'none') {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      toast.error('Failed to save settings', {
        description: 'Please try again.',
      });
    }
  });

  const applyTheme = (theme) => {
    const body = document.body;
    body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        body.classList.remove(className);
      }
    });
    body.classList.add(`theme-${theme}`);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleResetToOriginal = () => {
    if (window.confirm('Reset to the original Therapeutic Teal theme? You can always change it again later.')) {
      handleSettingChange('theme', 'default');
    }
  };

  const handleKidsModeToggle = (enabled) => {
    if (enabled) {
      if (window.confirm('Enable Kids Mode? This will restrict the app to kid-friendly content only.')) {
        handleSettingChange('kids_mode_active', true);
      }
    } else {
      handleSettingChange('kids_mode_active', false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const themeOptions = [
    {
      id: 'default',
      name: 'Therapeutic Teal',
      gradient: 'from-teal-400 via-cyan-500 to-blue-500',
      description: 'Calming ocean waves - Balance & clarity',
      color: 'teal',
      isOriginal: true
    },
    {
      id: 'serene_blue',
      name: 'Serene Blue',
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      description: 'Peaceful sky - Tranquility & trust',
      color: 'blue',
      isOriginal: true
    },
    {
      id: 'warm_sunset',
      name: 'Warm Sunset',
      gradient: 'from-orange-400 via-pink-500 to-purple-500',
      description: 'Golden hour - Warmth & comfort',
      color: 'orange',
      isOriginal: true
    },
    {
      id: 'forest_green',
      name: 'Forest Green',
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      description: 'Nature embrace - Growth & renewal',
      color: 'green',
      isOriginal: true
    },
    {
      id: 'rose_garden',
      name: 'Rose Garden',
      gradient: 'from-pink-400 via-rose-500 to-red-400',
      description: 'Gentle blooms - Love & compassion',
      color: 'pink',
      isOriginal: true
    },
    {
      id: 'lavender_mist',
      name: 'Lavender Mist',
      gradient: 'from-purple-400 via-violet-500 to-indigo-500',
      description: 'Dreamy fields - Peace & relaxation',
      color: 'purple',
      isOriginal: true
    },
    {
      id: 'soft_coral',
      name: 'Soft Coral',
      gradient: 'from-red-300 via-pink-400 to-orange-400',
      description: 'Ocean depths - Gentle & nurturing',
      color: 'red',
      isOriginal: true
    },
    {
      id: 'misty_morning',
      name: 'Misty Morning',
      gradient: 'from-slate-300 via-gray-400 to-blue-300',
      description: 'Soft fog - Gentle & contemplative',
      color: 'slate',
      isOriginal: true
    },
    {
      id: 'honey_glow',
      name: 'Honey Glow',
      gradient: 'from-amber-300 via-yellow-400 to-orange-400',
      description: 'Golden light - Joy & optimism',
      color: 'amber',
      isOriginal: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Feedback & Support Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-6 shadow-2xl border-2 border-white"
      >
        <div className="flex items-start gap-4 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Help Us Improve DobryLife!</h3>
            <p className="text-white/90 mb-4">
              We are training our AI <strong>every single day</strong> based on your feedback. Found a bug? Have an idea? We want to hear from you!
            </p>
            <a
              href="mailto:contact@dobrylife.com?subject=Feedback%20from%20DobryLife%20User"
              className="inline-flex items-center gap-2 bg-white text-purple-700 px-5 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
            >
              <Mail className="w-4 h-4" />
              Send Feedback to contact@dobrylife.com
            </a>
            <p className="text-sm text-white/80 mt-3">
              ✨ Your input directly shapes our AI intelligence and features
            </p>
          </div>
        </div>
      </motion.div>

      {/* Theme & Appearance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              App Appearance
            </CardTitle>
            <CardDescription>Choose a therapeutic color theme that brings you comfort</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme" className="text-base font-semibold">Therapeutic Color Theme</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    All 9 original themes are preserved - you can always switch back!
                  </p>
                </div>
                {settings.theme !== 'default' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToOriginal}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Original
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themeOptions.map((theme) => (
                  <motion.div
                    key={theme.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSettingChange('theme', theme.id)}
                    className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                      settings.theme === theme.id 
                        ? 'border-purple-500 ring-2 ring-purple-200 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`h-32 bg-gradient-to-br ${theme.gradient}`} />
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{theme.name}</h4>
                        {settings.theme === theme.id && (
                          <CheckCircle2 className="w-5 h-5 text-purple-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{theme.description}</p>
                      {theme.isOriginal && theme.id === 'default' && (
                        <span className="inline-block mt-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          ORIGINAL DEFAULT
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Sound & Animations</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled" className="text-sm font-medium">
                    App Sounds
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable audio feedback for interactions
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => handleSettingChange('sound_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animation-level" className="text-sm font-medium">
                    Animations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Control motion effects
                  </p>
                </div>
                <Select
                  value={settings.animation_level || 'full'}
                  onValueChange={(value) => handleSettingChange('animation_level', value)}
                >
                  <SelectTrigger id="animation-level" className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-preference">Notification Level</Label>
              <Select
                value={settings.notification_preference}
                onValueChange={(value) => handleSettingChange('notification_preference', value)}
              >
                <SelectTrigger id="notification-preference">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="minimal">Minimal (Important Only)</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gamification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Gamification & Encouragement</CardTitle>
                <CardDescription>Customize rewards and motivation style</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Gamification</Label>
                <p className="text-sm text-muted-foreground">
                  Show points, badges, and achievements
                </p>
              </div>
              <Switch
                checked={settings.gamification_enabled}
                onCheckedChange={(checked) => handleSettingChange('gamification_enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encouragement-tone">AI Encouragement Tone</Label>
              <Select
                value={settings.encouragement_tone}
                onValueChange={(value) => handleSettingChange('encouragement_tone', value)}
              >
                <SelectTrigger id="encouragement-tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Calm & Gentle</SelectItem>
                  <SelectItem value="hype">Energetic & Motivating</SelectItem>
                  <SelectItem value="playful">Playful & Fun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quote Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Quote className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Daily Quotes</CardTitle>
                <CardDescription>Choose your inspirational content</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="quote-preference">Quote Category</Label>
              <Select
                value={settings.quote_preference}
                onValueChange={(value) => handleSettingChange('quote_preference', value)}
              >
                <SelectTrigger id="quote-preference">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Wisdom</SelectItem>
                  <SelectItem value="grief_and_loss">Grief & Loss</SelectItem>
                  <SelectItem value="motivation_and_growth">Motivation & Growth</SelectItem>
                  <SelectItem value="parenting_and_family">Parenting & Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Kids Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToyBrick className="w-5 h-5" />
              Kids Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Kids Studio is now always available!</p>
                  <p>
                    Kids Studio provides a safe, creative space for children with games,
                    learning activities, and journals. It is accessible to all users.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="kids-mode" className="text-sm font-medium">
                  Kids Mode (Restricted Access)
                </Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, only Kids Studio and Video Call are visible
                </p>
              </div>
              <Switch
                id="kids-mode"
                checked={settings.kids_mode_active || false}
                onCheckedChange={handleKidsModeToggle}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Note:</strong> Kids Mode is designed for when a child is using the device.
                Regular mode keeps Kids Studio accessible while showing all other features too.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Smart automation features</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Automation</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI Assistant to auto-suggest and organize
                </p>
              </div>
              <Switch
                checked={settings.automation_enabled}
                onCheckedChange={(checked) => handleSettingChange('automation_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 z-10"
        >
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-2xl">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">You have unsaved changes</span>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-white text-purple-700 hover:bg-gray-100"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}