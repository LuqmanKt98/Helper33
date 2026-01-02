import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, PauseCircle, RotateCcw, Heart } from 'lucide-react';

export default function CoherentBreathing() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState('inhale');
  const [phaseTimer, setPhaseTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
        setPhaseTimer(prev => {
          const newTime = prev + 1;
          
          // 6 seconds inhale, 6 seconds exhale (5 breaths per minute)
          if (phase === 'inhale' && newTime >= 6) {
            setPhase('exhale');
            return 0;
          } else if (phase === 'exhale' && newTime >= 6) {
            setPhase('inhale');
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, phase]);

  const getCircleScale = () => {
    return phase === 'inhale' ? 1.4 : 1;
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 shadow-2xl">
        <CardContent className="p-12">
          <h2 className="text-3xl font-bold text-center text-pink-900 mb-2 flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-rose-500" />
            Coherent Breathing
          </h2>
          <p className="text-center text-pink-700 mb-8">
            Heart-brain synchronization with 5-5 breathing
          </p>

          {/* Breathing Circle */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="w-64 h-64 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl relative overflow-hidden"
              animate={{
                scale: getCircleScale()
              }}
              transition={{
                duration: 6,
                ease: "easeInOut"
              }}
            >
              {/* Pulsing heart effect */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              
              <div className="text-center text-white relative z-10">
                <div className="text-5xl font-bold mb-3">
                  {formatTime(seconds)}
                </div>
                <motion.p
                  className="text-2xl font-semibold flex items-center gap-2 justify-center"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {phase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
                  <Heart className="w-6 h-6" />
                </motion.p>
                <p className="text-sm mt-2 opacity-80">
                  {6 - phaseTimer}s remaining
                </p>
              </div>
            </motion.div>
          </div>

          {/* Instructions */}
          <div className="bg-white/80 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-pink-900 mb-3">How to Practice:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Sit comfortably with a straight spine</li>
              <li>• Breathe in slowly for 6 seconds through your nose</li>
              <li>• Breathe out slowly for 6 seconds through your mouth</li>
              <li>• This creates 5 complete breaths per minute</li>
              <li>• Practice for 5-10 minutes for optimal heart-brain coherence</li>
              <li>• Notice your heart rate becoming more steady and calm</li>
            </ul>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {isPlaying ? (
              <Button onClick={() => setIsPlaying(false)} size="lg" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500">
                <PauseCircle className="w-5 h-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button onClick={() => setIsPlaying(true)} size="lg" className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600">
                <PlayCircle className="w-5 h-5 mr-2" />
                {seconds > 0 ? 'Resume' : 'Start'}
              </Button>
            )}
            <Button onClick={() => { setSeconds(0); setPhase('inhale'); setPhaseTimer(0); setIsPlaying(false); }} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}