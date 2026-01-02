import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MountainEnvironment({ soundEnabled, audioRef }) {
  useEffect(() => {
    if (!soundEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Use realistic mountain wind and peaceful ambiance
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_2c898c9cb3.mp3?filename=wind-in-trees-117477.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    
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
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-indigo-700 to-purple-500">
      {/* Sunrise */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-orange-300 via-pink-200 to-transparent opacity-60"
        animate={{
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Mountain peaks */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 400" className="w-full">
          <polygon points="0,400 200,100 400,400" fill="rgba(79, 70, 229, 0.8)" />
          <polygon points="300,400 500,50 700,400" fill="rgba(99, 102, 241, 0.9)" />
          <polygon points="600,400 800,120 1000,400" fill="rgba(79, 70, 229, 0.8)" />
          <polygon points="900,400 1100,80 1200,400" fill="rgba(99, 102, 241, 0.7)" />
        </svg>
      </div>

      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.3, 0.8]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Eagle soaring */}
      <motion.div
        className="absolute text-4xl"
        animate={{
          x: [-100, typeof window !== 'undefined' ? window.innerWidth + 100 : 1400],
          y: [150, 120, 180, 150]
        }}
        transition={{
          duration: 40,
          repeat: Infinity
        }}
      >
        🦅
      </motion.div>

      {/* Wind particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`wind-${i}`}
          className="absolute w-8 h-0.5 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 80}%`
          }}
          animate={{
            x: [0, 200],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
}