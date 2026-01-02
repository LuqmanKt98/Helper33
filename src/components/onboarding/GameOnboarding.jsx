import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sparkles, Heart, Brain, Users, BookOpen,
  Activity, ArrowRight, ArrowLeft, Check, Target, GraduationCap, Shield, Trophy, Rocket, Flame, Wand2, Compass, Map, Sword, Palette, Leaf
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Personality types with themed descriptions
const PERSONALITY_TYPES = {
  guardian: { name: 'The Guardian', emoji: '🛡️', color: 'from-blue-500 to-cyan-500', desc: 'Protector of loved ones', traits: ['caring', 'organized', 'reliable'] },
  explorer: { name: 'The Explorer', emoji: '🧭', color: 'from-amber-500 to-orange-500', desc: 'Seeker of new horizons', traits: ['curious', 'adventurous', 'open-minded'] },
  healer: { name: 'The Healer', emoji: '💜', color: 'from-purple-500 to-pink-500', desc: 'Bringer of peace', traits: ['empathetic', 'nurturing', 'wise'] },
  creator: { name: 'The Creator', emoji: '✨', color: 'from-rose-500 to-red-500', desc: 'Maker of dreams', traits: ['creative', 'passionate', 'visionary'] },
  scholar: { name: 'The Scholar', emoji: '📚', color: 'from-emerald-500 to-teal-500', desc: 'Master of knowledge', traits: ['analytical', 'focused', 'determined'] },
  champion: { name: 'The Champion', emoji: '🏆', color: 'from-yellow-500 to-amber-500', desc: 'Conqueror of challenges', traits: ['driven', 'resilient', 'ambitious'] }
};

// Interactive quiz questions
const PERSONALITY_QUIZ = [
  {
    question: "It's a beautiful Saturday morning. What calls to you?",
    emoji: "🌅",
    options: [
      { text: "Organizing a family breakfast together", icon: Users, type: 'guardian', points: 20 },
      { text: "Trying a new hiking trail or activity", icon: Compass, type: 'explorer', points: 20 },
      { text: "Peaceful meditation or journaling", icon: Heart, type: 'healer', points: 20 },
      { text: "Working on a passion project", icon: Palette, type: 'creator', points: 20 }
    ]
  },
  {
    question: "When facing a challenge, you typically...",
    emoji: "⚔️",
    options: [
      { text: "Create a detailed plan of attack", icon: Target, type: 'guardian', points: 20 },
      { text: "Look for creative solutions others miss", icon: Wand2, type: 'explorer', points: 20 },
      { text: "Take time to process and find inner calm", icon: Brain, type: 'healer', points: 20 },
      { text: "Push through with determination", icon: Sword, type: 'champion', points: 20 }
    ]
  },
  {
    question: "Your ideal superpower would be...",
    emoji: "⚡",
    options: [
      { text: "Unlimited knowledge and wisdom", icon: BookOpen, type: 'scholar', points: 20 },
      { text: "Healing others' pain and worries", icon: Heart, type: 'healer', points: 20 },
      { text: "Creating anything you imagine", icon: Sparkles, type: 'creator', points: 20 },
      { text: "Super strength to protect everyone", icon: Shield, type: 'guardian', points: 20 }
    ]
  },
  {
    question: "What energizes you most?",
    emoji: "🔋",
    options: [
      { text: "Achieving goals and milestones", icon: Trophy, type: 'champion', points: 20 },
      { text: "Discovering something new", icon: Map, type: 'explorer', points: 20 },
      { text: "Deep conversations with loved ones", icon: Heart, type: 'healer', points: 20 },
      { text: "Learning and growing", icon: GraduationCap, type: 'scholar', points: 20 }
    ]
  }
];

// Life priorities for personalization
const LIFE_PRIORITIES = [
  { id: 'mental_health', label: 'Mental Wellness', icon: Brain, emoji: '🧠', color: 'from-purple-400 to-pink-400', page: 'GriefCoach' },
  { id: 'family', label: 'Family Life', icon: Users, emoji: '👨‍👩‍👧‍👦', color: 'from-blue-400 to-cyan-400', page: 'Family' },
  { id: 'productivity', label: 'Getting Organized', icon: Target, emoji: '🎯', color: 'from-emerald-400 to-teal-400', page: 'Organizer' },
  { id: 'learning', label: 'Learning & Growth', icon: BookOpen, emoji: '📖', color: 'from-amber-400 to-orange-400', page: 'HomeworkHub' },
  { id: 'wellness', label: 'Health & Fitness', icon: Activity, emoji: '💪', color: 'from-rose-400 to-red-400', page: 'Wellness' },
  { id: 'creativity', label: 'Creative Expression', icon: Palette, emoji: '🎨', color: 'from-indigo-400 to-purple-400', page: 'JournalStudio' },
  { id: 'mindfulness', label: 'Peace & Calm', icon: Leaf, emoji: '🌿', color: 'from-green-400 to-emerald-400', page: 'MindfulnessHub' },
  { id: 'social', label: 'Community & Friends', icon: Heart, emoji: '💕', color: 'from-pink-400 to-rose-400', page: 'Community' }
];

// Companion creatures
const COMPANIONS = [
  { id: 'phoenix', name: 'Phoenix', emoji: '🔥', desc: 'Rising from challenges with renewed strength', color: 'from-orange-500 to-red-500' },
  { id: 'owl', name: 'Wisdom Owl', emoji: '🦉', desc: 'Guiding you with ancient knowledge', color: 'from-purple-500 to-indigo-500' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', desc: 'Symbol of transformation and growth', color: 'from-pink-500 to-purple-500' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', desc: 'Fierce protector of your goals', color: 'from-emerald-500 to-teal-500' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄', desc: 'Magical friend for your journey', color: 'from-pink-400 to-purple-400' },
  { id: 'star', name: 'Starlight', emoji: '⭐', desc: 'Always shining bright for you', color: 'from-yellow-400 to-amber-400' }
];

// Floating particle component
const FloatingParticle = ({ emoji, delay = 0 }) => (
  <motion.div
    className="absolute text-2xl pointer-events-none"
    initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-20, -150],
      x: [0, Math.random() * 60 - 30],
      rotate: [0, 360],
      scale: [0.5, 1.2, 0.8]
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 2
    }}
    style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
  >
    {emoji}
  </motion.div>
);

// XP bar component
const XPBar = ({ xp, level, showAnimation }) => (
  <motion.div 
    className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-xl rounded-2xl p-4 border-2 border-purple-400 shadow-2xl"
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
  >
    <div className="flex items-center gap-3">
      <motion.div 
        className="relative"
        animate={showAnimation ? { scale: [1, 1.3, 1], rotate: [0, 360] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-yellow-300">
          <span className="text-xl font-black text-yellow-900">{level}</span>
        </div>
        <motion.div 
          className="absolute -top-1 -right-1 text-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⭐
        </motion.div>
      </motion.div>
      <div className="flex-1">
        <p className="text-xs font-bold text-purple-300">Level {level}</p>
        <div className="w-24 h-3 bg-purple-800 rounded-full overflow-hidden border border-purple-500">
          <motion.div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${(xp % 100)}%` }}
            transition={{ type: "spring" }}
          />
        </div>
        <motion.p 
          className="text-xs font-semibold text-yellow-400"
          key={xp}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
        >
          {xp} XP
        </motion.p>
      </div>
    </div>
  </motion.div>
);

// Achievement popup
const AchievementPopup = ({ achievement, onClose }) => (
  <motion.div
    initial={{ scale: 0, y: 50 }}
    animate={{ scale: 1, y: 0 }}
    exit={{ scale: 0, y: -50 }}
    className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
  >
    <motion.div
      className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-1 rounded-3xl shadow-2xl pointer-events-auto"
      animate={{ 
        boxShadow: ['0 0 30px rgba(251, 191, 36, 0.5)', '0 0 60px rgba(251, 191, 36, 0.8)', '0 0 30px rgba(251, 191, 36, 0.5)']
      }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="text-8xl mb-4"
        >
          🏆
        </motion.div>
        <h3 className="text-3xl font-black text-yellow-400 mb-2">Achievement Unlocked!</h3>
        <p className="text-xl font-bold text-white mb-4">{achievement}</p>
        <Button onClick={onClose} className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300 font-bold">
          Awesome! +50 XP
        </Button>
      </div>
    </motion.div>
  </motion.div>
);

export default function GameOnboarding({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [personalityType, setPersonalityType] = useState(null);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [achievement, setAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const totalSteps = 7; // Welcome, Name, Quiz, Personality Result, Priorities, Companion, Finale

  const playSound = (type) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('playUISound', { detail: { type } }));
    }
  };

  const addXP = (amount, reason) => {
    setXP(prev => {
      const newXP = prev + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        toast.success(`🎉 Level Up! You're now Level ${newLevel}!`, { duration: 3000 });
      }
      return newXP;
    });
    setShowXPAnimation(true);
    playSound('success');
    toast.success(`+${amount} XP: ${reason}`, { duration: 2000, icon: '⭐' });
    setTimeout(() => setShowXPAnimation(false), 1000);
  };

  const unlockAchievement = (name) => {
    setAchievement(name);
    playSound('complete');
  };

  const typeWriter = (text, callback) => {
    setIsTyping(true);
    setTypingText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypingText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        callback?.();
      }
    }, 30);
  };

  const calculatePersonality = () => {
    const scores = {};
    Object.values(quizAnswers).forEach(answer => {
      scores[answer.type] = (scores[answer.type] || 0) + 1;
    });
    const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'explorer';
    return PERSONALITY_TYPES[topType];
  };

  const handleQuizAnswer = (option) => {
    playSound('click');
    setQuizAnswers(prev => ({ ...prev, [quizIndex]: option }));
    addXP(option.points, 'Quiz answer!');
    
    setTimeout(() => {
      if (quizIndex < PERSONALITY_QUIZ.length - 1) {
        setQuizIndex(quizIndex + 1);
      } else {
        const personality = calculatePersonality();
        setPersonalityType(personality);
        unlockAchievement('Soul Discovery');
        setStep(3);
      }
    }, 500);
  };

  const togglePriority = (id) => {
    playSound('click');
    if (selectedPriorities.includes(id)) {
      setSelectedPriorities(prev => prev.filter(p => p !== id));
    } else {
      setSelectedPriorities(prev => [...prev, id]);
      addXP(15, 'Priority selected!');
      if (selectedPriorities.length === 2) {
        unlockAchievement('Focused Mind');
      }
    }
  };

  const selectCompanion = (companion) => {
    playSound('click');
    setSelectedCompanion(companion);
    addXP(30, `${companion.name} joined you!`);
  };

  const finishOnboarding = async () => {
    setShowConfetti(true);
    addXP(100, 'Journey Complete!');
    unlockAchievement('Helper33 Champion');
    
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        preferred_name: nickname,
        personality_type: personalityType?.name,
        user_priorities: selectedPriorities,
        companion: selectedCompanion?.id,
        onboarding_xp: xp + 100,
        onboarding_level: level
      });
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    }

    localStorage.setItem('helper33_onboarding_completed', 'true');
    
    setTimeout(() => {
      onComplete?.();
      const firstPriority = LIFE_PRIORITIES.find(p => p.id === selectedPriorities[0]);
      navigate(createPageUrl(firstPriority?.page || 'Dashboard'));
    }, 4000);
  };

  const nextStep = () => {
    playSound('click');
    if (step === 0) addXP(10, 'Adventure begins!');
    if (step === 1 && nickname) addXP(25, 'Named your character!');
    setStep(step + 1);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #581c87 75%, #701a75 100%)'
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['✨', '⭐', '💫', '🌟', '💜', '💙', '💗'].map((emoji, i) => (
          <FloatingParticle key={i} emoji={emoji} delay={i * 0.5} />
        ))}
        
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-2xl"
            style={{
              width: 100 + Math.random() * 150,
              height: 100 + Math.random() * 150,
              background: ['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)', 'rgba(59, 130, 246, 0.3)'][i % 3],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* XP Bar */}
      <XPBar xp={xp} level={level} showAnimation={showXPAnimation} />

      {/* Achievement Popup */}
      <AnimatePresence>
        {achievement && (
          <AchievementPopup 
            achievement={achievement} 
            onClose={() => { setAchievement(null); addXP(50, 'Achievement bonus!'); }} 
          />
        )}
      </AnimatePresence>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: '50vw', opacity: 1 }}
                animate={{
                  y: '100vh',
                  x: `${Math.random() * 100}vw`,
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 3, delay: Math.random() * 0.5 }}
                className="absolute text-3xl"
              >
                {['🎉', '✨', '⭐', '🌟', '💜', '🎊', '💫', '🏆'][Math.floor(Math.random() * 8)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="fixed top-20 left-4 right-4 z-40 sm:left-1/2 sm:-translate-x-1/2 sm:w-96">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-300 text-sm font-bold">Quest Progress</span>
          <span className="text-yellow-400 text-sm font-bold ml-auto">{Math.round(progress)}%</span>
        </div>
        <div className="h-4 bg-purple-900/50 rounded-full border-2 border-purple-500 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-32 pb-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center max-w-2xl"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-[120px] mb-6"
              >
                🎮
              </motion.div>
              
              <motion.h1 
                className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-4"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200%' }}
              >
                Welcome, Adventurer!
              </motion.h1>
              
              <motion.p 
                className="text-2xl text-purple-200 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Your epic wellness journey is about to begin... 🌟
              </motion.p>

              <Card className="bg-purple-900/60 backdrop-blur-xl border-2 border-purple-400 mb-8">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { emoji: '🎭', title: 'Discover Yourself', desc: 'Fun personality quiz', xp: 100 },
                      { emoji: '🗺️', title: 'Chart Your Path', desc: 'Personalized journey', xp: 150 },
                      { emoji: '🐉', title: 'Choose Companion', desc: 'Pick your ally', xp: 50 }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.2 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 rounded-2xl p-6 border border-purple-500/50"
                      >
                        <div className="text-5xl mb-3">{item.emoji}</div>
                        <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
                        <p className="text-purple-300 text-sm mb-3">{item.desc}</p>
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/50">+{item.xp} XP</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-black text-2xl px-16 py-8 rounded-2xl shadow-2xl border-4 border-yellow-300"
                >
                  <Rocket className="w-8 h-8 mr-3" />
                  Begin Quest!
                  <Sparkles className="w-8 h-8 ml-3" />
                </Button>
              </motion.div>
              
              <p className="text-purple-400 text-sm mt-4">🕐 Takes only 2 minutes</p>
            </motion.div>
          )}

          {/* Step 1: Name your character */}
          {step === 1 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="text-center max-w-xl w-full"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                👤
              </motion.div>
              
              <h2 className="text-5xl font-black text-white mb-4">Name Your Hero!</h2>
              <p className="text-xl text-purple-200 mb-8">What should we call you, brave adventurer?</p>

              <Card className="bg-purple-900/60 backdrop-blur-xl border-2 border-purple-400">
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter your name..."
                      className="text-2xl text-center py-6 bg-purple-800/50 border-2 border-purple-400 text-white placeholder:text-purple-400 rounded-xl"
                      maxLength={20}
                    />
                    <motion.div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl"
                      animate={{ scale: nickname ? [1, 1.2, 1] : 1 }}
                    >
                      {nickname ? '✨' : '✏️'}
                    </motion.div>
                  </div>

                  {nickname && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl p-4 mb-6 border border-yellow-400/30"
                    >
                      <p className="text-yellow-400 font-bold text-lg">
                        ⚔️ {nickname} the Brave is ready for adventure!
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(0)}
                      variant="outline"
                      className="flex-1 border-2 border-purple-400 text-purple-300 hover:bg-purple-800"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!nickname.trim()}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-bold text-lg"
                    >
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Personality Quiz */}
          {step === 2 && (
            <motion.div
              key={`quiz-${quizIndex}`}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              className="max-w-2xl w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  {PERSONALITY_QUIZ[quizIndex].emoji}
                </motion.div>
                <Badge className="bg-purple-600 text-white mb-4 px-4 py-1">
                  Question {quizIndex + 1} of {PERSONALITY_QUIZ.length}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-black text-white">
                  {PERSONALITY_QUIZ[quizIndex].question}
                </h2>
              </div>

              <div className="grid gap-4">
                {PERSONALITY_QUIZ[quizIndex].options.map((option, i) => {
                  const Icon = option.icon;
                  const isSelected = quizAnswers[quizIndex]?.text === option.text;
                  
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.03, x: 10 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleQuizAnswer(option)}
                      className={`p-6 rounded-2xl border-3 text-left flex items-center gap-4 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300 text-yellow-900'
                          : 'bg-purple-900/60 border-purple-400 text-white hover:border-yellow-400'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-yellow-600' : 'bg-purple-700'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{option.text}</p>
                        <p className="text-sm opacity-75">+{option.points} XP</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          className="text-3xl"
                        >
                          ⭐
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 3: Personality Result */}
          {step === 3 && personalityType && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-xl"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[100px] mb-6"
              >
                {personalityType.emoji}
              </motion.div>

              <h2 className="text-5xl font-black text-white mb-2">You are...</h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${personalityType.color} mb-4`}>
                  {personalityType.name}!
                </h3>
                <p className="text-xl text-purple-200 mb-6">{personalityType.desc}</p>
              </motion.div>

              <Card className="bg-purple-900/60 backdrop-blur-xl border-2 border-purple-400 mb-8">
                <CardContent className="p-6">
                  <h4 className="font-bold text-yellow-400 mb-4">Your Superpowers:</h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {personalityType.traits.map((trait, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.2 }}
                      >
                        <Badge className={`bg-gradient-to-r ${personalityType.color} text-white px-4 py-2 text-lg capitalize`}>
                          ✨ {trait}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-bold text-xl px-12 py-6"
              >
                Continue Quest
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 4: Life Priorities */}
          {step === 4 && (
            <motion.div
              key="priorities"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-3xl w-full"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  🗺️
                </motion.div>
                <h2 className="text-4xl font-black text-white mb-2">Chart Your Path!</h2>
                <p className="text-xl text-purple-200">What matters most to you? (Pick up to 3)</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {LIFE_PRIORITIES.map((priority, i) => {
                  const Icon = priority.icon;
                  const isSelected = selectedPriorities.includes(priority.id);
                  
                  return (
                    <motion.button
                      key={priority.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => togglePriority(priority.id)}
                      disabled={!isSelected && selectedPriorities.length >= 3}
                      className={`p-5 rounded-2xl border-3 flex items-center gap-4 transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${priority.color} border-white text-white shadow-2xl`
                          : 'bg-purple-900/60 border-purple-400 text-white hover:border-yellow-400 disabled:opacity-40'
                      }`}
                    >
                      <div className="text-4xl">{priority.emoji}</div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-lg">{priority.label}</p>
                        {isSelected && <Badge className="bg-white/20 text-white mt-1">+15 XP</Badge>}
                      </div>
                      {isSelected && <Check className="w-6 h-6" />}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1 border-2 border-purple-400 text-purple-300"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-bold text-lg"
                >
                  {selectedPriorities.length === 0 ? 'Skip' : 'Continue'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Choose Companion */}
          {step === 5 && (
            <motion.div
              key="companion"
              initial={{ opacity: 0, rotateX: -30 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl w-full"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  🐉
                </motion.div>
                <h2 className="text-4xl font-black text-white mb-2">Choose Your Companion!</h2>
                <p className="text-xl text-purple-200">A magical ally for your journey</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {COMPANIONS.map((companion, i) => {
                  const isSelected = selectedCompanion?.id === companion.id;
                  
                  return (
                    <motion.button
                      key={companion.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.08, y: -10 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectCompanion(companion)}
                      className={`p-6 rounded-2xl border-3 text-center transition-all ${
                        isSelected
                          ? `bg-gradient-to-br ${companion.color} border-yellow-300 shadow-2xl`
                          : 'bg-purple-900/60 border-purple-400 hover:border-yellow-400'
                      }`}
                    >
                      <motion.div
                        animate={isSelected ? { 
                          scale: [1, 1.3, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 1, repeat: isSelected ? Infinity : 0 }}
                        className="text-6xl mb-3"
                      >
                        {companion.emoji}
                      </motion.div>
                      <h4 className="font-bold text-white text-lg mb-1">{companion.name}</h4>
                      <p className="text-sm text-white/80">{companion.desc}</p>
                      {isSelected && (
                        <Badge className="bg-yellow-400 text-yellow-900 mt-3">Selected!</Badge>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(4)}
                  variant="outline"
                  className="flex-1 border-2 border-purple-400 text-purple-300"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-bold text-lg"
                >
                  {selectedCompanion ? 'Continue' : 'Skip'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 6: Finale */}
          {step === 6 && (
            <motion.div
              key="finale"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-xl"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[120px] mb-6"
              >
                🏆
              </motion.div>

              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-4">
                Quest Complete!
              </h2>

              <Card className="bg-purple-900/60 backdrop-blur-xl border-2 border-yellow-400 mb-8">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4">{selectedCompanion?.emoji || '✨'}</div>
                  
                  <h3 className="text-2xl font-black text-white mb-6">
                    {nickname || 'Hero'}, {personalityType?.name || 'Adventurer'}
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-purple-800/50 rounded-xl p-4">
                      <p className="text-3xl font-black text-yellow-400">{xp}</p>
                      <p className="text-purple-300 text-sm">Total XP</p>
                    </div>
                    <div className="bg-purple-800/50 rounded-xl p-4">
                      <p className="text-3xl font-black text-yellow-400">Lvl {level}</p>
                      <p className="text-purple-300 text-sm">Level</p>
                    </div>
                    <div className="bg-purple-800/50 rounded-xl p-4">
                      <p className="text-3xl font-black text-yellow-400">{selectedPriorities.length}</p>
                      <p className="text-purple-300 text-sm">Goals Set</p>
                    </div>
                  </div>

                  <p className="text-purple-200 text-lg">
                    Your personalized wellness journey awaits! 🌟
                  </p>
                </CardContent>
              </Card>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={finishOnboarding}
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-black text-2xl px-16 py-8 rounded-2xl shadow-2xl border-4 border-yellow-300"
                >
                  <Rocket className="w-8 h-8 mr-3" />
                  Start My Journey!
                  <Flame className="w-8 h-8 ml-3" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      {step < 6 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 text-purple-400 hover:text-white text-sm underline"
          onClick={() => {
            localStorage.setItem('helper33_onboarding_completed', 'true');
            onComplete?.();
          }}
        >
          Skip onboarding
        </motion.button>
      )}
    </motion.div>
  );
}