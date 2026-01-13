
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageCircle,
  TrendingUp,
  Heart,
  UserPlus,
  MessagesSquare,
  BookOpen,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityFeed from '@/components/social/ActivityFeed';
import FriendsList from '@/components/social/FriendsList';
import ConversationList from '@/components/social/ConversationList';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO';

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState('feed');

  const { user: authUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles') // Check for stats in profiles or a separate table
        .select('gamification_stats')
        .eq('id', user.id)
        .single();
      if (error) return null;
      return data.gamification_stats;
    },
    enabled: !!user
  });

  // Fetch friend requests to build friends list
  const { data: friendRequests = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:profiles!requester_id(id, email, full_name, avatar_url),
          receiver:profiles!receiver_id(id, email, full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Build friends list from accepted family members (placeholder for social friends)
  // Build friends list from accepted friend requests
  const friends = friendRequests.map(request => {
    const friendProfile = request.requester_id === user.id ? request.receiver : request.requester;
    return {
      id: friendProfile.id,
      email: friendProfile.email,
      name: friendProfile.full_name,
      avatar: friendProfile.avatar_url,
      since: request.updated_at
    };
  });

  const queryClient = useQueryClient();
  const [statusText, setStatusText] = useState('');

  const statusMutation = useMutation({
    /** @param {string} text */
    mutationFn: async (text) => {
      if (!user) return;

      const { data, error } = await supabase
        .from('friend_activities')
        .insert({
          user_id: user.id,
          user_name: user.full_name,
          user_avatar: user.avatar_url,
          activity_type: 'status_update',
          achievement_title: 'posted a status update',
          achievement_description: text,
          created_at: new Date().toISOString(),
          cheer_count: 0,
          comment_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setStatusText('');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  const handlePostStatus = () => {
    if (!statusText.trim()) return;
    statusMutation.mutate(statusText);
  };

  const { data: unreadConversations = [] } = useQuery({
    queryKey: ['unread-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('companion_messages')
        .select('*')
        .eq('is_read', false);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const stats = user?.gamification_stats || {};

  if (!user || loadingFriends) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Social Feed - DobryLife | Connect & Share Your Journey"
        description="Share your wellness journey, connect with friends, celebrate achievements, and support each other. Build meaningful connections in a safe, therapeutic space."
        keywords="wellness social network, mental health community, share progress, wellness friends, achievement sharing, supportive community, mental wellness connections"
        ogTitle="Social Feed - DobryLife"
        ogDescription="Share your wellness journey, connect with friends, and support each other."
        ogUrl={window.location.href}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Social Hub
          </h1>
          <p className="text-gray-600 text-lg">Connect, share, and grow together</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6 text-center">
              <UserPlus className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{friends.length || 0}</div>
              <div className="text-xs text-blue-100">Friends</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats?.total_likes_received || 0}</div>
              <div className="text-xs text-purple-100">Likes</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats?.total_messages_sent || 0}</div>
              <div className="text-xs text-green-100">Messages</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.level || 1}</div>
              <div className="text-xs text-orange-100">Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to={createPageUrl('CommunityForum')}>
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 mb-1">Community Forum</h3>
                <p className="text-sm text-gray-600">Share stories and support</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Messages')}>
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer h-full relative">
              <CardContent className="p-6 text-center">
                <MessagesSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 mb-1">Direct Messages</h3>
                <p className="text-sm text-gray-600">Chat with friends</p>
                {unreadConversations.length > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500">
                    {unreadConversations.length}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Community')}>
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 mb-1">Community Hub</h3>
                <p className="text-sm text-gray-600">Challenges & groups</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Activity Feed
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
              {unreadConversations.length > 0 && (
                <Badge className="ml-2 bg-red-500">{unreadConversations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <Card className="mb-6 border-2 border-purple-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      user?.full_name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      placeholder="What's happening? Share an update with your friends..."
                      className="w-full bg-transparent border-none focus:ring-0 text-gray-800 resize-none min-h-[60px]"
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {statusText.length} characters
                      </div>
                      <button
                        onClick={handlePostStatus}
                        disabled={!statusText.trim() || statusMutation.isPending}
                        className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {statusMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        Share Update
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <ActivityFeed friends={friends} />
          </TabsContent>

          <TabsContent value="friends">
            <FriendsList friends={friends} />
          </TabsContent>

          <TabsContent value="messages">
            <ConversationList />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
