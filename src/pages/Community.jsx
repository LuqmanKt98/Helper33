import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MessageSquare,
  Trophy,
  Heart,
  Sparkles,
  Shield,
  Search,
  Eye,
  EyeOff,
  Plus,
  TrendingUp,
  UserPlus,
  Lightbulb,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import AnonymousProgressFeed from '@/components/community/AnonymousProgressFeed';
import GroupChallengesView from '@/components/community/GroupChallengesView';
import SupportCircles from '@/components/community/SupportCircles';
import BuddySystem from '@/components/community/BuddySystem';
import CommunityPrivacySettings from '@/components/community/CommunityPrivacySettings';
import DiscoverPeople from '@/components/community/DiscoverPeople';
import InviteFriends from '@/components/community/InviteFriends';
import ProposeChallenge from '@/components/community/ProposeChallenge';
import ProfileSetupPrompt from '@/components/community/ProfileSetupPrompt';
import SEO from '@/components/SEO';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import CreatePostModal from '@/components/community/CreatePostModal';

export default function Community() {
  const [activeTab, setActiveTab] = useState('progress-feed');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const [showProposeChallenge, setShowProposeChallenge] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const { user: authUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['currentUser', authUser?.id],
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

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      // Return the profile only if community profile is set up
      return data?.has_community_profile ? data : null;
    },
    enabled: !!user
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .in('status', ['active', 'upcoming']);
      if (error) throw error;
      return data;
    },
    staleTime: 60000
  });

  const { data: communityStats } = useQuery({
    queryKey: ['communityStats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activePosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      const { count: supportCircles } = await supabase
        .from('support_circles')
        .select('*', { count: 'exact', head: true });

      return {
        totalMembers: totalMembers || 0,
        activePosts: activePosts || 0,
        supportCircles: supportCircles || 0,
        activeNow: 12 // Placeholder for real-time presence
      };
    },
    enabled: !!user
  });

  const privacy = user?.community_privacy || {
    is_visible: false,
    is_fully_anonymous: true
  };

  // Show profile setup if user doesn't have a community profile
  useEffect(() => {
    if (user && !profileLoading && !userProfile && !showProfileSetup) {
      setShowProfileSetup(true);
    }
  }, [user, profileLoading, userProfile, showProfileSetup]);

  return (
    <>
      <SEO
        title="Community - Helper33 | Connect, Share & Support Each Other"
        description="Join a supportive community of wellness seekers. Find accountability buddies, join group challenges, share your progress, and connect with others on similar journeys."
        keywords="wellness community, support groups, accountability partners, mental health community, healing journey, peer support, group challenges"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <BackButton className="mb-3" />
            <Breadcrumbs items={[{ label: 'Community' }]} />
          </motion.div>

          {/* Profile Setup Modal */}
          <AnimatePresence>
            {showProfileSetup && (
              <ProfileSetupPrompt
                user={user}
                onComplete={() => setShowProfileSetup(false)}
              />
            )}

            {showPrivacySettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setShowPrivacySettings(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
                >
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                    <h2 className="text-2xl font-bold">🔐 Privacy & Connection Settings</h2>
                    <p className="text-purple-100">Control who can see you and how you connect</p>
                  </div>
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <CommunityPrivacySettings
                      user={user}
                      onClose={() => setShowPrivacySettings(false)}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {showCreatePost && (
              <CreatePostModal
                user={user}
                onClose={() => setShowCreatePost(false)}
              />
            )}

            {showInviteFriends && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setShowInviteFriends(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-3xl my-8"
                >
                  <div className="relative">
                    <Button
                      onClick={() => setShowInviteFriends(false)}
                      variant="ghost"
                      size="icon"
                      className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
                    >
                      ✕
                    </Button>
                    <InviteFriends user={user} onClose={() => setShowInviteFriends(false)} />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {showProposeChallenge && (
              <ProposeChallenge
                user={user}
                onClose={() => setShowProposeChallenge(false)}
              />
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Users className="w-10 h-10 text-purple-600" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Community
                  </h1>
                  <p className="text-gray-600">
                    Connect, support, and grow together
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!userProfile && (
                  <Button
                    onClick={() => setShowProfileSetup(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg animate-pulse"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Button>
                )}
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                  disabled={!userProfile}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Share Post
                </Button>
                <Button
                  onClick={() => setShowInviteFriends(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
                <Button
                  onClick={() => setShowProposeChallenge(true)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Propose Challenge
                </Button>
                <Button
                  onClick={() => setShowPrivacySettings(true)}
                  variant="outline"
                  className="border-2 border-purple-300 hover:bg-purple-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Privacy</span>
                </Button>
              </div>
            </div>

            {/* No Profile Warning */}
            {user && !profileLoading && !userProfile && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl shadow-lg mb-6"
              >
                <div className="flex items-start gap-4">
                  <Sparkles className="w-12 h-12 text-orange-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-orange-900 mb-2">Welcome to the Community!</h3>
                    <p className="text-orange-800 mb-4">
                      To connect with others, you need to create a community profile first. It only takes a minute! 🚀
                    </p>
                    <Button
                      onClick={() => setShowProfileSetup(true)}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Profile Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {communityStats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
              >
                <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-900">{communityStats.totalMembers}</p>
                    <p className="text-xs text-purple-700">Members</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-900">{communityStats.activeNow}</p>
                    <p className="text-xs text-green-700">Active Now</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-900">{communityStats.activePosts}</p>
                    <p className="text-xs text-blue-700">Posts</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300">
                  <CardContent className="p-4 text-center">
                    <Heart className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-orange-900">{communityStats.supportCircles}</p>
                    <p className="text-xs text-orange-700">Circles</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {userProfile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`border-2 ${userProfile.is_fully_anonymous
                  ? 'border-blue-400 bg-blue-50'
                  : userProfile.visibility_level === 'fully_visible'
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-400 bg-gray-50'
                  }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg"
                        >
                          {userProfile.is_fully_anonymous ? userProfile.display_emoji || '🎭' : (
                            userProfile.avatar_url ? (
                              <img src={userProfile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                            ) : userProfile.display_emoji || '😊'
                          )}
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">You appear as:</p>
                          <p className="text-lg font-bold text-gray-900">
                            {userProfile.display_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {userProfile.is_fully_anonymous ? (
                          <Badge className="bg-blue-600 text-white">
                            <EyeOff className="w-4 h-4 mr-1" />
                            Anonymous Mode
                          </Badge>
                        ) : userProfile.can_be_discovered ? (
                          <Badge className="bg-green-600 text-white">
                            <Eye className="w-4 h-4 mr-1" />
                            Visible & Discoverable
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-600 text-white">
                            <Shield className="w-4 h-4 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1 gap-1">
              <TabsTrigger
                value="progress-feed"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg py-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Feed</span>
              </TabsTrigger>
              <TabsTrigger
                value="discover"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-lg py-2"
              >
                <Search className="w-4 h-4" />
                <span>Discover</span>
              </TabsTrigger>
              <TabsTrigger
                value="invite"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg py-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite</span>
              </TabsTrigger>
              <TabsTrigger
                value="challenges"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg py-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Challenges</span>
              </TabsTrigger>
              <TabsTrigger
                value="circles"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white rounded-lg py-2"
              >
                <Heart className="w-4 h-4" />
                <span>Circles</span>
              </TabsTrigger>
              <TabsTrigger
                value="buddies"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg py-2"
              >
                <Users className="w-4 h-4" />
                <span>Buddies</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress-feed">
              <AnonymousProgressFeed onCreatePost={() => setShowCreatePost(true)} />
            </TabsContent>

            <TabsContent value="discover">
              {userProfile ? (
                <DiscoverPeople />
              ) : (
                <Card className="p-12 text-center">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Profile First</h3>
                  <p className="text-gray-600 mb-4">You need a community profile to discover and connect with others</p>
                  <Button
                    onClick={() => setShowProfileSetup(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="invite">
              <InviteFriends user={user} />
            </TabsContent>

            <TabsContent value="challenges">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300 shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <Lightbulb className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="font-bold text-yellow-900">Have an idea for a challenge?</p>
                      <p className="text-sm text-yellow-800">Share it with the community!</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowProposeChallenge(true)}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Propose Challenge
                  </Button>
                </motion.div>
                <GroupChallengesView challenges={challenges} />
              </div>
            </TabsContent>

            <TabsContent value="circles">
              <SupportCircles />
            </TabsContent>

            <TabsContent value="buddies">
              <BuddySystem />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}