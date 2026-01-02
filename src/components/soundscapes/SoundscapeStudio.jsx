
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Waves, Wind, Zap, Bug, Sparkles, Timer, Play, Square,
  Music, Volume2, Settings, Save, ChevronLeft, ChevronRight, Loader2, Star, Heart, Palette, Baby
} from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';
import { SoundAsset } from '@/entities/SoundAsset';
import { SoundPreset } from '@/entities/SoundPreset';
import { SoundSession } from '@/entities/SoundSession';
import { GeneratedSound } from '@/entities/GeneratedSound';
import { User } from '@/entities/User';

// Visual Scene Components
const WaveformVisualizer = ({ fftData, intensity, reduceMotion }) => (
  <div className="absolute inset-0 overflow-hidden">
    <svg width="100%" height="100%" className="opacity-80">
      {fftData && fftData.map((value, i) => (
        <rect
          key={i}
          x={`${(i / fftData.length) * 100}%`}
          y={`${50 - (value * intensity * 30)}%`}
          width="2"
          height={`${value * intensity * 60}%`}
          fill={`hsl(${200 + value * 60}, 70%, ${50 + value * 30}%)`}
          className={reduceMotion ? '' : 'transition-all duration-100'}
        />
      ))}
    </svg>
  </div>
);

const SpectrogramVisualizer = ({ fftData, intensity, reduceMotion }) => {
  const [spectrogramData, setSpectrogramData] = useState([]);

  useEffect(() => {
    if (fftData) {
      setSpectrogramData(prev => {
        const newData = [...prev, fftData];
        return newData.slice(-50); // Keep last 50 frames
      });
    }
  }, [fftData]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="grid grid-cols-50 h-full gap-px">
        {spectrogramData.map((frame, frameIndex) => (
          <div key={frameIndex} className="flex flex-col-reverse">
            {frame.map((value, freqIndex) => (
              <div
                key={freqIndex}
                className={`${reduceMotion ? '' : 'transition-colors duration-200'}`}
                style={{
                  backgroundColor: `hsl(${240 + value * 120}, ${70 + value * 30}%, ${20 + value * intensity * 60}%)`,
                  height: `${100 / frame.length}%`
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const StarfieldVisualizer = ({ fftData, intensity, reduceMotion }) => {
  const stars = useMemo(() =>
    Array.from({ length: Math.floor(100 * intensity + 50) }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1
    }))
  , [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-indigo-950 to-black">
      {stars.map(star => {
        const audioBoost = fftData ? (fftData[star.id % fftData.length] || 0) * intensity : 0;
        return (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size + audioBoost * 4}px`,
              height: `${star.size + audioBoost * 4}px`
            }}
            animate={reduceMotion ? {} : {
              opacity: [0.3, 1, 0.3],
              scale: [1, 1 + audioBoost, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );
      })}
    </div>
  );
};

const FirefliesVisualizer = ({ fftData, intensity, reduceMotion }) => {
  const fireflies = useMemo(() =>
    Array.from({ length: Math.floor(30 * intensity + 15) }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3
    }))
  , [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-green-950 via-emerald-900 to-black">
      {fireflies.map(firefly => {
        const audioBoost = fftData ? (fftData[firefly.id % fftData.length] || 0) * intensity : 0;
        return (
          <motion.div
            key={firefly.id}
            className="absolute rounded-full"
            style={{
              left: `${firefly.x}%`,
              top: `${firefly.y}%`,
              width: `${firefly.size + audioBoost * 8}px`,
              height: `${firefly.size + audioBoost * 8}px`,
              background: `radial-gradient(circle, rgba(255,255,150,${0.8 + audioBoost}) 0%, rgba(255,255,150,0) 70%)`
            }}
            animate={reduceMotion ? {} : {
              x: [-10, 10, -10],
              y: [-5, 5, -5],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2
            }}
          />
        );
      })}
    </div>
  );
};

const OceanGlowVisualizer = ({ fftData, intensity, reduceMotion }) => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-blue-900 to-blue-950">
    {[...Array(5)].map((_, i) => {
      const audioBoost = fftData ? (fftData[i * 10] || 0) * intensity : 0;
      return (
        <motion.div
          key={i}
          className="absolute bg-blue-400 rounded-full opacity-30"
          style={{
            width: `${100 + i * 50 + audioBoost * 100}px`,
            height: `${100 + i * 50 + audioBoost * 100}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
          }}
          animate={reduceMotion ? {} : {
            scale: [1, 1.2 + audioBoost, 1],
            opacity: [0.2, 0.4 + audioBoost * 0.3, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut'
          }}
        />
      );
    })}
  </div>
);

const ForestMistVisualizer = ({ fftData, intensity, reduceMotion }) => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-t from-green-900 to-emerald-800">
    {[...Array(8)].map((_, i) => {
      const audioBoost = fftData ? (fftData[i * 8] || 0) * intensity : 0;
      return (
        <motion.div
          key={i}
          className="absolute bg-green-300 rounded-full opacity-20"
          style={{
            width: `${60 + i * 30 + audioBoost * 80}px`,
            height: `${40 + i * 20 + audioBoost * 40}px`,
            bottom: `${10 + i * 8}%`,
            left: `${(i * 12) % 90}%`,
          }}
          animate={reduceMotion ? {} : {
            x: [-20, 20, -20],
            scaleX: [1, 1.5 + audioBoost, 1],
            opacity: [0.1, 0.3 + audioBoost * 0.2, 0.1]
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      );
    })}
  </div>
);

const visualScenes = {
  waveform: { component: WaveformVisualizer, name: 'Waveform', icon: Zap },
  spectrogram: { component: SpectrogramVisualizer, name: 'Spectrogram', icon: Music },
  stars: { component: StarfieldVisualizer, name: 'Starfield', icon: Star },
  fireflies: { component: FirefliesVisualizer, name: 'Fireflies', icon: Bug },
  ocean_glow: { component: OceanGlowVisualizer, name: 'Ocean Glow', icon: Waves },
  forest_mist: { component: ForestMistVisualizer, name: 'Forest Mist', icon: Wind }
};

// Enhanced sound library with better categorization
const defaultSounds = [
  // Nature Sounds
  {
    id: 'ocean_calm',
    name: 'Ocean Waves – Calm',
    asset_type: 'catalog',
    category: 'nature',
    tags: ['ocean', 'nature', 'sleep', 'relaxation'],
    description: 'Gentle waves washing over a peaceful shore',
    urls: { mp3: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3' },
    procedural_config: { noise_type: 'white', frequency: 200, oscillator_type: 'sine', volume: 0.3 }
  },
  {
    id: 'forest_rain',
    name: 'Forest Rain',
    asset_type: 'catalog',
    category: 'nature',
    tags: ['rain', 'forest', 'nature', 'sleep'],
    description: 'Soft rain falling through forest leaves',
    // Example URL, if available. Otherwise, procedural config is primary.
    // urls: { mp3: 'some_rain_sound.mp3' },
    procedural_config: { noise_type: 'pink', frequency: 600, oscillator_type: 'triangle', volume: 0.25 }
  },
  {
    id: 'crickets_evening',
    name: 'Evening Crickets',
    asset_type: 'catalog',
    category: 'nature',
    tags: ['night', 'nature', 'crickets', 'peaceful'],
    description: 'Gentle cricket chorus on a warm summer evening',
    urls: { mp3: 'https://www.soundjay.com/nature/sounds/crickets-1.mp3' },
    procedural_config: { noise_type: 'white', frequency: 1000, oscillator_type: 'square', volume: 0.15 }
  },
  {
    id: 'forest_birds',
    name: 'Forest Birds',
    asset_type: 'catalog',
    category: 'nature',
    tags: ['nature', 'birds', 'morning', 'peaceful'],
    description: 'Melodic bird songs from a lush forest canopy',
    urls: { mp3: 'https://www.soundjay.com/nature/sounds/birds-1.mp3' },
    procedural_config: { noise_type: 'pink', frequency: 800, oscillator_type: 'sine', volume: 0.2 }
  },
  {
    id: 'wind_gentle',
    name: 'Gentle Wind',
    asset_type: 'catalog',
    category: 'nature',
    tags: ['wind', 'nature', 'calm', 'meditation'],
    description: 'Soft breeze through tall grass and trees',
    // urls: { mp3: 'some_wind_sound.mp3' },
    procedural_config: { noise_type: 'pink', frequency: 300, oscillator_type: 'sine', volume: 0.25 }
  },

  // Focus & Study Sounds
  {
    id: 'white_noise',
    name: 'White Noise',
    asset_type: 'procedural',
    category: 'focus',
    tags: ['sleep', 'focus', 'masking', 'concentration'],
    description: 'Full spectrum noise for concentration and sleep',
    procedural_config: { noise_type: 'white', frequency: 400, oscillator_type: 'triangle', volume: 0.3 }
  },
  {
    id: 'pink_noise',
    name: 'Pink Noise',
    asset_type: 'procedural',
    category: 'focus',
    tags: ['sleep', 'cozy', 'gentle', 'study'],
    description: 'Warmer, softer noise perfect for relaxation',
    procedural_config: { noise_type: 'pink', frequency: 300, oscillator_type: 'sine', volume: 0.3 }
  },
  {
    id: 'brown_noise',
    name: 'Brown Noise',
    asset_type: 'procedural',
    category: 'focus',
    tags: ['deep sleep', 'focus', 'rumble', 'concentration'],
    description: 'Deep, rumbling sound for intense focus',
    procedural_config: { noise_type: 'brown', frequency: 150, oscillator_type: 'sawtooth', volume: 0.4 }
  },

  // Ambient & Atmospheric
  {
    id: 'fireplace',
    name: 'Cozy Fireplace',
    asset_type: 'catalog',
    category: 'ambient',
    tags: ['fireplace', 'cozy', 'warm', 'winter'],
    description: 'Crackling logs in a warm fireplace',
    // urls: { mp3: 'some_fireplace_sound.mp3' },
    procedural_config: { noise_type: 'brown', frequency: 200, oscillator_type: 'square', volume: 0.3 }
  },
  {
    id: 'city_rain',
    name: 'City Rain',
    asset_type: 'catalog',
    category: 'ambient',
    tags: ['rain', 'urban', 'cozy', 'study'],
    description: 'Rain pattering on city windows and streets',
    // urls: { mp3: 'some_city_rain.mp3' },
    procedural_config: { noise_type: 'pink', frequency: 500, oscillator_type: 'triangle', volume: 0.28 }
  },
  {
    id: 'tibetan_bowls',
    name: 'Tibetan Singing Bowls',
    asset_type: 'catalog',
    category: 'meditation',
    tags: ['meditation', 'spiritual', 'healing', 'zen'],
    description: 'Peaceful resonance of traditional singing bowls',
    // urls: { mp3: 'some_singing_bowls.mp3' },
    procedural_config: { noise_type: 'white', frequency: 440, oscillator_type: 'sine', volume: 0.25 }
  }
];

export default function SoundscapeStudio({ onBack }) {
  // Core state
  const [user, setUser] = useState(null);
  const [sounds, setSounds] = useState(defaultSounds);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isKidsMode, setIsKidsMode] = useState(false);

  // Enhanced UI state
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'create'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mixer state
  const [tracks, setTracks] = useState([
    { id: 'track1', soundId: 'ocean_calm', gain: 0.7, pan: 0 },
    { id: 'track2', soundId: '', gain: 0.4, pan: 0 },
    { id: 'track3', soundId: '', gain: 0.3, pan: 0 },
    { id: 'track4', soundId: '', gain: 0.2, pan: 0 }
  ]);

  // Timer state
  const [timerConfig, setTimerConfig] = useState({
    minutes: 30,
    fade_in_sec: 6,
    fade_out_sec: 10
  });

  // Visual state
  const [visualScene, setVisualScene] = useState('ocean_glow');
  const [visualIntensity, setVisualIntensity] = useState(0.6);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [masterVolume, setMasterVolume] = useState(0.8);

  // Generation state
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationConfig, setGenerationConfig] = useState({
    intensity: 0.5,
    tempo: 0.5,
    brightness: 0.5
  });

  // Audio context refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const masterGainRef = useRef(null);
  const trackNodesRef = useRef({});
  const timerIntervalRef = useRef(null);
  const fftDataRef = useRef(null);

  // Visualization data
  const [fftData, setFftData] = useState(null);
  const rafRef = useRef(null);

  // Settings
  const [reduceMotion, setReduceMotion] = useState(false);

  // Load user and data
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setIsKidsMode(currentUser?.app_settings?.kids_mode_active || false);
        setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

        // Load sounds and presets
        const [soundAssets, soundPresets] = await Promise.all([
          SoundAsset.list('-created_date', 50),
          SoundPreset.list('-created_date', 20)
        ]);

        if (soundAssets.length > 0) {
          setSounds(prev => [...prev, ...soundAssets.filter(s => !prev.find(p => p.id === s.id))]);
        }
        setPresets(soundPresets);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadData();
  }, []);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') return audioContextRef.current;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext({ latencyHint: 'interactive' });

    const masterGain = context.createGain();
    const analyser = context.createAnalyser();

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    masterGain.connect(analyser);
    analyser.connect(context.destination);
    masterGain.gain.value = 0;

    audioContextRef.current = context;
    masterGainRef.current = masterGain;
    analyserRef.current = analyser;

    return context;
  }, []);

  // Create procedural audio source
  const createProceduralSource = useCallback((sound, context) => {
    const config = sound.procedural_config || { noise_type: 'white', frequency: 400, oscillator_type: 'sine', volume: 0.3 };

    if (config.noise_type) {
      // Create noise generator
      const bufferSize = 4096;
      const noiseNode = context.createScriptProcessor(bufferSize, 1, 1);

      let lastOut = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      noiseNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);

        for (let i = 0; i < output.length; i++) {
          const white = Math.random() * 2 - 1;

          if (config.noise_type === 'white') {
            output[i] = white * 0.3;
          } else if (config.noise_type === 'pink') {
            b0 = 0.99765 * b0 + white * 0.0990460;
            b1 = 0.96300 * b1 + white * 0.2965164;
            b2 = 0.57000 * b2 + white * 1.0526913;
            output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.05;
          } else if (config.noise_type === 'brown') {
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            output[i] = lastOut * 3.5;
          }
        }
      };

      return { source: noiseNode, type: 'procedural' };
    } else {
      // Create oscillator for tonal sounds
      const oscillator = context.createOscillator();
      oscillator.type = config.oscillator_type || 'sine';
      oscillator.frequency.value = config.frequency || 400;
      
      // Add some variation for different sounds
      if (sound.id === 'crickets_evening') {
        // Create chirping effect
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.5 + Math.random() * 0.2; // Slow chirp rate with slight variation
        lfoGain.gain.value = 100 + Math.random() * 50; // Chirp intensity with variation
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();
      } else if (sound.id === 'forest_birds') {
        // Create warbling effect
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        lfo.type = 'triangle';
        lfo.frequency.value = 2 + Math.random() * 0.5; // Faster warble with slight variation
        lfoGain.gain.value = 50 + Math.random() * 20; // Warble intensity with variation
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();
      }
      
      // DO NOT START THE OSCILLATOR HERE. It will be started by the calling function.
      return { source: oscillator, type: 'oscillator' };
    }
  }, []);

  // Create audio source
  const createAudioSource = useCallback(async (sound) => {
    const context = audioContextRef.current;
    if (!context || !sound) return null;

    if (sound.asset_type === 'procedural' || !sound.urls) {
      // Use procedural generation
      return createProceduralSource(sound, context);
    }

    try {
      // Try to load audio file
      const audioUrl = sound.urls?.mp3 || sound.urls?.opus || sound.urls?.aac;
      if (!audioUrl) {
        // Fallback to procedural if no URL
        return createProceduralSource(sound, context);
      }

      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;

      return { source, type: 'buffer' };
    } catch (error) {
      console.warn('Failed to load audio file, using procedural fallback:', error);
      return createProceduralSource(sound, context);
    }
  }, [createProceduralSource]);

  // Audio parameter ramping
  const rampToValue = useCallback((param, value, duration) => {
    if (!audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;
    param.cancelScheduledValues(now);
    // Use setTargetAtTime for smoother transitions
    param.setTargetAtTime(value, now, Math.max(0.001, duration / 5));
  }, []);

  // Stop visualization
  const stopVisualization = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setFftData(null);
  }, []);

  // Start visualization
  const startVisualization = useCallback(() => {
    if (!analyserRef.current || rafRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      // The check should be inside to stop the loop
      if (!isPlaying || !analyserRef.current) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        setFftData(null); // Clear visual data when stopping
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      // Downsample for performance
      const downsampledData = [];
      const step = Math.floor(bufferLength / 64);
      for (let i = 0; i < bufferLength; i += step) {
        downsampledData.push(dataArray[i] / 255);
      }

      setFftData(downsampledData);
      fftDataRef.current = downsampledData;

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    if (!isPlaying) return;

    setIsPlaying(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Fade out master gain
    if (masterGainRef.current) {
      rampToValue(masterGainRef.current.gain, 0, timerConfig.fade_out_sec);
    }

    setTimeout(() => {
      // Stop all sources
      Object.values(trackNodesRef.current).forEach(({ source, gain, panner }) => {
        try {
          if (source && typeof source.stop === 'function') source.stop();
          if (source && typeof source.disconnect === 'function') source.disconnect();
          if (gain) gain.disconnect();
          if (panner) panner.disconnect();
        } catch (e) {
          console.warn("Error stopping audio source during handleStop:", e);
        }
      });
      trackNodesRef.current = {};
      setTimeLeft(null);
      stopVisualization();

      // Close audio context after fade-out and source stoppage
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
          .then(() => {
            audioContextRef.current = null;
            masterGainRef.current = null;
            analyserRef.current = null;
          })
          .catch(e => console.error("Error closing AudioContext during handleStop:", e));
      }

    }, timerConfig.fade_out_sec * 1000 + 50); // Add a small buffer to ensure fade completes
  }, [isPlaying, timerConfig.fade_out_sec, rampToValue, stopVisualization]);


  // Start playback - IMPROVED VERSION
  const handlePlay = useCallback(async () => {
    if (isPlaying) return;

    const context = initAudioContext();
    if (context.state === 'suspended') {
      await context.resume();
    }

    setIsPlaying(true);

    // Clear any existing track nodes to prevent duplicates or stale connections
    Object.values(trackNodesRef.current).forEach(({ source, gain, panner }) => {
      try {
        if (source && typeof source.stop === 'function') source.stop();
        if (source && typeof source.disconnect === 'function') source.disconnect();
        if (gain) gain.disconnect();
        if (panner) panner.disconnect();
      } catch (e) {
        console.warn("Error cleaning up old track nodes before new play session:", e);
      }
    });
    trackNodesRef.current = {}; // Reset track nodes ref

    // Create sources for active tracks
    for (const track of tracks) {
      if (!track.soundId) continue;

      const sound = sounds.find(s => s.id === track.soundId);
      if (!sound) continue;

      try {
        console.log(`Creating audio source for track ${track.id} with sound ${sound.name} (${sound.asset_type})`);
        
        const audioSource = await createAudioSource(sound);
        if (!audioSource) continue;

        const gainNode = context.createGain();
        const pannerNode = context.createStereoPanner();

        audioSource.source.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(masterGainRef.current);

        gainNode.gain.value = track.gain;
        pannerNode.pan.value = track.pan;

        trackNodesRef.current[track.id] = {
          source: audioSource.source,
          gain: gainNode,
          panner: pannerNode,
          type: audioSource.type,
          soundId: track.soundId
        };

        if (audioSource.type === 'buffer' || audioSource.type === 'oscillator') {
          audioSource.source.start();
        }
        // Note: procedural noiseNode does not have a start method, it starts on creation.

        console.log(`Successfully created track ${track.id} with sound ${sound.name}`);
      } catch (error) {
        console.warn(`Failed to create source for track ${track.id}:`, error);
      }
    }

    // Fade in master gain
    rampToValue(masterGainRef.current.gain, masterVolume, timerConfig.fade_in_sec);

    // Start timer
    setTimeLeft(timerConfig.minutes * 60);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          handleStop();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    // Start session tracking
    if (user && selectedPreset) {
      try {
        await SoundSession.create({
          member_id: user.id,
          preset_id: selectedPreset.id,
          started_at: new Date().toISOString(),
          timer_config: timerConfig
        });
      } catch (error) {
        console.warn('Failed to create session:', error);
      }
    }
  }, [isPlaying, tracks, sounds, timerConfig, masterVolume, user, selectedPreset, initAudioContext, createAudioSource, rampToValue, handleStop]);


  // Effect to start/stop visualization based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      startVisualization();
    } else {
      stopVisualization();
    }
    // Cleanup ensures no lingering requestAnimationFrame when isPlaying becomes false
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, startVisualization, stopVisualization]);

  // Update track parameters - FIXED VERSION
  const updateTrack = useCallback(async (trackId, field, value) => {
    // Find the current state of the track before updating the main state
    const currentTrackState = tracks.find(t => t.id === trackId);
    if (!currentTrackState) return; // Safeguard: exit if track doesn't exist
    const oldSoundId = currentTrackState.soundId;

    // Update the local state first
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, [field]: value } : track
    ));

    // Only update audio nodes if currently playing and audio context is ready
    if (!isPlaying || !audioContextRef.current || audioContextRef.current.state === 'closed') {
      return;
    }

    const trackNode = trackNodesRef.current[trackId];

    if (field === 'soundId') {
      if (oldSoundId !== value) { // If the sound ID has actually changed
        // Stop and disconnect the old source if it exists
        if (trackNode) {
          try {
            if (trackNode.source && typeof trackNode.source.stop === 'function') {
              trackNode.source.stop();
            }
            if (trackNode.source && typeof trackNode.source.disconnect === 'function') {
              trackNode.source.disconnect();
            }
            if (trackNode.gain) trackNode.gain.disconnect();
            if (trackNode.panner) trackNode.panner.disconnect();
            console.log(`Stopped and disconnected old source for track ${trackId}`);
          } catch (e) {
            console.warn("Error stopping/disconnecting old source for track:", trackId, e);
          }
          delete trackNodesRef.current[trackId]; // Remove from ref
        }

        if (value && value !== 'null' && value !== '') { // If a new sound (not 'None' or empty) is selected
          const sound = sounds.find(s => s.id === value);
          if (!sound) {
            console.warn(`Sound with ID ${value} not found.`);
            return;
          }

          try {
            const audioSource = await createAudioSource(sound);
            if (!audioSource) {
              console.warn(`Could not create audio source for sound ${value}`);
              return;
            }

            const context = audioContextRef.current;
            if (!context || context.state === 'closed') {
              console.warn('Audio context closed during track update.');
              return;
            }

            const gainNode = context.createGain();
            const pannerNode = context.createStereoPanner();

            audioSource.source.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(masterGainRef.current);

            // Use the locally found track state as a fallback, respecting 0 values
            const newTrackState = tracks.find(t => t.id === trackId) || currentTrackState;
            gainNode.gain.value = newTrackState?.gain ?? 0.5;
            pannerNode.pan.value = newTrackState?.pan ?? 0;

            trackNodesRef.current[trackId] = {
              source: audioSource.source,
              gain: gainNode,
              panner: pannerNode,
              type: audioSource.type,
              soundId: value
            };

            if (audioSource.type === 'buffer' || audioSource.type === 'oscillator') {
              audioSource.source.start();
            }
            console.log(`Successfully switched track ${trackId} to sound ${value} (${sound.name})`);
          } catch (error) {
            console.error(`Failed to switch track ${trackId} to sound ${value}:`, error);
          }
        } else {
          console.log(`Track ${trackId} cleared.`);
        }
      }
    } else { // Handle gain or pan changes for an existing, playing track
      if (trackNode) {
        if (field === 'gain' && trackNode.gain?.gain) { // Safeguard: ensure gain.gain exists
          rampToValue(trackNode.gain.gain, value, 0.1);
        }
        if (field === 'pan' && trackNode.panner?.pan) { // Safeguard: ensure panner.pan exists
          rampToValue(trackNode.panner.pan, value, 0.1);
        }
      }
    }
  }, [isPlaying, tracks, sounds, createAudioSource, rampToValue]);

  // Update master volume when playing
  useEffect(() => {
    if (isPlaying && masterGainRef.current && masterGainRef.current.gain.value !== masterVolume) {
      rampToValue(masterGainRef.current.gain, masterVolume, 0.2);
    }
  }, [masterVolume, isPlaying, rampToValue]);

  // Save preset
  const savePreset = useCallback(async () => {
    if (!user) return;

    const presetName = prompt('Enter preset name:');
    if (!presetName) return;

    try {
      const newPreset = await SoundPreset.create({
        name: presetName,
        owner_member_id: user.id,
        tracks: tracks.filter(t => t.soundId).map(t => ({
          sound_id: t.soundId,
          gain: t.gain,
          pan: t.pan
        })),
        visual_scene_id: visualScene,
        timer: timerConfig,
        kids_mode: isKidsMode
      });

      setPresets(prev => [newPreset, ...prev]);
      setSelectedPreset(newPreset);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset. Please try again.');
    }
  }, [user, tracks, visualScene, timerConfig, isKidsMode]);

  // Load preset
  const loadPreset = useCallback((preset) => {
    setSelectedPreset(preset);
    setTracks(prev => {
      const newTracks = [...prev];
      preset.tracks.forEach((presetTrack, index) => {
        if (newTracks[index]) {
          newTracks[index] = {
            ...newTracks[index],
            soundId: presetTrack.sound_id,
            gain: presetTrack.gain,
            pan: presetTrack.pan
          };
        } else {
            // If preset has more tracks than current setup, add new ones (up to a limit if needed)
            newTracks.push({
                id: `track${prev.length + 1 + index}`, // simple unique ID
                soundId: presetTrack.sound_id,
                gain: presetTrack.gain,
                pan: presetTrack.pan
            });
        }
      });
      // If preset has fewer tracks, clear remaining
      if (preset.tracks.length < newTracks.length) {
          for (let i = preset.tracks.length; i < newTracks.length; i++) {
              newTracks[i] = { ...newTracks[i], soundId: '', gain: 0.5, pan: 0 }; // Clear/reset
          }
      }
      return newTracks;
    });

    if (preset.visual_scene_id) {
      setVisualScene(preset.visual_scene_id);
    }

    if (preset.timer) {
      setTimerConfig(preset.timer);
    }
    setIsKidsMode(preset.kids_mode || false); // Load kids mode from preset
  }, []);

  // Generate custom sound
  const generateCustomSound = useCallback(async () => {
    if (!generationPrompt.trim() || !user) return;

    setIsGenerating(true);

    try {
      // Create generation request
      const generationRequest = await GeneratedSound.create({
        owner_member_id: user.id,
        prompt: generationPrompt,
        generation_config: generationConfig
      });

      // Use AI to create a procedural sound configuration
      const configResponse = await InvokeLLM({
        prompt: `Based on this sound description: "${generationPrompt}", create a procedural audio configuration.
        Consider the intensity (${generationConfig.intensity}), tempo (${generationConfig.tempo}), and brightness (${generationConfig.brightness}).

        Return a JSON object with:
        - noise_type: "white", "pink", or "brown" (optional, default to null if tonal)
        - frequency: number (50-2000) (if tonal)
        - oscillator_type: "sine", "square", "sawtooth", or "triangle" (if tonal)
        - volume: number (0.1-0.5)
        - name: descriptive name for the sound
        - tags: array of relevant tags
        - category: "nature", "focus", "ambient", or "meditation"
        - description: short description of the sound
        
        Example for tonal sound: { "noise_type": null, "frequency": 440, "oscillator_type": "sine", ... }
        Example for noise sound: { "noise_type": "pink", "frequency": null, "oscillator_type": null, ... }
        `,
        response_json_schema: {
          type: "object",
          properties: {
            noise_type: { type: ["string", "null"], enum: ["white", "pink", "brown", null] },
            frequency: { type: ["number", "null"] },
            oscillator_type: { type: ["string", "null"], enum: ["sine", "square", "sawtooth", "triangle", null] },
            volume: { type: "number" },
            name: { type: "string" },
            tags: { type: "array", items: { type: "string" }},
            category: { type: "string" },
            description: { type: "string" }
          },
          required: ["volume", "name", "tags", "category", "description"]
        }
      });

      // Construct procedural_config based on AI response
      const procedural_config = {};
      if (configResponse.noise_type) {
        procedural_config.noise_type = configResponse.noise_type;
        procedural_config.volume = configResponse.volume;
      } else if (configResponse.oscillator_type && configResponse.frequency) {
        procedural_config.oscillator_type = configResponse.oscillator_type;
        procedural_config.frequency = configResponse.frequency;
        procedural_config.volume = configResponse.volume;
      } else {
        // Fallback if AI doesn't provide coherent config, e.g., default to white noise
        procedural_config.noise_type = 'white';
        procedural_config.volume = configResponse.volume || 0.3;
      }


      // Create the sound asset
      const newSound = await SoundAsset.create({
        name: configResponse.name,
        asset_type: 'generated',
        tags: configResponse.tags,
        category: configResponse.category,
        description: configResponse.description,
        procedural_config: procedural_config,
        meta: {
          source: 'ai_generated',
          prompt: generationPrompt,
          generation_config: JSON.stringify(generationConfig)
        }
      });

      // Update the generation request
      await GeneratedSound.update(generationRequest.id, {
        status: 'ready',
        asset_id: newSound.id
      });

      // Add to sounds list
      setSounds(prev => [newSound, ...prev]);

      // Automatically assign to first empty track
      const emptyTrack = tracks.find(t => !t.soundId);
      if (emptyTrack) {
        await updateTrack(emptyTrack.id, 'soundId', newSound.id);
      }

      setGenerationPrompt('');

    } catch (error) {
      console.error('Failed to generate sound:', error);
      alert('Failed to generate custom sound. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [generationPrompt, generationConfig, user, tracks, updateTrack]);

  // Format time display
  const formatTime = useCallback((seconds) => {
    if (seconds === null || seconds < 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Filter sounds for mixer dropdowns (only by kids mode) AND navigation
  const filteredSounds = useMemo(() => {
    if (!isKidsMode) return sounds;
    return sounds.filter(sound =>
      sound.tags?.some(tag => ['sleep', 'nature', 'calm', 'gentle', 'meditation', 'peaceful'].includes(tag.toLowerCase())) ||
      sound.asset_type === 'procedural' // Procedural sounds are generally safe for kids mode
    );
  }, [sounds, isKidsMode]);

  // Filter sounds for the library browsing tab (category, search, kids mode)
  const libraryFilteredSounds = useMemo(() => {
    let currentFiltered = sounds; // Start with all sounds

    // Apply category filter
    if (selectedCategory !== 'all') {
      currentFiltered = currentFiltered.filter(sound => sound.category === selectedCategory);
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      currentFiltered = currentFiltered.filter(sound =>
        sound.name.toLowerCase().includes(query) ||
        sound.description?.toLowerCase().includes(query) ||
        sound.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply kids mode filter *again* for the library view, ensuring compliance
    if (isKidsMode) {
      currentFiltered = currentFiltered.filter(sound =>
        sound.tags?.some(tag => ['sleep', 'nature', 'calm', 'gentle', 'meditation', 'peaceful'].includes(tag.toLowerCase())) ||
        sound.asset_type === 'procedural'
      );
    }
    return currentFiltered;
  }, [sounds, selectedCategory, searchQuery, isKidsMode]);

  // Get current visual component
  const VisualComponent = visualScenes[visualScene]?.component || WaveformVisualizer;

  // Navigation methods for cycling through sounds
  const navigateSound = (trackId, direction) => {
    const currentTrack = tracks.find(t => t.id === trackId);
    const currentSoundId = currentTrack?.soundId;

    // Get available sounds (filtered)
    const availableSounds = filteredSounds.filter(sound => sound.id); // Ensure they have IDs

    if (availableSounds.length === 0) return;

    let newIndex;

    if (!currentSoundId || currentSoundId === 'null') { // Account for 'null' value from Select
      // If no sound is selected, start with the first one
      newIndex = 0;
    } else {
      // Find current sound index
      const currentIndex = availableSounds.findIndex(sound => sound.id === currentSoundId);

      if (currentIndex === -1) {
        // Current sound not found in filtered list, start from beginning
        newIndex = 0;
      } else {
        // Navigate to next/previous
        if (direction === 'next') {
          newIndex = (currentIndex + 1) % availableSounds.length; // Wrap to beginning
        } else {
          newIndex = (currentIndex - 1 + availableSounds.length) % availableSounds.length; // Wrap to end
        }
      }
    }

    const newSound = availableSounds[newIndex];
    if (newSound) {
      updateTrack(trackId, 'soundId', newSound.id);
    }
  };

  // Get current sound info for display
  const getCurrentSoundInfo = (trackId) => {
    const currentTrack = tracks.find(t => t.id === trackId);
    const currentSoundId = currentTrack?.soundId;

    if (!currentSoundId || currentSoundId === 'null') return null;

    return filteredSounds.find(sound => sound.id === currentSoundId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Stop all audio sources if they are still active
      Object.values(trackNodesRef.current).forEach(({ source, gain, panner }) => {
        try {
          if (source && typeof source.stop === 'function') source.stop();
          if (source && typeof source.disconnect === 'function') source.disconnect();
          if (gain) gain.disconnect();
          if (panner) panner.disconnect();
        } catch (e) {
          console.warn("Error during unmount cleanup of audio source:", e);
        }
      });
      trackNodesRef.current = {}; // Clear track nodes

      // Close the audio context if it's open
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
          .then(() => {
            console.log("AudioContext closed on unmount.");
          })
          .catch(e => console.error("Error closing AudioContext on unmount:", e));
      }
      // Clear refs
      audioContextRef.current = null;
      masterGainRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Music className="w-8 h-8 text-purple-600" />
                Therapeutic Soundscapes
              </h1>
              <p className="text-gray-600">Create your perfect ambience for relaxation and focus</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isKidsMode && (
              <Badge className="bg-pink-100 text-pink-800 border-pink-200 flex items-center gap-1">
                <Baby className="w-3 h-3" />
                Kids Mode
              </Badge>
            )}

            {selectedPreset && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {selectedPreset.name}
              </Badge>
            )}

            <Button onClick={savePreset} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Preset
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Sound Selection & Creation */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sound Library & Creation Tabs */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Sound Library
                  </CardTitle>
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <Button
                      variant={activeTab === 'library' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('library')}
                      className="rounded-md"
                    >
                      Browse Sounds
                    </Button>
                    <Button
                      variant={activeTab === 'create' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('create')}
                      className="rounded-md"
                    >
                      Create Custom
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                {activeTab === 'library' ? (
                  <>
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search sounds..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="nature">Nature</SelectItem>
                          <SelectItem value="focus">Focus & Study</SelectItem>
                          <SelectItem value="ambient">Ambient</SelectItem>
                          <SelectItem value="meditation">Meditation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sound Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {libraryFilteredSounds.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500">No sounds found matching your criteria.</p>
                      ) : (
                        libraryFilteredSounds.map((sound) => (
                          <Card
                            key={sound.id}
                            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{sound.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{sound.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {sound.tags?.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {sound.asset_type === 'procedural' && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Procedural
                                    </Badge>
                                  )}
                                  {sound.asset_type === 'generated' && (
                                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      AI Generated
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click effect
                                  const emptyTrack = tracks.find(t => !t.soundId);
                                  if (emptyTrack) {
                                    updateTrack(emptyTrack.id, 'soundId', sound.id);
                                  } else {
                                    alert('All tracks are full. Please clear a track to add a new sound.');
                                  }
                                }}
                              >
                                Add to Mix
                              </Button>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  /* Custom Sound Creation */
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                      <h3 className="text-lg font-semibold mb-2">Create Your Perfect Sound</h3>
                      <p className="text-gray-600 mb-4">
                        Describe the sound you want and our AI will create it for you.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sound-description">Describe your ideal sound</Label>
                        <Textarea
                          id="sound-description"
                          value={generationPrompt}
                          onChange={(e) => setGenerationPrompt(e.target.value)}
                          placeholder="e.g., 'gentle rain on leaves with distant thunder, warm and cozy...' or 'soft ocean waves at sunset with seagulls in the distance...'"
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      {/* AI Generation Parameters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Intensity</Label>
                          <Slider
                            value={[generationConfig.intensity]}
                            onValueChange={([value]) => setGenerationConfig(prev => ({ ...prev, intensity: value }))}
                            max={1}
                            step={0.1}
                            className="mt-2"
                          />
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {generationConfig.intensity < 0.3 ? 'Gentle' :
                             generationConfig.intensity < 0.7 ? 'Moderate' : 'Intense'}
                          </div>
                        </div>

                        <div>
                          <Label>Tempo</Label>
                          <Slider
                            value={[generationConfig.tempo]}
                            onValueChange={([value]) => setGenerationConfig(prev => ({ ...prev, tempo: value }))}
                            max={1}
                            step={0.1}
                            className="mt-2"
                          />
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {generationConfig.tempo < 0.3 ? 'Slow' :
                             generationConfig.tempo < 0.7 ? 'Medium' : 'Fast'}
                          </div>
                        </div>

                        <div>
                          <Label>Brightness</Label>
                          <Slider
                            value={[generationConfig.brightness]}
                            onValueChange={([value]) => setGenerationConfig(prev => ({ ...prev, brightness: value }))}
                            max={1}
                            step={0.1}
                            className="mt-2"
                          />
                          <div className="text-xs text-gray-500 mt-1 text-center">
                            {generationConfig.brightness < 0.3 ? 'Dark' :
                             generationConfig.brightness < 0.7 ? 'Balanced' : 'Bright'}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={generateCustomSound}
                        disabled={!generationPrompt.trim() || isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating Your Sound...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Custom Sound
                          </>
                        )}
                      </Button>

                      {/* Example Prompts */}
                      <div className="mt-6">
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                          Need inspiration? Try these examples:
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            "Gentle rainfall on a tin roof with distant rolling thunder",
                            "Crackling campfire with soft wind through pine trees",
                            "Ocean waves on a pebble beach at dawn with seabirds",
                            "Soft hum of a coffee shop with muffled conversations",
                            "Wind chimes on a breezy summer evening with cicadas",
                            "Distant train passing through countryside at night"
                          ].map((example) => (
                            <Button
                              key={example}
                              variant="ghost"
                              size="sm"
                              onClick={() => setGenerationPrompt(example)}
                              className="justify-start text-left p-2 h-auto text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            >
                              "{example}"
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Mixer with Navigation */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sound Mixer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tracks.map((track, index) => {
                  const currentSound = getCurrentSoundInfo(track.id);
                  const hasMultipleSounds = filteredSounds.length > 1;

                  return (
                    <div key={track.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <Label className="col-span-2 font-medium text-sm">
                          Track {index + 1}
                        </Label>

                        {/* Sound Selection with Navigation */}
                        <div className="col-span-5 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateSound(track.id, 'prev')}
                            disabled={!hasMultipleSounds}
                            className="h-8 w-8 flex-shrink-0"
                            title="Previous sound"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>

                          <Select
                            value={track.soundId || ''}
                            onValueChange={(value) => updateTrack(track.id, 'soundId', value === 'null' ? null : value)}
                          >
                            <SelectTrigger className="flex-1 min-w-0">
                              <SelectValue placeholder="Choose sound..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="null">None</SelectItem>
                              {filteredSounds.map(sound => (
                                <SelectItem key={sound.id} value={sound.id}>
                                  <div className="flex items-center gap-2">
                                    {sound.asset_type === 'procedural' && <Zap className="w-3 h-3" />}
                                    {sound.asset_type === 'generated' && <Sparkles className="w-3 h-3" />}
                                    <span className="truncate">{sound.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateSound(track.id, 'next')}
                            disabled={!hasMultipleSounds}
                            className="h-8 w-8 flex-shrink-0"
                            title="Next sound"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500 mb-1 block">Volume</Label>
                          <Slider
                            value={[track.gain]}
                            onValueChange={([value]) => updateTrack(track.id, 'gain', value)}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500 mb-1 block">Pan</Label>
                          <Slider
                            value={[track.pan]}
                            onValueChange={([value]) => updateTrack(track.id, 'pan', value)}
                            min={-1}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <Volume2 className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Current Sound Info */}
                      {currentSound && (
                        <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {currentSound.asset_type === 'procedural' && <Zap className="w-3 h-3 text-blue-600" />}
                                {currentSound.asset_type === 'generated' && <Sparkles className="w-3 h-3 text-purple-600" />}
                                <h4 className="font-medium text-sm text-gray-900 truncate">{currentSound.name}</h4>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{currentSound.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {currentSound.tags?.slice(0, 4).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {filteredSounds.findIndex(s => s.id === currentSound.id) + 1} of {filteredSounds.length}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {!currentSound && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 text-center">
                          <p className="text-sm text-gray-500">
                            No sound selected. Use the dropdown or navigation arrows to choose a sound.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Master Controls */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="font-medium">Master Volume</Label>
                      <div className="w-32">
                        <Slider
                          value={[masterVolume]}
                          onValueChange={([value]) => setMasterVolume(value)}
                          max={1}
                          step={0.01}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPlaying ? (
                        <Button onClick={handleStop} className="bg-red-600 hover:bg-red-700 text-white">
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button onClick={handlePlay} className="bg-green-600 hover:bg-green-700 text-white">
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer Controls */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Timer & Session
                  {timeLeft !== null && (
                    <Badge className="ml-auto bg-blue-100 text-blue-800 text-lg px-3 py-1">
                      {formatTime(timeLeft)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Select
                      value={timerConfig.minutes.toString()}
                      onValueChange={(value) => setTimerConfig(prev => ({ ...prev, minutes: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 30, 45, 60, 75, 90, 120].map(mins => (
                          <SelectItem key={mins} value={mins.toString()}>
                            {mins} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Fade In (seconds)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="15"
                      value={timerConfig.fade_in_sec}
                      onChange={(e) => setTimerConfig(prev => ({ ...prev, fade_in_sec: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label>Fade Out (seconds)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={timerConfig.fade_out_sec}
                      onChange={(e) => setTimerConfig(prev => ({ ...prev, fade_out_sec: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle>My Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {presets.map(preset => (
                    <Button
                      key={preset.id}
                      variant={selectedPreset?.id === preset.id ? "default" : "outline"}
                      onClick={() => loadPreset(preset)}
                      className="justify-start text-left h-auto p-3"
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {preset.tracks.length} tracks • {preset.timer?.minutes || 30}min
                        </div>
                        {preset.kids_mode && (
                          <Badge className="mt-1 bg-pink-100 text-pink-700 text-xs">
                            Kids
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Visualization */}
          <div className="space-y-6">
            {/* Visual Scene */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Visual Scene
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={visualScene} onValueChange={setVisualScene}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(visualScenes).map(([key, scene]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <scene.icon className="w-4 h-4" />
                          {scene.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <Label>Visual Intensity</Label>
                  <Slider
                    value={[visualIntensity]}
                    onValueChange={([value]) => setVisualIntensity(value)}
                    max={1}
                    step={0.05}
                  />
                </div>

                {/* Visualization Canvas */}
                <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
                  <VisualComponent
                    fftData={fftData}
                    intensity={visualIntensity}
                    reduceMotion={reduceMotion}
                  />

                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/60 text-center">
                        <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Start playback to see visuals</p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Visuals react to your audio in real-time.
                  {reduceMotion && " Motion effects are reduced based on your system preferences."}
                </p>
              </CardContent>
            </Card>

            {/* Session Stats */}
            {user && (
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Wellness Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Today's Sessions</span>
                      <Badge variant="outline">3</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Time</span>
                      <Badge variant="outline">2h 15m</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Favorite Scene</span>
                      <Badge variant="outline">Ocean Glow</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Streak</span>
                      <Badge className="bg-green-100 text-green-800">7 days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
