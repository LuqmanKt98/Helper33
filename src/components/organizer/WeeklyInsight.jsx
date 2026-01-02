import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, Target, Sparkles, Brain, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const insights = [
  {
    title: "Small, Steady Steps Create Lasting Change",
    statistic: "40% more likely",
    statisticDetail: "to keep a habit when you track it daily and link it to a positive identity",
    tip: "Instead of \"I want to exercise,\" try \"I'm someone who moves with energy.\"",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    emoji: "💡"
  },
  {
    title: "The Power of Tiny Changes",
    statistic: "1% better daily",
    statisticDetail: "equals 37x improvement over a year",
    tip: "Start so small you can't say no. Want to read more? Begin with just one page per day.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-600",
    emoji: "✨"
  },
  {
    title: "Consistency Beats Perfection",
    statistic: "66 days average",
    statisticDetail: "is how long it takes to form a new habit",
    tip: "Missing one day won't break a habit, but missing twice is the start of a new pattern. Never miss twice!",
    icon: Target,
    color: "from-green-500 to-emerald-600",
    emoji: "🎯"
  },
  {
    title: "Environment Shapes Behavior",
    statistic: "90% of habits",
    statisticDetail: "are triggered by context and environment",
    tip: "Design your space for success. Want to drink more water? Keep a filled bottle on your desk.",
    icon: Brain,
    color: "from-orange-500 to-red-600",
    emoji: "🧠"
  },
  {
    title: "Habit Stacking Works",
    statistic: "2.5x more likely",
    statisticDetail: "to stick with a new habit when stacked with existing ones",
    tip: "Link new habits to existing ones: \"After I pour my morning coffee, I will meditate for 2 minutes.\"",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-600",
    emoji: "💡"
  },
  {
    title: "Identity-Based Habits Last",
    statistic: "50% higher",
    statisticDetail: "success rate when you focus on who you want to become",
    tip: "Don't say \"I need to run.\" Say \"I'm a runner.\" Your habits reflect your identity.",
    icon: TrendingUp,
    color: "from-indigo-500 to-purple-600",
    emoji: "🌟"
  }
];

export default function WeeklyInsight({ className = "" }) {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotate insight weekly (based on week number of the year)
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.floor(diff / oneWeek);
    setCurrentInsightIndex(weekNumber % insights.length);
  }, []);

  const currentInsight = insights[currentInsightIndex];
  const Icon = currentInsight.icon;

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className={`relative overflow-hidden border-0 shadow-xl bg-gradient-to-br ${currentInsight.color}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <CardContent className="relative p-6 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsightIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold opacity-90 mb-1">
                      {currentInsight.emoji} Insight of the Week
                    </div>
                    <h3 className="text-xl font-bold">
                      {currentInsight.title}
                    </h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="text-white hover:bg-white/20 flex-shrink-0"
                  disabled={isAnimating}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Statistic */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="text-3xl font-bold mb-1">
                  {currentInsight.statistic}
                </div>
                <div className="text-sm opacity-90">
                  {currentInsight.statisticDetail}
                </div>
              </div>

              {/* Tip */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xs font-semibold opacity-75 mb-1">✨ TIP</div>
                <p className="text-sm leading-relaxed">
                  {currentInsight.tip}
                </p>
              </div>

              {/* Footer Tagline */}
              <div className="mt-4 text-center">
                <p className="text-xs opacity-75">
                  DobryLife Habit Tracker – where self-awareness meets action 💚
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {insights.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setCurrentInsightIndex(index);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentInsightIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              disabled={isAnimating}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}