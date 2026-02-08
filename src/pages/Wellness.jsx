
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Droplets,
  TrendingUp,
  Smile,
  Zap,
  Sparkles,
  Trophy,
  Flame,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSun,
  CheckCircle,
  ShieldAlert,
  Heart,
  Moon,
  Loader2,
  Sunrise // New import
} from "lucide-react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useNotifications } from "@/components/SoundManager";
import { useActivityTracker } from "@/components/ActivityTracker";
import { toast } from "sonner";
import EmergencyAlert from "@/components/wellness/EmergencyAlert";
import WellnessReminders from "@/components/wellness/WellnessReminders";
import WaterTracker from "@/components/wellness/WaterTracker";
import ExercisePrompts from "@/components/wellness/ExercisePrompts";
import WellnessHistoryChart from "@/components/wellness/WellnessHistoryChart";
import WeeklyInsights from "@/components/wellness/WeeklyInsights";
import JournalPromptCard from "@/components/wellness/JournalPromptCard";
import WeatherInsight from "@/components/wellness/WeatherInsight";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GuestPrompt from '@/components/common/GuestPrompt';
import SunlightReminder from "@/components/wellness/SunlightReminder";
import PointsNotification from '@/components/gamification/PointsNotification';
import SocialShareModal from '@/components/social/SocialShareModal';
import SEO from '@/components/SEO';
import { getSEOForPage } from '@/components/SEODefaults';
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer';

// Sunlight-inspired glass-morphism
const SUNLIGHT_GLASS_CARD = "bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-yellow-50/60 backdrop-blur-xl border border-orange-200/30 rounded-[30px] shadow-[0_8px_32px_rgba(251,191,36,0.15)]";

// Animated Sun Rays Background
const SunRaysBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {/* Radial gradient sun glow */}
    <motion.div
      className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(252,211,77,0.2) 30%, rgba(253,224,71,0.1) 60%, transparent 100%)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.6, 0.4]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />

    {/* Sun rays */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-1/4 left-1/2 w-1 bg-gradient-to-b from-yellow-300/20 to-transparent"
        style={{
          height: '40%',
          transformOrigin: 'top center',
          transform: `rotate(${i * 30}deg)`,
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scaleY: [1, 1.3, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "easeInOut"
        }}
      />
    ))}

    {/* Floating light particles */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute w-2 h-2 bg-yellow-300/40 rounded-full blur-sm"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 5,
        }}
      />
    ))}
  </div>
);

// --- GAMIFIED ASSESSMENT: Emotional Weather ---
const EmotionalWeather = ({ value, onChange }) => {
  const weatherOptions = [
    { mood: 'stormy', icon: CloudLightning, label: 'Stormy', color: 'text-gray-600', glow: 'hover:shadow-[0_0_20px_rgba(107,114,128,0.4)]' },
    { mood: 'rainy', icon: CloudRain, label: 'Rainy', color: 'text-blue-500', glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' },
    { mood: 'cloudy', icon: Cloud, label: 'Cloudy', color: 'text-gray-500', glow: 'hover:shadow-[0_0_20px_rgba(156,163,175,0.4)]' },
    { mood: 'partly_cloudy', icon: CloudSun, label: 'Mixed', color: 'text-amber-500', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]' },
    { mood: 'sunny', icon: Sun, label: 'Sunny', color: 'text-yellow-500', glow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]' },
  ];

  return (
    <div>
      <Label className="text-base font-medium mb-3 block text-center text-amber-900">What's your emotional weather today?</Label>
      <div className="flex justify-around items-center bg-gradient-to-r from-orange-100/40 via-amber-100/40 to-yellow-100/40 p-4 rounded-full backdrop-blur-sm">
        <AnimatePresence>
          {weatherOptions.map(opt => (
            <motion.button
              key={opt.mood}
              type="button"
              onClick={() => onChange(opt.mood)}
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-full transition-all duration-300 relative ${value === opt.mood ? 'bg-white shadow-[0_0_25px_rgba(251,191,36,0.6)]' : `opacity-60 hover:opacity-100 ${opt.glow}`
                }`}
            >
              <opt.icon className={`w-8 h-8 ${opt.color}`} />
              {value === opt.mood && (
                <motion.div
                  className="absolute -inset-1 border-3 border-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                  layoutId="weather-selector"
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};


function AnimatedStat({ value, isPercentage = false }) {
  const springValue = useSpring(0, { stiffness: 100, damping: 20 });
  const displayValue = useTransform(springValue, (latest) => `${Math.round(latest)}${isPercentage ? '%' : ''}`);

  useEffect(() => {
    springValue.set(parseFloat(value) || 0);
  }, [value, springValue]);

  return (
    <motion.span>
      {displayValue}
    </motion.span>
  );
}

const GoalCheckIcon = ({ icon: Icon, isComplete }) => (
  <motion.div
    animate={{
      scale: isComplete ? [1, 1.3, 1] : 1,
      color: isComplete ? '#10B981' : '#9CA3AF'
    }}
    transition={{ duration: 0.5, type: 'spring' }}
  >
    <Icon className="w-6 h-6" />
  </motion.div>
);

// --- ENHANCED WELLNESS STATS WITH VISUAL PROGRESS ---
const WellnessStats = ({ stats, todayProgress, waterGoal = 8 }) => {
  const { level, xp, streak, achievements } = stats;

  const goals = {
    mood: todayProgress.mood,
    sleep: todayProgress.sleep,
    water: todayProgress.water >= waterGoal,
    exercise: todayProgress.exercise >= 30,
  };

  const completedGoals = Object.values(goals).filter(Boolean).length;
  const wellnessCompletion = Math.round((completedGoals / 4) * 100);

  const statItems = [
    { icon: Sparkles, value: level, label: 'Level', color: 'text-purple-500' },
    { icon: Flame, value: streak, label: 'Streak', color: 'text-orange-500' },
    { icon: Trophy, value: achievements, label: 'Badges', color: 'text-yellow-500' },
    { icon: TrendingUp, value: wellnessCompletion, label: 'Today', color: 'text-emerald-500', isPercentage: true }
  ];

  return (
    <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={`${SUNLIGHT_GLASS_CARD} shadow-[0_12px_40px_rgba(251,146,60,0.25)]`}>
        <CardContent className="p-6">
          <div className="flex justify-around items-center text-center">
            {statItems.map(item => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * statItems.indexOf(item) }}
              >
                <div className="flex items-center justify-center gap-2">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                  <span className="text-3xl font-bold text-gray-800">
                    <AnimatedStat value={item.value} isPercentage={item.isPercentage} />
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.label}</p>
                {item.label === 'Badges' && <div data-badge></div>}
              </motion.div>
            ))}
          </div>
          <div className="mt-4">
            <Label className="text-sm text-gray-700">Daily Wellness Progress</Label>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
              <motion.div
                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${wellnessCompletion}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-200/60">
            <Label className="text-sm text-gray-700 mb-2 block text-center">Today's Goals</Label>
            <div className="flex justify-around items-center text-gray-400">
              <GoalCheckIcon icon={Smile} isComplete={goals.mood} />
              <GoalCheckIcon icon={Moon} isComplete={goals.sleep} />
              <GoalCheckIcon icon={Droplets} isComplete={goals.water} />
              <GoalCheckIcon icon={Zap} isComplete={goals.exercise} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Wellness() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const { trackActivity } = useActivityTracker();
  const { playSound } = useNotifications();

  const today = new Date().toISOString().split('T')[0];

  // Use react-query for user data
  const { data: user, isLoading: isUserLoading } = useQuery({
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

  // Use react-query for wellness entries
  const { data: wellnessEntries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['wellnessEntries', authUser?.id],
    queryFn: async () => {
      if (!authUser) return [];
      const { data, error } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', authUser.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!authUser,
    initialData: [],
  });

  const isLoading = isUserLoading || isLoadingEntries;

  // Find the most recent entry for today (there might be duplicates)
  const wellnessEntryForToday = useMemo(() => {
    if (isLoadingEntries || !wellnessEntries) return null;

    // Get all entries for today
    const todayEntries = wellnessEntries.filter(entry => entry.date === today);

    if (todayEntries.length === 0) return null;

    // If only one entry, return it directly.
    if (todayEntries.length === 1) {
      return todayEntries[0];
    }

    // Merge multiple entries for today.
    // `wellnessEntries` are sorted by `-updated_date`, so `todayEntries[0]` is the most recently updated entry for today.
    // We start the accumulation with `todayEntries[0]` to ensure its ID and date are kept,
    // and its non-numeric values (emotional_weather, sleep_quality, notes, is_logged_to_history) are prioritized.
    const initialMostRecentEntry = todayEntries[0];

    const merged = todayEntries.reduce((acc, entry) => {
      return {
        // Keep the ID and date from the *initial* most recent entry
        id: initialMostRecentEntry.id,
        date: initialMostRecentEntry.date,

        // For non-numeric fields: prioritize the current accumulated value (which started as the most recent).
        // If the accumulated value is null/empty, then fall back to the current entry's value.
        emotional_weather: acc.emotional_weather || entry.emotional_weather,
        sleep_quality: acc.sleep_quality || entry.sleep_quality,
        notes: acc.notes || entry.notes,
        is_logged_to_history: acc.is_logged_to_history || entry.is_logged_to_history,

        // For numerical fields: take the maximum value encountered so far for the day.
        energy_level: Math.max(acc.energy_level || 0, entry.energy_level || 0),
        sleep_hours: Math.max(acc.sleep_hours || 0, entry.sleep_hours || 0),
        water_intake: Math.max(acc.water_intake || 0, entry.water_intake || 0),
        exercise_minutes: Math.max(acc.exercise_minutes || 0, entry.exercise_minutes || 0),
        meditation_minutes: Math.max(acc.meditation_minutes || 0, entry.meditation_minutes || 0),
      };
    }, initialMostRecentEntry); // Start reduction with the most recent entry

    return merged;
  }, [wellnessEntries, isLoadingEntries, today]);

  const [formData, setFormData] = useState({
    emotional_weather: null,
    energy_level: 5,
    sleep_hours: 0,
    sleep_quality: 5,
    water_intake: 0,
    exercise_minutes: 0,
    meditation_minutes: 0,
    notes: "",
  });

  const [gamificationStats, setGamificationStats] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    achievements: 0
  });

  const [weeklyInsights, setWeeklyInsights] = useState([]);

  // Wellness settings state
  const [wellnessSettings, setWellnessSettings] = useState({
    bedtime: "22:00",
    wakeup: "07:00",
    water_goal: 8,
    water_reminder_interval: 60,
    exercise_reminder_interval: 120,
    sleep_reminder_before_bed: 30,
    movement_breaks: true
  });

  // Track today's progress for visual feedback
  const [todayProgress, setTodayProgress] = useState({
    water: 0,
    exercise: 0,
    sleep: false,
    mood: false
  });

  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [pointsNotification, setPointsNotification] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);


  // Effect to initialize/reset formData and todayProgress when wellnessEntryForToday changes
  useEffect(() => {
    if (isLoadingEntries) return;

    if (wellnessEntryForToday) {
      const entryData = {
        emotional_weather: wellnessEntryForToday.emotional_weather || null,
        energy_level: wellnessEntryForToday.energy_level || 5,
        sleep_hours: wellnessEntryForToday.sleep_hours || 0,
        sleep_quality: wellnessEntryForToday.sleep_quality || 5,
        water_intake: wellnessEntryForToday.water_intake || 0,
        exercise_minutes: wellnessEntryForToday.exercise_minutes || 0,
        meditation_minutes: wellnessEntryForToday.meditation_minutes || 0,
        notes: wellnessEntryForToday.notes || "",
      };

      setFormData(entryData);

      setTodayProgress({
        water: entryData.water_intake,
        exercise: entryData.exercise_minutes,
        sleep: entryData.sleep_hours >= 6,
        mood: !!entryData.emotional_weather
      });
    } else {
      const resetData = {
        emotional_weather: null,
        energy_level: 5,
        sleep_hours: 0,
        sleep_quality: 5,
        water_intake: 0,
        exercise_minutes: 0,
        meditation_minutes: 0,
        notes: "",
      };

      setFormData(resetData);
      setTodayProgress({ water: 0, exercise: 0, sleep: false, mood: false });
    }
  }, [wellnessEntryForToday, isLoadingEntries]);


  // Effect to update wellnessSettings from user data
  useEffect(() => {
    if (user && user.wellness_settings) {
      setWellnessSettings(prev => ({ ...prev, ...user.wellness_settings }));
    }
  }, [user]);

  const calculateGamification = useCallback((allEntries) => {
    const totalEntries = allEntries.length;
    const level = Math.floor(totalEntries / 5) + 1;
    const xp = (totalEntries % 5) * 20;

    let streak = 0;
    if (totalEntries > 0) {
      const sortedEntries = [...allEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
      let currentDate = new Date();
      if (new Date(sortedEntries[0].date + 'T00:00:00').toDateString() !== currentDate.toDateString()) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      for (let i = 0; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].date + 'T00:00:00');
        const diffDays = Math.round((currentDate - entryDate) / (1000 * 60 * 60 * 24));

        if (diffDays === i) {
          streak++;
        } else {
          break;
        }
      }
    }

    const achievements = (streak >= 7 ? 1 : 0) + (totalEntries >= 30 ? 1 : 0);

    setGamificationStats({ level, xp, streak, achievements });
  }, []);

  const generateWeeklyInsights = useCallback((recentEntries) => {
    const insights = [];
    const entryCount = recentEntries.length;

    if (entryCount < 3) {
      setWeeklyInsights([]);
      return;
    }

    const avgSleep = recentEntries.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / entryCount;
    if (avgSleep >= 7.5) {
      insights.push({ type: 'sleep', text: `Great work! You've averaged over ${avgSleep.toFixed(1)} hours of sleep this week.` });
    } else if (avgSleep < 6) {
      insights.push({ type: 'sleep', text: `This week's average sleep was ${avgSleep.toFixed(1)} hours. Prioritizing rest could boost your energy.` });
    }

    const exerciseDays = recentEntries.filter(e => e.exercise_minutes >= 20).length;
    if (exerciseDays >= 3) {
      insights.push({ type: 'exercise', text: `You were active on ${exerciseDays} days this week. Fantastic consistency!` });
    }

    const avgWater = recentEntries.reduce((sum, e) => sum + (e.water_intake || 0), 0) / entryCount;
    if (avgWater >= wellnessSettings.water_goal) {
      insights.push({ type: 'water', text: `Excellent hydration! You averaged ${avgWater.toFixed(1)} glasses per day this week.` });
    }

    const highEnergyDays = recentEntries.filter(e => e.energy_level && e.energy_level >= 7);
    if (highEnergyDays.length > 0) {
      const highEnergyWithExercise = highEnergyDays.filter(e => e.exercise_minutes && e.exercise_minutes > 0).length;
      if (highEnergyWithExercise / highEnergyDays.length > 0.5) {
        insights.push({ type: 'exercise', text: "It looks like movement is a great way to boost your energy levels!" });
      }
    }

    setWeeklyInsights(insights);
  }, [wellnessSettings.water_goal]);

  // Effect to run gamification and insights when wellnessEntries change
  useEffect(() => {
    if (wellnessEntries && !isLoadingEntries) {
      calculateGamification(wellnessEntries);
      const recentEntries = wellnessEntries.slice(0, 7);
      generateWeeklyInsights(recentEntries);
    }
  }, [wellnessEntries, isLoadingEntries, calculateGamification, generateWeeklyInsights]);


  // New useEffect to log previous day's wellness totals to HealthLog
  useEffect(() => {
    const logPreviousDaySummary = async () => {
      if (isLoadingEntries || !wellnessEntries || wellnessEntries.length === 0) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().slice(0, 10);

      const yesterdayEntry = wellnessEntries.find(entry => entry.date === yesterdayString);

      if (yesterdayEntry && !yesterdayEntry.is_logged_to_history) {
        const logsToCreate = [];

        if (yesterdayEntry.water_intake > 0) {
          logsToCreate.push({
            log_type: 'water',
            title: 'Total Daily Water Intake',
            log_date: `${yesterdayString}T23:59:59`,
            details: { water_glasses: yesterdayEntry.water_intake },
            notes: `Automated summary from ${yesterdayString}.`
          });
        }

        if (yesterdayEntry.exercise_minutes > 0) {
          logsToCreate.push({
            log_type: 'activity',
            title: 'Total Daily Activity',
            log_date: `${yesterdayString}T23:59:59`,
            details: { duration_minutes: yesterdayEntry.exercise_minutes },
            notes: `Automated summary from ${yesterdayString}.`
          });
        }

        if (logsToCreate.length > 0) {
          try {
            const logsWithUserId = logsToCreate.map(log => ({ ...log, user_id: authUser.id }));
            await supabase.from('health_logs').insert(logsWithUserId);
            await supabase.from('wellness_entries').update({ is_logged_to_history: true }).eq('id', yesterdayEntry.id);
            queryClient.invalidateQueries({ queryKey: ['healthLogs'] });
            queryClient.invalidateQueries({ queryKey: ['wellnessEntries'] });
          } catch (error) {
            console.error("Failed to log yesterday's summary:", error);
          }
        } else {
          await supabase.from('wellness_entries').update({ is_logged_to_history: true }).eq('id', yesterdayEntry.id);
          queryClient.invalidateQueries({ queryKey: ['wellnessEntries'] });
        }
      }
    };

    if (wellnessEntries && !isLoadingEntries) {
      logPreviousDaySummary();
    }
  }, [wellnessEntries, isLoadingEntries, queryClient, today]);


  // Save wellness settings
  const saveWellnessSettings = async (newSettings) => {
    // Check if user is logged in
    if (!user) {
      setShowGuestPrompt(true);
      return;
    }

    try {
      await supabase.from('profiles').update({ wellness_settings: newSettings }).eq('id', authUser.id);
      setWellnessSettings(newSettings);
      playSound('success');
      toast.success("Wellness settings updated!", {
        description: "Your personalized reminders are now active.",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      console.log("Error saving wellness settings", error);
      playSound('error');
      toast.error("Error saving settings.", {
        description: "Please try again.",
      });
    }
  };

  // Mutation for saving wellness entries
  const saveEntryMutation = useMutation({
    mutationFn: async (entryData) => {
      if (!authUser) throw new Error("Auth required");
      if (wellnessEntryForToday) {
        const { data, error } = await supabase
          .from('wellness_entries')
          .update(entryData)
          .eq('id', wellnessEntryForToday.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('wellness_entries')
          .insert({ ...entryData, user_id: authUser.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (savedEntry) => {
      queryClient.invalidateQueries({ queryKey: ['wellnessEntries'] });
      return savedEntry;
    },
    onError: (error) => {
      console.error("Error saving wellness entry:", error);
      throw error;
    }
  });

  // Enhanced save function with auto-save capability
  const saveEntry = useCallback(async (showToast = true) => {
    // Check if user is logged in
    if (!user) {
      setShowGuestPrompt(true);
      return;
    }

    if (showToast) {
      playSound('click');
    }

    const isNewEntry = !wellnessEntryForToday;

    try {
      const entryData = {
        ...formData,
        date: today,
        is_logged_to_history: false
      };

      const savedEntry = await saveEntryMutation.mutateAsync(entryData);

      if (showToast) {
        playSound('success');
      }

      setTodayProgress({
        water: formData.water_intake,
        exercise: formData.exercise_minutes,
        sleep: formData.sleep_hours >= 6,
        mood: !!formData.emotional_weather
      });

      queryClient.invalidateQueries({ queryKey: ['wellnessEntries'] });

      // Track activity
      trackActivity('wellness_check', 'wellness', {
        activityData: {
          emotional_weather: formData.emotional_weather,
          energy_level: formData.energy_level,
          water_intake: formData.water_intake,
          exercise_minutes: formData.exercise_minutes
        },
        relatedEntityType: 'WellnessEntry',
        relatedEntityId: savedEntry.id
      });

      // Award points for wellness check-in
      if (isNewEntry && showToast) {
        try {
          const pointsResult = await base44.functions.invoke('awardPoints', {
            activity_type: 'wellness_log',
            activity_data: { entry_id: savedEntry.id }
          });

          if (pointsResult.data.success) {
            setPointsNotification(pointsResult.data);
            queryClient.invalidateQueries({ queryKey: ['user'] });
          }
        } catch (error) {
          console.error('Error awarding points:', error);
        }
      }

      if (showToast) {
        const completedGoals = [
          formData.sleep_hours >= 6,
          formData.water_intake >= wellnessSettings.water_goal,
          formData.exercise_minutes >= 30,
          !!formData.emotional_weather
        ].filter(Boolean).length;

        if (completedGoals === 4) {
          playSound('complete');
          toast.success('🌟 Perfect Wellness Day!', {
            description: "You've completed all your goals!",
            duration: 5000,
          });
        } else {
          toast.success('Entry Saved!', {
            description: `Keep up the great work!`,
          });
        }
      }

      return savedEntry;
    } catch (error) {
      console.log("Error saving wellness entry", error);
      if (showToast) {
        playSound('error');
        toast.error("Couldn't save your entry.", {
          description: "Please try again in a moment."
        });
      }
      throw error;
    }
  }, [formData, wellnessEntryForToday, today, wellnessSettings.water_goal, trackActivity, queryClient, user, playSound, toast, setPointsNotification, saveEntryMutation]);

  // Auto-save function (saves without showing toast)
  const autoSave = useCallback(async () => {
    try {
      await saveEntry(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed', {
        description: error.message || 'Network error'
      });
    }
  }, [saveEntry, toast]);

  // Debounced auto-save effect
  useEffect(() => {
    const hasMeaningfulData = formData.water_intake > 0 ||
      formData.exercise_minutes > 0 ||
      formData.sleep_hours > 0 ||
      formData.emotional_weather !== null ||
      formData.notes !== "";

    if (isLoadingEntries || (!hasMeaningfulData && !wellnessEntryForToday)) {
      return;
    }

    // Don't auto-save for guests, let the manual save trigger the prompt
    if (!user) {
      return;
    }

    const timeoutId = setTimeout(() => {
      autoSave();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [formData, autoSave, isLoadingEntries, wellnessEntryForToday, user]);


  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'water_intake') {
      setTodayProgress(prev => ({ ...prev, water: value }));
    } else if (field === 'exercise_minutes') {
      setTodayProgress(prev => ({ ...prev, exercise: value }));
    } else if (field === 'sleep_hours') {
      setTodayProgress(prev => ({ ...prev, sleep: value >= 6 }));
    } else if (field === 'emotional_weather') {
      setTodayProgress(prev => ({ ...prev, mood: !!value }));
    }
  };

  const seo = getSEOForPage('Wellness');

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url="https://www.helper33.com/Wellness"
        structuredData={seo.structuredData}
      />

      {/* Sunlight-Inspired Background */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Dynamic Gradient Background - Sunrise/Sunset */}
        <div className="fixed inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100">
          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-200/30 via-transparent to-yellow-200/30" />
        </div>

        {/* Animated Sun Rays */}
        <SunRaysBackground />

        {/* Content Layer */}
        <div className="relative z-10 p-4 sm:p-6">
          {/* Sunlight Reminder Popup */}
          <SunlightReminder />

          {/* Points Notification with Share */}
          {pointsNotification && (
            <PointsNotification
              points={pointsNotification.points_earned}
              breakdown={pointsNotification.breakdown}
              leveledUp={pointsNotification.leveled_up}
              newLevel={pointsNotification.new_level}
              achievements={pointsNotification.achievements_earned}
              perfectDay={pointsNotification.perfect_day}
              onClose={() => setPointsNotification(null)}
              onShare={(data) => {
                setShareData(data);
                setShareModalOpen(true);
              }}
            />
          )}

          {/* Guest Prompt Modal */}
          {showGuestPrompt && (
            <GuestPrompt
              action="save your wellness entries"
              onCancel={() => setShowGuestPrompt(false)}
            />
          )}

          {/* Page Header with Sunset/Sunrise vibes */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-4"
            >
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-400 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)]">
                <Sun className="w-10 h-10 text-white" />
                {/* Pulsing glow */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-yellow-300"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              </div>
            </motion.div>

            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
              Daily Wellness Tracking
            </h1>
            <p className="text-amber-900 font-medium text-lg">Personal wellness reflection and habit tracking</p>
          </motion.div>

          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 max-w-4xl mx-auto"
          >
            <MedicalDisclaimer variant="inline" page="wellness" />
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sun className="h-12 w-12 text-amber-500" />
              </motion.div>
              <span className="ml-3 text-lg text-amber-900">Loading your wellness journey...</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <WellnessStats
                stats={gamificationStats}
                todayProgress={todayProgress}
                waterGoal={wellnessSettings.water_goal}
              />
            </motion.div>
          )}

          {/* Main Content Grid with Sunlight Glass-Morphism Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            {/* Daily Entry Form - Sunlight Glass Card */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className={`${SUNLIGHT_GLASS_CARD} border-0 shadow-[0_12px_40px_rgba(251,146,60,0.3)] overflow-hidden relative`}>
                  {/* Sunlight reflection overlay */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-300/20 via-amber-200/10 to-transparent rounded-bl-[120px] blur-2xl" />

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <motion.div
                        animate={{
                          rotate: [0, 10, 0],
                          scale: [1, 1.15, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Heart className="w-7 h-7 text-orange-500" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent font-bold text-2xl">
                        Today's Reflection
                      </span>
                      <Sunrise className="w-6 h-6 text-amber-500 ml-auto" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 relative z-10">

                    <EmotionalWeather value={formData.emotional_weather} onChange={v => updateFormData('emotional_weather', v)} />

                    {/* Energy Level */}
                    <div>
                      <Label htmlFor="energy" className="text-base font-medium text-center block mb-3 text-amber-900">
                        Energy Level ({formData.energy_level}/10)
                      </Label>
                      <input
                        type="range" id="energy" min="1" max="10"
                        value={formData.energy_level}
                        onChange={(e) => updateFormData('energy_level', parseInt(e.target.value))}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer 
                                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 
                                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-orange-400 [&::-webkit-slider-thumb]:to-amber-400 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(251,191,36,0.6)]
                                   [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-orange-400 [&::-moz-range-thumb]:to-amber-400"
                        style={{
                          background: `linear-gradient(to right, #FB923C 0%, #FBBF24 ${formData.energy_level * 10}%, #FDE68A 100%)`
                        }}
                      />
                    </div>

                    {/* Core Metrics with Sunlight styling */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="sleep" className="text-amber-900 font-medium flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-500" />
                          Sleep (hrs)
                        </Label>
                        <Input
                          id="sleep"
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={formData.sleep_hours}
                          onChange={(e) => updateFormData('sleep_hours', parseFloat(e.target.value) || 0)}
                          className="border-2 border-amber-200/50 bg-white/60 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-amber-900 placeholder-amber-600/50 shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="water" className="text-amber-900 font-medium flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          Water (glasses)
                        </Label>
                        <Input
                          id="water"
                          type="number"
                          min="0"
                          value={formData.water_intake}
                          onChange={(e) => updateFormData('water_intake', parseInt(e.target.value) || 0)}
                          className="border-2 border-amber-200/50 bg-white/60 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-amber-900 placeholder-amber-600/50 shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exercise" className="text-amber-900 font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-500" />
                          Exercise (min)
                        </Label>
                        <Input
                          id="exercise"
                          type="number"
                          min="0"
                          value={formData.exercise_minutes}
                          onChange={(e) => updateFormData('exercise_minutes', parseInt(e.target.value) || 0)}
                          className="border-2 border-amber-200/50 bg-white/60 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-amber-900 placeholder-amber-600/50 shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes" className="text-base font-medium text-amber-900">Additional Reflections</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => updateFormData('notes', e.target.value)}
                        placeholder="Any thoughts or insights from today?"
                        className="h-24 mt-2 border-2 border-amber-200/50 bg-white/60 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-amber-900 placeholder-amber-600/50"
                      />
                    </div>

                    <Button
                      onClick={() => saveEntry(true)}
                      disabled={saveEntryMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white py-4 text-lg font-semibold shadow-[0_8px_30px_rgba(251,146,60,0.4)] hover:shadow-[0_12px_40px_rgba(251,146,60,0.5)] transition-all rounded-[20px] border-2 border-amber-300/30 disabled:opacity-50"
                    >
                      {saveEntryMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {wellnessEntryForToday ? 'Update Today\'s Reflection' : 'Complete Today\'s Reflection'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Journal Prompt Card with Sunlight Glass */}
              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className={SUNLIGHT_GLASS_CARD + " shadow-[0_12px_40px_rgba(251,146,60,0.25)]"}>
                  <JournalPromptCard />
                </div>
              </motion.div>

              {/* Water Tracker with Sunlight Glass */}
              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className={SUNLIGHT_GLASS_CARD + " shadow-[0_12px_40px_rgba(59,130,246,0.2)]"}>
                  <WaterTracker
                    currentIntake={formData.water_intake}
                    goal={wellnessSettings.water_goal}
                    onIntakeUpdate={(value) => updateFormData('water_intake', value)}
                  />
                </div>
              </motion.div>

              {/* Exercise Prompts with Sunlight Glass */}
              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className={SUNLIGHT_GLASS_CARD + " shadow-[0_12px_40px_rgba(251,146,60,0.25)]"}>
                  <ExercisePrompts
                    exerciseMinutes={formData.exercise_minutes}
                    onUpdateExercise={(minutes) => updateFormData('exercise_minutes', minutes)}
                  />
                </div>
              </motion.div>
            </div>

            {/* Side Column with Sunlight Glass Cards */}
            <div className="space-y-8">
              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className={SUNLIGHT_GLASS_CARD + " shadow-[0_12px_40px_rgba(251,146,60,0.25)]"}>
                  <WeatherInsight emotionalWeather={formData.emotional_weather} />
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className={`${SUNLIGHT_GLASS_CARD} border-0 shadow-[0_12px_40px_rgba(239,68,68,0.2)]`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-700">
                      <ShieldAlert className="w-5 h-5" />
                      Urgent Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-900 mb-4 font-medium">If you are in crisis or need immediate help, please use this button to alert your support network.</p>
                    <EmergencyAlert />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className={SUNLIGHT_GLASS_CARD + " shadow-[0_12px_40px_rgba(251,146,60,0.25)]"}>
                  <WellnessReminders
                    settings={wellnessSettings}
                    onSettingsChange={saveWellnessSettings}
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className={SUNLIGHT_GLASS_CARD + " shadow-[0_12px_40px_rgba(251,146,60,0.25)]"}>
                  <WeeklyInsights insights={weeklyInsights} />
                </div>
              </motion.div>

              <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className={SUNLIGHT_GLASS_CARD + " shadow-[0_12px_40px_rgba(251,146,60,0.25)]"}>
                  <WellnessHistoryChart entries={wellnessEntries} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Social Share Modal */}
          <SocialShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            shareType={shareData?.type}
            shareData={shareData}
          />
        </div>
      </div>
    </>
  );
}
