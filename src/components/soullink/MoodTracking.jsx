
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Smile,
  Heart,
  Battery,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfDay } from 'date-fns';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

import { awardPoints } from '@/functions/awardPoints';
import PointsNotification from '@/components/gamification/PointsNotification';
import SocialShareModal from '@/components/social/SocialShareModal';

const moodOptions = [
  { value: 'overwhelmed', label: 'Overwhelmed', emoji: '😰', color: 'red' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤', color: 'orange' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'blue' },
  { value: 'anxious', label: 'Anxious', emoji: '😟', color: 'yellow' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'gray' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'slate' },
  { value: 'content', label: 'Content', emoji: '🙂', color: 'green' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏', color: 'emerald' },
  { value: 'joyful', label: 'Joyful', emoji: '😊', color: 'lime' },
  { value: 'peaceful', label: 'Peaceful', emoji: '😌', color: 'teal' }
];

const emotionalTags = [
  'lonely', 'loved', 'hopeful', 'worried', 'excited', 'calm',
  'restless', 'inspired', 'confused', 'confident'
];

export default function MoodTracking({ settings }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodRating, setMoodRating] = useState([5]);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [contextNote, setContextNote] = useState('');
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [pointsNotification, setPointsNotification] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const queryClient = useQueryClient();

  const { data: moodHistory = [] } = useQuery({
    queryKey: ['soulLinkMoodHistory'],
    queryFn: () => base44.entities.SoulLinkMoodEntry.list('-created_date', 30)
  });

  const { data: healthMetrics = [] } = useQuery({
    queryKey: ['health-metrics-mood'],
    queryFn: () => base44.entities.HealthMetric.filter({}, '-metric_date', 30)
  });

  const { data: healthInsights = [] } = useQuery({
    queryKey: ['health-insights-active'],
    queryFn: () => base44.entities.HealthInsight.filter({
      is_read: false,
      insight_type: 'correlation'
    }, '-created_date', 5)
  });

  // Listen for custom event to switch to health tab
  useEffect(() => {
    const handleSwitchToHealth = () => {
      // Dispatch event to parent SoulLink component
      const event = new CustomEvent('changeSoulLinkTab', { detail: 'health' });
      window.dispatchEvent(event);
    };

    window.addEventListener('switchToHealthTab', handleSwitchToHealth);
    return () => window.removeEventListener('switchToHealthTab', handleSwitchToHealth);
  }, []);

  const saveMoodMutation = useMutation({
    mutationFn: async (moodData) => {
      const created = await base44.entities.SoulLinkMoodEntry.create(moodData);

      // Award points for mood check-in
      try {
        const pointsResult = await awardPoints({
          activity_type: 'mood_check_in',
          activity_data: { mood_id: created.id }
        });

        if (pointsResult.data.success) {
          setPointsNotification(pointsResult.data);
          queryClient.invalidateQueries({ queryKey: ['user'] });
        }
      } catch (error) {
        console.error('Error awarding points:', error);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soulLinkMoodHistory'] });
      toast.success('Mood logged! 💜');
      setShowRecommendation(true); // Preserve existing functionality

      // Reset form state
      setSelectedMood(null);
      setMoodRating([5]);
      setEnergyLevel([5]);
      setStressLevel([5]);
      setSelectedTags([]);
      setContextNote('');
    },
    onError: (error) => {
      console.error('Failed to save mood:', error);
      toast.error('Failed to save mood entry');
    }
  });

  const handleSaveMood = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    const moodData = {
      mood_rating: moodRating[0],
      mood_label: selectedMood.value,
      mood_emoji: selectedMood.emoji,
      energy_level: energyLevel[0],
      stress_level: stressLevel[0],
      emotional_tags: selectedTags,
      context_note: contextNote
    };

    // Generate AI insight and recommendation
    try {
      const insightPrompt = `User logged mood: ${selectedMood.label} (${moodRating[0]}/10)
Energy: ${energyLevel[0]}/10, Stress: ${stressLevel[0]}/10
Tags: ${selectedTags.join(', ')}
${contextNote ? `Note: ${contextNote}` : ''}

Provide:
1. A brief, compassionate insight (1 sentence)
2. A personalized recommendation (meditation, affirmation, breathing, activity, or reflection)

Return as JSON:
{
  "insight": "brief insight",
  "recommendation_type": "meditation|affirmation|breathing|activity|reflection",
  "recommendation_content": "specific recommendation"
}`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: insightPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            insight: { type: "string" },
            recommendation_type: { type: "string" },
            recommendation_content: { type: "string" }
          }
        }
      });

      moodData.ai_insight = aiResponse.insight;
      moodData.recommendation_given = {
        type: aiResponse.recommendation_type,
        content: aiResponse.recommendation_content,
        accepted: false
      };

    } catch (error) {
      console.error('AI insight error:', error);
    }

    await saveMoodMutation.mutateAsync(moodData);
    // The form reset and setShowRecommendation are now handled in saveMoodMutation's onSuccess.
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Prepare trend data
  const trendData = prepareTrendData(moodHistory);
  const moodInsights = analyzeMoodTrends(moodHistory);

  return (
    <div className="space-y-6">
      {/* Points Notification with Share */}
      {pointsNotification && (
        <PointsNotification
          points={pointsNotification.points_earned}
          breakdown={pointsNotification.breakdown}
          leveledUp={pointsNotification.leveled_up}
          newLevel={pointsNotification.new_level}
          achievements={pointsNotification.achievements_earned}
          onClose={() => setPointsNotification(null)}
          onShare={(data) => {
            setShareData(data);
            setShareModalOpen(true);
          }}
        />
      )}

      {/* Health Insights Alert */}
      {healthInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-1">
                  New Health Insights Available!
                </h4>
                <p className="text-sm text-green-800 mb-2">
                  {healthInsights[0].title}
                </p>
                <Button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('switchToHealthTab'));
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  View Insights →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Check-In Card */}
      <Card className="bg-white/80 backdrop-blur-lg shadow-xl border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600" />
            How are you feeling right now?
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Select your mood
            </label>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedMood?.value === mood.value
                      ? `border-purple-500 bg-purple-50`
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-3xl block mb-1">{mood.emoji}</span>
                  <span className="text-xs text-gray-700">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Smile className="w-4 h-4" />
                  Mood Intensity
                </label>
                <span className="text-lg font-bold text-purple-600">{moodRating[0]}/10</span>
              </div>
              <Slider
                value={moodRating}
                onValueChange={setMoodRating}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Energy Level
                </label>
                <span className="text-lg font-bold text-blue-600">{energyLevel[0]}/10</span>
              </div>
              <Slider
                value={energyLevel}
                onValueChange={setEnergyLevel}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Stress Level
                </label>
                <span className="text-lg font-bold text-orange-600">{stressLevel[0]}/10</span>
              </div>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </div>

          {/* Emotional Tags */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              What else are you feeling? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {emotionalTags.map(tag => (
                <Badge
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Context Note */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              What's influencing how you feel? (optional)
            </label>
            <Textarea
              value={contextNote}
              onChange={(e) => setContextNote(e.target.value)}
              placeholder="E.g., 'Had a difficult conversation' or 'Beautiful weather today'"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveMood}
            disabled={!selectedMood || saveMoodMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
          >
            <Heart className="w-5 h-5 mr-2" />
            Log Mood & Get Personalized Support
          </Button>
        </CardContent>
      </Card>

      {/* Mood Trends */}
      {moodHistory.length > 0 && (
        <>
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Your Mood Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 10]} stroke="#888" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#moodGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mood Insights */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Your Mood Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {moodInsights.trend === 'improving' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : moodInsights.trend === 'declining' ? (
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Activity className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-semibold text-gray-900">7-Day Trend</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {moodInsights.trend === 'improving' && 'Your mood has been improving! Keep going! 🌟'}
                    {moodInsights.trend === 'declining' && 'Things have been challenging. Be gentle with yourself 💜'}
                    {moodInsights.trend === 'stable' && 'Your mood has been relatively stable'}
                  </p>
                </div>

                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <span className="font-semibold text-gray-900">Average Mood</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">
                    {moodInsights.averageMood.toFixed(1)}/10
                  </p>
                </div>
              </div>

              {moodInsights.mostCommonMood && (
                <div className="bg-white/60 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Most frequent mood:</strong> {moodInsights.mostCommonMood.emoji} {moodInsights.mostCommonMood.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    You've felt {moodInsights.mostCommonMood.label.toLowerCase()} most often this week
                  </p>
                </div>
              )}

              {moodInsights.needsSupport && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <p className="font-semibold text-orange-900">Gentle Check-In</p>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    I've noticed you've been struggling lately. Would you like to talk about it?
                  </p>
                  <Button
                    onClick={() => {/* Navigate to chat */}}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Talk to {settings?.companion_name || 'SoulLink'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Personalized Recommendation */}
      <AnimatePresence>
        {showRecommendation && moodHistory[0]?.recommendation_given && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Personalized for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {moodHistory[0].ai_insight && (
                  <p className="text-gray-800 leading-relaxed italic">
                    "{moodHistory[0].ai_insight}"
                  </p>
                )}

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-blue-600">
                      {moodHistory[0].recommendation_given.type}
                    </Badge>
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    {moodHistory[0].recommendation_given.content}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowRecommendation(false);
                      toast.success('Great! Take your time with this 🌟');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    I'll Try This
                  </Button>
                  <Button
                    onClick={() => setShowRecommendation(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareType={shareData?.type}
        shareData={shareData}
      />
    </div>
  );
}

function prepareTrendData(moodHistory) {
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MM/dd');

    const entriesForDay = moodHistory.filter(entry => {
      const entryDate = startOfDay(new Date(entry.created_date));
      return entryDate.getTime() === startOfDay(date).getTime();
    });

    const avgMood = entriesForDay.length > 0
      ? entriesForDay.reduce((sum, e) => sum + e.mood_rating, 0) / entriesForDay.length
      : null;

    last7Days.push({
      date: dateStr,
      mood: avgMood,
      energy: entriesForDay.length > 0
        ? entriesForDay.reduce((sum, e) => sum + (e.energy_level || 5), 0) / entriesForDay.length
        : null
    });
  }

  return last7Days;
}

function analyzeMoodTrends(moodHistory) {
  if (moodHistory.length === 0) {
    return {
      averageMood: 5,
      trend: 'stable',
      mostCommonMood: null,
      needsSupport: false
    };
  }

  const recent7Days = moodHistory.filter(entry => {
    const daysDiff = (Date.now() - new Date(entry.created_date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  const avgMood = recent7Days.reduce((sum, e) => sum + e.mood_rating, 0) / recent7Days.length;

  // Calculate trend
  const firstHalf = recent7Days.slice(Math.ceil(recent7Days.length / 2));
  const secondHalf = recent7Days.slice(0, Math.ceil(recent7Days.length / 2));

  const avgFirstHalf = firstHalf.length > 0
    ? firstHalf.reduce((sum, e) => sum + e.mood_rating, 0) / firstHalf.length
    : avgMood;
  const avgSecondHalf = secondHalf.length > 0
    ? secondHalf.reduce((sum, e) => sum + e.mood_rating, 0) / secondHalf.length
    : avgMood;

  let trend = 'stable';
  if (avgSecondHalf - avgFirstHalf > 1) trend = 'improving';
  if (avgFirstHalf - avgSecondHalf > 1) trend = 'declining';

  // Most common mood
  const moodCounts = {};
  recent7Days.forEach(entry => {
    moodCounts[entry.mood_label] = (moodCounts[entry.mood_label] || 0) + 1;
  });

  const mostCommonLabel = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];
  const mostCommonMood = moodOptions.find(m => m.value === mostCommonLabel);

  // Check if needs support
  const recentLowMoods = recent7Days.filter(e => e.mood_rating <= 4).length;
  const needsSupport = recentLowMoods >= 3 || avgMood < 4;

  return {
    averageMood: avgMood,
    trend,
    mostCommonMood,
    needsSupport
  };
}
