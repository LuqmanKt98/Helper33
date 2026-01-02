import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  Heart,
  MessageCircle,
  Share2,
  Flame,
  Award
} from 'lucide-react';

import GroupChallengesView from '../components/community/GroupChallengesView';
import AnonymousProgressFeed from '../components/community/AnonymousProgressFeed';
import SupportCircles from '../components/community/SupportCircles';
import ShareProgressModal from '../components/community/ShareProgressModal';

function CommunityLeaderboard({ onNavigateToTab }) {
  const { data: topParticipants = [] } = useQuery({
    queryKey: ['topChallengeParticipants'],
    queryFn: async () => {
      const participants = await base44.entities.ChallengeParticipant.filter({ status: 'active' });
      return participants
        .sort((a, b) => (b.completion_percentage || 0) - (a.completion_percentage || 0))
        .slice(0, 20);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Community Champions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Celebrating those making consistent progress in challenges
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {topParticipants.map((participant, idx) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`${
              idx === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' :
              idx === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-400' :
              idx === 2 ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400' :
              'bg-white border border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-400 to-slate-500 text-white' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>

                    <div>
                      <p className="font-bold text-gray-900">{participant.display_name}</p>
                      <p className="text-sm text-gray-600">
                        {participant.completed_days?.length || 0} days completed
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {participant.completion_percentage?.toFixed(0) || 0}%
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {participant.support_messages_sent || 0} supports given
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {topParticipants.length === 0 && (
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Active Participants Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Join a challenge to appear on the leaderboard!
              </p>
              <Button onClick={() => onNavigateToTab('challenges')}>
                Browse Challenges
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: () => base44.entities.GroupChallenge.filter({ status: 'active' })
  });

  const { data: circles = [] } = useQuery({
    queryKey: ['supportCircles'],
    queryFn: () => base44.entities.SupportCircle.filter({ is_active: true })
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['myCircleMemberships'],
    queryFn: () => base44.entities.CircleMembership.filter({})
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="w-10 h-10 text-purple-600" />
                Community Hub
              </h1>
              <p className="text-gray-600">
                Connect with others on similar journeys. Share, support, and grow together.
              </p>
            </div>

            <Button
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Your Progress
            </Button>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs text-purple-100">Active Challenges</span>
              </div>
              <p className="text-3xl font-bold">{challenges.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs text-blue-100">Support Circles</span>
              </div>
              <p className="text-3xl font-bold">{circles.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4" />
                <span className="text-xs text-green-100">Your Circles</span>
              </div>
              <p className="text-3xl font-bold">{myMemberships.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-xs text-orange-100">Community Streak</span>
              </div>
              <p className="text-3xl font-bold">{user?.coaching_stats?.streak || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 shadow-lg">
            <TabsTrigger value="feed" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden md:inline">Progress Feed</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden md:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="circles" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Circles</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden md:inline">Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <AnonymousProgressFeed />
          </TabsContent>

          <TabsContent value="challenges">
            <GroupChallengesView challenges={challenges} />
          </TabsContent>

          <TabsContent value="circles">
            <SupportCircles circles={circles} myMemberships={myMemberships} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <CommunityLeaderboard onNavigateToTab={setActiveTab} />
          </TabsContent>
        </Tabs>

        {/* Share Progress Modal */}
        {showShareModal && (
          <ShareProgressModal
            onClose={() => setShowShareModal(false)}
            onSuccess={() => {
              setShowShareModal(false);
              setActiveTab('feed');
            }}
          />
        )}
      </div>
    </div>
  );
}