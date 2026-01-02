import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed (for this session only)
    const sessionDismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (sessionDismissed) {
      setDismissed(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('✅ PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt IMMEDIATELY on page load
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ Install prompt not available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
      setShowInstallPrompt(false);
    } else {
      console.log('❌ User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    // Store dismissal in sessionStorage (clears on browser close/refresh)
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleShowPrompt = () => {
    setShowInstallPrompt(true);
    sessionStorage.removeItem('pwa-install-dismissed');
    setDismissed(false);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Install Button (always visible when not dismissed) */}
      {!showInstallPrompt && deferredPrompt && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={handleShowPrompt}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-2xl rounded-full p-4"
            size="lg"
          >
            <Download className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Install Prompt Card - Shows immediately on load */}
      <AnimatePresence>
        {showInstallPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50"
          >
            <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Install Helper33</h3>
                      <p className="text-xs text-gray-600">Access offline anytime</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Works on mobile & desktop</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Monitor className="w-4 h-4 text-emerald-600" />
                    <span>Use offline, no internet needed</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleInstallClick}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                  >
                    Not Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}