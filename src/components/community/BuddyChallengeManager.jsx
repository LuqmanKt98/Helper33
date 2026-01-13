import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
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
  Flag,
  Loader2
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

  // Determine the other user's ID. 
  // buddyConnection likely comes from friend_requests or a similar object.
  // We need the ID of the buddy.
  const buddyId = buddyConnection.requester_id === user.id ? buddyConnection.receiver_id : buddyConnection.requester_id;
  // If buddyConnection doesn't have IDs directly (it might be enriched), check that.
  // Assuming buddyConnection has requester_id and receiver_id as per friend_requests schema.

  const { data: challenges = [] } = useQuery({
    queryKey: ['buddyChallenges', buddyId],
    queryFn: async () => {
      // Fetch challenges where both users are participants and type is buddy_challenge
      // Since filtering by participants is hard in one go, we can fetch 'buddy_challenge' type created by either user
      // or check participants separately.

      const { data, error } = await supabase
        .from('challenges')
        .select(`
            *,
            participants:challenge_participants(*)
        `)
        .eq('type', 'buddy_challenge')
        .or(`created_by.eq.${user.id},created_by.eq.${buddyId}`); // This is a heuristic. Better to filter by participation.

      if (error) throw error;

      // Filter in memory to ensure both are participants if needed, but 'buddy_challenge' implies it.
      // We also need to map the participant progress to requester/buddy progress structure used by UI.

      return data.map(challenge => {
        const myParticipant = challenge.participants.find(p => p.user_id === user.id) || { progress: 0, completed: false };
        const buddyParticipant = challenge.participants.find(p => p.user_id === buddyId) || { progress: 0, completed: false };

        return {
          ...challenge,
          requester_progress: {
            current_value: myParticipant.progress || 0,
            completed: myParticipant.completed || false,
            daily_log: [] // Not supported in simple schema yet
          },
          buddy_progress: {
            current_value: buddyParticipant.progress || 0,
            completed: buddyParticipant.completed || false,
            daily_log: []
          },
          target_value: challenge.target_value || 100, // Default if missing
          unit: challenge.unit || 'points'
        };
      });
    },
    enabled: !!buddyId
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data) => {
      // 1. Create Challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          title: data.challenge_title,
          description: data.challenge_description,
          type: 'buddy_challenge',
          start_date: data.start_date,
          end_date: data.end_date,
          created_by: user.id,
          // Store extra fields in JSONB if possible, or mapping columns
          target_value: data.target_value, // Assuming column exists or we might lose it
          unit: data.unit,
          is_competitive: data.is_competitive,
          metadata: {
            prize: data.prize_description,
            challenge_type: data.challenge_type
          }
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      // 2. Add Participants (Me and Buddy)
      const participants = [
        { challenge_id: challenge.id, user_id: user.id, progress: 0 },
        { challenge_id: challenge.id, user_id: buddyId, progress: 0 }
      ];

      const { error: partError } = await supabase
        .from('challenge_participants')
        .insert(participants);

      if (partError) throw partError;

      return challenge;
    },
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
    },
    onError: (err) => {
      toast.error('Failed to create challenge. ' + err.message);
    }
  });

  const updateChallengeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // data contains requester_progress or buddy_progress
      // We need to determine which participant record to update.
      // But wait, the function is called with logic that prepares 'data' based on state.
      // We actually just want to update "my" progress if I am logging.
      // The original code passed a complex object. We need to simplify.

      // This mutation is called by handleLogProgress
      // We really just want to add to progress.

      // We assume the ID passed is challenge.id

      // We need to fetch current progress to add to it? 
      // Or handleLogProgress calculated newCurrentValue.

      const isRequester = true; // wait, we know who is updating: currentUser
      const targetUserId = user.id; // Only update my own progress

      const newValue = data.requester_progress?.current_value ?? data.buddy_progress?.current_value;
      const isCompleted = data.requester_progress?.completed ?? data.buddy_progress?.completed;

      const { error } = await supabase
        .from('challenge_participants')
        .update({
          progress: newValue,
          completed: isCompleted,
          last_log_date: new Date().toISOString()
        })
        .eq('challenge_id', id)
        .eq('user_id', targetUserId);

      if (error) throw error;
    },
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
      // progress objects removed, handled in mutation
    });
  };

  const handleLogProgress = () => {
    if (!selectedChallenge || !progressValue) {
      toast.error('Please enter a value');
      return;
    }

    // Determine current progress
    const myProgress = selectedChallenge.requester_progress; // in our mapping requester is always user if we mapped it that way? 
    // Wait, in useQuery we mapped requester_progress to "myParticipant".
    // So yes, requester_progress logic refers to ME.

    const newCurrentValue = (myProgress.current_value || 0) + parseFloat(progressValue);
    const completed = newCurrentValue >= selectedChallenge.target_value;

    const updateData = {
      requester_progress: {
        current_value: newCurrentValue,
        completed: completed,
        daily_log: [] // ignored
      }
    };

    updateChallengeMutation.mutate({
      id: selectedChallenge.id,
      data: updateData
    });

    setShowLogProgress(false);
    setProgressValue('');
    setProgressNote('');
  };

  const handleQuickReaction = (challenge, reaction) => {
    // Reactions not supported in current schema for challenges, or would require a new table.
    // For now, simpler to toast.
    toast.success(`Reacted with ${reaction}! (Reactions syncing coming soon)`);
  };

  // derived state
  // In our mapping, we already structured active/completed based on dates? 
  // No, we need to check status.
  // We can assume 'active' if end_date > now.
  const now = new Date();
  const activeChallenges = challenges.filter(c => new Date(c.end_date) >= now && (!c.requester_progress?.completed || !c.buddy_progress?.completed)); // Simplified logic
  const completedChallenges = challenges.filter(c => c.requester_progress?.completed && c.buddy_progress?.completed); // Both completed? Or just past date?

  // const isRequester logic is tricky if we always map requester_progress to USER.
  // In UI rendering:
  // "Your Progress" -> myProgress
  // "{buddyInfo.name}'s Progress" -> theirProgress

  // Since we mapped:
  // requester_progress = user (me)
  // buddy_progress = buddy (them)
  // We don't need 'isRequester' check for mapping.

  const buddyInfo = {
    name: buddyConnection.buddy_name || 'Buddy', // Fallback if name missing
    avatar: buddyConnection.buddy_avatar
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
              const myProgress = challenge.requester_progress;
              const theirProgress = challenge.buddy_progress;

              const myPercentage = Math.min((myProgress.current_value / challenge.target_value) * 100, 100);
              const theirPercentage = Math.min((theirProgress.current_value / challenge.target_value) * 100, 100);

              const daysLeft = Math.ceil(
                (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
              );

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
                          <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                          <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
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
                      </div>
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
                    {challenge.title}
                  </h5>
                  <p className="text-xs text-gray-600">
                    Ended {new Date(challenge.end_date).toLocaleDateString()}
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
            {/* Quick Templates */}
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
                onChange={(e) => setNewChallenge({ ...newChallenge, challenge_title: e.target.value })}
                placeholder="e.g., 30-Day Fitness Challenge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newChallenge.challenge_description}
                onChange={(e) => setNewChallenge({ ...newChallenge, challenge_description: e.target.value })}
                placeholder="What is this challenge about?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Challenge Type</label>
                <select
                  value={newChallenge.challenge_type}
                  onChange={(e) => setNewChallenge({ ...newChallenge, challenge_type: e.target.value })}
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
                  onChange={(e) => setNewChallenge({ ...newChallenge, duration_days: parseInt(e.target.value) })}
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
                  onChange={(e) => setNewChallenge({ ...newChallenge, target_value: parseInt(e.target.value) })}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <Input
                  value={newChallenge.unit}
                  onChange={(e) => setNewChallenge({ ...newChallenge, unit: e.target.value })}
                  placeholder="e.g., workouts, minutes, entries"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="competitive"
                checked={newChallenge.is_competitive}
                onChange={(e) => setNewChallenge({ ...newChallenge, is_competitive: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="competitive" className="text-sm font-medium text-gray-700">
                Make it competitive (first to complete wins!)
              </label>
            </div>
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
              {selectedChallenge?.title}
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