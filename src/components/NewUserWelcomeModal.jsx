import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  BookOpen,
  Heart,
  Gift,
  ArrowRight,
  X,
  Clock,
  CheckCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewUserWelcomeModal({ user }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show modal if user is not logged in and hasn't seen it before
    if (!user) {
      const hasSeenWelcome = localStorage.getItem('helper33_welcome_seen');
      if (!hasSeenWelcome) {
        setTimeout(() => setShow(true), 1000);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem('helper33_welcome_seen', 'true');
    setShow(false);
  };

  const handleSignUp = () => {
    handleDismiss();
    base44.auth.redirectToLogin();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card className="border-4 border-orange-300 shadow-2xl bg-gradient-to-br from-white via-orange-50 to-pink-50 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 20, repeat: Infinity }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ duration: 15, repeat: Infinity }}
                  className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full blur-3xl"
                />
              </div>

              {/* Close Button */}
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 hover:bg-white/50 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>

              <CardHeader className="relative pb-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <CardTitle className="text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2"
                  >
                    Welcome to Helper33! 🎉
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base text-gray-700 font-normal"
                  >
                    Your AI-Powered Wellness & Life Management Platform
                  </motion.p>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative space-y-6 pt-2">
                {/* Status Notice */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 border-2 border-blue-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Pre-Launch Phase 🚀</h3>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        We're preparing for our official launch! Create your account now and enjoy 
                        <strong> all features completely FREE</strong> until we go live.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Features List */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-emerald-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Free Journals & AI Tools</h4>
                      <p className="text-sm text-gray-600">
                        Access all AI-powered journals, wellness trackers, and life management tools at no cost
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Spiritual Books Available</h4>
                      <p className="text-sm text-gray-600">
                        Browse and purchase our collection of transformative spiritual books
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-pink-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <Gift className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Early Adopter Benefits</h4>
                      <p className="text-sm text-gray-600">
                        Get lifetime special perks when you join before our official launch
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Important Note */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-4 border-2 border-amber-300"
                >
                  <div className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      <strong>Account Required:</strong> To ensure your data privacy and security, 
                      you'll need to create a free account to access all features.
                    </p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col sm:flex-row gap-3 pt-2"
                >
                  <Button
                    onClick={handleSignUp}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    className="sm:w-auto border-2 border-gray-300 hover:bg-gray-50 py-6"
                  >
                    Browse First
                  </Button>
                </motion.div>

                {/* Fine Print */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-xs text-center text-gray-500"
                >
                  No credit card required • Cancel anytime • Your data is always private
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}