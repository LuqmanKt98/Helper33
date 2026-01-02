import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function FireplaceEnvironment({ soundEnabled, audioRef }) {
  useEffect(() => {
    if (!soundEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Use realistic fireplace crackling with rain outside
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=fireplace-sound-14373.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    
    const playAudio = async () => {
      try {
        await audio.play();
        audioRef.current = audio;
      } catch (error) {
        console.log('Audio autoplay blocked. User interaction needed.');
      }
    };

    playAudio();

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [soundEnabled, audioRef]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-800 via-gray-700 to-amber-900">
      {/* Fire glow ambient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-red-500/20 to-transparent"
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Fireplace */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-gradient-to-t from-gray-900 to-gray-800 rounded-t-3xl border-4 border-gray-700">
        {/* Flames */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`flame-${i}`}
            className="absolute bottom-0 w-12 h-32 bg-gradient-to-t from-orange-500 via-red-500 to-yellow-400 rounded-t-full opacity-80 blur-sm"
            style={{ left: `${10 + i * 11}%` }}
            animate={{
              scaleY: [1, 1.3, 0.9, 1.2, 1],
              scaleX: [1, 0.9, 1.1, 0.95, 1],
              opacity: [0.7, 0.9, 0.6, 0.8, 0.7]
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Logs */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
        {['🪵', '🪵', '🪵'].map((log, i) => (
          <span key={i} className="text-4xl opacity-70">{log}</span>
        ))}
      </div>

      {/* Cozy items */}
      <div className="absolute bottom-40 right-32 text-6xl opacity-70">☕</div>
      <div className="absolute bottom-48 left-24 text-5xl opacity-70">📖</div>

      {/* Window with rain */}
      <div className="absolute top-20 right-20 w-48 h-64 bg-gradient-to-b from-blue-900 to-blue-800 rounded-lg opacity-50">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute w-0.5 h-8 bg-blue-300"
            style={{ left: `${Math.random() * 100}%`, top: -20 }}
            animate={{
              y: [0, 280]
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Embers floating up */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute w-1.5 h-1.5 bg-orange-400 rounded-full"
          style={{
            left: `${45 + Math.random() * 10}%`,
            bottom: `${15 + Math.random() * 10}%`
          }}
          animate={{
            y: [-200, 0],
            opacity: [1, 0],
            scale: [1, 0.5]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}
    </div>
  );
}