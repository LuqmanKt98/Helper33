import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Repeat, Timer } from "lucide-react";
import { useNotifications } from "../SoundManager";

const colors = [
  "from-pink-400 to-rose-500",
  "from-blue-400 to-cyan-500",
  "from-purple-400 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-yellow-400 to-orange-500",
  "from-red-400 to-pink-500"
];

const FidgetBubbles = ({ onComplete }) => {
  const { playSound, soundEnabled, isInitialized } = useNotifications();
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, onComplete]);

  const createBubble = useCallback(() => {
    const newBubble = {
      id: nextId,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      size: Math.random() * 40 + 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      lifetime: 3000 + Math.random() * 2000
    };

    setBubbles(prev => [...prev, newBubble]);
    setNextId(prev => prev + 1);

    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, newBubble.lifetime);
  }, [nextId]);

  useEffect(() => {
    let bubbleGenerator;
    if (isPlaying) {
      bubbleGenerator = setInterval(() => {
        createBubble();
      }, 800);
    }
    return () => clearInterval(bubbleGenerator);
  }, [isPlaying, createBubble]);

  const popBubble = (bubbleId) => {
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    setScore(prev => prev + 1);
    
    // CRITICAL: Only play sound if initialized AND enabled
    if (isInitialized && soundEnabled) {
      console.log("Playing pop sound - sound is enabled");
      playSound('pop');
    } else {
      console.log("Skipping pop sound - sound disabled or not initialized", { isInitialized, soundEnabled });
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
    setNextId(0);
  };

  return (
    <div className="flex flex-col items-center p-6">
      {!isPlaying && timeLeft === 60 ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Fidget Bubbles</h3>
          <p className="text-gray-600 mb-6">Pop bubbles to relax and focus your mind</p>
          <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500">
            Start Popping
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-4">
            <Badge className="bg-pink-100 text-pink-800 text-lg px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Popped: {score}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
              <Timer className="w-4 h-4 mr-2" />
              Time: {timeLeft}s
            </Badge>
          </div>

          <div className="relative w-full max-w-lg h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100 overflow-hidden">
            <AnimatePresence>
              {bubbles.map((bubble) => (
                <motion.button
                  key={bubble.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 1.2 }}
                  onClick={() => popBubble(bubble.id)}
                  className={`absolute rounded-full bg-gradient-to-br ${bubble.color} shadow-lg border-2 border-white hover:scale-110 transition-transform`}
                  style={{
                    left: bubble.x,
                    top: bubble.y,
                    width: bubble.size,
                    height: bubble.size,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full rounded-full bg-gradient-to-br from-white/30 to-transparent"
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {!isPlaying && timeLeft === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-6"
            >
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Relaxing Session Complete!</h3>
              <p className="text-gray-600 mb-4">You popped {score} bubbles</p>
              <Button onClick={startGame} variant="outline">
                <Repeat className="w-4 h-4 mr-2" />
                Pop More Bubbles
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default FidgetBubbles;