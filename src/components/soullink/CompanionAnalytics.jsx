
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  MessageCircle, Heart, TrendingUp, Calendar, Sparkles, Award, Activity, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const MOOD_COLORS = {
  great: '#10b981',
  good: '#3b82f6',
  okay: '#f59e0b',
  struggling: '#f97316',
  in_crisis: '#ef4444'
};

export default function CompanionAnalytics({ conversations, settings }) {
  const { data: moodHistory = [] } = useQuery({
    queryKey: ['soulLinkMoodHistory'],
    queryFn: () => base44.entities.SoulLinkMoodEntry.list('-created_date', 30)
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['soulLinkJournalEntries'],
    queryFn: () => base44.entities.SoulLinkJournalEntry.list('-created_date', 30)
  });

  // Calculate stats
  const stats = {
    totalConversations: conversations.length,
    totalJournalEntries: journalEntries.length,
    totalMoodEntries: moodHistory.length,
    streakDays: calculateStreak(conversations),
    averageDaily: calculateAverageDaily(conversations),
    mostActiveTime: getMostActiveTime(conversations),
    moodDistribution: getMoodDistribution(conversations),
    weeklyActivity: getWeeklyActivity(conversations),
    supportTypes: getSupportTypes(conversations),
    longestStreak: settings?.total_conversations || 0,
    moodTrend: getMoodTrend(moodHistory),
    journalThemes: getTopThemes(journalEntries)
  };

  function calculateStreak(convs) {
    if (convs.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dayStart = startOfDay(subDays(currentDate, i));
      const hasConversation = convs.some(c => {
        const convDate = startOfDay(new Date(c.created_date));
        return convDate.getTime() === dayStart.getTime();
      });

      if (hasConversation) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  function calculateAverageDaily(convs) {
    if (convs.length === 0) return 0;
    const days = Math.max(1, Math.ceil((Date.now() - new Date(convs[convs.length - 1].created_date).getTime()) / (1000 * 60 * 60 * 24)));
    return (convs.length / days).toFixed(1);
  }

  function getMostActiveTime(convs) {
    const hours = convs.map(c => new Date(c.created_date).getHours());
    const frequency = {};
    hours.forEach(h => frequency[h] = (frequency[h] || 0) + 1);
    const mostActive = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];
    if (!mostActive) return 'N/A';

    const hour = parseInt(mostActive[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  }

  function getMoodDistribution(convs) {
    const moods = convs.map(c => c.user_mood || 'okay');
    const distribution = {};
    moods.forEach(m => distribution[m] = (distribution[m] || 0) + 1);

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: MOOD_COLORS[name] || '#94a3b8'
    }));
  }

  function getWeeklyActivity(convs) {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayConvs = convs.filter(c => {
        const convDate = new Date(c.created_date);
        return convDate.toDateString() === date.toDateString();
      });

      last7Days.push({
        day: format(date, 'EEE'),
        conversations: dayConvs.length
      });
    }
    return last7Days;
  }

  function getSupportTypes(convs) {
    const types = convs.map(c => c.conversation_type || 'casual_chat');
    const distribution = {};
    types.forEach(t => distribution[t] = (distribution[t] || 0) + 1);

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }));
  }

  function getMoodTrend(moodHistory) {
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MM/dd');

      const entriesForDay = moodHistory.filter(entry => {
        const entryDate = startOfDay(new Date(entry.created_date));
        return entryDate.getTime() === startOfDay(date).getTime();
      });

      const avgMood = entriesForDay.length > 0
        ? entriesForDay.reduce((sum, e) => sum + e.mood_rating, 0) / entriesForDay.length
        : null;

      last7Days.push({
        date: dateStr,
        mood: avgMood
      });
    }

    return last7Days;
  }

  function getTopThemes(journalEntries) {
    const themeCounts = {};

    journalEntries.forEach(entry => {
      (entry.themes_detected || []).forEach(theme => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    return Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-900">{stats.totalConversations}</span>
              </div>
              <p className="text-sm text-purple-700 font-medium">Total Chats</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">{stats.totalJournalEntries}</span>
              </div>
              <p className="text-sm text-blue-700 font-medium">Journal Entries</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-green-900">{stats.totalMoodEntries}</span>
              </div>
              <p className="text-sm text-green-700 font-medium">Mood Check-ins</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-orange-900">{stats.streakDays}</span>
              </div>
              <p className="text-sm text-orange-700 font-medium">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mood Trend Chart */}
      {stats.moodTrend.length > 0 && stats.moodTrend.some(entry => entry.mood !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Mood Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.moodTrend}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                <YAxis domain={[0, 10]} stroke="#888" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Journal Themes */}
      {stats.journalThemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Your Journal Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.journalThemes.map((theme, idx) => (
                <Badge
                  key={idx}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1"
                >
                  {theme.theme} ({theme.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="conversations" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.moodDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.moodDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {stats.moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No mood data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Support Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Conversation Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.supportTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{type.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(type.value / stats.totalConversations) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {type.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-0">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Your Journey Insights
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            {stats.streakDays > 7 && (
              <p className="flex items-start gap-2">
                <span className="text-lg">🔥</span>
                <span>Amazing! You've been connecting consistently for {stats.streakDays} days. This kind of self-care builds real resilience.</span>
              </p>
            )}
            {stats.totalConversations > 50 && (
              <p className="flex items-start gap-2">
                <span className="text-lg">💜</span>
                <span>You've shared {stats.totalConversations} conversations with your companion. Every conversation is a step toward understanding yourself better.</span>
              </p>
            )}
            {stats.totalJournalEntries > 10 && (
              <p className="flex items-start gap-2">
                <span className="text-lg">✍️</span>
                <span>With {stats.totalJournalEntries} journal entries, you're building a rich history of your thoughts and feelings. Keep reflecting!</span>
              </p>
            )}
            {stats.totalMoodEntries > 10 && (
              <p className="flex items-start gap-2">
                <span className="text-lg">😊</span>
                <span>You've checked in with your mood {stats.totalMoodEntries} times. Tracking your emotions is a powerful way to understand your well-being.</span>
              </p>
            )}
            {conversations.length === 0 && (
              <p className="flex items-start gap-2">
                <span className="text-lg">✨</span>
                <span>Your journey is just beginning. Every conversation, every moment of reflection, is building toward something meaningful.</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
