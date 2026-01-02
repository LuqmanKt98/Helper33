
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, MessageCircle, Coffee, AlertTriangle, CheckCircle, Heart } from 'lucide-react'; // Added Coffee, AlertTriangle, CheckCircle, Heart; removed X
import { Button } from '@/components/ui/button';
// Removed Card import as it's no longer used

export default function TrialDisclaimer() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => { // Renamed isVisible to showDisclaimer
    return !localStorage.getItem('trialDisclaimerDismissed');
  });

  const handleAccept = () => { // Renamed handleDismiss to handleAccept
    localStorage.setItem('trialDisclaimerDismissed', 'true');
    setShowDisclaimer(false); // Used setShowDisclaimer
  };

  return (
    <>
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={handleAccept}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Coffee className="w-8 h-8" />
                  Welcome to Helper33 Early Access! 🌱
                </h2>
                <p className="text-white/90 text-lg">Thank you for joining our journey</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    🎉 All Features FREE During Early Access
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Helper33 is in Early Access trial mode. You have <strong>full access to every feature</strong> completely free while we perfect the platform with your feedback.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ⚖️ Important Disclaimer
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    Helper33 is provided on an <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong> basis during this testing phase. While we work hard to ensure a smooth experience, we cannot guarantee uninterrupted functionality or error-free performance at this stage.
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    By using Helper33, you acknowledge that this is a <strong>trial version</strong> and agree to use it for personal, non-commercial purposes while development continues.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    💬 We Value Your Feedback
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    Your feedback helps us build a better wellness platform. Please share your thoughts, report bugs, or suggest features.
                  </p>
                  <a
                    href="mailto:contact@helper33.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-lg transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    contact@helper33.com
                  </a>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAccept}
                    size="lg"
                    className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    I Understand - Let's Go!
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By continuing, you acknowledge you&apos;ve read and understand the Early Access terms
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
