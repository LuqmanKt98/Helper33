
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, ArrowLeft, Palette, Star, Heart, RefreshCcw, Hand } from 'lucide-react';
import { useNotifications as useSounds } from '../SoundManager';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';

const letterActivities = {
  A: { word: 'Apple', emoji: '🍎', color: '#ef4444', description: 'Draw a yummy red apple!', 
       tracePath: 'M 70,150 L 100,50 L 130,150 M 80,120 L 120,120' },
  B: { word: 'Bee', emoji: '🐝', color: '#eab308', description: 'Buzz buzz! Draw a busy bee!',
       tracePath: 'M 70,50 L 70,150 M 70,50 Q 120,50 120,80 Q 120,100 70,100 M 70,100 Q 120,100 120,130 Q 120,150 70,150' },
  C: { word: 'Cat', emoji: '🐱', color: '#f97316', description: 'Meow! Draw a cute cat!',
       tracePath: 'M 130,70 Q 80,50 70,100 Q 80,150 130,130' },
  D: { word: 'Dog', emoji: '🐶', color: '#a855f7', description: 'Woof! Draw a friendly dog!',
       tracePath: 'M 70,50 L 70,150 M 70,50 Q 140,50 140,100 Q 140,150 70,150' },
  E: { word: 'Elephant', emoji: '🐘', color: '#6366f1', description: 'Draw a big elephant!',
       tracePath: 'M 130,50 L 70,50 L 70,100 L 110,100 M 70,100 L 70,150 L 130,150' },
  F: { word: 'Fish', emoji: '🐠', color: '#06b6d4', description: 'Swim swim! Draw a colorful fish!',
       tracePath: 'M 130,50 L 70,50 L 70,100 L 110,100 M 70,100 L 70,150' },
  G: { word: 'Grapes', emoji: '🍇', color: '#8b5cf6', description: 'Draw purple grapes!',
       tracePath: 'M 130,70 Q 80,50 70,100 Q 80,150 130,130 L 130,110 L 100,110' },
  H: { word: 'Heart', emoji: '❤️', color: '#ec4899', description: 'Draw a big heart!',
       tracePath: 'M 70,50 L 70,150 M 130,50 L 130,150 M 70,100 L 130,100' },
  I: { word: 'Ice Cream', emoji: '🍦', color: '#f472b6', description: 'Draw yummy ice cream!',
       tracePath: 'M 80,50 L 120,50 M 100,50 L 100,150 M 80,150 L 120,150' },
  J: { word: 'Jellyfish', emoji: '🪼', color: '#06b6d4', description: 'Draw a floating jellyfish!',
       tracePath: 'M 110,50 L 110,130 Q 110,150 90,150 Q 70,150 70,130' },
  K: { word: 'Kite', emoji: '🪁', color: '#f59e0b', description: 'Draw a flying kite!',
       tracePath: 'M 70,50 L 70,150 M 70,100 L 130,50 M 70,100 L 130,150' },
  L: { word: 'Lion', emoji: '🦁', color: '#f59e0b', description: 'Roar! Draw a brave lion!',
       tracePath: 'M 70,50 L 70,150 L 130,150' },
  M: { word: 'Moon', emoji: '🌙', color: '#fbbf24', description: 'Draw a shining moon!',
       tracePath: 'M 60,150 L 60,50 L 100,100 L 140,50 L 140,150' },
  N: { word: 'Nest', emoji: '🪺', color: '#92400e', description: 'Draw a cozy bird nest!',
       tracePath: 'M 70,150 L 70,50 L 130,150 L 130,50' },
  O: { word: 'Orange', emoji: '🍊', color: '#f97316', description: 'Draw a round orange!',
       tracePath: 'M 100,50 Q 130,50 130,100 Q 130,150 100,150 Q 70,150 70,100 Q 70,50 100,50' },
  P: { word: 'Pizza', emoji: '🍕', color: '#ef4444', description: 'Draw a tasty pizza!',
       tracePath: 'M 70,150 L 70,50 Q 120,50 120,80 Q 120,100 70,100' },
  Q: { word: 'Queen', emoji: '👑', color: '#eab308', description: 'Draw a royal crown!',
       tracePath: 'M 100,50 Q 130,50 130,100 Q 130,150 100,150 Q 70,150 70,100 Q 70,50 100,50 M 120,140 L 140,160' },
  R: { word: 'Rainbow', emoji: '🌈', color: '#ec4899', description: 'Draw a colorful rainbow!',
       tracePath: 'M 70,150 L 70,50 Q 120,50 120,80 Q 120,100 70,100 L 130,150' },
  S: { word: 'Star', emoji: '⭐', color: '#fbbf24', description: 'Draw a shining star!',
       tracePath: 'M 130,80 Q 100,50 70,80 Q 90,100 70,130 Q 100,110 130,130 Q 110,100 130,80' },
  T: { word: 'Tree', emoji: '🌳', color: '#22c55e', description: 'Draw a tall tree!',
       tracePath: 'M 70,50 L 130,50 M 100,50 L 100,150' },
  U: { word: 'Umbrella', emoji: '☂️', color: '#3b82f6', description: 'Draw a colorful umbrella!',
       tracePath: 'M 70,50 L 70,130 Q 70,150 100,150 Q 130,150 130,130 L 130,50' },
  V: { word: 'Violin', emoji: '🎻', color: '#a855f7', description: 'Draw a musical violin!',
       tracePath: 'M 70,50 L 100,150 L 130,50' },
  W: { word: 'Watermelon', emoji: '🍉', color: '#22c55e', description: 'Draw a juicy watermelon!',
       tracePath: 'M 60,50 L 80,150 L 100,80 L 120,150 L 140,50' },
  X: { word: 'Xylophone', emoji: '🎵', color: '#06b6d4', description: 'Draw a rainbow xylophone!',
       tracePath: 'M 70,50 L 130,150 M 130,50 L 70,150' },
  Y: { word: 'Yarn', emoji: '🧶', color: '#ec4899', description: 'Draw colorful yarn!',
       tracePath: 'M 70,50 L 100,100 L 130,50 M 100,100 L 100,150' },
  Z: { word: 'Zebra', emoji: '🦓', color: '#64748b', description: 'Draw a striped zebra!',
       tracePath: 'M 70,50 L 130,50 L 70,150 L 130,150' }
};

const colorPalette = [
  { color: '#ef4444', name: 'Red' },
  { color: '#f97316', name: 'Orange' },
  { color: '#eab308', name: 'Yellow' },
  { color: '#22c55e', name: 'Green' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#3b82f6', name: 'Blue' },
  { color: '#8b5cf6', name: 'Purple' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#000000', name: 'Black' }
];

export default function HelpingHandsLetters({ onComplete, onLetterComplete, selectedLetter }) {
  const [user, setUser] = useState(null);
  const [selectedLetterState, setSelectedLetterState] = useState(selectedLetter || null);
  const [currentStep, setCurrentStep] = useState('select'); // select, trace, draw, reflect
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [reflection, setReflection] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const { playSound } = useSounds();

  const [handDrawn, setHandDrawn] = useState(false);

  // Canvas refs
  const canvasRef = useRef(null);
  const pathRef = useRef([]);
  const traceCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  
  // Tracing state
  const [isTracing, setIsTracing] = useState(false);
  const [traceCtx, setTraceCtx] = useState(null);
  const [traceComplete, setTraceComplete] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (selectedLetter) {
      setSelectedLetterState(selectedLetter);
      setCurrentStep('trace');
    }
  }, [selectedLetter]);

  // Setup drawing canvas - FIXED VERSION
  useEffect(() => {
    if (canvasRef.current && currentStep === 'draw') {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      setCtx(context);
    }
  }, [currentStep]);

  // Update context when color or brush size changes
  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [ctx, selectedColor, brushSize]);

  // Setup tracing canvas
  useEffect(() => {
    if (traceCanvasRef.current && (currentStep === 'trace' || !traceCtx)) {
      const canvas = traceCanvasRef.current;
      const context = canvas.getContext('2d');
      
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#8b5cf6'; // Default for user trace
      context.lineWidth = 8;
      
      setTraceCtx(context);
      
      // Draw the guide path
      if (selectedLetterState && letterActivities[selectedLetterState]?.tracePath) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear existing for re-draw
        const activity = letterActivities[selectedLetterState];
        context.save(); // Save current context state
        context.strokeStyle = '#c4b5fd'; // Lighter color for guide
        context.lineWidth = 20;
        context.setLineDash([10, 10]);
        
        const path = new Path2D(activity.tracePath);
        context.stroke(path);
        
        context.restore(); // Restore context state
      }
    }
  }, [traceCtx, currentStep, selectedLetterState]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleLetterSelect = (letter) => {
    setSelectedLetterState(letter);
    setCurrentStep('trace');
    setTraceComplete(false);
    setTraceProgress(0);
    playSound('click');
  };

  const getPointerPos = (e, canvasReference) => {
    const canvas = canvasReference.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    return { x, y };
  };

  // Tracing functions
  const startTracing = (e) => {
    if (!traceCtx || traceComplete) return;
    
    setIsTracing(true);
    const pos = getPointerPos(e, traceCanvasRef);
    
    traceCtx.strokeStyle = '#8b5cf6';
    traceCtx.lineWidth = 8;
    traceCtx.lineCap = 'round';
    traceCtx.lineJoin = 'round';
    traceCtx.beginPath();
    traceCtx.moveTo(pos.x, pos.y);
    
    playSound('pop');
  };

  const trace = (e) => {
    if (!isTracing || !traceCtx || traceComplete) return;
    
    e.preventDefault();
    const pos = getPointerPos(e, traceCanvasRef);
    
    traceCtx.lineTo(pos.x, pos.y);
    traceCtx.stroke();
    
    // Update progress (simple estimation based on drawing)
    const newProgress = Math.min(traceProgress + 0.3, 100);
    setTraceProgress(newProgress);
    
    if (newProgress >= 100 && !traceComplete) {
      setTraceComplete(true);
      playSound('success'); // Play a success sound for tracing complete
    }
  };

  const stopTracing = () => {
    setIsTracing(false);
    if (traceCtx) {
      traceCtx.closePath();
    }
  };

  const clearTrace = () => {
    if (traceCtx && traceCanvasRef.current) {
      const canvas = traceCanvasRef.current;
      traceCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw guide path
      if (selectedLetterState && letterActivities[selectedLetterState]?.tracePath) {
        const activity = letterActivities[selectedLetterState];
        traceCtx.save();
        traceCtx.strokeStyle = '#c4b5fd';
        traceCtx.lineWidth = 20;
        traceCtx.setLineDash([10, 10]);
        
        const path = new Path2D(activity.tracePath);
        traceCtx.stroke(path);
        
        traceCtx.restore();
      }
      
      setTraceProgress(0);
      setTraceComplete(false);
      playSound('click');
    }
  };

  const moveToDrawing = () => {
    setCurrentStep('draw');
    playSound('magic'); // Play a magic sound for moving to drawing
  };

  // Drawing functions - FIXED VERSION
  const startDrawing = (e) => {
    if (!ctx) return;
    e.preventDefault();
    
    setIsDrawing(true);
    const pos = getPointerPos(e, canvasRef);
    
    // Ensure styles are set
    // ctx.strokeStyle and ctx.lineWidth are now handled by useEffect on ctx, selectedColor, brushSize change.
    // ctx.lineCap and ctx.lineJoin are set during canvas initialization and don't change.
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    playSound('pop');
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    
    e.preventDefault();
    const pos = getPointerPos(e, canvasRef);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    
    if (e) {
      e.preventDefault();
    }
    
    setIsDrawing(false);
    
    if (ctx) {
      ctx.closePath();
    }
  };

  const clearCanvas = useCallback(() => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      playSound('click');
    }
  }, [ctx, playSound]);

  const saveDrawing = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `letter_${selectedLetterState}_${Date.now()}.png`, { type: 'image/png' });

      const { file_url } = await UploadFile({ file });

      if (user) {
        const currentProgress = user.hand_tracing_progress || { 
          completed_letters: [], 
          encouragements: [], 
          earned_badges: [],
          letter_photos: {}
        };
        
        const updatedProgress = {
          ...currentProgress,
          completed_letters: [...new Set([...currentProgress.completed_letters, selectedLetterState])],
          letter_photos: {
            ...currentProgress.letter_photos,
            [selectedLetterState]: [...(currentProgress.letter_photos?.[selectedLetterState] || []), file_url]
          }
        };

        await User.updateMyUserData({
          hand_tracing_progress: updatedProgress
        });
      }

      if (onLetterComplete) {
        onLetterComplete(selectedLetterState);
      }

      playSound('complete');
      if (onComplete) onComplete(15, 'hand-sticker');

      setCurrentStep('reflect');
    } catch (error) {
      console.error('Error saving drawing:', error);
      alert('Had trouble saving. Try again!');
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    playSound('complete');
  };

  const handleReset = () => {
    setSelectedLetterState(null);
    setCurrentStep('select');
    setReflection('');
    setIsComplete(false);
    setTraceComplete(false);
    setTraceProgress(0);
    clearCanvas();
    clearTrace(); // Also clear the trace canvas state
  };

  return (
    <div className="relative font-comic-sans p-4 bg-yellow-50 rounded-lg">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">My Helping Hands & Letters</h2>
      
      {currentStep === 'select' && (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-purple-800">My ABC Drawing Fun!</h2>
            </div>
            <p className="text-purple-700 text-lg mb-2">Learn letters by tracing and drawing!</p>
            <p className="text-purple-600">Choose a letter to start your creative journey!</p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-w-6xl mx-auto">
            {Object.keys(letterActivities).map((letter) => (
              <motion.button
                key={letter}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLetterSelect(letter)}
                className="aspect-square rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-3 bg-white border-2 border-purple-200 hover:border-purple-400"
                style={{ backgroundColor: `${letterActivities[letter].color}20` }}
              >
                <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: letterActivities[letter].color }}>
                  {letter}
                </div>
                <div className="text-2xl">{letterActivities[letter].emoji}</div>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Card className="inline-block bg-white/80 border-purple-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2 justify-center">
                  <Sparkles className="w-5 h-5" />
                  What You'll Do:
                </h3>
                <div className="text-left space-y-2 text-sm text-purple-700">
                  <div className="flex items-center gap-2">
                    <Hand className="w-4 h-4" />
                    <span>Trace the letter with your finger!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>Draw the letter in big, colorful bubble letters!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Draw a picture that starts with that letter!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>Think about how your hands help others!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentStep === 'trace' && (
        (() => {
          const activity = letterActivities[selectedLetterState];
          return (
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl w-full h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <Button onClick={handleReset} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Choose Different Letter
                </Button>
                <Badge className="text-lg px-4 py-2" style={{ backgroundColor: activity.color, color: 'white' }}>
                  Letter {selectedLetterState} - Trace It!
                </Badge>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hand className="w-6 h-6 text-purple-600" />
                        Trace the Letter {selectedLetterState}
                      </div>
                      <Button
                        onClick={clearTrace}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Try Again
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-gray-700 text-lg">
                        Follow the dotted line with your finger or mouse!
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${traceProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Tracing Canvas */}
                    <div className="relative bg-white rounded-lg border-4 border-purple-300 overflow-hidden" style={{ height: '400px' }}>
                      <canvas
                        ref={traceCanvasRef}
                        className="absolute inset-0 w-full h-full cursor-pointer"
                        style={{ touchAction: 'none' }}
                        onMouseDown={startTracing}
                        onMouseMove={trace}
                        onMouseUp={stopTracing}
                        onMouseLeave={stopTracing}
                        onTouchStart={startTracing}
                        onTouchMove={trace}
                        onTouchEnd={stopTracing}
                      />
                    </div>

                    {traceComplete && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-4"
                      >
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                        <h3 className="text-2xl font-bold text-green-700 mb-4">Great Job Tracing!</h3>
                        <Button
                          onClick={moveToDrawing}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          size="lg"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Now Let's Draw!
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          );
        })()
      )}

      {currentStep === 'draw' && (
        (() => {
          const activity = letterActivities[selectedLetterState];
          return (
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl w-full h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <Button onClick={() => setCurrentStep('trace')} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tracing
                </Button>
                <Badge className="text-lg px-4 py-2" style={{ backgroundColor: activity.color, color: 'white' }}>
                  Letter {selectedLetterState} - {activity.word}
                </Badge>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Left Side - Instructions */}
                <Card className="bg-white/80">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-8xl mb-4">{activity.emoji}</div>
                      <h3 className="text-4xl font-bold mb-2" style={{ color: activity.color }}>
                        {selectedLetterState} - {selectedLetterState.toLowerCase()}
                      </h3>
                      <p className="text-2xl font-semibold text-gray-700 mb-2">{activity.word}</p>
                      <p className="text-gray-600">{activity.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Draw the Letter
                        </h4>
                        <p className="text-sm text-blue-700">
                          Draw a big bubble letter {selectedLetterState} on your canvas. Make it colorful and fun!
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                          <Palette className="w-5 h-5" />
                          Draw {activity.word}
                        </h4>
                        <p className="text-sm text-green-700">
                          {activity.description}
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Tips
                        </h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Use different colors!</li>
                          <li>• Make your letter BIG</li>
                          <li>• Draw {activity.word} next to it</li>
                          <li>• Have fun!</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Side - Canvas */}
                <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-600" />
                        Draw Here!
                      </CardTitle>
                      <Button
                        onClick={clearCanvas}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Color Picker */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Palette className="w-5 h-5 text-gray-600" />
                      <div className="flex gap-2 flex-wrap">
                        {colorPalette.map((colorItem) => (
                          <button
                            key={colorItem.color}
                            onClick={() => {
                              setSelectedColor(colorItem.color);
                              playSound('click');
                            }}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              selectedColor === colorItem.color ? 'border-purple-600 scale-110 ring-2 ring-purple-300' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: colorItem.color }}
                            title={colorItem.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Brush Size */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Brush Size: {brushSize}px
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Canvas */}
                    <div className="relative bg-white rounded-lg border-2 border-purple-300 overflow-hidden" style={{ height: '400px' }}>
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                        style={{ touchAction: 'none' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-yellow-800 font-medium">
                        💡 Draw both the letter {selectedLetterState} AND {activity.word} on the canvas!
                      </p>
                    </div>

                    <Button
                      onClick={saveDrawing}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Save & Continue
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          );
        })()
      )}

      {currentStep === 'reflect' && (
        (() => {
          const activity = letterActivities[selectedLetterState];
          return (
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl max-w-2xl mx-auto">
              <AnimatePresence>
                {!isComplete ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-white/90">
                      <CardContent className="p-8">
                        <div className="text-center mb-8">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-3xl font-bold text-purple-800 mb-2">
                            💭 Reflection Time!
                          </h3>
                          <p className="text-purple-600">
                            Think about all the wonderful things your hands can do!
                          </p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-xl mb-6">
                          <p className="text-lg font-semibold text-purple-800 mb-4 text-center">
                            "My hands can help with..."
                          </p>
                          <Textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="Write about how your hands help...

Examples:
• My hands can help with hugging my family
• My hands can help with making art
• My hands can help with cleaning up
• My hands can help with playing with friends"
                            className="min-h-[200px] text-lg"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => setCurrentStep('draw')}
                            variant="outline"
                            className="flex-1"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Drawing
                          </Button>
                          <Button
                            onClick={handleComplete}
                            disabled={!reflection.trim()}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            Complete Activity!
                            <CheckCircle className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-300">
                      <CardContent className="p-8">
                        <div className="flex justify-center gap-2 mb-6">
                          <Star className="w-12 h-12 text-yellow-500 animate-bounce" />
                          <CheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
                          <Star className="w-12 h-12 text-yellow-500 animate-bounce" style={{animationDelay: '0.2s'}} />
                        </div>
                        <h3 className="text-3xl font-bold text-orange-800 mb-4">
                          🎉 Amazing Work! 🎉
                        </h3>
                        <p className="text-orange-700 text-lg mb-3">
                          You completed Letter {selectedLetterState} - {activity.word}!
                        </p>
                        <div className="bg-white/80 p-4 rounded-lg mb-6">
                          <p className="text-gray-700 font-medium mb-2">Your reflection:</p>
                          <p className="text-gray-600 italic">"{reflection}"</p>
                        </div>
                        <div className="flex gap-4 justify-center">
                          <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                            +15 Points Earned!
                          </Badge>
                          <Badge className="bg-purple-500 text-white text-lg px-4 py-2">
                            +1 Sticker!
                          </Badge>
                        </div>
                        <Button
                          onClick={handleReset}
                          className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-6"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Try Another Letter!
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()
      )}
    </div>
  );
}
