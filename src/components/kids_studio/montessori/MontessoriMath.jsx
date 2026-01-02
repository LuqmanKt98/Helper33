
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Minus, X as Multiply, Trophy,
  Star, CheckCircle, Sparkles, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AITutor from '../AITutor';

const generateProblem = (level, operation) => {
  let num1, num2, answer, question;

  if (operation === 'addition') {
    if (level === 1) {
      num1 = Math.floor(Math.random() * 5) + 1;
      num2 = Math.floor(Math.random() * 5) + 1;
    } else if (level === 2) {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    } else {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
    }
    answer = num1 + num2;
    question = `${num1} + ${num2} = ?`;
  } else if (operation === 'subtraction') {
    if (level === 1) {
      num1 = Math.floor(Math.random() * 5) + 5;
      num2 = Math.floor(Math.random() * 5) + 1;
    } else if (level === 2) {
      num1 = Math.floor(Math.random() * 10) + 10;
      num2 = Math.floor(Math.random() * 10) + 1;
    } else {
      num1 = Math.floor(Math.random() * 30) + 10;
      num2 = Math.floor(Math.random() * 20) + 1;
    }
    answer = num1 - num2;
    question = `${num1} - ${num2} = ?`;
  } else if (operation === 'multiplication') {
    if (level <= 2) {
      num1 = Math.floor(Math.random() * 5) + 1;
      num2 = Math.floor(Math.random() * 5) + 1;
    } else {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    }
    answer = num1 * num2;
    question = `${num1} × ${num2} = ?`;
  }

  return { question, answer, num1, num2 };
};

export default function MontessoriMath({ progress = {}, onComplete, childAge = 6, childName, onSpeakText }) {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null); // Now used as `null` (show problem) or `true` (show feedback card)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false); // New state to track if the displayed feedback is for a correct answer
  const [quickFeedbackMessage, setQuickFeedbackMessage] = useState(null); // New state for transient feedback message
  const [sessionComplete, setSessionComplete] = useState(false);
  const [operation, setOperation] = useState('addition');
  const [useVisualAid, setUseVisualAid] = useState(true);

  const [showTutor, setShowTutor] = useState(false);
  const [learningGaps, setLearningGaps] = useState([]);

  const level = progress?.level || 1;
  const totalProblems = 5;

  useEffect(() => {
    generateNewProblem();
  }, [operation, level]);

  useEffect(() => {
    // Identify learning gaps from progress
    const gaps = [];
    if (progress.math_mistakes) {
      const mistakes = progress.math_mistakes || {};
      Object.entries(mistakes).forEach(([concept, count]) => {
        if (count > 2) gaps.push(concept);
      });
    }
    setLearningGaps(gaps);
  }, [progress]);

  // Unified speak function, uses onSpeakText if available, falls back to internal
  const speak = useCallback((text) => {
    if (onSpeakText) {
      onSpeakText(text);
    } else if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.3;
        utterance.rate = 0.9;
        utterance.onerror = () => console.log('Voice not available');
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.log('Voice synthesis unavailable');
      }
    }
  }, [onSpeakText]);

  // Placeholder for playSound. In a real app, you'd load actual sound files.
  const playSound = useCallback((type) => {
    // console.log(`Playing sound: ${type}`);
    // Example:
    // const audio = new Audio(type === 'error' ? '/sounds/error.mp3' : '/sounds/success.mp3');
    // audio.play();
  }, []);

  const generateNewProblem = () => {
    setCurrentProblem(generateProblem(level, operation));
    setUserAnswer('');
    setShowFeedback(null); // Reset main feedback
    setIsAnswerCorrect(false); // Reset correctness for next problem
    setQuickFeedbackMessage(null); // Clear any transient feedback
  };

  const checkAnswer = () => {
    const correct = parseInt(userAnswer) === currentProblem.answer;

    if (correct) {
      setCorrectCount(prev => prev + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      speak("That's correct! Good job!");

      // Report success to AI Tutor
      if (window.aiTutorReportSuccess) {
        window.aiTutorReportSuccess();
      }
      setIsAnswerCorrect(true);
      setShowFeedback(true); // Show feedback card
    } else {
      setQuickFeedbackMessage('Try again! You can do it! 💪'); // Set transient feedback message
      playSound('error'); // Play error sound
      speak("Oops, not quite. Let's try another one!");

      // Report error to AI Tutor for intervention detection
      if (window.aiTutorReportError) {
        window.aiTutorReportError();
      }
      setTimeout(() => setQuickFeedbackMessage(null), 2000); // Clear transient feedback after 2 seconds

      setIsAnswerCorrect(false);
      setShowFeedback(true); // Show feedback card
    }

    setTimeout(() => {
      const newCompleted = problemsCompleted + 1;
      setProblemsCompleted(newCompleted);

      if (newCompleted >= totalProblems) {
        const score = Math.round((correctCount + (correct ? 1 : 0)) / totalProblems * 100);
        setSessionComplete(true);
        onComplete({ score });

        if (score >= 80) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        generateNewProblem();
      }
    }, 1500);
  };

  const resetSession = () => {
    setProblemsCompleted(0);
    setCorrectCount(0);
    setSessionComplete(false);
    generateNewProblem();
  };

  if (sessionComplete) {
    const score = Math.round(correctCount / totalProblems * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {score >= 80 ? '🎉 Excellent Work!' : score >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
        </h3>
        <p className="text-xl text-gray-700 mb-4">
          You got {correctCount} out of {totalProblems} correct!
        </p>
        <p className="text-lg text-gray-600 mb-6">
          Score: {score}%
        </p>

        {score >= 80 && (
          <p className="text-purple-600 font-semibold mb-6">
            ✨ You're ready for harder challenges!
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={resetSession} className="bg-blue-500 hover:bg-blue-600">
            <Sparkles className="w-4 h-4 mr-2" />
            Practice More
          </Button>
          {score >= 80 && (
            <Button
              onClick={() => {
                const nextOp = operation === 'addition' ? 'subtraction' :
                             operation === 'subtraction' ? 'multiplication' : 'addition';
                setOperation(nextOp);
                resetSession();
              }}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Try {operation === 'addition' ? 'Subtraction' : 'Multiplication'}
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* AI Tutor Integration */}
      <AITutor
        childName={childName || progress.child_name || 'friend'}
        childAge={childAge}
        currentModule="math"
        currentActivity={{
          name: `${operation} Math`,
          concept: currentProblem ? `${currentProblem.question}` : 'Numbers and counting'
        }}
        learningGaps={learningGaps}
        interests={progress.interests || ['numbers', 'counting']}
        recentProgress={{
          correct: correctCount,
          total: problemsCompleted,
          difficulty: level
        }}
        onSpeakResponse={speak}
        compact={true}
      />

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Math Practice - Level {level}</h2>
        <p className="text-gray-600">Problem {problemsCompleted + 1} of {totalProblems}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(problemsCompleted / totalProblems) * 100}%` }}
          />
        </div>
      </div>

      {/* Operation Selector */}
      <div className="flex gap-2 justify-center mb-6">
        <Button
          onClick={() => { setOperation('addition'); generateNewProblem(); }}
          variant={operation === 'addition' ? 'default' : 'outline'}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
        <Button
          onClick={() => { setOperation('subtraction'); generateNewProblem(); }}
          variant={operation === 'subtraction' ? 'default' : 'outline'}
          size="sm"
          disabled={level < 2}
        >
          <Minus className="w-4 h-4 mr-1" />
          Subtract
        </Button>
        <Button
          onClick={() => { setOperation('multiplication'); generateNewProblem(); }}
          variant={operation === 'multiplication' ? 'default' : 'outline'}
          size="sm"
          disabled={level < 3}
        >
          <Multiply className="w-4 h-4 mr-1" />
          Multiply
        </Button>
      </div>

      {/* Quick feedback message */}
      <AnimatePresence>
        {quickFeedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-3 bg-red-500 text-white rounded-lg shadow-lg text-lg font-bold"
          >
            {quickFeedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Problem Card */}
      {currentProblem && (
        <Card className="border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {!showFeedback ? ( // If showFeedback is null, show the problem
                <motion.div
                  key="problem"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  {/* Visual Aid */}
                  {useVisualAid && operation === 'addition' && currentProblem.num1 <= 10 && currentProblem.num2 <= 10 && (
                    <div className="flex gap-4 justify-center mb-6">
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {Array.from({ length: currentProblem.num1 }).map((_, i) => (
                          <div key={`a${i}`} className="w-8 h-8 bg-blue-500 rounded-full" />
                        ))}
                      </div>
                      <Plus className="w-8 h-8 text-gray-600 self-center" />
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {Array.from({ length: currentProblem.num2 }).map((_, i) => (
                          <div key={`b${i}`} className="w-8 h-8 bg-purple-500 rounded-full" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Problem */}
                  <p className="text-5xl font-bold text-gray-900 mb-8">
                    {currentProblem.question}
                  </p>

                  {/* Answer Input */}
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && userAnswer) {
                        checkAnswer();
                      }
                    }}
                    placeholder="Type your answer..."
                    className="text-3xl text-center font-bold border-4 border-blue-300 py-6 mb-4"
                    autoFocus
                  />

                  <Button
                    onClick={checkAnswer}
                    disabled={!userAnswer}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-xl py-6"
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Check Answer
                  </Button>
                </motion.div>
              ) : ( // If showFeedback is true, show the feedback card
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center py-8"
                >
                  {isAnswerCorrect ? ( // Use isAnswerCorrect to determine specific feedback content
                    <>
                      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold text-green-700 mb-2">Correct! 🎉</h3>
                      <p className="text-xl text-gray-700">
                        {currentProblem.question.replace('?', '')} <strong>{currentProblem.answer}</strong>
                      </p>
                      <p className="text-purple-600 mt-4">Great thinking!</p>
                    </>
                  ) : (
                    <>
                      <Star className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold text-yellow-700 mb-2">Not quite!</h3>
                      <p className="text-xl text-gray-700 mb-2">
                        The correct answer was <strong>{currentProblem.answer}</strong>.
                      </p>
                      <p className="text-purple-600 mt-4">Let's try another one!</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="mt-4 text-center">
        <Button
          onClick={() => setUseVisualAid(!useVisualAid)}
          variant="outline"
          size="sm"
        >
          {useVisualAid ? '🎨 Hide' : '🎨 Show'} Visual Helpers
        </Button>
      </div>
    </div>
  );
}
