import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';

export default function BellyBreathing() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState('inhale');
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);

      // Breathing cycle: 4 seconds inhale, 2 hold, 6 exhale, 2 hold
      const phaseTimer = setInterval(() => {
        setPhase(current => {
          if (current === 'inhale') return 'hold1';
          if (current === 'hold1') return 'exhale';
          if (current === 'exhale') return 'hold2';
          return 'inhale';
        });
      }, phase === 'inhale' ? 4000 : phase === 'hold1' ? 2000 : phase === 'exhale' ? 6000 : 2000);

      return () => {
        clearInterval(timerRef.current);
        clearInterval(phaseTimer);
      };
    } else {
      clearInterval(timerRef.current);
    }
  }, [isPlaying, phase]);

  const getPhaseText = () => {
    switch(phase) {
      case 'inhale': return 'Breathe In Deeply';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out Slowly';
      case 'hold2': return 'Hold';
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
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8 relative">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Ambient glow effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      />

      <Card className="w-full max-w-2xl bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-orange-100/90 border-2 border-orange-200/50 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-amber-200/20 pointer-events-none"
          animate={{
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <CardContent className="p-12 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center bg-gradient-to-r from-orange-800 to-amber-800 bg-clip-text text-transparent mb-2"
          >
            Belly Breathing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-orange-700/90 mb-12 text-lg"
          >
            Diaphragmatic breathing for deep relaxation
          </motion.p>

          {/* Enhanced Breathing Circle */}
          <div className="flex justify-center mb-12 relative">
            {/* Outer glow rings */}
            <motion.div
              className="absolute w-80 h-80 rounded-full border-2 border-orange-300/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{
                duration: phase === 'inhale' ? 4 : phase === 'hold1' ? 2 : phase === 'exhale' ? 6 : 2,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
            <motion.div
              className="absolute w-72 h-72 rounded-full border-2 border-amber-300/30"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{
                duration: phase === 'inhale' ? 4 : phase === 'hold1' ? 2 : phase === 'exhale' ? 6 : 2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.3
              }}
            />

            {/* Main breathing circle */}
            <motion.div
              className="relative w-64 h-64 rounded-full bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 flex items-center justify-center shadow-2xl"
              animate={{
                scale: getCircleScale(),
                boxShadow: phase === 'inhale' 
                  ? '0 0 60px rgba(251, 146, 60, 0.6), 0 0 120px rgba(251, 146, 60, 0.3)'
                  : '0 0 40px rgba(251, 146, 60, 0.4), 0 0 80px rgba(251, 146, 60, 0.2)'
              }}
              transition={{
                duration: phase === 'inhale' ? 4 : phase === 'hold1' ? 2 : phase === 'exhale' ? 6 : 2,
                ease: "easeInOut"
              }}
            >
              {/* Inner glow */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="text-center text-white relative z-10">
                <motion.div 
                  className="text-6xl font-bold mb-3 drop-shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {formatTime(seconds)}
                </motion.div>
                <motion.p
                  className="text-2xl font-semibold drop-shadow-md"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getPhaseText()}
                </motion.p>
              </div>

              {/* Sparkle effects */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 45}%`,
                    top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 45}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Instructions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-orange-200/50 shadow-lg"
          >
            <h3 className="font-bold text-orange-900 mb-4 text-lg">How to Practice:</h3>
            <ul className="space-y-3 text-gray-700">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-2"
              >
                <span className="text-orange-500 font-bold">•</span>
                <span>Place one hand on your chest, one on your belly</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-2"
              >
                <span className="text-orange-500 font-bold">•</span>
                <span>Breathe in through your nose (4 seconds) - belly should rise</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-start gap-2"
              >
                <span className="text-orange-500 font-bold">•</span>
                <span>Hold for 2 seconds</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-2"
              >
                <span className="text-orange-500 font-bold">•</span>
                <span>Breathe out slowly through your mouth (6 seconds)</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-start gap-2"
              >
                <span className="text-orange-500 font-bold">•</span>
                <span>Repeat for 5-10 minutes</span>
              </motion.li>
            </ul>
          </motion.div>

          {/* Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex gap-4"
          >
            {isPlaying ? (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1"
              >
                <Button 
                  onClick={() => setIsPlaying(false)} 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 shadow-xl text-lg py-6"
                >
                  <PauseCircle className="w-6 h-6 mr-2" />
                  Pause
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1"
              >
                <Button 
                  onClick={() => setIsPlaying(true)} 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 shadow-xl text-lg py-6"
                >
                  <PlayCircle className="w-6 h-6 mr-2" />
                  {seconds > 0 ? 'Resume' : 'Start'}
                </Button>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => { setSeconds(0); setPhase('inhale'); setIsPlaying(false); }} 
                variant="outline" 
                size="lg"
                className="bg-white/70 backdrop-blur-sm border-orange-300 hover:bg-orange-50 py-6 px-6"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}