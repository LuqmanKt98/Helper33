import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Volume2, Music, MessageCircle, Globe, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AudioPermissionPrompt({ isOpen, onComplete }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already seen/dismissed this prompt
    const hasSeenPrompt = localStorage.getItem('dobrylife_audio_prompt_completed');
    
    if (!hasSeenPrompt && isOpen) {
      setShow(true);
    } else {
      setShow(false);
      // Call onComplete immediately if already seen
      if (hasSeenPrompt && onComplete) {
        onComplete(hasSeenPrompt === 'enabled');
      }
    }
  }, [isOpen, onComplete]);

  const handleChoice = (enabled) => {
    // Save preference to localStorage
    localStorage.setItem('dobrylife_audio_prompt_completed', enabled ? 'enabled' : 'disabled');
    setShow(false);
    
    if (onComplete) {
      onComplete(enabled);
    }
  };

  const handleClose = () => {
    // User dismissed without choosing - save as dismissed
    localStorage.setItem('dobrylife_audio_prompt_completed', 'dismissed');
    setShow(false);
    
    if (onComplete) {
      onComplete(false);
    }
  };

  if (!show) return null;

  return (
    <Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-50 rounded-full p-2 hover:bg-gray-100 transition-colors group"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 p-8 text-center relative overflow-hidden">
          {/* Animated background sparkles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0 
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Headphones icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative z-10"
          >
            <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Volume2 className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome to DobryLife! 🌸
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 text-lg"
          >
            Your AI companion is ready to guide you
          </motion.p>

          {/* First Time Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mt-4"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-semibold">First Time Here?</span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8 bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Enable Audio for the Best Experience
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            Your AI assistant can speak to you and provide a more engaging, personalized experience.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Voice-guided tour</h4>
                <p className="text-sm text-gray-600">Hear your AI assistant explain features</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Meditation & breathing</h4>
                <p className="text-sm text-gray-600">Enjoy calming soundscapes</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Voice responses</h4>
                <p className="text-sm text-gray-600">Have natural conversations with your AI companion</p>
              </div>
            </motion.div>
          </div>

          {/* Multilingual Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200 mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-900">🌐 Multilingual AI Support ✨</h4>
            </div>
            <p className="text-sm text-gray-700">
              <strong>Speak your language!</strong> Communicates in 30+ languages including Spanish, French, German, Chinese, Arabic, and more.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={() => handleChoice(true)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Enable Audio
            </Button>
            
            <Button
              onClick={() => handleChoice(false)}
              variant="outline"
              className="flex-1 py-6 text-lg font-semibold"
              size="lg"
            >
              Maybe Later
            </Button>
          </motion.div>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can change this setting anytime in your account settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}