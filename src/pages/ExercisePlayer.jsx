import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import BellyBreathing from '@/components/games/BellyBreathing';
import BreathBubble from '@/components/games/BreathBubble';
import Breathing478 from '@/components/games/Breathing478';
import CoherentBreathing from '@/components/games/CoherentBreathing';
import EnergyFlowChallenge from '@/components/games/EnergyFlowChallenge';

export default function ExercisePlayer() {
  const navigate = useNavigate();
  const [gameKey, setGameKey] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setGameKey(urlParams.get('game_key') || '');
  }, []);

  const renderGame = () => {
    switch(gameKey) {
      case 'belly_breathing':
        return <BellyBreathing />;
      case 'qigong':
        return <EnergyFlowChallenge />;
      case 'breath_bubble':
      case 'box_breathing':
        return <BreathBubble />;
      case '478_breathing':
        return <Breathing478 />;
      case 'coherent_breathing':
        return <CoherentBreathing />;
      default:
        return (
          <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exercise Not Found</h2>
            <p className="text-gray-600 mb-6">The requested exercise could not be loaded.</p>
            <Button onClick={() => navigate(createPageUrl('MindfulnessHub'))}>
              Return to Mindfulness Hub
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-cyan-300/40 to-blue-300/40 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -50, 0],
          y: [0, -40, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Ambient waves */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute bottom-0 left-0 right-0 h-32 opacity-10"
          style={{
            background: `linear-gradient(180deg, transparent, ${i === 0 ? '#06b6d4' : i === 1 ? '#3b82f6' : '#8b5cf6'})`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10 p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl('MindfulnessHub'))}
              className="bg-white/80 backdrop-blur-md border-2 border-cyan-200 hover:bg-white/90 hover:border-cyan-300 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Mindfulness Hub
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderGame()}
        </motion.div>
      </div>
    </div>
  );
}