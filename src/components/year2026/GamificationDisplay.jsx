import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Trophy, Award, Flame, Star, Zap, Crown, Target, CheckCircle } from 'lucide-react';

const BADGES = {
  week_warrior: { icon: Flame, label: 'Week Warrior', color: 'from-orange-400 to-red-500', requirement: '7-day streak' },
  month_master: { icon: Crown, label: 'Month Master', color: 'from-yellow-400 to-orange-500', requirement: '30-day streak' },
  consistency_king: { icon: CheckCircle, label: 'Consistency Champion', color: 'from-green-400 to-emerald-500', requirement: '100 days completed' },
  early_bird: { icon: Star, label: 'Early Bird', color: 'from-blue-400 to-cyan-500', requirement: 'Check in before 8 AM for 7 days' },
  goal_crusher: { icon: Target, label: 'Goal Crusher', color: 'from-purple-400 to-pink-500', requirement: 'Complete a goal' },
  triple_threat: { icon: Zap, label: 'Triple Threat', color: 'from-indigo-400 to-purple-500', requirement: '3 active goals' },
  reflection_master: { icon: Award, label: 'Reflection Master', color: 'from-pink-400 to-rose-500', requirement: '30 reflections' }
};

export default function GamificationDisplay({ user, goals, checkIns }) {
  const totalXP = user?.year_2026_total_xp || 0;
  const level = user?.year_2026_level || 1;
  const earnedBadges = user?.year_2026_badges || [];
  
  const xpForNextLevel = level * 100;
  const xpProgress = (totalXP % 100) / xpForNextLevel * 100;

  return (
    <div className="space-y-4">
      {/* Level Progress */}
      <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 border-none shadow-2xl text-white overflow-hidden relative">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.3
          }}
        />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Trophy className="w-8 h-8" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold">Level {level}</h3>
                <p className="text-white/80 text-sm">{totalXP} Total XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{totalXP % 100}</p>
              <p className="text-white/80 text-xs">/ {xpForNextLevel} XP</p>
            </div>
          </div>
          
          <Progress value={xpProgress} className="h-3 bg-white/30" />
          <p className="text-white/80 text-sm mt-2 text-center">
            {xpForNextLevel - (totalXP % 100)} XP to Level {level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
        <CardContent className="p-6">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Achievement Badges ({earnedBadges.length}/{Object.keys(BADGES).length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(BADGES).map(([key, badge], idx) => {
              const Icon = badge.icon;
              const isEarned = earnedBadges.includes(key);
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: isEarned ? 1.1 : 1 }}
                  className={`p-4 rounded-xl text-center transition-all ${
                    isEarned
                      ? `bg-gradient-to-br ${badge.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  title={badge.requirement}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${isEarned ? '' : 'opacity-50'}`} />
                  <p className={`text-xs font-semibold ${isEarned ? '' : 'opacity-50'}`}>
                    {badge.label}
                  </p>
                  {isEarned && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1"
                    >
                      <CheckCircle className="w-4 h-4 mx-auto" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Check-Ins', value: checkIns.filter(c => c.is_checked_in).length, icon: CheckCircle, color: 'green' },
          { label: 'Streak', value: Math.max(...goals.map(g => g.current_streak || 0)), icon: Flame, color: 'orange' },
          { label: 'Badges', value: earnedBadges.length, icon: Award, color: 'purple' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-500`} />
                <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}