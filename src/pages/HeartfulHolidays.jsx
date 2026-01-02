import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Wind, Users, Gift, BookOpen, Star, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import CalmZone from '@/components/holiday/CalmZone';
import ConnectZone from '@/components/holiday/ConnectZone';
import GiveZone from '@/components/holiday/GiveZone';
import ReflectZone from '@/components/holiday/ReflectZone';
import ConstellationChallenge from '@/components/holiday/ConstellationChallenge';

export default function HeartfulHolidays() {
  const [activeZone, setActiveZone] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userActivities = [] } = useQuery({
    queryKey: ['holidayActivities'],
    queryFn: () => base44.entities.HolidayWellnessActivity.list('-created_date'),
    enabled: !!user,
  });

  const { data: constellationProgress } = useQuery({
    queryKey: ['myConstellationProgress'],
    queryFn: async () => {
      const allProgress = await base44.entities.ConstellationProgress.list();
      return allProgress.find(p => p.created_by === user.email) || null;
    },
    enabled: !!user,
  });

  // Check for zone hash on mount and when returning from constellation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['calm', 'connect', 'give', 'reflect'].includes(hash)) {
      setActiveZone(hash);
      window.location.hash = ''; // Clear hash after navigating
    }
  }, [activeZone]); // Changed to depend on activeZone

  const handleNavigateToZone = (zoneId) => {
    console.log('🎯 Navigating to zone from callback:', zoneId);
    setActiveZone(zoneId);
  };

  const handleShareToSocial = async (platform) => {
    const shareText = `I'm participating in the Heartful Holidays wellness journey! 🎄✨ Lighting up my constellation one act of kindness at a time. The holidays can be lonely - you're not alone. Join me! 🌟`;
    const url = 'https://www.helper33.com/HeartfulHolidays';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}&hashtags=HeartfulHolidays,YouAreNotAlone`,
      instagram: `https://www.instagram.com/`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      tiktok: `https://www.tiktok.com/upload`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform}! 💫`);
    }
  };

  const zones = [
    { id: 'calm', name: 'Calm Zone', icon: Wind, color: 'from-cyan-500 to-blue-500', description: 'Reduce anxiety with breathing & affirmations', emoji: '🧘', benefits: 'Lowers cortisol, activates calm' },
    { id: 'connect', name: 'Connect Zone', icon: Users, color: 'from-rose-500 to-pink-500', description: 'Combat loneliness through connection', emoji: '💌', benefits: 'Boosts oxytocin, strengthens bonds' },
    { id: 'give', name: 'Give Zone', icon: Gift, color: 'from-amber-500 to-orange-500', description: 'Transform isolation into purpose', emoji: '🎁', benefits: 'Increases dopamine and serotonin' },
    { id: 'reflect', name: 'Reflect Zone', icon: BookOpen, color: 'from-purple-500 to-indigo-500', description: 'Process emotions through journaling', emoji: '📔', benefits: 'Activates reward center' },
  ];

  const starsLit = constellationProgress?.stars_lit || 0;
  const progressPercentage = Math.round((starsLit / 10) * 100);

  if (activeZone !== 'overview') {
    return (
      <>
        <SEO 
          title="Heartful Holidays - Helper33 | Mindful Holiday Wellness & Grief Support"
          description="Navigate the holiday season with compassion. Find calm, connect with others, practice gratitude, and honor your feelings. Special holiday wellness activities and grief support."
          keywords="holiday grief support, mindful holidays, holiday wellness, coping with loss during holidays, holiday stress relief, gratitude practice, holiday mental health"
          url="https://www.helper33.com/HeartfulHolidays" 
        />
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Guest User Prompt */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white border-0 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Sparkles className="w-12 h-12 flex-shrink-0" />
                      <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-xl mb-2">🎄 Save Your Wellness Journey!</p>
                        <p className="text-white/90">Create a free account to track your stars, save progress, and light up your full constellation. Your journey matters! ✨</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => base44.auth.redirectToLogin()}
                          className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg"
                        >
                          Create Free Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeZone === 'calm' && <CalmZone onBack={() => setActiveZone('overview')} />}
            {activeZone === 'connect' && <ConnectZone onBack={() => setActiveZone('overview')} />}
            {activeZone === 'give' && <GiveZone onBack={() => setActiveZone('overview')} />}
            {activeZone === 'reflect' && <ReflectZone onBack={() => setActiveZone('overview')} />}
            {activeZone === 'constellation' && <ConstellationChallenge onBack={() => setActiveZone('overview')} onNavigateToZone={handleNavigateToZone} />}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Heartful Holidays - Helper33 | Mindful Holiday Wellness & Grief Support"
        description="Navigate the holiday season with compassion. Find calm, connect with others, practice gratitude, and honor your feelings. Special holiday wellness activities and grief support."
        keywords="holiday grief support, mindful holidays, holiday wellness, coping with loss during holidays, holiday stress relief, gratitude practice, holiday mental health"
        url="https://www.helper33.com/HeartfulHolidays" 
      />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 flex items-center justify-center shadow-2xl mx-auto mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-700 via-red-600 to-amber-700 bg-clip-text text-transparent">
              Heartful Holidays 🎄
            </h1>
            <p className="text-2xl text-gray-700 font-medium mb-2">Calm, Connect, and Give</p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Because the holidays should warm your heart, not weigh it down.
            </p>
            <Badge className="bg-white/90 text-gray-700 border-2 border-amber-300 px-4 py-2 text-sm mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Science-Backed Wellness
            </Badge>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => handleShareToSocial('facebook')} variant="outline" className="bg-white/90 hover:bg-white">
                <span className="mr-2">📘</span> Facebook
              </Button>
              <Button onClick={() => handleShareToSocial('twitter')} variant="outline" className="bg-white/90 hover:bg-white">
                <span className="mr-2">🐦</span> Twitter
              </Button>
              <Button onClick={() => handleShareToSocial('instagram')} variant="outline" className="bg-white/90 hover:bg-white">
                <span className="mr-2">📷</span> Instagram
              </Button>
              <Button onClick={() => handleShareToSocial('tiktok')} variant="outline" className="bg-white/90 hover:bg-white">
                <span className="mr-2">🎵</span> TikTok
              </Button>
              <Button onClick={() => handleShareToSocial('linkedin')} variant="outline" className="bg-white/90 hover:bg-white">
                <span className="mr-2">💼</span> LinkedIn
              </Button>
            </div>
          </motion.div>

          {/* Guest User Welcome Prompt */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-700 text-white border-0 shadow-2xl">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl font-bold mb-3">Welcome to Heartful Holidays! 🎄</h2>
                  <p className="text-xl text-orange-100 mb-6">
                    You're browsing as a guest. <strong>Create a free account</strong> to save your progress, light up stars, and unlock the full healing experience!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      size="lg"
                      className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-xl"
                    >
                      Create Free Account
                      <Star className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Keep Exploring
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <Card className="bg-white/80 border-2 border-cyan-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <Wind className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{userActivities.filter(a => a.zone === 'calm').length}</p>
                    <p className="text-xs text-gray-600">Calm Activities</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Card className="bg-white/80 border-2 border-rose-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{userActivities.filter(a => a.zone === 'connect').length}</p>
                    <p className="text-xs text-gray-600">Connections</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <Card className="bg-white/80 border-2 border-amber-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <Gift className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{userActivities.filter(a => a.zone === 'give').length}</p>
                    <p className="text-xs text-gray-600">Acts of Kindness</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                <Card className="bg-white/80 border-2 border-purple-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{starsLit}/10</p>
                    <p className="text-xs text-gray-600">Stars Lit</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          <Card className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white border-0 shadow-2xl mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Why This Matters</h2>
              <p className="text-white/90 text-lg mb-6">
                ER visits increase 40% during holidays due to loneliness & anxiety. Social connection, gratitude, and giving activate the brain's reward center.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="font-semibold mb-1">Social Connection</p>
                  <p className="text-sm text-white/80">Increases oxytocin</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="font-semibold mb-1">Gratitude Practice</p>
                  <p className="text-sm text-white/80">Activates reward center</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="font-semibold mb-1">Helping Others</p>
                  <p className="text-sm text-white/80">Boosts serotonin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {zones.map((zone, index) => {
              const Icon = zone.icon;
              return (
                <motion.div 
                  key={zone.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white/80 border-0 shadow-lg hover:shadow-2xl transition-all">
                    <div className={`h-2 bg-gradient-to-r ${zone.color}`} />
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${zone.color} shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">{zone.name}</CardTitle>
                          <CardDescription className="text-gray-600 text-base">{zone.description}</CardDescription>
                          <Badge variant="outline" className="mt-3 text-xs">{zone.benefits}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => {
                          console.log('🎯 Navigating to zone:', zone.id);
                          setActiveZone(zone.id);
                        }} 
                        className={`w-full bg-gradient-to-r ${zone.color} text-white hover:opacity-90 active:scale-95 transition-all shadow-md hover:shadow-lg`}
                      >
                        Enter {zone.emoji}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white border-0 shadow-2xl relative overflow-hidden">
              {/* Constellation Badge - Top Right */}
              {user && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                    <Star className="w-4 h-4 mr-2" />
                    Constellation {progressPercentage}%
                  </Badge>
                </div>
              )}

              <CardContent className="p-12 text-center relative z-10">
                <Sparkles className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-4xl font-bold mb-4">✨ Constellation of Kindness ✨</h2>
                <p className="text-xl mb-4 text-purple-100">
                  Light up 10 stars by completing wellness activities
                </p>
                <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + (i * 0.05) }}
                    >
                      <Star 
                        className={`w-6 h-6 ${i < starsLit ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} 
                      />
                    </motion.div>
                  ))}
                </div>
                <p className="text-lg text-purple-200 mb-6">
                  {starsLit === 10 ? '🎉 Constellation Complete! You earned the Heartful Holidays badge!' : `${starsLit}/10 Stars Lit - ${10 - starsLit} more to go!`}
                </p>
                <Button 
                  onClick={() => {
                    console.log('🎯 Opening Constellation Challenge');
                    setActiveZone('constellation');
                  }} 
                  size="lg" 
                  className="bg-white text-purple-900 hover:bg-purple-50 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                >
                  View Challenge
                  <Star className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}