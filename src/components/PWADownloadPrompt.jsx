
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone, Zap, Share } from 'lucide-react'; // Added Zap and Share, removed Monitor
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast for toast notifications

export default function PWADownloadPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Derived variables for platform and standalone mode
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent); // This variable is not used in the final JSX, but kept as per outline
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true || // For iOS Safari
                       document.referrer.includes('android-app://'); // For Android PWA

  useEffect(() => {
    // Check if user has already dismissed the prompt or if already in standalone mode
    const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
    
    if (isStandalone || hasSeenPrompt) {
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // If prompt available, we can show our custom prompt after a delay
      // The original timer to show prompt is below, this ensures `deferredPrompt` is set before showing
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after 10 seconds (within first minute as requested)
    // Only show if not standalone and not dismissed, and if `deferredPrompt` exists for Android/Chrome or if it's iOS.
    const timer = setTimeout(() => {
      // For Android/Chrome, only show if deferredPrompt is available
      // For iOS, show directly as there's no deferredPrompt event
      if (deferredPrompt || isIOS) {
        setShowPrompt(true);
      }
    }, 10000); // 10 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isIOS, isStandalone]); // Added dependencies to ensure effect re-runs if these values change

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          toast.success('✨ Helper33 installed! You can now access it offline.');
          setShowPrompt(false); // Hide the prompt after successful installation
          localStorage.setItem('pwa-prompt-dismissed', 'true'); // Mark as dismissed
        }
        setDeferredPrompt(null); // Clear deferredPrompt whether accepted or dismissed
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // If already in standalone mode or prompt should not be shown, return null
  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && ( // Only render if showPrompt is true
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-2xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Install Helper33</h3>
                    <p className="text-sm text-emerald-100">Access offline anytime</p>
                  </div>
                </div>
                <button onClick={handleDismiss} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>Works on mobile & desktop</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Use offline, no internet needed</span>
                </div>
              </div>

              {isIOS ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
                  <p className="font-semibold mb-2">To install on iOS:</p>
                  <ol className="space-y-1 text-emerald-100">
                    <li>1. Tap the Share button <Share className="w-3 h-3 inline" /></li>
                    <li>2. Scroll and tap "Add to Home Screen"</li>
                    <li>3. Tap "Add" to confirm</li>
                  </ol>
                </div>
              ) : (
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-lg"
                  disabled={!deferredPrompt} // Disable if no deferredPrompt for Android/Chrome
                >
                  <Download className="w-5 h-5 mr-2" />
                  Install App
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
