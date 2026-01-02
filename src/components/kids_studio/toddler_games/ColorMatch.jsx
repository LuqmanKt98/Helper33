import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, Sparkles, RefreshCcw } from 'lucide-react';
import { useNotifications as useSounds } from '../../SoundManager';

const colors = [
  { name: 'Red', color: '#ef4444', emoji: '🔴' },
  { name: 'Blue', color: '#3b82f6', emoji: '🔵' },
  { name: 'Yellow', color: '#eab308', emoji: '🟡' },
  { name: 'Green', color: '#22c55e', emoji: '🟢' }
];

export default function ColorMatch({ onComplete }) {
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { playSound } = useSounds();

  const handleColorClick = (clickedColor) => {
    if (clickedColor.name === currentColor.name) {
      playSound('success');
      setScore(prev => prev + 1);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        // Move to next color
        const nextIndex = (colors.findIndex(c => c.name === currentColor.name) + 1) % colors.length;
        setCurrentColor(colors[nextIndex]);
      }, 2000);
      
      if (score + 1 >= 8) { // Complete after 8 correct matches
        onComplete(15, 'rainbow-sticker');
      }
    } else {
      playSound('error');
    }
  };

  const resetGame = () => {
    setScore(0);
    setCurrentColor(colors[0]);
    setShowCelebration(false);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
      <h3 className="text-3xl font-bold text-purple-800 mb-4">🌈 Find the Color! 🌈</h3>
      
      {/* Target Color */}
      <div className="mb-8 text-center">
        <div className="text-2xl font-bold text-gray-800 mb-4">Find:</div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-32 h-32 rounded-full border-8 border-white shadow-lg flex items-center justify-center text-6xl"
          style={{ backgroundColor: currentColor.color }}
        >
          {currentColor.emoji}
        </motion.div>
        <div className="text-3xl font-bold mt-4" style={{ color: currentColor.color }}>
          {currentColor.name}
        </div>
      </div>

      {/* Color Options */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {colors.map((color) => (
          <motion.button
            key={color.name}
            onClick={() => handleColorClick(color)}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl"
            style={{ backgroundColor: color.color }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: color.name === currentColor.name 
                ? ['0 0 0 4px #fbbf24', '0 0 0 8px #fbbf24', '0 0 0 4px #fbbf24']
                : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            transition={{ duration: 0.8, repeat: color.name === currentColor.name ? Infinity : 0 }}
          >
            {color.emoji}
          </motion.button>
        ))}
      </div>

      {/* Score and Reset */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: score }, (_, i) => (
            <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
          ))}
        </div>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl"
          >
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold text-green-600">Great Job! 🎉</h2>
              <p className="text-2xl text-gray-700">You found {currentColor.name}!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}