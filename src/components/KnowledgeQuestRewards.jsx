import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useKnowledgeQuestSounds } from './KnowledgeQuestSounds';

// 🌟 Knowledge Star Animation
export const KnowledgeStar = ({ onComplete }) => {
  const { playSound } = useKnowledgeQuestSounds();
  const [stage, setStage] = useState('spinning');

  useEffect(() => {
    playSound('correct');
    
    const timer1 = setTimeout(() => {
      setStage('collecting');
      playSound('badge');
    }, 1000);

    const timer2 = setTimeout(() => {
      setStage('complete');
      if (onComplete) onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
    >
      <div className="relative">
        {/* Spinning Star */}
        <AnimatePresence>
          {stage === 'spinning' && (
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.5, 1],
                rotate: [0, 720]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="text-9xl">⭐</div>
              
              {/* Sparkle trail */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: Math.cos(i * Math.PI / 4) * 100,
                    y: Math.sin(i * Math.PI / 4) * 100
                  }}
                  transition={{ 
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Treasure Chest */}
        <AnimatePresence>
          {stage === 'collecting' && (
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Star falling into chest */}
              <motion.div
                initial={{ y: -100, scale: 1 }}
                animate={{ y: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 text-7xl"
              >
                ⭐
              </motion.div>

              <div className="text-9xl relative z-10">
                📦
              </div>

              {/* Glow effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl -z-10"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {stage === 'complete' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">✨</div>
              <p className="text-3xl font-bold text-white">Knowledge Star Earned!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// 🪴 Smart Seed Animation
export const SmartSeed = ({ onComplete }) => {
  const { playSound } = useKnowledgeQuestSounds();
  const [stage, setStage] = useState('falling');

  useEffect(() => {
    playSound('paint');
    
    const timer1 = setTimeout(() => {
      setStage('planted');
      playSound('correct');
    }, 800);

    const timer2 = setTimeout(() => {
      setStage('sprouting');
      playSound('paint');
    }, 1500);

    const timer3 = setTimeout(() => {
      setStage('blooming');
      playSound('badge');
    }, 2500);

    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
    >
      <div className="relative h-96 flex flex-col items-center justify-end">
        {/* Soil */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 0.5 }}
          className="h-24 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-3xl relative z-0"
        />

        {/* Falling Seed */}
        <AnimatePresence>
          {stage === 'falling' && (
            <motion.div
              initial={{ y: -300, rotate: 0 }}
              animate={{ y: -80, rotate: 720 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeIn" }}
              className="absolute bottom-24 text-6xl"
            >
              🌰
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sprouting */}
        <AnimatePresence>
          {(stage === 'planted' || stage === 'sprouting' || stage === 'blooming') && (
            <motion.div
              initial={{ scale: 0, y: 0 }}
              animate={{ 
                scale: stage === 'sprouting' || stage === 'blooming' ? 1 : 0,
                y: stage === 'sprouting' || stage === 'blooming' ? -100 : 0
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute bottom-24 text-7xl"
            >
              🌱
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blooming Flower */}
        <AnimatePresence>
          {stage === 'blooming' && (
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.3, 1],
                rotate: [0, 15, -15, 0]
              }}
              transition={{ duration: 0.6 }}
              className="absolute bottom-24 -translate-y-32"
            >
              <div className="relative">
                <div className="text-9xl">🌸</div>
                
                {/* Petal sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.cos(i * Math.PI / 3) * 60,
                      y: Math.sin(i * Math.PI / 3) * 60
                    }}
                    transition={{ 
                      duration: 1,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success message */}
        {stage === 'blooming' && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-20 text-2xl font-bold text-white text-center"
          >
            Your Knowledge is Growing! 🌸
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

// 🏅 Hero Badge Animation
export const HeroBadge = ({ badgeType = 'star', onComplete }) => {
  const { playSound } = useKnowledgeQuestSounds();
  const [stage, setStage] = useState('flipping');

  const badges = {
    star: { emoji: '⭐', name: 'Star Learner' },
    brain: { emoji: '🧠', name: 'Brilliant Mind' },
    rocket: { emoji: '🚀', name: 'Knowledge Explorer' },
    crown: { emoji: '👑', name: 'Wisdom Champion' },
    trophy: { emoji: '🏆', name: 'Quiz Master' }
  };

  const badge = badges[badgeType] || badges.star;

  useEffect(() => {
    playSound('badge');
    
    const timer = setTimeout(() => {
      setStage('complete');
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
    >
      <div className="relative">
        {/* Badge Flip Animation */}
        <motion.div
          initial={{ rotateY: 0, scale: 0 }}
          animate={{ 
            rotateY: [0, 180, 360],
            scale: [0, 1.2, 1]
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative"
        >
          {/* Badge */}
          <div className="relative">
            <div className="text-9xl">{badge.emoji}</div>
            
            {/* Ribbon */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-32"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-500 h-20 relative">
                <div className="absolute -bottom-4 left-0 w-0 h-0 border-l-[64px] border-l-transparent border-t-[16px] border-t-red-600" />
                <div className="absolute -bottom-4 right-0 w-0 h-0 border-r-[64px] border-r-transparent border-t-[16px] border-t-rose-600" />
              </div>
            </motion.div>
          </div>

          {/* Sparkle effects */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: Math.cos(i * Math.PI / 6) * 120,
                y: Math.sin(i * Math.PI / 6) * 120
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.05,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </motion.div>
          ))}

          {/* Glow effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl -z-10"
          />
        </motion.div>

        {/* Badge name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-24"
        >
          <p className="text-4xl font-extrabold text-white drop-shadow-lg">
            {badge.name}
          </p>
          <p className="text-xl text-white/90 mt-2">Badge Unlocked!</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// 🎁 Mystery Box Animation
export const MysteryBox = ({ miniGame, onComplete, onPlayMiniGame }) => {
  const { playSound } = useKnowledgeQuestSounds();
  const [stage, setStage] = useState('bouncing');

  useEffect(() => {
    playSound('theme');
    
    const timer1 = setTimeout(() => {
      setStage('opening');
      playSound('badge');
    }, 1500);

    const timer2 = setTimeout(() => {
      setStage('revealed');
    }, 2500);

    const timer3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
    >
      <div className="relative">
        {/* Bouncing Box */}
        <AnimatePresence>
          {stage === 'bouncing' && (
            <motion.div
              initial={{ y: -200, scale: 0 }}
              animate={{ 
                y: [0, -30, 0, -15, 0],
                scale: 1,
                rotate: [0, -5, 5, -5, 0]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 1.5,
                times: [0, 0.25, 0.5, 0.75, 1],
                ease: "easeOut"
              }}
              className="text-9xl"
            >
              🎁
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opening Box */}
        <AnimatePresence>
          {stage === 'opening' && (
            <motion.div className="relative">
              {/* Box lid lifting */}
              <motion.div
                initial={{ y: 0, rotateX: 0 }}
                animate={{ y: -80, rotateX: -45 }}
                transition={{ duration: 0.5 }}
                className="text-7xl absolute -top-16 left-1/2 -translate-x-1/2"
                style={{ transformOrigin: 'bottom' }}
              >
                🎀
              </motion.div>

              {/* Box base */}
              <div className="text-9xl">📦</div>

              {/* Confetti explosion */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 1],
                    x: (Math.random() - 0.5) * 300,
                    y: Math.random() * -200 - 100,
                    rotate: Math.random() * 720
                  }}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 left-1/2 text-3xl"
                >
                  {['🎊', '🎉', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Revealed Mini-Game */}
        <AnimatePresence>
          {stage === 'revealed' && (
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="text-9xl mb-6"
              >
                {miniGame?.emoji || '🎮'}
              </motion.div>
              
              <h3 className="text-4xl font-extrabold text-white drop-shadow-lg mb-4">
                Bonus Mini-Game Unlocked!
              </h3>
              <p className="text-2xl text-white/90 mb-6">
                {miniGame?.name || 'Special Challenge'}
              </p>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPlayMiniGame && onPlayMiniGame(miniGame)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xl font-bold shadow-2xl"
              >
                Play Now! 🎮
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-purple-500 rounded-full blur-3xl -z-10"
        />
      </div>
    </motion.div>
  );
};

// Reward Trigger Component
export const RewardTrigger = ({ type, onComplete, ...props }) => {
  const [showReward, setShowReward] = useState(true);

  const handleComplete = () => {
    setShowReward(false);
    if (onComplete) onComplete();
  };

  if (!showReward) return null;

  return (
    <AnimatePresence>
      {type === 'star' && <KnowledgeStar onComplete={handleComplete} {...props} />}
      {type === 'seed' && <SmartSeed onComplete={handleComplete} {...props} />}
      {type === 'badge' && <HeroBadge onComplete={handleComplete} {...props} />}
      {type === 'mystery' && <MysteryBox onComplete={handleComplete} {...props} />}
    </AnimatePresence>
  );
};