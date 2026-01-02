import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  X,
  Edit3,
  Clock,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Target,
  Brain,
  Trophy,
  Heart,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const suggestionIcons = {
  task: Target,
  mindfulness_exercise: Brain,
  challenge: Trophy,
  habit: TrendingUp,
  reflection: Sparkles,
  activity: Heart
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  urgent: 'bg-red-100 text-red-800 border-red-300'
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  challenging: 'bg-red-100 text-red-800'
};

export default function PlanSuggestionCard({ suggestion, onUpdate, delay = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(suggestion.title);
  const [editedDescription, setEditedDescription] = useState(suggestion.description);

  const queryClient = useQueryClient();
  const Icon = suggestionIcons[suggestion.suggestion_type] || Target;

  const acceptSuggestionMutation = useMutation({
    mutationFn: async (modifications = {}) => {
      await base44.entities.WellnessPlanSuggestion.update(suggestion.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        user_modifications: modifications
      });

      let createdId = null;

      if (suggestion.suggestion_type === 'task') {
        const taskData = modifications.title || modifications.description 
          ? {
              title: modifications.title || suggestion.task_data?.title || suggestion.title,
              description: modifications.description || suggestion.task_data?.description || suggestion.description,
              category: suggestion.task_data?.category || 'self_care',
              priority: suggestion.task_data?.priority || suggestion.priority,
              estimated_duration: suggestion.estimated_duration_minutes,
              ai_generated: true,
              tags: ['wellness-plan']
            }
          : {
              ...suggestion.task_data,
              ai_generated: true,
              tags: ['wellness-plan']
            };

        const task = await base44.entities.Task.create(taskData);
        createdId = task.id;

        await base44.entities.WellnessPlanSuggestion.update(suggestion.id, {
          created_task_id: task.id
        });
      } else if (suggestion.suggestion_type === 'habit') {
        const habit = await base44.entities.HabitTracker.create({
          habit_name: modifications.title || suggestion.title,
          description: modifications.description || suggestion.description,
          category: 'self_care',
          frequency: 'daily',
          is_active: true
        });
        createdId = habit.id;

        await base44.entities.WellnessPlanSuggestion.update(suggestion.id, {
          created_habit_id: habit.id
        });
      }

      const plan = await base44.entities.WellnessPlan.filter({ id: suggestion.plan_id });
      if (plan.length > 0) {
        await base44.entities.WellnessPlan.update(plan[0].id, {
          accepted_suggestions: (plan[0].accepted_suggestions || 0) + 1
        });
      }

      return createdId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wellness-plan-suggestions']);
      queryClient.invalidateQueries(['wellness-plans-active']);
      queryClient.invalidateQueries(['tasks']);
      toast.success('Suggestion accepted and added to your plan! ✅');
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      console.error('Failed to accept suggestion:', error);
      toast.error('Failed to accept suggestion');
    }
  });

  const rejectSuggestionMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.WellnessPlanSuggestion.update(suggestion.id, {
        status: 'rejected'
      });

      const plan = await base44.entities.WellnessPlan.filter({ id: suggestion.plan_id });
      if (plan.length > 0) {
        await base44.entities.WellnessPlan.update(plan[0].id, {
          rejected_suggestions: (plan[0].rejected_suggestions || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wellness-plan-suggestions']);
      queryClient.invalidateQueries(['wellness-plans-active']);
      toast.success('Suggestion dismissed');
      if (onUpdate) onUpdate();
    }
  });

  const handleAccept = () => {
    if (isEditing) {
      acceptSuggestionMutation.mutate({
        title: editedTitle,
        description: editedDescription
      });
      setIsEditing(false);
    } else {
      acceptSuggestionMutation.mutate();
    }
  };

  const handleReject = () => {
    rejectSuggestionMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className={`bg-white/90 backdrop-blur-sm border-2 ${priorityColors[suggestion.priority]} shadow-lg hover:shadow-xl transition-all`}>
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="font-bold text-lg mb-2"
                      />
                    ) : (
                      <h3 className="text-lg font-bold text-gray-900">{suggestion.title}</h3>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.suggestion_type.replace('_', ' ')}
                      </Badge>
                      <Badge className={difficultyColors[suggestion.difficulty_level]}>
                        {suggestion.difficulty_level}
                      </Badge>
                      {suggestion.estimated_duration_minutes && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          {suggestion.estimated_duration_minutes} min
                        </Badge>
                      )}
                      {suggestion.suggested_time_of_day !== 'anytime' && (
                        <Badge variant="outline" className="text-xs">
                          {suggestion.suggested_time_of_day}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 ml-2"
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </div>

                {isEditing ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-gray-700">{suggestion.description}</p>
                )}
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-4 border-t"
                >
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 mb-1">Why we suggest this:</p>
                        <p className="text-sm text-blue-800">{suggestion.ai_reasoning}</p>
                      </div>
                    </div>
                  </div>

                  {suggestion.suggestion_type === 'challenge' && (
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <Trophy className="w-4 h-4" />
                      <span>This will enroll you in a wellness challenge</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 pt-2">
              {!isEditing ? (
                <>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
                    disabled={acceptSuggestionMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modify
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={rejectSuggestionMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                    Dismiss
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleAccept}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save & Accept
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTitle(suggestion.title);
                      setEditedDescription(suggestion.description);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}