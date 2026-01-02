import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CycleInsights({ cycles, symptoms, cycleInfo }) {
  // Calculate average cycle length
  const completedCycles = cycles.filter(c => c.cycle_length_days);
  const avgCycleLength = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((sum, c) => sum + c.cycle_length_days, 0) / completedCycles.length)
    : 28;

  // Calculate average period length
  const avgPeriodLength = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((sum, c) => sum + (c.period_length_days || 5), 0) / completedCycles.length)
    : 5;

  // Analyze mood patterns
  const moodPatterns = symptoms.reduce((acc, s) => {
    if (s.cycle_day && s.mood && s.mood.length > 0) {
      const phase = s.cycle_day <= 5 ? 'menstrual' :
                    s.cycle_day <= 13 ? 'follicular' :
                    s.cycle_day <= 17 ? 'ovulation' : 'luteal';
      
      if (!acc[phase]) acc[phase] = { moods: [], count: 0 };
      acc[phase].moods.push(...s.mood);
      acc[phase].count++;
    }
    return acc;
  }, {});

  const insights = [];

  // Cycle regularity insight
  if (completedCycles.length >= 3) {
    const cycleLengths = completedCycles.map(c => c.cycle_length_days);
    const variance = Math.max(...cycleLengths) - Math.min(...cycleLengths);
    
    if (variance <= 3) {
      insights.push({
        type: 'positive',
        text: `Your cycles are very regular! Average length: ${avgCycleLength} days.`
      });
    } else if (variance <= 7) {
      insights.push({
        type: 'info',
        text: `Your cycle varies by about ${variance} days. This is normal for most women.`
      });
    }
  }

  // Mood pattern insights
  Object.entries(moodPatterns).forEach(([phase, data]) => {
    const commonMoods = [...new Set(data.moods)];
    if (commonMoods.includes('irritable') && phase === 'luteal') {
      insights.push({
        type: 'info',
        text: 'You tend to feel more irritable during your luteal phase. Self-care is extra important now!'
      });
    }
    if (commonMoods.includes('energized') && phase === 'follicular') {
      insights.push({
        type: 'positive',
        text: 'Your follicular phase gives you great energy! Perfect time for challenging projects.'
      });
    }
  });

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Your Cycle Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Avg Cycle Length</span>
            <Badge className="bg-pink-500 text-white text-lg">{avgCycleLength} days</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Avg Period Length</span>
            <Badge className="bg-purple-500 text-white text-lg">{avgPeriodLength} days</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Cycles Tracked</span>
            <Badge className="bg-blue-500 text-white text-lg">{cycles.length}</Badge>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 ? (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Personalized Insights</h3>
            </div>
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg ${
                  insight.type === 'positive' ? 'bg-green-50 border-l-4 border-green-500' :
                  'bg-blue-50 border-l-4 border-blue-500'
                }`}
              >
                <p className="text-sm text-gray-800">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Track for a few cycles to unlock personalized insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}