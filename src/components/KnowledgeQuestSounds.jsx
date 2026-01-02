
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const KnowledgeQuestSoundContext = createContext();

export const useKnowledgeQuestSounds = () => {
  const context = useContext(KnowledgeQuestSoundContext);
  if (!context) {
    throw new Error('useKnowledgeQuestSounds must be used within KnowledgeQuestSoundProvider');
  }
  return context;
};

// Audio Context for all sounds
let audioContext = null;
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// 🐾 ANIMAL SOUNDS - Realistic animal sounds
const ANIMAL_SOUNDS = {
  lion: () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Deep roar
    oscillator.frequency.setValueAtTime(100, now);
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 1.2);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    oscillator.type = 'sawtooth';
    oscillator.start(now);
    oscillator.stop(now + 1.5);
  },
  
  elephant: () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Trumpet sound
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.8);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    oscillator.type = 'triangle';
    oscillator.start(now);
    oscillator.stop(now + 1.0);
  },
  
  bird: () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Three chirps
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.15;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(2000 + Math.random() * 500, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(2500 + Math.random() * 500, startTime + 0.08);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.12);
    }
  },
  
  dog: () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Two barks
    for (let i = 0; i < 2; i++) {
      const startTime = now + i * 0.25;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(300, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, startTime + 0.08);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
      
      oscillator.type = 'square';
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.12);
    }
  },
  
  cat: () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Meow pattern
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.4);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.type = 'triangle';
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  },
  
  cow: () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Moo sound
    oscillator.frequency.setValueAtTime(120, now);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.6);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    oscillator.type = 'sawtooth';
    oscillator.start(now);
    oscillator.stop(now + 1.0);
  }
};

// 🌍 BACKGROUND AMBIENCE - Looping background sounds for each theme
const createAmbience = (type) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  switch (type) {
    case 'nature': {
      // Gentle wind and birds
      const noise = ctx.createBufferSource();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.03;
      }
      noise.buffer = noiseBuffer;
      noise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.05, now);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noise.start(now);
      return () => noise.stop();
    }
    
    case 'classroom': {
      // Soft classroom hum
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.frequency.setValueAtTime(120, now);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.02, now);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now);
      return () => oscillator.stop();
    }
    
    case 'laboratory': {
      // Bubbling science lab
      const intervalId = setInterval(() => {
        const bubble = ctx.createOscillator();
        const bubbleGain = ctx.createGain();
        
        bubble.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime);
        bubble.type = 'sine';
        
        bubbleGain.gain.setValueAtTime(0, ctx.currentTime);
        bubbleGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        bubbleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        bubble.connect(bubbleGain);
        bubbleGain.connect(ctx.destination);
        
        bubble.start(ctx.currentTime);
        bubble.stop(ctx.currentTime + 0.3);
      }, 800);
      
      return () => clearInterval(intervalId); // Return cleanup for the interval
    }
    default:
      return () => {}; // No ambience for unknown types
  }
};

// 🎯 CORRECT ANSWER FX - Cheerful chime and sparkle
const createCorrectSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Ascending chime
  const notes = [523.25, 659.25, 783.99]; // C-E-G major chord
  
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(freq, now + i * 0.08);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, now + i * 0.08);
    gainNode.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.5);
    
    oscillator.start(now + i * 0.08);
    oscillator.stop(now + i * 0.08 + 0.5);
  });
  
  // Sparkle sound
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      
      sparkle.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
      sparkle.type = 'sine';
      
      sparkleGain.gain.setValueAtTime(0, ctx.currentTime);
      sparkleGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      sparkle.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);
      
      sparkle.start(ctx.currentTime);
      sparkle.stop(ctx.currentTime + 0.15);
    }
  }, 250);
};

// ❌ WRONG ANSWER FX - Soft "oops" buzz
const createWrongSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.frequency.setValueAtTime(200, now);
  oscillator.frequency.linearRampToValueAtTime(150, now + 0.3);
  oscillator.type = 'triangle';
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(now);
  oscillator.stop(now + 0.4);
};

// 🏅 BADGE EARNED - Trumpet fanfare
const createBadgeSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Trumpet fanfare
  const fanfare = [
    { freq: 523.25, time: 0, duration: 0.2 },
    { freq: 659.25, time: 0.2, duration: 0.2 },
    { freq: 783.99, time: 0.4, duration: 0.4 }
  ];
  
  fanfare.forEach(note => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(note.freq, now + note.time);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, now + note.time);
    gainNode.gain.linearRampToValueAtTime(0.2, now + note.time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
    
    oscillator.start(now + note.time);
    oscillator.stop(now + note.time + note.duration);
  });
  
  // Sparkle at the end
  setTimeout(() => {
    for (let i = 0; i < 8; i++) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      
      sparkle.frequency.setValueAtTime(1500 + Math.random() * 1500, ctx.currentTime);
      sparkle.type = 'sine';
      
      sparkleGain.gain.setValueAtTime(0, ctx.currentTime);
      sparkleGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      sparkle.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);
      
      sparkle.start(ctx.currentTime + i * 0.05);
      sparkle.stop(ctx.currentTime + i * 0.05 + 0.2);
    }
  }, 600);
};

// 🎨 COLOR GAME FX - Paint swish and pop
const createPaintSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Swish sound
  const swish = ctx.createOscillator();
  const swishGain = ctx.createGain();
  const swishFilter = ctx.createBiquadFilter();
  
  swish.connect(swishFilter);
  swishFilter.connect(swishGain);
  swishGain.connect(ctx.destination);
  
  swish.frequency.setValueAtTime(400, now);
  swish.frequency.exponentialRampToValueAtTime(200, now + 0.3);
  swish.type = 'sawtooth';
  
  swishFilter.type = 'lowpass';
  swishFilter.frequency.setValueAtTime(1000, now);
  swishFilter.frequency.linearRampToValueAtTime(300, now + 0.3);
  
  swishGain.gain.setValueAtTime(0, now);
  swishGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
  swishGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  
  swish.start(now);
  swish.stop(now + 0.35);
  
  // Pop sound
  setTimeout(() => {
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    
    pop.frequency.setValueAtTime(800, ctx.currentTime);
    pop.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    pop.type = 'sine';
    
    popGain.gain.setValueAtTime(0, ctx.currentTime);
    popGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    popGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    pop.connect(popGain);
    popGain.connect(ctx.destination);
    
    pop.start(ctx.currentTime);
    pop.stop(ctx.currentTime + 0.15);
  }, 350);
};

// Sound Provider Component
export function KnowledgeQuestSoundProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceGender, setVoiceGender] = useState('female'); // 'male' or 'female'
  const [ambienceEnabled, setAmbienceEnabled] = useState(true);
  const [currentAmbience, setCurrentAmbience] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const ambienceStopRef = useRef(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      setIsInitialized(true);
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playSound = (type, options = {}) => {
    if (!soundEnabled || !isInitialized) return;

    try {
      switch (type) {
        // 'theme' sound has been disabled as per requirements
        // case 'theme':
        //   createMainTheme();
        //   break;
        case 'correct':
          createCorrectSound();
          break;
        case 'wrong':
          createWrongSound();
          break;
        case 'badge':
          createBadgeSound();
          break;
        case 'paint':
          createPaintSound();
          break;
        case 'animal':
          if (options.animal && ANIMAL_SOUNDS[options.animal]) {
            ANIMAL_SOUNDS[options.animal]();
          }
          break;
        default:
          console.warn('Unknown sound type:', type);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const startAmbience = (type) => {
    if (!ambienceEnabled || !isInitialized) return;
    
    // Stop current ambience if any
    if (ambienceStopRef.current) {
      ambienceStopRef.current();
    }
    
    try {
      const stopFn = createAmbience(type);
      ambienceStopRef.current = stopFn;
      setCurrentAmbience(type);
    } catch (error) {
      console.error('Error starting ambience:', error);
    }
  };

  const stopAmbience = () => {
    if (ambienceStopRef.current) {
      ambienceStopRef.current();
      ambienceStopRef.current = null;
      setCurrentAmbience(null);
    }
  };

  const narrateText = (text) => {
    if (!voiceEnabled || !isInitialized) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = voiceGender === 'female' ? 1.2 : 0.9;
      utterance.volume = 0.8;

      const voices = window.speechSynthesis.getVoices();
      // Try to find a voice that matches language and gender preference
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voiceGender === 'female' ? voice.name.toLowerCase().includes('female') : voice.name.toLowerCase().includes('male'))
      ) || voices.find(voice => voice.lang.startsWith('en')); // Fallback to any English voice

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        // If no preferred voice, ensure voices are loaded and try again or use default
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          const newPreferredVoice = updatedVoices.find(voice => 
            voice.lang.startsWith('en') && 
            (voiceGender === 'female' ? voice.name.toLowerCase().includes('female') : voice.name.toLowerCase().includes('male'))
          ) || updatedVoices.find(voice => voice.lang.startsWith('en'));
          if (newPreferredVoice) {
            utterance.voice = newPreferredVoice;
          }
          window.speechSynthesis.speak(utterance);
        };
        // If voices already loaded, this won't fire, so speak now.
        // This handles cases where voices are loaded asynchronously.
        if (voices.length > 0) {
          window.speechSynthesis.speak(utterance);
        }
        return; // Exit to avoid double speak if onvoiceschanged triggers
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported in this browser.");
    }
  };

  const value = {
    soundEnabled,
    setSoundEnabled,
    voiceEnabled,
    setVoiceEnabled,
    voiceGender,
    setVoiceGender,
    ambienceEnabled,
    setAmbienceEnabled,
    currentAmbience,
    isInitialized,
    playSound,
    startAmbience,
    stopAmbience,
    narrateText
  };

  return (
    <KnowledgeQuestSoundContext.Provider value={value}>
      {children}
    </KnowledgeQuestSoundContext.Provider>
  );
}

// Sound Controls Component
export function KnowledgeQuestSoundControls() {
  const { 
    soundEnabled, 
    setSoundEnabled, 
    voiceEnabled, 
    setVoiceEnabled,
    voiceGender,
    setVoiceGender,
    ambienceEnabled,
    setAmbienceEnabled,
    currentAmbience
  } = useKnowledgeQuestSounds();

  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
      {/* Sound Toggle */}
      <Button
        onClick={() => setSoundEnabled(!soundEnabled)}
        variant="ghost"
        size="sm"
        className="rounded-full"
        title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-purple-600" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400" />
        )}
      </Button>

      {/* Voice Toggle */}
      <Button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        variant="ghost"
        size="sm"
        className="rounded-full"
        title={voiceEnabled ? 'Mute narrator' : 'Unmute narrator'}
      >
        <span className="text-lg">{voiceEnabled ? '🗣️' : '🔇'}</span>
      </Button>

      {/* Voice Gender Toggle */}
      {voiceEnabled && (
        <Button
          onClick={() => setVoiceGender(voiceGender === 'female' ? 'male' : 'female')}
          variant="ghost"
          size="sm"
          className="text-xs font-medium"
          title="Toggle voice gender"
        >
          {voiceGender === 'female' ? '👩' : '👨'}
        </Button>
      )}

      {/* Ambience Toggle */}
      <Button
        onClick={() => setAmbienceEnabled(!ambienceEnabled)}
        variant="ghost"
        size="sm"
        className="rounded-full"
        title={ambienceEnabled ? 'Disable ambience' : 'Enable ambience'}
      >
        <span className="text-lg">{ambienceEnabled ? '🌍' : '🔕'}</span>
      </Button>

      {currentAmbience && ambienceEnabled && (
        <Badge variant="secondary" className="text-xs">
          {currentAmbience}
        </Badge>
      )}
    </div>
  );
}
