import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Sparkles, User, EyeOff, Eye, MapPin, Heart, Target, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupPrompt({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    display_name: user?.preferred_name || user?.full_name || '',
    display_emoji: user?.profile_emoji || '😊',
    is_fully_anonymous: true,
    bio: '',
    general_location: '',
    interests: [],
    goal_categories: [],
    support_preferences: [],
    journey_stage: 'just_started',
    activity_level: 'moderate',
    looking_for: [],
    is_open_to_new_connections: true,
    matchmaking_enabled: true,
    can_be_discovered: true,
    visibility_level: 'anonymous'
  });

  const queryClient = useQueryClient();

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          has_community_profile: true
        })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communityProfiles']);
      queryClient.invalidateQueries(['userProfile']);
      toast.success('🎉 Community profile created! You can now connect with others!');
      onComplete?.();
    }
  });

  const goalOptions = [
    'emotional_healing', 'daily_functioning', 'relationships',
    'work_life', 'self_care', 'grief_processing',
    'life_transitions', 'personal_growth', 'habit_building'
  ];

  const supportOptions = [
    'goal_accountability', 'wellness_journey', 'grief_support',
    'habit_building', 'general_support', 'parenting', 'career_growth'
  ];

  const lookingForOptions = [
    'accountability_partner', 'support_circle', 'challenge_buddy',
    'mentorship', 'peer_support', 'just_connecting'
  ];

  const emojis = ['😊', '🎭', '🌟', '💫', '🦋', '🌈', '✨', '💖', '🌸', '🌺', '🍀', '🌻', '🎨', '🎪', '🎭', '🎯'];

  const toggleArray = (arr, item) => {
    if (arr.includes(item)) {
      return arr.filter(i => i !== item);
    }
    return [...arr, item];
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      createProfileMutation.mutate();
    }
  };

  const canProceed = () => {
    if (step === 1) return profileData.display_name.trim();
    if (step === 2) return profileData.goal_categories.length > 0;
    if (step === 3) return profileData.looking_for.length > 0;
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <Card className="w-full max-w-2xl bg-gradient-to-br from-white to-purple-50 border-2 border-purple-300 shadow-2xl my-8">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <div>
              <CardTitle className="text-2xl">Welcome to the Community!</CardTitle>
              <p className="text-purple-100 text-sm">Let's set up your profile - Step {step} of 4</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              className="h-full bg-white"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Step 1: Identity */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <User className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">How do you want to appear?</h3>
                <p className="text-gray-600">Choose between anonymous or visible mode</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileData({ ...profileData, is_fully_anonymous: true, visibility_level: 'anonymous' })}
                  className={`p-6 rounded-xl border-2 transition-all ${profileData.is_fully_anonymous
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <EyeOff className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">🎭 Anonymous</h4>
                  <p className="text-sm text-gray-600">Share with emoji only. Perfect for privacy.</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileData({ ...profileData, is_fully_anonymous: false, visibility_level: 'semi_visible' })}
                  className={`p-6 rounded-xl border-2 transition-all ${!profileData.is_fully_anonymous
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  <Eye className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">🌟 Visible</h4>
                  <p className="text-sm text-gray-600">Show your name & profile to others.</p>
                </motion.button>
              </div>

              {profileData.is_fully_anonymous ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Your Emoji</label>
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setProfileData({ ...profileData, display_emoji: emoji, display_name: `${emoji} Anonymous` })}
                        className={`p-3 text-2xl rounded-lg border-2 transition-all ${profileData.display_emoji === emoji
                            ? 'border-purple-500 bg-purple-50 scale-110'
                            : 'border-gray-200 hover:border-purple-300'
                          }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name *</label>
                    <Input
                      value={profileData.display_name}
                      onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                      placeholder="How should people call you?"
                      className="border-2 border-purple-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio (optional)</label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell us a bit about yourself..."
                      className="border-2 border-purple-200 h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location (optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={profileData.general_location}
                        onChange={(e) => setProfileData({ ...profileData, general_location: e.target.value })}
                        placeholder="e.g., California, USA"
                        className="border-2 border-purple-200 pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <Target className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">What are you working on?</h3>
                <p className="text-gray-600">Select your goals (pick at least 1)</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {goalOptions.map((goal) => (
                  <motion.button
                    key={goal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileData({
                      ...profileData,
                      goal_categories: toggleArray(profileData.goal_categories, goal)
                    })}
                    className={`p-4 rounded-lg border-2 transition-all text-sm font-medium ${profileData.goal_categories.includes(goal)
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                      }`}
                  >
                    {profileData.goal_categories.includes(goal) && (
                      <CheckCircle className="w-4 h-4 text-purple-600 mb-1 mx-auto" />
                    )}
                    {goal.replace(/_/g, ' ')}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Looking For */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <Users className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">What are you looking for?</h3>
                <p className="text-gray-600">Select what you want from the community</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {lookingForOptions.map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileData({
                      ...profileData,
                      looking_for: toggleArray(profileData.looking_for, option)
                    })}
                    className={`p-4 rounded-lg border-2 transition-all text-sm font-medium ${profileData.looking_for.includes(option)
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-purple-300 text-gray-700'
                      }`}
                  >
                    {profileData.looking_for.includes(option) && (
                      <CheckCircle className="w-4 h-4 text-purple-600 mb-1 mx-auto" />
                    )}
                    {option.replace(/_/g, ' ')}
                  </motion.button>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Support Preferences</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {supportOptions.map((support) => (
                    <Button
                      key={support}
                      onClick={() => setProfileData({
                        ...profileData,
                        support_preferences: toggleArray(profileData.support_preferences, support)
                      })}
                      variant={profileData.support_preferences.includes(support) ? 'default' : 'outline'}
                      size="sm"
                      className={profileData.support_preferences.includes(support) ? 'bg-purple-600' : ''}
                    >
                      {support.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Final Settings */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <Heart className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Almost done!</h3>
                <p className="text-gray-600">Set your preferences</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.can_be_discovered}
                      onChange={(e) => setProfileData({ ...profileData, can_be_discovered: e.target.checked })}
                      className="w-5 h-5 text-purple-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Make me discoverable</p>
                      <p className="text-sm text-gray-600">Others can find you in search</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-pink-50 border-2 border-pink-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.is_open_to_new_connections}
                      onChange={(e) => setProfileData({ ...profileData, is_open_to_new_connections: e.target.checked })}
                      className="w-5 h-5 text-pink-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Open to new connections</p>
                      <p className="text-sm text-gray-600">Accept connection requests</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.matchmaking_enabled}
                      onChange={(e) => setProfileData({ ...profileData, matchmaking_enabled: e.target.checked })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Enable smart matching</p>
                      <p className="text-sm text-gray-600">Get suggestions for compatible buddies</p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-green-900 mb-1">You're all set!</p>
                      <p className="text-sm text-green-800">Your profile will be created and you'll be able to connect with others!</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="border-2 border-purple-300"
              >
                Back
              </Button>
            )}
            <div className="flex-1" />
            <Button
              onClick={handleNext}
              disabled={!canProceed() || createProfileMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              {createProfileMutation.isPending ? (
                'Creating...'
              ) : step === 4 ? (
                <>
                  Complete Setup
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}