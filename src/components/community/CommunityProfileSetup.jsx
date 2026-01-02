
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Heart,
  Target,
  Zap,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const PRESET_INTERESTS = [
  'Meditation', 'Journaling', 'Fitness', 'Yoga', 'Reading', 'Gratitude',
  'Mindfulness', 'Therapy', 'Grief Support', 'Habit Building', 'Goal Setting',
  'Personal Growth', 'Wellness', 'Mental Health', 'Self Care', 'Creativity',
  'Nutrition', 'Sleep Health', 'Relationships', 'Career', 'Parenting'
];

const GOAL_CATEGORIES = [
  { value: 'emotional_healing', label: 'Emotional Healing', icon: '💜' },
  { value: 'daily_functioning', label: 'Daily Functioning', icon: '✅' },
  { value: 'relationships', label: 'Relationships', icon: '❤️' },
  { value: 'work_life', label: 'Work/Life Balance', icon: '⚖️' },
  { value: 'self_care', label: 'Self Care', icon: '🌸' },
  { value: 'grief_processing', label: 'Grief Processing', icon: '🕊️' },
  { value: 'personal_growth', label: 'Personal Growth', icon: '🌱' },
  { value: 'habit_building', label: 'Habit Building', icon: '🎯' }
];

const SUPPORT_PREFERENCES = [
  { value: 'goal_accountability', label: 'Goal Accountability', icon: '🎯' },
  { value: 'wellness_journey', label: 'Wellness Journey', icon: '🌟' },
  { value: 'grief_support', label: 'Grief Support', icon: '💜' },
  { value: 'habit_building', label: 'Habit Building', icon: '📈' },
  { value: 'parenting', label: 'Parenting Support', icon: '👶' },
  { value: 'career_growth', label: 'Career Growth', icon: '💼' }
];

export default function CommunityProfileSetup({ existingProfile, onComplete }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(existingProfile || {
    display_name: '',
    bio: '',
    interests: [],
    goal_categories: [],
    support_preferences: [],
    journey_stage: 'just_started',
    activity_level: 'moderate',
    looking_for: [],
    custom_tags: [],
    buddy_preferences: {
      preferred_check_in_frequency: 'weekly',
      communication_style: 'empathetic',
      preferred_check_in_time: 'flexible',
      open_to_challenges: true
    },
    is_open_to_new_connections: true,
    matchmaking_enabled: true
  });
  const [customInterest, setCustomInterest] = useState('');

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProfile?.id) {
        return base44.entities.UserCommunityProfile.update(existingProfile.id, {
          ...data,
          profile_completed: true
        });
      }
      return base44.entities.UserCommunityProfile.create({
        ...data,
        profile_completed: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communityProfile']);
      toast.success('Profile saved! 🎉');
      if (onComplete) onComplete();
    }
  });

  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleNext = () => {
    if (step === 1 && !profile.display_name.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    setStep(step + 1);
  };

  const handleSave = () => {
    if (!profile.display_name.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    if (profile.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    if (profile.goal_categories.length === 0) {
      toast.error('Please select at least one goal category');
      return;
    }

    saveMutation.mutate(profile);
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !profile.interests.includes(customInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, customInterest.trim()],
        custom_tags: [...(profile.custom_tags || []), customInterest.trim()]
      });
      setCustomInterest('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
          <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-purple-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name *</label>
                  <Input
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    placeholder="How you want to appear in the community"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Share a bit about yourself and your journey..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Journey Stage</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'just_started', label: 'Just Started' },
                      { value: 'building_momentum', label: 'Building Momentum' },
                      { value: 'consistent', label: 'Consistent' },
                      { value: 'thriving', label: 'Thriving' }
                    ].map(stage => (
                      <button
                        key={stage.value}
                        onClick={() => setProfile({ ...profile, journey_stage: stage.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          profile.journey_stage === stage.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm">{stage.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Next
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-600" />
                  Your Interests
                </CardTitle>
                <CardDescription>
                  Select interests to find like-minded buddies (choose at least 1)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {PRESET_INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => setProfile({
                        ...profile,
                        interests: toggleArrayItem(profile.interests, interest)
                      })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        profile.interests.includes(interest)
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Add Custom Interest</label>
                  <div className="flex gap-2">
                    <Input
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      placeholder="Type your interest..."
                      onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                    />
                    <Button onClick={addCustomInterest} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {profile.interests.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      Selected ({profile.interests.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.map(interest => (
                        <Badge key={interest} className="bg-pink-100 text-pink-800">
                          {interest}
                          <button
                            onClick={() => setProfile({
                              ...profile,
                              interests: profile.interests.filter(i => i !== interest)
                            })}
                            className="ml-1 hover:bg-pink-200 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Your Goals & Support Needs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    What are you working on? (Choose at least 1)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_CATEGORIES.map(goal => (
                      <button
                        key={goal.value}
                        onClick={() => setProfile({
                          ...profile,
                          goal_categories: toggleArrayItem(profile.goal_categories, goal.value)
                        })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          profile.goal_categories.includes(goal.value)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{goal.icon}</span>
                          <span className="text-sm font-semibold">{goal.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    What kind of support are you looking for?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORT_PREFERENCES.map(pref => (
                      <button
                        key={pref.value}
                        onClick={() => setProfile({
                          ...profile,
                          support_preferences: toggleArrayItem(profile.support_preferences, pref.value)
                        })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          profile.support_preferences.includes(pref.value)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{pref.icon}</span>
                          <span className="text-sm font-semibold">{pref.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-600" />
                  Buddy Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How often would you like to check in with a buddy?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'daily', label: 'Daily' },
                      { value: 'every_other_day', label: 'Every Other Day' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'biweekly', label: 'Bi-weekly' }
                    ].map(freq => (
                      <button
                        key={freq.value}
                        onClick={() => setProfile({
                          ...profile,
                          buddy_preferences: {
                            ...profile.buddy_preferences,
                            preferred_check_in_frequency: freq.value
                          }
                        })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          profile.buddy_preferences.preferred_check_in_frequency === freq.value
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm">{freq.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Communication Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'motivational', label: 'Motivational', desc: 'Energetic & inspiring' },
                      { value: 'gentle', label: 'Gentle', desc: 'Soft & understanding' },
                      { value: 'direct', label: 'Direct', desc: 'Straightforward' },
                      { value: 'empathetic', label: 'Empathetic', desc: 'Emotionally attuned' }
                    ].map(style => (
                      <button
                        key={style.value}
                        onClick={() => setProfile({
                          ...profile,
                          buddy_preferences: {
                            ...profile.buddy_preferences,
                            communication_style: style.value
                          }
                        })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          profile.buddy_preferences.communication_style === style.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm">{style.label}</p>
                        <p className="text-xs text-gray-600">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="openToConnections"
                    checked={profile.is_open_to_new_connections}
                    onChange={(e) => setProfile({
                      ...profile,
                      is_open_to_new_connections: e.target.checked
                    })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="openToConnections" className="text-sm font-medium text-gray-700">
                    I'm open to new buddy connections
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="matchmaking"
                    checked={profile.matchmaking_enabled}
                    onChange={(e) => setProfile({
                      ...profile,
                      matchmaking_enabled: e.target.checked
                    })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="matchmaking" className="text-sm font-medium text-gray-700">
                    Show me in AI matchmaking suggestions
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {saveMutation.isPending ? 'Saving...' : 'Complete Setup'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
