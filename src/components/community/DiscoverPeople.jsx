import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  Search,
  UserPlus,
  Users,
  Heart,
  Filter,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  X,
  Loader2,
  QrCode,
  ShieldAlert,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function DiscoverPeople() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInviteTo, setSendingInviteTo] = useState(null);
  const queryClient = useQueryClient();

  const { user: authUser } = useAuth();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!authUser
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['communityProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return (data || []).map(p => ({
        ...p,
        display_name: p.full_name,
        // created_by is confusingly named, but we keep it for consistency if needed, 
        // but it's just the ID.
        created_by: p.id
      }));
    },
    enabled: !!currentUser
  });

  const { data: myConnections = [] } = useQuery({
    queryKey: ['myConnections', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`requester_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser
  });

  const { data: receivedRequests = [] } = useQuery({
    queryKey: ['receivedRequests', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:requester_id (id, full_name, avatar_url)
        `)
        .eq('receiver_id', currentUser.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data.map(r => ({
        ...r,
        other_user_name: r.requester?.full_name || 'User',
        other_user_avatar: r.requester?.avatar_url
      })) || [];
    },
    enabled: !!currentUser
  });

  const sendConnectionMutation = useMutation({
    mutationFn: async ({ otherUser, message }) => {
      // Check if ID is present
      if (!otherUser?.id) {
        throw new Error("Target user ID missing");
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: currentUser.id,
          receiver_id: otherUser.id,
          status: 'pending'
          // We can't insert message into friend_requests directly as per schema in 20260102 sql
          // If we need message, we might need a separate table or just ignore it for now/send notification
        });

      if (error) throw error;

      // Notification
      await supabase
        .from('notifications')
        .insert({
          user_id: otherUser.id,
          type: 'connection_request',
          title: 'New Connection Request',
          content: `${currentUser?.full_name} wants to connect with you. ${message ? `Message: "${message}"` : ''}`,
          is_read: false
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myConnections'] });
      setSendingInviteTo(null);
      setInviteMessage('');
      toast.success('Connection request sent! ✨');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send request');
    }
  });

  const acceptConnectionMutation = useMutation({
    mutationFn: async (request) => {
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Check if conversation exists
      const { data: existingConvs } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${currentUser.id},participant_2_id.eq.${request.requester_id}),and(participant_1_id.eq.${request.requester_id},participant_2_id.eq.${currentUser.id})`);

      if (!existingConvs || existingConvs.length === 0) {
        await supabase
          .from('direct_conversations')
          .insert({
            participant_1_id: currentUser.id,
            participant_2_id: request.requester_id,
            last_message_content: 'Connected! Start chatting...',
            last_message_time: new Date().toISOString()
          });
      }

      await supabase
        .from('notifications')
        .insert({
          user_id: request.requester_id,
          type: 'connection_accepted',
          title: 'Connection Accepted!',
          content: `${currentUser?.full_name} accepted your connection request`,
          is_read: false
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myConnections'] });
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allDirectConversations'] });
      toast.success('Connection accepted! 🎉 You can now message each other!');
    }
  });

  const rejectConnectionMutation = useMutation({
    mutationFn: async (connectionId) => {
      await supabase
        .from('friend_requests')
        .delete()
        .eq('id', connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
      toast.info('Request declined');
    }
  });

  const startConversationMutation = useMutation({
    mutationFn: async (otherUserId) => {
      // Check if conversation exists
      const { data: existingConvs } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${currentUser.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${currentUser.id})`);

      if (existingConvs && existingConvs.length > 0) {
        return existingConvs[0];
      }

      const { data, error } = await supabase
        .from('direct_conversations')
        .insert({
          participant_1_id: currentUser.id,
          participant_2_id: otherUserId,
          last_message_content: 'Connected! Start chatting...',
          last_message_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allDirectConversations'] });
      toast.success('Opening conversation! 💬');
      window.location.href = `/Messages?conversation=${data.id}`;
    }
  });

  const connectByCode = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single();

    if (profileError || !targetProfile) {
      toast.error('Invalid invite code');
      return;
    }

    // Check if trying to connect to self
    if (targetProfile.id === currentUser.id) {
      toast.error('You cannot connect with yourself');
      return;
    }

    const existingConnection = myConnections.find(
      c => (c.requester_id === targetProfile.id && c.receiver_id === currentUser.id) ||
        (c.receiver_id === targetProfile.id && c.requester_id === currentUser.id)
    );

    if (existingConnection) {
      toast.info('You\'re already connected or have a pending request with this user');
      return;
    }

    await sendConnectionMutation.mutateAsync({
      otherUser: {
        id: targetProfile.id,
        full_name: targetProfile.full_name
      },
      message: 'Connected via invite code!'
    });
  };

  const canViewProfile = (profile) => {
    const myPrivacy = currentUser.community_privacy || {};

    if (myPrivacy.is_fully_anonymous && !profile.is_fully_anonymous) {
      return false;
    }

    if (!myPrivacy.is_fully_anonymous && !profile.is_fully_anonymous) {
      return true;
    }

    if (profile.is_fully_anonymous) {
      return true;
    }

    return false;
  };

  const discoverableProfiles = allProfiles.filter(profile => {
    if (profile.id === currentUser?.id) return false;
    // Removed legacy visibility checks for now, relying on supabase RLS or simplified checks
    // if (profile.visibility_level === 'invisible' || !profile.can_be_discovered) return false;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      // Safe checks for arrays
      const interests = Array.isArray(profile.interests) ? profile.interests : [];
      const tags = Array.isArray(profile.custom_tags) ? profile.custom_tags : [];

      return (
        (profile.full_name || '').toLowerCase().includes(search) ||
        interests.some(i => i.toLowerCase().includes(search)) ||
        tags.some(t => t.toLowerCase().includes(search))
      );
    }

    if (selectedFilters.length > 0) {
      const goalCategories = Array.isArray(profile.goal_categories) ? profile.goal_categories : [];
      const supportPreferences = Array.isArray(profile.support_preferences) ? profile.support_preferences : [];

      return selectedFilters.some(filter =>
        goalCategories.includes(filter) ||
        supportPreferences.includes(filter)
      );
    }

    return true;
  });

  const myPrivacy = currentUser?.community_privacy || {};
  const amAnonymous = myPrivacy.is_fully_anonymous;

  return (
    <div className="space-y-6">
      {amAnonymous && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-blue-900 mb-1">🎭 Anonymous Mode Active</p>
              <p className="text-sm text-blue-800">
                You can connect with other anonymous users, but cannot view profiles of visible users. Switch to visible mode in Privacy Settings to access full profiles.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {receivedRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-4 border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-purple-600" />
                Pending Requests
                <Badge className="bg-purple-600 text-white">{receivedRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {receivedRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-white rounded-xl border-2 border-purple-200 shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                      {request.other_user_emoji || '😊'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{request.other_user_name}</p>
                      <p className="text-xs text-gray-600">
                        {request.other_user_is_anonymous ? '🎭 Anonymous' : '🌟 Visible'}
                      </p>
                    </div>
                  </div>
                  {request.invite_message && (
                    <p className="text-sm text-gray-700 italic mb-3 p-2 bg-gray-50 rounded">
                      "{request.invite_message}"
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => acceptConnectionMutation.mutate(request)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={acceptConnectionMutation.isPending}
                    >
                      {acceptConnectionMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => rejectConnectionMutation.mutate(request.id)}
                      variant="outline"
                      className="flex-1"
                      disabled={rejectConnectionMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            Connect by Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="flex-1 text-center text-lg font-mono uppercase"
            />
            <Button
              onClick={connectByCode}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={inviteCode.length !== 6}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-300">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by interests, goals, or tags..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-semibold text-gray-700">Filter by:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['wellness_journey', 'grief_support', 'habit_building', 'goal_accountability', 'personal_growth'].map(filter => (
              <Button
                key={filter}
                onClick={() => {
                  setSelectedFilters(prev =>
                    prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
                  );
                }}
                size="sm"
                variant={selectedFilters.includes(filter) ? 'default' : 'outline'}
                className={selectedFilters.includes(filter) ? 'bg-purple-600' : ''}
              >
                {filter.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Found <strong>{discoverableProfiles.length}</strong> {discoverableProfiles.length === 1 ? 'person' : 'people'}
          </p>
          {!currentUser?.community_privacy?.is_visible && (
            <Badge className="bg-amber-100 text-amber-800">
              <EyeOff className="w-3 h-3 mr-1" />
              You're not visible
            </Badge>
          )}
        </div>

        {discoverableProfiles.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Users Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {amAnonymous
                  ? 'No anonymous users discoverable. Connect via invite code instead.'
                  : 'Try different filters or invite friends to Helper33!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          discoverableProfiles.map((profile, idx) => {
            const alreadyConnected = myConnections.some(
              c => ((c.requester_id === profile.id && c.receiver_id === currentUser.id) ||
                (c.receiver_id === profile.id && c.requester_id === currentUser.id)) &&
                c.status === 'accepted'
            );
            const requestPending = myConnections.some(
              c => ((c.requester_id === profile.id && c.receiver_id === currentUser.id) ||
                (c.receiver_id === profile.id && c.requester_id === currentUser.id)) &&
                c.status === 'pending'
            );

            const canView = canViewProfile(profile);
            const isSendingInvite = sendingInviteTo === profile.id; // Use ID

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-2 hover:shadow-lg transition-all ${profile.is_fully_anonymous
                  ? 'border-blue-300 bg-blue-50/30'
                  : 'border-purple-300 bg-purple-50/30'
                  }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-xl flex-shrink-0"
                      >
                        {canView && profile.avatar_url && !profile.is_fully_anonymous ? (
                          <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                        ) : (
                          profile.display_emoji || '🎭'
                        )}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg text-gray-900">
                            {canView ? profile.display_name : profile.display_emoji || '🎭 Anonymous'}
                          </h3>
                          {profile.is_fully_anonymous ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Anonymous
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              <Eye className="w-3 h-3 mr-1" />
                              Visible
                            </Badge>
                          )}
                          {profile.matchmaking_enabled && (
                            <Badge variant="outline" className="border-purple-400">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Open
                            </Badge>
                          )}
                        </div>

                        {canView && profile.bio && !profile.is_fully_anonymous && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{profile.bio}</p>
                        )}

                        {canView && profile.general_location && (
                          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {profile.general_location}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1 mb-3">
                          {Array.isArray(profile.goal_categories) && profile.goal_categories.slice(0, 3).map((goal, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-purple-300">
                              {goal.replace('_', ' ')}
                            </Badge>
                          ))}
                          {Array.isArray(profile.support_preferences) && profile.support_preferences.slice(0, 2).map((pref, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-blue-300">
                              {pref.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {profile.journey_stage?.replace('_', ' ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {profile.activity_level?.replace('_', ' ')}
                          </span>
                        </div>

                        {!canView && !profile.is_fully_anonymous && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800">
                              🔒 Visible user - switch to visible mode to view profile
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          {alreadyConnected ? (
                            <>
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Connected
                              </Badge>
                              <Button
                                onClick={() => startConversationMutation.mutate(profile.id)}
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-cyan-600"
                                disabled={startConversationMutation.isPending}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                            </>
                          ) : requestPending ? (
                            <Badge className="bg-amber-100 text-amber-800">
                              <Clock className="w-4 h-4 mr-2" />
                              Request Sent
                            </Badge>
                          ) : (
                            isSendingInvite ? (
                              <div className="space-y-2 w-full">
                                <Textarea
                                  value={inviteMessage}
                                  onChange={(e) => setInviteMessage(e.target.value)}
                                  placeholder="Add a personal message (optional)"
                                  className="h-20"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      sendConnectionMutation.mutate({
                                        otherUser: {
                                          id: profile.id, // Correctly passing ID
                                          email: profile.email,
                                          display_name: profile.display_name,
                                          display_emoji: profile.display_emoji,
                                          is_fully_anonymous: profile.is_fully_anonymous
                                        },
                                        message: inviteMessage
                                      });
                                    }}
                                    className="flex-1 bg-purple-600"
                                    disabled={sendConnectionMutation.isPending}
                                  >
                                    {sendConnectionMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Send
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSendingInviteTo(null);
                                      setInviteMessage('');
                                    }}
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setSendingInviteTo(profile.id)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600"
                              >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Connect
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}