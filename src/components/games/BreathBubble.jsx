import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, Repeat } from 'lucide-react';

const BreathBubble = ({ duration = 180, onComplete }) => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [text, setText] = useState("Get Ready");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [cycle, setCycle] = useState(0); // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold

  const cycleDuration = 4000;

  useEffect(() => {
    let cycleInterval;
    let timerInterval;

    if (isBreathing && timeLeft > 0) {
      // Start main timer
      timerInterval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      // Start breathing cycle
      setText("Inhale");
      setCycle(0);
      cycleInterval = setInterval(() => {
        setCycle(prevCycle => {
          const nextCycle = (prevCycle + 1) % 4;
          switch (nextCycle) {
            case 0: setText("Inhale"); break;
            case 1: setText("Hold"); break;
            case 2: setText("Exhale"); break;
            case 3: setText("Hold"); break;
          }
          return nextCycle;
        });
      }, cycleDuration);

    } else if (timeLeft <= 0) {
      setIsBreathing(false);
      onComplete();
    }

    return () => {
      clearInterval(cycleInterval);
      clearInterval(timerInterval);
    };
  }, [isBreathing, timeLeft, onComplete]);

  const bubbleVariants = {
    initial: { scale: 1 },
    inhale: { scale: 1.5, transition: { duration: cycleDuration / 1000, ease: 'easeInOut' } },
    hold: { scale: 1.5, transition: { duration: cycleDuration / 1000, ease: 'easeInOut' } },
    exhale: { scale: 1, transition: { duration: cycleDuration / 1000, ease: 'easeInOut' } },
    hold_after: { scale: 1, transition: { duration: cycleDuration / 1000, ease: 'easeInOut' } },
  };

  const getCurrentVariant = () => {
    if (!isBreathing) return "initial";
    switch (cycle) {
      case 0: return "inhale";
      case 1: return "hold";
      case 2: return "exhale";
      case 3: return "hold_after";
      default: return "initial";
    }
  };
  
  const resetGame = () => {
    setIsBreathing(false);
    setTimeLeft(duration);
    setText("Get Ready");
    setCycle(0);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg">
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <motion.div
          className="absolute w-48 h-48 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-50"
          animate={getCurrentVariant()}
          variants={bubbleVariants}
        />
        <motion.div
          className="absolute w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-70"
          animate={getCurrentVariant()}
          variants={bubbleVariants}
          transition={{ delay: 0.1 }}
        />
        <div className="relative z-10 text-3xl font-bold text-white text-center">
          <div>{text}</div>
          <div className="text-lg mt-2 font-mono">
            {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setIsBreathing(!isBreathing)} size="lg">
          {isBreathing ? <><Pause className="w-5 h-5 mr-2" /> Pause</> : <><Play className="w-5 h-5 mr-2" /> Start</>}
        </Button>
        <Button onClick={resetGame} variant="outline" size="lg">
          <Repeat className="w-5 h-5 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
};

export default BreathBubble;