import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Heart, Droplets, Moon, Sparkles, Wind, Brain, 
  Smile, Sun, Cloud, CloudRain,
  TrendingUp, AlertCircle, Coffee, Battery,
  Play, Pause, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Simple Breathing Exercise Component
const BreathingExercise = ({ onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale, complete
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const totalCycles = 3;

  const exercises = [
    {
      id: '4-7-8',
      name: '4-7-8 Breathing',
      description: 'Calming technique for quick relaxation',
      inhale: 4,
      hold: 7,
      exhale: 8
    },
    {
      id: 'box',
      name: 'Box Breathing',
      description: 'Equal rhythm for balance',
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdAfterExhale: 4
    },
    {
      id: 'simple',
      name: 'Simple Deep Breath',
      description: 'Quick reset when you need it',
      inhale: 3,
      exhale: 6
    }
  ];

  const [selectedExercise, setSelectedExercise] = useState(exercises[0]);

  const startExercise = () => {
    setIsActive(true);
    setCyclesCompleted(0);
    setPhase('inhale');
    runCycle();
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('ready');
  };

  const runCycle = async () => {
    if (cyclesCompleted >= totalCycles) {
      setPhase('complete');
      setIsActive(false);
      if (onComplete) onComplete();
      return;
    }

    // Inhale
    setPhase('inhale');
    await new Promise(resolve => setTimeout(resolve, selectedExercise.inhale * 1000));
    
    // Hold
    if (selectedExercise.hold) {
      setPhase('hold');
      await new Promise(resolve => setTimeout(resolve, selectedExercise.hold * 1000));
    }
    
    // Exhale
    setPhase('exhale');
    await new Promise(resolve => setTimeout(resolve, selectedExercise.exhale * 1000));
    
    // Hold after exhale
    if (selectedExercise.holdAfterExhale) {
      setPhase('hold');
      await new Promise(resolve => setTimeout(resolve, selectedExercise.holdAfterExhale * 1000));
    }

    setCyclesCompleted(prev => prev + 1);
    if (cyclesCompleted + 1 < totalCycles) {
      runCycle();
    } else {
      setPhase('complete');
      setIsActive(false);
      if (onComplete) onComplete();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="w-6 h-6 text-cyan-600" />
          Breathing Exercises
        </CardTitle>
        <p className="text-sm text-gray-600">
          Take 2 minutes to reset and recharge
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise Selection */}
        {!isActive && phase !== 'complete' && (
          <div className="space-y-3">
            <Label className="font-semibold">Choose Your Exercise:</Label>
            {exercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedExercise.id === exercise.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <p className="font-bold mb-1">{exercise.name}</p>
                <p className="text-sm opacity-90">{exercise.description}</p>
              </button>
            ))}

            <Button
              onClick={startExercise}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start {selectedExercise.name}
            </Button>
          </div>
        )}

        {/* Breathing Animation */}
        {isActive && phase !== 'complete' && (
          <div className="text-center py-12">
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1.5 : phase === 'exhale' ? 0.8 : 1,
                opacity: phase === 'hold' ? 0.8 : 1
              }}
              transition={{ duration: phase === 'inhale' ? selectedExercise.inhale : phase === 'exhale' ? selectedExercise.exhale : selectedExercise.hold || 0, ease: "easeInOut" }}
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"
            />
            
            <h3 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
              {phase === 'inhale' && '🌬️ Breathe In'}
              {phase === 'hold' && '⏸️ Hold'}
              {phase === 'exhale' && '💨 Breathe Out'}
            </h3>
            
            <p className="text-lg text-gray-600 mb-4">
              Cycle {cyclesCompleted + 1} of {totalCycles}
            </p>

            <Button onClick={stopExercise} variant="outline" size="sm">
              <Pause className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        )}

        {/* Complete State */}
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ✨ Well Done!
            </h3>
            <p className="text-gray-600 mb-6">
              You completed {totalCycles} breathing cycles. Notice how you feel now.
            </p>
            <Button
              onClick={() => {
                setPhase('ready');
                setCyclesCompleted(0);
              }}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Do Another Round
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Caregiver Wellness Component
export default function CaregiverWellness({ pregnancyData }) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const [caregiverMood, setCaregiverMood] = useState('');
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [waterIntake, setWaterIntake] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [selfCareNotes, setSelfCareNotes] = useState('');
  const [activeWellnessTab, setActiveWellnessTab] = useState('daily');

  const postpartumWeeks = pregnancyData?.postpartum_weeks || 0;

  // Fetch caregiver wellness entry for today
  const { data: todayEntry, isLoading } = useQuery({
    queryKey: ['caregiver-wellness', today],
    queryFn: async () => {
      const entries = await base44.entities.CycleSymptom.list('-log_date', 50);
      return entries.find(e => e.log_date === today);
    }
  });

  // Load today's data when found
  useEffect(() => {
    if (todayEntry) {
      setCaregiverMood(todayEntry.mood?.[0] || '');
      setSleepHours(todayEntry.sleep_hours || 0);
      setSleepQuality(todayEntry.sleep_quality || 5);
      setWaterIntake(todayEntry.water_intake || 0);
      setEnergyLevel(todayEntry.energy_level || 5);
      setStressLevel(todayEntry.mood_rating || 5);
      setSelfCareNotes(todayEntry.notes || '');
    }
  }, [todayEntry]);

  // Save/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (todayEntry) {
        return await base44.entities.CycleSymptom.update(todayEntry.id, data);
      } else {
        return await base44.entities.CycleSymptom.create({
          log_date: today,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-wellness'] });
      toast.success('✅ Wellness check-in saved!');
    },
    onError: (error) => {
      console.error('Error saving wellness:', error);
      toast.error('Failed to save. Please try again.');
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      mood: caregiverMood ? [caregiverMood] : [],
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      water_intake: waterIntake,
      energy_level: energyLevel,
      mood_rating: stressLevel,
      notes: selfCareNotes
    });
  };

  // Auto-save on changes (debounced)
  useEffect(() => {
    const hasData = caregiverMood || sleepHours > 0 || waterIntake > 0;
    if (!hasData) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [caregiverMood, sleepHours, sleepQuality, waterIntake, energyLevel, stressLevel, selfCareNotes]);

  const moodOptions = [
    { value: 'energized', icon: Sun, label: 'Energized', color: 'text-yellow-500' },
    { value: 'calm', icon: Cloud, label: 'Calm', color: 'text-blue-500' },
    { value: 'tired', icon: Battery, label: 'Tired', color: 'text-orange-500' },
    { value: 'overwhelmed', icon: CloudRain, label: 'Overwhelmed', color: 'text-gray-500' },
    { value: 'anxious', icon: AlertCircle, label: 'Anxious', color: 'text-red-500' },
    { value: 'grateful', icon: Sparkles, label: 'Grateful', color: 'text-pink-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border-2 border-purple-300 shadow-xl">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 text-pink-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Wellness Matters Too 💕
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Taking care of yourself isn't selfish—it's essential. Track your mood, sleep, and self-care 
            so you can be the best caregiver possible.
          </p>
          {postpartumWeeks > 0 && (
            <Badge className="mt-4 bg-pink-500 text-white px-4 py-2 text-base">
              {postpartumWeeks} Weeks Postpartum
            </Badge>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeWellnessTab} onValueChange={setActiveWellnessTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg">
          <TabsTrigger 
            value="daily"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white rounded-xl"
          >
            <Heart className="w-4 h-4 mr-2" />
            Daily Check-In
          </TabsTrigger>
          <TabsTrigger 
            value="breathe"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl"
          >
            <Wind className="w-4 h-4 mr-2" />
            Breathe
          </TabsTrigger>
          <TabsTrigger 
            value="insights"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Daily Check-In Tab */}
        <TabsContent value="daily" className="mt-6 space-y-6">
          {/* Mood Tracking */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-pink-600" />
                How are you feeling right now?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moodOptions.map(mood => {
                  const Icon = mood.icon;
                  return (
                    <motion.button
                      key={mood.value}
                      onClick={() => setCaregiverMood(mood.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-xl transition-all ${
                        caregiverMood === mood.value
                          ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${caregiverMood === mood.value ? 'text-white' : mood.color}`} />
                      <p className="text-sm font-semibold text-center">{mood.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Energy & Stress Levels */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Battery className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Energy Level ({energyLevel}/10)</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer 
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #60a5fa ${energyLevel * 10}%, #e5e7eb ${energyLevel * 10}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold">Stress Level ({stressLevel}/10)</span>
                </Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer 
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #fb923c ${stressLevel * 10}%, #e5e7eb ${stressLevel * 10}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sleep Tracking */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-600" />
                Your Sleep Last Night
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Hours of Sleep</Label>
                  <Input
                    type="number"
                    min="0"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Sleep Quality ({sleepQuality}/10)</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-3
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-md"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #c084fc ${sleepQuality * 10}%, #e5e7eb ${sleepQuality * 10}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Intake */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
                Water Intake Today
              </CardTitle>
              <p className="text-sm text-gray-600">
                Especially important for breastfeeding moms! Goal: 8-10 glasses
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Button
                  onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                  size="lg"
                  variant="outline"
                  className="text-2xl"
                >
                  −
                </Button>
                <div className="flex-1 text-center">
                  <p className="text-5xl font-bold text-cyan-600">{waterIntake}</p>
                  <p className="text-sm text-gray-600">glasses</p>
                </div>
                <Button
                  onClick={() => setWaterIntake(waterIntake + 1)}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-2xl"
                >
                  +
                </Button>
              </div>

              {/* Visual Water Progress */}
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i < waterIntake ? [1, 1.2, 1] : 1,
                      opacity: i < waterIntake ? 1 : 0.3
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Droplets className={`w-6 h-6 ${i < waterIntake ? 'text-cyan-500' : 'text-gray-300'}`} />
                  </motion.div>
                ))}
              </div>

              {waterIntake >= 8 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-green-50 rounded-lg p-3 border-2 border-green-300 text-center"
                >
                  <p className="text-sm text-green-800 font-semibold">
                    ✅ Great job! You've reached your hydration goal!
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Self-Care Notes */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Self-Care Reflections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={selfCareNotes}
                onChange={(e) => setSelfCareNotes(e.target.value)}
                placeholder="How are you really doing? Any challenges? Small wins? It's okay to not be okay..."
                className="h-32 bg-white border-2 border-gray-200 focus:border-purple-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                💜 This is your private space. Be honest with yourself.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 py-6 text-lg shadow-lg"
          >
            {saveMutation.isPending ? 'Saving...' : '💕 Save My Check-In'}
          </Button>

          {/* Quick Tips for Postpartum */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Self-Care Reminders for Postpartum Moms
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Coffee className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Sleep when baby sleeps</strong> - Even 20-minute naps help</span>
                </li>
                <li className="flex items-start gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Stay hydrated</strong> - Extra important for breastfeeding</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ask for help</strong> - You don't have to do it all alone</span>
                </li>
                <li className="flex items-start gap-2">
                  <Wind className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Take breathing breaks</strong> - Just 2 minutes can reset your nervous system</span>
                </li>
                <li className="flex items-start gap-2">
                  <Moon className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Lower your expectations</strong> - Survival mode is okay right now</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breathing Exercises Tab */}
        <TabsContent value="breathe" className="mt-6">
          <BreathingExercise
            onComplete={() => {
              toast.success('🌬️ Breathing complete! Notice how you feel now.');
              // Log the activity
              saveMutation.mutate({
                notes: (selfCareNotes ? selfCareNotes + '\n\n' : '') + `✨ Completed breathing exercise at ${format(new Date(), 'h:mm a')}`
              });
            }}
          />

          {/* Quick Calming Tips */}
          <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 mt-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Wind className="w-5 h-5 text-cyan-600" />
                When to Use Breathing Exercises
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-900">😰 Feeling Overwhelmed?</p>
                  <p className="text-gray-600">Use 4-7-8 breathing to quickly calm your nervous system</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-900">😴 Can't Sleep?</p>
                  <p className="text-gray-600">Box breathing before bed helps prepare your body for rest</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-900">⚡ Need a Reset?</p>
                  <p className="text-gray-600">Simple deep breaths between baby tasks restore your energy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Your Wellness Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center border-2 border-pink-200">
                  <Smile className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Today's Mood</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{caregiverMood || 'Not set'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 text-center border-2 border-purple-200">
                  <Moon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Sleep Last Night</p>
                  <p className="text-lg font-bold text-gray-900">{sleepHours}h</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 text-center border-2 border-cyan-200">
                  <Droplets className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Water Today</p>
                  <p className="text-lg font-bold text-gray-900">{waterIntake} glasses</p>
                </div>
              </div>

              {/* Encouragement Based on Data */}
              <div className="space-y-3">
                {sleepHours < 5 && (
                  <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                    <p className="text-sm text-orange-900">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      <strong>Low sleep detected.</strong> Sleep deprivation is real in the postpartum period. 
                      Try to nap when baby naps, and ask your partner/family to take a night shift if possible.
                    </p>
                  </div>
                )}

                {waterIntake < 6 && (
                  <div className="bg-cyan-50 rounded-lg p-4 border-2 border-cyan-200">
                    <p className="text-sm text-cyan-900">
                      <Droplets className="w-4 h-4 inline mr-2" />
                      <strong>Hydration reminder:</strong> Keep a water bottle next to your nursing/feeding station. 
                      Aim for 8-10 glasses, especially if breastfeeding.
                    </p>
                  </div>
                )}

                {stressLevel >= 7 && (
                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                    <p className="text-sm text-red-900">
                      <Wind className="w-4 h-4 inline mr-2" />
                      <strong>High stress detected.</strong> Take 2 minutes for a breathing exercise right now. 
                      Consider reaching out to your support network or a postpartum counselor.
                    </p>
                  </div>
                )}

                {sleepHours >= 6 && waterIntake >= 8 && stressLevel <= 5 && (
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-green-900">
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      <strong>You're doing great!</strong> Good sleep, hydration, and manageable stress - 
                      keep taking care of yourself. You're an amazing caregiver! 💕
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Resources */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Need Immediate Support?
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-900">Postpartum Depression Hotline</p>
                  <p className="text-gray-600">1-800-944-4773 (24/7 support)</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-900">Crisis Text Line</p>
                  <p className="text-gray-600">Text HELLO to 741741</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-900">National Suicide Prevention</p>
                  <p className="text-gray-600">988 or 1-800-273-8255</p>
                </div>
                <p className="text-xs text-gray-600 italic mt-4">
                  💜 Postpartum depression and anxiety are medical conditions, not a reflection of your ability to parent. 
                  You deserve support.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}