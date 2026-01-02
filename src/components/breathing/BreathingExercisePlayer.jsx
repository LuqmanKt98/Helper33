import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Play, Pause, RotateCcw, X, Heart, Clock, Wind,
  Circle,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const COLOR_THEMES = {
  ocean_blue: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    glow: 'rgba(6, 182, 212, 0.6)',
    text: 'text-cyan-100'
  },
  sunset: {
    gradient: 'from-orange-400 via-pink-500 to-purple-600',
    glow: 'rgba(251, 146, 60, 0.6)',
    text: 'text-orange-100'
  },
  forest: {
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.6)',
    text: 'text-green-100'
  },
  twilight: {
    gradient: 'from-purple-400 via-indigo-500 to-blue-600',
    glow: 'rgba(139, 92, 246, 0.6)',
    text: 'text-purple-100'
  },
  aurora: {
    gradient: 'from-pink-400 via-purple-500 to-cyan-600',
    glow: 'rgba(236, 72, 153, 0.6)',
    text: 'text-pink-100'
  }
};

function CircleVisual({ phase, progress, theme }) {
  const size = 100 + progress * 120;
  
  return (
    <motion.div
      className="relative w-64 h-64 mx-auto"
      animate={{ scale: [0.95, 1, 0.95] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className={`rounded-full bg-gradient-to-br ${theme.gradient}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            boxShadow: `0 0 60px ${theme.glow}, 0 0 100px ${theme.glow}`
          }}
          animate={{
            scale: phase === 'inhale' || phase === 'hold_in' ? 1.2 : 0.8,
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <p className={`text-3xl font-bold ${theme.text} drop-shadow-lg`}>
          {phase === 'inhale' ? 'Breathe In' : 
           phase === 'hold_in' ? 'Hold' :
           phase === 'exhale' ? 'Breathe Out' :
           'Hold'}
        </p>
      </div>
    </motion.div>
  );
}

export default function BreathingExercisePlayer({ exercise, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [duration, setDuration] = useState(exercise.default_duration_minutes || 5);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const theme = COLOR_THEMES[exercise.color_theme || 'ocean_blue'];
  
  const phases = [
    { name: 'inhale', duration: exercise.inhale_seconds, label: 'Breathe In' },
    ...(exercise.hold_after_inhale_seconds > 0 
      ? [{ name: 'hold_in', duration: exercise.hold_after_inhale_seconds, label: 'Hold' }] 
      : []),
    { name: 'exhale', duration: exercise.exhale_seconds, label: 'Breathe Out' },
    ...(exercise.hold_after_exhale_seconds > 0 
      ? [{ name: 'hold_out', duration: exercise.hold_after_exhale_seconds, label: 'Hold' }] 
      : [])
  ];

  const totalCycleTime = phases.reduce((sum, phase) => sum + phase.duration, 0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startExercise = () => {
    setIsPlaying(true);
    setCurrentPhase(phases[0].name);
    setPhaseProgress(0);
    startTimeRef.current = Date.now();
    
    let currentPhaseIndex = 0;
    let phaseStartTime = Date.now();
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - phaseStartTime) / 1000;
      const currentPhaseDuration = phases[currentPhaseIndex].duration;
      const progress = Math.min(elapsed / currentPhaseDuration, 1);
      
      setPhaseProgress(progress);
      setTotalSeconds(Math.floor((now - startTimeRef.current) / 1000));
      
      if (progress >= 1) {
        // Move to next phase
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        
        if (currentPhaseIndex === 0) {
          setCyclesCompleted(prev => prev + 1);
        }
        
        setCurrentPhase(phases[currentPhaseIndex].name);
        setPhaseProgress(0);
        phaseStartTime = now;
        
        // Check if duration reached
        if (totalSeconds >= duration * 60) {
          stopExercise(true);
        }
      }
    }, 50);
  };

  const stopExercise = async (completed = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);
    
    if (completed && totalSeconds >= 60) {
      // Save session
      try {
        await base44.entities.UserBreathingSession.create({
          exercise_id: exercise.id,
          exercise_title: exercise.title,
          duration_minutes: Math.floor(totalSeconds / 60),
          cycles_completed: cyclesCompleted,
          mood_before: moodBefore,
          mood_after: moodAfter,
          is_favorite: isFavorite
        });
        toast.success('🌊 Session saved! Great work!');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  const resetExercise = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);
    setCurrentPhase('ready');
    setPhaseProgress(0);
    setTotalSeconds(0);
    setCyclesCompleted(0);
  };

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : '⭐ Added to favorites');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl"
        style={{
          background: 'rgba(10, 25, 41, 0.95)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 60px rgba(6, 182, 212, 0.5)',
          border: '2px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '2rem',
          padding: '2rem'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-cyan-100 mb-2">{exercise.title}</h2>
            <p className="text-blue-200/70 mb-3">{exercise.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-cyan-600/40 text-cyan-100 border-cyan-400/40">
                {exercise.difficulty_level}
              </Badge>
              {exercise.best_for?.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-cyan-300 border-cyan-700">
                  {tag.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={toggleFavorite}
              size="sm"
              variant="ghost"
              className={isFavorite ? 'text-pink-400' : 'text-cyan-300'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button onClick={onClose} size="sm" variant="ghost" className="text-cyan-300">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Visual Breathing Guide */}
        <div className="py-10">
          <CircleVisual phase={currentPhase} progress={phaseProgress} theme={theme} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-slate-800/40 border border-cyan-900/50">
            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-cyan-100">{formatTime(totalSeconds)}</div>
            <div className="text-xs text-blue-200/60">Time</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/40 border border-cyan-900/50">
            <Wind className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-cyan-100">{cyclesCompleted}</div>
            <div className="text-xs text-blue-200/60">Cycles</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/40 border border-cyan-900/50">
            <Circle className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-cyan-100">{duration} min</div>
            <div className="text-xs text-blue-200/60">Goal</div>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-lg bg-slate-800/40 border border-cyan-900/50 space-y-4">
                <div>
                  <Label className="text-cyan-200 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Exercise Duration: {duration} minutes
                  </Label>
                  <Slider
                    value={[duration]}
                    onValueChange={(val) => setDuration(val[0])}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>

                {exercise.benefits && exercise.benefits.length > 0 && (
                  <div>
                    <Label className="text-cyan-200 mb-2 block">Benefits:</Label>
                    <div className="flex flex-wrap gap-2">
                      {exercise.benefits.map((benefit, idx) => (
                        <Badge key={idx} variant="outline" className="text-cyan-300 border-cyan-700">
                          ✓ {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="bg-slate-800/30 border-slate-600/40 text-cyan-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSettings ? 'Hide' : 'Settings'}
          </Button>
          
          {!isPlaying ? (
            <Button
              onClick={startExercise}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-2xl border-0 text-lg py-6"
              style={{
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)'
              }}
            >
              <Play className="w-6 h-6 mr-2" />
              Start Exercise
            </Button>
          ) : (
            <>
              <Button
                onClick={() => stopExercise(false)}
                variant="outline"
                className="flex-1 bg-slate-800/30 border-slate-600/40 text-cyan-200 hover:bg-slate-700/40"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
              <Button
                onClick={resetExercise}
                variant="outline"
                className="bg-slate-800/30 border-slate-600/40 text-cyan-200"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Breathing Pattern Info */}
        <div className="mt-6 p-4 rounded-lg bg-cyan-900/20 border border-cyan-700/30">
          <p className="text-sm text-cyan-200 mb-2 font-semibold">Pattern:</p>
          <div className="flex items-center gap-2 text-cyan-100 font-mono text-sm">
            <span>{exercise.inhale_seconds}s in</span>
            {exercise.hold_after_inhale_seconds > 0 && (
              <>
                <span>→</span>
                <span>{exercise.hold_after_inhale_seconds}s hold</span>
              </>
            )}
            <span>→</span>
            <span>{exercise.exhale_seconds}s out</span>
            {exercise.hold_after_exhale_seconds > 0 && (
              <>
                <span>→</span>
                <span>{exercise.hold_after_exhale_seconds}s hold</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}