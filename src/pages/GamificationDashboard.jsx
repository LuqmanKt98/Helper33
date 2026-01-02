
import React from 'react';
import ProgressDashboard from '@/components/gamification/ProgressDashboard';
import BadgeShowcase from '@/components/badges/BadgeShowcase';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, TrendingUp, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

export default function GamificationDashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const stats = user?.gamification_stats || {
    total_points: 0,
    level: 1,
    events_attended: 0,
    events_rsvp_count: 0,
    event_chat_messages: 0
  };

  return (
    <>
      <SEO 
        title="Progress Dashboard - DobryLife | Track Your Wellness Journey"
        description="View your wellness progress with detailed analytics, achievement tracking, badges, levels, streaks, and gamification rewards. Celebrate your mental health journey."
        keywords="wellness progress, achievement tracker, gamification, wellness analytics, mental health progress, habit streaks, wellness badges, level up"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Progress
          </h1>
          <p className="text-gray-600 text-lg">Track your achievements and celebrate your growth</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">Level {stats.level}</div>
              <div className="text-sm text-blue-100">Current Level</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{stats.total_points?.toLocaleString() || 0}</div>
              <div className="text-sm text-purple-100">Total Points</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-3xl font-bold mb-1">{stats.current_streak || 0}</div>
              <div className="text-sm text-orange-100">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{stats.events_attended || 0}</div>
              <div className="text-sm text-green-100">Events Attended</div>
            </CardContent>
          </Card>
        </div>

        {/* Event Engagement Highlight */}
        {(stats.events_attended > 0 || stats.event_chat_messages > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="w-6 h-6" />
                  Community Event Champion
                </CardTitle>
                <CardDescription className="text-white/90">
                  Your active participation in community events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="text-2xl mb-1">🎫</div>
                    <div className="text-2xl font-bold">{stats.events_rsvp_count || 0}</div>
                    <div className="text-xs text-white/80">RSVPs</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-2xl font-bold">{stats.events_attended || 0}</div>
                    <div className="text-xs text-white/80">Attended</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div className="text-2xl mb-1">💬</div>
                    <div className="text-2xl font-bold">{stats.event_chat_messages || 0}</div>
                    <div className="text-xs text-white/80">Messages</div>
                  </div>
                </div>

                <Link to={createPageUrl('Events')}>
                  <Button variant="secondary" className="w-full">
                    Explore More Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">
              <Trophy className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProgressDashboard />
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <BadgeShowcase />
          </TabsContent>

          <TabsContent value="streaks">
            <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Streak Progress</h3>
              <p className="text-gray-600">This section will display your current and longest streaks, along with challenges related to maintaining consistency.</p>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Achievements Unlocked</h3>
              <p className="text-gray-600">Here you'll find a list of all your achievements, from completing specific tasks to reaching major milestones.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
