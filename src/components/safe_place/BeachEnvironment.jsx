import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BeachEnvironment({ soundEnabled, audioRef }) {
  useEffect(() => {
    if (!soundEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Use realistic ocean waves sound
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_4a456eb1e5.mp3?filename=ocean-wave-1-7109.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    
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
    <div className="fixed inset-0 bg-gradient-to-b from-sky-300 via-cyan-200 to-blue-300 overflow-hidden">
      {/* Sun */}
      <motion.div
        className="absolute top-20 right-32 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 opacity-80 blur-sm"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Clouds */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute text-6xl opacity-60"
          style={{ top: `${20 + i * 15}%`, left: `${i * 20}%` }}
          animate={{
            x: [0, 100, 0],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 30 + i * 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          ☁️
        </motion.div>
      ))}

      {/* Ocean Waves */}
      <div className="absolute bottom-0 left-0 right-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute bottom-0 w-full"
            style={{ 
              height: `${120 + i * 40}px`,
              opacity: 0.3 - i * 0.08
            }}
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 20 + i * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg viewBox="0 0 1200 200" className="w-full h-full">
              <path
                d="M0,100 Q150,60 300,100 T600,100 T900,100 T1200,100 L1200,200 L0,200 Z"
                fill={`rgba(34, 211, 238, ${0.4 - i * 0.1})`}
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Sand */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-200 to-yellow-100" />

      {/* Seagulls */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          className="absolute text-2xl"
          animate={{
            x: [-100, typeof window !== 'undefined' ? window.innerWidth + 100 : 1400],
            y: [100 + i * 50, 80 + i * 50, 120 + i * 50]
          }}
          transition={{
            duration: 25 + i * 8,
            repeat: Infinity,
            delay: i * 5
          }}
        >
          🕊️
        </motion.div>
      ))}

      {/* Sparkles on water */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${40 + Math.random() * 20}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}