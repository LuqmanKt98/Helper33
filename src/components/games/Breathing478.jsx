import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';

export default function Breathing478() {
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
          
          if (phase === 'inhale' && newTime >= 4) {
            setPhase('hold');
            return 0;
          } else if (phase === 'hold' && newTime >= 7) {
            setPhase('exhale');
            return 0;
          } else if (phase === 'exhale' && newTime >= 8) {
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

  const getPhaseText = () => {
    switch(phase) {
      case 'inhale': return 'Breathe In (4s)';
      case 'hold': return 'Hold (7s)';
      case 'exhale': return 'Breathe Out (8s)';
      default: return 'Ready';
    }
  };

  const getCircleScale = () => {
    if (phase === 'inhale') return 1.4;
    if (phase === 'exhale') return 1;
    return 1.2;
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-2xl">
        <CardContent className="p-12">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-2">4-7-8 Breathing</h2>
          <p className="text-center text-blue-700 mb-8">
            Dr. Weil's relaxation technique - Natural tranquilizer for the nervous system
          </p>

          {/* Breathing Circle */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl"
              animate={{
                scale: getCircleScale()
              }}
              transition={{
                duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8,
                ease: "easeInOut"
              }}
            >
              <div className="text-center text-white">
                <div className="text-5xl font-bold mb-3">
                  {formatTime(seconds)}
                </div>
                <motion.p
                  className="text-2xl font-semibold"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getPhaseText()}
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Instructions */}
          <div className="bg-white/80 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-3">How to Practice:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>• Exhale completely through your mouth</li>
              <li>• Close your mouth, inhale through nose for 4 seconds</li>
              <li>• Hold your breath for 7 seconds</li>
              <li>• Exhale completely through mouth for 8 seconds</li>
              <li>• Repeat for at least 4 cycles (about 2 minutes)</li>
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
              <Button onClick={() => setIsPlaying(true)} size="lg" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600">
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