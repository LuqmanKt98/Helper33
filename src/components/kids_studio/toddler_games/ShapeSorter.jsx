import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star, RefreshCcw, Sparkles } from 'lucide-react';
import { useNotifications as useSounds } from '../../SoundManager';

const shapes = [
  { name: 'Circle', emoji: '⭕', color: '#ef4444' },
  { name: 'Square', emoji: '🟦', color: '#3b82f6' },
  { name: 'Triangle', emoji: '🔺', color: '#22c55e' },
  { name: 'Star', emoji: '⭐', color: '#eab308' }
];

export default function ShapeSorter({ onComplete }) {
  const [currentShape, setCurrentShape] = useState(shapes[0]);
  const [sortedShapes, setSortedShapes] = useState([]);
  const [draggedShape, setDraggedShape] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { playSound } = useSounds();

  const handleShapeClick = (clickedShape) => {
    if (clickedShape.name === currentShape.name) {
      playSound('success');
      setSortedShapes(prev => [...prev, clickedShape]);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        // Move to next shape
        const nextIndex = (shapes.findIndex(s => s.name === currentShape.name) + 1) % shapes.length;
        setCurrentShape(shapes[nextIndex]);
      }, 1500);

      if (sortedShapes.length + 1 >= 8) { // Complete after 8 correct sorts
        onComplete(12, 'shape-sticker');
      }
    } else {
      playSound('error');
    }
  };

  const resetGame = () => {
    setSortedShapes([]);
    setCurrentShape(shapes[0]);
    setShowSuccess(false);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
      <h3 className="text-3xl font-bold text-orange-800 mb-4">🔴 Shape Sorter! 🔵</h3>
      
      {/* Target Shape */}
      <div className="mb-8 text-center">
        <div className="text-2xl font-bold text-gray-800 mb-4">Find the:</div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 rounded-2xl border-8 border-white shadow-lg flex items-center justify-center bg-white"
        >
          <div className="text-6xl" style={{ color: currentShape.color }}>
            {currentShape.emoji}
          </div>
        </motion.div>
        <div className="text-3xl font-bold mt-4" style={{ color: currentShape.color }}>
          {currentShape.name}
        </div>
      </div>

      {/* Shape Options */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {shapes.map((shape) => (
          <motion.button
            key={shape.name}
            onClick={() => handleShapeClick(shape)}
            className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center bg-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              borderColor: shape.name === currentShape.name ? '#fbbf24' : '#ffffff'
            }}
          >
            <div className="text-5xl" style={{ color: shape.color }}>
              {shape.emoji}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Score */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: sortedShapes.length }, (_, i) => (
            <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
          ))}
        </div>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl"
          >
            <div className="text-center">
              <Sparkles className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold text-green-600">Perfect! 🎉</h2>
              <p className="text-2xl text-gray-700">You found the {currentShape.name}!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}