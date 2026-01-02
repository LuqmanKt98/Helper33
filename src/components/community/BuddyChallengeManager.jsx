import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  TrendingUp,
  Plus,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Flag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const QUICK_REACTIONS = ['🔥', '💪', '🎉', '👏', '⭐', '💯'];

const CHALLENGE_TEMPLATES = [
  {
    title: "30-Day Workout Challenge",
    type: "workout_count",
    target: 30,
    unit: "workouts",
    duration: 30,
    description: "Complete 30 workouts in 30 days"
  },
  {
    title: "Weekly Meditation Marathon",
    type: "meditation_minutes",
    target: 150,
    unit: "minutes",
    duration: 7,
    description: "Meditate for 150 minutes this week"
  },
  {
    title: "Journal Every Day",
    type: "journal_entries",
    target: 14,
    unit: "entries",
    duration: 14,
    description: "Write in your journal every day for 2 weeks"
  },
  {
    title: "Task Master Challenge",
    type: "task_completion",
    target: 50,
    unit: "tasks",
    duration: 30,
    description: "Complete 50 tasks in one month"
  }
];

export default function BuddyChallengeManager({ buddyConnection, user }) {
  const queryClient = useQueryClient();
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showLogProgress, setShowLogProgress] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [progressValue, setProgressValue] = useState('');
  const [progressNote, setProgressNote] = useState('');
  
  const [newChallenge, setNewChallenge] = useState({
    challenge_title: '',
    challenge_description: '',
    challenge_type: 'workout_count',
    target_value: 10,
    unit: 'workouts',
    duration_days: 30,
    is_competitive: false,
    prize_description: ''
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['buddyChallenges', buddyConnection.id],
    queryFn: () => base44.entities.BuddyChallenge.filter({
      buddy_connection_id: buddyConnection.id
    }),
    enabled: !!buddyConnection
  });

  const createChallengeMutation = useMutation({
    mutationFn: (data) => base44.entities.BuddyChallenge.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buddyChallenges']);
      setShowCreateChallenge(false);
      setNewChallenge({
        challenge_title: '',
        challenge_description: '',
        challenge_type: 'workout_count',
        target_value: 10,
        unit: 'workouts',
        duration_days: 30,
        is_competitive: false,
        prize_description: ''
      });
      toast.success('Challenge created! 🎯');
    }
  });

  const updateChallengeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BuddyChallenge.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buddyChallenges']);
      toast.success('Progress updated! 💪');
    }
  });

  const applyTemplate = (template) => {
    setNewChallenge({
      ...newChallenge,
      challenge_title: template.title,
      challenge_type: template.type,
      target_value: template.target,
      unit: template.unit,
      duration_days: template.duration,
      challenge_description: template.description
    });
  };

  const handleCreateChallenge = () => {
    if (!newChallenge.challenge_title || !newChallenge.target_value) {
      toast.error('Please fill in the required fields');
      return;
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + newChallenge.duration_days);

    createChallengeMutation.mutate({
      buddy_connection_id: buddyConnection.id,
      created_by_email: user.email,
      ...newChallenge,
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      requester_progress: { current_value: 0, daily_log: [], completed: false },
      buddy_progress: { current_value: 0, daily_log: [], completed: false },
      milestone_celebrations: [
        { milestone_percentage: 25, celebrated: false },
        { milestone_percentage: 50, celebrated: false },
        { milestone_percentage: 75, celebrated: false }
      ]
    });
  };

  const handleLogProgress = () => {
    if (!selectedChallenge || !progressValue) {
      toast.error('Please enter a value');
      return;
    }

    const isRequester = buddyConnection.requester_email === user.email;
    const progressField = isRequester ? 'requester_progress' : 'buddy_progress';
    const currentProgress = selectedChallenge[progressField];

    const newDailyLog = [
      ...(currentProgress.daily_log || []),
      {
        date: new Date().toISOString().split('T')[0],
        value: parseFloat(progressValue),
        note: progressNote
      }
    ];

    const newCurrentValue = currentProgress.current_value + parseFloat(progressValue);
    const completed = newCurrentValue >= selectedChallenge.target_value;

    updateChallengeMutation.mutate({
      id: selectedChallenge.id,
      data: {
        [progressField]: {
          current_value: newCurrentValue,
          daily_log: newDailyLog,
          completed: completed,
          completion_date: completed ? new Date().toISOString().split('T')[0] : null
        }
      }
    });

    setShowLogProgress(false);
    setProgressValue('');
    setProgressNote('');
  };

  const handleQuickReaction = (challenge, reaction) => {
    const currentReactions = challenge.buddy_reactions || [];
    
    updateChallengeMutation.mutate({
      id: challenge.id,
      data: {
        buddy_reactions: [
          ...currentReactions,
          {
            from_email: user.email,
            reaction_type: reaction,
            message: '',
            timestamp: new Date().toISOString()
          }
        ]
      }
    });
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const isRequester = buddyConnection.requester_email === user.email;
  const buddyInfo = {
    email: isRequester ? buddyConnection.buddy_email : buddyConnection.requester_email,
    name: isRequester ? buddyConnection.buddy_name : buddyConnection.requester_name,
    avatar: isRequester ? buddyConnection.buddy_avatar : buddyConnection.requester_avatar
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Buddy Challenges
          </h3>
          <p className="text-gray-600 mt-1">Create and compete in challenges together</p>
        </div>
        <Button
          onClick={() => setShowCreateChallenge(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Challenge
        </Button>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Active Challenges
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            {activeChallenges.map(challenge => {
              const myProgress = isRequester ? challenge.requester_progress : challenge.buddy_progress;
              const theirProgress = isRequester ? challenge.buddy_progress : challenge.requester_progress;
              
              const myPercentage = Math.min((myProgress.current_value / challenge.target_value) * 100, 100);
              const theirPercentage = Math.min((theirProgress.current_value / challenge.target_value) * 100, 100);

              const daysLeft = Math.ceil(
                (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
              );

              const recentReactions = (challenge.buddy_reactions || []).slice(-3);

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{challenge.challenge_title}</CardTitle>
                          <p className="text-sm text-gray-600 mb-3">{challenge.challenge_description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-amber-600 text-white">
                              <Target className="w-3 h-3 mr-1" />
                              {challenge.target_value} {challenge.unit}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {daysLeft} days left
                            </Badge>
                            {challenge.is_competitive && (
                              <Badge className="bg-red-500 text-white">
                                <Trophy className="w-3 h-3 mr-1" />
                                Competitive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Your Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">Your Progress</span>
                          <span className="text-sm font-bold text-amber-600">
                            {myProgress.current_value} / {challenge.target_value}
                          </span>
                        </div>
                        <Progress value={myPercentage} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">{Math.round(myPercentage)}% complete</p>
                      </div>

                      {/* Buddy's Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">{buddyInfo.name}'s Progress</span>
                          <span className="text-sm font-bold text-blue-600">
                            {theirProgress.current_value} / {challenge.target_value}
                          </span>
                        </div>
                        <Progress value={theirPercentage} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">{Math.round(theirPercentage)}% complete</p>
                      </div>

                      {/* Recent Reactions */}
                      {recentReactions.length > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                          <span className="text-xs text-gray-600">Recent:</span>
                          {recentReactions.map((reaction, idx) => (
                            <span key={idx} className="text-lg">{reaction.reaction_type}</span>
                          ))}
                        </div>
                      )}

                      {/* Quick Reactions */}
                      <div className="flex gap-2 flex-wrap">
                        {QUICK_REACTIONS.map(reaction => (
                          <button
                            key={reaction}
                            onClick={() => handleQuickReaction(challenge, reaction)}
                            className="text-2xl hover:scale-125 transition-transform active:scale-95"
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedChallenge(challenge);
                            setShowLogProgress(true);
                          }}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Log Progress
                        </Button>
                        
                        {myProgress.completed && theirProgress.completed && (
                          <Button
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                            Both Completed! 🎉
                          </Button>
                        )}
                      </div>

                      {/* Winner Badge */}
                      {challenge.both_completed && challenge.is_competitive && challenge.winner_email && (
                        <div className={`p-3 rounded-lg border-2 ${
                          challenge.winner_email === user.email
                            ? 'bg-amber-100 border-amber-400'
                            : 'bg-blue-100 border-blue-400'
                        }`}>
                          <p className="text-sm font-bold text-center">
                            {challenge.winner_email === user.email ? (
                              <>🏆 You Won!</>
                            ) : (
                              <>👏 {buddyInfo.name} Won!</>
                            )}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Completed Challenges ({completedChallenges.length})
          </h4>
          
          <div className="grid md:grid-cols-3 gap-3">
            {completedChallenges.slice(0, 6).map(challenge => (
              <Card key={challenge.id} className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h5 className="font-semibold text-sm text-gray-900 mb-1">
                    {challenge.challenge_title}
                  </h5>
                  <p className="text-xs text-gray-600">
                    Completed {new Date(challenge.completed_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {challenges.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Challenges Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first challenge and start achieving goals together!
            </p>
            <Button
              onClick={() => setShowCreateChallenge(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Challenge
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Challenge Modal */}
      <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Buddy Challenge</DialogTitle>
            <DialogDescription>
              Set a goal to achieve together with {buddyInfo.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Challenge Templates */}
            <div>
              <label className="block text-sm font-medium mb-2">Quick Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {CHALLENGE_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyTemplate(template)}
                    className="p-3 text-left rounded-lg border-2 border-gray-200 hover:border-amber-400 transition-all"
                  >
                    <p className="font-semibold text-sm text-gray-900">{template.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {template.target} {template.unit} in {template.duration} days
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Challenge Title</label>
              <Input
                value={newChallenge.challenge_title}
                onChange={(e) => setNewChallenge({...newChallenge, challenge_title: e.target.value})}
                placeholder="e.g., 30-Day Fitness Challenge"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newChallenge.challenge_description}
                onChange={(e) => setNewChallenge({...newChallenge, challenge_description: e.target.value})}
                placeholder="What is this challenge about?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Challenge Type</label>
                <select
                  value={newChallenge.challenge_type}
                  onChange={(e) => setNewChallenge({...newChallenge, challenge_type: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="workout_count">Workout Count</option>
                  <option value="meditation_minutes">Meditation Minutes</option>
                  <option value="journal_entries">Journal Entries</option>
                  <option value="habit_streak">Habit Streak</option>
                  <option value="task_completion">Task Completion</option>
                  <option value="wellness_score">Wellness Score</option>
                  <option value="custom_metric">Custom Metric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (days)</label>
                <Input
                  type="number"
                  value={newChallenge.duration_days}
                  onChange={(e) => setNewChallenge({...newChallenge, duration_days: parseInt(e.target.value)})}
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Value</label>
                <Input
                  type="number"
                  value={newChallenge.target_value}
                  onChange={(e) => setNewChallenge({...newChallenge, target_value: parseInt(e.target.value)})}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <Input
                  value={newChallenge.unit}
                  onChange={(e) => setNewChallenge({...newChallenge, unit: e.target.value})}
                  placeholder="e.g., workouts, minutes, entries"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="competitive"
                checked={newChallenge.is_competitive}
                onChange={(e) => setNewChallenge({...newChallenge, is_competitive: e.target.checked})}
                className="w-5 h-5"
              />
              <label htmlFor="competitive" className="text-sm font-medium text-gray-700">
                Make it competitive (first to complete wins!)
              </label>
            </div>

            {newChallenge.is_competitive && (
              <div>
                <label className="block text-sm font-medium mb-2">Prize/Reward (optional)</label>
                <Input
                  value={newChallenge.prize_description}
                  onChange={(e) => setNewChallenge({...newChallenge, prize_description: e.target.value})}
                  placeholder="e.g., Winner picks next restaurant"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowCreateChallenge(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChallenge}
              disabled={createChallengeMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Flag className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Progress Modal */}
      <Dialog open={showLogProgress} onOpenChange={setShowLogProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Your Progress</DialogTitle>
            <DialogDescription>
              {selectedChallenge?.challenge_title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                How much did you complete today?
              </label>
              <Input
                type="number"
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
                placeholder={`e.g., 2 ${selectedChallenge?.unit}`}
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <Textarea
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="How did it go?"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowLogProgress(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogProgress}
              disabled={updateChallengeMutation.isPending || !progressValue}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Log Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}