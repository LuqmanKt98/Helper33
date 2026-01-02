import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Brain,
  Calendar,
  CheckCircle,
  Loader2,
  TrendingUp,
  Target,
  Zap,
  Heart,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { generateWellnessPlan } from '@/functions/generateWellnessPlan';
import PlanSuggestionCard from '@/components/wellness/PlanSuggestionCard';

export default function WellnessPlans() {
  const [activeTab, setActiveTab] = useState('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('weekly');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: activePlans = [] } = useQuery({
    queryKey: ['wellness-plans-active'],
    queryFn: () => base44.entities.WellnessPlan.filter({ status: 'active' }, '-generated_for_date')
  });

  const { data: archivedPlans = [] } = useQuery({
    queryKey: ['wellness-plans-archived'],
    queryFn: () => base44.entities.WellnessPlan.filter({ status: 'archived' }, '-generated_for_date')
  });

  const { data: allSuggestions = [] } = useQuery({
    queryKey: ['wellness-plan-suggestions'],
    queryFn: () => base44.entities.WellnessPlanSuggestion.list('-created_date')
  });

  const stats = user?.gamification_stats || {};

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const response = await generateWellnessPlan({ plan_type: selectedPlanType });
      
      if (response.data.success) {
        queryClient.invalidateQueries(['wellness-plans-active']);
        queryClient.invalidateQueries(['wellness-plan-suggestions']);
        toast.success('Your personalized wellness plan is ready! ✨');
        setActiveTab('current');
      } else {
        throw new Error('Plan generation failed');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPlan = activePlans[0];
  const currentSuggestions = currentPlan 
    ? allSuggestions.filter(s => s.plan_id === currentPlan.id)
    : [];

  const pendingSuggestions = currentSuggestions.filter(s => s.status === 'pending');
  const acceptedSuggestions = currentSuggestions.filter(s => s.status === 'accepted' || s.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Your Personalized Wellness Plan
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            AI-powered recommendations based on your progress, mood, and goals
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">Level {stats.level || 1}</p>
                  <p className="text-xs text-gray-600">Your Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.current_streak || 0}</p>
                  <p className="text-xs text-gray-600">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{activePlans.length}</p>
                  <p className="text-xs text-gray-600">Active Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-pink-600" />
                <div>
                  <p className="text-2xl font-bold text-pink-600">
                    {currentPlan ? acceptedSuggestions.length : 0}
                  </p>
                  <p className="text-xs text-gray-600">Accepted Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Plan Section */}
        {!currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-300 shadow-xl mb-8">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready for Your Personalized Plan?
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Our AI will analyze your progress, mood patterns, and goals to create
                  a tailored wellness plan just for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                  <label className="text-sm font-semibold text-gray-700">Plan Duration:</label>
                  <div className="flex gap-2">
                    {['daily', 'weekly', 'custom'].map((type) => (
                      <Button
                        key={type}
                        onClick={() => setSelectedPlanType(type)}
                        variant={selectedPlanType === type ? 'default' : 'outline'}
                        size="sm"
                        className={selectedPlanType === type ? 'bg-purple-600' : ''}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Your Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate My Wellness Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current Plan */}
        {currentPlan && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="current">Current Plan</TabsTrigger>
              <TabsTrigger value="history">Plan History</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <div className="space-y-6">
                {/* Plan Overview */}
                <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Brain className="w-6 h-6" />
                        {currentPlan.plan_name}
                      </CardTitle>
                      <Button
                        onClick={handleGeneratePlan}
                        disabled={isGenerating}
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">AI Insights:</p>
                      <p className="text-gray-800">{currentPlan.ai_insights}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Focus Areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentPlan.focus_areas?.map((area, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-800">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {currentPlan.total_suggestions}
                        </p>
                        <p className="text-xs text-gray-600">Total Suggestions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {currentPlan.accepted_suggestions}
                        </p>
                        <p className="text-xs text-gray-600">Accepted</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">
                          {pendingSuggestions.length}
                        </p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Suggestions */}
                {pendingSuggestions.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      Suggested for You
                    </h2>
                    <div className="space-y-4">
                      {pendingSuggestions.map((suggestion, idx) => (
                        <PlanSuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          onUpdate={() => {
                            queryClient.invalidateQueries(['wellness-plan-suggestions']);
                            queryClient.invalidateQueries(['wellness-plans-active']);
                          }}
                          delay={idx * 0.05}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Suggestions */}
                {acceptedSuggestions.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      Your Active Tasks
                    </h2>
                    <div className="space-y-3">
                      {acceptedSuggestions.map((suggestion, idx) => (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900">{suggestion.title}</h3>
                                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                                </div>
                                {suggestion.status === 'completed' && (
                                  <Badge className="bg-green-600">Completed</Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingSuggestions.length === 0 && acceptedSuggestions.length === 0 && currentPlan && (
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        All suggestions reviewed!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Generate a new plan to continue your wellness journey.
                      </p>
                      <Button onClick={handleGeneratePlan} className="bg-purple-600">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate New Plan
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {archivedPlans.length > 0 ? (
                  archivedPlans.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border border-gray-300">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{plan.plan_name}</h3>
                              <p className="text-sm text-gray-600">
                                Generated {format(new Date(plan.generated_for_date), 'MMM d, yyyy')}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {plan.focus_areas?.map((area, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {plan.accepted_suggestions}/{plan.total_suggestions} accepted
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No Plan History Yet
                      </h3>
                      <p className="text-gray-600">
                        Your completed plans will appear here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}