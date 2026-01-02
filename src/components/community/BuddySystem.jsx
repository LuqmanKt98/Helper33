
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Send,
  CheckCircle,
  Clock,
  Heart,
  Target,
  Calendar,
  Bell,
  Sparkles,
  Share2,
  X,
  Check,
  Trophy // Added Trophy icon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import BuddyChallengeManager from './BuddyChallengeManager'; // Added BuddyChallengeManager import
import BuddyMatchmaking from './BuddyMatchmaking';
import CommunityProfileSetup from './CommunityProfileSetup';

const ENCOURAGEMENT_TEMPLATES = [
  { emoji: '💪', text: "You've got this! Keep pushing forward!", type: 'cheer' },
  { emoji: '🌟', text: "Your progress is inspiring! Keep shining!", type: 'cheer' },
  { emoji: '🎉', text: "Amazing milestone! So proud of you!", type: 'milestone_celebration' },
  { emoji: '❤️', text: "Sending you strength and support today", type: 'support' },
  { emoji: '👏', text: "Every step counts! You're doing great!", type: 'cheer' },
  { emoji: '🙏', text: "Grateful to be on this journey with you", type: 'gratitude' },
  { emoji: '🔥', text: "You're on fire! Keep that momentum going!", type: 'inspiration' },
  { emoji: '🌈', text: "Remember: progress, not perfection!", type: 'support' }
];

const QUICK_REACTIONS = [
  { emoji: '💪', label: 'You got this!' },
  { emoji: '🔥', label: 'On fire!' },
  { emoji: '🎉', label: 'Amazing!' },
  { emoji: '👏', label: 'Well done!' },
  { emoji: '⭐', label: 'Superstar!' },
  { emoji: '❤️', label: 'Sending love!' }
];

export default function BuddySystem() {
  const [activeTab, setActiveTab] = useState('my-buddies');
  const [showFindBuddy, setShowFindBuddy] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showEncouragementModal, setShowEncouragementModal] = useState(false);
  const [showGoalShareModal, setShowGoalShareModal] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [checkInData, setCheckInData] = useState({
    progress_summary: '',
    mood: 'good',
    wins: [''],
    challenges: [''],
    needs_support_with: '',
    commitment_for_next: ''
  });
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // New state for challenges
  const [showChallenges, setShowChallenges] = useState(false);
  const [selectedBuddyForChallenges, setSelectedBuddyForChallenges] = useState(null);
  // New state for profile setup
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myBuddies = [] } = useQuery({
    queryKey: ['buddyConnections'],
    queryFn: async () => {
      const connections = await base44.entities.BuddyConnection.list('-created_date');
      return connections.filter(c =>
        c.requester_email === user?.email || c.buddy_email === user?.email
      );
    },
    enabled: !!user
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['potentialBuddies'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user && showFindBuddy
  });

  const { data: myGoals = [] } = useQuery({
    queryKey: ['myGoals'],
    queryFn: () => base44.entities.CoachingGoal.filter({ status: 'active' }),
    enabled: !!user
  });

  const { data: upcomingCheckIns = [] } = useQuery({
    queryKey: ['upcomingCheckIns'],
    queryFn: async () => {
      const checkIns = await base44.entities.BuddyCheckIn.list('-check_in_date');
      return checkIns.filter(c => !c.both_completed);
    },
    enabled: !!user
  });

  const { data: encouragements = [] } = useQuery({
    queryKey: ['encouragements'],
    queryFn: () => base44.entities.BuddyEncouragement.filter({
      receiver_email: user?.email,
      is_read: false
    }),
    enabled: !!user
  });

  const { data: userCommunityProfile } = useQuery({
    queryKey: ['communityProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserCommunityProfile.filter({
        created_by: user.email
      });
      return profiles[0];
    },
    enabled: !!user
  });

  const requestBuddyMutation = useMutation({
    mutationFn: (data) => base44.entities.BuddyConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buddyConnections']);
      setShowFindBuddy(false);
      setConnectionMessage('');
      toast.success('Buddy request sent! 🤝');
    }
  });

  const updateBuddyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BuddyConnection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buddyConnections']);
      toast.success('Updated!');
    }
  });

  const submitCheckInMutation = useMutation({
    mutationFn: async ({ connectionId, checkInId, isRequester }) => {
      const updateField = isRequester ? 'requester_update' : 'buddy_update';
      const completedField = isRequester ? 'requester_completed' : 'buddy_completed';

      const updateData = {
        [updateField]: {
          ...checkInData,
          submitted_at: new Date().toISOString()
        },
        [completedField]: true
      };

      const updated = await base44.entities.BuddyCheckIn.update(checkInId, updateData);

      // Check if both completed
      if (updated.requester_completed && updated.buddy_completed && !updated.both_completed) {
        await base44.entities.BuddyCheckIn.update(checkInId, {
          both_completed: true,
          completed_at: new Date().toISOString()
        });
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['upcomingCheckIns']);
      setShowCheckInModal(false);
      setCheckInData({
        progress_summary: '',
        mood: 'good',
        wins: [''],
        challenges: [''],
        needs_support_with: '',
        commitment_for_next: ''
      });
      toast.success('Check-in submitted! 📝');
    }
  });

  const sendEncouragementMutation = useMutation({
    mutationFn: (data) => base44.entities.BuddyEncouragement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['encouragements']);
      setShowEncouragementModal(false);
      setEncouragementMessage('');
      setSelectedTemplate(null);
      toast.success('Encouragement sent! 💜');
    }
  });

  const activeBuddies = myBuddies.filter(b => b.status === 'active');
  const pendingRequests = myBuddies.filter(b => b.status === 'pending');

  const isMyRequest = (buddy) => buddy.requester_email === user?.email;
  const getBuddyInfo = (buddy) => {
    if (isMyRequest(buddy)) {
      return {
        name: buddy.buddy_name,
        email: buddy.buddy_email,
        avatar: buddy.buddy_avatar
      };
    }
    return {
      name: buddy.requester_name,
      email: buddy.requester_email,
      avatar: buddy.requester_avatar
    };
  };

  const handleRequestBuddy = (potentialBuddy) => {
    if (!connectionMessage.trim()) {
      toast.error('Please add a message to your buddy request');
      return;
    }

    requestBuddyMutation.mutate({
      requester_email: user.email,
      requester_name: user.full_name,
      requester_avatar: user.avatar_url,
      buddy_email: potentialBuddy.email,
      buddy_name: potentialBuddy.full_name,
      buddy_avatar: potentialBuddy.avatar_url,
      connection_type: 'goal_accountability',
      connection_message: connectionMessage,
      status: 'pending'
    });
  };

  const handleAcceptBuddy = (buddy) => {
    updateBuddyMutation.mutate({
      id: buddy.id,
      data: {
        status: 'active',
        accepted_at: new Date().toISOString()
      }
    });
  };

  const handleSendEncouragement = () => {
    if (!encouragementMessage.trim()) {
      toast.error('Please write an encouragement message');
      return;
    }

    const buddyInfo = getBuddyInfo(selectedConnection);

    sendEncouragementMutation.mutate({
      buddy_connection_id: selectedConnection.id,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: buddyInfo.email,
      receiver_name: buddyInfo.name,
      encouragement_type: selectedTemplate?.type || 'cheer',
      message: encouragementMessage,
      reaction_emoji: selectedTemplate?.emoji || '💜'
    });
  };

  const sendQuickReaction = (buddy, reaction) => {
    const buddyInfo = getBuddyInfo(buddy);

    sendEncouragementMutation.mutate({
      buddy_connection_id: buddy.id,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: buddyInfo.email,
      receiver_name: buddyInfo.name,
      encouragement_type: 'cheer',
      message: reaction.label,
      reaction_emoji: reaction.emoji
    });
  };

  const potentialBuddies = allUsers.filter(u =>
    u.email !== user?.email &&
    !myBuddies.some(b => b.buddy_email === u.email || b.requester_email === u.email) &&
    (searchTerm === '' ||
     u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            Accountability Buddies
          </h2>
          <p className="text-gray-600 mt-1">Find support partners to achieve your goals together</p>
        </div>
        <Button
          onClick={() => setShowFindBuddy(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Find a Buddy
        </Button>
      </div>

      {/* Unread Encouragements */}
      {encouragements.length > 0 && (
        <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900">
                  You have {encouragements.length} new encouragement{encouragements.length > 1 ? 's' : ''}!
                </h3>
                <p className="text-sm text-purple-700">Your buddies are cheering you on</p>
              </div>
              <Badge className="bg-pink-600 text-white">{encouragements.length}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Setup Prompt */}
      {!userCommunityProfile?.profile_completed && (
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">
                    Get Better Matches!
                  </h3>
                  <p className="text-sm text-purple-700">
                    Complete your community profile for AI-powered buddy recommendations
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowProfileSetup(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Setup Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {pendingRequests.filter(r => !isMyRequest(r)).length} pending buddy request(s)
                  </h3>
                  <p className="text-sm text-blue-700">Review and accept to start your journey together</p>
                </div>
              </div>
              <Button
                onClick={() => setActiveTab('requests')}
                variant="outline"
                className="bg-white"
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-white">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Discover</span>
            <Badge variant="secondary" className="ml-1 hidden sm:inline">AI</Badge>
          </TabsTrigger>
          <TabsTrigger value="my-buddies" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">My Buddies</span>
            <span className="sm:hidden">Buddies</span>
            {activeBuddies.length > 0 && (
              <Badge variant="secondary" className="ml-1">{activeBuddies.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="check-ins" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Check-ins</span>
            {upcomingCheckIns.length > 0 && (
              <Badge variant="secondary" className="ml-1">{upcomingCheckIns.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Requests</span>
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="encouragements" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
            {encouragements.length > 0 && (
              <Badge variant="destructive" className="ml-1">{encouragements.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab - NEW */}
        <TabsContent value="discover" className="space-y-4">
          <BuddyMatchmaking currentUser={user} existingBuddies={myBuddies} />
        </TabsContent>

        {/* My Buddies Tab */}
        <TabsContent value="my-buddies" className="space-y-4">
          {activeBuddies.length === 0 ? (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Accountability Buddies Yet</h3>
                <p className="text-gray-600 mb-6">
                  Find a buddy to support each other's goals and celebrate wins together
                </p>
                <Button
                  onClick={() => setShowFindBuddy(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Your First Buddy
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeBuddies.map(buddy => {
                const buddyInfo = getBuddyInfo(buddy);
                const daysConnected = Math.floor(
                  (new Date() - new Date(buddy.accepted_at)) / (1000 * 60 * 60 * 24)
                );

                return (
                  <motion.div
                    key={buddy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-white hover:shadow-xl transition-all border-2 border-purple-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {buddyInfo.avatar ? (
                              <img
                                src={buddyInfo.avatar}
                                alt={buddyInfo.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-lg">{buddyInfo.name}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge className="bg-purple-100 text-purple-800">
                                  {buddy.connection_type.replace(/_/g, ' ')}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">{daysConnected}</div>
                            <div className="text-xs text-gray-600">Days</div>
                          </div>
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{buddy.total_check_ins || 0}</div>
                            <div className="text-xs text-gray-600">Check-ins</div>
                          </div>
                          <div className="p-2 bg-pink-50 rounded-lg">
                            <div className="text-lg font-bold text-pink-600">
                              {(buddy.shared_goals?.length || 0)}
                            </div>
                            <div className="text-xs text-gray-600">Shared Goals</div>
                          </div>
                        </div>

                        {/* Quick Reactions */}
                        <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-700 mb-2">Quick Encouragement</p>
                          <div className="flex gap-2 flex-wrap">
                            {QUICK_REACTIONS.map(reaction => (
                              <button
                                key={reaction.emoji}
                                onClick={() => sendQuickReaction(buddy, reaction)}
                                className="text-2xl hover:scale-125 transition-transform active:scale-95"
                                title={reaction.label}
                              >
                                {reaction.emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Next Check-in */}
                        {buddy.next_check_in_date && (
                          <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <div className="text-sm">
                              <span className="font-semibold text-blue-900">Next Check-in: </span>
                              <span className="text-blue-700">
                                {new Date(buddy.next_check_in_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedConnection(buddy);
                              setShowCheckInModal(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Check In
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedConnection(buddy);
                              setShowEncouragementModal(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
                            size="sm"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Encourage
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => {
                              setSelectedConnection(buddy);
                              setShowGoalShareModal(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Goals ({buddy.shared_goals?.length || 0})
                          </Button>

                          <Button
                            onClick={() => {
                              setSelectedBuddyForChallenges(buddy);
                              setShowChallenges(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300"
                          >
                            <Trophy className="w-4 h-4 mr-2 text-amber-600" />
                            Challenges
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Check-ins Tab */}
        <TabsContent value="check-ins" className="space-y-4">
          {upcomingCheckIns.length === 0 ? (
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending check-ins at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingCheckIns.map(checkIn => {
                const connection = myBuddies.find(b => b.id === checkIn.buddy_connection_id);
                if (!connection) return null;

                const buddyInfo = getBuddyInfo(connection);
                const isRequester = connection.requester_email === user?.email;
                const myCompleted = isRequester ? checkIn.requester_completed : checkIn.buddy_completed;
                const buddyCompleted = isRequester ? checkIn.buddy_completed : checkIn.requester_completed;

                return (
                  <Card key={checkIn.id} className="bg-white border-2 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Check-in with {buddyInfo.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(checkIn.check_in_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge className={myCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {myCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            myCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {myCompleted ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white text-xs">You</span>
                            )}
                          </div>
                          <span className="text-gray-700">Your update</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            buddyCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {buddyCompleted ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <Clock className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <span className="text-gray-700">{buddyInfo.name}'s update</span>
                        </div>
                      </div>

                      {!myCompleted && (
                        <Button
                          onClick={() => {
                            setSelectedConnection(connection);
                            setShowCheckInModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Your Check-in
                        </Button>
                      )}

                      {myCompleted && !buddyCompleted && (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800 text-center">
                            ⏳ Waiting for {buddyInfo.name} to check in...
                          </p>
                        </div>
                      )}

                      {checkIn.both_completed && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 text-center flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Both check-ins complete! Great teamwork! 🎉
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">You're all set!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(buddy => {
                const isSentByMe = isMyRequest(buddy);
                const buddyInfo = getBuddyInfo(buddy);

                return (
                  <Card key={buddy.id} className="bg-white border-2 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {buddyInfo.avatar ? (
                          <img
                            src={buddyInfo.avatar}
                            alt={buddyInfo.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">{buddyInfo.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{buddyInfo.email}</p>

                          {buddy.connection_message && (
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-3">
                              <p className="text-sm text-purple-900 italic">
                                "{buddy.connection_message}"
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-purple-100 text-purple-800">
                              {buddy.connection_type.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {isSentByMe ? 'Sent by you' : 'Received'}
                            </Badge>
                          </div>

                          {!isSentByMe && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAcceptBuddy(buddy)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => {
                                  updateBuddyMutation.mutate({
                                    id: buddy.id,
                                    data: { status: 'ended' }
                                  });
                                }}
                                variant="outline"
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          )}

                          {isSentByMe && (
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Waiting for response...
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Encouragements Tab */}
        <TabsContent value="encouragements" className="space-y-4">
          {encouragements.length === 0 ? (
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50">
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No New Messages</h3>
                <p className="text-gray-600">Check back later for buddy encouragements</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {encouragements.map(enc => (
                <motion.div
                  key={enc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{enc.reaction_emoji}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            From {enc.sender_name}
                          </h4>
                          <p className="text-gray-700 mb-2">{enc.message}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Badge className="bg-pink-200 text-pink-900">
                              {enc.encouragement_type.replace(/_/g, ' ')}
                            </Badge>
                            <span>•</span>
                            <span>{new Date(enc.created_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            base44.entities.BuddyEncouragement.update(enc.id, {
                              is_read: true,
                              read_at: new Date().toISOString()
                            }).then(() => {
                              queryClient.invalidateQueries(['encouragements']);
                            });
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          Mark Read
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Find Buddy Modal */}
      <Dialog open={showFindBuddy} onOpenChange={setShowFindBuddy}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Find an Accountability Buddy</DialogTitle>
            <DialogDescription>
              Connect with someone to support each other's goals and journey
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="max-h-96 overflow-y-auto space-y-3">
              {potentialBuddies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No users found</p>
                </div>
              ) : (
                potentialBuddies.map(potentialBuddy => (
                  <Card key={potentialBuddy.email} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {potentialBuddy.avatar_url ? (
                            <img
                              src={potentialBuddy.avatar_url}
                              alt={potentialBuddy.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <h5 className="font-semibold text-gray-900">{potentialBuddy.full_name}</h5>
                            <p className="text-xs text-gray-600">{potentialBuddy.email}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedBuddy(potentialBuddy)}
                          variant="outline"
                          size="sm"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {selectedBuddy && (
              <div className="space-y-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                <h4 className="font-semibold text-purple-900">
                  Send buddy request to {selectedBuddy.full_name}
                </h4>
                <Textarea
                  placeholder="Why would you like to be accountability buddies? Share a bit about your goals..."
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRequestBuddy(selectedBuddy)}
                    disabled={requestBuddyMutation.isPending || !connectionMessage.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {requestBuddyMutation.isPending ? (
                      <>Sending...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Send Request</>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedBuddy(null);
                      setConnectionMessage('');
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-in Modal */}
      <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buddy Check-in</DialogTitle>
            <DialogDescription>
              Share your progress and reflect on your journey
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Progress Summary</label>
              <Textarea
                value={checkInData.progress_summary}
                onChange={(e) => setCheckInData({...checkInData, progress_summary: e.target.value})}
                placeholder="How has your progress been since last check-in?"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Mood</label>
              <select
                value={checkInData.mood}
                onChange={(e) => setCheckInData({...checkInData, mood: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="great">😊 Great - Feeling strong and motivated</option>
                <option value="good">🙂 Good - Making steady progress</option>
                <option value="okay">😐 Okay - Some ups and downs</option>
                <option value="struggling">😔 Struggling - Need extra support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recent Wins 🎉</label>
              {checkInData.wins.map((win, idx) => (
                <Input
                  key={idx}
                  value={win}
                  onChange={(e) => {
                    const newWins = [...checkInData.wins];
                    newWins[idx] = e.target.value;
                    setCheckInData({...checkInData, wins: newWins});
                  }}
                  placeholder={`Win #${idx + 1}`}
                  className="mb-2"
                />
              ))}
              <Button
                onClick={() => setCheckInData({
                  ...checkInData,
                  wins: [...checkInData.wins, '']
                })}
                variant="outline"
                size="sm"
              >
                Add Another Win
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Challenges Faced</label>
              {checkInData.challenges.map((challenge, idx) => (
                <Input
                  key={idx}
                  value={challenge}
                  onChange={(e) => {
                    const newChallenges = [...checkInData.challenges];
                    newChallenges[idx] = e.target.value;
                    setCheckInData({...checkInData, challenges: newChallenges});
                  }}
                  placeholder={`Challenge #${idx + 1}`}
                  className="mb-2"
                />
              ))}
              <Button
                onClick={() => setCheckInData({
                  ...checkInData,
                  challenges: [...checkInData.challenges, '']
                })}
                variant="outline"
                size="sm"
              >
                Add Another Challenge
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">What do you need support with?</label>
              <Textarea
                value={checkInData.needs_support_with}
                onChange={(e) => setCheckInData({...checkInData, needs_support_with: e.target.value})}
                placeholder="Share what you need help with..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Commitment for Next Check-in</label>
              <Input
                value={checkInData.commitment_for_next}
                onChange={(e) => setCheckInData({...checkInData, commitment_for_next: e.target.value})}
                placeholder="What will you accomplish by next time?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowCheckInModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const upcomingCheckIn = upcomingCheckIns.find(
                  c => c.buddy_connection_id === selectedConnection?.id
                );
                if (upcomingCheckIn) {
                  const isRequester = selectedConnection.requester_email === user?.email;
                  submitCheckInMutation.mutate({
                    connectionId: selectedConnection.id,
                    checkInId: upcomingCheckIn.id,
                    isRequester
                  });
                }
              }}
              disabled={submitCheckInMutation.isPending || !checkInData.progress_summary}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Encouragement Modal */}
      <Dialog open={showEncouragementModal} onOpenChange={setShowEncouragementModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Encouragement</DialogTitle>
            <DialogDescription>
              Lift up your buddy with a supportive message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-3">Quick Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {ENCOURAGEMENT_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setEncouragementMessage(template.text);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedTemplate === template
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{template.emoji}</div>
                    <p className="text-xs text-gray-700 line-clamp-2">{template.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Message</label>
              <Textarea
                value={encouragementMessage}
                onChange={(e) => setEncouragementMessage(e.target.value)}
                placeholder="Write a custom encouragement message..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowEncouragementModal(false);
                setEncouragementMessage('');
                setSelectedTemplate(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEncouragement}
              disabled={sendEncouragementMutation.isPending || !encouragementMessage.trim()}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Encouragement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Share Modal */}
      <Dialog open={showGoalShareModal} onOpenChange={setShowGoalShareModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Goals with Your Buddy</DialogTitle>
            <DialogDescription>
              Choose which goals to share for accountability
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {myGoals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No active goals to share</p>
              </div>
            ) : (
              myGoals.map(goal => {
                const isShared = selectedConnection?.shared_goals?.some(g => g.goal_id === goal.id);

                return (
                  <Card key={goal.id} className={`border-2 ${isShared ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{goal.goal_title}</h5>
                          <p className="text-sm text-gray-600 line-clamp-2">{goal.goal_description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              {goal.category.replace(/_/g, ' ')}
                            </Badge>
                            {goal.progress_percentage > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {goal.progress_percentage}% complete
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            // Toggle goal sharing
                            const currentShared = selectedConnection.shared_goals || [];
                            const newShared = isShared
                              ? currentShared.filter(g => g.goal_id !== goal.id)
                              : [...currentShared, {
                                  goal_id: goal.id,
                                  goal_title: goal.goal_title,
                                  shared_by: user.email,
                                  progress_visibility: 'full'
                                }];

                            updateBuddyMutation.mutate({
                              id: selectedConnection.id,
                              data: { shared_goals: newShared }
                            });
                          }}
                          variant={isShared ? "default" : "outline"}
                          size="sm"
                          className={isShared ? 'bg-green-600' : ''}
                        >
                          {isShared ? (
                            <><Check className="w-4 h-4 mr-1" />Shared</>
                          ) : (
                            <><Share2 className="w-4 h-4 mr-1" />Share</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowGoalShareModal(false)}
              className="w-full"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buddy Challenges View */}
      <Dialog open={showChallenges} onOpenChange={setShowChallenges}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Challenges with {selectedBuddyForChallenges && getBuddyInfo(selectedBuddyForChallenges).name}</DialogTitle>
            <DialogDescription>
              Create and track shared challenges
            </DialogDescription>
          </DialogHeader>

          {selectedBuddyForChallenges && (
            <BuddyChallengeManager
              buddyConnection={selectedBuddyForChallenges}
              user={user}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Setup Modal */}
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Setup Your Community Profile</DialogTitle>
          </DialogHeader>
          <CommunityProfileSetup
            existingProfile={userCommunityProfile}
            onComplete={() => {
              setShowProfileSetup(false);
              queryClient.invalidateQueries(['communityProfile']);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
