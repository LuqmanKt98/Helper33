import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function LetterTracingChallenge({ 
  onComplete, 
  selectedLetter = null,
  completedLetters = [],
  onLetterComplete
}) {
  const [currentLetter, setCurrentLetter] = useState(selectedLetter || ALPHABET[0]);
  const [isTracing, setIsTracing] = useState(false);
  const [tracingProgress, setTracingProgress] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [letterCompleted, setLetterCompleted] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth / 2}px`;
    canvas.style.height = `${canvas.offsetHeight / 2}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = '#8b5cf6';
    context.lineWidth = 8;
    contextRef.current = context;
  }, [currentLetter]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setIsTracing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    
    // Simulate progress based on drawing activity
    setTracingProgress(prev => Math.min(100, prev + 0.5));
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Check if tracing is complete (progress > 70%)
    if (tracingProgress > 70 && !letterCompleted) {
      handleLetterComplete();
    }
  };

  const handleLetterComplete = () => {
    setLetterCompleted(true);
    setShowSuccess(true);
    
    // Award stars based on accuracy/speed
    const stars = tracingProgress > 90 ? 3 : tracingProgress > 75 ? 2 : 1;
    setStarsEarned(stars);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB']
    });

    if (onLetterComplete) {
      onLetterComplete(currentLetter);
    }

    setTimeout(() => {
      setShowSuccess(false);
      
      // Check if all letters are done
      const currentIndex = ALPHABET.indexOf(currentLetter);
      if (currentIndex < ALPHABET.length - 1 && !selectedLetter) {
        // Move to next letter
        const nextLetter = ALPHABET[currentIndex + 1];
        setCurrentLetter(nextLetter);
        resetCanvas();
      } else {
        // Challenge complete
        onComplete(stars * 10, null);
      }
    }, 3000);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setTracingProgress(0);
    setIsTracing(false);
    setLetterCompleted(false);
    setStarsEarned(0);
  };

  const skipLetter = () => {
    const currentIndex = ALPHABET.indexOf(currentLetter);
    if (currentIndex < ALPHABET.length - 1) {
      setCurrentLetter(ALPHABET[currentIndex + 1]);
      resetCanvas();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-800 mb-2">
          Trace the Letter {currentLetter}
        </h2>
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-8 h-8 ${i < starsEarned ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Tracing Canvas */}
      <Card className="bg-white border-4 border-purple-400 shadow-2xl">
        <CardContent className="p-6">
          {/* Guide Letter */}
          <div className="relative mb-4">
            <div className="text-center text-[200px] font-bold text-purple-200 opacity-50 select-none">
              {currentLetter}
            </div>
            
            {/* Drawing Canvas Overlay */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvasRef.current.getBoundingClientRect();
                startDrawing({
                  nativeEvent: {
                    offsetX: touch.clientX - rect.left,
                    offsetY: touch.clientY - rect.top
                  }
                });
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvasRef.current.getBoundingClientRect();
                draw({
                  nativeEvent: {
                    offsetX: touch.clientX - rect.left,
                    offsetY: touch.clientY - rect.top
                  }
                });
              }}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 cursor-crosshair touch-none"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-purple-700">Tracing Progress</span>
              <span className="text-purple-600">{Math.round(tracingProgress)}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tracingProgress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={resetCanvas}
              variant="outline"
              className="flex-1 border-2 border-purple-300"
            >
              Clear & Try Again
            </Button>
            {!selectedLetter && (
              <Button
                onClick={skipLetter}
                variant="outline"
                className="border-2 border-gray-300"
              >
                Skip
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Hint */}
          <p className="text-center text-sm text-purple-600 mt-4 font-semibold">
            ✏️ {isTracing ? 'Great! Keep tracing!' : 'Trace over the letter with your finger or mouse!'}
          </p>
        </CardContent>
      </Card>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-yellow-300 to-orange-400 text-white rounded-3xl p-12 text-center shadow-2xl border-4 border-white">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 1 }}
                className="text-8xl mb-4"
              >
                {starsEarned === 3 ? '🌟' : starsEarned === 2 ? '⭐' : '✨'}
              </motion.div>
              <h3 className="text-5xl font-bold mb-3">PERFECT!</h3>
              <p className="text-2xl">You traced letter {currentLetter}!</p>
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(starsEarned)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                  >
                    <Star className="w-12 h-12 text-white fill-white" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Selection */}
      {!selectedLetter && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="text-center text-lg">Quick Jump to Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {ALPHABET.map(letter => (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setCurrentLetter(letter);
                    resetCanvas();
                  }}
                  className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                    letter === currentLetter
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl'
                      : completedLetters.includes(letter)
                        ? 'bg-green-100 text-green-700 border-2 border-green-400'
                        : 'bg-white border-2 border-purple-200 hover:border-purple-400'
                  }`}
                >
                  {letter}
                  {completedLetters.includes(letter) && (
                    <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-green-600" />
                  )}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}