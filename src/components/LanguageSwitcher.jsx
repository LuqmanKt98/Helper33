import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export default function LanguageSwitcher({ currentLanguage = 'en', size = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const queryClient = useQueryClient();

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  const handleLanguageChange = async (langCode) => {
    if (langCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    setIsOpen(false);

    try {
      console.log('Changing language to:', langCode);
      
      // Update user preference in database
      const updateResult = await base44.auth.updateMe({
        preferred_language: langCode
      });

      console.log('Language update result:', updateResult);

      // Store in localStorage as immediate fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('helper33_language', langCode);
        localStorage.removeItem('helper33_user_cache');
        localStorage.removeItem('helper33_user_timestamp');
      }

      const langName = LANGUAGES.find(l => l.code === langCode)?.name || langCode;
      toast.success(`Langue changée en ${langName}! Actualisation...`);

      // Clear all React Query caches
      queryClient.clear();

      // Force hard reload to ensure fresh data
      setTimeout(() => {
        window.location.href = window.location.pathname + '?lang=' + langCode + '&t=' + Date.now();
      }, 500);
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error('Échec du changement de langue. Veuillez réessayer.');
      setIsChanging(false);
    }
  };

  const buttonSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const flagSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`${buttonSize} bg-white/80 backdrop-blur-sm hover:bg-white relative`}
        title={`Change Language (Current: ${currentLang.name})`}
      >
        <span className={flagSize}>{currentLang.flag}</span>
        {isChanging && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
            <div className="animate-spin">⌛</div>
          </div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && !isChanging && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Language Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-purple-200 py-2 z-50 max-h-96 overflow-y-auto"
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Globe className="w-4 h-4 text-purple-600" />
                  Choose Language
                </div>
              </div>
              
              <div className="py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 transition-colors ${
                      lang.code === currentLanguage ? 'bg-purple-100' : ''
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`text-sm ${lang.code === currentLanguage ? 'font-semibold text-purple-900' : 'text-gray-700'}`}>
                      {lang.name}
                    </span>
                    {lang.code === currentLanguage && (
                      <span className="ml-auto text-purple-600">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="px-3 py-2 border-t border-gray-100 mt-1">
                <p className="text-xs text-gray-500 text-center">
                  App will refresh to apply language
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}