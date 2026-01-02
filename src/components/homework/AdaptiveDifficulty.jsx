import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Brain } from 'lucide-react';

export default function AdaptiveDifficulty({ currentDifficulty, performance, onDifficultyChange }) {
  const calculateRecommendedDifficulty = () => {
    if (!performance || performance.length < 3) {
      return currentDifficulty;
    }

    const recentPerformance = performance.slice(-5);
    const correctRate = recentPerformance.filter(p => p.is_correct).length / recentPerformance.length;
    const avgHints = recentPerformance.reduce((sum, p) => sum + (p.hints_used || 0), 0) / recentPerformance.length;

    // Adaptive logic
    if (correctRate >= 0.8 && avgHints < 1) {
      // Doing great - increase difficulty
      if (currentDifficulty === 'easy') return 'medium';
      if (currentDifficulty === 'medium') return 'hard';
      return 'hard';
    } else if (correctRate < 0.4 || avgHints > 2) {
      // Struggling - decrease difficulty
      if (currentDifficulty === 'hard') return 'medium';
      if (currentDifficulty === 'medium') return 'easy';
      return 'easy';
    }

    return currentDifficulty;
  };

  const recommendedDifficulty = calculateRecommendedDifficulty();
  const shouldAdjust = recommendedDifficulty !== currentDifficulty;

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getDifficultyEmoji = (level) => {
    switch(level) {
      case 'easy': return '🌱';
      case 'medium': return '⭐';
      case 'hard': return '🔥';
      default: return '📖';
    }
  };

  if (!shouldAdjust || !performance || performance.length < 3) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="border-2 border-purple-400 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <p className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI Recommendation: Adjust Difficulty
              </p>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={`bg-gradient-to-r ${getDifficultyColor(currentDifficulty)} text-white`}>
                    {getDifficultyEmoji(currentDifficulty)} {currentDifficulty}
                  </Badge>
                  <span className="text-gray-400">→</span>
                  <Badge className={`bg-gradient-to-r ${getDifficultyColor(recommendedDifficulty)} text-white`}>
                    {getDifficultyEmoji(recommendedDifficulty)} {recommendedDifficulty}
                  </Badge>
                </div>
                {recommendedDifficulty > currentDifficulty ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                )}
              </div>

              <p className="text-sm text-gray-700 mb-3">
                {recommendedDifficulty > currentDifficulty ? (
                  <>You're doing great! Try <strong>{recommendedDifficulty}</strong> questions for more challenge.</>
                ) : (
                  <>Let's build confidence with <strong>{recommendedDifficulty}</strong> questions first.</>
                )}
              </p>

              {performance && performance.length > 0 && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/60 rounded-lg p-2 border border-purple-200">
                    <p className="text-xs text-gray-600">Accuracy</p>
                    <p className="font-bold text-purple-600">
                      {Math.round((performance.filter(p => p.is_correct).length / performance.length) * 100)}%
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 border border-purple-200">
                    <p className="text-xs text-gray-600">Avg Hints</p>
                    <p className="font-bold text-orange-600">
                      {(performance.reduce((sum, p) => sum + (p.hints_used || 0), 0) / performance.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 border border-purple-200">
                    <p className="text-xs text-gray-600">Questions</p>
                    <p className="font-bold text-blue-600">{performance.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}