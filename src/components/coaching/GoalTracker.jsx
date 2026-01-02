import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  CheckCircle,
  Circle,
  Calendar,
  Share2,
  Loader2,
  Flag,
  MoreVertical,
  Pause,
  Play,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function GoalTracker({ coachType }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['coachingGoals', coachType],
    queryFn: async () => {
      const allGoals = await base44.entities.CoachingGoal.filter({
        coach_type: coachType,
        status: { $in: ['active', 'paused'] }
      }, '-created_date');
      return allGoals;
    }
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['coachingProgress', selectedGoal?.id],
    queryFn: () => selectedGoal ? base44.entities.CoachingProgress.filter({ goal_id: selectedGoal.id }, '-progress_date') : [],
    enabled: !!selectedGoal
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }) => base44.entities.CoachingGoal.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingGoals']);
      toast.success('Goal updated! 🎯');
    }
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: async ({ goalId, milestoneIndex }) => {
      const goal = goals.find(g => g.id === goalId);
      const updatedMilestones = [...goal.milestones];
      updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;
      
      if (updatedMilestones[milestoneIndex].completed) {
        updatedMilestones[milestoneIndex].completed_date = new Date().toISOString().split('T')[0];
      } else {
        delete updatedMilestones[milestoneIndex].completed_date;
      }

      // Calculate progress percentage
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100);

      await base44.entities.CoachingGoal.update(goalId, {
        milestones: updatedMilestones,
        progress_percentage: progress
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingGoals']);
      toast.success('Progress updated! 🌟');
    }
  });

  const handleGoalAction = async (goalId, action) => {
    const updates = {};
    
    switch (action) {
      case 'pause':
        updates.status = 'paused';
        break;
      case 'resume':
        updates.status = 'active';
        break;
      case 'complete':
        updates.status = 'completed';
        updates.progress_percentage = 100;
        break;
      case 'archive':
        updates.status = 'archived';
        break;
    }

    updateGoalMutation.mutate({ id: goalId, updates });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const categoryColors = {
    emotional_healing: 'from-rose-400 to-pink-500',
    daily_functioning: 'from-blue-400 to-cyan-500',
    relationships: 'from-purple-400 to-pink-500',
    work_life: 'from-indigo-400 to-blue-500',
    self_care: 'from-emerald-400 to-teal-500',
    grief_processing: 'from-slate-400 to-gray-500',
    life_transitions: 'from-amber-400 to-orange-500',
    personal_growth: 'from-green-400 to-emerald-500',
    habit_building: 'from-cyan-400 to-blue-500'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Your Goals
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-900 mb-2">No goals yet</h4>
            <p className="text-gray-600 mb-6">
              Set your first coaching goal to start tracking your progress
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((goal, idx) => {
            const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
            const totalMilestones = goal.milestones?.length || 0;
            const hasOverdue = goal.target_date && new Date(goal.target_date) < new Date();

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-all cursor-pointer ${
                  selectedGoal?.id === goal.id ? 'ring-2 ring-purple-500' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                            categoryColors[goal.category] || 'from-gray-400 to-gray-500'
                          }`} />
                          <Badge variant="outline" className="text-xs">
                            {goal.category.replace('_', ' ')}
                          </Badge>
                          {goal.status === 'paused' && (
                            <Badge variant="secondary" className="text-xs">
                              <Pause className="w-3 h-3 mr-1" />
                              Paused
                            </Badge>
                          )}
                          {hasOverdue && goal.status === 'active' && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-lg mb-2">{goal.goal_title}</CardTitle>
                        
                        {goal.goal_description && (
                          <CardDescription className="line-clamp-2">
                            {goal.goal_description}
                          </CardDescription>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {goal.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleGoalAction(goal.id, 'pause')}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause Goal
                            </DropdownMenuItem>
                          )}
                          {goal.status === 'paused' && (
                            <DropdownMenuItem onClick={() => handleGoalAction(goal.id, 'resume')}>
                              <Play className="w-4 h-4 mr-2" />
                              Resume Goal
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleGoalAction(goal.id, 'complete')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGoalAction(goal.id, 'archive')}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-purple-600">
                          {goal.progress_percentage || 0}%
                        </span>
                      </div>
                      <Progress value={goal.progress_percentage || 0} className="h-2" />
                    </div>

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Milestones</span>
                          <span className="text-sm text-gray-500">
                            {completedMilestones}/{totalMilestones}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {goal.milestones.slice(0, 3).map((milestone, mIdx) => (
                            <button
                              key={mIdx}
                              onClick={() => toggleMilestoneMutation.mutate({ goalId: goal.id, milestoneIndex: mIdx })}
                              className="flex items-start gap-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {milestone.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm ${
                                  milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                }`}>
                                  {milestone.title}
                                </p>
                                {milestone.target_date && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                          {goal.milestones.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{goal.milestones.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      {goal.target_date && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Flag className="w-4 h-4" />
                          <span>{format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      
                      {goal.shared_with_coach && (
                        <Badge variant="outline" className="text-xs">
                          <Share2 className="w-3 h-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}