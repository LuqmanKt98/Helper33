import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Heart, CheckCircle, X, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MathChallengeGame({ onComplete, childAge = 6 }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Generate questions based on level and age
  const generateQuestions = (level) => {
    const questionsArray = [];
    const questionCount = 5;
    
    for (let i = 0; i < questionCount; i++) {
      let question, answer, options;
      
      if (level === 1) {
        // Addition (1-10)
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        options = generateOptions(answer, 0, 20);
      } else if (level === 2) {
        // Subtraction (1-20)
        const num1 = Math.floor(Math.random() * 15) + 5;
        const num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        options = generateOptions(answer, 0, 20);
      } else if (level === 3) {
        // Multiplication (1-10)
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        options = generateOptions(answer, 0, 100);
      } else {
        // Mixed operations
        const operation = Math.floor(Math.random() * 3);
        if (operation === 0) {
          const num1 = Math.floor(Math.random() * 20) + 1;
          const num2 = Math.floor(Math.random() * 20) + 1;
          answer = num1 + num2;
          question = `${num1} + ${num2} = ?`;
          options = generateOptions(answer, 0, 40);
        } else if (operation === 1) {
          const num1 = Math.floor(Math.random() * 30) + 10;
          const num2 = Math.floor(Math.random() * num1) + 1;
          answer = num1 - num2;
          question = `${num1} - ${num2} = ?`;
          options = generateOptions(answer, 0, 40);
        } else {
          const num1 = Math.floor(Math.random() * 12) + 1;
          const num2 = Math.floor(Math.random() * 12) + 1;
          answer = num1 * num2;
          question = `${num1} × ${num2} = ?`;
          options = generateOptions(answer, 0, 144);
        }
      }
      
      questionsArray.push({ question, answer, options });
    }
    
    return questionsArray;
  };

  const generateOptions = (correctAnswer, min, max) => {
    const options = [correctAnswer];
    while (options.length < 4) {
      const wrong = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!options.includes(wrong) && wrong !== correctAnswer) {
        options.push(wrong);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    setQuestions(generateQuestions(currentLevel));
  }, [currentLevel]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 10 * currentLevel);
      setStreak(streak + 1);
      setTotalCorrect(totalCorrect + 1);
      
      // Celebration for streak
      if ((streak + 1) % 3 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF69B4']
        });
      }

      setTimeout(() => {
        if (currentQuestion + 1 < questions.length) {
          setCurrentQuestion(currentQuestion + 1);
          setShowFeedback(false);
          setSelectedAnswer(null);
        } else {
          // Level complete!
          setShowCelebration(true);
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB']
          });
          
          setTimeout(() => {
            if (currentLevel < 4 && totalCorrect + 1 >= 4) {
              setCurrentLevel(currentLevel + 1);
              setCurrentQuestion(0);
              setShowCelebration(false);
            } else {
              setChallengeComplete(true);
              onComplete(score + 10 * currentLevel, null);
            }
          }, 3000);
        }
      }, 1500);
    } else {
      setLives(lives - 1);
      setStreak(0);
      
      if (lives - 1 <= 0) {
        // Game over
        setChallengeComplete(true);
        setTimeout(() => {
          onComplete(score, null);
        }, 2000);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
          setSelectedAnswer(null);
        }, 1500);
      }
    }
  };

  if (challengeComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-4xl font-bold text-purple-800 mb-4">
          {lives > 0 ? 'AMAZING JOB! 🎉' : 'Good Try! 💪'}
        </h2>
        <div className="space-y-3 max-w-md mx-auto">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-purple-300">
            <p className="text-2xl font-bold text-purple-900">Final Score: {score} points</p>
            <p className="text-lg text-purple-700">Correct Answers: {totalCorrect}/{questions.length * currentLevel}</p>
            <p className="text-lg text-purple-700">Level Reached: {currentLevel}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="text-8xl mb-6"
        >
          🌟
        </motion.div>
        <h2 className="text-5xl font-bold text-purple-800 mb-4">LEVEL {currentLevel} COMPLETE!</h2>
        <p className="text-2xl text-purple-600">Get ready for Level {currentLevel + 1}!</p>
      </motion.div>
    );
  }

  if (!questions[currentQuestion]) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{currentLevel}</div>
            <div className="text-xs opacity-90">Level</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-xs opacity-90">Points</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs opacity-90">Streak</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center gap-1 mb-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`w-5 h-5 ${i < lives ? 'fill-current' : 'opacity-30'}`} />
              ))}
            </div>
            <div className="text-xs opacity-90">Lives</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-purple-700">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-purple-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
      >
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-400 shadow-2xl">
          <CardHeader className="text-center bg-white/50 backdrop-blur-sm">
            <CardTitle className="text-4xl sm:text-5xl font-bold text-purple-800">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-4">
              {currentQ.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  className={`p-8 rounded-2xl text-3xl font-bold transition-all border-4 ${
                    showFeedback && option === currentQ.answer
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-500 shadow-2xl'
                      : showFeedback && option === selectedAnswer
                        ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white border-red-500 shadow-2xl'
                        : 'bg-white hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 border-purple-300 hover:border-purple-500 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {option}
                  {showFeedback && option === currentQ.answer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      className="inline-block ml-3"
                    >
                      <CheckCircle className="w-8 h-8 inline" />
                    </motion.div>
                  )}
                  {showFeedback && option === selectedAnswer && option !== currentQ.answer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      className="inline-block ml-3"
                    >
                      <X className="w-8 h-8 inline" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Immediate Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-6 p-6 rounded-2xl text-center ${
                    isCorrect 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-400'
                      : 'bg-gradient-to-r from-red-100 to-rose-100 border-4 border-red-400'
                  }`}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-3"
                  >
                    {isCorrect ? '🎉' : '💪'}
                  </motion.div>
                  <h3 className={`text-3xl font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? 'CORRECT! Amazing!' : 'Oops! Try Again!'}
                  </h3>
                  {isCorrect ? (
                    <div className="space-y-2">
                      <p className="text-xl text-green-600">+{10 * currentLevel} points!</p>
                      {streak > 0 && streak % 3 === 0 && (
                        <p className="text-lg text-yellow-600 font-bold">🔥 {streak} in a row! On fire!</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xl text-red-600">The answer was {currentQ.answer}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Streak Indicator */}
            {streak > 0 && !showFeedback && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 text-center"
              >
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-4 py-2">
                  <Zap className="w-5 h-5 mr-2" />
                  {streak} Streak!
                </Badge>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Encouragement Messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <p className="text-lg font-semibold text-purple-700">
          {currentQuestion === 0 && "Let's start! You got this! 💪"}
          {currentQuestion > 0 && currentQuestion < 3 && "You're doing great! Keep going! ⭐"}
          {currentQuestion >= 3 && "Almost there! Finish strong! 🌟"}
        </p>
      </motion.div>
    </div>
  );
}