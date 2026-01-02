
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Trophy,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Calendar,
  Zap,
  Heart,
  Star,
  Settings,
  Crown,
  Flame,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', user?.email],
    queryFn: () => base44.entities.UserBadge.filter({}, '-earned_at'),
    enabled: !!user
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['userAchievements', user?.email],
    queryFn: () => base44.entities.UserAchievement.filter({}, '-earned_at'),
    enabled: !!user
  });

  const { data: courseEnrollments = [] } = useQuery({
    queryKey: ['courseEnrollments', user?.email],
    queryFn: () => base44.entities.CourseEnrollment.filter({ student_email: user.email }),
    enabled: !!user
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['userHabits', user?.email],
    queryFn: () => base44.entities.HabitTracker.list(),
    enabled: !!user
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['userJournalEntries', user?.email],
    queryFn: () => base44.entities.UserJournalEntry.list('-created_date', 100),
    enabled: !!user
  });

  const { data: mindfulSessions = [] } = useQuery({
    queryKey: ['mindfulSessions', user?.email],
    queryFn: () => base44.entities.MindfulSession.list('-completed_at', 50),
    enabled: !!user
  });

  const stats = {
    level: user?.gamification_stats?.level || 1,
    totalPoints: user?.gamification_stats?.total_points || 0,
    currentStreak: user?.gamification_stats?.current_streak || 0,
    longestStreak: user?.gamification_stats?.longest_streak || 0,
    perfectDays: user?.gamification_stats?.perfect_days || 0,
    totalAchievements: achievements.length + badges.length,
    coursesEnrolled: courseEnrollments.length,
    coursesCompleted: courseEnrollments.filter(c => c.is_completed).length,
    activeHabits: habits.filter(h => h.is_active).length,
    totalHabitCompletions: habits.reduce((sum, h) => sum + (h.total_completions || 0), 0),
    journalEntries: journalEntries.length,
    meditationMinutes: mindfulSessions.reduce((sum, s) => sum + (s.duration_seconds || 0) / 60, 0)
  };

  const getLevelTitle = (level) => {
    if (level >= 50) return '🌟 Enlightened Master';
    if (level >= 40) return '💎 Diamond Warrior';
    if (level >= 30) return '👑 Platinum Champion';
    if (level >= 20) return '🏆 Gold Achiever';
    if (level >= 10) return '🥈 Silver Explorer';
    if (level >= 5) return '🥉 Bronze Adventurer';
    return '🌱 Wellness Beginner';
  };

  const recentBadges = badges.slice(0, 6);
  const completedCourses = courseEnrollments.filter(c => c.is_completed);

  return (
    <>
      <SEO 
        title="My Profile - DobryLife"
        description="View your wellness journey progress, achievements, and personal stats"
        keywords="user profile, wellness progress, achievements, personal growth tracking"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-white shadow-lg flex items-center justify-center">
                        <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full px-3 py-1 shadow-lg border-2 border-white">
                      <span className="text-white font-bold text-sm">Lv {stats.level}</span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                      {user?.full_name || 'Wellness Warrior'}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {getLevelTitle(stats.level)}
                      </Badge>
                      {user?.role === 'admin' && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {stats.currentStreak > 0 && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          <Flame className="w-3 h-3 mr-1" />
                          {stats.currentStreak} Day Streak
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{user?.email}</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
                        <div className="text-xs text-gray-600">Total Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">{stats.totalAchievements}</div>
                        <div className="text-xs text-gray-600">Achievements</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.coursesCompleted}</div>
                        <div className="text-xs text-gray-600">Courses Done</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.perfectDays}</div>
                        <div className="text-xs text-gray-600">Perfect Days</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <Link to={createPageUrl('Account')}>
                      <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 bg-white/80">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Stats */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Wellness Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <div>
                          <div className="font-bold text-gray-800">Current Streak</div>
                          <div className="text-sm text-gray-600">{stats.currentStreak} consecutive days</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-500">{stats.currentStreak}</div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-purple-600" />
                        <div>
                          <div className="font-bold text-gray-800">Longest Streak</div>
                          <div className="text-sm text-gray-600">Personal best</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{stats.longestStreak}</div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <div className="font-bold text-gray-800">Perfect Days</div>
                          <div className="text-sm text-gray-600">All goals completed</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{stats.perfectDays}</div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-pink-600" />
                        <div>
                          <div className="font-bold text-gray-800">Active Habits</div>
                          <div className="text-sm text-gray-600">Building consistency</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-pink-600">{stats.activeHabits}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentBadges.length > 0 ? (
                      recentBadges.map(badge => (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
                        >
                          <div className="text-3xl">{badge.badge_icon}</div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 text-sm">{badge.badge_title}</div>
                            <Badge className="bg-amber-100 text-amber-800 text-xs mt-1">
                              {badge.badge_tier}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {new Date(badge.earned_at).toLocaleDateString()}
                            </div>
                            {badge.points_earned && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                +{badge.points_earned} pts
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">Complete activities to earn achievements!</p>
                      </div>
                    )}
                    
                    {badges.length > 6 && (
                      <Button 
                        onClick={() => setActiveTab('achievements')}
                        variant="outline" 
                        className="w-full"
                      >
                        View All {badges.length} Achievements
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Learning Progress */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Learning Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-3xl font-bold text-indigo-600">{stats.coursesEnrolled}</div>
                      <div className="text-sm text-gray-600 mt-1">Courses Enrolled</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{stats.coursesCompleted}</div>
                      <div className="text-sm text-gray-600 mt-1">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{stats.journalEntries}</div>
                      <div className="text-sm text-gray-600 mt-1">Journal Entries</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{Math.round(stats.meditationMinutes)}</div>
                      <div className="text-sm text-gray-600 mt-1">Mindful Minutes</div>
                    </div>
                  </div>

                  {completedCourses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Completed Courses</h4>
                      {completedCourses.slice(0, 3).map(enrollment => (
                        <div key={enrollment.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate">
                              {enrollment.course_title}
                            </div>
                            <div className="text-xs text-gray-600">
                              Completed {new Date(enrollment.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                          {enrollment.certificate_issued && (
                            <Badge className="bg-amber-100 text-amber-800">
                              <Award className="w-3 h-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all border-2 border-purple-200">
                        <CardContent className="p-6 text-center">
                          <div className="text-5xl mb-3">{badge.badge_icon}</div>
                          <h3 className="font-bold text-gray-800 mb-1">{badge.badge_title}</h3>
                          <Badge className={`mb-3 ${
                            badge.badge_tier === 'diamond' ? 'bg-cyan-100 text-cyan-800' :
                            badge.badge_tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                            badge.badge_tier === 'gold' ? 'bg-amber-100 text-amber-800' :
                            badge.badge_tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {badge.badge_tier}
                          </Badge>
                          <div className="text-xs text-gray-600 mb-2">
                            Earned {new Date(badge.earned_at).toLocaleDateString()}
                          </div>
                          {badge.unlock_message && (
                            <p className="text-xs text-purple-700 italic mt-2 p-2 bg-purple-50 rounded">
                              "{badge.unlock_message}"
                            </p>
                          )}
                          {badge.points_earned > 0 && (
                            <div className="mt-3 flex items-center justify-center gap-1">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <span className="font-bold text-amber-600">+{badge.points_earned} points</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Start Your Journey!</h3>
                    <p className="text-gray-600">Complete activities to earn your first achievement</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courseEnrollments.length > 0 ? (
                  courseEnrollments.map(enrollment => (
                    <Card key={enrollment.id} className="bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-2">{enrollment.course_title}</h3>
                            <Badge className={
                              enrollment.is_completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }>
                              {enrollment.is_completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                          {enrollment.certificate_issued && (
                            <Award className="w-8 h-8 text-amber-500" />
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-bold text-gray-800">
                                {enrollment.progress?.completion_percentage || 0}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                style={{ width: `${enrollment.progress?.completion_percentage || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-3 h-3" />
                              Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                            </div>
                            {enrollment.progress?.last_accessed_date && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Last accessed: {new Date(enrollment.progress.last_accessed_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {!enrollment.is_completed && (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                              Continue Learning
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Courses Yet</h3>
                    <p className="text-gray-600 mb-4">Explore the marketplace to start learning!</p>
                    <Link to={createPageUrl('Marketplace')}>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="w-5 h-5 text-green-600" />
                      Habits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-600">{stats.totalHabitCompletions}</div>
                      <div className="text-sm text-gray-600">Total Completions</div>
                    </div>
                    {habits.slice(0, 3).map(habit => (
                      <div key={habit.id} className="flex items-center justify-between p-2 bg-green-50 rounded mb-2">
                        <span className="text-sm text-gray-800 truncate flex-1">{habit.habit_name}</span>
                        <Badge variant="outline" className="text-xs">
                          <Flame className="w-3 h-3 mr-1 text-orange-500" />
                          {habit.current_streak}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      Journaling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-purple-600">{stats.journalEntries}</div>
                      <div className="text-sm text-gray-600">Total Entries</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm text-gray-700">This Week</span>
                        <span className="font-bold text-purple-600">
                          {journalEntries.filter(j => 
                            new Date(j.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          ).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm text-gray-700">This Month</span>
                        <span className="font-bold text-purple-600">
                          {journalEntries.filter(j => 
                            new Date(j.created_date).getMonth() === new Date().getMonth()
                          ).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Star className="w-5 h-5 text-blue-600" />
                      Mindfulness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-blue-600">{Math.round(stats.meditationMinutes)}</div>
                      <div className="text-sm text-gray-600">Total Minutes</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm text-gray-700">Sessions</span>
                        <span className="font-bold text-blue-600">{mindfulSessions.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm text-gray-700">Avg Session</span>
                        <span className="font-bold text-blue-600">
                          {mindfulSessions.length > 0 
                            ? Math.round(stats.meditationMinutes / mindfulSessions.length)
                            : 0
                          } min
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
