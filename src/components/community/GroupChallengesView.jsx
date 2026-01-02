
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Target,
  Users,
  Calendar,
  Trophy,
  CheckCircle,
  Flame,
  ArrowRight,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

export default function GroupChallengesView({ challenges = [] }) {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { data: myParticipations = [] } = useQuery({
    queryKey: ['myParticipations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Add null safety check
  const safeChallenges = Array.isArray(challenges) ? challenges : [];
  const activeChallenges = safeChallenges.filter(c => c.status === 'active');
  const upcomingChallenges = safeChallenges.filter(c => c.status === 'upcoming');

  return (
    <div className="space-y-6">
      {selectedChallenge ? (
        <ChallengeDetailView
          challenge={selectedChallenge}
          onBack={() => setSelectedChallenge(null)}
          myParticipation={myParticipations.find(p => p.challenge_id === selectedChallenge.id)}
        />
      ) : (
        <>
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                Active Now
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {activeChallenges.map((challenge, idx) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    myParticipation={myParticipations.find(p => p.challenge_id === challenge.id)}
                    onClick={() => setSelectedChallenge(challenge)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Challenges */}
          {upcomingChallenges.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                Coming Soon
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingChallenges.map((challenge, idx) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    myParticipation={null}
                    onClick={() => setSelectedChallenge(challenge)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {safeChallenges.length === 0 && (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Challenges Available
                </h3>
                <p className="text-gray-600">
                  Check back soon for new community challenges!
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function ChallengeCard({ challenge, myParticipation, onClick, index }) {
  const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
  const isJoined = !!myParticipation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        onClick={onClick}
        className="cursor-pointer hover:shadow-2xl transition-all bg-white/80 backdrop-blur-sm border-2 hover:border-purple-400"
      >
        {challenge.image_url && (
          <div className="h-40 overflow-hidden rounded-t-lg">
            <img
              src={challenge.image_url}
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Badge className="bg-purple-100 text-purple-700">
              {challenge.challenge_type.replace('_', ' ')}
            </Badge>
            {isJoined && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Joined
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {challenge.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {challenge.description}
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{challenge.duration_days} days</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span>{challenge.participant_count || 0}</span>
              </div>
              {challenge.status === 'active' && (
                <div className="flex items-center gap-1 ml-auto">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-600 font-semibold">{daysLeft} days left</span>
                </div>
              )}
            </div>

            {isJoined && myParticipation && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Your Progress</span>
                  <span className="text-xs font-bold text-purple-700">
                    {myParticipation.completion_percentage?.toFixed(0) || 0}%
                  </span>
                </div>
                <Progress value={myParticipation.completion_percentage || 0} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChallengeDetailView({ challenge, onBack, myParticipation }) {
  const [anonymousName, setAnonymousName] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { data: participants = [] } = useQuery({
    queryKey: ['challengeParticipants', challenge.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challenge.id);
      if (error) throw error;
      return data || [];
    }
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const displayName = anonymousName.trim() || `Challenger${Math.floor(Math.random() * 1000)}`;

      const { error: joinError } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          display_name: displayName,
          is_anonymous: true,
          status: 'active',
          current_day: 0,
          completed_days: [],
          check_ins: []
        });

      if (joinError) throw joinError;

      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          participant_count: (challenge.participant_count || 0) + 1
        })
        .eq('id', challenge.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['challengeParticipants', challenge.id] });
      queryClient.invalidateQueries({ queryKey: ['activeChallenges'] });
      toast.success('Welcome to the challenge! 🎉');
      setShowJoinForm(false);
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async (day) => {
      const updatedCheckIns = [...(myParticipation.check_ins || [])];
      updatedCheckIns.push({
        day,
        completed: true,
        timestamp: new Date().toISOString()
      });

      const completedDays = [...(myParticipation.completed_days || []), day];
      const completion = (completedDays.length / challenge.duration_days) * 100;

      const { error: updatePartError } = await supabase
        .from('challenge_participants')
        .update({
          current_day: day,
          completed_days: completedDays,
          completion_percentage: completion,
          check_ins: updatedCheckIns,
          status: completion === 100 ? 'completed' : 'active'
        })
        .eq('id', myParticipation.id);

      if (updatePartError) throw updatePartError;

      if (completion === 100) {
        await supabase
          .from('challenges')
          .update({
            completion_count: (challenge.completion_count || 0) + 1
          })
          .eq('id', challenge.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myParticipations'] });
      queryClient.invalidateQueries({ queryKey: ['challengeParticipants', challenge.id] });
      toast.success('Day checked in! 🌟');
    }
  });

  const daysLeft = differenceInDays(new Date(challenge.end_date), new Date());
  const isJoined = !!myParticipation;

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to Challenges
      </Button>

      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <Badge className="bg-white/20 text-white mb-3">
                {challenge.challenge_type.replace('_', ' ')}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{challenge.title}</h1>
              <p className="text-purple-100 text-lg leading-relaxed">
                {challenge.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Calendar className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{challenge.duration_days}</p>
              <p className="text-sm text-purple-100">Days</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{challenge.participant_count || 0}</p>
              <p className="text-sm text-purple-100">Participants</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Trophy className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{challenge.completion_count || 0}</p>
              <p className="text-sm text-purple-100">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isJoined && !showJoinForm && (
        <Card className="border-2 border-purple-300">
          <CardContent className="p-8 text-center">
            <Target className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to join this challenge?
            </h3>
            <p className="text-gray-600 mb-6">
              Join {challenge.participant_count || 0} others on this {challenge.duration_days}-day journey
            </p>
            <Button
              onClick={() => setShowJoinForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
              size="lg"
            >
              Join Challenge
            </Button>
          </CardContent>
        </Card>
      )}

      {showJoinForm && !isJoined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-2 border-purple-300">
            <CardHeader>
              <CardTitle>Join Anonymously</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Choose a display name (optional)
                </label>
                <Input
                  value={anonymousName}
                  onChange={(e) => setAnonymousName(e.target.value)}
                  placeholder="e.g., HopefulHeart, GrowingStrong..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leave blank for a random anonymous name
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {joinMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Join Challenge
                </Button>
                <Button onClick={() => setShowJoinForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isJoined && myParticipation && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Completion</span>
                <span className="text-xl font-bold text-green-700">
                  {myParticipation.completion_percentage?.toFixed(0) || 0}%
                </span>
              </div>
              <Progress value={myParticipation.completion_percentage || 0} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">Days Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myParticipation.completed_days?.length || 0}/{challenge.duration_days}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600 flex items-center gap-1">
                  <Flame className="w-5 h-5" />
                  {calculateStreak(myParticipation.completed_days || [])}
                </p>
              </div>
            </div>

            <DailyCheckInSection
              challenge={challenge}
              myParticipation={myParticipation}
              onCheckIn={(day) => checkInMutation.mutate(day)}
            />
          </CardContent>
        </Card>
      )}

      {/* Daily Actions */}
      {challenge.daily_actions && challenge.daily_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Daily Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {challenge.daily_actions.slice(0, 5).map((action, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-purple-700 text-sm">{action.day}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{action.action}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              ))}
              {challenge.daily_actions.length > 5 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{challenge.daily_actions.length - 5} more days
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants Feed */}
      <ParticipantsFeed participants={participants} challenge={challenge} />
    </div>
  );
}

function DailyCheckInSection({ challenge, myParticipation, onCheckIn }) {
  const nextDay = (myParticipation.current_day || 0) + 1;
  const todayAction = challenge.daily_actions?.find(a => a.day === nextDay);
  const alreadyCheckedToday = myParticipation.completed_days?.includes(nextDay);

  if (nextDay > challenge.duration_days) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 text-center border-2 border-yellow-300">
        <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <h4 className="text-xl font-bold text-gray-900 mb-2">
          Challenge Completed! 🎉
        </h4>
        <p className="text-gray-700">
          Congratulations on completing this {challenge.duration_days}-day journey!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
          {nextDay}
        </div>
        <h4 className="font-bold text-gray-900">Today's Action</h4>
      </div>

      {todayAction && (
        <div className="mb-4">
          <p className="font-semibold text-gray-900 mb-1">{todayAction.action}</p>
          <p className="text-sm text-gray-600">{todayAction.description}</p>
        </div>
      )}

      <Button
        onClick={() => onCheckIn(nextDay)}
        disabled={alreadyCheckedToday}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      >
        {alreadyCheckedToday ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Checked In Today!
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Check In for Day {nextDay}
          </>
        )}
      </Button>
    </div>
  );
}

function ParticipantsFeed({ participants, challenge }) {
  const recentCheckIns = participants
    .flatMap(p =>
      (p.check_ins || []).map(checkIn => ({
        ...checkIn,
        participant: p.display_name
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentCheckIns.length > 0 ? (
          <div className="space-y-3">
            {recentCheckIns.map((checkIn, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {checkIn.participant} completed Day {checkIn.day}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(checkIn.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">
            No activity yet. Be the first to check in!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function calculateStreak(completedDays) {
  if (!completedDays || completedDays.length === 0) return 0;

  const sorted = [...completedDays].sort((a, b) => b - a);
  let streak = 1;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] - sorted[i + 1] === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
