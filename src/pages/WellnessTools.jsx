
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Clock, Compass, Moon, Headphones, Heart, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const allTools = [
  { id: 'adhdTimebox', icon: Clock, label: 'Time Box', description: 'A focused work timer to manage tasks.' },
  { id: 'moodCompass', icon: Compass, label: 'Mood Compass', description: 'A quick check-in for your emotional state.' },
  { id: 'eveningReset', icon: Moon, label: 'Evening Reset', description: 'A guided routine to wind down.' },
  { id: 'focusSoundscapes', icon: Headphones, label: 'Focus Soundscapes', description: 'Ambient sounds to improve concentration.' },
  { id: 'gratitudeDropin', icon: Heart, label: 'Gratitude Drop-in', description: 'Jot down something you are grateful for.' },
  { id: 'emergencyCalm', icon: AlertTriangle, label: 'Emergency Calm', description: 'Immediate grounding and breathing exercises.' }
];

export default function WellnessTools() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => User.me(),
  });

  const [activeTools, setActiveTools] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && user.app_settings?.wellness_dock_tools) {
      setActiveTools(user.app_settings.wellness_dock_tools);
    } else if (user) {
      // Default state if not set
      setActiveTools(['moodCompass', 'focusSoundscapes', 'gratitudeDropin', 'emergencyCalm']);
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: (newAppSettings) => User.updateMyUserData({ app_settings: newAppSettings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsSaving(false);
    },
    onError: (error) => {
      console.error("Failed to save settings:", error);
      setIsSaving(false);
    }
  });

  const handleToggleTool = (toolId) => {
    setActiveTools(prev => {
      const newActiveTools = prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId];
      saveSettings(newActiveTools);
      return newActiveTools;
    });
  };
  
  const saveSettings = (tools) => {
    if (user) {
      setIsSaving(true);
      const newSettings = { ...user.app_settings, wellness_dock_tools: tools };
      updateSettingsMutation.mutate(newSettings);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card data-card className="overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-md">
                <Sparkles className="w-12 h-12 text-purple-500" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Your Wellness Dock</h1>
                <p className="text-slate-600 mt-2 text-lg">
                  A set of quick-access tools to support your well-being, available anywhere in the app.
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Customize Your Dock</CardTitle>
              <CardDescription>Choose which tools you'd like to have at your fingertips.</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allTools.map(tool => {
                const Icon = tool.icon;
                const isActive = activeTools.includes(tool.id);
                return (
                  <motion.div
                    key={tool.id}
                    layout
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`p-4 rounded-xl border transition-all duration-300 ${isActive ? 'bg-purple-50 border-purple-200' : 'bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
                        <div>
                          <Label htmlFor={`switch-${tool.id}`} className="font-semibold text-slate-800">
                            {tool.label}
                          </Label>
                          <p className="text-sm text-slate-500">{tool.description}</p>
                        </div>
                      </div>
                      <Switch
                        id={`switch-${tool.id}`}
                        checked={isActive}
                        onCheckedChange={() => handleToggleTool(tool.id)}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-8 text-center text-sm text-slate-500">
              Your dock is always available via the sparkles icon on the right side of your screen.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
