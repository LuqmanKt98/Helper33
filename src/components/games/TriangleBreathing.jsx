import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, Repeat } from "lucide-react";

const TriangleBreathing = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [cycle, setCycle] = useState(0); // 0: Inhale, 1: Hold, 2: Exhale
  const [text, setText] = useState("Get Ready");

  const cycleDuration = 4000; // 4 seconds per cycle

  useEffect(() => {
    let interval;
    if (isBreathing) {
      setText("Inhale");
      setCycle(0);
      interval = setInterval(() => {
        setCycle((prevCycle) => {
          const nextCycle = (prevCycle + 1) % 3;
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
          }
          return nextCycle;
        });
      }, cycleDuration);
    } else {
      setText("Press Start to Begin");
      setCycle(0);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  // Create triangle path animation
  const triangleVariants = {
    inhale: { 
      pathLength: 0.33,
      transition: { duration: 4, ease: "linear" }
    },
    hold: { 
      pathLength: 0.66,
      transition: { duration: 4, ease: "linear" }
    },
    exhale: { 
      pathLength: 1,
      transition: { duration: 4, ease: "linear" }
    },
  };

  const getCurrentVariant = () => {
    if (!isBreathing) return { pathLength: 0 };
    switch (cycle) {
      case 0: return "inhale";
      case 1: return "hold";
      case 2: return "exhale";
      default: return { pathLength: 0 };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative w-80 h-80 flex items-center justify-center mb-8">
        {/* Triangle SVG */}
        <svg width="300" height="300" className="absolute">
          {/* Background triangle */}
          <path
            d="M 150 50 L 260 220 L 40 220 Z"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Animated triangle */}
          <motion.path
            d="M 150 50 L 260 220 L 40 220 Z"
            stroke="#10b981"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={getCurrentVariant()}
            variants={triangleVariants}
          />
          {/* Breathing dot */}
          <motion.circle
            cx="150"
            cy="50"
            r="12"
            fill="#10b981"
            animate={{
              scale: isBreathing ? (cycle === 0 ? [1, 1.5] : cycle === 1 ? 1.5 : [1.5, 1]) : 1,
              opacity: isBreathing ? [0.7, 1, 0.7] : 1
            }}
            transition={{
              duration: 4,
              repeat: isBreathing ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        <div className="relative z-10 text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-4">{text}</div>
          <div className="text-lg text-gray-600">4 • 4 • 4</div>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Triangle Breathing</h3>
        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
          A simple, balanced breathing pattern perfect for beginners and children. 
          Follow the triangle: inhale up one side, hold across the top, exhale down the other side.
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => setIsBreathing(!isBreathing)} size="lg" className="bg-emerald-500 hover:bg-emerald-600">
          {isBreathing ? (
            <>
              <Pause className="w-5 h-5 mr-2" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" /> Start
            </>
          )}
        </Button>
        <Button 
          onClick={() => { 
            setIsBreathing(false); 
            setCycle(0); 
          }} 
          variant="outline" 
          size="lg"
        >
          <Repeat className="w-5 h-5 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
};

export default TriangleBreathing;