
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Lock,
  Sparkles,
  Award,
  Crown,
  Star,
  Zap,
  Calendar // Added Calendar icon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const tierConfig = {
  bronze: {
    color: 'from-amber-600 to-orange-700',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-300',
    icon: Award,
    glow: 'shadow-amber-200'
  },
  silver: {
    color: 'from-gray-400 to-slate-500',
    bgColor: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-300',
    icon: Star,
    glow: 'shadow-gray-200'
  },
  gold: {
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-400',
    icon: Trophy,
    glow: 'shadow-yellow-200'
  },
  platinum: {
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'from-cyan-50 to-blue-50',
    borderColor: 'border-cyan-400',
    icon: Crown,
    glow: 'shadow-cyan-200'
  },
  diamond: {
    color: 'from-purple-400 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-400',
    icon: Sparkles,
    glow: 'shadow-purple-300'
  },
  legendary: {
    color: 'from-purple-600 to-pink-600',
    bgColor: 'from-purple-100 to-pink-100',
    borderColor: 'border-purple-600',
    icon: Zap,
    glow: 'shadow-purple-400'
  }
};

export default function BadgeShowcase({ compact = false }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: userBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => base44.entities.UserBadge.list('-earned_at')
  });

  const { data: allBadges = [], isLoading: allBadgesLoading } = useQuery({
    queryKey: ['all-badges'],
    queryFn: () => base44.entities.Badge.filter({ is_active: true })
  });

  const categoryGroups = {
    streak: { name: 'Consistency Master', icon: '🔥', color: 'from-orange-500 to-red-500' },
    challenge: { name: 'Challenge Hero', icon: '🏆', color: 'from-yellow-500 to-amber-500' },
    wellness: { name: 'Wellness Warrior', icon: '💪', color: 'from-green-500 to-emerald-500' },
    mindfulness: { name: 'Mindful Soul', icon: '🧘', color: 'from-purple-500 to-indigo-500' },
    journal: { name: 'Reflection Expert', icon: '✍️', color: 'from-blue-500 to-cyan-500' },
    social: { name: 'Community Star', icon: '🌟', color: 'from-pink-500 to-rose-500' },
    milestone: { name: 'Milestone Achiever', icon: '🎯', color: 'from-indigo-500 to-purple-500' },
    special: { name: 'Special Recognition', icon: '✨', color: 'from-violet-500 to-fuchsia-500' }
  };

  const earnedBadgeKeys = new Set(userBadges.map(b => b.badge_key));
  const lockedBadges = allBadges.filter(b => !earnedBadgeKeys.has(b.key) && !b.is_hidden);

  const badgesByTier = {
    bronze: userBadges.filter(b => b.badge_tier === 'bronze'),
    silver: userBadges.filter(b => b.badge_tier === 'silver'),
    gold: userBadges.filter(b => b.badge_tier === 'gold'),
    platinum: userBadges.filter(b => b.badge_tier === 'platinum'),
    diamond: userBadges.filter(b => b.badge_tier === 'diamond'),
    legendary: userBadges.filter(b => b.badge_tier === 'legendary')
  };

  const badgesByCategory = {
    streak: userBadges.filter(b => b.badge_category === 'streak'),
    challenge: userBadges.filter(b => b.badge_category === 'challenge'),
    mindfulness: userBadges.filter(b => b.badge_category === 'mindfulness'),
    journal: userBadges.filter(b => b.badge_category === 'journal'),
    milestone: userBadges.filter(b => b.badge_category === 'milestone'),
    social: userBadges.filter(b => b.badge_category === 'social'),
    special: userBadges.filter(b => b.badge_category === 'special')
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Recent Badges
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {userBadges.slice(0, 6).map((badge, idx) => (
            <BadgeCard key={badge.id} badge={badge} compact delay={idx * 0.05} />
          ))}
        </div>
        {userBadges.length > 6 && (
          <p className="text-sm text-gray-600 text-center">
            +{userBadges.length - 6} more badges
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8"> {/* Changed from space-y-6 to space-y-8 */}
      {/* Stats Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{userBadges.length}</p>
              <p className="text-sm text-purple-100">Total Badges</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{badgesByTier.legendary.length + badgesByTier.platinum.length}</p>
              <p className="text-sm text-purple-100">Rare Badges</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{lockedBadges.length}</p>
              <p className="text-sm text-purple-100">To Unlock</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {Math.round((userBadges.length / (allBadges.length || 1)) * 100)}%
              </p>
              <p className="text-sm text-purple-100">Collection</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Participation Highlight */}
      {(user?.gamification_stats?.events_attended > 0 || user?.gamification_stats?.event_chat_messages > 0 || user?.gamification_stats?.events_rsvp_count > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Community Engagement</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span>🎫 {user.gamification_stats.events_rsvp_count || 0} RSVPs</span>
                    <span>✅ {user.gamification_stats.events_attended || 0} Attended</span>
                    <span>💬 {user.gamification_stats.event_chat_messages || 0} Messages</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badge Gallery */}
      <Tabs defaultValue="earned">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">Earned ({userBadges.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedBadges.length})</TabsTrigger>
          <TabsTrigger value="tiers">By Tier</TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-4 mt-6">
          {Object.entries(badgesByCategory).map(([category, badges]) => (
            badges.length > 0 && (
              <div key={category}>
                <h3 className="text-lg font-bold text-gray-900 mb-3 capitalize">
                  {category.replace('_', ' ')} Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((badge, idx) => (
                    <BadgeCard key={badge.id} badge={badge} delay={idx * 0.05} />
                  ))}
                </div>
              </div>
            )
          ))}

          {userBadges.length === 0 && (
            <Card className="bg-white/60">
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Badges Yet
                </h3>
                <p className="text-gray-600">
                  Complete activities to earn your first badge!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="locked" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.map((badge, idx) => (
              <LockedBadgeCard key={badge.id} badge={badge} user={user} delay={idx * 0.05} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6 mt-6">
          {Object.entries(badgesByTier).reverse().map(([tier, badges]) => {
            const config = tierConfig[tier];
            const TierIcon = config.icon;

            return badges.length > 0 && (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center`}>
                    <TierIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold capitalize">
                    {tier} Tier ({badges.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((badge, idx) => (
                    <BadgeCard key={badge.id} badge={badge} delay={idx * 0.05} />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BadgeCard({ badge, compact = false, delay = 0 }) {
  const config = tierConfig[badge.badge_tier] || tierConfig.bronze;
  // TierIcon is not used in the render logic below, it's defined but not consumed
  // as the badge_icon is directly used. This is existing behavior.
  // const TierIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card className={`bg-gradient-to-br ${config.bgColor} border-2 ${config.borderColor} ${config.glow} shadow-lg hover:shadow-xl transition-all relative overflow-hidden`}>
        {badge.is_new && (
          <div className="absolute top-2 right-2 z-10">
            <BadgeUI className="bg-red-500 text-white text-xs">NEW</BadgeUI>
          </div>
        )}

        <CardContent className={compact ? 'p-3' : 'p-5'}>
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`${compact ? 'w-12 h-12 text-3xl' : 'w-20 h-20 text-5xl'} mx-auto mb-3 flex items-center justify-center bg-gradient-to-r ${config.color} rounded-full ${config.glow} shadow-lg`}
            >
              {badge.badge_icon && badge.badge_icon.startsWith('http') ? (
                <img src={badge.badge_icon} alt={badge.badge_title} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{badge.badge_icon}</span>
              )}
            </motion.div>

            <h4 className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-base'} mb-1`}>
              {badge.badge_title}
            </h4>

            {!compact && (
              <>
                <BadgeUI className={`bg-gradient-to-r ${config.color} text-white text-xs mb-2`}>
                  {badge.badge_tier.toUpperCase()}
                </BadgeUI>

                {badge.unlock_message && (
                  <p className="text-xs text-gray-600 mt-2 italic">
                    "{badge.unlock_message}"
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Earned {format(new Date(badge.earned_at), 'MMM d, yyyy')}
                </p>

                {badge.points_earned > 0 && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-purple-700">
                    <Sparkles className="w-3 h-3" />
                    <span>+{badge.points_earned} points</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
        />
      </Card>
    </motion.div>
  );
}

function LockedBadgeCard({ badge, user, delay = 0 }) {
  const config = tierConfig[badge.tier] || tierConfig.bronze;
  const stats = user?.gamification_stats || {};

  // Calculate progress toward unlocking
  let progress = 0;
  let progressText = '';

  if (badge.criteria) {
    const { type, threshold } = badge.criteria;
    let current = 0;

    switch (type) {
      case 'streak':
        current = stats.current_streak || 0;
        progressText = `${current}/${threshold} days`;
        break;
      case 'level':
        current = stats.level || 1;
        progressText = `Level ${current}/${threshold}`;
        break;
      case 'total_points':
        current = stats.total_points || 0;
        progressText = `${current.toLocaleString()}/${threshold.toLocaleString()} points`;
        break;
      case 'perfect_days':
        current = stats.perfect_days || 0;
        progressText = `${current}/${threshold} perfect days`;
        break;
      default:
        progressText = 'In progress...';
    }

    progress = threshold > 0 ? Math.min((current / threshold) * 100, 100) : 0;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card className="bg-gray-100/60 border-2 border-gray-300 shadow-lg relative">
        <CardContent className="p-5">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center bg-gray-300 rounded-full relative">
              <Lock className="w-8 h-8 text-gray-500" />

              {/* Peek at the badge icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl blur-sm">
                {badge.icon_emoji}
              </div>
            </div>

            <h4 className="font-bold text-gray-700 text-base mb-1">
              {badge.title}
            </h4>

            <BadgeUI variant="outline" className="text-xs mb-3">
              {badge.tier.toUpperCase()}
            </BadgeUI>

            <p className="text-xs text-gray-600 mb-3">
              {badge.description}
            </p>

            {progressText && (
              <div className="space-y-2">
                <div className="bg-white rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${config.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: delay + 0.2 }}
                  />
                </div>
                <p className="text-xs text-gray-600 font-medium">{progressText}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
