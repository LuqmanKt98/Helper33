
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Calendar,
  Target,
  Flame,
  Award,
  Loader2,
  Sparkles,
  Heart,
  CheckCircle
} from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

import EnhancedAICoach from './EnhancedAICoach';

export default function ProgressDashboard({ coachType }) {
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['coachingGoals', coachType],
    queryFn: () => base44.entities.CoachingGoal.filter({ coach_type: coachType })
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['coachingSessions', coachType],
    queryFn: () => base44.entities.CoachingSession.filter({ coach_type: coachType }, '-created_date', 10)
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['coachingProgress', coachType],
    queryFn: () => base44.entities.CoachingProgress.filter({}, '-progress_date', 30)
  });

  if (goalsLoading) { // Changed to only check goalsLoading, as per outline removing isLoading for sessions and progress
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalProgress = goals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / (goals.length || 1);
  
  const last7Days = subDays(new Date(), 7);
  const recentSessions = sessions.filter(s => new Date(s.created_date) >= last7Days);
  
  const currentStreak = calculateStreak(sessions);

  function calculateStreak(sessions) {
    if (sessions.length === 0) return 0;
    
    const sortedDates = sessions
      .map(s => new Date(s.created_date).toISOString().split('T')[0])
      .sort()
      .reverse();
    
    const uniqueDates = [...new Set(sortedDates)];
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    
    for (const date of uniqueDates) {
      const diff = differenceInDays(new Date(checkDate), new Date(date));
      if (diff <= 1) {
        streak++;
        checkDate = date;
      } else {
        break;
      }
    }
    
    return streak;
  }

  const stats = [
    {
      label: 'Active Goals',
      value: activeGoals.length,
      icon: Target,
      gradient: 'from-blue-500 to-cyan-500',
      sublabel: `${completedGoals.length} completed`
    },
    {
      label: 'Average Progress',
      value: `${Math.round(totalProgress)}%`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      sublabel: 'Across all goals'
    },
    {
      label: 'Sessions This Week',
      value: recentSessions.length,
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
      sublabel: `${sessions.length} total`
    },
    {
      label: 'Current Streak',
      value: currentStreak,
      icon: Flame,
      gradient: 'from-orange-500 to-red-500',
      sublabel: currentStreak === 1 ? 'day' : 'days'
    }
  ];

  // Get most active goal for AI insights
  const mostActiveGoal = goals
    .filter(g => g.status === 'active')
    .sort((a, b) => (b.reflection_notes?.length || 0) - (a.reflection_notes?.length || 0))[0];

  return (
    <div className="space-y-6">
      {/* Show AI Insights for self-directed users */}
      {mostActiveGoal && !mostActiveGoal.has_human_coach && (
        <EnhancedAICoach 
          goal={mostActiveGoal} 
          userHistory={mostActiveGoal.reflection_notes || []} 
        />
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.sublabel}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Insights */}
      {progress.length > 0 && ( // Changed from progressEntries to progress
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Recent Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.slice(0, 5).map((entry, idx) => ( // Changed from progressEntries to progress
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    entry.progress_type === 'milestone_completed' ? 'bg-green-100' :
                    entry.progress_type === 'breakthrough' ? 'bg-purple-100' :
                    entry.progress_type === 'setback' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    {entry.progress_type === 'milestone_completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Heart className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(entry.progress_date), 'MMM d, yyyy')}
                    </p>
                    {entry.ai_encouragement && (
                      <p className="text-sm text-purple-600 mt-2 italic">
                        {entry.ai_encouragement}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {completedGoals.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {completedGoals.map(goal => (
                <Badge key={goal.id} className="bg-amber-100 text-amber-800 border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {goal.goal_title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
