import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, PauseCircle, RotateCcw, Sparkles } from 'lucide-react';

const QIGONG_POSES = [
  { name: 'Mountain Stance', description: 'Stand tall, feet shoulder-width, arms at sides', duration: 30 },
  { name: 'Lifting the Sky', description: 'Raise arms overhead, palms up, breathe in deeply', duration: 20 },
  { name: 'Pushing Mountains', description: 'Push palms forward, engage core, exhale slowly', duration: 20 },
  { name: 'Drawing the Bow', description: 'Pull back like drawing a bow, alternate sides', duration: 30 },
  { name: 'Separating Clouds', description: 'Arms sweep out and up, opening the chest', duration: 20 },
  { name: 'Rolling Arms', description: 'Circle arms forward and back, flowing motion', duration: 30 },
  { name: 'Closing Form', description: 'Return to center, palms together, deep breath', duration: 20 }
];

export default function EnergyFlowChallenge() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [poseTimer, setPoseTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTotalTime(prev => prev + 1);
      setPoseTimer(prev => {
        const newTime = prev + 1;
        if (newTime >= QIGONG_POSES[currentPoseIndex].duration) {
          if (currentPoseIndex < QIGONG_POSES.length - 1) {
            setCurrentPoseIndex(prev => prev + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return prev;
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentPoseIndex]);

  const currentPose = QIGONG_POSES[currentPoseIndex];
  const progress = (poseTimer / currentPose.duration) * 100;

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPoseIndex(0);
    setPoseTimer(0);
    setTotalTime(0);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
      <Card className="w-full max-w-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-2xl">
        <CardContent className="p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-emerald-900 mb-2">Energy Flow (Qigong)</h2>
            <p className="text-emerald-700">
              Ancient practice combining breath, movement, and mindfulness to circulate energy
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {QIGONG_POSES.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full ${
                  idx < currentPoseIndex ? 'bg-emerald-500' : 
                  idx === currentPoseIndex ? 'bg-emerald-400' : 
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Current Pose Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPoseIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center mb-8"
            >
              <div className="relative mb-6">
                <motion.div
                  className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-20 h-20 text-white" />
                </motion.div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {currentPose.duration - poseTimer}s
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-emerald-900 mb-3">
                {currentPose.name}
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                {currentPose.description}
              </p>
              <p className="text-sm text-emerald-600 font-semibold">
                Pose {currentPoseIndex + 1} of {QIGONG_POSES.length}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Session Timer */}
          <p className="text-center text-gray-600 mb-6">
            Total Session Time: <span className="font-bold text-emerald-600">{formatTime(totalTime)}</span>
          </p>

          {/* Controls */}
          <div className="flex gap-3">
            {isPlaying ? (
              <Button onClick={() => setIsPlaying(false)} size="lg" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500">
                <PauseCircle className="w-5 h-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button onClick={() => setIsPlaying(true)} size="lg" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600">
                <PlayCircle className="w-5 h-5 mr-2" />
                {totalTime > 0 ? 'Resume' : 'Start Practice'}
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}