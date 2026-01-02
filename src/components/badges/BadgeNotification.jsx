import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Trophy, Award, Crown, Star } from 'lucide-react';

const tierIcons = {
  bronze: Award,
  silver: Star,
  gold: Trophy,
  platinum: Crown,
  diamond: Sparkles,
  legendary: Sparkles
};

const tierColors = {
  bronze: 'from-amber-600 to-orange-700',
  silver: 'from-gray-400 to-slate-500',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-cyan-400 to-blue-500',
  diamond: 'from-purple-400 to-pink-500',
  legendary: 'from-purple-600 via-pink-600 to-orange-500'
};

export default function BadgeNotification({ badge, onClose }) {
  const [show, setShow] = useState(false);
  const TierIcon = tierIcons[badge.badge_tier] || Award;

  useEffect(() => {
    setShow(true);
    
    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-6 right-6 z-[100] max-w-sm"
        >
          <Card className={`bg-gradient-to-br ${tierColors[badge.badge_tier]} text-white border-0 shadow-2xl overflow-hidden`}>
            {/* Confetti effect */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    opacity: 1
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                    opacity: 0
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 p-6">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-4">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ duration: 0.8 }}
                  className="inline-block"
                >
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl shadow-2xl">
                    {badge.badge_icon}
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  🎉 Badge Unlocked!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg font-semibold mb-1"
                >
                  {badge.badge_title}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 mb-3"
                >
                  <TierIcon className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    {badge.badge_tier} Tier
                  </span>
                </motion.div>

                {badge.unlock_message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-white/90 italic mb-4"
                  >
                    "{badge.unlock_message}"
                  </motion.p>
                )}

                {badge.points_earned > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold">+{badge.points_earned} points</span>
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleClose}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/40"
                >
                  Awesome! ✨
                </Button>
              </motion.div>
            </div>

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}