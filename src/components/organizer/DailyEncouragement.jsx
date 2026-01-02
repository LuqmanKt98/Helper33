import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Trophy } from 'lucide-react';

const encouragementMessages = {
  morning: [
    "✨ Good morning! Each completed task is a gift to your future self.",
    "🌅 Starting fresh today. You've got this!",
    "💫 Morning wins set the tone. You're already succeeding!",
    "🌸 A new day, a new chance to shine. Welcome back!"
  ],
  afternoon: [
    "🌟 Look at you go! Midday momentum is real.",
    "💪 You're making progress. Keep that energy flowing!",
    "🎯 Afternoon achievements count double. You're crushing it!",
    "✨ Halfway through and still going strong!"
  ],
  evening: [
    "🌙 Wrapping up with grace. Well done today!",
    "⭐ Evening reflections: You did more than you think.",
    "💝 As the day closes, celebrate what you accomplished.",
    "🌆 You showed up. That's what matters most."
  ]
};

const categoryEmojis = {
  self_care: '💆‍♀️',
  family: '👨‍👩‍👧‍👦',
  work: '💼',
  health: '🏃‍♀️',
  grief_support: '🕊️',
  daily_living: '🏡',
  other: '✨'
};

export default function DailyEncouragement({ todayCompletions, familyMembers }) {
  if (!todayCompletions || todayCompletions.length === 0) return null;

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const timeOfDay = getTimeOfDay();
  const randomMessage = encouragementMessages[timeOfDay][
    Math.floor(Math.random() * encouragementMessages[timeOfDay].length)
  ];

  const completionsByCategory = todayCompletions.reduce((acc, completion) => {
    const category = completion.habit_category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(completionsByCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-0 shadow-md mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/80 rounded-full shadow-sm">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Daily Encouragement
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {randomMessage}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {todayCompletions.length} {todayCompletions.length === 1 ? 'task' : 'tasks'} completed
                  </span>
                </div>
                
                {topCategory && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-full">
                    <span className="text-lg">{categoryEmojis[topCategory[0]] || '✨'}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {topCategory[0].replace('_', ' ')} focus
                    </span>
                  </div>
                )}
              </div>

              {familyMembers && familyMembers.length > 0 && (
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>
                      Your family is cheering you on! Keep up the amazing work.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}