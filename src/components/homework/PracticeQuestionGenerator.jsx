import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain, Sparkles, CheckCircle, XCircle, RotateCcw, 
  Zap, TrendingUp, Target, Award, AlertCircle, ChevronRight,
  RefreshCw, Trophy, Star, Flame
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function PracticeQuestionGenerator({ 
  materialId, 
  materialTitle, 
  extractedText, 
  keyTopics = [],
  subject = 'general',
  onComplete 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [showStats, setShowStats] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const generateQuestionMutation = useMutation({
    mutationFn: async ({ text, topics, diff, previousQuestions }) => {
      const prompt = `Based on this study material about ${subject}:

${text.substring(0, 3000)}

Topics: ${topics.join(', ')}

Generate 1 ${diff} difficulty multiple-choice question that:
- Tests understanding of key concepts
- Has 4 answer options (A, B, C, D)
- Is different from previously asked questions: ${previousQuestions.map(q => q.question).join('; ')}
- Includes an explanation for the correct answer
- Provides a helpful hint without giving away the answer

Return JSON with:
{
  "question": "the question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_answer": 0-3 (index of correct option),
  "explanation": "why this is correct",
  "hint": "helpful hint without revealing answer",
  "topic": "specific topic this tests",
  "difficulty": "${diff}"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } },
            correct_answer: { type: 'number' },
            explanation: { type: 'string' },
            hint: { type: 'string' },
            topic: { type: 'string' },
            difficulty: { type: 'string' }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setCurrentQuestion(data);
      setShowFeedback(false);
      setUserAnswer('');
      setShowHint(false);
      setHintsUsed(0);
      setTotalGenerated(prev => prev + 1);
    },
    onError: () => {
      toast.error('Failed to generate question. Please try again.');
    }
  });

  const savePerformanceMutation = useMutation({
    mutationFn: async (performanceData) => {
      return await base44.entities.StudyPerformance.create(performanceData);
    }
  });

  useEffect(() => {
    if (extractedText && totalGenerated === 0) {
      generateQuestionMutation.mutate({
        text: extractedText,
        topics: keyTopics,
        diff: difficulty,
        previousQuestions: []
      });
    }
  }, [extractedText]);

  const handleAnswer = async (selectedIndex) => {
    if (!currentQuestion || showFeedback) return;

    const correct = selectedIndex === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setUserAnswer(selectedIndex);
    setShowFeedback(true);

    const timeSpent = 30;

    if (correct) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        if (newStreak % 5 === 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          toast.success(`🔥 ${newStreak} question streak! Amazing!`);
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setQuestionHistory(prev => [...prev, {
      ...currentQuestion,
      userAnswer: selectedIndex,
      correct,
      hintsUsed
    }]);

    await savePerformanceMutation.mutateAsync({
      material_id: materialId,
      question_topic: currentQuestion.topic,
      question_difficulty: currentQuestion.difficulty,
      user_answer: currentQuestion.options[selectedIndex],
      correct_answer: currentQuestion.options[currentQuestion.correct_answer],
      is_correct: correct,
      time_spent_seconds: timeSpent,
      hints_used: hintsUsed
    });

    if (correct && difficulty === 'easy' && streak >= 3) {
      setDifficulty('medium');
      toast.success('🎯 Moving to medium difficulty!');
    } else if (correct && difficulty === 'medium' && streak >= 5) {
      setDifficulty('hard');
      toast.success('🔥 Moving to hard difficulty!');
    } else if (!correct && difficulty === 'hard') {
      setDifficulty('medium');
    } else if (!correct && difficulty === 'medium' && streak === 0) {
      setDifficulty('easy');
    }
  };

  const generateNextQuestion = () => {
    if (totalGenerated >= 100) {
      toast.error('You\'ve reached the maximum of 100 questions! Great practice!');
      setShowStats(true);
      return;
    }

    generateQuestionMutation.mutate({
      text: extractedText,
      topics: keyTopics,
      diff: difficulty,
      previousQuestions: questionHistory
    });
  };

  const resetPractice = () => {
    setQuestionHistory([]);
    setTotalGenerated(0);
    setCorrectCount(0);
    setStreak(0);
    setDifficulty('medium');
    setShowStats(false);
    setShowFeedback(false);
    setShowHint(false);
    setHintsUsed(0);
    
    generateQuestionMutation.mutate({
      text: extractedText,
      topics: keyTopics,
      diff: 'medium',
      previousQuestions: []
    });

    toast.success('🔄 Practice session reset! Let\'s go!');
  };

  const accuracy = totalGenerated > 0 ? Math.round((correctCount / totalGenerated) * 100) : 0;
  const questionsRemaining = 100 - totalGenerated;

  if (showStats) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-300" />
              Practice Complete! 
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 text-center border-2 border-blue-200 shadow-lg">
                <div className="text-4xl font-bold text-blue-600">{totalGenerated}</div>
                <div className="text-sm text-gray-600 mt-1">Questions Answered</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center border-2 border-green-200 shadow-lg">
                <div className="text-4xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-gray-600 mt-1">Accuracy</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center border-2 border-orange-200 shadow-lg">
                <div className="text-4xl font-bold text-orange-600">{bestStreak}</div>
                <div className="text-sm text-gray-600 mt-1">Best Streak</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Performance Breakdown
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Correct Answers</span>
                    <span className="font-bold text-green-600">{correctCount}/{totalGenerated}</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Hints Used</span>
                    <span className="font-bold text-blue-600">{questionHistory.reduce((sum, q) => sum + (q.hintsUsed || 0), 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {accuracy >= 80 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-center text-white"
              >
                <Award className="w-16 h-16 mx-auto mb-3" />
                <h3 className="text-2xl font-bold mb-2">Outstanding Performance!</h3>
                <p>You've mastered this material! 🎉</p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={resetPractice}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Practice Again (100 New Questions)
              </Button>
              {onComplete && (
                <Button
                  onClick={() => onComplete({ totalGenerated, correctCount, accuracy, bestStreak })}
                  variant="outline"
                  size="lg"
                >
                  Done
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Brain className="w-6 h-6" />
                {materialTitle}
              </h3>
              <p className="text-indigo-100 text-sm">Practice Questions</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalGenerated}/100</div>
              <div className="text-xs text-indigo-200">Questions</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-300" />
              <div className="font-bold text-xl">{correctCount}</div>
              <div className="text-xs text-indigo-200">Correct</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-blue-300" />
              <div className="font-bold text-xl">{accuracy}%</div>
              <div className="text-xs text-indigo-200">Accuracy</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-300" />
              <div className="font-bold text-xl">{streak}</div>
              <div className="text-xs text-indigo-200">Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Star className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
              <div className="font-bold text-xl">{bestStreak}</div>
              <div className="text-xs text-indigo-200">Best</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-indigo-200">
              <span>Progress</span>
              <span>{questionsRemaining} questions remaining</span>
            </div>
            <Progress value={(totalGenerated / 100) * 100} className="h-2 bg-indigo-800" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <Badge 
              className={`${
                difficulty === 'easy' ? 'bg-green-500' :
                difficulty === 'medium' ? 'bg-yellow-500' :
                'bg-red-500'
              } text-white border-0`}
            >
              {difficulty.toUpperCase()} Difficulty
            </Badge>
            <Button
              onClick={resetPractice}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Practice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {generateQuestionMutation.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="bg-white shadow-xl border-2 border-purple-200">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <Brain className="w-16 h-16 text-purple-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Generating Your Question...
                </h3>
                <p className="text-gray-600">AI is creating a personalized question for you</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : currentQuestion && (
          <motion.div
            key={currentQuestion.question}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="bg-white shadow-xl border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Question #{totalGenerated}
                      </Badge>
                      <Badge className="bg-purple-600 text-white text-xs">
                        {currentQuestion.topic}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-gray-800">
                      {currentQuestion.question}
                    </CardTitle>
                  </div>
                  {!showFeedback && (
                    <Button
                      onClick={() => {
                        setShowHint(!showHint);
                        if (!showHint) setHintsUsed(prev => prev + 1);
                      }}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {showHint ? 'Hide' : 'Hint'}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <AnimatePresence>
                  {showHint && !showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900 text-sm mb-1">Hint:</p>
                          <p className="text-blue-800 text-sm">{currentQuestion.hint}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = userAnswer === index;
                    const isCorrectOption = index === currentQuestion.correct_answer;
                    const showCorrect = showFeedback && isCorrectOption;
                    const showWrong = showFeedback && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={showFeedback}
                        whileHover={!showFeedback ? { scale: 1.02, x: 8 } : {}}
                        whileTap={!showFeedback ? { scale: 0.98 } : {}}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          showCorrect
                            ? 'bg-green-50 border-green-500 shadow-lg'
                            : showWrong
                            ? 'bg-red-50 border-red-500'
                            : isSelected && !showFeedback
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-gray-50 border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            showCorrect
                              ? 'bg-green-500 text-white'
                              : showWrong
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {showCorrect ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : showWrong ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </div>
                          <span className={`flex-1 font-medium ${
                            showCorrect ? 'text-green-900' :
                            showWrong ? 'text-red-900' :
                            'text-gray-800'
                          }`}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <div className={`rounded-xl p-6 ${
                        isCorrect
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300'
                      }`}>
                        <div className="flex items-start gap-4">
                          {isCorrect ? (
                            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h4 className={`font-bold text-lg mb-2 ${
                              isCorrect ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {isCorrect ? '✨ Correct! Well done!' : '💭 Not quite right'}
                            </h4>
                            <p className={`text-sm leading-relaxed ${
                              isCorrect ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {currentQuestion.explanation}
                            </p>
                            {hintsUsed > 0 && (
                              <p className="text-xs text-gray-600 mt-2">
                                💡 Hints used: {hintsUsed}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        {questionsRemaining > 0 ? (
                          <Button
                            onClick={generateNextQuestion}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            size="lg"
                          >
                            <ChevronRight className="w-5 h-5 mr-2" />
                            Next Question ({questionsRemaining} left)
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowStats(true)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            size="lg"
                          >
                            <Trophy className="w-5 h-5 mr-2" />
                            View Results
                          </Button>
                        )}
                        <Button
                          onClick={resetPractice}
                          variant="outline"
                          size="lg"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Card */}
      {!showFeedback && currentQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-sm text-blue-800">
                <Zap className="w-5 h-5 text-blue-600" />
                <p>
                  <strong>Pro tip:</strong> Take your time and read carefully. Use hints if you need help!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}