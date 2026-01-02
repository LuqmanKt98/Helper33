
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, Bot, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check when popup was last shown
    const lastShown = localStorage.getItem('dobrylife_welcome_last_shown');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Show if never shown OR if 24 hours have passed
    if (!lastShown || (now - parseInt(lastShown)) >= twentyFourHours) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Update last shown timestamp
        localStorage.setItem('dobrylife_welcome_last_shown', now.toString());
      }, 2000); // Show after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          style={{ paddingRight: 'var(--scrollbar-width)' }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="relative max-w-2xl w-full"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-4 -right-4 z-20 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
            >
              <X className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
            </button>

            {/* Main Card */}
            <div className="relative rounded-3xl shadow-2xl overflow-hidden">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 animate-gradient-slow" />
              
              {/* Floating sparkles animation */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ 
                      x: Math.random() * 100 + '%',
                      y: '100%',
                      opacity: 0 
                    }}
                    animate={{
                      y: '-10%',
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 md:p-12 text-white">
                {/* Ruby's Avatar */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50"
                >
                  <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                </motion.div>

                {/* Title with wave animation */}
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-center mb-6 text-white drop-shadow-lg"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255,255,255,0.5)",
                      "0 0 30px rgba(255,255,255,0.8)",
                      "0 0 20px rgba(255,255,255,0.5)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Hi everyone, this is Ruby! 👋
                </motion.h2>

                {/* Message Box */}
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-6 border-2 border-white/40 shadow-xl">
                  <p className="text-lg md:text-xl text-white text-center leading-relaxed mb-4">
                    We're working hard to ensure our ecosystem of <span className="font-bold text-yellow-300">hundreds of AI controls</span> and{' '}
                    <span className="font-bold text-yellow-300">8+ agents</span>
                    <Bot className="inline-block w-5 h-5 mx-1" />
                    are running smoothly to best serve you.
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-xl font-semibold">
                    <MessageSquare className="w-6 h-6" />
                    <span>We'd love your feedback to keep improving!</span>
                  </div>
                </div>

                {/* Fun fact badges */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/50 text-sm font-medium"
                  >
                    💪 Building in Public
                  </motion.div>
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/50 text-sm font-medium"
                  >
                    🚀 Rapid Innovation
                  </motion.div>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/50 text-sm font-medium"
                  >
                    ❤️ Built with Love
                  </motion.div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleClose}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 shadow-2xl text-lg px-8 py-6 font-bold hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Let's Go! 
                    <Heart className="w-5 h-5 ml-2 fill-rose-500 text-rose-500" />
                  </Button>
                  
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 text-lg px-8 py-6 font-bold"
                  >
                    <Link to={createPageUrl('Account')} onClick={handleClose}>
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Share Feedback
                    </Link>
                  </Button>
                </div>

                {/* Bottom note */}
                <p className="text-center text-white/90 text-sm mt-6 italic">
                  Your patience and support mean the world! 💙
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom CSS for gradient animation
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient-slow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .animate-gradient-slow {
    background-size: 200% 200%;
    animation: gradient-slow 8s ease infinite;
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;
document.head.appendChild(style);
