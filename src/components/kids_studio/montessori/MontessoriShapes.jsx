
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import AITutor from '../AITutor';

const shapes = [
  { name: 'Circle', emoji: '🔵', sides: 0, svg: <circle cx="100" cy="100" r="80" fill="#3B82F6" /> },
  { name: 'Square', emoji: '🟦', sides: 4, svg: <rect x="20" y="20" width="160" height="160" fill="#8B5CF6" /> },
  { name: 'Triangle', emoji: '🔺', sides: 3, svg: <polygon points="100,20 180,180 20,180" fill="#EC4899" /> },
  { name: 'Rectangle', emoji: '🟩', sides: 4, svg: <rect x="20" y="50" width="160" height="100" fill="#10B981" /> },
  { name: 'Star', emoji: '⭐', sides: 5, svg: <polygon points="100,20 120,80 180,80 130,120 150,180 100,140 50,180 70,120 20,80 80,80" fill="#F59E0B" /> },
  { name: 'Heart', emoji: '❤️', sides: 0, svg: <path d="M100,40 C80,20 40,40 40,70 C40,100 100,140 100,140 C100,140 160,100 160,70 C160,40 120,20 100,40 Z" fill="#EF4444" /> },
  { name: 'Pentagon', emoji: '⬟', sides: 5, svg: <polygon points="100,20 180,80 150,170 50,170 20,80" fill="#6366F1" /> },
  { name: 'Hexagon', emoji: '⬡', sides: 6, svg: <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="#14B8A6" /> }
];

export default function MontessoriShapes({ progress = {}, onComplete, childAge = 5, onSpeakText }) {
  const [currentShape, setCurrentShape] = useState(null);
  const [activityType, setActivityType] = useState('identify');
  const [options, setOptions] = useState([]);
  const [showFeedback, setShowFeedback] = useState(null);
  const [completed, setCompleted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [learningGaps, setLearningGaps] = useState([]);

  const masteredShapes = progress?.mastered_shapes || [];
  const level = progress?.level || 1;
  const totalActivities = 5;

  useEffect(() => {
    generateNewActivity();
  }, [activityType]);

  useEffect(() => {
    // Identify which shapes child struggles with
    const gaps = [];
    if (progress.shape_mistakes) {
      Object.entries(progress.shape_mistakes).forEach(([shape, count]) => {
        if (count > 2) gaps.push(`${shape} shape`);
      });
    }
    setLearningGaps(gaps);
  }, [progress]);

  const generateNewActivity = () => {
    // Pick shapes based on level
    const availableShapes = level === 1
      ? shapes.slice(0, 4)  // Circle, Square, Triangle, Rectangle
      : level === 2
      ? shapes.slice(0, 6)  // Add Star, Heart
      : shapes;  // All shapes

    const shape = availableShapes[Math.floor(Math.random() * availableShapes.length)];
    setCurrentShape(shape);

    // Generate options
    const wrongShapes = availableShapes.filter(s => s.name !== shape.name);
    const shuffled = [...wrongShapes].sort(() => Math.random() - 0.5).slice(0, 2);
    const allOptions = [shape, ...shuffled].sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setShowFeedback(null);
  };

  const speakShape = (shapeName) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const shapeData = shapes.find(s => s.name === shapeName);
        const utterance = new SpeechSynthesisUtterance(
          `This is a ${shapeName}. ${shapeData?.sides || 'no'} sides.`
        );
        utterance.rate = 0.8;
        utterance.pitch = 1.4;
        utterance.onerror = () => console.log('Voice not available');
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.log('Voice synthesis unavailable');
      }
    }
  };

  const handleAnswer = (selectedShape) => {
    const isCorrect = selectedShape.name === currentShape.name;

    setShowFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setCorrect(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
      // Report success to AI Tutor
      if (window.aiTutorReportSuccess) {
        window.aiTutorReportSuccess();
      }
    } else {
      // Report error to AI Tutor
      if (window.aiTutorReportError) {
        window.aiTutorReportError();
      }
    }

    setTimeout(() => {
      const newCompleted = completed + 1;
      setCompleted(newCompleted);

      if (newCompleted >= totalActivities) {
        setSessionDone(true);
        const isMastered = !masteredShapes.includes(currentShape.name);
        onComplete({
          score: Math.round(correct / totalActivities * 100),
          masteredShape: isMastered ? currentShape.name : null
        });
      } else {
        generateNewActivity();
      }
    }, 1500);
  };

  if (sessionDone) {
    const score = Math.round(correct / totalActivities * 100);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          {score >= 80 ? 'Excellent Work! 🎉' : 'Good Job! 👍'}
        </h3>
        <p className="text-xl text-gray-700 mb-2">
          You got {correct} out of {totalActivities} correct!
        </p>

        {!masteredShapes.includes(currentShape?.name) && (
          <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg mt-4">
            <Star className="w-5 h-5 mr-2" />
            New Shape Mastered: {currentShape?.name}!
          </Badge>
        )}

        <Button
          onClick={() => {
            setCompleted(0);
            setCorrect(0);
            setSessionDone(false);
            generateNewActivity();
          }}
          className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Learn More Shapes
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* AI Tutor Integration */}
      <AITutor
        childName={progress.child_name || 'friend'}
        childAge={childAge}
        currentModule="shapes"
        currentActivity={{
          name: currentShape?.name ? `Finding ${currentShape.name}` : '',
          concept: currentShape?.name ? `${currentShape.name} - ${shapes.find(s => s.name === currentShape.name)?.sides || 'no'} sides` : ''
        }}
        learningGaps={learningGaps}
        interests={progress.interests || ['shapes', 'geometry']}
        recentProgress={{
          correct: correct,
          total: completed
        }}
        onSpeakResponse={speakShape}
        compact={true}
      />

      {/* Progress */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Shapes & Geometry - Level {level}</h2>
        <p className="text-gray-600">Activity {completed + 1} of {totalActivities}</p>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completed / totalActivities) * 100}%` }}
          />
        </div>
      </div>

      {/* Shape Display */}
      {currentShape && (
        <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 mb-6">
          <CardContent className="p-8 text-center">
            <p className="text-2xl font-bold text-gray-900 mb-6">
              Which one is the <span className="text-green-600">{currentShape.name}</span>?
            </p>

            {/* Shape Options */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {options.map((shape, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleAnswer(shape)}
                  disabled={showFeedback}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 bg-white rounded-xl border-4 border-gray-200 hover:border-green-400 transition-all disabled:opacity-50"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-32">
                    {shape.svg}
                  </svg>
                  <p className="text-sm font-semibold text-gray-700 mt-2">{shape.name}</p>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-4"
                >
                  {showFeedback === 'correct' ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700">Perfect! 🎉</p>
                      <p className="text-gray-600 mt-2">That's a {currentShape.name}!</p>
                    </>
                  ) : (
                    <>
                      <Star className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-700">Try Again!</p>
                      <p className="text-gray-600 mt-2">Look for the {currentShape.name}</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Mastered Shapes */}
      {masteredShapes.length > 0 && (
        <div className="p-4 bg-white rounded-lg border-2 border-green-200">
          <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Shapes You've Mastered: {masteredShapes.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {masteredShapes.map(shapeName => {
              const shape = shapes.find(s => s.name === shapeName);
              return (
                <Badge key={shapeName} className="bg-green-100 text-green-800">
                  {shape?.emoji} {shapeName}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
