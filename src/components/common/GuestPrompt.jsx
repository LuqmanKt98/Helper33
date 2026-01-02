import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, LogIn, X, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function GuestPrompt({ 
  isOpen, 
  onClose, 
  action = "save this", 
  feature = "feature",
  autoRedirectSeconds = null 
}) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = React.useState(autoRedirectSeconds);

  useEffect(() => {
    if (autoRedirectSeconds && isOpen) {
      setCountdown(autoRedirectSeconds);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate(createPageUrl('Home'));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoRedirectSeconds, isOpen, navigate]);

  const handleSignUp = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md bg-white shadow-2xl border-0 relative overflow-hidden">
              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Gradient Header */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>

              <CardHeader className="text-center pb-4 pt-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Lock className="w-10 h-10 text-white" />
                </motion.div>

                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Sign Up to Continue
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Create a free account to {action} and unlock all DobryLife features
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                {/* Auto-redirect message */}
                {autoRedirectSeconds && countdown > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-900">
                      Redirecting to homepage in{' '}
                      <span className="font-bold text-blue-600 text-lg">{countdown}</span>{' '}
                      seconds...
                    </p>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Save Your Progress</p>
                      <p className="text-sm text-gray-600">Keep all your data safe and accessible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Sync Across Devices</p>
                      <p className="text-sm text-gray-600">Access DobryLife on any device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Unlock Premium Features</p>
                      <p className="text-sm text-gray-600">Get access to coaching, journals, and more</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSignUp}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Free Account
                  </Button>

                  <Button
                    onClick={handleSignUp}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Already Have an Account? Log In
                  </Button>

                  {onClose && (
                    <Button
                      onClick={onClose}
                      variant="ghost"
                      size="lg"
                      className="w-full text-gray-600"
                    >
                      Continue Exploring as Guest
                    </Button>
                  )}
                </div>

                {/* Trust Message */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Sparkles className="w-3 h-3" />
                    <span>Free forever • No credit card required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}