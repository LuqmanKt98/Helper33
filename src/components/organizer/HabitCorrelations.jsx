import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { HabitCompletion, Task, UserActivity } from "@/entities/all";

export default function HabitCorrelations({ habits, onRefresh }) {
  const [correlations, setCorrelations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (habits.length > 0) {
      analyzeCorrelations();
    }
  }, [habits]);

  const analyzeCorrelations = async () => {
    setIsLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [allCompletions, allTasks, allActivities] = await Promise.all([
        HabitCompletion.list('-created_date', 200),
        Task.list('-updated_date', 200),
        UserActivity.list('-created_date', 500)
      ]);

      const correlationData = [];

      for (const habit of habits) {
        const habitCompletions = allCompletions.filter(c => c.habit_id === habit.id);
        const completionDates = new Set(habitCompletions.map(c => c.completion_date));

        // Count tasks completed on days with habit vs without
        const tasksOnHabitDays = allTasks.filter(t => 
          t.status === 'completed' && 
          t.updated_date &&
          completionDates.has(new Date(t.updated_date).toISOString().split('T')[0])
        ).length;

        const completedTasks = allTasks.filter(t => t.status === 'completed' && t.updated_date);
        const tasksOnNonHabitDays = completedTasks.filter(t => 
          !completionDates.has(new Date(t.updated_date).toISOString().split('T')[0])
        ).length;

        const habitDayCount = completionDates.size;
        const nonHabitDayCount = Math.max(1, 30 - habitDayCount);

        const avgTasksWithHabit = habitDayCount > 0 ? tasksOnHabitDays / habitDayCount : 0;
        const avgTasksWithoutHabit = tasksOnNonHabitDays / nonHabitDayCount;

        const impactPercentage = avgTasksWithoutHabit > 0 
          ? ((avgTasksWithHabit - avgTasksWithoutHabit) / avgTasksWithoutHabit) * 100
          : 0;

        // Analyze mood impact
        const habitActivities = allActivities.filter(a => 
          a.related_entity_type === 'HabitCompletion' &&
          a.mood_after
        );

        const positiveMoods = habitActivities.filter(a => 
          ['energized', 'calm', 'focused', 'proud', 'grateful', 'relaxed'].includes(a.mood_after)
        ).length;

        const moodImpact = habitActivities.length > 0 
          ? (positiveMoods / habitActivities.length) * 100
          : 0;

        correlationData.push({
          habit,
          avgTasksWithHabit,
          avgTasksWithoutHabit,
          impactPercentage,
          moodImpact,
          totalCompletions: habitCompletions.length,
          consistencyScore: (habitCompletions.length / 30) * 100
        });
      }

      setCorrelations(correlationData.sort((a, b) => Math.abs(b.impactPercentage) - Math.abs(a.impactPercentage)));
    } catch (error) {
      console.error("Error analyzing correlations:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing habit impact...</p>
        </CardContent>
      </Card>
    );
  }

  if (correlations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-700 mb-2">
            No Correlation Data Yet
          </h4>
          <p className="text-sm text-gray-600">
            Complete habits for a few weeks to see their impact on your productivity!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-800 mb-2">
            📊 Habit Impact Analysis
          </h3>
          <p className="text-sm text-gray-600">
            See how your habits correlate with task completion and overall wellbeing
          </p>
        </CardContent>
      </Card>

      {correlations.map((correlation) => (
        <Card key={correlation.habit.id} className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {correlation.habit.habit_name}
              {correlation.impactPercentage > 0 ? (
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Positive Impact
                </Badge>
              ) : correlation.impactPercentage < 0 ? (
                <Badge className="bg-orange-100 text-orange-700">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Needs Review
                </Badge>
              ) : (
                <Badge variant="outline">
                  Neutral
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Task Completion Correlation */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Task Completion Impact</span>
                <span className="font-semibold text-gray-800">
                  {correlation.impactPercentage > 0 ? '+' : ''}{Math.round(correlation.impactPercentage)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-green-50 rounded p-2">
                  <div className="text-green-700 font-semibold">
                    With Habit
                  </div>
                  <div className="text-green-900 text-lg font-bold">
                    {correlation.avgTasksWithHabit.toFixed(1)}
                  </div>
                  <div className="text-green-600">tasks/day</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-700 font-semibold">
                    Without Habit
                  </div>
                  <div className="text-gray-900 text-lg font-bold">
                    {correlation.avgTasksWithoutHabit.toFixed(1)}
                  </div>
                  <div className="text-gray-600">tasks/day</div>
                </div>
              </div>
            </div>

            {/* Mood Impact */}
            {correlation.moodImpact > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Positive Mood After</span>
                  <span className="font-semibold text-gray-800">
                    {Math.round(correlation.moodImpact)}%
                  </span>
                </div>
                <Progress value={correlation.moodImpact} className="h-2" />
              </div>
            )}

            {/* Consistency Score */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">30-Day Consistency</span>
                <span className="font-semibold text-gray-800">
                  {Math.round(correlation.consistencyScore)}%
                </span>
              </div>
              <Progress value={correlation.consistencyScore} className="h-2" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
              <span>{correlation.totalCompletions} completions</span>
              <span>•</span>
              <span>{correlation.habit.current_streak} day streak</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}