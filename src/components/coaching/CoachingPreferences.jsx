
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Brain,
  Heart,
  Wind,
  Sparkles,
  Target,
  MessageSquare,
  Save,
  Loader2,
  Info,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function CoachingPreferences() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState({
    communication_style: 'warm_conversational',
    preferred_meditation_types: ['breathing', 'body_scan'],
    preferred_affirmation_categories: ['self_compassion', 'progress'],
    task_difficulty_preference: 'adaptive',
    session_length_preference: 'moderate_10min',
    encouragement_frequency: 'balanced',
    check_in_reminder_time: '09:00',
    values_keywords: [],
    metaphor_preferences: [],
    trigger_words_to_avoid: [],
    response_to_setbacks: 'reframing_focus',
    celebration_style: 'reflective_gratitude',
    learning_modality: 'mixed',
    spiritual_openness: 'varied',
    preferred_session_time: 'flexible',
    energy_pattern: 'variable'
  });

  const [newValue, setNewValue] = useState('');
  const [newMetaphor, setNewMetaphor] = useState('');
  const [newTrigger, setNewTrigger] = useState('');

  useEffect(() => {
    if (user?.coaching_preferences) {
      setPreferences(prev => ({ 
        ...prev, 
        ...user.coaching_preferences,
        // Ensure arrays are properly initialized to empty arrays if they are null/undefined
        values_keywords: user.coaching_preferences.values_keywords || [],
        metaphor_preferences: user.coaching_preferences.metaphor_preferences || [],
        trigger_words_to_avoid: user.coaching_preferences.trigger_words_to_avoid || [],
        preferred_meditation_types: user.coaching_preferences.preferred_meditation_types || ['breathing', 'body_scan'], // Keep default if none
        preferred_affirmation_categories: user.coaching_preferences.preferred_affirmation_categories || ['self_compassion', 'progress'] // Keep default if none
      }));
    }
  }, [user]);

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs) => base44.auth.updateMe({
      coaching_preferences: prefs
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Preferences saved! Your AI coach will adapt 🎯');
    }
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const meditationOptions = [
    { value: 'breathing', label: 'Breathing Exercises', icon: Wind },
    { value: 'body_scan', label: 'Body Scan', icon: Heart },
    { value: 'loving_kindness', label: 'Loving-Kindness', icon: Heart },
    { value: 'grief_meditation', label: 'Grief Processing', icon: Heart },
    { value: 'visualization', label: 'Guided Visualization', icon: Sparkles },
    { value: 'mantra', label: 'Mantra Meditation', icon: MessageSquare },
    { value: 'walking', label: 'Walking Meditation', icon: Target }
  ];

  const affirmationCategories = [
    { value: 'self_compassion', label: 'Self-Compassion', emoji: '💜' },
    { value: 'strength', label: 'Inner Strength', emoji: '💪' },
    { value: 'progress', label: 'Progress & Growth', emoji: '📈' },
    { value: 'healing', label: 'Healing Journey', emoji: '🌸' },
    { value: 'capability', label: 'Capability & Power', emoji: '⚡' },
    { value: 'worthiness', label: 'Self-Worth', emoji: '✨' },
    { value: 'resilience', label: 'Resilience', emoji: '🌳' }
  ];

  const metaphorOptions = [
    { value: 'nature', label: 'Nature & Seasons', emoji: '🌿' },
    { value: 'journey', label: 'Journey & Path', emoji: '🛤️' },
    { value: 'gardening', label: 'Growth & Gardening', emoji: '🌱' },
    { value: 'ocean', label: 'Ocean & Waves', emoji: '🌊' },
    { value: 'mountain', label: 'Mountains & Climbing', emoji: '⛰️' },
    { value: 'seasons', label: 'Life Seasons', emoji: '🍂' },
    { value: 'light', label: 'Light & Darkness', emoji: '💡' },
    { value: 'building', label: 'Building & Creating', emoji: '🏗️' }
  ];

  const toggleArrayItem = (array, item) => {
    const safeArray = array || []; // Ensure array is not null or undefined
    if (safeArray.includes(item)) {
      return safeArray.filter(i => i !== item);
    } else {
      return [...safeArray, item];
    }
  };

  const addKeyword = (type) => {
    if (type === 'value' && newValue.trim()) {
      setPreferences({
        ...preferences,
        values_keywords: [...(preferences.values_keywords || []), newValue.trim()]
      });
      setNewValue('');
    } else if (type === 'trigger' && newTrigger.trim()) {
      setPreferences({
        ...preferences,
        trigger_words_to_avoid: [...(preferences.trigger_words_to_avoid || []), newTrigger.trim()]
      });
      setNewTrigger('');
    }
  };

  const removeKeyword = (type, keyword) => {
    if (type === 'value') {
      setPreferences({
        ...preferences,
        values_keywords: (preferences.values_keywords || []).filter(k => k !== keyword)
      });
    } else if (type === 'trigger') {
      setPreferences({
        ...preferences,
        trigger_words_to_avoid: (preferences.trigger_words_to_avoid || []).filter(k => k !== keyword)
      });
    }
  };

  // Show learned preferences from interaction history
  const interactionHistory = user?.coaching_interaction_history || {};
  const hasLearned = interactionHistory.favorite_meditation_types?.length > 0 || 
                     interactionHistory.favorite_affirmation_categories?.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          Personalize Your AI Coach
        </h2>
        <p className="text-gray-600">
          Customize how your AI coach communicates and supports you
        </p>
      </div>

      {/* Learned Preferences Banner */}
      {hasLearned && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  We've been learning your preferences! 📊
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {interactionHistory.favorite_meditation_types?.length > 0 && (
                    <p>• You prefer: {interactionHistory.favorite_meditation_types.join(', ')} meditations</p>
                  )}
                  {interactionHistory.favorite_affirmation_categories?.length > 0 && (
                    <p>• You resonate with: {interactionHistory.favorite_affirmation_categories.join(', ')} affirmations</p>
                  )}
                  {interactionHistory.task_acceptance_rate && (
                    <p>• Task completion rate: {(interactionHistory.task_acceptance_rate * 100).toFixed(0)}%</p>
                  )}
                  {interactionHistory.most_active_time && (
                    <p>• Most active: {interactionHistory.most_active_time}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Communication Style
          </CardTitle>
          <CardDescription>
            How would you like your AI coach to talk with you?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { value: 'warm_conversational', label: 'Warm & Conversational', desc: 'Like talking to a caring friend' },
              { value: 'professional_supportive', label: 'Professional & Supportive', desc: 'Expert guidance with warmth' },
              { value: 'gentle_nurturing', label: 'Gentle & Nurturing', desc: 'Extra tender and patient' },
              { value: 'direct_empowering', label: 'Direct & Empowering', desc: 'Clear and motivating' },
              { value: 'playful_encouraging', label: 'Playful & Encouraging', desc: 'Light-hearted and uplifting' }
            ].map(style => (
              <button
                key={style.value}
                onClick={() => setPreferences({ ...preferences, communication_style: style.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  preferences.communication_style === style.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <p className="font-semibold text-gray-900 mb-1">{style.label}</p>
                <p className="text-sm text-gray-600">{style.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meditation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-600" />
            Preferred Meditation Types
          </CardTitle>
          <CardDescription>
            Select the types of meditations you enjoy most
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {meditationOptions.map(option => {
              const Icon = option.icon;
              const isSelected = preferences.preferred_meditation_types?.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  onClick={() => setPreferences({
                    ...preferences,
                    preferred_meditation_types: toggleArrayItem(
                      preferences.preferred_meditation_types,
                      option.value
                    )
                  })}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${isSelected ? 'text-cyan-900' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-cyan-600 ml-auto" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Affirmation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-600" />
            Affirmation Categories
          </CardTitle>
          <CardDescription>
            Which affirmations resonate most with you?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {affirmationCategories.map(category => {
              const isSelected = preferences.preferred_affirmation_categories?.includes(category.value);
              
              return (
                <button
                  key={category.value}
                  onClick={() => setPreferences({
                    ...preferences,
                    preferred_affirmation_categories: toggleArrayItem(
                      preferences.preferred_affirmation_categories,
                      category.value
                    )
                  })}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <span className="text-2xl">{category.emoji}</span>
                  <span className={`font-medium ${isSelected ? 'text-pink-900' : 'text-gray-700'}`}>
                    {category.label}
                  </span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-pink-600 ml-auto" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metaphor Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Metaphors</CardTitle>
          <CardDescription>
            What imagery resonates with you in coaching language?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-2">
            {metaphorOptions.map(meta => {
              const isSelected = preferences.metaphor_preferences?.includes(meta.value);
              
              return (
                <button
                  key={meta.value}
                  onClick={() => setPreferences({
                    ...preferences,
                    metaphor_preferences: toggleArrayItem(
                      preferences.metaphor_preferences,
                      meta.value
                    )
                  })}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{meta.emoji}</span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Values Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Your Core Values</CardTitle>
          <CardDescription>
            Words that are important to you (family, growth, peace, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Add a value..."
              onKeyPress={(e) => e.key === 'Enter' && addKeyword('value')}
            />
            <Button onClick={() => addKeyword('value')} variant="outline">
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(preferences.values_keywords || []).map((keyword, idx) => (
              <Badge
                key={idx}
                className="bg-purple-100 text-purple-700 px-3 py-1 cursor-pointer hover:bg-purple-200"
                onClick={() => removeKeyword('value', keyword)}
              >
                {keyword} ×
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trigger Words to Avoid */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-orange-600" />
            Words to Avoid
          </CardTitle>
          <CardDescription>
            Words or phrases that are difficult or triggering for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder="Add a word to avoid..."
              onKeyPress={(e) => e.key === 'Enter' && addKeyword('trigger')}
            />
            <Button onClick={() => addKeyword('trigger')} variant="outline">
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(preferences.trigger_words_to_avoid || []).map((keyword, idx) => (
              <Badge
                key={idx}
                className="bg-orange-100 text-orange-700 px-3 py-1 cursor-pointer hover:bg-orange-200"
                onClick={() => removeKeyword('trigger', keyword)}
              >
                {keyword} ×
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Preferences */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Task Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={preferences.task_difficulty_preference}
              onChange={(e) => setPreferences({ ...preferences, task_difficulty_preference: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="always_gentle">Always Gentle</option>
              <option value="adaptive">Adaptive (Recommended)</option>
              <option value="challenging">Always Challenging</option>
            </select>
          </CardContent>
        </Card>

        {/* Session Length */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Length</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={preferences.session_length_preference}
              onChange={(e) => setPreferences({ ...preferences, session_length_preference: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="brief_5min">Brief (5 min)</option>
              <option value="moderate_10min">Moderate (10 min)</option>
              <option value="extended_15min">Extended (15 min)</option>
              <option value="deep_20min">Deep Dive (20 min)</option>
            </select>
          </CardContent>
        </Card>

        {/* Response to Setbacks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">When You Face Setbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={preferences.response_to_setbacks}
              onChange={(e) => setPreferences({ ...preferences, response_to_setbacks: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="extra_gentle">Extra Gentle Support</option>
              <option value="reframing_focus">Help Me Reframe</option>
              <option value="problem_solving">Problem-Solving Focus</option>
              <option value="space_to_feel">Space to Feel</option>
            </select>
          </CardContent>
        </Card>

        {/* Celebration Style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Celebration Style</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={preferences.celebration_style}
              onChange={(e) => setPreferences({ ...preferences, celebration_style: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="quiet_acknowledgment">Quiet Acknowledgment</option>
              <option value="enthusiastic_praise">Enthusiastic Praise</option>
              <option value="reflective_gratitude">Reflective Gratitude</option>
            </select>
          </CardContent>
        </Card>

        {/* Learning Modality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Learning Style</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={preferences.learning_modality}
              onChange={(e) => setPreferences({ ...preferences, learning_modality: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="visual">Visual (Images & Diagrams)</option>
              <option value="auditory">Auditory (Listening)</option>
              <option value="kinesthetic">Kinesthetic (Doing)</option>
              <option value="reading_writing">Reading & Writing</option>
              <option value="mixed">Mixed Approach</option>
            </select>
          </CardContent>
        </Card>

        {/* Spiritual Openness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spiritual Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={preferences.spiritual_openness}
              onChange={(e) => setPreferences({ ...preferences, spiritual_openness: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="secular">Secular Only</option>
              <option value="spiritual_open">Spiritual (Non-Religious)</option>
              <option value="religious_specific">Religious</option>
              <option value="varied">Open to All</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Time */}
      <Card>
        <CardHeader>
          <CardTitle>Check-In Reminder Time</CardTitle>
          <CardDescription>
            What time works best for your coaching check-ins?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="time"
            value={preferences.check_in_reminder_time}
            onChange={(e) => setPreferences({ ...preferences, check_in_reminder_time: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-2 block">Preferred Session Time</Label>
              <select
                value={preferences.preferred_session_time}
                onChange={(e) => setPreferences({ ...preferences, preferred_session_time: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="morning">Morning</option>
                <option value="midday">Midday</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Your Energy Pattern</Label>
              <select
                value={preferences.energy_pattern}
                onChange={(e) => setPreferences({ ...preferences, energy_pattern: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="morning_person">Morning Person</option>
                <option value="night_owl">Night Owl</option>
                <option value="consistent">Consistent</option>
                <option value="variable">Variable</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSave}
          disabled={updatePreferencesMutation.isLoading}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12"
        >
          {updatePreferencesMutation.isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong>Your AI coach is always learning!</strong> As you interact with meditations, 
                affirmations, and tasks, we'll automatically refine these preferences to better serve you. 
                You can update them anytime as you discover what works best for your journey.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
