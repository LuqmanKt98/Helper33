import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Star,
  Flame,
  Gift,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const DAILY_CHALLENGES = [
  {
    id: 'math_master',
    title: 'Math Master',
    description: 'Solve 5 math problems correctly',
    icon: '🔢',
    color: 'from-blue-500 to-cyan-600',
    points: 50,
    targetCount: 5,
    activityType: 'math'
  },
  {
    id: 'letter_learner',
    title: 'Letter Learner',
    description: 'Trace 3 letters perfectly',
    icon: '✏️',
    color: 'from-purple-500 to-indigo-600',
    points: 40,
    targetCount: 3,
    activityType: 'tracing'
  },
  {
    id: 'creative_writer',
    title: 'Creative Writer',
    description: 'Write a journal entry',
    icon: '📓',
    color: 'from-pink-500 to-rose-600',
    points: 30,
    targetCount: 1,
    activityType: 'journal'
  },
  {
    id: 'artist_extraordinaire',
    title: 'Little Artist',
    description: 'Complete 2 coloring pages',
    icon: '🎨',
    color: 'from-green-500 to-emerald-600',
    points: 35,
    targetCount: 2,
    activityType: 'coloring'
  },
  {
    id: 'story_creator',
    title: 'Story Creator',
    description: 'Create a new story',
    icon: '📚',
    color: 'from-orange-500 to-amber-600',
    points: 45,
    targetCount: 1,
    activityType: 'story'
  }
];

export default function DailyChallengeSystem({ 
  childMemberId,
  onChallengeComplete,
  completedToday = []
}) {
  const queryClient = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showReward, setShowReward] = useState(false);
  const [earnedReward, setEarnedReward] = useState(null);

  // Get today's challenges from ChildProgress entity
  const { data: childProgress } = useQuery({
    queryKey: ['childProgress', childMemberId],
    queryFn: async () => {
      const records = await base44.entities.ChildProgress.filter({
        child_member_id: childMemberId
      });
      return records[0] || null;
    },
    enabled: !!childMemberId
  });

  // Track daily challenge completions
  const dailyChallengeProgress = childProgress?.module_progress?.daily_challenges || {};
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysChallenges = dailyChallengeProgress[today] || {};

  const completeChallengeLocal = (challengeId, reward) => {
    setEarnedReward({ ...reward, challengeId });
    setShowReward(true);
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB']
    });

    setTimeout(() => {
      setShowReward(false);
      setSelectedChallenge(null);
      if (onChallengeComplete) {
        onChallengeComplete(reward);
      }
    }, 4000);
  };

  const updateChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, progress }) => {
      if (!childProgress) return;

      const updatedDailyChallenges = {
        ...dailyChallengeProgress,
        [today]: {
          ...todaysChallenges,
          [challengeId]: {
            completed: progress >= 100,
            progress: progress,
            completedAt: progress >= 100 ? new Date().toISOString() : null
          }
        }
      };

      return await base44.entities.ChildProgress.update(childProgress.id, {
        module_progress: {
          ...(childProgress.module_progress || {}),
          daily_challenges: updatedDailyChallenges
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['childProgress', childMemberId]);
    }
  });

  const handleChallengeProgress = (challengeId, currentProgress) => {
    const challenge = DAILY_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return;

    const progressPercentage = (currentProgress / challenge.targetCount) * 100;
    
    updateChallengeMutation.mutate({ 
      challengeId, 
      progress: progressPercentage 
    });

    if (progressPercentage >= 100) {
      completeChallengeLocal(challengeId, {
        points: challenge.points,
        title: challenge.title,
        icon: challenge.icon
      });
      toast.success(`🎉 Challenge Complete: ${challenge.title}!`);
    }
  };

  // Calculate overall completion for today
  const todaysCompletionCount = Object.values(todaysChallenges).filter(c => c.completed).length;
  const allChallengesComplete = todaysCompletionCount === DAILY_CHALLENGES.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Target className="w-8 h-8" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Daily Challenges</h2>
                <p className="text-purple-100">{format(new Date(), 'EEEE, MMMM d')}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold">{todaysCompletionCount}/{DAILY_CHALLENGES.length}</div>
              <div className="text-sm opacity-90">Complete</div>
            </div>
          </div>

          {allChallengesComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-white/20 rounded-xl backdrop-blur-sm"
            >
              <p className="text-xl font-bold text-center">
                🎉 ALL CHALLENGES COMPLETE! 🎉
              </p>
              <p className="text-center text-purple-100 text-sm mt-1">
                Amazing work! Come back tomorrow for new challenges!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Challenges Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAILY_CHALLENGES.map((challenge, idx) => {
          const challengeData = todaysChallenges[challenge.id] || { completed: false, progress: 0 };
          const isCompleted = challengeData.completed;
          const progress = challengeData.progress || 0;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={!isCompleted ? { scale: 1.03, y: -5 } : {}}
            >
              <Card className={`relative overflow-hidden border-2 transition-all ${
                isCompleted
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 shadow-xl'
                  : 'bg-white hover:shadow-xl border-purple-200 hover:border-purple-400'
              }`}>
                {/* Completed Badge */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                    className="absolute top-2 right-2 z-10"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                )}

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${challenge.color} ${
                  isCompleted ? 'opacity-10' : 'opacity-5'
                }`} />

                <CardHeader className="relative">
                  <div className="text-5xl mb-3 filter drop-shadow-lg">
                    {challenge.icon}
                  </div>
                  <CardTitle className="text-xl">{challenge.title}</CardTitle>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </CardHeader>

                <CardContent className="relative space-y-3">
                  {/* Progress Bar */}
                  {!isCompleted && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold">Progress</span>
                        <span className="text-purple-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full bg-gradient-to-r ${challenge.color}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Reward Badge */}
                  <div className="flex items-center justify-between">
                    <Badge className={`bg-gradient-to-r ${challenge.color} text-white shadow-md`}>
                      <Star className="w-4 h-4 mr-1" />
                      +{challenge.points} points
                    </Badge>
                    
                    {isCompleted ? (
                      <span className="text-sm font-bold text-green-700">✓ Completed!</span>
                    ) : (
                      <span className="text-xs text-purple-600 font-semibold">
                        {challenge.targetCount} to complete
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  {!isCompleted && (
                    <Button
                      onClick={() => setSelectedChallenge(challenge)}
                      className={`w-full bg-gradient-to-r ${challenge.color} hover:opacity-90 text-white shadow-lg`}
                    >
                      Start Challenge
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Streak & Bonus */}
      <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="font-bold text-orange-900 text-lg">Challenge Streak</h3>
                <p className="text-sm text-orange-700">Complete all 5 daily for bonus points!</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">
                {childProgress?.module_progress?.challenge_streak || 0}
              </div>
              <div className="text-sm text-orange-700">days</div>
            </div>
          </div>

          {allChallengesComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-white/60 rounded-xl text-center"
            >
              <Gift className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="font-bold text-orange-900">
                🎁 Bonus: +50 points for completing all challenges!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && earnedReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-400 text-white rounded-3xl p-12 text-center shadow-2xl border-4 border-white max-w-md">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 1 }}
                className="text-8xl mb-4"
              >
                {earnedReward.icon}
              </motion.div>
              <h3 className="text-4xl font-bold mb-2">CHALLENGE COMPLETE!</h3>
              <p className="text-2xl mb-4">{earnedReward.title}</p>
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-5xl font-bold">+{earnedReward.points}</div>
                <div className="text-xl">Bonus Points!</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}