import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookHeart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InfinityBookModal({ isOpen, onClose }) {
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
          className="relative max-w-3xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Featured Story Badge */}
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
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-2 border-2 border-white"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">FEATURED STORY</span>
            </motion.div>
          </div>

          {/* Book Card */}
          <div 
            className="relative rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/06cf47a80_infinitybooky.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-900/40 via-transparent to-purple-900/40" />
            
            {/* Quote Icon */}
            <div className="relative z-10 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
              <div className="text-6xl md:text-7xl text-rose-200/40 font-serif leading-none mb-4">
                "
              </div>
              
              {/* Quote */}
              <div className="mb-8">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-4xl font-medium italic text-white leading-relaxed mb-4"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  Infinity is the soul's way of saying, 'I am not done yet.'
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-right text-white/90 text-xl italic"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                >
                  — Ruby Dobry
                </motion.p>
              </div>

              {/* Book Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 
                  className="text-4xl md:text-5xl font-bold text-white mb-3" 
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  Ruby's Life Story
                </h2>
                <p className="text-xl text-rose-200 mb-6">
                  A 21-Day Journey Through Grief & Healing
                </p>
                
                {/* CTA Button */}
                <Button 
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-rose-500/50 transition-all text-lg px-8 py-6 h-auto border-2 border-white/30 group"
                  onClick={onClose}
                >
                  <Link to={createPageUrl('InfinityBook')}>
                    <BookHeart className="w-5 h-5 mr-2" />
                    Read the Book
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-2"
                    >
                      →
                    </motion.span>
                  </Link>
                </Button>
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