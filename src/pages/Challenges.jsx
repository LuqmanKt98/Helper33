import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Trophy,
  Users,
  Calendar,
  CheckCircle,
  Flame,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Challenges() {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Use AuthContext for user

  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['groupChallenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['myParticipations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('participant_email', user.email);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email,
    initialData: []
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          participant_email: user.email,
          participant_name: user.user_metadata?.full_name || user.email,
          progress: 0,
          status: 'active',
          goal_value: challenge.goal_value || 30,
          user_id: user.id // Best practice to link by ID as well if schema supports it
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      toast.success('🎉 You joined the challenge!');
    },
    onError: (error) => {
      console.error('Error joining challenge:', error);
      toast.error('Failed to join challenge');
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (variables) => {
      const { participationId, newProgress } = variables;
      const { data, error } = await supabase
        .from('challenge_participants')
        .update({ progress: newProgress })
        .eq('id', participationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      toast.success('Progress updated! 🌟');
    },
    onError: (error) => {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  });

  const activeChallenges = challenges.filter(c => c.status === 'active');

  // Merge participations with challenge data
  const myChallenges = myParticipations.map(p => {
    const challenge = challenges.find(c => c.id === p.challenge_id);
    return { ...p, challenge };
  }).filter(item => item.challenge); // Only show if challenge still exists

  if (isLoadingChallenges) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="flex justify-center mb-4"
          >
            <Loader2 className="h-12 w-12 text-purple-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-purple-800">Loading Challenges...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Community Challenges - Helper33"
        description="Join wellness challenges, track your progress, and achieve goals together with the Helper33 community"
        keywords="wellness challenges, community goals, health tracking, group activities, personal growth"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Navigation */}
          <div className="mb-6">
            <BackButton />
            <div className="mt-3">
              <Breadcrumbs
                items={[
                  { label: 'Community', path: 'Community' },
                  { label: 'Challenges' }
                ]}
              />
            </div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border-2 border-purple-200 mb-4">
              <Target className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-bold text-purple-800">Community Challenges</span>
              <Sparkles className="w-5 h-5 text-pink-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Join the Challenge! 🎯
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Achieve your wellness goals together with our supportive community. Track progress, stay motivated, and celebrate wins!
            </p>
          </motion.div>

          {/* My Active Challenges */}
          {myChallenges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">My Active Challenges</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChallenges.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-4xl">{item.challenge?.icon || '🎯'}</div>
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            Active
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{item.challenge?.title}</CardTitle>
                        <CardDescription>{item.challenge?.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-bold text-purple-600">
                                {item.progress || 0} / {item.goal_value}
                              </span>
                            </div>
                            <Progress
                              value={(item.progress / item.goal_value) * 100}
                              className="h-3"
                            // @ts-ignore
                            />
                          </div>

                          <Button
                            onClick={() => {
                              const newProgress = Math.min((item.progress || 0) + 1, item.goal_value);
                              updateProgressMutation.mutate({
                                participationId: item.id,
                                newProgress
                              });
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            disabled={item.progress >= item.goal_value || updateProgressMutation.isPending}
                          >
                            {updateProgressMutation.isPending && updateProgressMutation.variables?.participationId === item.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : item.progress >= item.goal_value ? (
                              <>
                                <Trophy className="w-4 h-4 mr-2" />
                                Completed!
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Log Progress
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Available Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Available Challenges</h2>
            </div>

            {activeChallenges.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 p-8 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Challenges</h3>
                <p className="text-gray-600">Check back soon for new challenges!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeChallenges.map((challenge, index) => {
                  const isJoined = myParticipations.some(p => p.challenge_id === challenge.id);
                  const participantCount = challenge.participant_count || 0;

                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${challenge.color_theme || 'from-purple-500 to-blue-500'}`} />

                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-4xl">{challenge.icon || '🎯'}</div>
                            {isJoined && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                Joined
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                            {challenge.title}
                          </CardTitle>
                          <CardDescription>{challenge.description}</CardDescription>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-4">
                            {/* Challenge Info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{participantCount} joined</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{challenge.duration_days || 30} days</span>
                              </div>
                            </div>

                            {/* Goal */}
                            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                              <div className="flex items-center gap-2 text-sm font-semibold text-purple-800">
                                <Target className="w-4 h-4" />
                                Goal: {challenge.goal_description}
                              </div>
                            </div>

                            {/* Action Button */}
                            {!isJoined ? (
                              <Button
                                onClick={() => joinChallengeMutation.mutate(challenge.id)}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                disabled={joinChallengeMutation.isPending}
                              >
                                {joinChallengeMutation.isPending && joinChallengeMutation.variables === challenge.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                Join Challenge
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full border-purple-300 text-purple-700"
                                disabled
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Already Joined
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Motivational Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center shadow-2xl"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-2">You've Got This! 💪</h3>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Every small step counts. Join a challenge today and transform your wellness journey with the support of our amazing community!
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}