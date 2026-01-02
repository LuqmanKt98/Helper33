import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Loader2,
  Clock,
  Moon,
  Star,
  Lightbulb,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { differenceInMinutes, format } from 'date-fns';
import { toast } from 'sonner';

const analyzeFeedingPatterns = (feeds) => {
  if (feeds.length < 2) return { insufficient_data: true };

  const intervals = [];
  for (let i = 1; i < feeds.length; i++) {
    const prev = new Date(feeds[i].start_time);
    const curr = new Date(feeds[i - 1].start_time);
    const diffMinutes = Math.abs(differenceInMinutes(curr, prev));
    intervals.push(diffMinutes);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const lastFeed = feeds[0];

  return {
    total_feeds: feeds.length,
    average_interval_minutes: Math.round(avgInterval),
    last_feed_time: format(new Date(lastFeed.start_time), 'h:mm a'),
    last_feed_type: lastFeed.feed_type,
    feeds_per_day: Math.round((feeds.length / 7) * 10) / 10
  };
};

const analyzeSleepPatterns = (sleepLogs) => {
  if (sleepLogs.length < 2) return { insufficient_data: true };

  const naps = sleepLogs.filter(s => s.sleep_type === 'nap');
  const nightSleep = sleepLogs.filter(s => s.sleep_type === 'night_sleep');

  const napTimes = naps.map(n => format(new Date(n.sleep_start), 'h:mm a'));
  const avgNapDuration = naps.length > 0
    ? naps.reduce((sum, n) => sum + (n.duration_minutes || 0), 0) / naps.length
    : 0;

  return {
    total_naps: naps.length,
    total_night_sleeps: nightSleep.length,
    average_nap_duration_minutes: Math.round(avgNapDuration),
    recent_nap_times: napTimes.slice(0, 5),
    naps_per_day: Math.round((naps.length / 7) * 10) / 10
  };
};

export default function AIBabyCareInsights({ pregnancyData, selectedBaby = 'all' }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const babies = pregnancyData?.babies || [];
  const activeBaby = selectedBaby === 'all' ? babies[0] : babies.find(b => b.baby_id === selectedBaby);
  const babyName = activeBaby?.baby_name || pregnancyData?.baby_name || 'Baby';

  const { data: recentFeeds = [] } = useQuery({
    queryKey: ['baby-feeds-recent', selectedBaby],
    queryFn: () => base44.entities.BabyFeedLog.list('-start_time', 50)
  });

  const { data: recentDiapers = [] } = useQuery({
    queryKey: ['baby-diapers-recent', selectedBaby],
    queryFn: () => base44.entities.DiaperLog.list('-change_time', 50)
  });

  const { data: recentSleep = [] } = useQuery({
    queryKey: ['baby-sleep-recent', selectedBaby],
    queryFn: () => base44.entities.BabySleepLog.list('-sleep_start', 50)
  });

  const generateInsights = async () => {
    setIsLoading(true);
    
    try {
      const babyFeeds = selectedBaby === 'all' 
        ? recentFeeds 
        : recentFeeds.filter(f => !f.baby_id || f.baby_id === selectedBaby);
      
      const babyDiapers = selectedBaby === 'all'
        ? recentDiapers
        : recentDiapers.filter(d => !d.baby_id || d.baby_id === selectedBaby);
      
      const babySleep = selectedBaby === 'all'
        ? recentSleep
        : recentSleep.filter(s => !s.baby_id || s.baby_id === selectedBaby);

      const feedingPatterns = analyzeFeedingPatterns(babyFeeds);
      const sleepPatterns = analyzeSleepPatterns(babySleep);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a pediatric care expert analyzing baby care data to provide helpful insights and predictions.

Baby Information:
- Name: ${babyName}
- Birth Date: ${pregnancyData?.birth_date}
- Current Age: ${pregnancyData?.postpartum_weeks} weeks

Recent Care Data (Last 7 Days):
- Total Feedings: ${babyFeeds.length}
- Total Diaper Changes: ${babyDiapers.length}
- Total Sleep Logs: ${babySleep.length}

Feeding Pattern Analysis:
${JSON.stringify(feedingPatterns, null, 2)}

Sleep Pattern Analysis:
${JSON.stringify(sleepPatterns, null, 2)}

Please provide:
1. Feeding predictions - when is baby likely to feed next based on patterns
2. Sleep predictions - typical nap times and night sleep schedule
3. Overall care insights - what's working well, any concerns
4. Personalized tips for parents based on the data
5. Milestone readiness - what developmental milestones to watch for at this age

Be warm, supportive, and specific. Include exact predicted times when possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            next_feeding_prediction: {
              type: "object",
              properties: {
                estimated_time: { type: "string" },
                confidence: { type: "string" },
                reason: { type: "string" }
              }
            },
            typical_feeding_times: {
              type: "array",
              items: { type: "string" }
            },
            sleep_predictions: {
              type: "object",
              properties: {
                typical_nap_times: { type: "array", items: { type: "string" } },
                typical_bedtime: { type: "string" },
                average_night_sleep_hours: { type: "number" }
              }
            },
            care_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  insight: { type: "string" },
                  sentiment: { type: "string", enum: ["positive", "neutral", "needs_attention"] }
                }
              }
            },
            personalized_tips: {
              type: "array",
              items: { type: "string" }
            },
            upcoming_milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  milestone: { type: "string" },
                  typical_age: { type: "string" },
                  signs_to_watch: { type: "string" }
                }
              }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          AI Care Insights & Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!insights ? (
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Baby Care Predictions</h3>
            <p className="text-gray-600 mb-6">
              Get AI-powered insights about {babyName}'s feeding schedule, sleep patterns, and upcoming milestones based on recent care data.
            </p>
            <Button
              onClick={generateInsights}
              disabled={isLoading || recentFeeds.length === 0}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Patterns...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
            {recentFeeds.length === 0 && (
              <p className="text-sm text-gray-500 mt-3">
                Log a few feedings and sleep sessions to enable predictions
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {insights.next_feeding_prediction && (
              <div className="p-4 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl border-2 border-pink-300">
                <h4 className="font-bold text-pink-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Next Feeding Prediction
                </h4>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-2xl font-bold text-pink-700 mb-2">
                    Around {insights.next_feeding_prediction.estimated_time}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    {insights.next_feeding_prediction.reason}
                  </p>
                  <Badge className="bg-pink-500 text-white">
                    Confidence: {insights.next_feeding_prediction.confidence}
                  </Badge>
                </div>
                
                {insights.typical_feeding_times && insights.typical_feeding_times.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-pink-900 mb-2">Typical Daily Schedule:</p>
                    <div className="flex flex-wrap gap-2">
                      {insights.typical_feeding_times.map((time, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {insights.sleep_predictions && (
              <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl border-2 border-purple-300">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  Sleep Patterns
                </h4>
                <div className="space-y-3">
                  {insights.sleep_predictions.typical_nap_times && insights.sleep_predictions.typical_nap_times.length > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Typical Nap Times:</p>
                      <div className="flex flex-wrap gap-2">
                        {insights.sleep_predictions.typical_nap_times.map((time, idx) => (
                          <Badge key={idx} className="bg-purple-500 text-white">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {insights.sleep_predictions.typical_bedtime && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-700">Usual Bedtime:</p>
                      <p className="text-lg font-bold text-purple-700">
                        {insights.sleep_predictions.typical_bedtime}
                      </p>
                    </div>
                  )}
                  {insights.sleep_predictions.average_night_sleep_hours && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-700">Avg Night Sleep:</p>
                      <p className="text-lg font-bold text-purple-700">
                        {insights.sleep_predictions.average_night_sleep_hours} hours
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {insights.care_insights && insights.care_insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Care Insights
                </h4>
                {insights.care_insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.sentiment === 'positive'
                        ? 'bg-green-50 border-green-500'
                        : insight.sentiment === 'needs_attention'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 mb-1 capitalize">
                      {insight.category}
                    </p>
                    <p className="text-sm text-gray-700">{insight.insight}</p>
                  </div>
                ))}
              </div>
            )}

            {insights.personalized_tips && insights.personalized_tips.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Personalized Tips
                </h4>
                {insights.personalized_tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {insights.upcoming_milestones && insights.upcoming_milestones.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Milestones to Watch For
                </h4>
                {insights.upcoming_milestones.map((milestone, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 mb-2">
                    <p className="font-semibold text-gray-900">{milestone.milestone}</p>
                    <p className="text-xs text-gray-600 mb-1">Typical age: {milestone.typical_age}</p>
                    <p className="text-sm text-gray-700">{milestone.signs_to_watch}</p>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={generateInsights}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}