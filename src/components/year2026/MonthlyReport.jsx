import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Calendar, Award, Heart, Zap, Sparkles, Loader2, Target, CheckCircle, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonthlyReport({ month, goals, checkIns, user }) {
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const monthCheckIns = checkIns.filter(c => {
    const date = new Date(c.date);
    return date.getMonth() === month - 1 && date.getFullYear() === 2026;
  });

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive monthly report for Month ${month} of 2026.

USER PERSONALITY: ${user?.year_2026_personality || 'achiever'}

GOALS THIS MONTH:
${JSON.stringify(goals.map(g => ({
  title: g.goal_title,
  progress: g.progress_percentage,
  streak: g.current_streak,
  monthly_mission: g.monthly_missions?.find(m => m.month === month)
})))}

CHECK-INS DATA:
- Total days checked in: ${monthCheckIns.filter(c => c.is_checked_in).length}
- Average mood: ${(monthCheckIns.reduce((sum, c) => sum + (c.mood_rating || 0), 0) / monthCheckIns.length || 0).toFixed(1)}
- Average energy: ${(monthCheckIns.reduce((sum, c) => sum + (c.energy_level || 0), 0) / monthCheckIns.length || 0).toFixed(1)}

Provide:
1. Overall month summary
2. Top 3 wins
3. Areas for improvement
4. Mood/energy insights
5. Goal progress highlights
6. Recommendations for next month
7. Celebration moments
8. Motivational message for continuing

Be encouraging, specific, and science-backed.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            top_wins: { type: "array", items: { type: "string" } },
            improvements_needed: { type: "array", items: { type: "string" } },
            insights: { type: "string" },
            goal_highlights: { type: "array", items: { type: "string" } },
            next_month_focus: { type: "string" },
            celebration_moments: { type: "array", items: { type: "string" } },
            motivational_close: { type: "string" }
          }
        }
      });

      setReport(response);
      toast.success('Report generated! 📊');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(2026, month, 0).getDate();
  const completionRate = (monthCheckIns.filter(c => c.is_checked_in).length / daysInMonth) * 100;

  const moodData = monthCheckIns.map(c => ({
    day: new Date(c.date).getDate(),
    mood: c.mood_rating,
    energy: c.energy_level
  }));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle className="text-2xl">{monthNames[month - 1]} 2026 Report</CardTitle>
                <p className="text-sm text-purple-700">Your monthly transformation summary</p>
              </div>
            </div>
            <Button
              onClick={generateReport}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Completion', value: `${Math.round(completionRate)}%`, icon: Target, color: 'purple' },
          { label: 'Days Active', value: monthCheckIns.filter(c => c.is_checked_in).length, icon: CheckCircle, color: 'green' },
          { label: 'Avg Mood', value: (monthCheckIns.reduce((s, c) => s + (c.mood_rating || 0), 0) / monthCheckIns.length || 0).toFixed(1), icon: Heart, color: 'pink' },
          { label: 'XP Earned', value: monthCheckIns.reduce((s, c) => s + (c.xp_earned_today || 0), 0), icon: Zap, color: 'orange' }
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

      {/* Mood Chart */}
      {moodData.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Mood & Energy Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#f97316" strokeWidth={2} name="Energy" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* AI Report */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="p-6">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Wins This Month
              </h4>
              <ul className="space-y-2">
                {report.top_wins?.map((win, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-green-800 flex items-start gap-2"
                  >
                    <Star className="w-4 h-4 mt-1 flex-shrink-0 text-yellow-500" />
                    {win}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
            <CardContent className="p-6">
              <h4 className="font-bold text-purple-900 mb-3">AI Insights & Recommendations</h4>
              <p className="text-purple-800 mb-4">{report.insights}</p>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="font-semibold text-purple-900 mb-2">Focus for Next Month:</p>
                <p className="text-purple-800">{report.next_month_focus}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-300">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-pink-600 mx-auto mb-3" />
              <p className="text-lg text-pink-900 italic leading-relaxed">
                "{report.motivational_close}"
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}