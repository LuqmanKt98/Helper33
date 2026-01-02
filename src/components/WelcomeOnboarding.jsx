import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Heart,
  Brain,
  Users,
  Calendar,
  ChefHat,
  Baby,
  Briefcase,
  BookOpen,
  Activity,
  ArrowRight,
  Check,
  X,
  Zap,
  Target,
  GraduationCap,
  Shield,
  Star,
  Trophy,
  Rocket,
  Gift,
  PartyPopper,
  Flame,
  Crown,
  Swords,
  Wand2,
  Coins,
  Bolt,
  Gamepad2,
  Music,
  Eye
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const ONBOARDING_STEPS = [
  {
    id: 'name',
    title: '🌟 Begin Your Journey',
    subtitle: 'What should we call you, hero?',
    description: 'Your quest for an easier life starts here. Every legend has a name...',
    icon: Wand2,
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    challenge: 'Enter your preferred name to earn 50 XP!'
  },
  {
    id: 'welcome',
    title: '⚔️ Welcome, {name}!',
    subtitle: 'Your All-in-One AI Life Assistant Awaits',
    description: 'You\'ve entered a realm of 33+ AI tools, 13+ specialized agents, and 700+ features. Your adventure begins now!',
    icon: Swords,
    gradient: 'from-purple-500 via-pink-500 to-rose-500'
  },
  {
    id: 'trial',
    title: '🎁 Legendary 3-Day Trial',
    subtitle: 'Full Power Unlocked - No Credit Card Required',
    description: 'All features are yours to command for 3 days! Discover your strengths before choosing your path.',
    icon: Crown,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    features: [
      { text: 'All 33+ AI tools unlocked', xp: 10 },
      { text: 'Access to 13+ specialized AI agents', xp: 10 },
      { text: 'Unlimited AI conversations', xp: 10 },
      { text: 'Full feature exploration', xp: 10 }
    ]
  },
  {
    id: 'goals',
    title: '🎯 Choose Your Quest',
    subtitle: 'What challenges will you conquer?',
    description: 'Select your missions and we\'ll equip you with the right tools. Choose wisely, hero!',
    icon: Target,
    gradient: 'from-blue-600 via-cyan-500 to-teal-500',
    options: [
      { id: 'wellness', label: 'Mental Wellness & Self-Care', icon: Heart, page: 'Wellness', xp: 25, emoji: '💜' },
      { id: 'family', label: 'Family Organization', icon: Users, page: 'Family', xp: 25, emoji: '👨‍👩‍👧' },
      { id: 'student', label: 'School & Homework Help', icon: GraduationCap, page: 'HomeworkHub', xp: 25, emoji: '📚' },
      { id: 'cooking', label: 'Meal Planning & Recipes', icon: ChefHat, page: 'MealPlanner', xp: 25, emoji: '🍳' },
      { id: 'business', label: 'Business & Social Media', icon: Briefcase, page: 'SocialMediaManager', xp: 25, emoji: '💼' },
      { id: 'kids', label: 'Kids Learning & Activities', icon: Baby, page: 'KidsCreativeStudio', xp: 25, emoji: '🎨' }
    ]
  },
  {
    id: 'features',
    title: '🚀 Your Arsenal is Ready!',
    subtitle: 'Your personalized command center awaits',
    description: 'Based on your quest choices, we\'ve prepared your ultimate toolkit:',
    icon: Gamepad2,
    gradient: 'from-green-500 via-emerald-500 to-teal-500'
  }
];

export default function WelcomeOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [points, setPoints] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [shake, setShake] = useState(false);
  const [userName, setUserName] = useState('');
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [collectingFeatures, setCollectingFeatures] = useState(false);
  const [particleEffects, setParticleEffects] = useState([]);
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const playSound = (type) => {
    const event = new CustomEvent('playUISound', { detail: { type } });
    window.dispatchEvent(event);
  };

  const createParticle = (x, y, text = '+XP') => {
    const id = Date.now() + Math.random();
    setParticleEffects(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => {
      setParticleEffects(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  const addPoints = (amount, reason, event) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    setCombo(prev => prev + 1);
    setShowPointsAnimation(true);
    playSound('success');
    
    // Level up logic
    const newLevel = Math.floor(newPoints / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setShowLevelUp(true);
      playSound('achievement');
      toast.success(`🎮 LEVEL UP! You're now Level ${newLevel}!`, {
        duration: 3000,
        icon: '⬆️'
      });
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    
    // Particle effect
    if (event?.clientX) {
      createParticle(event.clientX, event.clientY, `+${amount} XP`);
    }
    
    toast.success(`+${amount} XP! ${reason}`, {
      duration: 2000,
      icon: '⚡',
      style: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        color: 'white',
        fontWeight: 'bold'
      }
    });
    setTimeout(() => setShowPointsAnimation(false), 1000);
    
    // Combo reset
    setTimeout(() => setCombo(0), 3000);
  };

  const unlockAchievement = (achievement, emoji = '🏆') => {
    setAchievements(prev => [...prev, { name: achievement, emoji, time: Date.now() }]);
    playSound('achievement');
    setShake(true);
    setTimeout(() => setShake(false), 500);
    toast.success(`${emoji} Achievement Unlocked: ${achievement}!`, {
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px'
      }
    });
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    // Check if user has completed onboarding
    const hasSeenOnboarding = localStorage.getItem('helper33_onboarding_completed');
    if (hasSeenOnboarding) {
      onComplete?.();
    }
  }, [onComplete]);

  const handleNext = async (event) => {
    playSound('click');
    
    if (currentStep === 0 && !userName.trim()) {
      toast.error('Please enter your name to continue your quest!', {
        icon: '⚠️'
      });
      return;
    }
    
    if (currentStep === 0) {
      addPoints(50, 'Hero name registered!', event);
      unlockAchievement('The Journey Begins', '🌟');
    }
    
    if (currentStep === 1) {
      addPoints(30, 'Welcome bonus claimed!', event);
      unlockAchievement('Hero Awakened', '⚔️');
    }
    
    if (currentStep === 2) {
      // Collect feature unlocks with animation
      setCollectingFeatures(true);
      ONBOARDING_STEPS[2].features.forEach((feature, idx) => {
        setTimeout(() => {
          addPoints(feature.xp, feature.text);
        }, idx * 500);
      });
      setTimeout(() => {
        setCollectingFeatures(false);
        unlockAchievement('Power Collector', '⚡');
      }, 2500);
    }
    
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      addPoints(100, 'Quest complete!', event);
      unlockAchievement('Helper33 Legend', '👑');
      
      if (selectedGoals.length >= 3) {
        unlockAchievement('Quest Master', '🎯');
        addPoints(50, 'Multiple quests selected!');
      }
      
      if (selectedGoals.length === ONBOARDING_STEPS[3].options.length) {
        unlockAchievement('Ultimate Explorer', '🌟');
        addPoints(100, 'All quests selected!');
      }
      
      try {
        await base44.auth.updateMe({
          onboarding_completed: true,
          preferred_name: userName,
          user_goals: selectedGoals,
          onboarding_points: points + 100,
          onboarding_level: level
        });
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
      
      localStorage.setItem('helper33_onboarding_completed', 'true');
      setShowConfetti(true);
      playSound('success');
      
      setTimeout(() => {
        onComplete?.();
        if (selectedGoals.length > 0) {
          const firstGoal = ONBOARDING_STEPS[3].options.find(opt => opt.id === selectedGoals[0]);
          if (firstGoal?.page) {
            navigate(createPageUrl(firstGoal.page));
          }
        }
      }, 4000);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('helper33_onboarding_completed', 'true');
    onComplete?.();
  };

  const toggleGoal = (goalId, event) => {
    const wasSelected = selectedGoals.includes(goalId);
    const option = ONBOARDING_STEPS[3].options.find(opt => opt.id === goalId);
    
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
    
    if (!wasSelected && option) {
      playSound('click');
      addPoints(option.xp, `Quest accepted: ${option.label}!`, event);
      
      if (selectedGoals.length + 1 === 1) {
        unlockAchievement('First Quest', '🎯');
      }
      
      if (selectedGoals.length + 1 === 3) {
        unlockAchievement('Triple Threat', '🔥');
      }
      
      if (selectedGoals.length + 1 >= ONBOARDING_STEPS[3].options.length) {
        unlockAchievement('Completionist', '💯');
        addPoints(100, 'All quests accepted!');
      }
    } else if (wasSelected) {
      playSound('click');
      toast.info('Quest removed', { icon: '↩️' });
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const Icon = currentStepData.icon;
  
  // Dynamic title with user name
  const getTitle = () => {
    return currentStepData.title.replace('{name}', userName || 'Hero');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 z-50 overflow-y-auto overflow-x-hidden"
    >
      {/* XP & Level Display */}
      <div className="fixed top-4 right-4 z-20 space-y-2">
        <motion.div
          initial={{ y: -100, scale: 0 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-4 border-white relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Bolt className={`w-7 h-7 ${showPointsAnimation ? 'animate-spin' : ''}`} />
              <motion.div
                key={points}
                initial={{ scale: 1.8, rotate: 360 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-3xl font-black"
              >
                {points}
              </motion.div>
              <span className="text-sm font-bold opacity-90">XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-bold">LEVEL {level}</span>
              {combo > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-xs bg-white/30 px-2 py-0.5 rounded-full"
                >
                  x{combo} COMBO!
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Level Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border-2 border-purple-300"
        >
          <div className="flex items-center justify-between text-xs font-bold text-purple-900 mb-1">
            <span>LVL {level}</span>
            <span>LVL {level + 1}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${(points % 100)}%` }}
              transition={{ type: "spring" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Achievements Bar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="fixed left-4 top-4 z-20 space-y-2 max-w-xs"
      >
        {achievements.slice(-5).map((achievement, idx) => (
          <motion.div
            key={achievement.time}
            initial={{ x: -200, opacity: 0, scale: 0.5 }}
            animate={{ 
              x: 0, 
              opacity: 1, 
              scale: 1,
              rotate: [0, -5, 5, 0]
            }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white px-4 py-3 rounded-2xl shadow-2xl border-4 border-white flex items-center gap-3 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                x: ['0%', '100%'],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <motion.div
              animate={{
                rotate: [0, 20, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="text-2xl"
            >
              {achievement.emoji}
            </motion.div>
            <span className="text-sm font-bold relative z-10">{achievement.name}</span>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Particle Effects */}
      {particleEffects.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 0 }}
          animate={{ 
            y: particle.y - 100, 
            opacity: 0, 
            scale: [0, 1.5, 0.5] 
          }}
          transition={{ duration: 2 }}
          className="fixed pointer-events-none z-50 text-2xl font-black text-amber-500"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
        >
          {particle.text}
        </motion.div>
      ))}
      
      {/* Level Up Celebration */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{ duration: 2 }}
              className="text-9xl"
            >
              ⬆️
            </motion.div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
              style={{ textShadow: '0 0 40px rgba(251, 191, 36, 0.8)' }}
            >
              LEVEL UP!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              background: ['#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 4)],
              opacity: 0.3,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.8, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Confetti & Celebration */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: window.innerWidth / 2, opacity: 1, scale: 0 }}
                animate={{
                  y: window.innerHeight + 20,
                  x: window.innerWidth / 2 + (Math.random() - 0.5) * 600,
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0],
                  scale: [0, 1.5, 0.5],
                }}
                transition={{ duration: 3, delay: Math.random() * 0.8 }}
                className="absolute rounded-full shadow-lg"
                style={{
                  width: Math.random() * 12 + 6,
                  height: Math.random() * 12 + 6,
                  background: ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-9xl">🎉</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, 360, 0] }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute top-1/4 left-1/4 text-7xl"
            >
              ⭐
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, -360, 0] }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-1/3 right-1/4 text-7xl"
            >
              🚀
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-20 sm:py-8">
        <motion.div
          key={currentStep}
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
          initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotateY: 0,
            y: shake ? [0, -10, 10, -10, 10, 0] : 0 
          }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 20 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-3xl"
          style={{ 
            perspective: 1000,
            rotateX,
            rotateY,
            transformStyle: "preserve-3d"
          }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 30px 80px rgba(139, 92, 246, 0.4)',
                '0 30px 80px rgba(236, 72, 153, 0.4)',
                '0 30px 80px rgba(59, 130, 246, 0.4)',
                '0 30px 80px rgba(139, 92, 246, 0.4)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Card className="border-4 border-purple-300 shadow-2xl bg-white/95 backdrop-blur-xl overflow-visible relative">
              <motion.div 
                className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${currentStepData.gradient}`}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

            <CardContent className="p-8">
              {/* Progress Indicator */}
              <div className="flex gap-2 mb-8">
                {ONBOARDING_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      idx <= currentStep
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-2xl relative`}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(139, 92, 246, 0.6)',
                      '0 0 40px rgba(236, 72, 153, 0.6)',
                      '0 0 20px rgba(139, 92, 246, 0.6)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Icon className="w-12 h-12 text-white relative z-10" />
                
                {/* Sparkles around icon */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos(i * 60 * Math.PI / 180) * 50],
                      y: [0, Math.sin(i * 60 * Math.PI / 180) * 50],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Content */}
              <motion.div 
                className="text-center mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.h2 
                  className="text-5xl font-black text-gray-900 mb-3"
                  animate={{ 
                    scale: [1, 1.03, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {getTitle()}
                </motion.h2>
                <motion.p 
                  className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 font-black mb-3"
                  animate={{ 
                    opacity: [0.7, 1, 0.7],
                    backgroundPosition: ['0%', '100%', '0%']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                >
                  {currentStepData.subtitle}
                </motion.p>
                <p className="text-gray-700 text-lg font-semibold">
                  {currentStepData.description}
                </p>
                {currentStepData.challenge && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-amber-600 font-bold mt-2 text-sm flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    {currentStepData.challenge}
                  </motion.p>
                )}
              </motion.div>

              {/* Step-specific content */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter your hero name..."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="text-center text-2xl font-bold py-6 border-4 border-purple-300 focus:border-purple-500 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50"
                      autoFocus
                    />
                    {userName && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 text-4xl"
                      >
                        ⚡
                      </motion.div>
                    )}
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-purple-600 font-semibold mt-4 text-sm"
                  >
                    This name will personalize your entire experience 🎮
                  </motion.p>
                </motion.div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3 mb-8">
                  {currentStepData.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -50, scale: 0.8 }}
                      animate={{ 
                        opacity: collectingFeatures && idx <= (Date.now() / 500 % currentStepData.features.length) ? 0.3 : 1,
                        x: 0,
                        scale: collectingFeatures && idx <= (Date.now() / 500 % currentStepData.features.length) ? 1.1 : 1
                      }}
                      transition={{ 
                        delay: idx * 0.15,
                        type: "spring",
                        bounce: 0.6
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)"
                      }}
                      className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-4 border-emerald-300 relative overflow-hidden group cursor-pointer"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="flex items-center gap-3 relative z-10">
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: idx * 0.2
                          }}
                          className="bg-emerald-500 rounded-full p-2"
                        >
                          <Check className="w-5 h-5 text-white flex-shrink-0" />
                        </motion.div>
                        <span className="text-gray-900 font-bold">{feature.text}</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold relative z-10">
                        +{feature.xp} XP
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid md:grid-cols-2 gap-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
                  {currentStepData.options.map((option, idx) => {
                    const OptionIcon = option.icon;
                    const isSelected = selectedGoals.includes(option.id);
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ delay: idx * 0.1, type: "spring", bounce: 0.6 }}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -3, 3, 0],
                          boxShadow: "0 25px 50px rgba(139, 92, 246, 0.5)",
                          zIndex: 10
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => toggleGoal(option.id, e)}
                        className={`p-6 rounded-2xl border-4 transition-all text-left relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400 shadow-2xl'
                            : 'bg-white border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {isSelected && (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30"
                              animate={{
                                scale: [1, 1.15, 1],
                                opacity: [0.3, 0.6, 0.3],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute inset-0"
                              animate={{
                                background: [
                                  'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                                  'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
                                  'radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                                  'radial-gradient(circle at 100% 0%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
                                  'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                                ]
                              }}
                              transition={{ duration: 4, repeat: Infinity }}
                            />
                          </>
                        )}
                        
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                          <motion.div 
                            className={`w-14 h-14 rounded-xl flex items-center justify-center relative ${
                              isSelected
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                : 'bg-gray-100'
                            }`}
                            animate={isSelected ? {
                              rotate: [0, 360],
                              scale: [1, 1.1, 1],
                            } : {}}
                            transition={{ duration: 0.6 }}
                          >
                            {isSelected && (
                              <motion.div
                                className="absolute inset-0 rounded-xl"
                                animate={{
                                  boxShadow: [
                                    '0 0 10px rgba(139, 92, 246, 0.5)',
                                    '0 0 20px rgba(236, 72, 153, 0.5)',
                                    '0 0 10px rgba(139, 92, 246, 0.5)',
                                  ]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                            <OptionIcon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          </motion.div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2 shadow-lg"
                            >
                              <Check className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <div className="relative z-10">
                          <p className={`font-black text-lg mb-2 ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                            {option.label}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs">
                              +{option.xp} XP
                            </Badge>
                            <span className="text-2xl">{option.emoji}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <>
                            <motion.div
                              initial={{ scale: 0, rotate: 180 }}
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 360, 0]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute top-2 right-2 text-3xl"
                            >
                              ⭐
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute inset-0 border-4 border-amber-400 rounded-2xl"
                            />
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
                  {selectedGoals.map((goalId, idx) => {
                    const goal = ONBOARDING_STEPS[3].options.find(opt => opt.id === goalId);
                    if (!goal) return null;
                    const GoalIcon = goal.icon;
                    return (
                      <motion.div
                        key={goalId}
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ 
                          delay: idx * 0.15,
                          type: "spring",
                          bounce: 0.6
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 15px 35px rgba(139, 92, 246, 0.4)"
                        }}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl border-4 border-purple-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-pink-200/30"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        <div className="flex items-center gap-4 relative z-10">
                          <motion.div 
                            className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: idx * 0.2
                            }}
                          >
                            <GoalIcon className="w-7 h-7 text-white" />
                          </motion.div>
                          <div>
                            <span className="font-black text-gray-900 text-lg">{goal.label}</span>
                            <p className="text-sm text-gray-600 font-semibold">{goal.emoji} Quest Active</p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg px-4 py-2 relative z-10 shadow-lg">
                          <Check className="w-5 h-5 mr-1 inline" />
                          READY!
                        </Badge>
                      </motion.div>
                    );
                  })}
                  
                  {selectedGoals.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-4 border-blue-200"
                    >
                      <Eye className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-700 font-bold text-lg">Ready to explore everything!</p>
                      <p className="text-gray-600 mt-2">Your full dashboard awaits, hero!</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                {currentStep > 0 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                {currentStep < ONBOARDING_STEPS.length - 1 && (
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    className="flex-1"
                  >
                    Skip Tour
                  </Button>
                )}

                <motion.div className="flex-1">
                  <Button
                    onClick={handleNext}
                    disabled={collectingFeatures}
                    className={`w-full bg-gradient-to-r ${currentStepData.gradient} hover:opacity-90 text-white shadow-2xl font-black text-xl py-7 relative overflow-hidden group border-4 border-white disabled:opacity-50`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{
                        x: ['-200%', '200%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                          'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Rocket className="w-7 h-7" />
                        </motion.div>
                        LET'S GO!
                        <motion.div
                          animate={{ y: [-3, 3, -3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Flame className="w-7 h-7" />
                        </motion.div>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        {currentStep === 3 && selectedGoals.length === 0 ? 'SKIP QUESTS' : 'CONTINUE'} 
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ArrowRight className="w-6 h-6" />
                        </motion.div>
                      </span>
                    )}
                  </Button>
                </motion.div>
              </div>

              {currentStep === 3 && selectedGoals.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center text-sm text-purple-600 mt-4 font-bold flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Select your quests or skip to explore everything
                  <Sparkles className="w-4 h-4" />
                </motion.p>
              )}
            </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Enhanced Floating elements */}
        {['🎮', '⚡', '🎯', '🚀', '⭐', '🏆', '🔥', '💎'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl pointer-events-none select-none"
            style={{
              left: `${10 + (i % 4) * 25}%`,
              top: `${10 + Math.floor(i / 4) * 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, i % 2 === 0 ? 15 : -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 3 + i * 0.5, 
              repeat: Infinity,
              delay: i * 0.3
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}