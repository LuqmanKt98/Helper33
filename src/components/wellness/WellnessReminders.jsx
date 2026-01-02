import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Moon, Droplets, Zap, Settings, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WellnessReminders({ settings, onSettingsChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Sync local state if external settings change (e.g. after initial load)
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSettingsChange(localSettings);
    setTimeout(() => {
        setIsSaving(false);
        setIsExpanded(false);
    }, 1000); // Give feedback for a moment
  };

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Smart Reminders
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isExpanded ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Bedtime: {settings.bedtime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>Water: Every {settings.water_reminder_interval}min</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Move: Every {settings.exercise_reminder_interval}min</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {settings.movement_breaks && (
                <Badge className="bg-green-100 text-green-700">Movement Breaks On</Badge>
              )}
              <Badge className="bg-blue-100 text-blue-700">
                {settings.water_goal} glasses/day
              </Badge>
            </div>
            
            <p className="text-xs text-gray-500">
              Get personalized reminders to maintain your wellness routine throughout the day.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sleep Settings */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Sleep Schedule
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedtime" className="text-xs text-gray-600">Bedtime</Label>
                  <Input 
                    id="bedtime"
                    type="time" 
                    value={localSettings.bedtime}
                    onChange={(e) => updateSetting('bedtime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="wakeup" className="text-xs text-gray-600">Wake Up</Label>
                  <Input 
                    id="wakeup"
                    type="time" 
                    value={localSettings.wakeup}
                    onChange={(e) => updateSetting('wakeup', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="sleep-reminder" className="text-xs text-gray-600">
                  Bedtime reminder (minutes before)
                </Label>
                <Input 
                  id="sleep-reminder"
                  type="number" 
                  min="5" 
                  max="120" 
                  value={localSettings.sleep_reminder_before_bed}
                  onChange={(e) => updateSetting('sleep_reminder_before_bed', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Water Settings */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Hydration Goals
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="water-goal" className="text-xs text-gray-600">Daily Goal (glasses)</Label>
                  <Input 
                    id="water-goal"
                    type="number" 
                    min="4" 
                    max="16" 
                    value={localSettings.water_goal}
                    onChange={(e) => updateSetting('water_goal', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="water-interval" className="text-xs text-gray-600">Reminder Interval</Label>
                  <Select 
                    value={localSettings.water_reminder_interval.toString()}
                    onValueChange={(value) => updateSetting('water_reminder_interval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Movement Settings */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Movement & Exercise
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="movement-breaks" className="text-xs text-gray-600">Enable Movement Breaks</Label>
                    <p className="text-xs text-gray-500">Get gentle reminders to move throughout the day</p>
                  </div>
                  <Switch 
                    id="movement-breaks"
                    checked={localSettings.movement_breaks}
                    onCheckedChange={(checked) => updateSetting('movement_breaks', checked)}
                  />
                </div>
                
                {localSettings.movement_breaks && (
                  <div>
                    <Label htmlFor="exercise-interval" className="text-xs text-gray-600">Movement Reminder Interval</Label>
                    <Select 
                      value={localSettings.exercise_reminder_interval.toString()}
                      onValueChange={(value) => updateSetting('exercise_reminder_interval', parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                {isSaving ? (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        Saved!
                    </>
                ) : "Save Settings"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                    setIsExpanded(false);
                    setLocalSettings(settings); // Reset changes on cancel
                }}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}