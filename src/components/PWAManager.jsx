import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Smartphone, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after 30 seconds if not dismissed
      setTimeout(() => {
        if (!localStorage.getItem('pwa-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if should show iOS install instructions
    if (iOS && !isInStandaloneMode && !localStorage.getItem('pwa-dismissed')) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">
                  Install DobryLife App
                </h3>
                
                {isIOS ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Get notifications on your iPhone:
                    </p>
                    <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                      <li>Tap the Share button (box with arrow)</li>
                      <li>Scroll down and tap "Add to Home Screen"</li>
                      <li>Tap "Add" in the top right</li>
                      <li>Enable notifications in the app</li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Install the app to receive notifications on your phone, access offline, and get a faster experience.
                    </p>
                    <Button onClick={handleInstallClick} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PWAManager;