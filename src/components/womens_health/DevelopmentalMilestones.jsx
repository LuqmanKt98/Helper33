import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Baby, Sparkles, Brain, Calendar, CheckCircle, Clock, 
  TrendingUp, Star, Lightbulb, AlertCircle, RefreshCw,
  Heart, Smile, Eye, Hand, Footprints, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, format } from 'date-fns';

export default function DevelopmentalMilestones({ pregnancyData, trackingMode = 'baby' }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [milestoneInsights, setMilestoneInsights] = useState(null);
  const [selectedBaby, setSelectedBaby] = useState('all');

  const babies = pregnancyData?.babies || [];
  const isMultipleBirth = pregnancyData?.is_multiple_birth && babies.length > 0;
  const currentBaby = selectedBaby === 'all' ? null : babies.find(b => b.baby_id === selectedBaby);
  
  const birthDate = currentBaby?.birth_date || pregnancyData?.birth_date;
  const babyName = currentBaby?.baby_name || pregnancyData?.baby_name || 'Baby';
  const babyAgeInDays = birthDate ? differenceInDays(new Date(), new Date(birthDate)) : 0;
  const babyAgeInWeeks = Math.floor(babyAgeInDays / 7);
  const babyAgeInMonths = Math.floor(babyAgeInDays / 30);

  // For pregnancy mode
  const currentWeek = pregnancyData?.current_week || 0;
  const dueDate = pregnancyData?.due_date;

  // Fetch baby care data for AI analysis
  const { data: recentFeedings = [] } = useQuery({
    queryKey: ['milestone-feedings', selectedBaby],
    queryFn: async () => {
      const logs = await base44.entities.BabyFeedLog.list('-start_time', 100);
      return selectedBaby === 'all' ? logs : logs.filter(l => l.baby_id === selectedBaby);
    },
    enabled: trackingMode === 'baby'
  });

  const { data: recentSleep = [] } = useQuery({
    queryKey: ['milestone-sleep', selectedBaby],
    queryFn: async () => {
      const logs = await base44.entities.BabySleepLog.list('-sleep_start', 100);
      return selectedBaby === 'all' ? logs : logs.filter(l => l.baby_id === selectedBaby);
    },
    enabled: trackingMode === 'baby'
  });

  const { data: recentDiapers = [] } = useQuery({
    queryKey: ['milestone-diapers', selectedBaby],
    queryFn: async () => {
      const logs = await base44.entities.DiaperLog.list('-change_time', 100);
      return selectedBaby === 'all' ? logs : logs.filter(l => l.baby_id === selectedBaby);
    },
    enabled: trackingMode === 'baby'
  });

  const generateMilestoneInsights = async () => {
    setIsGenerating(true);

    try {
      let prompt = '';

      if (trackingMode === 'pregnancy') {
        prompt = `You are an expert prenatal development specialist. Analyze the pregnancy stage and provide milestone insights.

PREGNANCY INFORMATION:
- Current Week: ${currentWeek}
- Due Date: ${dueDate ? format(new Date(dueDate), 'MMMM d, yyyy') : 'Not set'}
- Trimester: ${currentWeek <= 12 ? 'First' : currentWeek <= 26 ? 'Second' : 'Third'}

Provide insights about:
1. **Current Developmental Milestones**: What's happening with the baby RIGHT NOW at week ${currentWeek}
2. **Next Major Milestones**: What developmental stages are coming in the next 4 weeks (be specific about weeks)
3. **Pregnancy Milestones for Mom**: What physical/emotional changes to expect soon
4. **Preparation Tips**: What to start preparing for or thinking about
5. **When to Celebrate**: Upcoming pregnancy milestones to look forward to (viability, movement, third trimester, full term, etc.)

Format as JSON with keys: current_milestones (array), upcoming_milestones (array with 'week' and 'milestone' and 'description'), mom_milestones (array), preparation_tips (array), celebration_moments (array with 'week' and 'moment').`;
      } else {
        // Baby/postpartum mode
        const feedingPattern = recentFeedings.length > 0
          ? `${(recentFeedings.length / 7).toFixed(1)} feeds/day, types: ${recentFeedings.map(f => f.feed_type).slice(0, 3).join(', ')}`
          : 'No feeding data logged yet';

        const sleepPattern = recentSleep.length > 0
          ? `${(recentSleep.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 7 / 60).toFixed(1)} hrs/day average`
          : 'No sleep data logged yet';

        prompt = `You are an expert pediatric developmental specialist. Analyze the baby's age and logged care data to predict and highlight developmental milestones.

BABY INFORMATION:
- Name: ${babyName}
- Age: ${babyAgeInWeeks} weeks (${babyAgeInMonths} months, ${babyAgeInDays} days)
${isMultipleBirth ? `- Part of ${babies.length} multiples` : ''}

CARE DATA (Last 7 Days):
- Feeding Pattern: ${feedingPattern}
- Sleep Pattern: ${sleepPattern}
- Total Feedings Logged: ${recentFeedings.length}
- Total Sleep Sessions: ${recentSleep.length}
- Total Diaper Changes: ${recentDiapers.length}

Based on this baby's age and development, provide:

1. **Current Age Milestones**: What developmental milestones are typical at ${babyAgeInWeeks} weeks (be specific - physical, cognitive, social)
2. **Likely Next Milestones**: What to watch for in the next 2-4 weeks with SPECIFIC age predictions (e.g., "Around 8 weeks: First social smile")
3. **Personalized Observations**: Based on the logged data, any patterns that align with or indicate early/late milestone achievement
4. **How to Support Development**: 4-5 specific activities parents can do RIGHT NOW to support upcoming milestones
5. **Red Flags to Monitor**: What developmental delays to watch for at this age (when to consult pediatrician)
6. **Celebration Moments**: Upcoming exciting milestones to look forward to

Format as JSON with keys: current_milestones (array of {milestone, age_range, description}), 
upcoming_milestones (array of {milestone, expected_week, expected_age_range, what_to_watch}),
personalized_observations (array),
support_activities (array),
red_flags (array),
celebration_moments (array of {milestone, estimated_week})`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: trackingMode === 'pregnancy' ? {
            current_milestones: { type: 'array', items: { type: 'string' } },
            upcoming_milestones: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  week: { type: 'number' },
                  milestone: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            mom_milestones: { type: 'array', items: { type: 'string' } },
            preparation_tips: { type: 'array', items: { type: 'string' } },
            celebration_moments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  week: { type: 'number' },
                  moment: { type: 'string' }
                }
              }
            }
          } : {
            current_milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  milestone: { type: 'string' },
                  age_range: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            upcoming_milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  milestone: { type: 'string' },
                  expected_week: { type: 'number' },
                  expected_age_range: { type: 'string' },
                  what_to_watch: { type: 'string' }
                }
              }
            },
            personalized_observations: { type: 'array', items: { type: 'string' } },
            support_activities: { type: 'array', items: { type: 'string' } },
            red_flags: { type: 'array', items: { type: 'string' } },
            celebration_moments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  milestone: { type: 'string' },
                  estimated_week: { type: 'number' }
                }
              }
            }
          }
        }
      });

      setMilestoneInsights(response);
    } catch (error) {
      console.error('Error generating milestone insights:', error);
      setMilestoneInsights(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const getMilestoneIcon = (milestone) => {
    const lowerMilestone = milestone.toLowerCase();
    if (lowerMilestone.includes('smile') || lowerMilestone.includes('social')) return Smile;
    if (lowerMilestone.includes('vision') || lowerMilestone.includes('eye') || lowerMilestone.includes('see')) return Eye;
    if (lowerMilestone.includes('hand') || lowerMilestone.includes('grasp') || lowerMilestone.includes('reach')) return Hand;
    if (lowerMilestone.includes('roll') || lowerMilestone.includes('sit') || lowerMilestone.includes('crawl') || lowerMilestone.includes('walk')) return Footprints;
    if (lowerMilestone.includes('coo') || lowerMilestone.includes('babble') || lowerMilestone.includes('word')) return MessageCircle;
    return Star;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-300 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-6 h-6 text-blue-600" />
            {trackingMode === 'pregnancy' 
              ? `Week ${currentWeek} Developmental Milestones`
              : `${babyName}'s Developmental Milestones`
            }
          </CardTitle>
          <Button
            onClick={generateMilestoneInsights}
            disabled={isGenerating}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                AI Milestone Analysis
              </>
            )}
          </Button>
        </div>
        {trackingMode === 'baby' && (
          <p className="text-sm text-gray-600 mt-2">
            {babyName} is {babyAgeInWeeks} weeks old ({babyAgeInMonths} months) • Personalized developmental insights
          </p>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!milestoneInsights && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Baby className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Discover {trackingMode === 'pregnancy' ? 'Your Baby\'s' : `${babyName}'s`} Developmental Journey
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Our AI will analyze {trackingMode === 'pregnancy' ? 'your pregnancy stage' : 'your baby\'s age and care data'} to 
                predict upcoming milestones and provide personalized guidance for each developmental stage.
              </p>
              <Button
                onClick={generateMilestoneInsights}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Milestone Predictions
              </Button>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Analyzing Developmental Patterns...
              </h3>
              <p className="text-gray-600">
                Reviewing {trackingMode === 'pregnancy' ? 'pregnancy stage' : 'care data'} to predict milestones and create personalized guidance
              </p>
            </motion.div>
          )}

          {milestoneInsights && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Current Milestones */}
              {trackingMode === 'pregnancy' ? (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <Baby className="w-6 h-6 text-blue-600" />
                    What's Happening Now (Week {currentWeek})
                  </h3>
                  <div className="space-y-2">
                    {milestoneInsights.current_milestones?.map((milestone, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4 border-2 border-blue-300"
                      >
                        <p className="text-sm text-gray-800 flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          {milestone}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Current Developmental Stage ({babyAgeInWeeks} Weeks)
                  </h3>
                  <div className="space-y-3">
                    {milestoneInsights.current_milestones?.map((item, index) => {
                      const Icon = getMilestoneIcon(item.milestone);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-bold text-gray-900 mb-1">{item.milestone}</p>
                              <p className="text-xs text-gray-600 mb-2">Typical: {item.age_range}</p>
                              <p className="text-sm text-gray-700">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Milestones Timeline */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  Upcoming Milestones
                </h3>
                <div className="space-y-4">
                  {milestoneInsights.upcoming_milestones?.map((item, index) => {
                    const Icon = trackingMode === 'pregnancy' ? Star : getMilestoneIcon(item.milestone);
                    const weekNumber = trackingMode === 'pregnancy' ? item.week : item.expected_week;
                    const weeksAway = weekNumber - (trackingMode === 'pregnancy' ? currentWeek : babyAgeInWeeks);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-8 pb-4 border-l-4 border-purple-300"
                      >
                        <div className="absolute left-0 top-0 -ml-3 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-bold text-gray-900">{item.milestone}</p>
                            <Badge className="bg-purple-100 text-purple-700">
                              {trackingMode === 'pregnancy' ? `Week ${weekNumber}` : item.expected_age_range || `Week ${weekNumber}`}
                            </Badge>
                          </div>
                          {weeksAway > 0 && (
                            <p className="text-xs text-purple-600 mb-2">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Expected in ~{weeksAway} {weeksAway === 1 ? 'week' : 'weeks'}
                            </p>
                          )}
                          <p className="text-sm text-gray-700">
                            {trackingMode === 'pregnancy' ? item.description : item.what_to_watch}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Personalized Observations (Baby mode only) */}
              {trackingMode === 'baby' && milestoneInsights.personalized_observations?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <Sparkles className="w-6 h-6 text-pink-600" />
                    Personalized Insights Based on {babyName}'s Data
                  </h3>
                  <div className="space-y-2">
                    {milestoneInsights.personalized_observations.map((observation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border-2 border-pink-200"
                      >
                        <p className="text-sm text-gray-800 flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                          {observation}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Activities */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  {trackingMode === 'pregnancy' ? 'Preparation Tips' : 'How to Support Development'}
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {(trackingMode === 'pregnancy' 
                    ? milestoneInsights.preparation_tips 
                    : milestoneInsights.support_activities
                  )?.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-4 border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm text-gray-800 flex items-start gap-2">
                        <span className="text-yellow-500 font-bold">💡</span>
                        {tip}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mom Milestones (Pregnancy mode) */}
              {trackingMode === 'pregnancy' && milestoneInsights.mom_milestones?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <Heart className="w-6 h-6 text-pink-600" />
                    What to Expect for You (Mom)
                  </h3>
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border-2 border-pink-200 space-y-2">
                    {milestoneInsights.mom_milestones.map((milestone, index) => (
                      <p key={index} className="text-sm text-gray-800">
                        • {milestone}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags (Baby mode only) */}
              {trackingMode === 'baby' && milestoneInsights.red_flags?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    When to Consult Your Pediatrician
                  </h3>
                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-300 space-y-2">
                    <p className="text-sm text-red-900 font-semibold mb-3">
                      Contact your pediatrician if you notice:
                    </p>
                    {milestoneInsights.red_flags.map((flag, index) => (
                      <p key={index} className="text-sm text-red-800">
                        • {flag}
                      </p>
                    ))}
                    <p className="text-xs text-red-700 mt-3 italic">
                      Every baby develops at their own pace, but these signs warrant professional evaluation.
                    </p>
                  </div>
                </div>
              )}

              {/* Celebration Moments */}
              {milestoneInsights.celebration_moments?.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                    Exciting Milestones Coming Up!
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {milestoneInsights.celebration_moments.map((item, index) => {
                      const weekNumber = trackingMode === 'pregnancy' ? item.week : item.estimated_week;
                      const weeksAway = weekNumber - (trackingMode === 'pregnancy' ? currentWeek : babyAgeInWeeks);
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border-2 border-yellow-300"
                        >
                          <div className="flex items-start gap-2">
                            <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-gray-900 mb-1">
                                {trackingMode === 'pregnancy' ? item.moment : item.milestone}
                              </p>
                              <p className="text-xs text-yellow-800">
                                {weeksAway > 0 
                                  ? `Around week ${weekNumber} (~${weeksAway} weeks away)`
                                  : weekNumber === (trackingMode === 'pregnancy' ? currentWeek : babyAgeInWeeks)
                                  ? 'Could happen this week! 🎉'
                                  : `Around week ${weekNumber}`
                                }
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <div className="flex justify-center pt-4 border-t-2 border-gray-200">
                <Button
                  onClick={generateMilestoneInsights}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <p className="text-xs text-blue-900">
            <Brain className="w-4 h-4 inline mr-1" />
            <strong>Note:</strong> Milestone predictions are based on typical development ranges. 
            Every baby develops at their own unique pace. Always consult your pediatrician with specific concerns 
            or questions about your baby's development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}