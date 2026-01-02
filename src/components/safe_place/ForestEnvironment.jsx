import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ForestEnvironment({ soundEnabled, audioRef }) {
  useEffect(() => {
    if (!soundEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Use realistic forest ambiance with birds and stream
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=birds-chirping-in-the-forest-96825.mp3');
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
    <div className="fixed inset-0 bg-gradient-to-b from-green-800 via-emerald-600 to-green-900">
      {/* Sunlight rays */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute top-0 w-1 bg-gradient-to-b from-yellow-200/40 to-transparent"
          style={{
            left: `${10 + i * 12}%`,
            height: '60%',
            transformOrigin: 'top'
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleY: [1, 1.2, 1]
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity
          }}
        />
      ))}

      {/* Trees */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`tree-${i}`}
          className="absolute bottom-0 text-7xl"
          style={{
            left: `${i * 7}%`,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
          }}
          animate={{
            rotate: [-1, 1, -1]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity
          }}
        >
          🌲
        </motion.div>
      ))}

      {/* Birds */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          className="absolute text-xl"
          animate={{
            x: [-50, typeof window !== 'undefined' ? window.innerWidth + 50 : 1400],
            y: [100 + i * 60, 80 + i * 60, 120 + i * 60]
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            delay: i * 3
          }}
        >
          🐦
        </motion.div>
      ))}

      {/* Fireflies */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`firefly-${i}`}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.5, 0.8],
            x: [0, Math.random() * 50 - 25, 0],
            y: [0, Math.random() * 30 - 15, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}

      {/* Leaves falling */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute text-2xl"
          initial={{
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1200,
            y: -50
          }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
            rotate: 360,
            x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1200
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 2
          }}
        >
          🍃
        </motion.div>
      ))}
    </div>
  );
}