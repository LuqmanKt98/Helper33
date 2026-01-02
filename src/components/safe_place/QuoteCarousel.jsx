import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';

const LIFE_AFFIRMING_QUOTES = [
  "You are not your pain; you are the person who survives it.",
  "Some chapters are heavy, but the story isn't over.",
  "There are people you haven't met yet who will love you.",
  "The world is quietly waiting for your tomorrow.",
  "One breath at a time is still progress.",
  "Your pain is valid, and so is your healing.",
  "The fact that you're still here means you're stronger than you think.",
  "Tomorrow may not be easier, but you'll be stronger for it.",
  "You don't have to be okay right now. Just be here.",
  "Healing isn't linear, and that's completely okay.",
  "You matter more than your worst day.",
  "Some of the best chapters haven't been written yet.",
  "Your story isn't finished. Please keep reading.",
  "The world needs what you have to offer, even if you can't see it yet.",
  "You've survived 100% of your worst days so far.",
  "This feeling is real, but it's not permanent.",
  "Your life is valuable beyond measure.",
  "There are people who need you to stay, even if you don't know them yet.",
  "The pain you feel today is the strength you'll feel tomorrow.",
  "You are loved more than you know."
];

export default function QuoteCarousel({ onSaveQuote, savedQuotes }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIFE_AFFIRMING_QUOTES.length);
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  const currentQuote = LIFE_AFFIRMING_QUOTES[currentIndex];
  const isSaved = savedQuotes.includes(currentQuote);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-2 border-purple-200"
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-2xl font-semibold text-gray-800 italic leading-relaxed">
                "{currentQuote}"
              </p>
            </div>
            <Button
              onClick={() => onSaveQuote(currentQuote)}
              variant="ghost"
              size="icon"
              className={`flex-shrink-0 ${isSaved ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600'}`}
              disabled={isSaved}
              title={isSaved ? 'Already saved' : 'Save to Strength Vault'}
            >
              {isSaved ? <Bookmark className="w-6 h-6 fill-current" /> : <Bookmark className="w-6 h-6" />}
            </Button>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {LIFE_AFFIRMING_QUOTES.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex % 5 ? 'bg-purple-600 w-6' : 'bg-purple-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {currentIndex + 1} of {LIFE_AFFIRMING_QUOTES.length}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}