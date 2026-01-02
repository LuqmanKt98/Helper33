import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Target,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Calendar,
  TrendingUp,
  Sparkles,
  Image,
  Link as LinkIcon,
  Eye,
  Clock,
  Award,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GOAL_CATEGORIES = [
  { value: 'emotional_healing', label: 'Emotional Healing', icon: '💙', color: 'from-blue-400 to-blue-600' },
  { value: 'relationships', label: 'Relationships', icon: '❤️', color: 'from-pink-400 to-rose-600' },
  { value: 'personal_growth', label: 'Personal Growth', icon: '🌱', color: 'from-green-400 to-emerald-600' },
  { value: 'work_life', label: 'Career & Work', icon: '💼', color: 'from-indigo-400 to-purple-600' },
  { value: 'self_care', label: 'Self-Care', icon: '🧘', color: 'from-purple-400 to-pink-600' },
  { value: 'habit_building', label: 'Habit Building', icon: '⚡', color: 'from-yellow-400 to-orange-600' },
  { value: 'life_transitions', label: 'Life Transitions', icon: '🔄', color: 'from-cyan-400 to-blue-600' }
];

export default function GoalsManager({ coachType = 'life_coach' }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showVisionBoardLink, setShowVisionBoardLink] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    goal_title: '',
    goal_description: '',
    category: 'personal_growth',
    target_date: '',
    self_checkin_frequency: 'weekly',
    checkin_reminder_enabled: true
  });

  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['coachingGoals', coachType],
    queryFn: () => base44.entities.CoachingGoal.filter({ coach_type: coachType }, '-created_date'),
    initialData: []
  });

  const { data: visionBoards = [] } = useQuery({
    queryKey: ['visionBoards'],
    queryFn: () => base44.entities.VisionBoard.list(),
    initialData: []
  });

  const { data: visionCards = [] } = useQuery({
    queryKey: ['visionCards'],
    queryFn: () => base44.entities.VisionCard.list(),
    initialData: []
  });

  const createGoalMutation = useMutation({
    mutationFn: (goalData) => base44.entities.CoachingGoal.create(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingGoals']);
      setNewGoal({
        goal_title: '',
        goal_description: '',
        category: 'personal_growth',
        target_date: '',
        self_checkin_frequency: 'weekly',
        checkin_reminder_enabled: true
      });
      setIsCreating(false);
      toast.success('Goal created! 🎯');
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CoachingGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingGoals']);
      setEditingGoal(null);
      toast.success('Goal updated! ✏️');
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId) => base44.entities.CoachingGoal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingGoals']);
      setSelectedGoal(null);
      toast.success('Goal removed');
    }
  });

  const handleCreateGoal = () => {
    if (!newGoal.goal_title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    createGoalMutation.mutate({
      ...newGoal,
      coach_type: coachType,
      status: 'active',
      progress_percentage: 0
    });
  };

  const handleUpdateProgress = async (goal, newPercentage) => {
    await updateGoalMutation.mutateAsync({
      id: goal.id,
      data: { progress_percentage: Math.min(100, Math.max(0, newPercentage)) }
    });
  };

  const getCategoryInfo = (category) => {
    return GOAL_CATEGORIES.find(c => c.value === category) || GOAL_CATEGORIES[0];
  };

  const getLinkedVisionCards = (goalId) => {
    return visionCards.filter(card => 
      card.implementation_intent?.includes(goalId) ||
      card.outcome_statement?.includes(goalId)
    );
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
          <p className="text-gray-600 text-sm">Track and achieve your life coaching goals</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 touch-manipulation min-h-[44px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Vision Board Integration Banner */}
      {visionBoards.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-300">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Vision Board Connected!</h3>
                  <p className="text-sm text-purple-700">
                    {visionCards.length} vision cards available to link with your goals
                  </p>
                </div>
              </div>
              <Link to={createPageUrl('VisionBoard')}>
                <Button variant="outline" className="bg-white touch-manipulation min-h-[40px]">
                  <Eye className="w-4 h-4 mr-2" />
                  View Vision Board
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {goals.length === 0 && !isCreating && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Goal Journey</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Set meaningful goals with your AI life coach and track your progress with vision board integration
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 touch-manipulation min-h-[44px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Active Goals ({activeGoals.length})
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {activeGoals.map(goal => {
              const categoryInfo = getCategoryInfo(goal.category);
              const linkedCards = getLinkedVisionCards(goal.id);
              const daysUntilTarget = goal.target_date 
                ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center text-2xl`}>
                            {categoryInfo.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1 line-clamp-2">{goal.goal_title}</CardTitle>
                            <Badge className="text-xs" style={{ backgroundColor: categoryInfo.color.split(' ')[1] }}>
                              {categoryInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingGoal(goal)}
                            className="touch-manipulation min-h-[36px]"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Delete this goal?')) {
                                deleteGoalMutation.mutate(goal.id);
                              }
                            }}
                            className="text-red-600 touch-manipulation min-h-[36px]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {goal.goal_description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{goal.goal_description}</p>
                      )}

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{goal.progress_percentage || 0}%</span>
                        </div>
                        <Progress 
                          value={goal.progress_percentage || 0} 
                          className="h-3"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateProgress(goal, (goal.progress_percentage || 0) - 10)}
                            className="flex-1 text-xs touch-manipulation min-h-[32px]"
                          >
                            -10%
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateProgress(goal, (goal.progress_percentage || 0) + 10)}
                            className="flex-1 text-xs touch-manipulation min-h-[32px]"
                          >
                            +10%
                          </Button>
                        </div>
                      </div>

                      {/* Vision Board Links */}
                      {linkedCards.length > 0 && (
                        <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Image className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-900">
                              Linked Vision Cards ({linkedCards.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {linkedCards.slice(0, 3).map(card => (
                              <Badge key={card.id} variant="outline" className="text-xs bg-white">
                                {card.title}
                              </Badge>
                            ))}
                            {linkedCards.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{linkedCards.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {goal.target_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysUntilTarget > 0 ? (
                              <span>{daysUntilTarget} days left</span>
                            ) : (
                              <span className="text-orange-600">Overdue</span>
                            )}
                          </div>
                        )}
                        {goal.last_checkin_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last check-in: {new Date(goal.last_checkin_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => setSelectedGoal(goal)}
                          variant="outline"
                          className="flex-1 touch-manipulation min-h-[40px]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {visionBoards.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedGoal(goal);
                              setShowVisionBoardLink(true);
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white touch-manipulation min-h-[40px]"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Link Vision
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Completed Goals ({completedGoals.length})
          </h3>

          <div className="grid md:grid-cols-3 gap-3">
            {completedGoals.map(goal => {
              const categoryInfo = getCategoryInfo(goal.category);
              return (
                <Card key={goal.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{goal.goal_title}</h4>
                        <Badge className="text-xs bg-green-600 text-white">
                          {categoryInfo.icon} {categoryInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No Vision Board CTA */}
      {visionBoards.length === 0 && activeGoals.length > 0 && (
        <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-purple-900 mb-2">Visualize Your Goals!</h3>
            <p className="text-purple-700 mb-4 text-sm">
              Create a Vision Board to give your goals visual power and inspiration
            </p>
            <Link to={createPageUrl('VisionBoard')}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 touch-manipulation min-h-[44px]">
                <Image className="w-4 h-4 mr-2" />
                Create Vision Board
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Create Goal Modal */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a meaningful goal and track your progress with your AI coach
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Goal Title</Label>
              <Input
                value={newGoal.goal_title}
                onChange={(e) => setNewGoal({...newGoal, goal_title: e.target.value})}
                placeholder="e.g., Build daily meditation practice"
                className="mt-1 min-h-[44px]"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newGoal.goal_description}
                onChange={(e) => setNewGoal({...newGoal, goal_description: e.target.value})}
                placeholder="Describe what you want to achieve and why it matters..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg min-h-[44px] bg-white"
                >
                  {GOAL_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Target Date (Optional)</Label>
                <Input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                  className="mt-1 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <Label>Check-in Frequency</Label>
              <select
                value={newGoal.self_checkin_frequency}
                onChange={(e) => setNewGoal({...newGoal, self_checkin_frequency: e.target.value})}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg min-h-[44px] bg-white"
              >
                <option value="daily">Daily</option>
                <option value="every_other_day">Every Other Day</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsCreating(false)}
              variant="outline"
              className="touch-manipulation min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={createGoalMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 touch-manipulation min-h-[44px]"
            >
              {createGoalMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</>
              ) : (
                <><Target className="w-4 h-4 mr-2" />Create Goal</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vision Board Link Modal */}
      <Dialog open={showVisionBoardLink} onOpenChange={setShowVisionBoardLink}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-600" />
              Link Vision Cards to Goal
            </DialogTitle>
            <DialogDescription>
              Connect vision cards from your board to bring visual inspiration to this goal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {visionCards.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {visionCards.map(card => (
                  <div
                    key={card.id}
                    className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 cursor-pointer transition-all"
                  >
                    {card.image_url && (
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 mb-1">{card.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{card.affirmation}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {card.area}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No vision cards yet</p>
                <Link to={createPageUrl('VisionBoard')}>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Create Vision Cards
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowVisionBoardLink(false)}
              className="touch-manipulation min-h-[44px]"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}