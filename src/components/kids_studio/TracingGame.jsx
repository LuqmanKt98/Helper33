import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Sparkles, Wand2, Loader2, ArrowLeft, Star } from 'lucide-react';
import { useNotifications as useSounds } from '../SoundManager';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const tracingActivities = {
  "Animals": [
    { name: '🐱 Cat', path: 'M 50,80 Q 30,60 50,40 Q 70,60 90,80 Q 120,70 140,90 Q 120,110 90,100 Q 70,120 50,100 Q 30,110 10,90 Q 30,70 50,80' },
    { name: '🐶 Dog', path: 'M 40,120 Q 20,100 40,80 Q 60,100 80,120 Q 100,110 120,130 Q 100,150 80,140 Q 60,160 40,140 Q 20,150 0,130 Q 20,110 40,120' },
    { name: '🦋 Butterfly', path: 'M 100,50 Q 80,30 60,50 Q 80,70 100,50 Q 120,30 140,50 Q 120,70 100,50 M 100,50 Q 80,90 60,110 Q 80,130 100,110 Q 120,130 140,110 Q 120,90 100,90' },
    { name: '🐠 Fish', path: 'M 150,100 Q 130,80 100,90 Q 70,80 50,100 Q 70,120 100,110 Q 130,120 150,100 M 50,100 L 30,90 L 30,110 Z' },
    { name: '🦆 Duck', path: 'M 60,80 Q 40,60 60,40 Q 80,60 100,80 Q 120,70 140,90 Q 120,110 100,100 Q 80,120 60,100 Q 50,110 40,90 Q 50,70 60,80' }
  ],
  "Fruits": [
    { name: '🍎 Apple', path: 'M 100,40 Q 80,20 60,40 Q 40,60 60,100 Q 80,140 100,140 Q 120,140 140,100 Q 160,60 140,40 Q 120,20 100,40 M 100,20 L 100,40' },
    { name: '🍌 Banana', path: 'M 80,40 Q 60,60 70,100 Q 80,140 100,150 Q 120,140 130,100 Q 140,60 120,40 Q 100,30 80,40' },
    { name: '🍊 Orange', path: 'M 100,40 a 40,40 0 1,1 0,80 a 40,40 0 1,1 0,-80' },
    { name: '🍇 Grapes', path: 'M 100,40 a 15,15 0 1,1 0,30 a 15,15 0 1,1 0,-30 M 85,70 a 15,15 0 1,1 0,30 a 15,15 0 1,1 0,-30 M 115,70 a 15,15 0 1,1 0,30 a 15,15 0 1,1 0,-30' },
    { name: '🍓 Strawberry', path: 'M 100,40 Q 80,30 70,50 Q 60,80 80,120 Q 90,140 100,140 Q 110,140 120,120 Q 140,80 130,50 Q 120,30 100,40' }
  ],
  "Letters": [
    { name: '✨ Letter A', path: 'M 70,150 L 100,50 L 130,150 M 80,120 L 120,120' },
    { name: '✨ Letter B', path: 'M 70,50 L 70,150 M 70,50 L 110,50 C 125,50 130,65 120,75 C 130,85 125,100 110,100 L 70,100 M 70,100 L 115,100 C 130,100 135,115 125,125 C 135,135 130,150 115,150 L 70,150' },
    { name: '✨ Letter C', path: 'M 130,70 C 120,50 80,50 70,70 L 70,130 C 80,150 120,150 130,130' },
    { name: '✨ Letter D', path: 'M 70,50 L 70,150 M 70,50 L 110,50 C 140,50 140,150 110,150 L 70,150' },
    { name: '✨ Letter O', path: 'M 70,100 a 30,50 0 1,1 60,0 a 30,50 0 1,1 -60,0' }
  ],
  "Numbers": [
    { name: '🔢 Number 1', path: 'M 90,50 L 100,50 L 100,150 L 80,150 L 120,150' },
    { name: '🔢 Number 2', path: 'M 70,70 C 70,50 130,50 130,80 C 130,100 70,120 70,150 L 130,150' },
    { name: '🔢 Number 3', path: 'M 70,60 L 120,60 C 135,60 135,85 120,85 L 110,85 C 135,85 135,110 120,110 L 70,110' },
    { name: '🔢 Number 4', path: 'M 90,50 L 90,100 L 130,100 M 110,40 L 110,120' },
    { name: '🔢 Number 5', path: 'M 130,50 L 80,50 L 80,90 L 120,90 C 135,90 135,120 120,120 L 80,120' }
  ],
  "Shapes": [
    { name: '⭐ Star', path: 'M 100,20 L 120,60 L 165,65 L 130,95 L 140,140 L 100,115 L 60,140 L 70,95 L 35,65 L 80,60 Z' },
    { name: '❤️ Heart', path: 'M 100,60 C 100,45 85,40 75,50 C 65,40 50,45 50,60 C 50,75 100,120 100,120 C 100,120 150,75 150,60 C 150,45 135,40 125,50 C 115,40 100,45 100,60 Z' },
    { name: '🔵 Circle', path: 'M 50, 100 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0' },
    { name: '🟩 Square', path: 'M 50,50 L 150,50 L 150,150 L 50,150 Z' },
    { name: '🔺 Triangle', path: 'M 100,50 L 150,150 L 50,150 Z' }
  ],
  "Objects": [
    { name: '🏠 House', path: 'M 15,50 L 85,50 L 50,20 Z M 20,50 L 20,90 L 80,90 L 80,50 M 42,70 L 42,90 M 58,70 L 58,90 M 60,55 L 75,55 L 75,70 L 60,70 Z' },
    { name: '🚗 Car', path: 'M 10,70 L 90,70 L 90,50 L 70,50 L 60,30 L 30,30 L 20,50 L 10,50 Z M 25,70 a 8,8 0 1,1 0,16 a 8,8 0 1,1 0,-16 M 75,70 a 8,8 0 1,1 0,16 a 8,8 0 1,1 0,-16' },
    { name: '☀️ Sun', path: 'M 100,50 a 30,30 0 1,1 0,60 a 30,30 0 1,1 0,-60 M 100,20 L 100,40 M 100,120 L 100,140 M 50,80 L 70,80 M 130,80 L 150,80 M 65,55 L 75,65 M 125,95 L 135,105' },
    { name: '🌙 Moon', path: 'M 120,40 Q 100,60 120,100 Q 140,120 160,100 Q 140,80 140,60 Q 140,40 120,40' },
    { name: '⚽ Ball', path: 'M 100,50 a 40,40 0 1,1 0,80 a 40,40 0 1,1 0,-80 M 70,70 Q 100,60 130,70 M 70,110 Q 100,120 130,110' }
  ],
  "Toddler Fun": [
    { name: '😊 Happy Face', path: 'M 100,100 a 40,40 0 1,1 0,0.1 M 80,80 a 5,5 0 1,1 0,0.1 M 120,80 a 5,5 0 1,1 0,0.1 M 85,115 Q 100,125 115,115' },
    { name: '🏠 Big House', path: 'M 50,100 L 100,50 L 150,100 M 60,100 L 60,140 L 140,140 L 140,100 M 90,120 L 90,140 M 110,120 L 110,140 M 115,110 L 125,110 L 125,120 L 115,120 Z' },
    { name: '🌞 Sunshine', path: 'M 100,70 a 20,20 0 1,1 0,0.1 M 100,40 L 100,60 M 100,120 L 100,140 M 70,100 L 90,100 M 110,100 L 130,100 M 75,65 L 85,75 M 115,75 L 125,65 M 75,135 L 85,125 M 115,125 L 125,135' },
    { name: '🚗 Car', path: 'M 30,100 L 150,100 L 150,80 L 130,80 L 120,60 L 60,60 L 50,80 L 30,80 Z M 50,100 a 10,10 0 1,1 0,0.1 M 130,100 a 10,10 0 1,1 0,0.1 M 70,70 L 90,70 L 90,85 L 70,85 Z M 100,70 L 120,70 L 120,85 L 100,85 Z' }
  ]
};

const CHECKPOINT_DISTANCE = 20;
const COLLECTION_THRESHOLD = 18;
const MIN_COLLECTION_DELAY = 100;
const CONFETTI_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6"];

const SimpleConfetti = () => {
    const confettiPieces = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, 
        y: -10 - Math.random() * 20, 
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        scale: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 2 + 3,
        drift: Math.random() * 40 - 20,
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {confettiPieces.map(piece => (
                <motion.div
                    key={piece.id}
                    className="absolute w-3 h-5 rounded-sm"
                    style={{
                        left: `${piece.x}%`,
                        top: `${piece.y}%`,
                        backgroundColor: piece.color,
                        rotate: piece.rotate,
                        scale: piece.scale,
                    }}
                    animate={{
                        y: [piece.y, 120],
                        x: `calc(${piece.x}% + ${piece.drift}px)`,
                        rotate: piece.rotate + (Math.random() > 0.5 ? 360 : -360),
                        opacity: [1, 1, 0.8, 0],
                    }}
                    transition={{
                        duration: piece.duration,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "loop",
                    }}
                />
            ))}
        </div>
    );
};

export default function TracingGame({ onComplete }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [customDescription, setCustomDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [checkpoints, setCheckpoints] = useState([]);
  const [tracedPath, setTracedPath] = useState('');
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });
  const [smoothedPointerPos, setSmoothedPointerPos] = useState({ x: -100, y: -100 });
  const [inputType, setInputType] = useState('mouse');
  const [lastCollectionTime, setLastCollectionTime] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const { playSound } = useSounds();
  const svgRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const smoothPointer = () => {
      setSmoothedPointerPos(prev => ({
        x: prev.x + (pointerPos.x - prev.x) * 0.3,
        y: prev.y + (pointerPos.y - prev.y) * 0.3
      }));
      animationFrameRef.current = requestAnimationFrame(smoothPointer);
    };

    if (isDrawing) {
      animationFrameRef.current = requestAnimationFrame(smoothPointer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pointerPos, isDrawing]);

  useEffect(() => {
    if (!selectedActivity) return;
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tempPath.setAttribute('d', selectedActivity.path);
    svg.appendChild(tempPath);
    document.body.appendChild(svg);

    const pathLength = tempPath.getTotalLength();
    
    const newCheckpoints = [];
    for (let i = 0; i < pathLength; i += CHECKPOINT_DISTANCE) {
        const point = tempPath.getPointAtLength(i);
        newCheckpoints.push({ x: point.x, y: point.y, collected: false });
    }
    setCheckpoints(newCheckpoints);
    setTracedPath('');
    setIsComplete(false);

    document.body.removeChild(svg);
  }, [selectedActivity]);

  const progress = useMemo(() => {
    if (checkpoints.length === 0) return 0;
    const collectedCount = checkpoints.filter(c => c.collected).length;
    return (collectedCount / checkpoints.length) * 100;
  }, [checkpoints]);

  const handlePointerStart = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    if (e.type === 'touchstart') {
      setInputType('touch');
    } else {
      setInputType('mouse');
    }
  }, []);

  const handlePointerEnd = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(false);
  }, []);

  const handlePointerMove = useCallback((e) => {
    e.preventDefault();
    
    if (isComplete || !svgRef.current) return;
    if (!isDrawing && e.type === 'mousemove') return;

    const svgPoint = svgRef.current.createSVGPoint();
    if (e.touches) {
        if (e.touches.length === 0) return;
        svgPoint.x = e.touches[0].clientX;
        svgPoint.y = e.touches[0].clientY;
    } else {
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
    }

    const transformedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM().inverse());
    setPointerPos({ x: transformedPoint.x, y: transformedPoint.y });

    const now = Date.now();
    if (now - lastCollectionTime < MIN_COLLECTION_DELAY) return;

    const nextCheckpointIndex = checkpoints.findIndex(c => !c.collected);
    if (nextCheckpointIndex === -1) return;

    const nextCheckpoint = checkpoints[nextCheckpointIndex];
    
    const distance = Math.hypot(
      transformedPoint.x - nextCheckpoint.x, 
      transformedPoint.y - nextCheckpoint.y
    );

    const threshold = inputType === 'touch' ? COLLECTION_THRESHOLD + 5 : COLLECTION_THRESHOLD;

    if (distance < threshold) {
      const updatedCheckpoints = [...checkpoints];
      updatedCheckpoints[nextCheckpointIndex].collected = true;
      
      const collectedPoints = updatedCheckpoints.filter(c => c.collected);
      
      let newTracedPath = '';
      if (collectedPoints.length === 1) {
        newTracedPath = `M${collectedPoints[0].x} ${collectedPoints[0].y}`;
      } else if (collectedPoints.length > 1) {
        newTracedPath = `M${collectedPoints[0].x} ${collectedPoints[0].y}`;
        for (let i = 1; i < collectedPoints.length; i++) {
          const curr = collectedPoints[i];
          
          if (i < collectedPoints.length - 1) {
            const next = collectedPoints[i + 1];
            const cpX = curr.x;
            const cpY = curr.y;
            const endX = (curr.x + next.x) / 2;
            const endY = (curr.y + next.y) / 2;
            newTracedPath += ` Q${cpX} ${cpY} ${endX} ${endY}`;
          } else {
            newTracedPath += ` L${curr.x} ${curr.y}`;
          }
        }
      }
      
      setCheckpoints(updatedCheckpoints);
      setTracedPath(newTracedPath);
      setLastCollectionTime(now);
      playSound('pop');

      if (updatedCheckpoints.every(c => c.collected)) {
        setIsComplete(true);
        setIsDrawing(false);
        playSound('complete');
        onComplete(10, 'star-sticker');
      }
    }
  }, [checkpoints, isComplete, playSound, onComplete, lastCollectionTime, inputType, isDrawing]);

  const generateCustomActivity = async () => {
    if (!customDescription.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a simple, single-line SVG path for kids to trace based on this description: "${customDescription}". The path should fit within a 200x200 viewBox. Return ONLY the SVG path data (the 'd' attribute value). Example: "M 100,50 L 150,150 L 50,150 Z"`
      });
      
      setSelectedActivity({
        name: customDescription,
        path: response.trim().replace(/^"|"$/g, '') 
      });
      playSound('success');
    } catch (error) {
      console.error('Failed to generate custom activity:', error);
      alert('Sorry, I had trouble creating that. Try describing it differently!');
      playSound('error');
    }
    setIsGenerating(false);
  };
  
  const resetActivity = () => {
    setSelectedActivity(null);
    setCheckpoints([]);
    setTracedPath('');
    setIsComplete(false);
    setCustomDescription('');
    setIsDrawing(false);
    setLastCollectionTime(0);
    setPointerPos({ x: -100, y: -100 });
    setSmoothedPointerPos({ x: -100, y: -100 });
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    }
  };

  if (selectedActivity) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-sky-100 to-purple-100 rounded-2xl shadow-inner w-full h-full">
        {isComplete && <SimpleConfetti />}
        <div className="w-full flex justify-start mb-4">
            <Button onClick={resetActivity} variant="outline" size="sm" className="bg-white/70 hover:bg-white/90 border-purple-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Activities
            </Button>
        </div>
        <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-purple-800 mb-2">Trace the {selectedActivity.name}!</h3>
            <p className="text-purple-600 text-lg">
              {inputType === 'touch' ? '👆 Touch and follow' : '🖱️ Click and follow'} the sparkly dots to draw the shape!
            </p>
        </div>
        
        <div 
          className="w-full max-w-md aspect-square bg-white rounded-xl shadow-lg border-4 border-purple-200 relative overflow-hidden select-none"
          style={{ 
            touchAction: 'none', 
            WebkitUserSelect: 'none', 
            WebkitTouchCallout: 'none',
            userSelect: 'none'
          }}
          onMouseDown={handlePointerStart}
          onMouseUp={handlePointerEnd}
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerEnd}
          onTouchStart={handlePointerStart}
          onTouchEnd={handlePointerEnd}
          onTouchMove={handlePointerMove}
          onTouchCancel={handlePointerEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          <svg ref={svgRef} viewBox="0 0 200 200" className="w-full h-full absolute inset-0" style={{ touchAction: 'none' }}>
            <path 
              d={selectedActivity.path} 
              stroke="#e0f2fe" 
              strokeWidth="1" 
              strokeDasharray="2 2"
              fill="none" 
            />
            <path
              d={tracedPath}
              stroke="url(#traceGradient)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {checkpoints.map((cp, index) => (
              !cp.collected && (
                <motion.circle
                  key={index}
                  cx={cp.x}
                  cy={cp.y}
                  r="6"
                  fill="url(#sparkleGradient)"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    delay: index * 0.05, 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )
            ))}
            <defs>
              <linearGradient id="traceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
                <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
              </linearGradient>
              <radialGradient id="sparkleGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
              </radialGradient>
            </defs>
          </svg>
          {isDrawing && (
            <Sparkles 
              className="text-yellow-400 absolute pointer-events-none transition-transform duration-75 ease-out drop-shadow-lg" 
              style={{ 
                  width: 32, 
                  height: 32,
                  left: `${smoothedPointerPos.x - 16}px`,
                  top: `${smoothedPointerPos.y - 16}px`
              }}
            />
          )}
        </div>

        <div className="w-64 sm:w-80 bg-gray-200 rounded-full h-6 my-4 overflow-hidden border-2 border-white shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 h-full flex items-center justify-end pr-2"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            {progress > 20 && <Star className="w-4 h-4 text-white" />}
          </motion.div>
        </div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center mt-4 p-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl shadow-xl border-4 border-yellow-300"
            >
              <div className="flex justify-center gap-2 mb-4">
                <Star className="w-12 h-12 text-yellow-500 animate-bounce" />
                <CheckCircle className="w-12 h-12 text-green-500 animate-pulse" />
                <Star className="w-12 h-12 text-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <h4 className="text-3xl font-bold text-orange-800 mb-2">🎉 Amazing Work! 🎉</h4>
              <p className="text-orange-700 text-lg mb-2">You're a tracing superstar!</p>
              <p className="text-orange-600 text-sm">You earned 10 points & a special sticker!</p>
              <Button onClick={resetActivity} className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-3 rounded-full shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Choose Another Fun Activity!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl w-full h-full overflow-y-auto">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-purple-800 mb-4">🎨 What Would You Like to Trace? 🎨</h3>
        <p className="text-purple-700 text-lg">Pick any picture you want to trace and learn!</p>
      </div>
      
      <div className="max-w-lg mx-auto mb-10">
        <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 border-purple-300 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Wand2 className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <h4 className="text-2xl font-bold text-purple-800">✨ Make Your Own! ✨</h4>
                <p className="text-purple-700 text-lg">Tell me anything you want to trace!</p>
              </div>
              <div className="flex gap-2">
                  <Input
                    placeholder="I want to trace a rainbow! or a dinosaur! or my name!"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="flex-grow text-lg border-purple-200 focus:border-purple-400"
                  />
                  <Button 
                    onClick={generateCustomActivity} 
                    disabled={isGenerating || !customDescription.trim()}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-6"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </Button>
              </div>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="Animals" className="w-full">
        <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 sm:grid-cols-6 gap-2 mb-8 bg-white/70 backdrop-blur-sm p-3 rounded-2xl h-auto">
            {Object.keys(tracingActivities).map(category => (
                <TabsTrigger 
                    key={category} 
                    value={category} 
                    className="flex flex-col gap-1 py-4 text-base font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
                >
                    <span className="text-2xl">
                      {category === 'Animals' ? '🦄' : 
                       category === 'Fruits' ? '🍎' : 
                       category === 'Letters' ? '📝' : 
                       category === 'Numbers' ? '🔢' : 
                       category === 'Shapes' ? '⭐' : 
                       category === 'Toddler Fun' ? '👶' : 
                       '🏠'}
                    </span>
                    <span className="text-sm">{category}</span>
                </TabsTrigger>
            ))}
        </TabsList>
        
        {Object.entries(tracingActivities).map(([category, items]) => (
            <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                    {items.map(item => (
                        <motion.div key={item.name} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                            <Card 
                                className="cursor-pointer bg-gradient-to-br from-white to-purple-50 hover:from-purple-100 hover:to-pink-100 transition-all shadow-md hover:shadow-xl rounded-2xl border-2 border-purple-200 hover:border-purple-400 group h-44"
                                onClick={() => setSelectedActivity(item)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-4 h-full">
                                    <div className="w-20 h-20 mb-3 bg-white rounded-xl shadow-inner p-2 border border-purple-100 group-hover:shadow-lg transition-shadow">
                                        <svg viewBox="0 0 200 200" className="w-full h-full">
                                            <path d={item.path} strokeWidth="6" stroke="#8b5cf6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h5 className="text-lg font-bold text-center text-purple-800 group-hover:text-pink-600 transition-colors leading-tight">
                                        {item.name}
                                    </h5>
                                    <div className="flex gap-1 mt-1">
                                        <Star className="w-3 h-3 text-yellow-400" />
                                        <Star className="w-3 h-3 text-yellow-400" />
                                        <Star className="w-3 h-3 text-yellow-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}