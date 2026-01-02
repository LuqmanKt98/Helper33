
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({});
      return stats[0];
    }
  });

  // Fetch friend requests to build friends list
  const { data: friendRequests = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      if (!user) return [];
      
      const sent = await base44.entities.FriendRequest.filter({
        requester_email: user.email,
        status: 'accepted'
      });
      
      const received = await base44.entities.FriendRequest.filter({
        receiver_email: user.email,
        status: 'accepted'
      });

      return [...sent, ...received];
    },
    enabled: !!user
  });

  // Build friends list from accepted requests
  const friends = friendRequests.map(request => {
    const isSent = request.requester_email === user?.email;
    return {
      email: isSent ? request.receiver_email : request.requester_email,
      name: isSent ? request.receiver_name : request.requester_name,
      avatar: isSent ? request.receiver_avatar : request.requester_avatar,
      since: request.accepted_at
    };
  });

  const { data: unreadConversations = [] } = useQuery({
    queryKey: ['unread-conversations'],
    queryFn: async () => {
      if (!user) return [];
      const conversations = await base44.entities.Conversation.filter({
        participant_emails: { $contains: user.email }
      });
      return conversations.filter(c => {
        const unreadCount = c.unread_count?.[user.email] || 0;
        return unreadCount > 0;
      });
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed">
              <TrendingUp className="w-4 h-4 mr-2" />
              Activity Feed
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="w-4 h-4 mr-2" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
              {unreadConversations.length > 0 && (
                <Badge className="ml-2 bg-red-500">{unreadConversations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
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
