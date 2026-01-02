import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wind, PlayCircle, Volume2, VolumeX, Palette, Crown, Waves, Play, Sparkles, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { toast } from 'sonner';
import BreathingExercisePlayer from '@/components/breathing/BreathingExercisePlayer';
import AIBible from '@/components/mindfulness/AIBible';
import PersonalizedMeditationGenerator from '@/components/meditation/PersonalizedMeditationGenerator';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Dark Ocean Sanctuary Background with Advanced Effects
const OceanSanctuary = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {/* Deep Ocean Gradient Background */}
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          'linear-gradient(to bottom, #0a1929 0%, #0d2d4a 30%, #0f3a5f 60%, #144a73 100%)',
          'linear-gradient(to bottom, #0d2d4a 0%, #0a1929 30%, #144a73 60%, #1a5a8a 100%)',
          'linear-gradient(to bottom, #0a1929 0%, #0d2d4a 30%, #0f3a5f 60%, #144a73 100%)'
        ]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Deep Water Mist Layers */}
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={`mist-${i}`}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${50 + i * 10}% ${30 + i * 15}%, rgba(6, 182, 212, ${0.1 - i * 0.02}), transparent 60%)`
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 15 + i * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 2
        }}
      />
    ))}

    {/* Bioluminescent Ripples */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={`ripple-${i}`}
        className="absolute left-1/2 top-1/2"
        style={{
          width: '100px',
          height: '100px',
          border: '2px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        animate={{
          scale: [1, 4, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeOut",
          delay: i * 1.6
        }}
      />
    ))}

    {/* Dark Ocean Waves */}
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={`wave-${i}`}
        className="absolute bottom-0 left-0 right-0"
        style={{ height: `${150 + i * 50}px`, opacity: 0.2 - i * 0.05 }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 25 + i * 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <path
            d="M0,100 Q150,80 300,100 T600,100 T900,100 T1200,100 L1200,200 L0,200 Z"
            fill={`rgba(6, 182, 212, ${0.15 - i * 0.03})`}
          />
        </svg>
      </motion.div>
    ))}

    {/* Bioluminescent Bubbles */}
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={`bubble-${i}`}
        className="absolute rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          bottom: `-${Math.random() * 20}%`,
          width: `${15 + Math.random() * 30}px`,
          height: `${15 + Math.random() * 30}px`,
          background: 'radial-gradient(circle at 30% 30%, rgba(14, 165, 233, 0.7), rgba(3, 105, 161, 0.3))',
          boxShadow: '0 8px 16px rgba(6, 182, 212, 0.4), inset 0 -2px 8px rgba(14, 165, 233, 0.5)',
          backdropFilter: 'blur(2px)'
        }}
        animate={{
          y: [0, -window.innerHeight - 100],
          x: [0, Math.random() * 100 - 50],
          opacity: [0, 0.7, 0.7, 0]
        }}
        transition={{
          duration: 15 + Math.random() * 10,
          repeat: Infinity,
          ease: "easeOut",
          delay: Math.random() * 10
        }}
      />
    ))}

    {/* Moonlight Rays from Surface */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={`ray-${i}`}
        className="absolute top-0"
        style={{
          left: `${i * 20}%`,
          width: '2px',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(56, 189, 248, 0.25), transparent)',
          transformOrigin: 'top'
        }}
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scaleY: [1, 1.2, 1]
        }}
        transition={{
          duration: 6 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5
        }}
      />
    ))}

    {/* Glowing Jellyfish */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`jellyfish-${i}`}
        className="absolute"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, 15, -15, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 12 + Math.random() * 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 1.5
        }}
      >
        <div className="w-6 h-6 rounded-full bg-cyan-400/40 blur-sm" />
      </motion.div>
    ))}
  </div>
);

const THERAPEUTIC_ACTIVITIES = [
  { id: 'belly', name: 'Belly Breathing', description: 'Diaphragmatic breathing for deep relaxation.', icon: '⚡', color: 'from-orange-500 to-amber-500', page: 'ExercisePlayer?game_key=belly_breathing' },
  { id: 'qigong', name: 'Energy Flow (Qigong)', description: 'Ancient practice combining breath, movement, and mindfulness to circulate energy.', icon: '✨', color: 'from-emerald-500 to-teal-500', page: 'ExercisePlayer?game_key=qigong' },
  { id: 'color', name: 'Color Match', description: 'Fast-paced color matching to enhance processing speed.', icon: '🎨', color: 'from-blue-500 to-indigo-500', page: 'MindfulGames' },
  { id: 'sequence', name: 'Sequence Memory', description: 'Simon-style game to boost working memory.', icon: '🧠', color: 'from-purple-500 to-pink-500', page: 'MindfulGames' }
];

const MINDFUL_GAMES = [
  { id: 'sudoku', name: 'Sudoku Puzzle', description: 'Classic logic puzzle for mental clarity and focus.', icon: '🔢', color: 'from-indigo-500 to-purple-600', page: 'MindfulGames' },
  { id: 'jigsaw', name: 'Nature Jigsaw', description: 'Relax and solve a beautiful nature-themed jigsaw puzzle.', icon: '🧩', color: 'from-emerald-500 to-teal-600', page: 'JigsawPuzzle' },
  { id: 'racing', name: '3D Speed Racing', description: 'High-speed competitive racing with realistic controls.', icon: '🏎️', color: 'from-red-500 to-orange-600', page: 'MindfulGames' },
  { id: 'box', name: 'Box Breathing', description: '4-4-4-4 breathing pattern for stress management.', icon: '💨', color: 'from-cyan-500 to-blue-600', page: 'ExercisePlayer?game_key=box_breathing' },
  { id: '478', name: '4-7-8 Breathing', description: 'Dr. Weil\'s relaxation technique for anxiety and sleep.', icon: '💙', color: 'from-blue-600 to-indigo-700', page: 'ExercisePlayer?game_key=478_breathing' },
  { id: 'coherent', name: 'Coherent Breathing', description: 'Heart-brain synchronization with 5-5 breathing.', icon: '❤️', color: 'from-pink-500 to-rose-600', page: 'ExercisePlayer?game_key=coherent_breathing' }
];

const CREATOR_SUITE = [
  { id: 'content', name: 'Content Hub', description: 'Design, schedule, and manage your social media content.', icon: Waves, color: 'from-slate-600 to-gray-700' },
  { id: 'email', name: 'Email Center', description: 'Compose and send emails directly from the app.', icon: Palette, color: 'from-blue-500 to-cyan-600' }
];

export default function MindfulnessHub() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [oceanSoundEnabled, setOceanSoundEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const audioContextRef = useRef(null);
  const nodesRef = useRef({});
  const crashTimeoutsRef = useRef([]);

  // Fetch breathing exercises
  const { data: breathingExercises = [] } = useQuery({
    queryKey: ['breathingExercises'],
    queryFn: () => base44.entities.BreathingExercise.list(),
    initialData: []
  });

  // Fetch user data for meditation history
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    return () => {
      // Clean up wave crash timeouts
      crashTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      crashTimeoutsRef.current = [];

      if (audioContextRef.current) {
        Object.values(nodesRef.current).forEach(node => {
          try {
            if (node && typeof node.stop === 'function') node.stop();
            if (node && typeof node.disconnect === 'function') node.disconnect();
          } catch (e) {
            // console.warn("Error stopping/disconnecting audio node:", e); // For debugging
          }
        });
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.error("Error closing audio context:", e);
        }
        audioContextRef.current = null;
        nodesRef.current = {};
      }
    };
  }, []);

  // Helper function to schedule a single wave crash
  const scheduleWaveCrash = () => {
    if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;

    const audioContext = audioContextRef.current;

    const createCrash = () => {
      if (!audioContextRef.current || audioContextRef.current.state !== 'running') {
        // If conditions change during a scheduled interval, stop
        crashTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        crashTimeoutsRef.current = [];
        return;
      }

      // Realistic wave crash with layered frequencies
      const crash1 = audioContext.createOscillator();
      const crash2 = audioContext.createOscillator();
      const crash3 = audioContext.createOscillator();
      const crashGain = audioContext.createGain();
      const crashFilter = audioContext.createBiquadFilter();
      const panNode = audioContext.createStereoPanner();

      // Multiple frequency layers for realistic wave
      crash1.type = 'sawtooth';
      crash1.frequency.setValueAtTime(35 + Math.random() * 25, audioContext.currentTime); // Low rumble
      
      crash2.type = 'sine';
      crash2.frequency.setValueAtTime(70 + Math.random() * 35, audioContext.currentTime); // Mid-range wash
      
      crash3.type = 'triangle';
      crash3.frequency.setValueAtTime(140 + Math.random() * 40, audioContext.currentTime); // Higher frequency splash

      // Lowpass filter for muffled ocean sound
      crashFilter.type = 'lowpass';
      crashFilter.frequency.setValueAtTime(350 + Math.random() * 250, audioContext.currentTime); // Variable cutoff
      crashFilter.Q.setValueAtTime(1.8 + Math.random() * 0.8, audioContext.currentTime); // Resonant Q

      // Slight stereo panning for 3D effect
      panNode.pan.setValueAtTime((Math.random() - 0.5) * 0.3, audioContext.currentTime);

      const now = audioContext.currentTime;
      const volume = 0.28; // Hardcoded maximum volume for crashes

      // Natural wave envelope: distant swell → build → crash → rush → foam → retreat
      crashGain.gain.setValueAtTime(0, now);
      crashGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.9);  // Distant swell
      crashGain.gain.linearRampToValueAtTime(volume * 0.85, now + 1.3);  // Wave building
      crashGain.gain.linearRampToValueAtTime(volume * 1.1, now + 1.6);   // Peak crash
      crashGain.gain.exponentialRampToValueAtTime(volume * 0.3, now + 3.2); // Water rush
      crashGain.gain.exponentialRampToValueAtTime(volume * 0.1, now + 5);  // Foam
      crashGain.gain.exponentialRampToValueAtTime(0.001, now + 7);      // Retreat

      // Connect nodes
      crash1.connect(crashFilter);
      crash2.connect(crashFilter);
      crash3.connect(crashFilter);
      crashFilter.connect(crashGain);
      crashGain.connect(panNode);
      panNode.connect(audioContext.destination);

      crash1.start(now);
      crash2.start(now);
      crash3.start(now);
      crash1.stop(now + 7);
      crash2.stop(now + 7);
      crash3.stop(now + 7);

      // Natural variation in wave timing (5-9 seconds between waves)
      const nextDelay = 5000 + Math.random() * 4000;
      const timeoutId = setTimeout(createCrash, nextDelay);
      crashTimeoutsRef.current.push(timeoutId);
    };

    // Initial call to start the chain
    createCrash();
  };

  const enableOceanSound = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      console.log('🌊 Creating natural therapeutic ocean soundscape...');

      // 1. DEEP OCEAN RUMBLE (35 Hz) - Therapeutic bass you can feel
      const deepOcean = audioContext.createOscillator();
      const deepGain = audioContext.createGain();
      deepOcean.type = 'sine';
      deepOcean.frequency.setValueAtTime(35, audioContext.currentTime); // Very low frequency
      deepGain.gain.setValueAtTime(0.22, audioContext.currentTime); // Hardcoded volume
      deepOcean.connect(deepGain);
      deepGain.connect(audioContext.destination);
      deepOcean.start();
      nodesRef.current.deepOcean = deepOcean;
      nodesRef.current.deepGain = deepGain;

      // Slow breathing modulation
      const deepLFO = audioContext.createOscillator();
      const deepLFOGain = audioContext.createGain();
      deepLFO.type = 'sine';
      deepLFO.frequency.setValueAtTime(0.04, audioContext.currentTime); // Very slow LFO
      deepLFOGain.gain.setValueAtTime(0.06, audioContext.currentTime); // Modulation depth
      deepLFO.connect(deepLFOGain);
      deepLFOGain.connect(deepGain.gain); // Modulate the gain of the deep rumble
      deepLFO.start();
      nodesRef.current.deepLFO = deepLFO;
      nodesRef.current.deepLFOGain = deepLFOGain;

      // 2. PINK NOISE - Natural water texture and foam
      const bufferSize = 4 * audioContext.sampleRate; // 4 seconds of noise
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      
      // Generate pink noise (1/f noise) - more natural sounding
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        noiseData[i] *= 0.11; // Scale to fit within [-1, 1]
        b6 = white * 0.115926;
      }

      const pinkNoise = audioContext.createBufferSource();
      pinkNoise.buffer = noiseBuffer;
      pinkNoise.loop = true; // Loop the noise indefinitely

      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'bandpass'; // Bandpass filter to shape the noise
      noiseFilter.frequency.setValueAtTime(1100, audioContext.currentTime); // Center frequency
      noiseFilter.Q.setValueAtTime(0.7, audioContext.currentTime); // Broad Q

      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.14, audioContext.currentTime); // Hardcoded volume

      pinkNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      pinkNoise.start();
      nodesRef.current.pinkNoise = pinkNoise;
      nodesRef.current.noiseGain = noiseGain;

      // Organic foam variation
      const noiseLFO = audioContext.createOscillator();
      const noiseLFOGain = audioContext.createGain();
      noiseLFO.type = 'sine';
      noiseLFO.frequency.setValueAtTime(0.25, audioContext.currentTime); // Slower LFO for texture
      noiseLFOGain.gain.setValueAtTime(0.05, audioContext.currentTime); // Modulation depth
      noiseLFO.connect(noiseLFOGain);
      noiseLFOGain.connect(noiseGain.gain); // Modulate the gain of the pink noise
      noiseLFO.start();
      nodesRef.current.noiseLFO = noiseLFO;
      nodesRef.current.noiseLFOGain = noiseLFOGain;


      // 3. DISTANT ROLLING WAVES - Subtle background
      const distantWave = audioContext.createOscillator();
      const distantGain = audioContext.createGain();
      const distantFilter = audioContext.createBiquadFilter();

      distantWave.type = 'sine';
      distantWave.frequency.setValueAtTime(170, audioContext.currentTime); // Higher frequency for distant sound
      distantFilter.type = 'lowpass';
      distantFilter.frequency.setValueAtTime(260, audioContext.currentTime); // Filter to make it sound distant
      distantGain.gain.setValueAtTime(0.05, audioContext.currentTime); // Hardcoded volume

      distantWave.connect(distantFilter);
      distantFilter.connect(distantGain);
      distantGain.connect(audioContext.destination);
      distantWave.start();
      nodesRef.current.distantWave = distantWave;
      nodesRef.current.distantGain = distantGain;

      // Add subtle LFO to distant waves for rolling motion
      const distantLFO = audioContext.createOscillator();
      const distantLFOGain = audioContext.createGain();
      distantLFO.type = 'sine';
      distantLFO.frequency.setValueAtTime(0.12, audioContext.currentTime); // Slow LFO
      distantLFOGain.gain.setValueAtTime(0.03, audioContext.currentTime); // Small modulation depth
      distantLFO.connect(distantLFOGain);
      distantLFOGain.connect(distantGain.gain); // Modulate the gain of the distant waves
      distantLFO.start();
      nodesRef.current.distantLFO = distantLFO;
      nodesRef.current.distantLFOGain = distantLFOGain;

      // 4. START REALISTIC WAVE CRASHES
      scheduleWaveCrash();

      setOceanSoundEnabled(true);
      setShowAudioPrompt(false);
      toast.success('🌊 Natural ocean waves now playing');
      console.log('✅ Therapeutic ocean soundscape active');
    } catch (error) {
      console.error('Error creating ocean sound:', error);
      toast.error('Could not start ocean sounds');
      setShowAudioPrompt(false);
    }
  };

  const toggleOceanSound = async () => {
    if (!audioContextRef.current) {
      await enableOceanSound(); // If no context, create and enable
      return;
    }

    try {
      if (oceanSoundEnabled) {
        await audioContextRef.current.suspend();
        // Clear all pending wave crash timeouts
        crashTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        crashTimeoutsRef.current = []; // Reset the array
        setOceanSoundEnabled(false);
        toast.info('🔇 Ocean paused');
        console.log('⏸️ Ocean sounds paused');
      } else {
        await audioContextRef.current.resume();
        // Restart wave crash scheduler
        scheduleWaveCrash();
        setOceanSoundEnabled(true);
        toast.success('🌊 Ocean resumed');
        console.log('▶️ Ocean sounds resumed');
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('Error with audio playback. Trying to re-initialize.');
      // If error, try to recreate the context
      await enableOceanSound();
    }
  };

  const shouldShow = (section) => {
    if (activeFilter === 'all') return true;
    if (section === 'meditation' && activeFilter === 'meditation') return true;
    if (section === 'breathing' && activeFilter === 'breathing') return true;
    if (section === 'bible' && activeFilter === 'bible') return true;
    if (section === 'therapeutic' && activeFilter === 'therapeutic') return true;
    if (section === 'games' && activeFilter === 'games') return true;
    if (section === 'creator' && activeFilter === 'creator') return true;
    if (section === 'creative' && activeFilter === 'creative') return true;
    return false;
  };

  const filterButtons = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'meditation', label: 'AI Meditation', icon: Sparkles },
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'bible', label: 'Bible', icon: BookOpen },
    { id: 'therapeutic', label: 'Therapeutic', icon: Waves },
    { id: 'games', label: 'Games', icon: Crown },
    { id: 'creative', label: 'Creative', icon: Palette }
  ];

  // Wave-synchronized floating animation for cards
  const cardFloatVariants = {
    animate: (i) => ({
      y: [0, -12, 0],
      rotateY: [0, 2, 0],
      rotateX: [0, -1, 0],
      transition: {
        duration: 6 + (i % 3),
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2
      }
    })
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "AI Mindfulness & Mental Wellness Hub",
    "description": "AI-guided meditation, breathing exercises, stress relief, and mental wellness support with personalized mindfulness practices.",
    "specialty": "Mental Health, Mindfulness, Stress Management",
    "medicalAudience": {
      "@type": "MedicalAudience",
      "audienceType": "General Public, Mental Health Seekers"
    }
  };

  return (
    <>
      <SEO
        title="AI Mindfulness Hub - Mental Wellness & Meditation Support | Helper33"
        description="AI-powered mindfulness and mental wellness platform. Guided meditation, breathing exercises, stress relief games, and personalized mental health support. Get AI-driven calm and clarity."
        keywords="AI mindfulness, AI meditation, mental wellness AI, AI stress relief, breathing exercises AI, AI mental health support, mindfulness AI coach, meditation AI guide, stress management AI, AI relaxation, mental health AI tools"
        structuredData={structuredData}
      />

      <div className="min-h-screen relative overflow-hidden bg-slate-900">
        {/* Ocean Sanctuary Background */}
        <OceanSanctuary />

        {/* Breathing Exercise Player Modal */}
        <AnimatePresence>
          {selectedExercise && (
            <BreathingExercisePlayer
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
            />
          )}
        </AnimatePresence>

        {/* Audio Enable Prompt - Dark Glass Modal */}
        {showAudioPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="max-w-md w-full"
              style={{
                background: 'rgba(10, 25, 41, 0.85)',
                backdropFilter: 'blur(24px) saturate(180%)',
                boxShadow: '0 20px 60px rgba(6, 182, 212, 0.5), inset 0 2px 12px rgba(6, 182, 212, 0.3)',
                border: '2px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '2rem',
                padding: '3rem'
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl"
                style={{
                  boxShadow: '0 0 50px rgba(6, 182, 212, 0.7)'
                }}
              >
                <Waves className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-cyan-100 text-center mb-3 drop-shadow-lg">
                Welcome to the Deep Ocean
              </h2>
              <p className="text-blue-200/80 text-center mb-6 drop-shadow">
                Experience natural, therapeutic ocean waves
              </p>

              <div className="space-y-3">
                <Button
                  onClick={enableOceanSound}
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-2xl border-0 text-lg py-6"
                  style={{
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)'
                  }}
                >
                  <Volume2 className="w-6 h-6 mr-3" />
                  Enable Ocean Sounds
                </Button>

                <Button
                  onClick={() => setShowAudioPrompt(false)}
                  variant="ghost"
                  className="w-full text-blue-200/80 hover:text-cyan-100 hover:bg-blue-900/20"
                >
                  Continue Without Sound
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="relative z-10 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Simple Ocean Control */}
            {!showAudioPrompt && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <Button
                  onClick={toggleOceanSound}
                  size="lg"
                  className={oceanSoundEnabled 
                    ? "bg-cyan-600/80 backdrop-blur-xl border-2 border-cyan-400/60 text-cyan-100 shadow-2xl hover:bg-cyan-600/90" 
                    : "bg-slate-800/60 backdrop-blur-lg border-2 border-slate-600/30 text-cyan-200/70 hover:bg-slate-800/80"}
                  style={{
                    boxShadow: oceanSoundEnabled
                      ? '0 8px 32px rgba(6, 182, 212, 0.5), inset 0 2px 8px rgba(6, 182, 212, 0.3)'
                      : '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {oceanSoundEnabled ? (
                    <>
                      <Volume2 className="w-6 h-6 mr-3" />
                      Ocean Playing
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-6 h-6 mr-3" />
                      Ocean Paused
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Header with Ocean Breath Animation */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              {/* Breathing Hub Icon */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  scale: [1, 1.05, 1],
                  rotateY: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block mb-8"
              >
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(14, 165, 233, 0.9))',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(6, 182, 212, 0.7), inset 0 2px 12px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.5)'
                  }}
                >
                  <Waves className="w-14 h-14 text-white" />

                  {/* Pulsing Aura */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(6, 182, 212, 0.7), transparent 70%)'
                    }}
                    animate={{
                      scale: [1, 1.6, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl sm:text-6xl font-bold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #38bdf8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 20px rgba(6, 182, 212, 0.6)',
                  filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.5))'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Ocean Sanctuary
              </motion.h1>

              <p className="text-xl text-cyan-200/90 max-w-2xl mx-auto font-medium drop-shadow-lg">
                🌊 Find your rhythm in the gentle flow of the tide
              </p>

              {/* Filter Buttons - Dark Glass Morphism */}
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {filterButtons.map((filter) => (
                  <motion.div
                    key={filter.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => setActiveFilter(filter.id)}
                      className={activeFilter === filter.id
                        ? 'bg-cyan-600/40 backdrop-blur-xl border-2 border-cyan-400/60 text-cyan-100 shadow-2xl'
                        : 'bg-slate-800/30 backdrop-blur-lg border-2 border-slate-600/30 text-cyan-200/70 hover:bg-slate-800/40 hover:border-cyan-500/40'}
                      style={{
                        boxShadow: activeFilter === filter.id
                          ? '0 8px 32px rgba(6, 182, 212, 0.5), inset 0 2px 8px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.4)'
                          : '0 4px 16px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <filter.icon className="w-4 h-4 mr-2" />
                      {filter.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="space-y-12">

              {/* AI Meditation Generator */}
              {shouldShow('meditation') && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-7 h-7 text-purple-400/80" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-lg">
                      AI Personalized Meditation
                    </h2>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <Card
                      className="border-0 overflow-hidden"
                      style={{
                        background: 'rgba(10, 25, 41, 0.8)',
                        backdropFilter: 'blur(24px) saturate(200%)',
                        boxShadow: '0 16px 48px rgba(168, 85, 247, 0.4), inset 0 2px 12px rgba(168, 85, 247, 0.2)',
                        border: '2px solid rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      <CardContent className="p-6">
                        <PersonalizedMeditationGenerator 
                          user={user}
                          meditationHistory={user?.meditation_history || []}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* AI Bible Companion */}
              {shouldShow('bible') && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <div className="max-w-4xl mx-auto">
                    <Card
                      className="border-0 overflow-hidden"
                      style={{
                        background: 'rgba(10, 25, 41, 0.8)',
                        backdropFilter: 'blur(24px) saturate(200%)',
                        boxShadow: '0 16px 48px rgba(6, 182, 212, 0.4), inset 0 2px 12px rgba(6, 182, 212, 0.2)',
                        border: '2px solid rgba(6, 182, 212, 0.3)'
                      }}
                    >
                      <CardContent className="p-6">
                        <AIBible />
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* Guided Breathing Exercises - NEW SECTION */}
              {shouldShow('breathing') && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <Wind className="w-7 h-7 text-cyan-400/80" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-lg">
                      Guided Breathing Exercises
                    </h2>
                  </div>
                  <p className="text-blue-200/70 mb-6 text-sm sm:text-base drop-shadow">
                    Scientifically-designed breathing patterns to calm your nervous system and center your mind.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {breathingExercises.map((exercise, idx) => (
                      <motion.div
                        key={exercise.id}
                        custom={idx}
                        variants={cardFloatVariants}
                        animate="animate"
                        whileHover={{ scale: 1.05, y: -8 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          onClick={() => setSelectedExercise(exercise)}
                          className="cursor-pointer transition-all h-full border-0"
                          style={{
                            background: 'rgba(10, 25, 41, 0.7)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3), inset 0 2px 8px rgba(6, 182, 212, 0.2)',
                            border: '1px solid rgba(6, 182, 212, 0.3)'
                          }}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2 text-cyan-100">{exercise.title}</h3>
                                <p className="text-sm text-blue-200/60 mb-3">{exercise.description}</p>
                              </div>
                              <Badge className="bg-cyan-600/40 text-cyan-100 border-cyan-400/40 ml-2">
                                {exercise.default_duration_minutes}m
                              </Badge>
                            </div>

                            {/* Pattern Display */}
                            <div className="bg-cyan-900/20 rounded-lg p-3 mb-4 border border-cyan-700/30">
                              <p className="text-xs text-cyan-200 mb-2">Pattern:</p>
                              <div className="flex items-center gap-1 text-cyan-100 font-mono text-sm">
                                <span>{exercise.inhale_seconds}s</span>
                                {exercise.hold_after_inhale_seconds > 0 && (
                                  <>
                                    <span className="text-cyan-400">-</span>
                                    <span>{exercise.hold_after_inhale_seconds}s</span>
                                  </>
                                )}
                                <span className="text-cyan-400">-</span>
                                <span>{exercise.exhale_seconds}s</span>
                                {exercise.hold_after_exhale_seconds > 0 && (
                                  <>
                                    <span className="text-cyan-400">-</span>
                                    <span>{exercise.hold_after_exhale_seconds}s</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Benefits */}
                            {exercise.benefits && exercise.benefits.length > 0 && (
                              <div className="mb-4">
                                <p className="text-xs text-cyan-200 mb-2">Benefits:</p>
                                <div className="flex flex-wrap gap-1">
                                  {exercise.benefits.slice(0, 2).map((benefit, bIdx) => (
                                    <Badge key={bIdx} variant="outline" className="text-xs text-cyan-300 border-cyan-700">
                                      ✓ {benefit}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl border-0">
                              <Play className="w-4 h-4 mr-2" />
                              Start Exercise
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {breathingExercises.length === 0 && (
                    <Card className="p-8 text-center border-0"
                      style={{
                        background: 'rgba(10, 25, 41, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(6, 182, 212, 0.3)'
                      }}
                    >
                      <Wind className="w-12 h-12 text-cyan-300 mx-auto mb-3 opacity-50" />
                      <p className="text-cyan-200/70">No breathing exercises available yet. Check back soon!</p>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Therapeutic Activities - Dark Floating Glass Cards */}
              {shouldShow('therapeutic') && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <Waves className="w-7 h-7 text-cyan-400/80" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-lg">
                      Therapeutic Activities
                    </h2>
                  </div>
                  <p className="text-blue-200/70 mb-6 text-sm sm:text-base drop-shadow">
                    Therapeutic activities for focus, regulation, and deep relaxation.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {THERAPEUTIC_ACTIVITIES.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        custom={idx}
                        variants={cardFloatVariants}
                        animate="animate"
                        whileHover={{
                          scale: 1.05,
                          y: -8,
                          rotateY: 0,
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          onClick={() => navigate(createPageUrl(activity.page))}
                          className="cursor-pointer transition-all h-full border-0 overflow-hidden"
                          style={{
                            background: 'rgba(10, 25, 41, 0.7)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3), inset 0 2px 8px rgba(6, 182, 212, 0.2)',
                            border: '1px solid rgba(6, 182, 212, 0.3)'
                          }}
                        >
                          <CardContent className="p-6 text-center">
                            <motion.div
                              className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-2xl`}
                              style={{
                                boxShadow: '0 10px 30px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.4)'
                              }}
                              animate={{
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: idx * 0.5
                              }}
                            >
                              <span className="text-4xl">{activity.icon}</span>
                            </motion.div>
                            <h3 className="font-bold text-base mb-2 text-cyan-100">{activity.name}</h3>
                            <p className="text-xs sm:text-sm text-blue-200/60 mb-4">{activity.description}</p>
                            <Button className={`w-full bg-gradient-to-r ${activity.color} text-white shadow-xl border-0`}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Creator Suite - Dark Marine Glass */}
              {shouldShow('creator') && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 mb-6 drop-shadow-lg">Creator Suite</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {CREATOR_SUITE.map((tool, idx) => (
                      <motion.div
                        key={tool.id}
                        custom={idx}
                        variants={cardFloatVariants}
                        animate="animate"
                        whileHover={{ scale: 1.03, y: -8 }}
                      >
                        <Card
                          className="transition-all cursor-pointer border-0"
                          style={{
                            background: 'rgba(10, 25, 41, 0.7)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            boxShadow: '0 12px 40px rgba(6, 182, 212, 0.3), inset 0 2px 8px rgba(6, 182, 212, 0.2)',
                            border: '1px solid rgba(6, 182, 212, 0.3)'
                          }}
                        >
                          <CardContent className="p-8">
                            <div className="flex items-start gap-4">
                              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-2xl`}
                                style={{
                                  boxShadow: '0 10px 30px rgba(6, 182, 212, 0.5)'
                                }}
                              >
                                <tool.icon className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-xl mb-2 text-cyan-100">{tool.name}</h3>
                                <p className="text-sm text-blue-200/60 mb-4">{tool.description}</p>
                                <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-xl border-0">
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Start
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Featured: Therapeutic Soundscapes */}
              {(shouldShow('therapeutic') || activeFilter === 'all') && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  variants={cardFloatVariants}
                  custom={0}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Waves className="w-7 h-7 text-cyan-400/80" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-lg">
                      Featured: Therapeutic Soundscapes
                    </h2>
                  </div>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Card
                      onClick={() => navigate(createPageUrl('MindfulTools'))}
                      className="cursor-pointer transition-all border-0 overflow-hidden"
                      style={{
                        background: 'rgba(10, 25, 41, 0.8)',
                        backdropFilter: 'blur(24px) saturate(200%)',
                        boxShadow: '0 16px 48px rgba(6, 182, 212, 0.5), inset 0 2px 12px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.3)',
                        border: '2px solid rgba(6, 182, 212, 0.4)'
                      }}
                    >
                      <CardContent className="p-8 sm:p-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <motion.div
                              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl"
                              style={{
                                boxShadow: '0 0 50px rgba(6, 182, 212, 0.7)'
                              }}
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            >
                              <Waves className="w-12 h-12 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-3xl font-bold text-cyan-100 mb-2 drop-shadow-lg">
                                Therapeutic Soundscapes
                              </h3>
                              <p className="text-blue-200/70 max-w-md drop-shadow">
                                Create immersive audio environments with custom sounds and visuals.
                              </p>
                            </div>
                          </div>
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-2xl border-0 px-8"
                            style={{
                              boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)'
                            }}
                          >
                            <PlayCircle className="w-5 h-5 mr-2" />
                            Experience
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {/* Creative Tools - Dark Floating Glass */}
              {shouldShow('creative') && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  variants={cardFloatVariants}
                  custom={1}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-7 h-7 text-purple-400/80" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-lg">
                      Creative Tools
                    </h2>
                  </div>
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Card
                      onClick={() => navigate(createPageUrl('MindfulTools'))}
                      className="cursor-pointer transition-all border-0"
                      style={{
                        background: 'rgba(10, 25, 41, 0.7)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        boxShadow: '0 12px 40px rgba(168, 85, 247, 0.3), inset 0 2px 8px rgba(168, 85, 247, 0.2)',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                      }}
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl"
                            style={{
                              boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
                            }}
                          >
                            <Palette className="w-12 h-12 text-white" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-3xl font-bold text-cyan-100 mb-2 drop-shadow-lg">Creative Hub</h3>
                            <p className="text-blue-200/70 mb-4 drop-shadow">
                              Create stories, poems, and art with AI assistance.
                            </p>
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-2xl border-0">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start Creating
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {/* Mindful Games (Ages 13+) - Dark Marine Flow Cards */}
              {shouldShow('games') && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <Crown className="w-7 h-7 text-cyan-400/80" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 drop-shadow-lg">
                      Mindful Games (Ages 13+)
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MINDFUL_GAMES.map((game, idx) => (
                      <motion.div
                        key={game.id}
                        custom={idx}
                        variants={cardFloatVariants}
                        animate="animate"
                        whileHover={{ scale: 1.05, y: -10 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          onClick={() => navigate(createPageUrl(game.page))}
                          className="cursor-pointer transition-all h-full border-0"
                          style={{
                            background: 'rgba(10, 25, 41, 0.7)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3), inset 0 2px 8px rgba(6, 182, 212, 0.2)',
                            border: '1px solid rgba(6, 182, 212, 0.3)'
                          }}
                        >
                          <CardContent className="p-6 text-center">
                            <motion.div
                              className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-2xl`}
                              style={{
                                boxShadow: '0 10px 30px rgba(6, 182, 212, 0.5)'
                              }}
                              animate={{
                                rotate: [0, 3, -3, 0]
                              }}
                              transition={{
                                duration: 5 + idx,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <span className="text-4xl">{game.icon}</span>
                            </motion.div>
                            <h3 className="font-bold text-base mb-2 text-cyan-100">{game.name}</h3>
                            <p className="text-xs sm:text-sm text-blue-200/60 mb-4">{game.description}</p>
                            <Button className={`w-full bg-gradient-to-r ${game.color} text-white shadow-xl border-0`}>
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}