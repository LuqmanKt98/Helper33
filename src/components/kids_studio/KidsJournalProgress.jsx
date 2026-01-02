import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Heart, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const moodEmojis = {
  happy: '😊',
  excited: '🤩',
  calm: '😌',
  okay: '😐',
  sad: '😢',
  angry: '😠',
  worried: '😰',
  silly: '🤪',
};

const moodColors = {
  happy: '#FCD34D',
  excited: '#F59E0B',
  calm: '#60A5FA',
  okay: '#9CA3AF',
  sad: '#93C5FD',
  angry: '#EF4444',
  worried: '#A78BFA',
  silly: '#F472B6',
};

export default function KidsJournalProgress({ childMemberId }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moodStats, setMoodStats] = useState({});

  useEffect(() => {
    loadEntries();
  }, [childMemberId]);

  const loadEntries = async () => {
    try {
      const filters = childMemberId ? { child_member_id: childMemberId } : {};
      const journalEntries = await base44.entities.KidsJournalEntry.filter(filters, '-entry_date', 30);
      setEntries(journalEntries);

      // Calculate mood statistics
      const stats = {};
      journalEntries.forEach(entry => {
        stats[entry.mood] = (stats[entry.mood] || 0) + 1;
      });
      setMoodStats(stats);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data (last 7 days)
  const getChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = entries.filter(e => e.entry_date === dateStr);
      const moodCount = dayEntries.length;
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        entries: moodCount
      });
    }
    return last7Days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            📊
          </motion.div>
          <p className="text-gray-600">Loading journal progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Privacy Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Lock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-blue-900 mb-2">🔒 Privacy Protected</h3>
              <p className="text-gray-700">
                You can see your child's mood patterns to check on their wellbeing, but their journal entries are private and safe. 
                This helps kids feel comfortable sharing their feelings! 💙
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{entries.length}</div>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Most Common Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(moodStats).length > 0 ? (
              <>
                <div className="text-5xl mb-2">
                  {moodEmojis[Object.keys(moodStats).reduce((a, b) => moodStats[a] > moodStats[b] ? a : b)]}
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {Object.keys(moodStats).reduce((a, b) => moodStats[a] > moodStats[b] ? a : b)}
                </p>
              </>
            ) : (
              <p className="text-gray-400">No entries yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {entries.filter(e => {
                const entryDate = new Date(e.entry_date);
                const daysDiff = Math.floor((new Date() - entryDate) / (1000 * 60 * 60 * 24));
                return daysDiff <= 7;
              }).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">Past 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Journal Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="entries" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mood Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Overview (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(moodStats).map(([mood, count]) => (
              <motion.div
                key={mood}
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl text-center border-2"
                style={{ borderColor: moodColors[mood], backgroundColor: `${moodColors[mood]}20` }}
              >
                <div className="text-5xl mb-2">{moodEmojis[mood]}</div>
                <p className="font-semibold capitalize text-gray-700">{mood}</p>
                <Badge className="mt-2" style={{ backgroundColor: moodColors[mood] }}>
                  {count} {count === 1 ? 'entry' : 'entries'}
                </Badge>
              </motion.div>
            ))}
          </div>
          {Object.keys(moodStats).length === 0 && (
            <p className="text-center text-gray-400 py-8">No journal entries yet. Encourage your child to start sharing their feelings! 💜</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Entries Timeline (moods only) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mood Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.slice(0, 10).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition-colors"
              >
                <div className="text-4xl">{entry.mood_emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {new Date(entry.entry_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">Mood: {entry.mood}</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              </motion.div>
            ))}
            {entries.length === 0 && (
              <p className="text-center text-gray-400 py-8">No journal entries yet. 📝</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}