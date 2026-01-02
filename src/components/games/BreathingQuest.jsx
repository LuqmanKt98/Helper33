
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, Repeat, CheckCircle } from "lucide-react";

const BreathingQuest = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [cycle, setCycle] = useState(0); // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold
  const [text, setText] = useState("Get Ready");
  const [completedCycles, setCompletedCycles] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const cycleDuration = 4000; // 4 seconds per cycle part

  useEffect(() => {
    let interval;
    if (isBreathing) {
      setText("Inhale");
      setCycle(0); // Ensure cycle starts from 0 when breathing starts
      interval = setInterval(() => {
        setCycle((prevCycle) => {
          const nextCycle = (prevCycle + 1) % 4;
          
          // Track completed full cycles
          // A full cycle is completed when we transition back to 'Inhale' (nextCycle becomes 0)
          if (nextCycle === 0) {
            setCompletedCycles(prev => prev + 1);
          }
          
          switch (nextCycle) {
            case 0:
              setText("Inhale");
              break;
            case 1:
              setText("Hold");
              break;
            case 2:
              setText("Exhale");
              break;
            case 3:
              setText("Hold");
              break;
            default: // Should not happen but good for robustness
              setText("Get Ready");
              break;
          }
          return nextCycle;
        });
      }, cycleDuration);
    } else {
      // Only set text if not showing completion
      if (!showCompletion) {
        setText("Press Start to Begin");
      }
      setCycle(0);
    }
    return () => clearInterval(interval);
  }, [isBreathing, showCompletion]); // Added showCompletion to dependencies to prevent text reset if completion is shown

  const handleStop = async () => {
    setIsBreathing(false);
    
    if (completedCycles >= 3) {
      setShowCompletion(true);
      
      // Update streak
      try {
        const { base44 } = await import('@/api/base44Client');
        const response = await base44.functions.invoke('updateMindfulStreak', {
          item_key: 'box_breathing',
          item_type: 'exercise',
          duration_seconds: completedCycles * 16 // 4 phases * 4 seconds per phase = 16 seconds per full cycle
        });

        console.log('Streak updated:', response.data);
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    }
  };

  const handleReset = () => {
    setIsBreathing(false);
    setCycle(0);
    setCompletedCycles(0);
    setShowCompletion(false);
    setText("Get Ready"); // Reset text when manually resetting
  };

  const circleVariants = {
    initial: { scale: 1 }, // Default initial state
    inhale: { scale: 1.5, transition: { duration: cycleDuration / 1000 } },
    hold: { scale: 1.5, transition: { duration: cycleDuration / 1000 } },
    exhale: { scale: 1, transition: { duration: cycleDuration / 1000 } },
    hold_after_exhale: { scale: 1, transition: { duration: cycleDuration / 1000 } },
  };

  const getCurrentVariant = () => {
    if (!isBreathing) return "initial";
    switch (cycle) {
      case 0: return "inhale";
      case 1: return "hold";
      case 2: return "exhale";
      case 3: return "hold_after_exhale";
      default: return "initial";
    }
  };

  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[400px]"> {/* Added min-h to prevent layout shift */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Great Work!</h3>
          <p className="text-gray-600 mb-4">
            You completed {completedCycles} breathing cycles
          </p>
          <Button onClick={handleReset}>
            <Repeat className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        <motion.div
          className="absolute w-full h-full bg-cyan-100 rounded-full"
          animate={getCurrentVariant()}
          variants={circleVariants}
        />
        <motion.div
          className="absolute w-32 h-32 bg-cyan-200 rounded-full"
          animate={getCurrentVariant()}
          variants={circleVariants}
        />
        <div className="relative z-10 text-center">
          <div className="text-2xl font-semibold text-cyan-800">{text}</div>
          {isBreathing && (
            <div className="text-sm text-cyan-600 mt-2">Cycle {completedCycles + 1}</div>
          )}
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-700">Follow the guide to practice box breathing.</h3>
        <p className="text-sm text-gray-500">Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.</p>
      </div>

      <div className="flex gap-4">
        {!isBreathing ? (
          <Button onClick={() => setIsBreathing(true)} size="lg">
            <Play className="w-5 h-5 mr-2" /> Start
          </Button>
        ) : (
          <Button onClick={handleStop} size="lg" variant="outline">
            <Pause className="w-5 h-5 mr-2" /> Complete
          </Button>
        )}
        <Button onClick={handleReset} variant="outline" size="lg">
          <Repeat className="w-5 h-5 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
};

export default BreathingQuest;
