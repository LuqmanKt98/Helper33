
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Star, Sparkles, Users, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConstellationChallenge({ onBack, onNavigateToZone }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myProgress } = useQuery({
    queryKey: ['myConstellationProgress', user?.email],
    queryFn: async () => {
      const allProgress = await base44.entities.ConstellationProgress.list();
      return allProgress.find(p => p.created_by === user.email);
    },
    enabled: !!user,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allConstellationProgress'],
    queryFn: () => base44.entities.ConstellationProgress.filter({ share_with_community: true }, '-stars_lit', 100),
  });

  const starsLit = myProgress?.stars_lit || 0;
  const totalCommunityStars = allProgress.reduce((sum, p) => sum + (p.stars_lit || 0), 0);

  const challengeActivities = [
    { zone: 'calm', activity: 'Complete a breathing exercise', points: 20, icon: '🧘', zoneId: 'calm' },
    { zone: 'connect', activity: 'Send a gratitude note', points: 15, icon: '💌', zoneId: 'connect' },
    { zone: 'give', activity: 'Complete an act of kindness', points: 25, icon: '🎁', zoneId: 'give' },
    { zone: 'reflect', activity: 'Write a journal reflection', points: 30, icon: '📝', zoneId: 'reflect' },
    { zone: 'calm', activity: 'Practice 5-4-3-2-1 grounding', points: 15, icon: '🌬️', zoneId: 'calm' },
    { zone: 'connect', activity: 'Share a memory at the table', points: 20, icon: '🕯️', zoneId: 'connect' },
    { zone: 'give', activity: 'Research volunteer opportunity', points: 20, icon: '🤝', zoneId: 'give' },
    { zone: 'reflect', activity: 'Complete another reflection prompt', points: 30, icon: '💭', zoneId: 'reflect' },
    { zone: 'connect', activity: 'Add to the Kindness Tree', points: 25, icon: '🌳', zoneId: 'connect' },
    { zone: 'calm', activity: 'Listen to calming affirmations', points: 15, icon: '✨', zoneId: 'calm' },
  ];

  const handleActivityClick = (zoneId) => {
    console.log('🎯 Activity clicked, navigating to zone:', zoneId);
    // Use callback to navigate to the zone
    if (onNavigateToZone) {
      onNavigateToZone(zoneId);
    } else {
      // Fallback to hash-based navigation
      window.location.hash = zoneId;
      onBack();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="bg-white/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2">
          <Star className="w-4 h-4 mr-2" />
          Constellation Challenge
        </Badge>
      </div>

      {/* Challenge Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white border-0 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={`bg-star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <CardContent className="p-12 relative z-10">
            <div className="text-center mb-8">
              <Sparkles className="w-20 h-20 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-3">Constellation of Kindness</h1>
              <p className="text-xl text-purple-100 mb-6">
                Complete 10 wellness activities to light up your full constellation
              </p>
            </div>

            {/* Star Progress */}
            <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star
                    className={`w-12 h-12 ${
                      i < starsLit
                        ? 'text-yellow-300 fill-yellow-300'
                        : 'text-white/20'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold mb-2">{starsLit} / 10 Stars Lit</p>
              <p className="text-purple-200">
                {starsLit === 10 
                  ? '🎉 Constellation Complete! You\'ve earned the Heartful Holidays badge!' 
                  : `${10 - starsLit} more to go!`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Challenge Activities */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Challenge Activities</h2>
        <p className="text-gray-600 mb-6">Click any activity to go to that zone and complete it! Each completion lights up a star. ⭐</p>
        <div className="grid md:grid-cols-2 gap-4">
          {challengeActivities.map((activity, index) => {
            const zoneColors = {
              calm: 'from-cyan-500 to-blue-500',
              connect: 'from-rose-500 to-pink-500',
              give: 'from-amber-500 to-orange-500',
              reflect: 'from-purple-500 to-indigo-500',
            };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${zoneColors[activity.zone]} flex items-center justify-center text-2xl transition-transform`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">{activity.activity}</h4>
                        <p className="text-sm text-gray-600 capitalize">{activity.zone} Zone</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 text-base px-3 py-1">
                        +{activity.points}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleActivityClick(activity.zoneId)}
                      className={`w-full bg-gradient-to-r ${zoneColors[activity.zone]} text-white hover:opacity-90 active:scale-95 transition-all`}
                    >
                      Go to {activity.zone} Zone
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Community Leaderboard */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Community Constellation
          </CardTitle>
          <CardDescription className="text-base">
            {totalCommunityStars} stars lit by {allProgress.length} participants worldwide 🌍
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allProgress.slice(0, 10).map((progress, index) => (
              <motion.div
                key={progress.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                <span className="flex-1 font-medium text-gray-900 text-lg">{progress.user_display_name}</span>
                <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900 text-lg">{progress.stars_lit}</span>
                </div>
                {progress.stars_lit >= 10 && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                    🏆 Complete
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>

          {allProgress.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-2">🌟 Be the first to light up the community constellation!</p>
              <p className="text-sm text-gray-500">Start your wellness journey in any zone above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
