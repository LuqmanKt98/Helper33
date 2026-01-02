import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Ghost, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HalloweenBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const promoCode = '34XFLZB6';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('halloween-banner-dismissed', 'true');
  };

  useEffect(() => {
    const dismissed = localStorage.getItem('halloween-banner-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="relative z-40"
      >
        <div className="bg-gradient-to-r from-orange-500 via-purple-600 to-orange-500 text-white py-2 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: Icon and Message */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex-shrink-0"
              >
                <Ghost className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <Badge className="bg-orange-600 hover:bg-orange-700 border-0 font-bold text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">
                    🎃 HALLOWEEN
                  </Badge>
                  <span className="font-bold text-sm sm:text-base whitespace-nowrap">50% OFF!</span>
                </div>
                <p className="text-[10px] sm:text-xs opacity-90 mt-0.5 truncate">
                  Code: <strong className="font-mono bg-white/20 px-1 py-0.5 rounded text-[10px] sm:text-xs">{promoCode}</strong>
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                onClick={handleCopyCode}
                size="sm"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
              >
                {copied ? (
                  <>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </Button>

              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                aria-label="Close banner"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Animated decorations - less intrusive */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-lg sm:text-xl"
                initial={{ 
                  x: `${20 + Math.random() * 60}%`,
                  y: -20,
                  opacity: 0
                }}
                animate={{ 
                  y: '110%',
                  opacity: [0, 0.6, 0.6, 0]
                }}
                transition={{ 
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 2,
                  ease: "linear"
                }}
              >
                {['🎃', '👻', '🍬'][i]}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}