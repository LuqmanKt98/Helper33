import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Trophy,
  Zap,
  Check,
  X,
  Target,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { addDays } from 'date-fns';
import { toast } from 'sonner';

const challengeTemplates = [
  {
    type: 'streak_race',
    title: '7-Day Streak Race',
    description: 'Who can maintain a longer wellness streak?',
    icon: '🔥',
    duration: 7
  },
  {
    type: 'wellness_goals',
    title: 'Wellness Goals Sprint',
    description: 'Complete the most wellness activities',
    icon: '💪',
    duration: 7
  },
  {
    type: 'mindfulness_minutes',
    title: 'Mindfulness Marathon',
    description: 'See who can meditate the most minutes',
    icon: '🧘',
    duration: 7
  },
  {
    type: 'journal_entries',
    title: 'Journal Journey',
    description: 'Who writes more journal entries?',
    icon: '📝',
    duration: 7
  }
];

export default function FriendChallenges({ friends }) {
  const [selectedFriend, setSelectedFriend] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['friend-challenges'],
    queryFn: async () => {
      const sent = await base44.entities.FriendChallenge.filter({
        challenger_email: user?.email
      });
      const received = await base44.entities.FriendChallenge.filter({
        challenged_email: user?.email
      });
      return [...sent, ...received].sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    enabled: !!user
  });

  const activeChallenges = myChallenges.filter(c => c.status === 'active' || c.status === 'accepted');
  const pendingChallenges = myChallenges.filter(c => c.status === 'pending');
  const completedChallenges = myChallenges.filter(c => c.status === 'completed');

  const createChallengeMutation = useMutation({
    mutationFn: async () => {
      const template = challengeTemplates.find(t => t.type === selectedTemplate);
      const friend = friends.find(f => f.email === selectedFriend);

      if (!friend) throw new Error('Please select a friend');
      if (!template) throw new Error('Please select a challenge type');

      const startDate = new Date();
      const endDate = addDays(startDate, template.duration);

      return base44.entities.FriendChallenge.create({
        challenger_email: user.email,
        challenger_name: user.full_name,
        challenger_avatar: user.avatar_url,
        challenged_email: friend.email,
        challenged_name: friend.name,
        challenged_avatar: friend.avatar,
        challenge_type: template.type,
        challenge_title: customTitle || template.title,
        challenge_description: customDescription || template.description,
        duration_days: template.duration,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'pending',
        prize_points: template.duration * 100
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-challenges']);
      toast.success('Challenge sent! 🎯');
      setIsDialogOpen(false);
      setSelectedFriend('');
      setSelectedTemplate('');
      setCustomTitle('');
      setCustomDescription('');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const respondToChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, action }) => {
      return base44.entities.FriendChallenge.update(challengeId, {
        status: action === 'accept' ? 'active' : 'declined'
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['friend-challenges']);
      toast.success(variables.action === 'accept' ? "Challenge accepted! Let's go! 🎉" : 'Challenge declined');
    }
  });

  return (
    <div className="space-y-6">
      {/* Create Challenge Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 gap-2 text-lg py-6">
            <Target className="w-5 h-5" />
            Challenge a Friend
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              Create Friend Challenge
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Choose Friend
              </label>
              <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a friend..." />
                </SelectTrigger>
                <SelectContent>
                  {friends.map((friend) => (
                    <SelectItem key={friend.email} value={friend.email}>
                      {friend.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Challenge Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {challengeTemplates.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => setSelectedTemplate(template.type)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate === template.type
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <p className="text-xs font-semibold text-gray-900">{template.title}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTemplate && (
              <>
                <Input
                  placeholder="Custom title (optional)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Custom description (optional)"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={2}
                />
              </>
            )}

            <Button
              onClick={() => createChallengeMutation.mutate()}
              disabled={!selectedFriend || !selectedTemplate || createChallengeMutation.isPending}
              className="w-full bg-purple-600"
            >
              Send Challenge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Challenges */}
      {pendingChallenges.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
              Pending Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingChallenges.map((challenge) => {
              const isChallenged = challenge.challenged_email === user?.email;

              return (
                <Card key={challenge.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{challenge.challenge_title}</p>
                        <p className="text-sm text-gray-600">{challenge.challenge_description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          From: {isChallenged ? challenge.challenger_name : challenge.challenged_name}
                        </p>
                      </div>
                      {isChallenged && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => respondToChallengeMutation.mutate({ challengeId: challenge.id, action: 'accept' })}
                            size="sm"
                            className="bg-green-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => respondToChallengeMutation.mutate({ challengeId: challenge.id, action: 'decline' })}
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeChallenges.map((challenge, idx) => {
              const isChallenger = challenge.challenger_email === user?.email;
              const opponentName = isChallenger ? challenge.challenged_name : challenge.challenger_name;
              const myProgress = isChallenger ? challenge.challenger_progress : challenge.challenged_progress;
              const theirProgress = isChallenger ? challenge.challenged_progress : challenge.challenger_progress;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">{challenge.challenge_title}</h4>
                          <p className="text-sm text-gray-600">vs. {opponentName}</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                          {Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                        </Badge>
                      </div>

                      {/* Progress Comparison */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg border-2 border-purple-400">
                          <p className="text-xs text-gray-600 mb-1">You</p>
                          <p className="text-3xl font-bold text-purple-600">
                            {myProgress?.current_value || 0}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border-2 border-gray-300">
                          <p className="text-xs text-gray-600 mb-1">{opponentName}</p>
                          <p className="text-3xl font-bold text-gray-600">
                            {theirProgress?.current_value || 0}
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Prize: <span className="font-bold text-purple-600">{challenge.prize_points} points</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Completed Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedChallenges.slice(0, 5).map((challenge) => {
              const isWinner = challenge.winner_email === user?.email;

              return (
                <Card key={challenge.id} className={`${
                  isWinner ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400' : 'bg-gray-50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{challenge.challenge_title}</p>
                        <p className="text-sm text-gray-600">
                          vs. {challenge.challenger_email === user?.email ? challenge.challenged_name : challenge.challenger_name}
                        </p>
                      </div>
                      {isWinner && (
                        <Badge className="bg-green-600">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                      {challenge.is_tie && (
                        <Badge className="bg-blue-600">Tie</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {myChallenges.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Challenges Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Challenge a friend to a friendly wellness competition!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}