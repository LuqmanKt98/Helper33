import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mic } from 'lucide-react';

// ✨ Sparkle Burst Effect - Correct Answer
export const SparkleBurst = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      // Generate sparkle particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        angle: (i * 360) / 20,
        distance: Math.random() * 150 + 100,
        size: Math.random() * 20 + 10,
        delay: Math.random() * 0.2,
        emoji: ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)]
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Center burst */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1.5, 1], rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="text-6xl absolute"
      >
        🎉
      </motion.div>

      {/* Sparkle particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            scale: [0, 1, 0.8],
            opacity: [1, 1, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: "easeOut"
          }}
          className="absolute"
          style={{ fontSize: particle.size }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Confetti */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: Math.random() * -300 - 100,
            scale: [0, 1, 1],
            opacity: [1, 1, 0],
            rotate: Math.random() * 720
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.3,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 rounded"
          style={{
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'][
              Math.floor(Math.random() * 6)
            ]
          }}
        />
      ))}
    </div>
  );
};

// 💭 Thought Bubble Effect - Narration Hint
export const ThoughtBubble = ({ visible, message, position = 'center', onDismiss }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`fixed z-40 ${
            position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
            position === 'top' ? 'top-20 left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'bottom-20 left-1/2 -translate-x-1/2' :
            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
          }`}
        >
          <div className="relative">
            {/* Main bubble */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-md border-4 border-blue-300"
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <p className="text-gray-800 text-lg leading-relaxed">{message}</p>
              </div>
            </motion.div>

            {/* Small bubbles */}
            <motion.div
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-12 left-8 w-8 h-8 bg-white rounded-full border-4 border-blue-300 shadow-lg"
            />
            <motion.div
              animate={{ scale: [0.6, 0.8, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="absolute -bottom-20 left-4 w-5 h-5 bg-white rounded-full border-4 border-blue-300 shadow-lg"
            />

            {/* Sparkles around bubble */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI) / 3) * 40,
                  y: Math.sin((i * Math.PI) / 3) * 40
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute top-1/2 left-1/2 text-yellow-400 text-xl"
              >
                ✨
              </motion.div>
            ))}

            {/* Close button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎈 Balloon Float Effect - Level Complete
export const BalloonFloat = ({ trigger, onComplete }) => {
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FF69B4', '#9370DB'];
      const newBalloons = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: '🎈',
        color: colors[i % colors.length],
        startX: (window.innerWidth / 13) * (i + 1),
        delay: Math.random() * 0.5,
        wobble: Math.random() * 20 - 10
      }));
      setBalloons(newBalloons);

      const timer = setTimeout(() => {
        setBalloons([]);
        if (onComplete) onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {balloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          initial={{
            x: balloon.startX,
            y: window.innerHeight + 50,
            rotate: 0,
            scale: 0
          }}
          animate={{
            y: -200,
            x: [balloon.startX, balloon.startX + balloon.wobble, balloon.startX - balloon.wobble, balloon.startX],
            rotate: [0, 10, -10, 0],
            scale: [0, 1, 1]
          }}
          transition={{
            duration: 4,
            delay: balloon.delay,
            ease: "easeOut",
            x: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute text-6xl"
          style={{ filter: `drop-shadow(0 4px 8px ${balloon.color}40)` }}
        >
          {balloon.emoji}
        </motion.div>
      ))}

      {/* Celebration text */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
      >
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 drop-shadow-2xl">
          🎉 Level Complete! 🎉
        </div>
      </motion.div>
    </div>
  );
};

// 🌈 Rainbow Swipe Effect - New Badge Unlocked
export const RainbowSwipe = ({ trigger, badgeName, onComplete }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Rainbow arc */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="16.67%" stopColor="#FF7F00" />
            <stop offset="33.33%" stopColor="#FFFF00" />
            <stop offset="50%" stopColor="#00FF00" />
            <stop offset="66.67%" stopColor="#0000FF" />
            <stop offset="83.33%" stopColor="#4B0082" />
            <stop offset="100%" stopColor="#9400D3" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M -100 300 Q 400 -200, 900 300"
          stroke="url(#rainbowGradient)"
          strokeWidth="80"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Sparkles along the rainbow */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            x: (window.innerWidth / 21) * (i + 1),
            y: [300, 100, 300]
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          className="absolute text-3xl"
        >
          ✨
        </motion.div>
      ))}

      {/* Badge announcement */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1, type: 'spring', stiffness: 200 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-400">
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="text-8xl mb-4"
            >
              🏅
            </motion.div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              New Badge Unlocked!
            </h2>
            <p className="text-xl text-gray-700 font-semibold">{badgeName}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 🔊 Microphone Pulse Effect - Voice-Play Mode
export const MicrophonePulse = ({ active, volume = 0.5 }) => {
  if (!active) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div className="relative">
        {/* Pulsing rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 2 + i * 0.5],
              opacity: [0.6, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-full border-4 border-blue-500"
            style={{
              width: 80,
              height: 80,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {/* Microphone icon */}
        <motion.div
          animate={{
            scale: [1, 1 + volume * 0.3, 1],
            y: [0, -5, 0]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
        >
          <Mic className="w-10 h-10 text-white" />
        </motion.div>

        {/* Volume indicator bars */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: volume > i * 0.2 ? [10, 20, 10] : 10,
                backgroundColor: volume > i * 0.2 ? '#3B82F6' : '#CBD5E1'
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.1
              }}
              className="w-2 rounded-full"
              style={{ height: 10 }}
            />
          ))}
        </div>

        {/* "Listening..." text */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="text-blue-600 font-semibold">🎤 Listening...</span>
        </motion.div>
      </div>
    </div>
  );
};

// Unified Effects Manager
export const EffectsManager = ({ effects, onEffectComplete }) => {
  return (
    <>
      <SparkleBurst 
        trigger={effects.sparkleBurst} 
        onComplete={() => onEffectComplete && onEffectComplete('sparkleBurst')} 
      />
      <BalloonFloat 
        trigger={effects.balloonFloat} 
        onComplete={() => onEffectComplete && onEffectComplete('balloonFloat')} 
      />
      <RainbowSwipe 
        trigger={effects.rainbowSwipe} 
        badgeName={effects.badgeName}
        onComplete={() => onEffectComplete && onEffectComplete('rainbowSwipe')} 
      />
      <ThoughtBubble
        visible={effects.thoughtBubble}
        message={effects.thoughtMessage}
        position={effects.thoughtPosition}
        onDismiss={() => onEffectComplete && onEffectComplete('thoughtBubble')}
      />
      <MicrophonePulse 
        active={effects.microphonePulse}
        volume={effects.microphoneVolume || 0.5}
      />
    </>
  );
};