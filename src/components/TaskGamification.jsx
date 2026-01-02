import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Zap, Target, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TaskGamification({ user, tasks = [], recurringCompletions = [] }) {
  const settings = user?.app_settings;
  const isGamificationEnabled = settings?.gamification_enabled !== false;

  const userStats = useMemo(() => {
    if (!user) return {
        totalCompleted: 0,
        todayCompleted: 0,
        level: 1,
        streak: 0
    };
    
    const formatDateForInput = (date) => date.toISOString().split('T')[0];
    const todayStr = formatDateForInput(new Date());

    const nonRecurringCompleted = tasks.filter(t => t.status === 'completed' && (!t.recurring || t.recurring === 'none')).length;
    const totalCompleted = nonRecurringCompleted + recurringCompletions.length;

    const nonRecurringToday = tasks.filter(t => t.status === 'completed' && (!t.recurring || t.recurring === 'none') && t.updated_date && t.updated_date.startsWith(todayStr)).length;
    const recurringToday = recurringCompletions.filter(c => c.completion_date === todayStr).length;
    const todayCompleted = nonRecurringToday + recurringToday;

    return {
        totalCompleted,
        todayCompleted,
        level: Math.floor(totalCompleted / 10) + 1,
        streak: user?.coaching_stats?.streak || 0,
    };
  }, [user, tasks, recurringCompletions]);

  if (!isGamificationEnabled) {
    return null;
  }

  const { level, streak, todayCompleted } = userStats;
  const currentXP = (userStats.totalCompleted * 10) % 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3"
    >
      <Card className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-md border-0">
        <CardContent className="p-3 text-center">
          <Trophy className="w-5 h-5 mx-auto mb-1 opacity-90" />
          <div className="text-lg font-bold leading-tight">Level {level}</div>
          <div className="text-[10px] opacity-80">Task Master</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-md border-0">
        <CardContent className="p-3 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 opacity-90" />
          <div className="text-lg font-bold leading-tight">{currentXP}</div>
          <div className="text-[10px] opacity-80">XP Points</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md border-0">
        <CardContent className="p-3 text-center">
          <Flame className="w-5 h-5 mx-auto mb-1 opacity-90" />
          <div className="text-lg font-bold leading-tight">{streak}</div>
          <div className="text-[10px] opacity-80">Day Streak</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md border-0">
        <CardContent className="p-3 text-center">
          <Target className="w-5 h-5 mx-auto mb-1 opacity-90" />
          <div className="text-lg font-bold leading-tight">{todayCompleted}</div>
          <div className="text-[10px] opacity-80">Done Today</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}