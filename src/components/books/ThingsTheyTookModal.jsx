
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThingsTheyTookModal({ isOpen, onClose, onPurchase, isPurchasing }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Featured Book Badge */}
          <div className="absolute top-6 left-6 z-10">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 border-2 border-white"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">NEW RELEASE</span>
            </motion.div>
          </div>

          {/* Book Cover with Gradient Overlay */}
          <div 
            className="relative rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/ff5d26129_ChatGPTImageOct21202503_19_34AM2.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 via-transparent to-orange-900/40" />
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 min-h-[500px] flex flex-col justify-between">
              {/* Top Spacing for Badge */}
              <div className="h-12"></div>
              
              {/* Book Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-amber-200 text-lg italic mb-4"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  Poems of Loss, Faith, and the Light That Remains
                </motion.p>
                
                <h2 
                  className="text-4xl md:text-5xl font-bold text-white mb-3" 
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  The Things They Took,
                  <br />
                  The Love That Stayed
                </h2>
                
                <p className="text-xl text-amber-100 mb-6">
                  By Ruby Dobry
                </p>
                
                <p className="text-white/90 text-lg leading-relaxed max-w-xl">
                  A poignant exploration of what is left when everything is taken—the enduring power of love and memory.
                </p>
              </motion.div>

              {/* Price & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-white/30">
                    <span className="text-3xl font-bold text-white">$14.99</span>
                  </div>
                  <div className="text-white/80 text-sm">
                    One-time purchase<br/>
                    Instant digital access
                  </div>
                </div>
                
                <Button 
                  onClick={onPurchase}
                  disabled={isPurchasing}
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-2xl hover:shadow-orange-500/50 transition-all text-lg px-8 py-6 h-auto border-2 border-white/30 group"
                >
                  {isPurchasing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Purchase Now - $14.99
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="ml-2"
                      >
                        →
                      </motion.span>
                    </>
                  )}
                </Button>
                
                <p className="text-white/70 text-sm text-center">
                  ✨ Executive members get this book FREE + all future releases
                </p>
              </motion.div>
            </div>

            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
