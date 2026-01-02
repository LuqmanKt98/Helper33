import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Brain, Users, Calendar, BookOpen, Activity,
  Sparkles, ArrowRight, ArrowLeft, CheckCircle,
  Zap, Target, Shield, Baby, Rocket, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InteractiveWelcome({ onComplete }) {
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
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('playUISound', { detail: { type: 'success' } });
      window.dispatchEvent(event);
    }
  }, []);

  const saveSurvey = useMutation({
    mutationFn: (data) => base44.entities.OnboardingResponse.create(data),
    onSuccess: () => {
      toast.success('🎉 Welcome to Helper33!');
      if (onComplete) onComplete();
    }
  });

  const earnCoins = (amount) => {
    setCoins(prev => prev + amount);
    setShowCoinAnimation(true);
    setShowConfetti(true);
    
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
    { id: 'welcome', title: 'Welcome, Hero!', subtitle: 'Your wellness quest begins', emoji: '🎮', coins: 0 },
    {
      id: 'user_type', title: 'Choose Your Character!', subtitle: 'Select all that fit', emoji: '👤',
      question: 'Which types are you?', type: 'multi-select', coins: 50,
      options: [
        { value: 'parent', label: 'Guardian', icon: Baby, color: 'from-pink-500 to-rose-500', desc: 'Nurturing little ones' },
        { value: 'caregiver', label: 'Healer', icon: Heart, color: 'from-purple-500 to-pink-500', desc: 'Supporting with love' },
        { value: 'wellness_seeker', label: 'Warrior', icon: Sparkles, color: 'from-amber-500 to-orange-500', desc: 'Quest for balance' },
        { value: 'grief_support', label: 'Traveler', icon: Heart, color: 'from-blue-500 to-purple-500', desc: 'Healing journey' },
        { value: 'student', label: 'Scholar', icon: BookOpen, color: 'from-green-500 to-emerald-500', desc: 'Learning & growing' },
        { value: 'professional', label: 'Champion', icon: Target, color: 'from-indigo-500 to-blue-500', desc: 'Work-life balance' }
      ]
    },
    {
      id: 'wellness_goals', title: 'Equip Powers!', subtitle: 'Choose abilities', emoji: '💪',
      question: 'I want to unlock...', type: 'multi-select', coins: 100,
      options: [
        { value: 'reduce_stress', label: 'Stress Shield', icon: Brain, color: 'from-purple-500 to-pink-500', desc: 'Deflect stress' },
        { value: 'build_habits', label: 'Habit Master', icon: CheckCircle, color: 'from-green-500 to-emerald-500', desc: 'Build routines' },
        { value: 'stay_organized', label: 'Chaos Tamer', icon: Calendar, color: 'from-blue-500 to-cyan-500', desc: 'Bring order' },
        { value: 'connect_others', label: 'Alliance Builder', icon: Users, color: 'from-indigo-500 to-purple-500', desc: 'Form bonds' },
        { value: 'find_peace', label: 'Peace Finder', icon: Sparkles, color: 'from-teal-500 to-cyan-500', desc: 'Inner calm' }
      ]
    },
    {
      id: 'primary_interest', title: 'Starting Quest!', subtitle: 'Your first mission', emoji: '🚀',
      question: 'Begin with...', type: 'single-select', coins: 150,
      options: [
        { value: 'wellness_tracking', label: 'Wellness', icon: Activity, color: 'from-green-500 to-emerald-500', desc: 'Track mood & health' },
        { value: 'family_coordination', label: 'Family', icon: Users, color: 'from-blue-500 to-cyan-500', desc: 'Organize family life' },
        { value: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'from-purple-500 to-indigo-500', desc: 'Meditation & peace' },
        { value: 'all_features', label: 'Full Tour', icon: Zap, color: 'from-orange-500 to-red-500', desc: 'See everything!' }
      ]
    },
    { id: 'complete', title: 'Quest Complete!', subtitle: 'Rewards unlocked', emoji: '🏆', coins: 200 }
  ];

  const current = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleMulti = (value) => {
    const field = current.id;
    const curr = answers[field] || [];
    setAnswers({ ...answers, [field]: curr.includes(value) ? curr.filter(v => v !== value) : [...curr, value] });
  };

  const handleSingle = (value) => {
    setAnswers({ ...answers, [current.id]: value });
  };

  const canNext = () => {
    if (current.type === 'multi-select') return answers[current.id]?.length > 0;
    if (current.type === 'single-select') return answers[current.id] !== '';
    return true;
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      if (canNext() && current.coins) earnCoins(current.coins);
      setCurrentStep(currentStep + 1);
    }
  };

  const complete = async () => {
    earnCoins(current.coins);
    await saveSurvey.mutateAsync({
      user_type: answers.user_type,
      primary_interest: answers.primary_interest,
      additional_feedback: JSON.stringify(answers)
    });

    const page = answers.primary_interest === 'wellness_tracking' ? 'Wellness' :
                 answers.primary_interest === 'family_coordination' ? 'Family' :
                 answers.primary_interest === 'mindfulness' ? 'MindfulnessHub' : 'Dashboard';
    setTimeout(() => navigate(createPageUrl(page)), 2000);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 z-50 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            initial={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', scale: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 5 }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              initial={{ top: '50%', left: '50%', scale: 0 }}
              animate={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', scale: [0, 1.5, 0], rotate: Math.random() * 720, opacity: [0, 1, 0] }}
              transition={{ duration: 2 }}
            >
              {['🎉', '✨', '⭐', '💫'][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <motion.div className="fixed top-20 right-4 sm:right-8 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-yellow-300 shadow-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div animate={showCoinAnimation ? { scale: [1, 2, 1], rotate: 720 } : { rotate: [0, 10, -10, 0] }} transition={{ duration: showCoinAnimation ? 0.8 : 2, repeat: showCoinAnimation ? 0 : Infinity }} className="text-3xl">💰</motion.div>
              <div>
                <p className="text-xs font-semibold text-yellow-900">Coins</p>
                <motion.p key={coins} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-2xl font-bold text-yellow-900">{coins}</motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <p className="text-white font-bold text-sm">Progress</p>
            <p className="text-yellow-400 font-bold text-sm">Step {currentStep + 1}/{steps.length}</p>
          </div>
          <div className="h-5 bg-purple-900/50 rounded-full overflow-hidden border-2 border-purple-500 relative">
            <motion.div initial={{ width: 0 }} animate={{ width: progress + '%' }} className="h-full bg-gradient-to-r from-yellow-400 to-orange-500">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="w" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
              <motion.div animate={{ scale: [1, 1.15, 1], y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-9xl mb-6">🎮</motion.div>
              <h1 className="text-6xl font-bold mb-4 text-white">Welcome, Hero! 🦸</h1>
              <p className="text-2xl text-purple-200 mb-8">Start your <span className="text-yellow-400 font-bold">wellness quest</span>!</p>

              <Card className="bg-purple-800/95 border-4 border-purple-400 shadow-2xl mb-8">
                <CardContent className="p-8">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4">🎁</motion.div>
                  <p className="text-xl text-white mb-6">Complete in <span className="text-yellow-400 font-bold">2 minutes</span> for rewards!</p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { icon: '🎯', label: 'Personalized', color: 'from-rose-500 to-pink-500', coins: 50 },
                      { icon: '⚡', label: 'Quick Start', color: 'from-amber-500 to-orange-500', coins: 75 },
                      { icon: '🏆', label: 'Bonuses', color: 'from-purple-500 to-indigo-500', coins: 100 }
                    ].map((item, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.2 }} whileHover={{ scale: 1.15, y: -10 }} className={'bg-gradient-to-br ' + item.color + ' p-6 rounded-2xl shadow-xl border-2 border-white/20'}>
                        <div className="text-6xl mb-3">{item.icon}</div>
                        <p className="font-bold text-white mb-2">{item.label}</p>
                        <Badge className="bg-yellow-400 text-yellow-900 font-bold">+{item.coins}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={next} size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-bold px-16 py-10 text-2xl border-4 border-yellow-300">
                  <Rocket className="w-8 h-8 mr-3" />Start!<Sparkles className="w-8 h-8 ml-3" />
                </Button>
              </motion.div>
              <p className="text-purple-300 text-sm mt-4 flex items-center justify-center gap-2"><Clock className="w-4 h-4" />2 minutes</p>
            </motion.div>
          )}

          {currentStep > 0 && currentStep < steps.length - 1 && (
            <motion.div key={currentStep} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
              <Card className="bg-white border-4 border-purple-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <div className="text-center">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-8xl mb-4">{current.emoji}</motion.div>
                    <CardTitle className="text-4xl">{current.title}</CardTitle>
                    <p className="text-purple-100">{current.subtitle}</p>
                    {current.coins && <Badge className="bg-yellow-400 text-yellow-900 mt-4 px-6 py-3 text-lg font-bold">+{current.coins} Coins!</Badge>}
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                    <Sparkles className="w-7 h-7 text-purple-600" />{current.question}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {current.options.map((opt, idx) => {
                      const selected = current.type === 'multi-select' ? answers[current.id]?.includes(opt.value) : answers[current.id] === opt.value;
                      const Icon = opt.icon;

                      return (
                        <motion.button
                          key={opt.value}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.08, y: -8 }}
                          onClick={() => current.type === 'multi-select' ? handleMulti(opt.value) : handleSingle(opt.value)}
                          className={'p-6 rounded-2xl border-4 relative overflow-hidden ' + (selected ? 'bg-gradient-to-br ' + opt.color + ' text-white border-yellow-400 shadow-2xl' : 'bg-white border-gray-300 hover:border-purple-400')}
                        >
                          {selected && <motion.div className="absolute top-2 right-2 text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }}>⭐</motion.div>}
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={selected ? 'p-3 rounded-xl bg-white/20' : 'p-3 rounded-xl bg-purple-100'}>
                                <Icon className={'w-7 h-7 ' + (selected ? 'text-white' : 'text-purple-600')} />
                              </div>
                              <span className={'font-bold text-lg ' + (selected ? 'text-white' : 'text-gray-900')}>{opt.label}</span>
                            </div>
                            <p className={'text-sm ' + (selected ? 'text-white/90' : 'text-gray-600')}>{opt.desc}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 mt-8">
                    {currentStep > 1 && <Button onClick={() => setCurrentStep(currentStep - 1)} variant="outline" size="lg" className="flex-1 border-4 border-purple-400 font-bold"><ArrowLeft className="mr-2" />Back</Button>}
                    <Button onClick={next} disabled={!canNext()} size="lg" className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-bold text-lg border-4 border-yellow-300">
                      {canNext() ? <>Next!<ArrowRight className="ml-2" /></> : 'Choose First'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === steps.length - 1 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-6">
                <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-9xl mb-4">🏆</motion.div>
                <h2 className="text-6xl font-bold text-white">Quest Done!</h2>
                <p className="text-2xl text-purple-200 mt-2">Earned <span className="text-yellow-400 font-black">{coins}</span> Coins!</p>
              </div>

              <Card className="bg-purple-800/95 border-4 border-yellow-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎁</div>
                    <CardTitle className="text-4xl font-black">Rewards!</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <div className="bg-purple-700/80 rounded-2xl p-6 mb-8 border-2 border-purple-400">
                    <h3 className="font-bold text-2xl text-yellow-400 mb-4">Your Profile:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {answers.user_type?.length > 0 && (
                        <div className="bg-white/10 rounded-xl p-4"><p className="text-purple-300 mb-2">Type:</p><p className="text-white font-bold">{answers.user_type.join(', ')}</p></div>
                      )}
                      {answers.primary_interest && (
                        <div className="bg-white/10 rounded-xl p-4"><p className="text-purple-300 mb-2">Quest:</p><p className="text-white font-bold capitalize">{answers.primary_interest.replace(/_/g, ' ')}</p></div>
                      )}
                    </div>
                  </div>

                  <Button onClick={complete} disabled={saveSurvey.isPending} size="lg" className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-black py-12 text-2xl border-4 border-green-300">
                    {saveSurvey.isPending ? 'Saving...' : <><CheckCircle className="w-7 h-7 mr-3" />Begin Adventure!<Rocket className="w-7 h-7 ml-3" /></>}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-3 mt-8">
          {steps.map((s, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.4 }} className="relative">
              <motion.div animate={{ scale: idx === currentStep ? [1, 1.5, 1] : 1, backgroundColor: idx < currentStep ? '#10b981' : idx === currentStep ? '#fbbf24' : '#6b7280' }} transition={idx === currentStep ? { duration: 1, repeat: Infinity } : {}} className="w-5 h-5 rounded-full border-2 border-white shadow-lg" />
              {idx < currentStep && <CheckCircle className="w-5 h-5 text-white fill-green-500 absolute inset-0" />}
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-purple-300 mt-6 flex items-center justify-center gap-2"><Shield className="w-4 h-4" />Secure & encrypted 🔒</p>
      </div>
    </div>
  );
}