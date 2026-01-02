
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Star } from 'lucide-react';
import { useNotifications as useSounds } from '../../SoundManager';

const animals = [
  { name: 'Cow', emoji: '🐄', soundType: 'cow', color: 'from-amber-400 to-yellow-500' },
  { name: 'Cat', emoji: '🐱', soundType: 'cat', color: 'from-gray-400 to-gray-600' },
  { name: 'Dog', emoji: '🐶', soundType: 'dog', color: 'from-amber-600 to-orange-700' },
  { name: 'Sheep', emoji: '🐑', soundType: 'sheep', color: 'from-gray-100 to-white' },
  { name: 'Duck', emoji: '🦆', soundType: 'duck', color: 'from-yellow-400 to-yellow-600' },
  { name: 'Lion', emoji: '🦁', soundType: 'lion', color: 'from-yellow-500 to-orange-500' },
];

// Enhanced Audio context for more realistic animal sounds
let audioContext = null;

const createAnimalSound = (type) => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const now = audioContext.currentTime;
  
  switch (type) {
    case 'cow': // Deep, resonant "moo" sound
      {
        // Main moo sound with two parts
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
        
        // Harmonic
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
      
    case 'cat': // High-pitched meow with vibrato
      {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const vibrato = audioContext.createOscillator();
        const vibratoGain = audioContext.createGain();
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Cat meow pattern - rise then fall
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.35);
        oscillator.frequency.exponentialRampToValueAtTime(350, now + 0.6);
        
        // Add vibrato for realism
        vibrato.frequency.setValueAtTime(5, now);
        vibratoGain.gain.setValueAtTime(20, now);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        
        oscillator.type = 'triangle';
        vibrato.type = 'sine';
        oscillator.start(now);
        vibrato.start(now);
        oscillator.stop(now + 0.7);
        vibrato.stop(now + 0.7);
      }
      break;
      
    case 'dog': // Sharp, energetic barking
      {
        // Create multiple barks
        for (let i = 0; i < 2; i++) {
          const startTime = now + i * 0.35;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();
          
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Sharp attack
          oscillator.frequency.setValueAtTime(300, startTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, startTime + 0.08);
          
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, startTime);
          filter.Q.setValueAtTime(3, startTime);
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
          
          oscillator.type = 'square';
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.15);
        }
      }
      break;
      
    case 'sheep': // Bleating with vibrato
      {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const tremolo = audioContext.createOscillator();
        const tremoloGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        tremolo.connect(tremoloGain);
        tremoloGain.connect(gainNode.gain);
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Sheep bleat - wavering frequency
        oscillator.frequency.setValueAtTime(250, now);
        for (let i = 0; i < 8; i++) {
          const time = now + (i * 0.1);
          oscillator.frequency.setValueAtTime(250 + (i % 2) * 80, time);
        }
        
        // Tremolo effect
        tremolo.frequency.setValueAtTime(8, now);
        tremoloGain.gain.setValueAtTime(0.3, now);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.Q.setValueAtTime(2, now);
        
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.9);
        
        oscillator.type = 'sawtooth';
        tremolo.type = 'sine';
        oscillator.start(now);
        tremolo.start(now);
        oscillator.stop(now + 0.9);
        tremolo.stop(now + 0.9);
      }
      break;
      
    case 'duck': // Nasal quacking
      {
        // Create 3 distinct quacks
        for (let i = 0; i < 3; i++) {
          const startTime = now + i * 0.25;
          const oscillator1 = audioContext.createOscillator();
          const oscillator2 = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();
          
          oscillator1.connect(filter);
          oscillator2.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Nasal quality with two frequencies
          oscillator1.frequency.setValueAtTime(500, startTime);
          oscillator1.frequency.exponentialRampToValueAtTime(250, startTime + 0.12);
          
          oscillator2.frequency.setValueAtTime(750, startTime);
          oscillator2.frequency.exponentialRampToValueAtTime(375, startTime + 0.12);
          
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(900, startTime);
          filter.Q.setValueAtTime(4, startTime); 
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
          
          oscillator1.type = 'square';
          oscillator2.type = 'square';
          oscillator1.start(startTime);
          oscillator2.start(startTime);
          oscillator1.stop(startTime + 0.15);
          oscillator2.stop(startTime + 0.15);
        }
      }
      break;
      
    case 'lion': // Deep, powerful roar
      {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 1.5, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const gainNode = audioContext.createGain();
        const noiseGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        noise.connect(noiseGain);
        noiseGain.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Deep growl rising to roar
        oscillator1.frequency.setValueAtTime(60, now);
        oscillator1.frequency.exponentialRampToValueAtTime(120, now + 0.4);
        oscillator1.frequency.exponentialRampToValueAtTime(80, now + 0.8);
        oscillator1.frequency.exponentialRampToValueAtTime(55, now + 1.4);
        
        oscillator2.frequency.setValueAtTime(120, now);
        oscillator2.frequency.exponentialRampToValueAtTime(240, now + 0.4);
        oscillator2.frequency.exponentialRampToValueAtTime(160, now + 0.8);
        oscillator2.frequency.exponentialRampToValueAtTime(110, now + 1.4);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(600, now + 0.4);
        filter.frequency.linearRampToValueAtTime(350, now + 1.4);
        
        noiseGain.gain.setValueAtTime(0.1, now);
        noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.4);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.2);
        gainNode.gain.setValueAtTime(0.4, now + 0.6);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        oscillator1.type = 'sawtooth';
        oscillator2.type = 'sawtooth';
        oscillator1.start(now);
        oscillator2.start(now);
        noise.start(now);
        oscillator1.stop(now + 1.5);
        oscillator2.stop(now + 1.5);
        noise.stop(now + 1.5);
      }
      break;
  }
};

export default function AnimalSounds({ onComplete }) {
  const [clickedAnimals, setClickedAnimals] = useState(new Set());
  const [currentAnimal, setCurrentAnimal] = useState('');
  const [suggestedAnimal, setSuggestedAnimal] = useState(null); // New state for AI guidance
  const guidanceTimerRef = useRef(null); // Ref for guidance timer
  const { playSound } = useSounds();

  // Initialize audio context on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };
    
    // Add event listener to initialize audio on first user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Effect for AI guidance timer
  useEffect(() => {
    // Clear any existing timer
    if (guidanceTimerRef.current) {
      clearTimeout(guidanceTimerRef.current);
    }
    setSuggestedAnimal(null); // Clear any previous suggestion

    // If the game is not yet complete, set a new guidance timer
    if (clickedAnimals.size < animals.length) {
      guidanceTimerRef.current = setTimeout(() => {
        const unclicked = animals.filter(
          (animal) => !clickedAnimals.has(animal.name)
        );
        if (unclicked.length > 0) {
          // Suggest a random unclicked animal
          const randomUnclicked = unclicked[Math.floor(Math.random() * unclicked.length)];
          setSuggestedAnimal(randomUnclicked.name);
        }
      }, 7000); // Suggest after 7 seconds of inactivity
    }

    // Cleanup: clear timer when component unmounts or dependencies change
    return () => {
      if (guidanceTimerRef.current) {
        clearTimeout(guidanceTimerRef.current);
      }
    };
  }, [clickedAnimals, animals.length]); // Re-run when clickedAnimals or total animals change


  const handleAnimalClick = (animal) => {
    try {
      createAnimalSound(animal.soundType);
      playSound('pop'); // Keep the click sound for feedback
    } catch (error) {
      console.error('Error playing animal sound:', error);
      // Fallback to generic sound if audio context fails
      playSound('success');
    }
    
    setCurrentAnimal(animal.name);
    setClickedAnimals(prev => new Set([...prev, animal.name]));
    
    setTimeout(() => setCurrentAnimal(''), 2000);
    
    if (clickedAnimals.size + 1 >= animals.length) {
      setTimeout(() => onComplete(10, 'animal-sticker'), 1000);
    }
  };

  const resetGame = () => {
    setClickedAnimals(new Set());
    setCurrentAnimal('');
    // The useEffect will handle clearing/restarting the guidance timer based on clickedAnimals reset
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl">
      <h3 className="text-3xl font-bold text-green-800 mb-6">🐾 Animal Sounds! 🐾</h3>
      <p className="text-xl text-green-700 mb-6 text-center">Touch each animal to hear their real sound!</p>
      
      {/* Current Animal Display */}
      {currentAnimal && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 text-3xl font-bold text-purple-600 bg-white/80 px-6 py-3 rounded-full shadow-lg"
        >
          🔊 {currentAnimal} Sound!
        </motion.div>
      )}

      {/* AI Guidance Message */}
      {suggestedAnimal && (
        <motion.p
          key="guidance-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-blue-600 mb-4 text-center"
        >
          🤔 Can you find the {suggestedAnimal}?
        </motion.p>
      )}

      {/* Animal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        {animals.map((animal) => (
          <motion.button
            key={animal.name}
            onClick={() => handleAnimalClick(animal)}
            className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${animal.color} border-4 border-white shadow-xl flex flex-col items-center justify-center relative`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            // AI Guidance animation
            animate={{ 
              y: clickedAnimals.has(animal.name) ? [0, -10, 0] : 0,
              scale: animal.name === suggestedAnimal ? [1, 1.08, 1] : 1 // Pulsing effect for suggested animal
            }}
            transition={animal.name === suggestedAnimal ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <div className="text-4xl mb-1">{animal.emoji}</div>
            <div className="text-sm font-bold text-gray-700">{animal.name}</div>
            
            {clickedAnimals.has(animal.name) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Star className="w-4 h-4 text-white fill-current" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Progress and Reset */}
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold text-gray-700">
          Heard: {clickedAnimals.size} / {animals.length}
        </div>
        <Button onClick={resetGame} variant="outline">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>

      {clickedAnimals.size === animals.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center p-4 bg-green-200 rounded-xl"
        >
          <h4 className="text-2xl font-bold text-green-800 mb-2">🎉 Amazing! 🎉</h4>
          <p className="text-green-700">You heard all the animal sounds!</p>
        </motion.div>
      )}
    </div>
  );
}
