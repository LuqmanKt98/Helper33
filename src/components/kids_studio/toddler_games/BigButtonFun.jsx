
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Volume2 } from 'lucide-react';

const funButtons = [
  { 
    emoji: '🎈', 
    sound: 'Pop!', 
    color: 'from-red-400 to-pink-500',
    action: 'Pop the balloon!',
    soundType: 'balloon'
  },
  { 
    emoji: '🔔', 
    sound: 'Ding!', 
    color: 'from-yellow-400 to-orange-500',
    action: 'Ring the bell!',
    soundType: 'bell'
  },
  { 
    emoji: '🚂', 
    sound: 'Choo Choo!', 
    color: 'from-blue-400 to-blue-600',
    action: 'Start the train!',
    soundType: 'train'
  },
  { 
    emoji: '🐄', 
    sound: 'Moo!', 
    color: 'from-amber-400 to-yellow-600',
    action: 'Wake the cow!',
    soundType: 'cow'
  },
  { 
    emoji: '⭐', 
    sound: 'Twinkle!', 
    color: 'from-purple-400 to-pink-500',
    action: 'Make it shine!',
    soundType: 'star'
  },
  { 
    emoji: '🎵', 
    sound: 'La la la!', 
    color: 'from-green-400 to-teal-500',
    action: 'Play music!',
    soundType: 'music'
  }
];

// Audio context for realistic sounds
let audioContext = null;

const createRealisticSound = (type) => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const now = audioContext.currentTime;
  
  switch (type) {
    case 'balloon': // Balloon pop - sharp burst
      {
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.Q.setValueAtTime(0.5, now);
        
        gainNode.gain.setValueAtTime(0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        noise.start(now);
        noise.stop(now + 0.1);
      }
      break;
      
    case 'bell': // Bell ding - clear metallic tone
      {
        // Multiple harmonics for bell sound
        const frequencies = [800, 1600, 2400, 3200];
        
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, now);
          oscillator.type = 'sine';
          
          const volume = 0.3 / (index + 1);
          gainNode.gain.setValueAtTime(volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
          
          oscillator.start(now);
          oscillator.stop(now + 1.5);
        });
      }
      break;
      
    case 'train': // Train whistle - choo choo
      {
        // First "Choo"
        for (let i = 0; i < 2; i++) {
          const startTime = now + i * 0.5;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();
          
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Steam whistle sound
          oscillator.frequency.setValueAtTime(600, startTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, startTime + 0.3);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, startTime);
          filter.frequency.linearRampToValueAtTime(800, startTime + 0.3);
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
          
          oscillator.type = 'sawtooth';
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.35);
        }
      }
      break;
      
    case 'cow': // Cow moo
      {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Low frequency for cow
        oscillator1.frequency.setValueAtTime(150, now);
        oscillator1.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        oscillator1.frequency.setValueAtTime(100, now + 0.6);
        oscillator1.frequency.exponentialRampToValueAtTime(65, now + 1.2);
        
        oscillator2.frequency.setValueAtTime(300, now);
        oscillator2.frequency.exponentialRampToValueAtTime(160, now + 0.4);
        oscillator2.frequency.setValueAtTime(200, now + 0.6);
        oscillator2.frequency.exponentialRampToValueAtTime(130, now + 1.2);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(400, now + 1.2);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        oscillator1.type = 'sawtooth';
        oscillator2.type = 'triangle';
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator1.stop(now + 1.5);
        oscillator2.stop(now + 1.5);
      }
      break;
      
    case 'star': // Twinkle - magical ascending sparkle
      {
        // Ascending magical notes
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, index) => {
          const startTime = now + index * 0.15;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, startTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.3);
        });
      }
      break;
      
    case 'music': // Musical notes - cheerful melody
      {
        // Simple cheerful melody: C-E-G-C
        const melody = [
          { freq: 523.25, time: 0 },    // C5
          { freq: 659.25, time: 0.2 },  // E5
          { freq: 783.99, time: 0.4 },  // G5
          { freq: 1046.50, time: 0.6 }  // C6
        ];
        
        melody.forEach(note => {
          const startTime = now + note.time;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(note.freq, startTime);
          oscillator.type = 'triangle';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.25);
        });
      }
      break;
  }
};

export default function BigButtonFun({ onComplete }) {
  const [pressCount, setPressCount] = useState(0);
  const [currentSound, setCurrentSound] = useState('');
  const [lastPressed, setLastPressed] = useState(null);

  const handleButtonPress = (button, index) => {
    try {
      // Initialize audio context on first user interaction if needed
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      createRealisticSound(button.soundType);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
    
    setCurrentSound(button.sound);
    setLastPressed(index);
    setPressCount(prev => prev + 1);
    
    setTimeout(() => setCurrentSound(''), 2000);
    
    if (pressCount + 1 >= 20) {
      onComplete(10, 'music-sticker');
    }
  };

  const resetGame = () => {
    setPressCount(0);
    setCurrentSound('');
    setLastPressed(null);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-rainbow-100 to-blue-100 rounded-xl">
      <h3 className="text-3xl font-bold text-purple-800 mb-4">🎉 Big Button Fun! 🎉</h3>
      <p className="text-xl text-gray-700 mb-6 text-center">Press the big buttons to make sounds!</p>
      
      {/* Sound Display */}
      {currentSound && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 text-4xl font-bold text-purple-600 bg-white/90 px-8 py-4 rounded-full shadow-xl border-4 border-yellow-300"
        >
          {currentSound}
        </motion.div>
      )}

      {/* Fun Buttons Grid */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {funButtons.map((button, index) => (
          <motion.button
            key={index}
            onClick={() => handleButtonPress(button, index)}
            className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${button.color} border-6 border-white shadow-2xl flex flex-col items-center justify-center relative overflow-hidden`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              scale: lastPressed === index ? [1, 1.2, 1] : 1,
              rotate: lastPressed === index ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Background animation */}
            {lastPressed === index && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                className="absolute inset-0 bg-white rounded-full"
              />
            )}
            
            <div className="text-5xl mb-1 relative z-10">{button.emoji}</div>
            <div className="text-xs font-bold text-white text-center relative z-10">
              {button.action}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Fun Stats */}
      <div className="flex items-center gap-6 text-lg font-bold text-gray-700">
        <div className="flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-purple-600" />
          Sounds: {pressCount}
        </div>
        <Button onClick={resetGame} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Encouragement */}
      <div className="mt-4 text-center">
        <p className="text-lg text-purple-600 font-semibold">
          🌟 Keep pressing! You're doing great! 🌟
        </p>
      </div>
    </div>
  );
}
