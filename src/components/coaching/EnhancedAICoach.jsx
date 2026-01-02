import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Target,
  TrendingUp,
  Sparkles,
  Zap,
  Heart,
  Lightbulb,
  Settings as SettingsIcon,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import PersonalizedAffirmations from './PersonalizedAffirmations';
import AdaptiveMeditation from './AdaptiveMeditation';
import BreakthroughSession from './BreakthroughSession';
import UserProfileDashboard from './UserProfileDashboard';

export default function EnhancedAICoach({ goal, userHistory }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBreakthrough, setShowBreakthrough] = useState(false);
  const [showProfileDashboard, setShowProfileDashboard] = useState(false);
  const [currentMood, setCurrentMood] = useState(5);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    if (goal && userHistory) {
      generatePersonalizedInsights();
      
      const recentNote = userHistory[userHistory.length - 1];
      if (recentNote?.mood) {
        setCurrentMood(parseInt(recentNote.mood) || 5);
      }
    }
  }, [goal?.id, userHistory]);

  const generatePersonalizedInsights = async () => {
    setIsLoading(true);

    try {
      const checkInCount = goal.reflection_notes?.length || 0;
      const completedTasks = (goal.suggested_tasks || []).filter(t => t.completed).length;
      const totalTasks = (goal.suggested_tasks || []).length;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const recentMoodTrend = goal.reflection_notes?.slice(-5).map(r => r.mood) || [];
      const avgRecentMood = recentMoodTrend.length > 0 
        ? recentMoodTrend.reduce((a, b) => (parseInt(a) || 0) + (parseInt(b) || 0), 0) / recentMoodTrend.length
        : 5;

      const prefs = user?.coaching_preferences || {};
      const interactionHistory = user?.coaching_interaction_history || {};

      const prompt = `You are an advanced AI coach with deep knowledge of this specific user.

USER PROFILE:
- Name: ${user?.full_name}
- Communication Style: ${prefs.communication_style || 'warm_conversational'}
- Response to Setbacks: ${prefs.response_to_setbacks || 'reframing_focus'}
- Celebration Style: ${prefs.celebration_style || 'reflective_gratitude'}
- Values: ${prefs.values_keywords?.join(', ') || 'Not specified'}
- Preferred Metaphors: ${prefs.metaphor_preferences?.join(', ') || 'flexible'}
- Spiritual Approach: ${prefs.spiritual_openness || 'varied'}
- Learning Style: ${prefs.learning_modality || 'mixed'}
- AVOID THESE WORDS: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}

INTERACTION PATTERNS:
- Task Acceptance Rate: ${((interactionHistory.task_acceptance_rate || 0.5) * 100).toFixed(0)}%
- Favorite Meditations: ${interactionHistory.favorite_meditation_types?.join(', ') || 'learning'}
- Favorite Affirmations: ${interactionHistory.favorite_affirmation_categories?.join(', ') || 'learning'}
- Breakthrough Sessions: ${interactionHistory.breakthrough_sessions_completed || 0}
- Engages with Depth: ${interactionHistory.response_patterns?.engages_with_depth ? 'Yes' : 'Learning'}

GOAL DETAILS:
- Title: ${goal.goal_title}
- Category: ${goal.category}
- Current Progress: ${goal.progress_percentage}%
- Check-ins Completed: ${checkInCount}
- Task Completion Rate: ${taskCompletionRate.toFixed(0)}%
- Recent Mood Average: ${avgRecentMood.toFixed(1)}/10

RECENT REFLECTIONS:
${goal.reflection_notes?.slice(-3).map(note => `- ${note.date}: Mood ${note.mood}/10 - "${note.note}"`).join('\n') || 'No recent reflections'}

PERSONALIZATION REQUIREMENTS:
1. Use their preferred ${prefs.communication_style || 'warm'} style
2. Incorporate their values: ${prefs.values_keywords?.slice(0, 2).join(', ') || 'growth'}
3. Use ${prefs.metaphor_preferences?.[0] || 'journey'} metaphors if appropriate
4. Match their ${prefs.celebration_style || 'reflective'} celebration style
5. NEVER use these words: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
6. Adapt to their ${prefs.learning_modality || 'mixed'} learning style

Provide deeply personalized insights in JSON format:
{
  "progress_analysis": "2-3 sentences using THEIR communication style and values",
  "strength_identified": "One strength, celebrated in their preferred style",
  "growth_edge": "Growth area, framed per their setback-response preference",
  "motivation_boost": "Personal encouragement using their metaphors and values",
  "adaptive_difficulty": "easier" | "maintain" | "stretch",
  "suggested_focus": "Next focus using their learning style",
  "celebration_moment": "Celebrate using their preferred celebration style",
  "pattern_detected": "Pattern observation in their communication style"
}`;

      const insights = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            progress_analysis: { type: "string" },
            strength_identified: { type: "string" },
            growth_edge: { type: "string" },
            motivation_boost: { type: "string" },
            adaptive_difficulty: { type: "string" },
            suggested_focus: { type: "string" },
            celebration_moment: { type: "string" },
            pattern_detected: { type: "string" }
          }
        }
      });

      setAiInsights(insights);

    } catch (error) {
      console.error('AI insights error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBreakthroughReadiness = () => {
    const checkInCount = userHistory.length;
    const avgMood = userHistory.slice(-5).reduce((sum, r) => sum + (parseInt(r.mood) || 5), 0) / Math.min(5, userHistory.length);
    return checkInCount >= 5 && avgMood >= 5 && goal.progress_percentage >= 20;
  };

  if (showBreakthrough) {
    return (
      <BreakthroughSession
        goal={goal}
        reflectionHistory={userHistory}
        onComplete={() => setShowBreakthrough(false)}
        userPreferences={user?.coaching_preferences}
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-purple-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Analyzing your journey...</p>
        </CardContent>
      </Card>
    );
  }

  if (!aiInsights) return null;

  const isBreakthroughReady = checkBreakthroughReadiness();

  return (
    <div className="space-y-6">
      {/* User Profile Quick View */}
      <Button
        onClick={() => setShowProfileDashboard(!showProfileDashboard)}
        variant="outline"
        className="w-full gap-2 h-auto py-3"
      >
        <UserIcon className="w-4 h-4" />
        <span className="flex-1 text-left">
          {showProfileDashboard ? 'Hide' : 'View'} Your Personalization Profile
        </span>
        <Badge variant="secondary" className="text-xs">
          {user?.coaching_interaction_history?.total_meditations_completed || 0} interactions
        </Badge>
      </Button>

      {showProfileDashboard && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <UserProfileDashboard showFullProfile={true} />
        </motion.div>
      )}

      {/* Preferences Link */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Personalize Your AI Coach
                </p>
                <p className="text-xs text-gray-600">
                  Set your meditation, affirmation, and communication preferences
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={createPageUrl('CoachingPreferences')}>
                Customize
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Breakthrough Ready Banner */}
      {isBreakthroughReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border-2 border-orange-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    You're Ready for a Breakthrough Session! ⚡
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Based on your journey, you're ready for deeper exploration with powerful prompts 
                    tailored to your {user?.coaching_preferences?.communication_style?.replace('_', ' ') || 'unique'} style.
                  </p>
                  <Button
                    onClick={() => setShowBreakthrough(true)}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Start Breakthrough Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Personalized Affirmations */}
      <PersonalizedAffirmations
        goal={goal}
        currentMood={currentMood}
        recentProgress={userHistory}
        userPreferences={user?.coaching_preferences}
      />

      {/* AI Progress Insights - Using User's Preferred Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Coach Insights
              <Badge variant="outline" className="text-xs">
                Personalized to {user?.coaching_preferences?.communication_style?.replace('_', ' ') || 'you'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
              <p className="text-gray-700 leading-relaxed">{aiInsights.progress_analysis}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-green-900 text-sm">Your Strength</p>
                </div>
                <p className="text-sm text-gray-700">{aiInsights.strength_identified}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-blue-900 text-sm">Growth Edge</p>
                </div>
                <p className="text-sm text-gray-700">{aiInsights.growth_edge}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-purple-700" fill="currentColor" />
                <p className="font-semibold text-purple-900">Motivation Boost</p>
              </div>
              <p className="text-gray-800 leading-relaxed">{aiInsights.motivation_boost}</p>
            </div>

            {aiInsights.celebration_moment && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-300">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <p className="font-semibold text-yellow-900 text-sm">Celebrate This!</p>
                </div>
                <p className="text-sm text-gray-700">{aiInsights.celebration_moment}</p>
              </div>
            )}

            {aiInsights.pattern_detected && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <p className="font-semibold text-indigo-900 text-sm">Pattern Noticed</p>
                </div>
                <p className="text-sm text-gray-700">{aiInsights.pattern_detected}</p>
              </div>
            )}

            <div className="bg-white/80 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-gray-700" />
                <p className="font-semibold text-gray-900 text-sm">Next Focus</p>
              </div>
              <p className="text-sm text-gray-700 mb-3">{aiInsights.suggested_focus}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Task Difficulty Level:</span>
                <Badge className={
                  aiInsights.adaptive_difficulty === 'easier' ? 'bg-green-100 text-green-700' :
                  aiInsights.adaptive_difficulty === 'stretch' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }>
                  {aiInsights.adaptive_difficulty === 'easier' ? '📉 Taking it gentler' :
                   aiInsights.adaptive_difficulty === 'stretch' ? '📈 Ready to stretch' :
                   '➡️ Steady pace'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Adaptive Meditation */}
      <AdaptiveMeditation
        goal={goal}
        currentMood={currentMood}
        emotionalState={aiInsights?.pattern_detected}
        userPreferences={user?.coaching_preferences}
      />
    </div>
  );
}