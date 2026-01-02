import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Target, CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Challenge2026Card({ user, goals }) {
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['2026Challenges'],
    queryFn: async () => {
      const allChallenges = await base44.entities.GroupChallenge.filter(
        { tags: { $contains: '2026' } },
        '-created_date',
        20
      );
      return allChallenges;
    },
    initialData: []
  });

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['my2026Participations'],
    queryFn: async () => {
      return await base44.entities.ChallengeParticipant.filter(
        { user_email: user.email },
        '-joined_date'
      );
    },
    initialData: []
  });

  const joinMutation = useMutation({
    mutationFn: async (challengeId) => {
      return await base44.entities.ChallengeParticipant.create({
        challenge_id: challengeId,
        user_email: user.email,
        status: 'active',
        progress: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my2026Participations']);
      toast.success('Challenge joined! 🎯');
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ participationId, progress }) => {
      return await base44.entities.ChallengeParticipant.update(participationId, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my2026Participations']);
      toast.success('Progress updated! 🔥');
    }
  });

  const isParticipating = (challengeId) => {
    return myParticipations.some(p => p.challenge_id === challengeId);
  };

  return (
    <div className="space-y-6">
      {/* Featured Challenges */}
      <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Trophy className="w-6 h-6" />
            2026 Group Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pre-defined 2026 Challenges */}
            <ChallengePreview
              title="366 Days of Growth"
              description="Complete daily check-ins for all 427 days (Nov 2025 - Dec 2026)"
              participants={156}
              difficulty="challenging"
              duration="427 days"
              icon="🌱"
              gradient="from-green-400 to-emerald-500"
            />
            <ChallengePreview
              title="Monthly Mission Master"
              description="Complete all monthly missions for at least 3 goals"
              participants={89}
              difficulty="moderate"
              duration="12 months"
              icon="🎯"
              gradient="from-blue-400 to-cyan-500"
            />
            <ChallengePreview
              title="Streak Keeper"
              description="Maintain a 30-day check-in streak"
              participants={234}
              difficulty="moderate"
              duration="30 days"
              icon="🔥"
              gradient="from-orange-400 to-red-500"
            />
            <ChallengePreview
              title="Transformation Tribe"
              description="Share progress weekly and support 10+ community members"
              participants={67}
              difficulty="easy"
              duration="3 months"
              icon="💪"
              gradient="from-purple-400 to-pink-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {challenges.map((challenge, idx) => {
            const participating = isParticipating(challenge.id);
            const myParticipation = myParticipations.find(p => p.challenge_id === challenge.id);

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-200 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-2">{challenge.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {challenge.participant_count || 0} joined
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {challenge.duration}
                          </Badge>
                        </div>

                        {participating && myParticipation && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Your Progress</span>
                              <span className="font-bold text-orange-600">{myParticipation.progress || 0}%</span>
                            </div>
                            <Progress value={myParticipation.progress || 0} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        if (!participating) {
                          joinMutation.mutate(challenge.id);
                        }
                      }}
                      disabled={participating || joinMutation.isPending}
                      className={`w-full ${
                        participating
                          ? 'bg-green-600'
                          : 'bg-gradient-to-r from-orange-600 to-red-600'
                      }`}
                    >
                      {participating ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Participating
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Join Challenge
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {challenges.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-200">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No active challenges yet</h3>
            <p className="text-gray-500 text-sm">Check back soon for exciting 2026 challenges!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ChallengePreview({ title, description, participants, difficulty, duration, icon, gradient }) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    challenging: 'bg-red-100 text-red-700'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-md cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h5 className="font-bold text-gray-800 mb-1">{title}</h5>
          <p className="text-xs text-gray-600 mb-2">{description}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge className={`${difficultyColors[difficulty]} text-xs`}>
              {difficulty}
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 text-xs">
              {duration}
            </Badge>
            <Badge className="bg-purple-100 text-purple-700 text-xs">
              {participants} joined
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}