import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Year2026Progress({ goals, checkIns }) {
  const totalDays = 366;
  const completedDays = checkIns.filter(c => c.is_checked_in).length;
  const overallProgress = (completedDays / totalDays) * 100;

  // Calculate monthly progress
  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const monthCheckIns = checkIns.filter(c => c.date?.startsWith(`2026-${monthStr}`));
    const daysInMonth = new Date(2026, month + 1, 0).getDate();
    
    return {
      month: new Date(2026, month).toLocaleDateString('en-US', { month: 'short' }),
      completed: monthCheckIns.filter(c => c.is_checked_in).length,
      total: daysInMonth,
      percentage: Math.round((monthCheckIns.filter(c => c.is_checked_in).length / daysInMonth) * 100)
    };
  });

  // Mood trend
  const moodData = checkIns.slice(0, 30).reverse().map(c => ({
    date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: c.mood_rating,
    energy: c.energy_level
  }));

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-purple-900 mb-2">
              {Math.round(overallProgress)}% Complete
            </h2>
            <p className="text-purple-700">{completedDays} out of {totalDays} days checked in</p>
          </div>
          <Progress value={overallProgress} className="h-4 mb-4" />
          <div className="flex justify-between text-sm text-purple-800">
            <span>Jan 1, 2026</span>
            <span>Dec 31, 2026</span>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <div className="grid md:grid-cols-2 gap-4">
        {goals.map((goal, idx) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">{goal.goal_title}</h4>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">{goal.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{goal.progress_percentage}%</div>
                  </div>
                </div>
                
                <Progress value={goal.progress_percentage} className="h-3 mb-4" />
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-purple-600">{goal.days_completed}</div>
                    <div className="text-xs text-gray-600">Days</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4" />
                      {goal.current_streak}
                    </div>
                    <div className="text-xs text-gray-600">Streak</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-green-600">{goal.longest_streak}</div>
                    <div className="text-xs text-gray-600">Best</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly Progress Chart */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Monthly Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Mood & Energy Trends */}
      {moodData.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Mood & Energy Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#f97316" strokeWidth={2} name="Energy" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}