import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sun, Sparkles } from 'lucide-react';

export default function SunlightReminder() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check when we last showed the reminder
    const lastShown = localStorage.getItem('sunlight_reminder_last_shown');
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    // Show reminder if:
    // 1. Never shown before, OR
    // 2. Last shown more than 6 hours ago
    if (!lastShown || (now - parseInt(lastShown)) > sixHours) {
      // Show after user has been on page for 2 minutes
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 120000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('sunlight_reminder_last_shown', Date.now().toString());
  };

  const handleTakeSunbreak = () => {
    handleDismiss();
    // Optional: Could track this action for wellness insights
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-gradient-to-br from-[#FBCB92]/95 via-[#F8AFA6]/95 to-[#6CC9FF]/95 backdrop-blur-xl rounded-[30px] p-8 shadow-2xl border-2 border-white/40"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Animated Sun Icon */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-lg"
            >
              <Sun className="w-10 h-10 text-white" />
            </motion.div>

            {/* Content */}
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                Your Digital Sunshine
                <Sparkles className="w-5 h-5" />
              </h3>
              
              <p className="text-white/90 leading-relaxed text-base">
                This page mimics natural light to elevate your mood and remind you to welcome real daylight into your day.
              </p>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mt-4">
                <p className="text-sm text-white/95 font-medium">
                  ☀️ Taking a few minutes in natural sunlight can boost your vitamin D, improve your mood, and enhance your overall wellness.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={handleTakeSunbreak}
                  className="w-full bg-white hover:bg-white/90 text-orange-600 font-semibold py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Sun className="w-5 h-5 mr-2" />
                  I'll Take a Sun Break! 🌞
                </Button>
                
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors underline underline-offset-2"
                >
                  Remind me later
                </button>
              </div>
            </div>

            {/* Decorative sparkles */}
            <motion.div
              className="absolute top-8 left-8"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6 text-white/40" />
            </motion.div>

            <motion.div
              className="absolute bottom-8 right-8"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Sparkles className="w-6 h-6 text-white/40" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}