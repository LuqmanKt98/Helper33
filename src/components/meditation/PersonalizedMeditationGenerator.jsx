import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Brain,
  Moon,
  Zap,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  RefreshCw
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const MOOD_OPTIONS = [
  { id: 'stressed', label: 'Stressed', emoji: '😰', color: 'from-red-400 to-orange-500', theme: 'calming' },
  { id: 'anxious', label: 'Anxious', emoji: '😟', color: 'from-blue-400 to-indigo-500', theme: 'grounding' },
  { id: 'tired', label: 'Tired', emoji: '😴', color: 'from-purple-400 to-pink-500', theme: 'energizing' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'from-cyan-400 to-blue-500', theme: 'uplifting' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', color: 'from-slate-400 to-gray-500', theme: 'balanced' },
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'from-emerald-400 to-teal-500', theme: 'gratitude' }
];

const GOAL_OPTIONS = [
  { id: 'stress-relief', label: 'Stress Relief', icon: Heart, color: 'from-rose-400 to-pink-500' },
  { id: 'focus', label: 'Better Focus', icon: Brain, color: 'from-blue-400 to-indigo-500' },
  { id: 'sleep', label: 'Better Sleep', icon: Moon, color: 'from-purple-400 to-indigo-600' },
  { id: 'energy', label: 'More Energy', icon: Zap, color: 'from-amber-400 to-orange-500' },
  { id: 'clarity', label: 'Mental Clarity', icon: Sparkles, color: 'from-cyan-400 to-blue-500' },
  { id: 'peace', label: 'Inner Peace', icon: Heart, color: 'from-emerald-400 to-teal-500' }
];

const DURATION_OPTIONS = [
  { value: 5, label: '5 min', emoji: '⚡' },
  { value: 10, label: '10 min', emoji: '🌟' },
  { value: 15, label: '15 min', emoji: '✨' },
  { value: 20, label: '20 min', emoji: '🌙' }
];

export default function PersonalizedMeditationGenerator({ user, meditationHistory = [] }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('mood');
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [generatedSession, setGeneratedSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [customAnxieties, setCustomAnxieties] = useState('');
  const [desiredFeelings, setDesiredFeelings] = useState('');
  const [physicalSensations, setPhysicalSensations] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const audioContextRef = useRef(null);
  const nodesRef = useRef({});
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopAllAudio = () => {
    if (audioContextRef.current) {
      Object.values(nodesRef.current).forEach(node => {
        try {
          if (node && typeof node.stop === 'function') node.stop();
          if (node && typeof node.disconnect === 'function') node.disconnect();
        } catch (e) {}
      });
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
      nodesRef.current = {};
    }
  };

  const createTherapeuticAudio = (theme) => {
    if (!audioEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const themeConfigs = {
        calming: { freq: 110, type: 'sine', filterFreq: 400 },
        grounding: { freq: 80, type: 'triangle', filterFreq: 300 },
        energizing: { freq: 174, type: 'sawtooth', filterFreq: 800 },
        uplifting: { freq: 285, type: 'sine', filterFreq: 600 },
        balanced: { freq: 136.1, type: 'sine', filterFreq: 500 },
        gratitude: { freq: 528, type: 'sine', filterFreq: 700 }
      };

      const config = themeConfigs[theme] || themeConfigs.balanced;

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.type = config.type;
      osc.frequency.setValueAtTime(config.freq, audioContext.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(config.filterFreq, audioContext.currentTime);
      filter.Q.setValueAtTime(1, audioContext.currentTime);

      gain.gain.setValueAtTime(0.15, audioContext.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();

      nodesRef.current.osc = osc;
      nodesRef.current.gain = gain;

      // Add gentle modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.setValueAtTime(0.3, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(0.02, audioContext.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      nodesRef.current.lfo = lfo;
      nodesRef.current.lfoGain = lfoGain;
    } catch (error) {
      console.error('Audio creation failed:', error);
    }
  };

  const generateSessionMutation = useMutation({
    mutationFn: async () => {
      const recentHistory = meditationHistory.slice(0, 5).map(h => 
        `${h.goal} meditation for ${h.duration}min - mood: ${h.mood_before} → ${h.mood_after}`
      ).join('; ');

      const customContext = customAnxieties || desiredFeelings || physicalSensations ? `

Specific User Input:
${customAnxieties ? `- Current Anxieties/Concerns: ${customAnxieties}` : ''}
${desiredFeelings ? `- Desired Feelings: ${desiredFeelings}` : ''}
${physicalSensations ? `- Physical Sensations: ${physicalSensations}` : ''}

IMPORTANT: Address these specific concerns, physical sensations, and guide them toward the desired feelings with body scans and mindfulness techniques.` : '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a deeply personalized ${selectedDuration}-minute meditation session.

User Context:
- Current Mood: ${selectedMood.label} (${selectedMood.emoji})
- Goal: ${selectedGoal.label}
- Recent History: ${recentHistory || 'First session'}${customContext}

Create a meditation with 3-5 phases, each with:
1. Phase name and duration (must total ${selectedDuration} minutes)
2. Guided instructions (2-3 sentences, calming and therapeutic)
   ${customAnxieties ? '- Specifically address their anxieties with compassion and practical guidance' : ''}
   ${desiredFeelings ? '- Guide them toward experiencing their desired feelings' : ''}
   ${physicalSensations ? '- Include targeted body scan and mindfulness techniques for their physical sensations' : ''}
3. Breathing pattern suggestion
4. Visualization or focus point
5. Body awareness instruction if physical sensations were mentioned

Also generate 5-7 personalized affirmations that:
- Align with their goal and desired state
- Address their specific concerns
- Are present-tense and empowering
- Can be repeated during or after meditation

Make it deeply personal, warm, and healing. Use "you" language. Acknowledge their specific concerns. Keep each phase concise but meaningful.`,
        response_json_schema: {
          type: 'object',
          properties: {
            session_title: { type: 'string' },
            opening_message: { type: 'string' },
            phases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  duration_minutes: { type: 'number' },
                  instructions: { type: 'string' },
                  breathing_pattern: { type: 'string' },
                  focus_point: { type: 'string' },
                  body_awareness: { type: 'string' }
                }
              }
            },
            affirmations: {
              type: 'array',
              items: { type: 'string' }
            },
            closing_message: { type: 'string' }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedSession(data);
      setStep('session');
      toast.success('✨ Your meditation is ready!');
    },
    onError: () => {
      toast.error('Failed to generate meditation');
    }
  });

  const handleGenerateSession = () => {
    if (!selectedMood || !selectedGoal) {
      toast.error('Please select your mood and goal');
      return;
    }
    setIsGenerating(true);
    generateSessionMutation.mutate();
  };

  const startMeditation = () => {
    setIsPlaying(true);
    setCurrentPhase(0);
    setTimeRemaining(selectedDuration * 60);
    
    createTherapeuticAudio(selectedMood.theme);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeMeditation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    stopAllAudio();
  };

  const completeMeditation = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    stopAllAudio();

    // Save to history
    saveMeditationMutation.mutate({
      mood_before: selectedMood.id,
      goal: selectedGoal.id,
      duration: selectedDuration,
      completed_at: new Date().toISOString(),
      session_data: generatedSession
    });

    toast.success('🎉 Meditation complete!', {
      description: 'Great work on your practice!'
    });
  };

  const saveMeditationMutation = useMutation({
    mutationFn: async (historyEntry) => {
      const updatedHistory = [...(user.meditation_history || []), historyEntry];
      await base44.auth.updateMe({ 
        meditation_history: updatedHistory,
        total_meditation_minutes: (user.total_meditation_minutes || 0) + selectedDuration
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    }
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Step 1: Select Mood */}
        {step === 'mood' && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">How are you feeling right now?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOOD_OPTIONS.map((mood, idx) => (
                    <motion.button
                      key={mood.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedMood(mood);
                        setStep('goal');
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMood?.id === mood.id
                          ? `bg-gradient-to-r ${mood.color} text-white border-transparent shadow-lg`
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span className="text-4xl block mb-2">{mood.emoji}</span>
                      <span className="font-semibold">{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Select Goal */}
        {step === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">What's your goal for this meditation?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {GOAL_OPTIONS.map((goal, idx) => {
                    const GoalIcon = goal.icon;
                    return (
                      <motion.button
                        key={goal.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedGoal(goal)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedGoal?.id === goal.id
                            ? `bg-gradient-to-r ${goal.color} text-white border-transparent shadow-lg`
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <GoalIcon className="w-8 h-8 mx-auto mb-2" />
                        <span className="font-semibold text-sm">{goal.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-6 flex gap-2">
                  <Button onClick={() => setStep('mood')} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCustomInput(true);
                      setStep('custom');
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add Details
                  </Button>
                  <Button
                    onClick={() => setStep('duration')}
                    disabled={!selectedGoal}
                    variant="outline"
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2.5: Custom Input (Optional) */}
        {step === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Tell me more (optional)</CardTitle>
                <p className="text-center text-sm text-gray-600">The more you share, the more personalized your meditation</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    What specific anxieties or worries are you feeling?
                  </label>
                  <Textarea
                    placeholder="I'm worried about work deadlines, feeling overwhelmed by family responsibilities..."
                    value={customAnxieties}
                    onChange={(e) => setCustomAnxieties(e.target.value)}
                    className="min-h-[100px] border-2 border-pink-200 focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    How do you want to feel after this meditation?
                  </label>
                  <Textarea
                    placeholder="I want to feel calm, centered, confident, peaceful..."
                    value={desiredFeelings}
                    onChange={(e) => setDesiredFeelings(e.target.value)}
                    className="min-h-[100px] border-2 border-pink-200 focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    What physical sensations are you experiencing?
                  </label>
                  <Textarea
                    placeholder="Tension in shoulders, tightness in chest, racing heart, headache, restlessness..."
                    value={physicalSensations}
                    onChange={(e) => setPhysicalSensations(e.target.value)}
                    className="min-h-[100px] border-2 border-pink-200 focus:border-pink-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">This helps create targeted body scans and mindfulness techniques</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setStep('goal')} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('duration')}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Select Duration */}
        {step === 'duration' && (
          <motion.div
            key="duration"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader>
                <CardTitle className="text-2xl text-center">How long do you have?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DURATION_OPTIONS.map((duration, idx) => (
                    <motion.button
                      key={duration.value}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDuration(duration.value)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedDuration === duration.value
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-transparent shadow-lg'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{duration.emoji}</span>
                      <span className="font-bold text-lg">{duration.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-6 flex gap-2">
                  <Button onClick={() => setStep(showCustomInput ? 'custom' : 'goal')} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerateSession}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating your meditation...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate My Meditation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Meditation Session */}
        {step === 'session' && generatedSession && (
          <motion.div
            key="session"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Session Header */}
            <Card className={`border-2 bg-gradient-to-br ${selectedMood.color} text-white overflow-hidden relative`}>
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, white 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, white 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, white 0%, transparent 50%)'
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <CardContent className="pt-6 relative z-10">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    {selectedMood.emoji}
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">{generatedSession.session_title}</h2>
                  <p className="text-white/90 mb-4">{generatedSession.opening_message}</p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <Badge className="bg-white/20 text-white border-white/40">
                      <Clock className="w-3 h-3 mr-1" />
                      {selectedDuration} minutes
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/40">
                      {generatedSession.phases.length} phases
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meditation Player */}
            {!isPlaying ? (
              <Card className="border-2 border-purple-200">
                <CardContent className="pt-6 space-y-4">
                  {generatedSession.phases.map((phase, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{phase.name}</h4>
                        <Badge variant="outline">{phase.duration_minutes} min</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{phase.instructions}</p>
                      <div className="flex items-center gap-2 text-xs text-purple-600 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{phase.breathing_pattern}</span>
                      </div>
                      {phase.body_awareness && (
                        <div className="flex items-start gap-2 text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                          <Heart className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{phase.body_awareness}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Affirmations */}
                  {generatedSession.affirmations && generatedSession.affirmations.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                      <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Your Affirmations
                      </h4>
                      <div className="space-y-2">
                        {generatedSession.affirmations.map((affirmation, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-2 text-sm text-gray-800"
                          >
                            <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="italic">"{affirmation}"</span>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-xs text-amber-700 mt-3">Repeat these during or after your meditation</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={startMeditation}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-14 text-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Begin Meditation
                    </Button>
                    <Button
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      variant="outline"
                      className="px-4"
                    >
                      {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="pt-6 space-y-6">
                  {/* Timer Display */}
                  <motion.div
                    className="text-center"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 40px rgba(139, 92, 246, 0.4)',
                          '0 0 60px rgba(236, 72, 153, 0.6)',
                          '0 0 40px rgba(139, 92, 246, 0.4)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4"
                    >
                      <span className="text-6xl font-bold text-white">{formatTime(timeRemaining)}</span>
                    </motion.div>
                  </motion.div>

                  {/* Current Phase */}
                  <motion.div
                    key={currentPhase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white rounded-xl shadow-lg border-2 border-purple-200"
                  >
                    <h3 className="text-2xl font-bold text-purple-900 mb-3 text-center">
                      {generatedSession.phases[currentPhase]?.name}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed mb-4 text-center">
                      {generatedSession.phases[currentPhase]?.instructions}
                    </p>
                    <div className="bg-purple-50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-sm text-purple-700 font-medium">
                        {generatedSession.phases[currentPhase]?.breathing_pattern}
                      </p>
                      <p className="text-sm text-purple-600">
                        Focus: {generatedSession.phases[currentPhase]?.focus_point}
                      </p>
                      {generatedSession.phases[currentPhase]?.body_awareness && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <p className="text-xs text-blue-700 font-medium mb-1">Body Awareness:</p>
                          <p className="text-xs text-blue-600">{generatedSession.phases[currentPhase]?.body_awareness}</p>
                        </div>
                      )}
                    </div>

                    {/* Affirmation Display */}
                    {generatedSession.affirmations && generatedSession.affirmations[currentPhase] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200"
                      >
                        <p className="text-xs text-amber-700 font-medium mb-2 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Affirmation:
                        </p>
                        <p className="text-sm text-gray-800 italic text-center">"{generatedSession.affirmations[currentPhase]}"</p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Phase {currentPhase + 1} of {generatedSession.phases.length}</span>
                      <span>{Math.round((1 - timeRemaining / (selectedDuration * 60)) * 100)}% complete</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(1 - timeRemaining / (selectedDuration * 60)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={pauseMeditation}
                    variant="outline"
                    className="w-full h-12 border-2 border-purple-300"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Start Over */}
            {!isPlaying && (
              <Button
                onClick={() => {
                  setStep('mood');
                  setSelectedMood(null);
                  setSelectedGoal(null);
                  setGeneratedSession(null);
                }}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Create New Meditation
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meditation History Preview */}
      {meditationHistory.length > 0 && step === 'mood' && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Your Recent Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{meditationHistory.length}</p>
                <p className="text-xs text-gray-600">Sessions</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">
                  {user?.total_meditation_minutes || 0}
                </p>
                <p className="text-xs text-gray-600">Total Minutes</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  {meditationHistory.length >= 7 ? '7+' : meditationHistory.length}
                </p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
            </div>

            <div className="space-y-2">
              {meditationHistory.slice(0, 3).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{entry.goal} • {entry.duration}min</span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.completed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}