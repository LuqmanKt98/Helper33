
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Target,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { generatePersonalizedTasks } from '@/functions/generatePersonalizedTasks';
import { trackCoachingInteraction } from '@/functions/trackCoachingInteraction';

export default function TaskList({ goal, onTaskUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      await generatePersonalizedTasks({ goal_id: goal.id, count: 3 });
      queryClient.invalidateQueries(['coachingGoals']);
      toast.success('New personalized tasks generated! 🎯');
    } catch (error) {
      toast.error('Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptTask = async (task, taskIndex) => {
    const updatedTasks = [...(goal.suggested_tasks || [])];
    updatedTasks[taskIndex] = { ...task, accepted: true };

    await base44.entities.CoachingGoal.update(goal.id, {
      suggested_tasks: updatedTasks
    });

    // Track acceptance
    await trackCoachingInteraction({
      interaction_type: 'task_accepted',
      data: { difficulty: task.difficulty_level }
    });

    queryClient.invalidateQueries(['coachingGoals']);
    toast.success('Task accepted! 🎯');
  };

  const handleSkipTask = async (taskIndex) => {
    const updatedTasks = [...(goal.suggested_tasks || [])];
    updatedTasks.splice(taskIndex, 1);

    await base44.entities.CoachingGoal.update(goal.id, {
      suggested_tasks: updatedTasks
    });

    // Track skip
    await trackCoachingInteraction({
      interaction_type: 'task_skipped'
    });

    queryClient.invalidateQueries(['coachingGoals']);
    toast.info('Task removed');
  };

  const handleCompleteTask = async (task, taskIndex) => {
    const updatedTasks = [...(goal.suggested_tasks || [])];
    updatedTasks[taskIndex] = { ...task, completed: true, completed_at: new Date().toISOString() };

    await base44.entities.CoachingGoal.update(goal.id, {
      suggested_tasks: updatedTasks
    });

    queryClient.invalidateQueries(['coachingGoals']);
    toast.success('Task completed! 🌟');
  };

  const suggestedTasks = goal.suggested_tasks || [];
  const pendingTasks = suggestedTasks.filter(t => !t.completed && !t.accepted);
  const activeTasks = suggestedTasks.filter(t => t.accepted && !t.completed);
  const completedTasks = suggestedTasks.filter(t => t.completed);

  const difficultyColors = {
    gentle: 'from-green-400 to-emerald-500',
    moderate: 'from-blue-400 to-cyan-500',
    challenging: 'from-orange-400 to-red-500'
  };

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Suggested Actions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tasks personalized to your profile & progress
          </p>
        </div>
        
        <Button
          onClick={handleGenerateTasks}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Tasks
            </>
          )}
        </Button>
      </div>

      {/* Pending Tasks (Need Accept/Skip) */}
      {pendingTasks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">New Suggestions</h4>
          {pendingTasks.map((task, idx) => {
            const isExpanded = expandedTask === `pending-${idx}`;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`bg-gradient-to-r ${difficultyColors[task.difficulty_level] || 'from-gray-400 to-gray-500'} text-white text-xs`}>
                            {task.difficulty_level}
                          </Badge>
                          {task.estimated_minutes && (
                            <Badge variant="outline" className="text-xs">
                              ~{task.estimated_minutes} min
                            </Badge>
                          )}
                        </div>
                        
                        <h5 className="font-semibold text-gray-900 mb-2">
                          {task.task_title}
                        </h5>
                        
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {task.task_description}
                        </p>

                        {/* Personalization Info */}
                        {task.personalization_note && (
                          <button
                            onClick={() => setExpandedTask(isExpanded ? null : `pending-${idx}`)}
                            className="text-xs text-purple-600 hover:text-purple-700 mt-2 flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Why this task for you?
                          </button>
                        )}

                        {isExpanded && task.personalization_note && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
                          >
                            <p className="text-xs text-purple-900 leading-relaxed">
                              <strong>Personalized for you:</strong> {task.personalization_note}
                            </p>
                            {task.supports_value && (
                              <p className="text-xs text-purple-800 mt-2">
                                <strong>Supports your value:</strong> {task.supports_value}
                              </p>
                            )}
                            {task.learning_style_match && (
                              <p className="text-xs text-purple-800 mt-1">
                                <strong>Matches your style:</strong> {task.learning_style_match}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptTask(task, idx)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleSkipTask(idx)}
                        variant="outline"
                        size="sm"
                      >
                        Skip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Active Tasks (Accepted but not completed) */}
      {activeTasks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Active Tasks</h4>
          {activeTasks.map((task, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {task.task_title}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {task.task_description}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleCompleteTask(task, suggestedTasks.findIndex(t => t === task))}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Completed Tasks</h4>
          {completedTasks.slice(0, 5).map((task, idx) => (
            <Card key={idx} className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-700 line-through">
                    {task.task_title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          {completedTasks.length > 5 && (
            <p className="text-xs text-gray-500 text-center">
              +{completedTasks.length - 5} more completed
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {suggestedTasks.length === 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">No Tasks Yet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Generate personalized action steps based on your unique profile
            </p>
            <Button
              onClick={handleGenerateTasks}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My Tasks
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
