import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  AlertCircle,
  Sparkles,
  Loader2,
  Users,
  Target
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function AIMoodInsights({ familyMembers = [] }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['familyMoodEntries'],
    queryFn: () => base44.entities.FamilyMoodEntry.list('-entry_date'),
    initialData: []
  });

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    
    try {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const recentMoods = moodEntries.filter(m => m.entry_date >= thirtyDaysAgo);

      const prompt = `You are a compassionate family wellness AI analyzing mood patterns.

Family Members:
${familyMembers.map(m => `- ${m.name} (${m.role}, age ${m.age || 'unknown'})`).join('\n')}

Recent Mood Entries (last 30 days):
${recentMoods.slice(0, 50).map(m => `${m.entry_date}: ${m.member_name} - ${m.mood} (${m.mood_rating}/10)${m.note ? ` - "${m.note}"` : ''}`).join('\n')}

Total entries: ${recentMoods.length}

Analyze the family's mood patterns and provide insights.`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_family_mood: { type: "string" },
            family_mood_trend: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            member_specific_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  member_name: { type: "string" },
                  mood_trend: { type: "string" },
                  average_mood_score: { type: "number" },
                  strengths: { type: "array", items: { type: "string" } },
                  areas_of_concern: { type: "array", items: { type: "string" } },
                  support_suggestions: { type: "array", items: { type: "string" } }
                }
              }
            },
            family_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern_type: { type: "string" },
                  description: { type: "string" },
                  frequency: { type: "string" },
                  impact_level: { type: "string" }
                }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  for_member: { type: "string" },
                  expected_benefit: { type: "string" }
                }
              }
            },
            celebrations: { type: "array", items: { type: "string" } },
            support_needed_for: { type: "array", items: { type: "string" } }
          }
        }
      });

      setInsights(aiResponse);
    } catch (error) {
      console.error('Error analyzing moods:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Heart className="w-5 h-5 text-blue-600" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'from-green-100 to-emerald-100 border-green-300';
    if (trend === 'declining') return 'from-red-100 to-rose-100 border-red-300';
    return 'from-blue-100 to-cyan-100 border-blue-300';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (moodEntries.length < 3) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 mb-2">AI Insights Coming Soon</h3>
          <p className="text-sm text-gray-600">
            Track a few more family moods to unlock AI-powered insights and patterns!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Family Mood Insights
          </CardTitle>
          <Button
            onClick={analyzeWithAI}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!insights ? (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600">
              Click "Generate Insights" to analyze your family's mood patterns with AI
            </p>
          </div>
        ) : (
          <>
            <div className={`p-6 rounded-xl border-2 bg-gradient-to-br ${getTrendColor(insights.family_mood_trend)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTrendIcon(insights.family_mood_trend)}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Overall: {insights.overall_family_mood}
                    </h3>
                    <p className="text-sm text-gray-700">
                      Trend: {insights.family_mood_trend}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                {insights.key_insights?.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-800">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {insights.member_specific_insights?.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Individual Member Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {insights.member_specific_insights.map((memberInsight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="bg-white/80 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900">{memberInsight.member_name}</h4>
                            <Badge variant="outline">
                              {memberInsight.average_mood_score?.toFixed(1)}/10
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(memberInsight.mood_trend)}
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {memberInsight.mood_trend}
                              </span>
                            </div>

                            {memberInsight.strengths?.length > 0 && (
                              <div className="bg-green-50 p-2 rounded-lg">
                                <p className="text-xs font-semibold text-green-800 mb-1">✅ Strengths:</p>
                                <ul className="text-xs text-green-700 space-y-1">
                                  {memberInsight.strengths.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {memberInsight.areas_of_concern?.length > 0 && (
                              <div className="bg-amber-50 p-2 rounded-lg">
                                <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Areas of Concern:</p>
                                <ul className="text-xs text-amber-700 space-y-1">
                                  {memberInsight.areas_of_concern.map((c, i) => (
                                    <li key={i}>• {c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {memberInsight.support_suggestions?.length > 0 && (
                              <div className="bg-blue-50 p-2 rounded-lg">
                                <p className="text-xs font-semibold text-blue-800 mb-1">💡 Suggestions:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                  {memberInsight.support_suggestions.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {insights.recommended_actions?.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Recommended Actions
                </h3>
                <div className="space-y-3">
                  {insights.recommended_actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-white border-2 border-purple-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getPriorityColor(action.priority)}>
                          {action.priority} priority
                        </Badge>
                        <span className="text-xs text-gray-500">For: {action.for_member}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-2">{action.action}</p>
                      <p className="text-xs text-gray-600">
                        <strong>Expected benefit:</strong> {action.expected_benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.celebrations?.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-xl border-2 border-yellow-300">
                <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  🎉 Celebrate Your Family!
                </h3>
                <ul className="space-y-2">
                  {insights.celebrations.map((celebration, idx) => (
                    <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                      <span className="text-lg">✨</span>
                      <span>{celebration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.support_needed_for?.length > 0 && (
              <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-6 rounded-xl border-2 border-rose-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-rose-900 mb-2">Extra Support Recommended</h3>
                    <p className="text-sm text-rose-800 mb-2">
                      These family members may benefit from additional attention:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {insights.support_needed_for.map((name, idx) => (
                        <Badge key={idx} className="bg-rose-500 text-white">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}