
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  Lightbulb,
  Clock,
  Heart,
  Zap,
  Target,
  CheckCircle2,
  Plus,
  BarChart3,
  Activity,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BehaviorPattern, UserActivity, HabitTracker as HabitEntity } from "@/entities/all";
import { analyzeUserBehavior } from "@/functions/analyzeUserBehavior";
import { useNotifications } from "@/components/SoundManager";

const patternIcons = {
  consistent_routine: Clock,
  time_preference: TrendingUp,
  category_trend: BarChart3,
  mood_trigger: Heart,
  productivity_peak: Zap,
  correlation: Activity
};

const patternColors = {
  consistent_routine: "from-blue-400 to-indigo-500",
  time_preference: "from-purple-400 to-pink-500",
  category_trend: "from-green-400 to-emerald-500",
  mood_trigger: "from-rose-400 to-pink-500",
  productivity_peak: "from-yellow-400 to-orange-500",
  correlation: "from-cyan-400 to-blue-500"
};

export default function BehaviorInsights({ className = "" }) {
  const { playSound, showNotification } = useNotifications();
  const [patterns, setPatterns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [activityStats, setActivityStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patternsData, activitiesData] = await Promise.all([
        BehaviorPattern.filter({ is_active: true }),
        UserActivity.list('-created_date', 100)
      ]);
      
      setPatterns(patternsData.sort((a, b) => b.confidence_score - a.confidence_score));
      setActivities(activitiesData);
      
      // Calculate activity stats
      const stats = calculateActivityStats(activitiesData);
      setActivityStats(stats);
    } catch (error) {
      console.error("Error loading behavior data:", error);
    }
  };

  const calculateActivityStats = (activities) => {
    const last7Days = activities.filter(a => {
      const activityDate = new Date(a.created_date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return activityDate >= sevenDaysAgo;
    });

    const byCategory = last7Days.reduce((acc, activity) => {
      acc[activity.activity_category] = (acc[activity.activity_category] || 0) + 1;
      return acc;
    }, {});

    const byTimeOfDay = last7Days.reduce((acc, activity) => {
      acc[activity.time_of_day] = (acc[activity.time_of_day] || 0) + 1;
      return acc;
    }, {});

    const totalTime = last7Days.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);

    return {
      totalActivities: last7Days.length,
      byCategory,
      byTimeOfDay,
      totalTimeMinutes: totalTime,
      averagePerDay: Math.round(last7Days.length / 7)
    };
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeUserBehavior();
      
      if (result.patterns && result.patterns.length > 0) {
        setPatterns(result.patterns);
        setLastAnalysis(new Date());
        playSound('success');
        showNotification('🧠 Behavior Analysis Complete', {
          body: `Discovered ${result.patterns.length} patterns in your activities`
        });
      } else {
        showNotification('📊 Keep Going', {
          body: 'Not enough data yet. Keep using DobryLife to discover patterns!'
        });
      }
    } catch (error) {
      console.error("Error analyzing behavior:", error);
      playSound('error');
    }
    setIsAnalyzing(false);
  };

  const createHabitFromPattern = async (pattern) => {
    try {
      const suggestedHabit = pattern.suggested_habit;
      
      await HabitEntity.create({
        habit_name: suggestedHabit.habit_name,
        description: suggestedHabit.description,
        category: suggestedHabit.category,
        frequency: suggestedHabit.frequency,
        target_count: 1,
        reward_points: Math.ceil(pattern.impact_score * 5),
        linked_task_categories: pattern.related_activities
      });

      await BehaviorPattern.update(pattern.id, {
        converted_to_habit: true
      });

      playSound('complete');
      showNotification('✨ Habit Created!', {
        body: `"${suggestedHabit.habit_name}" added to your habit tracker`
      });

      loadData();
    } catch (error) {
      console.error("Error creating habit from pattern:", error);
      playSound('error');
    }
  };

  const dismissPattern = async (patternId) => {
    try {
      await BehaviorPattern.update(patternId, { is_active: false });
      playSound('click');
      loadData();
    } catch (error) {
      console.error("Error dismissing pattern:", error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Analysis Button */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  🧠 Behavior Intelligence
                </h3>
                <p className="text-sm text-gray-600">
                  AI-powered insights from your daily activities
                </p>
              </div>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Patterns
                </>
              )}
            </Button>
          </div>

          {lastAnalysis && (
            <div className="mt-4 text-xs text-gray-600">
              Last analysis: {lastAnalysis.toLocaleDateString()} at {lastAnalysis.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Stats Dashboard */}
      {activityStats.totalActivities > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Last 7 Days Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {activityStats.totalActivities}
                </div>
                <div className="text-xs text-gray-600">Total Activities</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {activityStats.averagePerDay}
                </div>
                <div className="text-xs text-gray-600">Per Day Average</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">
                  {Object.keys(activityStats.byCategory).length}
                </div>
                <div className="text-xs text-gray-600">Categories</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-700">
                  {Math.round(activityStats.totalTimeMinutes / 60)}h
                </div>
                <div className="text-xs text-gray-600">Total Time</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Activity by Category</h4>
              {Object.entries(activityStats.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-gray-600 capitalize">{category}</div>
                  <Progress 
                    value={(count / activityStats.totalActivities) * 100} 
                    className="flex-1"
                  />
                  <div className="w-12 text-xs text-gray-600 text-right">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detected Patterns */}
      {patterns.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Detected Patterns & Habit Suggestions
          </h3>
          
          <AnimatePresence>
            {patterns.map((pattern, index) => {
              const Icon = patternIcons[pattern.pattern_type] || Target;
              const colorClass = patternColors[pattern.pattern_type];
              
              return (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {pattern.pattern_name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(pattern.confidence_score * 100)}% confidence
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {pattern.frequency}
                                </Badge>
                                {pattern.observation_count > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    Observed {pattern.observation_count}x
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">
                            {pattern.description}
                          </p>

                          {pattern.suggested_habit && !pattern.converted_to_habit && (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    <h5 className="font-semibold text-sm text-gray-800">
                                      Suggested Habit
                                    </h5>
                                  </div>
                                  <p className="font-semibold text-indigo-900 mb-1">
                                    {pattern.suggested_habit.habit_name}
                                  </p>
                                  <p className="text-xs text-gray-600 mb-3">
                                    {pattern.suggested_habit.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Badge className="bg-indigo-100 text-indigo-700">
                                      {pattern.suggested_habit.category}
                                    </Badge>
                                    <Badge className="bg-purple-100 text-purple-700 capitalize">
                                      {pattern.suggested_habit.frequency}
                                    </Badge>
                                    <span className="flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      Impact: {Math.round(pattern.impact_score)}/10
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => createHabitFromPattern(pattern)}
                                  size="sm"
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Create Habit
                                </Button>
                              </div>
                            </div>
                          )}

                          {pattern.converted_to_habit && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                              <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Converted to habit ✓
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {!pattern.converted_to_habit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissPattern(pattern.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            Dismiss
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-700 mb-2">
              No Patterns Detected Yet
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Keep using DobryLife! We need a bit more data to detect meaningful patterns in your activities.
            </p>
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              variant="outline"
            >
              <Brain className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-cyan-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong>How it works:</strong> DobryLife monitors all your activities—tasks completed, 
              wellness check-ins, journal entries, games played, and more. Our AI identifies patterns 
              and suggests habits that align with your natural rhythms and behaviors. The more you use 
              the app, the smarter the suggestions become!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
