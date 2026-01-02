import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CozyRoomEnvironment({ soundEnabled, audioRef }) {
  useEffect(() => {
    if (!soundEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Use realistic soft piano music
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/08/04/audio_d0c7dd214e.mp3?filename=soft-piano-100-bpm-121529.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    
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
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700">
      {/* Warm ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-orange-300/20 to-yellow-200/30" />

      {/* Window with moonlight */}
      <div className="absolute top-20 right-32 w-64 h-80 bg-gradient-to-b from-blue-900 to-indigo-800 rounded-lg opacity-60 shadow-2xl">
        <motion.div
          className="absolute top-10 right-10 w-20 h-20 rounded-full bg-yellow-100"
          animate={{
            opacity: [0.6, 0.9, 0.6]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Candles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`candle-${i}`}
          className="absolute bottom-32 text-4xl"
          style={{ left: `${20 + i * 15}%` }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity
          }}
        >
          🕯️
        </motion.div>
      ))}

      {/* Books on shelf */}
      <div className="absolute left-20 top-1/3 flex gap-2">
        {['📕', '📗', '📘', '📙'].map((book, i) => (
          <span key={i} className="text-5xl opacity-70">{book}</span>
        ))}
      </div>

      {/* Blanket/comfort items */}
      <div className="absolute bottom-20 left-1/4 text-6xl opacity-80">🛋️</div>

      {/* Warm glow particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute w-3 h-3 bg-orange-300 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
}