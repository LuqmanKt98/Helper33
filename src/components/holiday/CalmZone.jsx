
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Wind, Play, Sparkles,
  Timer, CheckCircle, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { updateConstellationProgress, shareToSocialMedia } from './ConstellationHelper';

export default function CalmZone({ onBack }) {
  const [activeExercise, setActiveExercise] = useState(null);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const breathingExercises = [
    {
      id: '478',
      name: '4-7-8 Breathing',
      description: 'Dr. Andrew Weil\'s calming breath - reduces anxiety',
      duration: 2,
      pattern: [
        { phase: 'inhale', duration: 4, text: 'Breathe In' },
        { phase: 'hold', duration: 7, text: 'Hold' },
        { phase: 'exhale', duration: 8, text: 'Breathe Out' },
      ],
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'box',
      name: 'Box Breathing',
      description: 'Navy SEAL technique for instant calm',
      duration: 2,
      pattern: [
        { phase: 'inhale', duration: 4, text: 'Breathe In' },
        { phase: 'hold', duration: 4, text: 'Hold' },
        { phase: 'exhale', duration: 4, text: 'Breathe Out' },
        { phase: 'hold', duration: 4, text: 'Hold' },
      ],
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'coherent',
      name: 'Coherent Breathing',
      description: 'Heart rhythm breathing - balances nervous system',
      duration: 3,
      pattern: [
        { phase: 'inhale', duration: 5, text: 'Breathe In' },
        { phase: 'exhale', duration: 5, text: 'Breathe Out' },
      ],
      color: 'from-green-500 to-teal-500',
    },
  ];

  const affirmations = [
    "You are not behind. You are exactly where you need to be.",
    "It's okay to feel what you're feeling. All emotions are welcome here.",
    "You don't have to be perfect. You just have to be present.",
    "Your healing is not on anyone else's timeline.",
    "You are allowed to set boundaries, even during the holidays.",
  ];

  const [currentAffirmation, setCurrentAffirmation] = useState(
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );

  const startExercise = (exercise) => {
    if (!user) {
      toast.error('Please log in to track your activities');
      return;
    }
    setActiveExercise(exercise);
    setShowMoodCheck(true);
    setMoodBefore(null);
    setMoodAfter(null);
    setCyclesCompleted(0);
    setIsExercising(false);
  };

  const selectMoodAndBegin = async (mood) => {
    setMoodBefore(mood);
    // Wait a bit for state to update, then start
    await new Promise(resolve => setTimeout(resolve, 100));
    beginExercise(mood);
  };

  const beginExercise = (mood) => {
    setShowMoodCheck(false);
    setIsExercising(true);
    runBreathingPattern();
  };

  const runBreathingPattern = () => {
    if (!activeExercise) return;
    
    let cycleCount = 0;
    const pattern = activeExercise.pattern;
    const totalCycles = Math.ceil((activeExercise.duration * 60) / pattern.reduce((sum, p) => sum + p.duration, 0));
    
    const runCycle = (index = 0) => {
      if (index >= pattern.length) {
        cycleCount++;
        setCyclesCompleted(cycleCount);
        if (cycleCount < totalCycles) {
          setTimeout(() => runCycle(0), 100);
        } else {
          completeExercise();
        }
        return;
      }
      
      const step = pattern[index];
      setBreathPhase(step.phase);
      
      setTimeout(() => {
        runCycle(index + 1);
      }, step.duration * 1000);
    };
    
    runCycle();
  };

  const completeExercise = () => {
    setIsExercising(false);
    setShowMoodCheck(true);
  };

  const finishActivity = async () => {
    if (!moodAfter) {
      toast.error('Please select your mood after');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateConstellationProgress(user, {
        activity_date: new Date().toISOString().split('T')[0],
        zone: 'calm',
        activity_type: 'breathing_exercise',
        activity_title: activeExercise.name,
        activity_content: `${cyclesCompleted} breath cycles completed`,
        mood_before: moodBefore,
        mood_after: moodAfter,
        duration_minutes: activeExercise.duration,
        points_earned: 20,
      });

      queryClient.invalidateQueries();
      
      const successMessage = result.isComplete 
        ? '🎉 CONSTELLATION COMPLETE! All 10 stars lit! You earned the Heartful Holidays badge! 🏆'
        : `🌟 Star #${result.starsLit} lit! +${result.pointsEarned} points! ${10 - result.starsLit} more to complete your constellation!`;
      
      toast.success(successMessage, { duration: 5000 });
      
      // Share achievement option
      setTimeout(() => {
        if (confirm('🎉 Share your wellness achievement on social media?')) {
          const shareUrls = shareToSocialMedia('calm', activeExercise.name, result.starsLit, result.isComplete);
          const platform = prompt('Choose:\n1. Facebook\n2. Twitter\n3. Instagram\n4. LinkedIn\n5. TikTok\n(Enter 1-5)');
          const platformMap = { '1': 'facebook', '2': 'twitter', '3': 'instagram', '4': 'linkedin', '5': 'tiktok' };
          const selected = platformMap[platform];
          if (selected && shareUrls[selected]) {
            window.open(shareUrls[selected], '_blank', 'width=600,height=400');
            toast.success('Thanks for sharing! 💫');
          } else if (platform) {
            toast.error('Invalid selection or sharing not supported for this platform yet.');
          }
        }
      }, 1500);
      
      setActiveExercise(null);
      setMoodBefore(null);
      setMoodAfter(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const moods = [
    { value: 'peaceful', label: 'Peaceful', emoji: '😌', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'overwhelmed', label: 'Stressed', emoji: '😵', color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'calm', label: 'Calm', emoji: '☮️', color: 'bg-green-100 text-green-700 border-green-300' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <Button variant="outline" onClick={onBack} className="bg-white/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2">
          <Wind className="w-4 h-4 mr-2" />
          Calm Zone
        </Badge>
      </div>

      {!activeExercise ? (
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Today's Affirmation</h3>
                <p className="text-2xl font-medium mb-6 leading-relaxed">"{currentAffirmation}"</p>
                <Button
                  variant="outline"
                  onClick={() => setCurrentAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)])}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  Get Another ✨
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Guided Breathing Exercises</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {breathingExercises.map((exercise, index) => (
                <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                  <Card className="h-full bg-white/90 backdrop-blur-sm border-2 border-transparent hover:border-cyan-300 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${exercise.color} flex items-center justify-center mb-3`}>
                        <Wind className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{exercise.name}</CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Timer className="w-4 h-4" />
                          <span>{exercise.duration} minutes</span>
                        </div>
                        <Button onClick={() => startExercise(exercise)} className={`w-full bg-gradient-to-r ${exercise.color} text-white hover:opacity-90`}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Exercise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          {showMoodCheck ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    {!moodBefore ? 'How are you feeling right now?' : 'How do you feel after?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {moods.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => {
                          if (!moodBefore) {
                            selectMoodAndBegin(mood.value);
                          } else {
                            setMoodAfter(mood.value);
                          }
                        }}
                        className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                          (moodAfter === mood.value) ? `${mood.color} shadow-lg scale-105` : 'border-gray-200 bg-white hover:border-cyan-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">{mood.emoji}</div>
                        <div className="text-sm font-medium text-gray-800">{mood.label}</div>
                      </button>
                    ))}
                  </div>

                  {moodAfter && (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-green-900">Great work!</p>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => { setActiveExercise(null); setMoodBefore(null); setMoodAfter(null); setShowMoodCheck(false); }} className="flex-1">
                          Skip
                        </Button>
                        <Button onClick={finishActivity} disabled={isSaving} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                          <Star className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Light a Star'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <Card className={`bg-gradient-to-br ${activeExercise.color} text-white border-0 shadow-2xl`}>
                <CardContent className="p-12">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold mb-2">{activeExercise.name}</h2>
                    <p className="text-white/90 mb-4">{activeExercise.description}</p>
                    <p className="text-lg text-white/75">Cycle {cyclesCompleted + 1}</p>
                  </div>

                  <div className="flex items-center justify-center mb-8">
                    <motion.div
                      className="w-64 h-64 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                      animate={{ 
                        scale: breathPhase === 'inhale' ? 1.3 : breathPhase === 'exhale' ? 0.7 : 1 
                      }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    >
                      <div className="text-center">
                        <p className="text-6xl mb-2">{breathPhase === 'inhale' ? '↑' : breathPhase === 'exhale' ? '↓' : '○'}</p>
                        <p className="text-2xl font-semibold capitalize">{breathPhase}</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-center">
                    <Button variant="outline" onClick={completeExercise} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      Finish Early
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
