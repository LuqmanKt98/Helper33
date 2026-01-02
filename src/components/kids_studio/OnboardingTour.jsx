
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, X, Volume2, CheckCircle } from 'lucide-react';

// Animated Puppy Component
const AnimatedPuppy = ({ isTalking, onTouch }) => {
  const [isJumping, setIsJumping] = useState(false);
  const [expression, setExpression] = useState('happy');

  useEffect(() => {
    if (isTalking) {
      setExpression('talking');
      // No need to setIsJumping here, as the jump should be on user touch only.
      // setTimeout(() => setIsJumping(false), 500); // Removed this line
    } else {
      setExpression('happy');
    }
  }, [isTalking]);

  const handleClick = () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500); // Puppy jumps when clicked
    if (onTouch) onTouch(); // Call parent touch handler
  };

  return (
    <motion.div
      className="relative w-48 h-48 cursor-pointer"
      onClick={handleClick}
      animate={{
        y: isJumping ? [0, -20, 0] : 0
      }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Puppy Body */}
        <ellipse cx="100" cy="130" rx="50" ry="45" fill="#F59E0B" />
        
        {/* Puppy Head */}
        <circle cx="100" cy="80" r="45" fill="#F59E0B" />
        
        {/* Ears */}
        <motion.ellipse
          cx="70" cy="65" rx="15" ry="30" fill="#D97706"
          animate={{
            rotate: isTalking ? [-5, 5, -5] : 0 // Ears wiggle when talking
          }}
          transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0 }}
          style={{ transformOrigin: '70px 65px' }}
        />
        <motion.ellipse
          cx="130" cy="65" rx="15" ry="30" fill="#D97706"
          animate={{
            rotate: isTalking ? [5, -5, 5] : 0 // Ears wiggle when talking
          }}
          transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0 }}
          style={{ transformOrigin: '130px 65px' }}
        />
        
        {/* Big Charming Eyes */}
        <motion.ellipse
          cx="85" cy="75" rx="12" ry="14" fill="#1F2937"
          animate={{
            scaleY: isTalking ? [1, 0.3, 1] : 1 // Eyes blink slightly when talking
          }}
          transition={{ duration: 0.2, repeat: isTalking ? Infinity : 0, repeatDelay: 2 }}
        />
        <motion.ellipse
          cx="115" cy="75" rx="12" ry="14" fill="#1F2937"
          animate={{
            scaleY: isTalking ? [1, 0.3, 1] : 1 // Eyes blink slightly when talking
          }}
          transition={{ duration: 0.2, repeat: isTalking ? Infinity : 0, repeatDelay: 2 }}
        />
        
        {/* Large sparkling eye highlights for charm */}
        <circle cx="88" cy="70" r="5" fill="white" />
        <circle cx="118" cy="70" r="5" fill="white" />
        <circle cx="82" cy="75" r="2.5" fill="white" opacity="0.8" />
        <circle cx="112" cy="75" r="2.5" fill="white" opacity="0.8" />
        
        {/* Nose */}
        <ellipse cx="100" cy="90" rx="6" ry="5" fill="#1F2937" />
        
        {/* Mouth - changes based on talking */}
        {expression === 'talking' ? (
          <motion.ellipse
            cx="100" cy="100" rx="12" ry="8" fill="#DC2626"
            animate={{
              ry: [8, 12, 8] // Mouth opens and closes
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        ) : (
          <>
            {/* Happy smile when not talking */}
            <path d="M 90 95 Q 100 105 110 95" stroke="#1F2937" strokeWidth="2" fill="none" />
            <motion.path // Small tongue-like motion
              d="M 85 97 Q 90 100 95 97"
              stroke="#1F2937"
              strokeWidth="2"
              fill="none"
              animate={{ d: "M 85 97 Q 90 103 95 97" }} // Slight tongue bob
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.path // Another small tongue-like motion
              d="M 105 97 Q 110 100 115 97"
              stroke="#1F2937"
              strokeWidth="2"
              fill="none"
              animate={{ d: "M 105 97 Q 110 103 115 97" }} // Slight tongue bob
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
          </>
        )}
        
        {/* Tongue when talking */}
        {isTalking && (
          <motion.ellipse
            cx="100" cy="105" rx="8" ry="5" fill="#EF4444"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }} // Tongue flashes
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        )}
        
        {/* Spots */}
        <circle cx="70" cy="85" r="8" fill="#D97706" />
        <circle cx="125" cy="85" r="6" fill="#D97706" />
        <circle cx="85" cy="140" r="10" fill="#D97706" />
        
        {/* Front Legs */}
        <rect x="80" y="165" width="12" height="30" rx="6" fill="#F59E0B" />
        <rect x="108" y="165" width="12" height="30" rx="6" fill="#F59E0B" />
        
        {/* Paws */}
        <ellipse cx="86" cy="192" rx="8" ry="5" fill="#D97706" />
        <ellipse cx="114" cy="192" rx="8" ry="5" fill="#D97706" />
        
        {/* Tail - wagging when talking */}
        <motion.path
          d="M 145 130 Q 160 120 165 105"
          stroke="#F59E0B"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isTalking 
              ? [
                  "M 145 130 Q 160 120 165 105",
                  "M 145 130 Q 165 125 170 115",
                  "M 145 130 Q 160 120 165 105"
                ]
              : "M 145 130 Q 160 120 165 105" // Static tail when not talking
          }}
          transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0 }}
        />
        <motion.circle // Tail tip
          cx="165" cy="105" r="8" fill="#F59E0B"
          animate={{
            x: isTalking ? [0, 5, 0] : 0,
            y: isTalking ? [0, -5, 0] : 0
          }}
          transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0 }}
        />
      </svg>
      
      {/* Sparkles when touched */}
      <AnimatePresence>
        {isJumping && (
          <>
            <motion.div
              className="absolute top-0 left-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <motion.div
              className="absolute top-0 right-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Sparkles className="w-6 h-6 text-pink-400" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const tourSteps = [
  {
    id: 'welcome',
    title: "Welcome to Kids Studio! 🎨",
    description: "Hi there! I'm your magical puppy helper. Let me show you all the amazing things you can do here!",
    voiceText: "Woof woof! Welcome to Kids Studio! I'm your magical puppy helper, and I'm so excited to show you all the fun activities we have! Are you ready to explore?",
    animation: "puppy", // Not directly used for rendering icon, but good for data consistency
    icon: "🐶" // This icon is now effectively overridden by the puppy component for step 0
  },
  {
    id: 'tracing',
    title: "Learn Letters & Shapes ✏️",
    description: "Follow the sparkly dots to trace letters and shapes! It's like magic drawing!",
    voiceText: "In the tracing game, you follow sparkly dots to draw letters and shapes. Watch how the dots light up! Just follow along and you'll create beautiful letters!",
    animation: "trace",
    icon: "✏️",
    demo: "tracing"
  },
  {
    id: 'coloring',
    title: "Color Beautiful Pictures 🎨",
    description: "Pick your favorite colors and fill in amazing pictures! Make them as colorful as you want!",
    voiceText: "In the coloring book, you can color any picture you like! Pick a color, tap on the picture, and watch it come to life! You can use as many colors as you want!",
    animation: "color",
    icon: "🎨",
    demo: "coloring"
  },
  {
    id: 'stories',
    title: "Create Magical Stories 📚",
    description: "Tell me what you want your story to be about, and I'll help you create it!",
    voiceText: "Want to make your own story? Just tell me what you want it to be about - like a dragon, or a princess, or anything! I'll help you create an amazing story with pictures!",
    animation: "book",
    icon: "📚",
    demo: "story"
  },
  {
    id: 'games',
    title: "Play Fun Games 🎮",
    description: "Memory games, breathing games, and so much more! Every game helps you learn while having fun!",
    voiceText: "We have so many fun games! You can play memory match, pop bubbles, practice breathing, and even play with animals! Every game helps you learn something new!",
    animation: "game",
    icon: "🎮",
    demo: "games"
  },
  {
    id: 'toddler',
    title: "Games for Little Ones 👶",
    description: "Big buttons, fun sounds, and easy games perfect for tiny hands!",
    voiceText: "If you're really little, we have special games just for you! Big colorful buttons, animal sounds, counting games, and more! They're super easy and super fun!",
    animation: "baby",
    icon: "👶",
    demo: "toddler"
  },
  {
    id: 'rewards',
    title: "Earn Points & Stickers! ⭐",
    description: "Every activity you complete gives you points and special stickers! Collect them all!",
    voiceText: "The best part? Every time you finish an activity, you earn points and unlock special stickers! Try to collect them all!",
    animation: "star",
    icon: "⭐",
    demo: "rewards"
  },
  {
    id: 'ready',
    title: "Ready to Start! 🚀",
    description: "You now know everything! Pick any activity and start having fun. I'll be here to help if you need me!",
    voiceText: "You're all set! Pick any activity that looks fun and start creating! Remember, I'm always here in the corner if you need help. Have an amazing time!",
    animation: "rocket",
    icon: "🚀"
  }
];

// Demo Animations
const DemoAnimation = ({ demo }) => {
  switch (demo) {
    case 'tracing':
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <motion.path
              d="M 30,50 L 60,20 L 60,80 M 60,50 L 90,50"
              stroke="#8b5cf6"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="200"
              strokeDashoffset="200"
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.circle
                key={i}
                cx={30 + i * 15}
                cy={50}
                r="4"
                fill="#fbbf24"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.5] }}
                transition={{ duration: 0.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 1.5 }}
              />
            ))}
          </svg>
        </div>
      );
    
    case 'coloring':
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-xl flex items-center justify-center overflow-hidden">
          <motion.div className="text-9xl">
            🦋
          </motion.div>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8 rounded-full"
              style={{
                background: ['#ef4444', '#3b82f6', '#eab308', '#22c55e'][i],
                left: `${20 + i * 20}%`,
                top: '50%'
              }}
              initial={{ scale: 0, y: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                y: [0, -100, -100]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}
        </div>
      );
    
    case 'story':
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center p-4">
          <motion.div className="text-center">
            <motion.div
              className="text-6xl mb-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              📖
            </motion.div>
            <motion.p
              className="text-lg font-bold text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              "Once upon a time..."
            </motion.p>
          </motion.div>
        </div>
      );
    
    case 'games':
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center gap-4">
          {['🧠', '🎮', '🫧'].map((emoji, i) => (
            <motion.div
              key={i}
              className="text-5xl"
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      );
    
    case 'toddler':
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center gap-6">
          {['🌈', '🐾', '🔴'].map((emoji, i) => (
            <motion.button
              key={i}
              className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl border-4 border-purple-300"
              whileHover={{ scale: 1.1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      );
    
    case 'rewards':
      return (
        <div className="relative w-full h-48 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-xl flex items-center justify-center">
          <motion.div className="flex flex-col items-center">
            <motion.div
              className="text-7xl mb-4"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⭐
            </motion.div>
            <motion.div
              className="text-3xl font-bold text-yellow-600"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              +10 Points!
            </motion.div>
          </motion.div>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                x: [0, (i - 2) * 40],
                y: [0, -80]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      );
    
    default:
      return null;
  }
};

export default function OnboardingTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentStepData = tourSteps[currentStep];

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.3;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Speak when step changes
    const timer = setTimeout(() => {
      speak(currentStepData.voiceText);
    }, 500);

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      window.speechSynthesis.cancel();
      onComplete();
    }
  };

  const handleSkip = () => {
    window.speechSynthesis.cancel();
    onSkip();
  };

  const handlePuppyTouch = () => {
    // Only speak if not already speaking to avoid interrupting
    if (!isSpeaking) {
      const sounds = ["Woof!", "Yay!", "Let's play!", "I'm happy!"];
      const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
      speak(randomSound);
    }
  };

  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-4 border-white"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Skip Button */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleSkip}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Skip Tour
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {/* Icon - Show Animated Puppy for Welcome */}
              {currentStep === 0 ? (
                <div className="flex justify-center mb-6">
                  <AnimatedPuppy isTalking={isSpeaking} onTouch={handlePuppyTouch} />
                </div>
              ) : (
                <motion.div
                  className="text-8xl mb-6"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentStepData.icon}
                </motion.div>
              )}

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {currentStepData.title}
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Demo Animation */}
              {currentStepData.demo && (
                <div className="mb-6">
                  <DemoAnimation demo={currentStepData.demo} />
                </div>
              )}

              {/* Speaking Indicator */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-2 mb-6"
                  >
                    <Volume2 className="w-5 h-5 text-purple-600 animate-pulse" />
                    <span className="text-purple-600 font-semibold">Listening...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {tourSteps.length}
                </div>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Start Playing!
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Removed the old Character Guide (Sparkles in the bottom left) as it's replaced by the puppy */}
      </motion.div>
    </motion.div>
  );
}
