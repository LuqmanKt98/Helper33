import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Brain, Users, Calendar, BookOpen, Activity,
  Sparkles, ArrowRight, ArrowLeft, CheckCircle, Star,
  Zap, Target, Shield, MessageSquare, LifeBuoy, Baby,
  Gift, Crown, Trophy, Rocket, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WelcomeWizard({ onComplete }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    user_type: [],
    primary_interest: '',
    life_situation: [],
    wellness_goals: []
  });
  const [coins, setCoins] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Play welcome sound
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('playUISound', { detail: { type: 'success' } });
      window.dispatchEvent(event);
    }
  }, []);

  const saveSurveyMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.OnboardingResponse.create(data);
    },
    onSuccess: () => {
      toast.success('🎉 Welcome to Helper33! Your adventure begins now!');
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast.error('Failed to save preferences. Please try again.');
    }
  });

  const earnCoins = (amount) => {
    setCoins(prev => prev + amount);
    setShowCoinAnimation(true);
    setShowConfetti(true);
    
    // Play success sound
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('playUISound', { detail: { type: 'complete' } });
      window.dispatchEvent(event);
    }
    
    setTimeout(() => {
      setShowCoinAnimation(false);
      setShowConfetti(false);
    }, 2000);
  };

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome, Adventurer!',
      subtitle: 'Your wellness quest begins here',
      emoji: '🎮',
      coins: 0
    },
    {
      id: 'user_type',
      title: 'Choose Your Character!',
      subtitle: 'Select all roles that fit you',
      emoji: '👤',
      question: 'Which adventurer types are you?',
      type: 'multi-select',
      coins: 50,
      options: [
        { value: 'parent', label: 'Guardian of Little Ones', icon: Baby, color: 'from-pink-500 to-rose-500', desc: 'Protecting and nurturing' },
        { value: 'caregiver', label: 'Compassionate Healer', icon: Heart, color: 'from-purple-500 to-pink-500', desc: 'Supporting others with love' },
        { value: 'wellness_seeker', label: 'Wellness Warrior', icon: Sparkles, color: 'from-amber-500 to-orange-500', desc: 'On a quest for balance' },
        { value: 'grief_support', label: 'Healing Traveler', icon: Heart, color: 'from-blue-500 to-purple-500', desc: 'Navigating through loss' },
        { value: 'student', label: 'Knowledge Seeker', icon: BookOpen, color: 'from-green-500 to-emerald-500', desc: 'Learning and growing' },
        { value: 'professional', label: 'Career Champion', icon: Target, color: 'from-indigo-500 to-blue-500', desc: 'Balancing work and life' }
      ]
    },
    {
      id: 'life_situation',
      title: 'Map Your Journey',
      subtitle: 'What paths are you exploring?',
      emoji: '🧭',
      question: 'On this adventure, I am facing...',
      type: 'multi-select',
      coins: 75,
      options: [
        { value: 'grief_loss', label: 'Loss & Healing', icon: Heart, color: 'from-rose-500 to-pink-500', desc: 'Finding light after darkness' },
        { value: 'stress_anxiety', label: 'Waves of Worry', icon: Brain, color: 'from-purple-500 to-indigo-500', desc: 'Calming the storm within' },
        { value: 'life_transitions', label: 'Big Changes', icon: Zap, color: 'from-blue-500 to-cyan-500', desc: 'Embracing transformation' },
        { value: 'family_coordination', label: 'Family Quest', icon: Users, color: 'from-green-500 to-emerald-500', desc: 'Coordinating the crew' },
        { value: 'personal_growth', label: 'Growth Journey', icon: Sparkles, color: 'from-amber-500 to-yellow-500', desc: 'Leveling up in life' },
        { value: 'daily_overwhelm', label: 'Daily Battles', icon: Calendar, color: 'from-orange-500 to-red-500', desc: 'Conquering the chaos' },
        { value: 'mental_health', label: 'Mind Mastery', icon: Brain, color: 'from-teal-500 to-cyan-500', desc: 'Building mental strength' },
        { value: 'just_exploring', label: 'Exploring Worlds', icon: Star, color: 'from-pink-500 to-purple-500', desc: 'Discovering new paths' }
      ]
    },
    {
      id: 'wellness_goals',
      title: 'Equip Your Powers!',
      subtitle: 'Choose your special abilities',
      emoji: '💪',
      question: 'I want to unlock the power to...',
      type: 'multi-select',
      coins: 100,
      options: [
        { value: 'reduce_stress', label: 'Stress Shield', icon: Brain, color: 'from-purple-500 to-pink-500', desc: 'Deflect daily stress' },
        { value: 'process_emotions', label: 'Emotion Alchemy', icon: Heart, color: 'from-rose-500 to-pink-500', desc: 'Transform feelings into wisdom' },
        { value: 'build_habits', label: 'Habit Mastery', icon: CheckCircle, color: 'from-green-500 to-emerald-500', desc: 'Create powerful routines' },
        { value: 'stay_organized', label: 'Chaos Tamer', icon: Calendar, color: 'from-blue-500 to-cyan-500', desc: 'Bring order to your world' },
        { value: 'connect_others', label: 'Alliance Builder', icon: Users, color: 'from-indigo-500 to-purple-500', desc: 'Form supportive bonds' },
        { value: 'track_health', label: 'Vitality Tracker', icon: Activity, color: 'from-orange-500 to-amber-500', desc: 'Monitor your strength' },
        { value: 'find_peace', label: 'Peace Finder', icon: Sparkles, color: 'from-teal-500 to-cyan-500', desc: 'Discover inner calm' },
        { value: 'support_family', label: 'Family Guardian', icon: Shield, color: 'from-pink-500 to-rose-500', desc: 'Protect loved ones' }
      ]
    },
    {
      id: 'primary_interest',
      title: 'Choose Your Starting Quest!',
      subtitle: 'Where will your adventure begin?',
      emoji: '🚀',
      question: 'My first mission will be...',
      type: 'single-select',
      coins: 150,
      options: [
        { value: 'grief_support', label: 'Healing Quest', icon: Heart, color: 'from-rose-500 to-pink-500', desc: '24/7 AI companions guide your healing journey' },
        { value: 'wellness_tracking', label: 'Vitality Voyage', icon: Activity, color: 'from-green-500 to-emerald-500', desc: 'Track mood, sleep and energy levels' },
        { value: 'family_coordination', label: 'Family Adventure', icon: Users, color: 'from-blue-500 to-cyan-500', desc: 'Unite your family with powerful tools' },
        { value: 'mindfulness', label: 'Zen Master Path', icon: Brain, color: 'from-purple-500 to-indigo-500', desc: 'Meditation and peace-building exercises' },
        { value: 'journaling', label: 'Story Weaver', icon: BookOpen, color: 'from-amber-500 to-orange-500', desc: 'Write your healing narrative' },
        { value: 'life_coaching', label: 'Champion Road', icon: Sparkles, color: 'from-pink-500 to-purple-500', desc: 'AI guides you to achieve goals' },
        { value: 'all_features', label: 'Grand Tour', icon: Zap, color: 'from-orange-500 to-red-500', desc: 'Explore the entire realm!' }
      ]
    },
    {
      id: 'treasure_chest',
      title: 'Quest Complete!',
      subtitle: 'Your treasure awaits',
      emoji: '🏆',
      coins: 200
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleMultiSelect = (value) => {
    const field = currentStepData.id;
    const current = answers[field] || [];
    
    if (current.includes(value)) {
      setAnswers({ ...answers, [field]: current.filter(v => v !== value) });
    } else {
      if (current.length >= 10) {
        toast.error('Maximum 10 selections allowed');
        return;
      }
      setAnswers({ ...answers, [field]: [...current, value] });
      
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('playUISound', { detail: { type: 'click' } });
        window.dispatchEvent(event);
      }
    }
  };

  const handleSingleSelect = (value) => {
    const field = currentStepData.id;
    setAnswers({ ...answers, [field]: value });
    
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('playUISound', { detail: { type: 'click' } });
      window.dispatchEvent(event);
    }
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (answers.primary_interest === 'grief_support' || answers.life_situation?.includes('grief_loss')) {
      recommendations.push({
        title: 'AI Grief Support',
        description: 'Create personalized support companions',
        page: 'GriefCoach',
        icon: Heart,
        color: 'from-rose-500 to-pink-500',
        priority: 1
      });
    }

    if (answers.primary_interest === 'wellness_tracking' || answers.wellness_goals?.includes('track_health')) {
      recommendations.push({
        title: 'Wellness Tracking',
        description: 'Monitor mood, sleep, and energy',
        page: 'Wellness',
        icon: Activity,
        color: 'from-green-500 to-emerald-500',
        priority: 1
      });
    }

    if (answers.primary_interest === 'family_coordination' || answers.wellness_goals?.includes('support_family')) {
      recommendations.push({
        title: 'Family Hub',
        description: 'Coordinate schedules and stay connected',
        page: 'Family',
        icon: Users,
        color: 'from-blue-500 to-cyan-500',
        priority: 1
      });
    }

    if (answers.primary_interest === 'mindfulness' || answers.wellness_goals?.includes('find_peace')) {
      recommendations.push({
        title: 'Mindfulness Center',
        description: 'Breathing exercises and meditation',
        page: 'MindfulnessHub',
        icon: Brain,
        color: 'from-purple-500 to-indigo-500',
        priority: 1
      });
    }

    if (answers.primary_interest === 'journaling' || answers.wellness_goals?.includes('process_emotions')) {
      recommendations.push({
        title: 'Journal Studio',
        description: 'Guided journaling with AI insights',
        page: 'JournalStudio',
        icon: BookOpen,
        color: 'from-amber-500 to-orange-500',
        priority: 1
      });
    }

    if (answers.wellness_goals?.includes('build_habits') || answers.wellness_goals?.includes('stay_organized')) {
      recommendations.push({
        title: 'Smart Organizer',
        description: 'AI task management and habit tracking',
        page: 'Organizer',
        icon: Calendar,
        color: 'from-orange-500 to-amber-500',
        priority: 2
      });
    }

    recommendations.push({
      title: 'Your Dashboard',
      description: 'Your personalized wellness home',
      page: 'Dashboard',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      priority: 3
    });

    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 6);
  };

  const canProceed = () => {
    if (currentStepData.type === 'multi-select') {
      return answers[currentStepData.id]?.length > 0;
    }
    if (currentStepData.type === 'single-select') {
      return answers[currentStepData.id] !== '';
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (canProceed() && currentStepData.coins) {
        earnCoins(currentStepData.coins);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    if (!answers.user_type || answers.user_type.length === 0) {
      toast.error('Please select at least one user type');
      return;
    }

    if (!answers.primary_interest) {
      toast.error('Please select a primary interest');
      return;
    }

    earnCoins(currentStepData.coins);
    
    const lifeData = answers.life_situation?.join(', ') || 'none';
    const goalsData = answers.wellness_goals?.join(', ') || 'none';

    await saveSurveyMutation.mutateAsync({
      user_type: answers.user_type,
      primary_interest: answers.primary_interest,
      additional_feedback: `Life: ${lifeData}. Goals: ${goalsData}`
    });

    const targetPage = answers.primary_interest === 'grief_support' ? 'GriefCoach' :
                       answers.primary_interest === 'wellness_tracking' ? 'Wellness' :
                       answers.primary_interest === 'family_coordination' ? 'Family' :
                       answers.primary_interest === 'mindfulness' ? 'MindfulnessHub' :
                       answers.primary_interest === 'journaling' ? 'JournalStudio' :
                       answers.primary_interest === 'life_coaching' ? 'LifeCoach' :
                       'Dashboard';

    setTimeout(() => navigate(createPageUrl(targetPage)), 2000);
  };

  const ConfettiExplosion = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          initial={{ top: '50%', left: '50%', scale: 0, rotate: 0 }}
          animate={{
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            scale: [0, 1.5, 0],
            rotate: Math.random() * 720,
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          {['🎉', '🎊', '✨', '⭐', '💫', '🌟', '💖', '🎁'][Math.floor(Math.random() * 8)]}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 z-50 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            initial={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], rotate: [0, 360], y: [0, -50, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
          >
            {['✨', '🌟', '💫', '⭐', '🎆', '🎇'][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>

      {showConfetti && <ConfettiExplosion />}

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          className="fixed top-20 right-4 sm:right-8 z-50"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 border-4 border-yellow-300 shadow-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div
                animate={showCoinAnimation ? { scale: [1, 2, 1], rotate: [0, 720] } : { rotate: [0, 10, -10, 0] }}
                transition={showCoinAnimation ? { duration: 0.8 } : { duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                💰
              </motion.div>
              <div>
                <p className="text-xs font-semibold text-yellow-900">Adventure Coins</p>
                <motion.p 
                  key={coins}
                  initial={{ scale: 1.5, color: '#fff' }}
                  animate={{ scale: 1, color: '#78350f' }}
                  className="text-2xl font-bold text-yellow-900"
                >
                  {coins}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-bold text-sm">Quest Progress</p>
            <p className="text-yellow-400 font-bold text-sm">Level {currentStep + 1}/{steps.length}</p>
          </div>
          <div className="h-5 bg-purple-900/50 rounded-full overflow-hidden border-2 border-purple-500 shadow-lg relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: progress + '%' }}
              transition={{ type: "spring", stiffness: 100 }}
              className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <motion.div
              className="absolute right-2 top-1/2 -translate-y-1/2"
              animate={{ rotate: 360, scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative mb-8 inline-block"
              >
                <div className="text-9xl filter drop-shadow-2xl">🎮</div>
                <motion.div className="absolute -top-4 -right-4 text-5xl" animate={{ rotate: 360, scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.div>
                <motion.div className="absolute -bottom-4 -left-4 text-5xl" animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>🌟</motion.div>
                <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl" animate={{ y: [-10, -30, -10], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>💫</motion.div>
              </motion.div>
              
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl sm:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                Welcome, Hero! 🦸
              </motion.h1>
              
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-2xl text-purple-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                Embark on a <span className="text-yellow-400 font-bold">legendary wellness quest</span> tailored just for you!
              </motion.p>

              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: "spring" }}>
                <Card className="bg-gradient-to-br from-purple-800/95 to-indigo-800/95 backdrop-blur-md border-4 border-purple-400 shadow-2xl mb-8">
                  <CardContent className="p-8">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4">🎁</motion.div>
                    <p className="text-xl text-white mb-6 leading-relaxed">Complete this <span className="text-yellow-400 font-bold">2-minute adventure</span> to unlock epic rewards!</p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: '🎯', label: 'Personalized Features', color: 'from-rose-500 to-pink-500', coinValue: 50 },
                        { icon: '⚡', label: 'Quick Start Guide', color: 'from-amber-500 to-orange-500', coinValue: 75 },
                        { icon: '🏆', label: 'Bonus Rewards', color: 'from-purple-500 to-indigo-500', coinValue: 100 }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + idx * 0.2 }}
                          whileHover={{ scale: 1.15, y: -10, rotate: 5 }}
                          className={'bg-gradient-to-br ' + item.color + ' p-6 rounded-2xl shadow-xl border-2 border-white/20'}
                        >
                          <motion.div className="text-6xl mb-3" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}>{item.icon}</motion.div>
                          <p className="font-bold text-white text-lg mb-2">{item.label}</p>
                          <Badge className="bg-yellow-400 text-yellow-900 font-bold text-sm">+{item.coinValue} coins</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleNext} size="lg" className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 text-yellow-900 font-bold shadow-2xl px-16 py-10 text-2xl border-4 border-yellow-300 relative overflow-hidden">
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
                  <span className="relative z-10 flex items-center gap-3"><Rocket className="w-8 h-8" />Start Adventure!<Sparkles className="w-8 h-8" /></span>
                </Button>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-purple-300 text-sm mt-6 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />Estimated time: 2 minutes
              </motion.p>
            </motion.div>
          )}

          {currentStep > 0 && currentStep < steps.length - 1 && (
            <motion.div key={currentStep} initial={{ opacity: 0, x: 100, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -100, scale: 0.9 }} transition={{ type: "spring", stiffness: 100 }}>
              <Card className="bg-gradient-to-br from-white to-purple-50 border-4 border-purple-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white border-b-4 border-purple-400">
                  <div className="text-center">
                    <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-4 filter drop-shadow-lg">{currentStepData.emoji}</motion.div>
                    <CardTitle className="text-4xl mb-2">{currentStepData.title}</CardTitle>
                    <p className="text-purple-100 text-lg">{currentStepData.subtitle}</p>
                    {currentStepData.coins && (
                      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 200 }} className="mt-4">
                        <Badge className="bg-yellow-400 text-yellow-900 text-lg font-bold px-6 py-3 shadow-lg"><Gift className="w-5 h-5 mr-2" />Reward: +{currentStepData.coins} Coins!</Badge>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Sparkles className="w-7 h-7 text-purple-600" />{currentStepData.question}
                  </h3>

                  {currentStepData.type === 'multi-select' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentStepData.options.map((option, idx) => {
                        const isSelected = answers[currentStepData.id]?.includes(option.value);
                        const OptionIcon = option.icon;

                        return (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, y: 30, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: idx * 0.1, type: "spring" }}
                            whileHover={{ scale: 1.08, y: -8 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleMultiSelect(option.value)}
                            className={'p-6 rounded-2xl border-4 transition-all text-left relative overflow-hidden ' + (isSelected ? 'bg-gradient-to-br ' + option.color + ' text-white border-yellow-400 shadow-2xl' : 'bg-white border-gray-300 hover:border-purple-400 shadow-lg')}
                          >
                            {isSelected && (
                              <>
                                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                <motion.div className="absolute top-2 right-2 text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>⭐</motion.div>
                              </>
                            )}
                            <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={isSelected ? 'p-3 rounded-xl bg-white/20' : 'p-3 rounded-xl bg-purple-100'}>
                                  <OptionIcon className={'w-7 h-7 ' + (isSelected ? 'text-white' : 'text-purple-600')} />
                                </div>
                                <span className={'font-bold text-lg ' + (isSelected ? 'text-white' : 'text-gray-900')}>{option.label}</span>
                              </div>
                              <p className={'text-sm mt-2 ' + (isSelected ? 'text-white/90' : 'text-gray-600')}>{option.desc}</p>
                              {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="flex items-center gap-2 mt-3 bg-yellow-400/20 rounded-lg px-3 py-2">
                                  <CheckCircle className="w-5 h-5 text-yellow-300 fill-current" /><span className="text-sm text-white font-bold">Chosen!</span>
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {currentStepData.type === 'single-select' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentStepData.options.map((option, idx) => {
                        const isSelected = answers[currentStepData.id] === option.value;
                        const OptionIcon = option.icon;

                        return (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.15, type: "spring" }}
                            whileHover={{ scale: 1.08, y: -10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSingleSelect(option.value)}
                            className={'p-8 rounded-3xl border-4 transition-all text-left relative overflow-hidden ' + (isSelected ? 'bg-gradient-to-br ' + option.color + ' text-white border-yellow-400 shadow-2xl scale-105' : 'bg-white border-gray-300 hover:border-purple-400 shadow-lg')}
                          >
                            {isSelected && (
                              <motion.div className="absolute top-2 right-2 text-4xl" animate={{ rotate: 360, scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>⭐</motion.div>
                            )}
                            <div className="relative z-10">
                              <OptionIcon className={'w-14 h-14 mb-4 ' + (isSelected ? 'text-white' : 'text-gray-600')} />
                              <p className={'font-bold text-2xl mb-3 ' + (isSelected ? 'text-white' : 'text-gray-900')}>{option.label}</p>
                              <p className={'text-sm leading-relaxed ' + (isSelected ? 'text-white/90' : 'text-gray-600')}>{option.desc}</p>
                              {isSelected && (
                                <motion.div initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300 }} className="flex items-center gap-2 mt-4 bg-yellow-400 text-yellow-900 rounded-full px-4 py-2 font-bold">
                                  <Crown className="w-6 h-6 fill-current" /><span>Quest Selected!</span>
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    {currentStep > 1 && (
                      <Button onClick={handleBack} variant="outline" size="lg" className="flex-1 border-4 border-purple-400 hover:bg-purple-100 text-purple-700 font-bold text-lg">
                        <ArrowLeft className="w-5 h-5 mr-2" />Back
                      </Button>
                    )}
                    <Button onClick={handleNext} disabled={!canProceed()} size="lg" className="flex-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 text-yellow-900 font-bold shadow-2xl text-lg disabled:opacity-50 border-4 border-yellow-300">
                      {canProceed() ? <>Next Level!<ArrowRight className="w-5 h-5 ml-2" /></> : 'Choose to Continue'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === steps.length - 1 && (
            <motion.div key="treasure" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 80 }}>
              <div className="text-center mb-6">
                <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.3, 1], y: [0, -20, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-9xl filter drop-shadow-2xl mb-4">🏆</motion.div>
                <h2 className="text-6xl font-bold text-white drop-shadow-lg">Quest Complete!</h2>
                <p className="text-2xl text-purple-200 mt-2">You earned <span className="text-yellow-400 font-black">{coins}</span> Coins!</p>
              </div>

              <Card className="bg-gradient-to-br from-purple-800/95 to-indigo-900/95 backdrop-blur-md border-4 border-yellow-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-yellow-900">
                  <div className="text-center">
                    <motion.div animate={{ rotate: [0, 360], scale: [1, 1.4, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-8xl mb-4">🎁</motion.div>
                    <CardTitle className="text-4xl mb-2 font-black">Your Treasure Chest!</CardTitle>
                    <p className="text-yellow-800 text-lg font-semibold">Personalized features unlocked</p>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <div className="bg-gradient-to-r from-purple-700/80 to-indigo-700/80 rounded-2xl p-6 mb-8 border-2 border-purple-400">
                    <h3 className="font-bold text-2xl text-yellow-400 mb-4 flex items-center gap-3"><Sparkles className="w-7 h-7" />Your Hero Profile:</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {answers.user_type?.length > 0 && (
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                          <p className="font-semibold text-purple-300 mb-2">Character Type:</p>
                          <p className="text-white text-base font-bold">{answers.user_type.join(', ')}</p>
                        </div>
                      )}
                      {answers.wellness_goals?.length > 0 && (
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                          <p className="font-semibold text-purple-300 mb-2">Powers:</p>
                          <p className="text-white text-base font-bold">{answers.wellness_goals.slice(0, 3).join(', ')}</p>
                        </div>
                      )}
                      {answers.primary_interest && (
                        <div className="bg-white/10 rounded-xl p-4 border border-white/20 md:col-span-2">
                          <p className="font-semibold text-purple-300 mb-2">Main Quest:</p>
                          <p className="text-white text-base font-bold capitalize">{answers.primary_interest.replace(/_/g, ' ')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />Your Magical Items:
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {getRecommendations().map((rec, idx) => {
                      const RecIcon = rec.icon;
                      return (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + idx * 0.2, type: "spring" }}
                          whileHover={{ scale: 1.08, y: -10 }}
                          onClick={() => navigate(createPageUrl(rec.page))}
                          className={'p-7 rounded-2xl bg-gradient-to-br ' + rec.color + ' text-white text-left shadow-2xl border-4 border-white/30 group'}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-4 bg-white/30 rounded-2xl shadow-lg">
                              <RecIcon className="w-8 h-8" />
                            </div>
                            <h4 className="font-black text-xl flex-1">{rec.title}</h4>
                            {rec.priority === 1 && <Badge className="bg-yellow-400 text-yellow-900 font-black text-sm">EPIC</Badge>}
                          </div>
                          <p className="text-sm text-white/95 mb-4">{rec.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold flex items-center gap-2"><Zap className="w-4 h-4" />Tap to Begin</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={handleComplete} disabled={saveSurveyMutation.isPending} size="lg" className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-black shadow-2xl py-12 text-2xl border-4 border-green-300">
                      {saveSurveyMutation.isPending ? 'Saving...' : <><CheckCircle className="w-7 h-7 mr-3" />Begin My Wellness Adventure!<Rocket className="w-7 h-7 ml-3" /></>}
                    </Button>
                  </motion.div>

                  <p className="text-center text-sm text-purple-300 mt-6 flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />Explore all realms from your dashboard!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-3 mt-8">
          {steps.map((step, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.4, y: -8 }} className="relative">
              <motion.div
                animate={{ scale: idx === currentStep ? [1, 1.5, 1] : 1, backgroundColor: idx === currentStep ? '#fbbf24' : idx < currentStep ? '#10b981' : '#6b7280' }}
                transition={idx === currentStep ? { duration: 1, repeat: Infinity } : {}}
                className="w-5 h-5 rounded-full shadow-lg border-3 border-white"
              />
              {idx === currentStep && <motion.div className="absolute inset-0 rounded-full bg-yellow-400" animate={{ scale: [1, 2.5, 2.5], opacity: [0.8, 0, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />}
              {idx < currentStep && <CheckCircle className="w-5 h-5 text-white fill-green-500 absolute inset-0" />}
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-purple-300 bg-purple-800/50 px-4 py-2 rounded-full border border-purple-400">
            <Shield className="w-4 h-4" />Your data is encrypted and secure 🔒
          </div>
        </motion.div>
      </div>
    </div>
  );
}