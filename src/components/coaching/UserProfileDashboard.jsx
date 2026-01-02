
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  User,
  Brain,
  Heart,
  Wind,
  TrendingUp,
  Sparkles,
  Target,
  Award,
  Clock,
  BarChart3,
  Settings,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UserProfileDashboard({ showFullProfile = false }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const prefs = user?.coaching_preferences || {};
  const history = user?.coaching_interaction_history || {};
  const stats = user?.coaching_stats || {};

  // Calculate profile completion
  const profileCompletion = calculateProfileCompletion(prefs);
  
  // Get personalization strength
  const personalizationStrength = calculatePersonalizationStrength(history);

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{user?.full_name || 'User'}</h2>
                <p className="text-purple-100 text-sm">Your AI Coaching Profile</p>
              </div>
            </div>
            
            <Button asChild variant="secondary" size="sm">
              <Link to={createPageUrl('CoachingPreferences')}>
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs text-purple-100">Level</span>
              </div>
              <p className="text-2xl font-bold">{stats.level || 1}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs text-purple-100">Streak</span>
              </div>
              <p className="text-2xl font-bold">{stats.streak || 0} days</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4" />
                <span className="text-xs text-purple-100">Sessions</span>
              </div>
              <p className="text-2xl font-bold">{history.total_meditations_completed || 0}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs text-purple-100">XP</span>
              </div>
              <p className="text-2xl font-bold">{stats.xp || 0}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-100">Profile Completion</span>
              <span className="text-sm font-bold">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Personalization Strength Indicator */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              personalizationStrength >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
              personalizationStrength >= 50 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
              'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-900">AI Personalization Level</h3>
                <Badge className={
                  personalizationStrength >= 80 ? 'bg-green-500' :
                  personalizationStrength >= 50 ? 'bg-blue-500' :
                  'bg-gray-500'
                }>
                  {personalizationStrength >= 80 ? 'Highly Personalized' :
                   personalizationStrength >= 50 ? 'Learning You' :
                   'Getting Started'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {personalizationStrength >= 80 
                  ? 'Your AI coach knows you deeply! Responses are highly tailored to your unique style.' 
                  : personalizationStrength >= 50
                  ? 'Your AI coach is learning your preferences. Keep interacting to unlock deeper personalization!'
                  : 'Set your preferences and interact with your AI coach to enable personalization.'}
              </p>
              
              <Progress value={personalizationStrength} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Communication Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Your Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prefs.communication_style ? (
              <div className="space-y-2">
                <Badge className="bg-purple-100 text-purple-700">
                  {prefs.communication_style.replace('_', ' ')}
                </Badge>
                {prefs.learning_modality && (
                  <p className="text-xs text-gray-600">
                    {prefs.learning_modality} learner
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not set</p>
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600" />
              Top Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.favorite_meditation_types?.length > 0 || history.favorite_affirmation_categories?.length > 0 ? (
              <div className="space-y-2">
                {history.favorite_meditation_types?.slice(0, 2).map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Wind className="w-3 h-3 mr-1" />
                    {type}
                  </Badge>
                ))}
                {history.favorite_affirmation_categories?.slice(0, 1).map((cat, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {cat}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Keep using features to learn</p>
            )}
          </CardContent>
        </Card>

        {/* Engagement Pattern */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Best Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.most_active_time || prefs.preferred_session_time ? (
              <div className="space-y-1">
                <Badge className="bg-blue-100 text-blue-700">
                  {history.most_active_time || prefs.preferred_session_time}
                </Badge>
                {prefs.energy_pattern && (
                  <p className="text-xs text-gray-600">
                    {prefs.energy_pattern.replace('_', ' ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not detected yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learned Insights */}
      {showFullProfile && history.response_patterns && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              What We've Learned About You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.response_patterns?.engages_with_depth && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-700">
                  You enjoy deep, reflective work
                </p>
              </div>
            )}
            
            {history.task_acceptance_rate !== undefined && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-gray-700">
                  Task completion rate: {(history.task_acceptance_rate * 100).toFixed(0)}% 
                  {history.task_acceptance_rate >= 0.7 ? ' - You thrive on action!' :
                   history.task_acceptance_rate >= 0.4 ? ' - Building momentum' :
                   ' - Tasks are challenging (we\'ll adjust)'}
                </p>
              </div>
            )}

            {history.avg_session_duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-700">
                  Average session: {Math.round(history.avg_session_duration_minutes)} minutes
                </p>
              </div>
            )}

            {history.breakthrough_sessions_completed > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-gray-700">
                  Breakthrough sessions completed: {history.breakthrough_sessions_completed}
                </p>
              </div>
            )}

            {prefs.values_keywords?.length > 0 && (
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-pink-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 mb-2">Your core values:</p>
                  <div className="flex flex-wrap gap-1">
                    {prefs.values_keywords.map((value, idx) => (
                      <Badge key={idx} className="bg-pink-100 text-pink-700 text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Completeness Tips */}
      {profileCompletion < 80 && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Unlock Deeper Personalization</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Complete your profile to help your AI coach understand you better!
                </p>
                <div className="space-y-2 text-sm">
                  {!prefs.values_keywords?.length && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Add your core values
                    </div>
                  )}
                  {!prefs.metaphor_preferences?.length && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Select preferred metaphors
                    </div>
                  )}
                  {prefs.preferred_meditation_types?.length < 2 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Choose meditation types you enjoy
                    </div>
                  )}
                </div>
                <Button asChild className="mt-4" size="sm" variant="outline">
                  <Link to={createPageUrl('CoachingPreferences')}>
                    Complete Profile
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function calculateProfileCompletion(prefs) {
  let completed = 0;
  const total = 10;

  if (prefs.communication_style) completed++;
  if (prefs.preferred_meditation_types?.length >= 2) completed++;
  if (prefs.preferred_affirmation_categories?.length >= 2) completed++;
  if (prefs.values_keywords?.length >= 3) completed++;
  if (prefs.metaphor_preferences?.length >= 2) completed++;
  if (prefs.response_to_setbacks) completed++;
  if (prefs.celebration_style) completed++;
  if (prefs.learning_modality) completed++;
  if (prefs.spiritual_openness) completed++;
  if (prefs.preferred_session_time) completed++;

  return Math.round((completed / total) * 100);
}

function calculatePersonalizationStrength(history) {
  let strength = 0;

  // Each interaction adds to personalization strength
  if (history.total_meditations_completed >= 5) strength += 20;
  if (history.total_affirmations_generated >= 10) strength += 20;
  if (history.favorite_meditation_types?.length >= 2) strength += 15;
  if (history.favorite_affirmation_categories?.length >= 2) strength += 15;
  if (history.breakthrough_sessions_completed >= 1) strength += 15;
  if (history.most_active_time) strength += 10;
  if (history.response_patterns?.engages_with_depth) strength += 5;

  return Math.min(strength, 100);
}
