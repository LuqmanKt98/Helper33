
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Calendar,
  Droplet,
  Baby,
  Sparkles,
  Sun,
  Moon,
  Activity,
  Flower2,
  BookOpen,
  ArrowRight,
  Settings,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInDays, addDays, startOfDay } from 'date-fns';
import CycleCalendar from '@/components/womens_health/CycleCalendar';
import DailySymptomLogger from '@/components/womens_health/DailySymptomLogger';
import CycleInsights from '@/components/womens_health/CycleInsights';
import OvulationTracker from '@/components/womens_health/OvulationTracker';
import PregnancyDashboard from '@/components/womens_health/PregnancyDashboard';
import FertilityCalendar from '@/components/womens_health/FertilityCalendar';
import PostpartumDashboard from '@/components/womens_health/PostpartumDashboard';
import BabyCareDashboard from '@/components/womens_health/BabyCareDashboard';
import CommunityFeed from '@/components/womens_health/CommunityFeed';
import HealthReports from '@/components/womens_health/HealthReports';
import CaregiverWellness from '@/components/womens_health/CaregiverWellness';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO';

export default function WomensHealthHub() {
  const [activeTab, setActiveTab] = useState('cycle');
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: cycles = [], isLoading: loadingCycles } = useQuery({
    queryKey: ['menstrual-cycles', authUser?.id],
    queryFn: async () => {
      if (!authUser) return [];
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', authUser.id)
        .order('cycle_start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  const { data: symptoms = [], isLoading: loadingSymptoms } = useQuery({
    queryKey: ['cycle-symptoms', authUser?.id],
    queryFn: async () => {
      if (!authUser) return [];
      const { data, error } = await supabase
        .from('cycle_symptoms')
        .select('*')
        .eq('user_id', authUser.id)
        .order('log_date', { ascending: false })
        .limit(90);
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  // Renamed from pregnancyData to trackingData to reflect its broader scope
  const { data: trackingData } = useQuery({
    queryKey: ['pregnancy-tracking', authUser?.id],
    queryFn: async () => {
      if (!authUser) return [];
      const { data, error } = await supabase
        .from('pregnancy_tracking')
        .select('*')
        .eq('user_id', authUser.id);
      if (error) throw error;
      return data; // Return all data, not just the first one directly
    },
    enabled: !!authUser
  });

  // Derived pregnancyData from trackingData (assuming one active tracking entry)
  const pregnancyData = useMemo(() => {
    if (!trackingData || trackingData.length === 0) return null;
    return trackingData[0];
  }, [trackingData]);

  // Determine current "global" phase (pregnancy, postpartum, TTC)
  const currentPhaseFromTracking = useMemo(() => {
    if (!pregnancyData) return null;

    if (pregnancyData.pregnancy_status === 'pregnant' && pregnancyData.current_week) {
      return {
        type: 'pregnant',
        week: pregnancyData.current_week,
        trimester: pregnancyData.current_trimester,
        title: `Week ${pregnancyData.current_week} of Pregnancy`,
        subtitle: `Trimester ${pregnancyData.current_trimester}`,
        icon: Baby,
        color: 'from-blue-500 to-cyan-500'
      };
    }

    if (pregnancyData.pregnancy_status === 'postpartum' && (pregnancyData.postpartum_weeks !== undefined && pregnancyData.postpartum_weeks !== null)) {
      return {
        type: 'postpartum',
        weeks: pregnancyData.postpartum_weeks,
        title: `${pregnancyData.postpartum_weeks} Weeks Postpartum`,
        subtitle: pregnancyData.baby_name ? `${pregnancyData.baby_name}'s Journey` : 'Your Recovery Journey',
        icon: Heart,
        color: 'from-pink-500 to-rose-500'
      };
    }

    if (pregnancyData.pregnancy_status === 'trying_to_conceive') {
      return {
        type: 'ttc',
        title: 'Trying to Conceive',
        subtitle: 'Your Fertility Journey',
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500'
      };
    }

    return null;
  }, [pregnancyData]);


  // Calculate current cycle phase and predictions
  const cycleInfo = useMemo(() => {
    if (!cycles || cycles.length === 0) {
      return {
        currentPhase: 'unknown',
        cycleDay: 0,
        daysUntilNextPeriod: null,
        avgCycleLength: 28,
        isCurrentlyMenstruating: false
      };
    }

    const currentCycle = cycles.find(c => c.is_current_cycle);
    const today = startOfDay(new Date());

    if (currentCycle) {
      const cycleStart = new Date(currentCycle.cycle_start_date);
      const cycleDay = differenceInDays(today, cycleStart) + 1;

      // Calculate average cycle length from history
      const completedCycles = cycles.filter(c => c.cycle_length_days);
      const avgCycleLength = completedCycles.length > 0
        ? Math.round(completedCycles.reduce((sum, c) => sum + c.cycle_length_days, 0) / completedCycles.length)
        : 28;

      const predictedNextPeriod = addDays(cycleStart, avgCycleLength);
      const daysUntilNextPeriod = differenceInDays(predictedNextPeriod, today);

      // Determine cycle phase
      let currentPhase = 'follicular';
      const isCurrentlyMenstruating = cycleDay <= (currentCycle.period_length_days || 5);

      if (isCurrentlyMenstruating) {
        currentPhase = 'menstrual';
      } else if (cycleDay >= 11 && cycleDay <= 16) {
        currentPhase = 'ovulation';
      } else if (cycleDay > 16) {
        currentPhase = 'luteal';
      }

      return {
        currentPhase,
        cycleDay,
        daysUntilNextPeriod,
        avgCycleLength,
        isCurrentlyMenstruating,
        cycleStart
      };
    }

    return {
      currentPhase: 'unknown',
      cycleDay: 0,
      daysUntilNextPeriod: null,
      avgCycleLength: 28,
      isCurrentlyMenstruating: false
    };
  }, [cycles]);

  const getPhaseInfo = (phase) => {
    const phases = {
      menstrual: {
        name: 'Menstrual Phase',
        icon: Droplet,
        color: 'from-red-400 to-pink-500',
        description: 'Your period - time for rest and self-care',
        title: 'Menstrual Phase',
        subtitle: 'Your period - time for rest and self-care'
      },
      follicular: {
        name: 'Follicular Phase',
        icon: Sun,
        color: 'from-yellow-400 to-orange-500',
        description: 'Rising energy - great time for new projects',
        title: 'Follicular Phase',
        subtitle: 'Rising energy - great time for new projects'
      },
      ovulation: {
        name: 'Ovulation Phase',
        icon: Flower2,
        color: 'from-pink-400 to-rose-500',
        description: 'Peak fertility and energy',
        title: 'Ovulation Phase',
        subtitle: 'Peak fertility and energy'
      },
      luteal: {
        name: 'Luteal Phase',
        icon: Moon,
        color: 'from-purple-400 to-indigo-500',
        description: 'Pre-menstrual - focus on comfort and care',
        title: 'Luteal Phase',
        subtitle: 'Pre-menstrual - focus on comfort and care'
      },
      unknown: {
        name: 'Start Tracking',
        icon: Calendar,
        color: 'from-gray-400 to-gray-500',
        description: 'Log your first period to begin',
        title: 'Start Tracking',
        subtitle: 'Log your first period to begin'
      }
    };
    return phases[phase] || phases.unknown;
  };

  // Determine the primary phase information to display (either cycle or pregnancy/postpartum/TTC)
  const displayedPhaseInfo = currentPhaseFromTracking || getPhaseInfo(cycleInfo.currentPhase);
  const DisplayedPhaseIcon = displayedPhaseInfo.icon;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Women's Health Hub",
    "description": "Comprehensive women's health tracking for period, pregnancy, postpartum, and baby care with AI-powered insights",
    "specialty": "Women's Health",
    "audience": {
      "@type": "PeopleAudience",
      "suggestedGender": "female"
    }
  };

  return (
    <>
      <SEO
        title="Women's Health Hub - Helper33 | Period, Pregnancy & Postpartum Tracking"
        description="Comprehensive women's health tracking with AI insights. Monitor your menstrual cycle, track pregnancy week-by-week, log baby care, and connect with a supportive community."
        keywords="period tracker, pregnancy app, postpartum support, baby care tracker, fertility tracking, ovulation calendar, women's health, cycle tracking, pregnancy week by week"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
              Women's Health Hub
            </h1>
            <p className="text-gray-700 text-lg font-medium">
              Track your cycle, understand your body, embrace your wellness journey
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Button
                asChild
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
              >
                <Link to={createPageUrl('WomensHealthCoach')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Health Coach
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/80 hover:bg-white"
              >
                <Link to={createPageUrl('ResourceLibrary')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Resource Library
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/80 hover:bg-white"
              >
                <Link to={createPageUrl('WomensHealthNotifications')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Notifications
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* AI Coach Highlight Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Link to={createPageUrl('WomensHealthCoach')}>
              <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                      >
                        <MessageCircle className="w-7 h-7" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">🤖 AI Health Coach - NEW!</h3>
                        <p className="text-white/90 text-sm">
                          Get personalized meal plans, guided meditations & expert health guidance
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Current Phase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className={`bg-gradient-to-br ${displayedPhaseInfo.color} text-white border-0 shadow-2xl`}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <DisplayedPhaseIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">{displayedPhaseInfo.title || displayedPhaseInfo.name}</h2>
                      <p className="text-white/90">{displayedPhaseInfo.subtitle || displayedPhaseInfo.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {currentPhaseFromTracking && (currentPhaseFromTracking.type === 'pregnant' || currentPhaseFromTracking.type === 'postpartum') ? (
                      <div className="text-5xl font-bold mb-1">
                        {currentPhaseFromTracking.type === 'pregnant' ? `Week ${currentPhaseFromTracking.week}` : `${currentPhaseFromTracking.weeks} Weeks`}
                      </div>
                    ) : (
                      cycleInfo.cycleDay > 0 && (
                        <>
                          <div className="text-5xl font-bold mb-1">Day {cycleInfo.cycleDay}</div>
                          {cycleInfo.daysUntilNextPeriod !== null && cycleInfo.daysUntilNextPeriod > 0 && (
                            <p className="text-white/80">
                              {cycleInfo.daysUntilNextPeriod} days until next period
                            </p>
                          )}
                        </>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg mb-8">
              <TabsTrigger
                value="cycle"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-xl"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cycle</span>
              </TabsTrigger>
              <TabsTrigger
                value="daily" // Changed from 'symptoms' to 'daily'
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl"
              >
                <Activity className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Daily Log</span>
              </TabsTrigger>
              <TabsTrigger
                value="pregnancy"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl"
              >
                <Baby className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pregnancy</span>
              </TabsTrigger>
              <TabsTrigger
                value="postpartum"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl"
              >
                <Heart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Postpartum</span>
              </TabsTrigger>
              <TabsTrigger
                value="baby-care" // Changed from 'baby' to 'baby-care'
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl"
              >
                <Baby className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Baby Care</span>
              </TabsTrigger>
              <TabsTrigger
                value="caregiver" // NEW Tab Trigger
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">My Wellness</span>
              </TabsTrigger>
            </TabsList>

            {/* Cycle Tracker Tab */}
            <TabsContent value="cycle" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CycleCalendar
                    cycles={cycles}
                    symptoms={symptoms}
                    cycleInfo={cycleInfo}
                  />
                </div>
                <div>
                  <CycleInsights
                    cycles={cycles}
                    symptoms={symptoms}
                    cycleInfo={cycleInfo}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Daily Symptom Log Tab - value changed to 'daily' */}
            <TabsContent value="daily" className="mt-6">
              <DailySymptomLogger
                currentCycle={cycles.find(c => c.is_current_cycle)}
                cycleInfo={cycleInfo}
              />
            </TabsContent>

            {/* Fertility Tab - Retained as per "preserve all other features" */}
            <TabsContent value="fertility" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <FertilityCalendar
                  cycles={cycles}
                  symptoms={symptoms}
                  cycleInfo={cycleInfo}
                />
                <OvulationTracker
                  cycles={cycles}
                  symptoms={symptoms}
                  cycleInfo={cycleInfo}
                />
              </div>
            </TabsContent>

            {/* Pregnancy Tab */}
            <TabsContent value="pregnancy" className="mt-6">
              <PregnancyDashboard
                pregnancyData={pregnancyData}
                lastPeriod={cycles[0]?.cycle_start_date}
              />
            </TabsContent>

            {/* Postpartum Tab */}
            <TabsContent value="postpartum" className="mt-6">
              <PostpartumDashboard pregnancyData={pregnancyData} />
            </TabsContent>

            {/* Baby Care Tab - value changed to 'baby-care' */}
            <TabsContent value="baby-care" className="mt-6">
              <BabyCareDashboard pregnancyData={pregnancyData} />
            </TabsContent>

            {/* NEW: Caregiver Wellness Tab */}
            <TabsContent value="caregiver" className="mt-6">
              <CaregiverWellness pregnancyData={pregnancyData} />
            </TabsContent>

            {/* Reports Tab - Retained as per "preserve all other features" */}
            <TabsContent value="reports" className="mt-6">
              <HealthReports />
            </TabsContent>

            {/* Community Tab - Retained as per "preserve all other features" */}
            <TabsContent value="community" className="mt-6">
              <CommunityFeed />
            </TabsContent>
          </Tabs>

          {/* Privacy Notice */}
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-900 mb-2">🔒 Your Data is Private & Secure</h3>
                  <p className="text-sm text-purple-800">
                    All your health data is encrypted and only visible to you. We never share your cycle, fertility,
                    or pregnancy information with anyone. Your wellness journey is completely private.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
