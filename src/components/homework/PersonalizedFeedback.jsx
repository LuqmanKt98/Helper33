import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Brain, AlertCircle,
  CheckCircle, Trophy, Star, Sparkles
} from 'lucide-react';

export default function PersonalizedFeedback({ 
  isCorrect, 
  userAnswer, 
  correctAnswer, 
  question,
  performance,
  onRecommendation 
}) {
  const getErrorPattern = () => {
    if (isCorrect) return null;

    if (question.type === 'multiple_choice') {
      return 'Selected incorrect option - review the concept';
    }
    
    if (userAnswer.length < 10) {
      return 'Answer too brief - provide more detail';
    }
    
    if (!userAnswer.toLowerCase().includes(question.topic?.toLowerCase())) {
      return 'Missing key concept - focus on the main topic';
    }

    return 'Review the material and try again';
  };

  const getPersonalizedTips = () => {
    if (!performance) return [];

    const tips = [];
    
    if (performance.filter(p => !p.is_correct).length > 2) {
      tips.push('You might need more practice on this topic');
    }
    
    if (performance.filter(p => p.hints_used > 0).length > 3) {
      tips.push('Try reviewing the material before answering');
    }

    const avgTime = performance.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) / performance.length;
    if (avgTime < 30) {
      tips.push('Take your time to think through each question');
    }

    return tips;
  };

  const errorPattern = getErrorPattern();
  const tips = getPersonalizedTips();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-3"
    >
      <Card className={`border-2 ${isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              {isCorrect ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </motion.div>
            <div className="flex-1">
              <p className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '🎉 Excellent Work!' : '📚 Keep Learning!'}
              </p>
              
              {!isCorrect && (
                <div className="space-y-2">
                  <div className="bg-white/60 rounded-lg p-3 border border-red-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Your answer:</p>
                    <p className="text-sm text-gray-600">{userAnswer}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Correct answer:</p>
                    <p className="text-sm text-green-700 font-medium">{correctAnswer}</p>
                  </div>
                </div>
              )}

              {question.explanation && (
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    Explanation:
                  </p>
                  <p className="text-sm text-gray-700">{question.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!isCorrect && errorPattern && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-orange-900 text-sm mb-1">Common Error Pattern:</p>
                  <p className="text-sm text-orange-800">{errorPattern}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <p className="font-semibold text-purple-900 text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Personalized Tips:
              </p>
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-purple-800"
                  >
                    <Star className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isCorrect && performance && performance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900 text-sm">
                    {Math.round((performance.filter(p => p.is_correct).length / performance.length) * 100)}% Accuracy
                  </span>
                </div>
                <Badge className="bg-green-600 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Improving!
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}