import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Trophy,
  Flame,
  Star,
  Award,
  Calendar,
  Zap,
  Heart,
  Brain,
  Sparkles,
  Crown,
  CheckCircle,
  Lock,
  Unlock,
  BarChart3,
  Share2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import SocialShareModal from '@/components/social/SocialShareModal';

export default function ProgressDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: () => base44.entities.Achievement.filter({ is_active: true })
  });

  const { data: earnedAchievements = [] } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: () => base44.entities.UserAchievement.list('-earned_at')
  });

  const { data: dailyCheckIns = [] } = useQuery({
    queryKey: ['daily-check-ins'],
    queryFn: async () => {
      const last30Days = [];
      for (let i = 0; i < 30; i++) {
        const date = subDays(new Date(), i);
        last30Days.push(format(date, 'yyyy-MM-dd'));
      }
      return base44.entities.DailyCheckIn.filter({
        check_in_date: { $in: last30Days }
      }, '-check_in_date');
    }
  });

  const markAchievementAsSeenMutation = useMutation({
    mutationFn: (achievementId) => base44.entities.UserAchievement.update(achievementId, { is_new: false }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-achievements']);
    }
  });

  const stats = user?.gamification_stats || {
    total_points: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    perfect_days: 0,
    events_attended: 0,
    events_rsvp_count: 0,
    event_chat_messages: 0
  };
  const level = stats.level || 1;
  const xpCurrent = stats.xp_current || 0;
  const xpToNext = stats.xp_to_next_level || 100;
  const xpProgress = Math.round((xpCurrent / xpToNext) * 100);

  const newAchievements = earnedAchievements.filter(a => a.is_new);
  const earnedKeys = earnedAchievements.map(a => a.achievement_key);
  const lockedAchievements = allAchievements.filter(a => !earnedKeys.includes(a.key));

  // Calculate weekly stats
  const last7Days = dailyCheckIns.slice(0, 7);
  const weeklyCompletion = last7Days.length > 0
    ? last7Days.reduce((sum, day) => sum + (day.completion_percentage || 0), 0) / last7Days.length
    : 0;
  const weeklyPoints = last7Days.reduce((sum, day) => sum + (day.points_earned || 0), 0);

  // Calculate activity breakdown
  const activityBreakdown = {
    mood_checks: last7Days.filter(d => d.mood_logged).length,
    journals: last7Days.filter(d => d.journal_written).length,
    wellness: last7Days.filter(d => d.wellness_tracked).length,
    mindfulness: last7Days.filter(d => d.mindfulness_practiced).length
  };

  const handleShareAchievement = (achievement) => {
    setShareData({
      type: 'achievement',
      icon: achievement.icon,
      title: achievement.title,
      points: achievement.points
    });
    setShareModalOpen(true);
  };

  const handleShareMilestone = (milestoneType) => {
    const milestoneData = {
      streak: {
        type: 'milestone',
        title: `${stats.current_streak || 0}-Day Streak`,
        days: stats.current_streak || 0,
        icon: '🔥'
      },
      level: {
        type: 'level_up',
        title: `Level ${level} Achieved`,
        level: level,
        totalPoints: stats.total_points || 0,
        icon: '👑'
      },
      perfect_days: {
        type: 'milestone',
        title: `${stats.perfect_days || 0} Perfect Days`,
        days: stats.perfect_days || 0,
        icon: '⭐'
      }
    };

    setShareData(milestoneData[milestoneType]);
    setShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block mb-4"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Wellness Journey
          </h1>
          <p className="text-gray-600">Track progress, earn rewards, build healthy habits</p>
        </motion.div>

        {/* New Achievements Alert */}
        <AnimatePresence>
          {newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white border-0 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Trophy className="w-10 h-10" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">🎉 New Achievements Unlocked!</h3>
                      <div className="space-y-2">
                        {newAchievements.map((ach) => (
                          <div key={ach.id} className="flex items-center gap-2 bg-white/20 rounded-lg p-3">
                            <span className="text-3xl">{ach.achievement_icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold">{ach.achievement_title}</p>
                              <p className="text-sm text-white/90">+{ach.points_earned} points</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => {
                          newAchievements.forEach(ach => markAchievementAsSeenMutation.mutate(ach.id));
                        }}
                        variant="secondary"
                        className="mt-4"
                      >
                        Awesome! Got it
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level & XP Card with Share Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-2xl overflow-hidden relative">
            {/* Sparkle Background Effect */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                </div>
                <Button
                  onClick={() => handleShareMilestone('level')}
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
                  >
                    <Crown className="w-10 h-10 text-yellow-300" />
                  </motion.div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">Level</p>
                    <p className="text-5xl font-bold">{level}</p>
                    <p className="text-xs text-white/70 mt-1">Wellness Warrior</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm font-medium">Total Points</p>
                  <p className="text-4xl font-bold">{stats.total_points || 0}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <p className="text-xs text-white/70">Lifetime earned</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/90 font-medium">XP Progress to Level {level + 1}</span>
                  <span className="text-white font-bold">{xpCurrent} / {xpToNext}</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-white/70 text-center font-medium">
                  {xpToNext - xpCurrent} XP needed • Complete daily activities to level up faster!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div onClick={() => handleShareMilestone('streak')} className="cursor-pointer">
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${stats.current_streak || 0}`}
              suffix="days"
              color="orange"
              delay={0.2}
              showShare={true}
            />
          </div>
          <StatCard
            icon={Star}
            label="Longest Streak"
            value={`${stats.longest_streak || 0}`}
            suffix="days"
            color="yellow"
            delay={0.25}
          />
          <StatCard
            icon={Award}
            label="Achievements"
            value={`${earnedAchievements.length}`}
            suffix={`of ${allAchievements.length}`}
            color="purple"
            delay={0.3}
          />
          <div onClick={() => handleShareMilestone('perfect_days')} className="cursor-pointer">
            <StatCard
              icon={CheckCircle}
              label="Perfect Days"
              value={`${stats.perfect_days || 0}`}
              suffix="days"
              color="green"
              delay={0.35}
              showShare={true}
            />
          </div>
        </div>

        {/* Event Participation Stats */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Community Events
            </CardTitle>
            <CardDescription className="text-purple-100">
              Your event participation journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{stats.events_rsvp_count || 0}</div>
                <div className="text-sm text-purple-100">Events RSVP'd</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{stats.events_attended || 0}</div>
                <div className="text-sm text-purple-100">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{stats.event_chat_messages || 0}</div>
                <div className="text-sm text-purple-100">Chat Messages</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <Link to={createPageUrl('Events')}>
                <Button variant="secondary" className="w-full">
                  Explore More Events
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardHeader>
            <div className="flex gap-2 flex-wrap">
              {['overview', 'achievements', 'streaks', 'activity'].map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  variant={selectedTab === tab ? 'default' : 'outline'}
                  className={selectedTab === tab ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {selectedTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Weekly Summary */}
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        This Week's Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-700 font-medium">Weekly Completion</span>
                            <span className="font-bold text-blue-600">{Math.round(weeklyCompletion)}%</span>
                          </div>
                          <Progress value={weeklyCompletion} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{weeklyPoints}</p>
                            <p className="text-xs text-gray-600">Points This Week</p>
                          </div>
                          <div className="text-center p-3 bg-white/60 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                              {last7Days.filter(d => d.completion_percentage === 100).length}
                            </p>
                            <p className="text-xs text-gray-600">Perfect Days</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <ActivityStat
                            icon={Heart}
                            label="Mood Checks"
                            value={`${activityBreakdown.mood_checks}/7`}
                            color="pink"
                          />
                          <ActivityStat
                            icon={Brain}
                            label="Journals"
                            value={`${activityBreakdown.journals}/7`}
                            color="purple"
                          />
                          <ActivityStat
                            icon={Zap}
                            label="Wellness"
                            value={`${activityBreakdown.wellness}/7`}
                            color="blue"
                          />
                          <ActivityStat
                            icon={Sparkles}
                            label="Mindfulness"
                            value={`${activityBreakdown.mindfulness}/7`}
                            color="indigo"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 30-Day Activity Heatmap */}
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        30-Day Activity History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-10 gap-1.5">
                        {Array.from({ length: 30 }).map((_, i) => {
                          const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
                          const dayCheckIn = dailyCheckIns.find(c => c.check_in_date === date);
                          const completion = dayCheckIn?.completion_percentage || 0;

                          return (
                            <div
                              key={i}
                              className={`aspect-square rounded flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-pointer ${
                                completion === 100 ? 'bg-green-500 text-white shadow-md' :
                                completion >= 75 ? 'bg-green-400 text-white' :
                                completion >= 50 ? 'bg-yellow-400 text-gray-800' :
                                completion >= 25 ? 'bg-orange-300 text-gray-800' :
                                'bg-gray-200 text-gray-500'
                              }`}
                              title={`${date}: ${completion}% complete`}
                            >
                              {completion > 0 ? completion : ''}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded bg-green-500" />
                          <span>Perfect (100%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded bg-yellow-400" />
                          <span>Good (50-74%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded bg-gray-200" />
                          <span>Missed</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {selectedTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Earned Achievements */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Unlock className="w-5 h-5 text-green-600" />
                      Unlocked ({earnedAchievements.length})
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {earnedAchievements.map((ach, idx) => (
                        <AchievementCard
                          key={ach.id}
                          achievement={{
                            icon: ach.achievement_icon,
                            title: ach.achievement_title,
                            points: ach.points_earned,
                            earnedAt: ach.earned_at,
                            isNew: ach.is_new
                          }}
                          isEarned={true}
                          delay={idx * 0.05}
                          onShare={() => handleShareAchievement({
                            icon: ach.achievement_icon,
                            title: ach.achievement_title,
                            points: ach.points_earned
                          })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Locked Achievements */}
                  {lockedAchievements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-gray-400" />
                        Locked ({lockedAchievements.length})
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {lockedAchievements.map((ach, idx) => (
                          <LockedAchievementCard
                            key={ach.id}
                            achievement={{
                              icon: ach.icon_emoji,
                              title: ach.title,
                              description: ach.description,
                              points: ach.points_reward,
                              tier: ach.tier
                            }}
                            isEarned={false}
                            delay={idx * 0.05}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'streaks' && (
                <motion.div
                  key="streaks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <StreakCard
                      icon={Heart}
                      label="Wellness Streak"
                      current={stats.wellness_streak || 0}
                      longest={stats.longest_streak || 0}
                      color="rose"
                    />
                    <StreakCard
                      icon={Brain}
                      label="Journal Streak"
                      current={stats.journal_streak || 0}
                      longest={stats.longest_streak || 0}
                      color="purple"
                    />
                    <StreakCard
                      icon={Zap}
                      label="Mood Check-in Streak"
                      current={stats.mood_streak || 0}
                      longest={stats.longest_streak || 0}
                      color="blue"
                    />
                    <StreakCard
                      icon={Sparkles}
                      label="Mindfulness Streak"
                      current={stats.mindfulness_streak || 0}
                      longest={stats.longest_streak || 0}
                      color="indigo"
                    />
                  </div>

                  {/* Streak Milestones */}
                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Flame className="w-5 h-5 text-orange-600" />
                        Streak Milestones & Bonuses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <MilestoneItem days={3} points={25} reached={(stats.current_streak || 0) >= 3} />
                        <MilestoneItem days={7} points={75} reached={(stats.current_streak || 0) >= 7} />
                        <MilestoneItem days={14} points={150} reached={(stats.current_streak || 0) >= 14} />
                        <MilestoneItem days={30} points={300} reached={(stats.current_streak || 0) >= 30} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {selectedTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Recent Activity */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Last 7 Days Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {last7Days.length > 0 ? (
                          last7Days.map((day, idx) => (
                            <DayActivityRow key={day.id} day={day} index={idx} />
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">No activity logged yet. Start your journey today! 🌟</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Points Breakdown */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        How to Earn Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <PointsInfo activity="Mood Check-in" points={10} icon="💭" />
                      <PointsInfo activity="Journal Entry" points={15} icon="📝" />
                      <PointsInfo activity="Wellness Log" points={15} icon="💚" />
                      <PointsInfo activity="Health Sync" points={10} icon="📊" />
                      <PointsInfo activity="Mindfulness Session" points={20} icon="🧘" />
                      <PointsInfo activity="Task Completed" points={5} icon="✅" />
                      <PointsInfo activity="Habit Completed" points={10} icon="🔄" />
                      <div className="pt-3 border-t border-purple-200 mt-3">
                        <PointsInfo activity="Perfect Day Bonus" points={50} icon="⭐" special />
                        <PointsInfo activity="First Activity of the Day" points={20} icon="🌅" special />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareType={shareData?.type}
        shareData={shareData}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color, delay, showShare }) {
  const colorClasses = {
    orange: { bg: 'from-orange-500 to-red-500', text: 'text-orange-600', border: 'border-orange-200' },
    yellow: { bg: 'from-yellow-400 to-orange-400', text: 'text-yellow-600', border: 'border-yellow-200' },
    purple: { bg: 'from-purple-500 to-pink-500', text: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'from-green-500 to-emerald-500', text: 'text-green-600', border: 'border-green-200' },
    blue: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600', border: 'border-blue-200' }
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={showShare ? { scale: 1.05 } : {}}
    >
      <Card className={`bg-white/80 backdrop-blur-sm border-2 ${classes.border} hover:shadow-xl transition-all ${showShare ? 'cursor-pointer' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${classes.bg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium">{label}</p>
              <div className="flex items-baseline gap-1">
                <p className={`text-3xl font-bold ${classes.text}`}>{value}</p>
                {suffix && <p className="text-sm text-gray-500">{suffix}</p>}
              </div>
            </div>
            {showShare && (
              <Share2 className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StreakCard({ icon: Icon, label, current, longest, color }) {
  const colorClasses = {
    rose: { bg: 'from-rose-500 to-pink-500', border: 'border-rose-200', text: 'text-rose-600' },
    purple: { bg: 'from-purple-500 to-violet-500', border: 'border-purple-200', text: 'text-purple-600' },
    blue: { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-200', text: 'text-blue-600' },
    indigo: { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-200', text: 'text-indigo-600' }
  };

  const classes = colorClasses[color];

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-2 ${classes.border} hover:shadow-lg transition-all`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${classes.text}`} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-600">Keep the momentum!</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <p className={`text-4xl font-bold ${classes.text}`}>{current}</p>
            <p className="text-xs text-gray-600 mt-1">Current</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            <p className="text-4xl font-bold text-gray-400">{longest}</p>
            <p className="text-xs text-gray-600 mt-1">Best</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ achievement, isEarned, delay, onShare }) {
  const tierColors = {
    bronze: 'from-orange-700 to-orange-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-blue-600',
    diamond: 'from-purple-400 to-pink-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card className={`${isEarned ? 'bg-white border-2 border-green-300' : 'bg-gray-50 border-2 border-gray-300'} relative overflow-hidden`}>
        {achievement.isNew && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-red-500 animate-pulse">NEW!</Badge>
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-16 h-16 rounded-full ${isEarned ? `bg-gradient-to-br ${tierColors[achievement.tier] || tierColors.bronze}` : 'bg-gray-300'} flex items-center justify-center text-3xl shadow-lg`}>
              {isEarned ? achievement.icon : '🔒'}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.title}
              </h4>
              <p className={`text-sm ${isEarned ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
                {achievement.description || 'Hidden until unlocked'}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Badge className={isEarned ? 'bg-green-500' : 'bg-gray-400'}>
                  {achievement.points} Points
                </Badge>
                {achievement.tier && (
                  <Badge variant="outline" className="text-xs">
                    {achievement.tier.toUpperCase()}
                  </Badge>
                )}
              </div>

              {achievement.earnedAt && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Earned {format(new Date(achievement.earnedAt), 'MMM d, yyyy')}
                  </p>
                  {isEarned && onShare && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare();
                      }}
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-purple-600 hover:text-purple-700"
                    >
                      <Share2 className="w-3 h-3" />
                      Share
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LockedAchievementCard({ achievement, delay }) {
  const tierColors = {
    bronze: 'from-orange-700 to-orange-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-blue-600',
    diamond: 'from-purple-400 to-pink-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Card className="bg-gray-100/60 border-2 border-gray-300 shadow-lg relative">
        <CardContent className="p-5">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center bg-gray-300 rounded-full relative">
              <Lock className="w-8 h-8 text-gray-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-20 text-4xl blur-sm">
                {achievement.icon}
              </div>
            </div>

            <h4 className="font-bold text-gray-700 text-base mb-1">
              {achievement.title}
            </h4>

            <Badge variant="outline" className="text-xs mb-3">
              {achievement.tier?.toUpperCase() || 'BRONZE'}
            </Badge>

            <p className="text-xs text-gray-600 mb-3">
              {achievement.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActivityStat({ icon: Icon, label, value, color }) {
  const colorClasses = {
    pink: 'text-pink-600',
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
      <span className="text-gray-700 flex-1">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function DayActivityRow({ day, index }) {
  const dayName = format(new Date(day.check_in_date), 'EEE, MMM d');
  const isToday = day.check_in_date === new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center justify-between p-3 rounded-lg ${
        isToday ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-50'
      }`}
    >
      <div className="flex-1">
        <p className={`font-semibold ${isToday ? 'text-purple-900' : 'text-gray-800'}`}>
          {dayName} {isToday && '(Today)'}
        </p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {day.mood_logged && <Badge variant="outline" className="text-xs">💭 Mood</Badge>}
          {day.journal_written && <Badge variant="outline" className="text-xs">📝 Journal</Badge>}
          {day.wellness_tracked && <Badge variant="outline" className="text-xs">💚 Wellness</Badge>}
          {day.mindfulness_practiced && <Badge variant="outline" className="text-xs">🧘 Mindful</Badge>}
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-purple-600">{day.points_earned || 0}</p>
        <p className="text-xs text-gray-600">points</p>
      </div>
    </motion.div>
  );
}

function PointsInfo({ activity, points, icon, special }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded ${special ? 'bg-yellow-100' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className={`text-sm ${special ? 'font-semibold text-yellow-900' : 'text-gray-700'}`}>
          {activity}
        </span>
      </div>
      <Badge className={special ? 'bg-yellow-500' : 'bg-purple-500'}>
        +{points}
      </Badge>
    </div>
  );
}

function MilestoneItem({ days, points, reached }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      reached ? 'bg-green-100 border-2 border-green-300' : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        {reached ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        )}
        <div>
          <p className={`font-semibold ${reached ? 'text-green-900' : 'text-gray-700'}`}>
            {days} Day Streak
          </p>
          <p className="text-xs text-gray-600">Bonus: +{points} points</p>
        </div>
      </div>
      {reached && <Badge className="bg-green-500">Unlocked!</Badge>}
    </div>
  );
}