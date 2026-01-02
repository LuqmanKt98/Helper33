import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Sparkles, Zap, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeeklyInsights({ insights }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  const iconMap = {
    exercise: Zap,
    sleep: Moon,
    mood: Sparkles,
    default: Lightbulb,
  };

  if (!insights || insights.length === 0) {
    return (
       <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Weekly Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-gray-600">
                Track your wellness for a few days to unlock personalized insights and trends about your well-being.
            </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Weekly Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.ul
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {insights.map((insight, index) => {
            const Icon = iconMap[insight.type] || iconMap.default;
            return (
              <motion.li
                key={index}
                className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-200"
                variants={itemVariants}
              >
                <Icon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <p className="text-sm text-amber-800">{insight.text}</p>
              </motion.li>
            );
          })}
        </motion.ul>
      </CardContent>
    </Card>
  );
}