import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const KIDS_VOICE_CONFIG = {
  rate: 0.95,
  pitch: 1.4,
  volume: 1.0,
  lang: 'en-US'
};

const happyEmojis = ['😊', '🌟', '❤️', '🎉', '🌈', '✨', '🦋', '🌺'];
const encouragements = [
  "That's wonderful!",
  "Great job!",
  "Keep going!",
  "You're awesome!",
  "So cool!",
  "Amazing!",
  "Love it!",
  "Super!"
];

export default function KidsGratitudeJournal({ onComplete, childName, childAge }) {
  const [step, setStep] = useState('intro');
  const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedStickers, setEarnedStickers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (step === 'intro') {
      speak(`Hi ${childName || 'friend'}! Let's play the Gratitude Game! 🌟 Can you think of THREE things that made you happy today?`);
    }
  }, [step, childName]);

  const playSound = (type) => {
    try {
      const audio = new Audio();
      if (type === 'ding') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Txt3QfBSuF0PPUgjMHHnC36eWZTgwOUaju8K90IwUzjdXyznosBiR5yO/ekyQLFl623+yqWhELSKPp8bVyIgU1j9T02X0wBiN2xvDglEcLF2K47OusXBIMTKXr87l2JAU3kdXy2n4zBiJ0xfDili4MFmS88fCuYBINTKhs87t5JAU3j9Xx2X4yBSNzxfDili4MFmS88vGvYRMNTKjr87t5IwU3j9Xx2n4xBSNzxe/hmC8MF2W88vGvYRMOTKjr87t5IgU3j9Tx2n4xBSJyxe/hmS8MGGa88vCvYhMPTKjr87t5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU=';
      } else if (type === 'complete') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Txt3QfBSuF0PPUgjMHHnC36eWZTgwOUaju8K90IwUzjdXyznosBiR5yO/ekyQLFl623+yqWhELSKPp8bVyIgU1j9T02X0wBiN2xvDglEcLF2K47OusXBIMTKhs87t5JAU3j9Xx2X4yBSNzxfDili4MFmS88vGvYRMNTKjr87t5IwU3j9Xx2n4xBSNzxe/hmC8MF2W88vGvYRMOTKjr87t5IgU3j9Tx2n4xBSJyxe/hmS8MGGa88vCvYhMPTKjr87t5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU=';
      }
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Sound playback not available');
    }
  };

  const speak = useCallback((text, options = {}) => {
    if (!('speechSynthesis' in window)) {
      if (options.onComplete) options.onComplete();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = KIDS_VOICE_CONFIG.rate;
        utterance.pitch = KIDS_VOICE_CONFIG.pitch;
        utterance.volume = KIDS_VOICE_CONFIG.volume;
        utterance.lang = KIDS_VOICE_CONFIG.lang;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = ['Google US English', 'Microsoft Zira', 'Samantha', 'Karen'];
        
        let selectedVoice = voices.find(voice => 
          preferredVoices.some(preferred => voice.name.includes(preferred))
        );
        
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
          );
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
          if (options.onComplete) options.onComplete();
        };
        
        utterance.onerror = () => {
          if (options.onComplete) options.onComplete();
        };

        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      if (options.onComplete) options.onComplete();
    }
  }, []);

  const handleStart = () => {
    playSound('ding');
    setStep('gratitude');
    speak(`Awesome! Number 1: What's something that made you smile today? 😊`);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  const handleNext = () => {
    if (!gratitudeItems[currentIndex].trim()) {
      speak("Please write something first!");
      return;
    }

    playSound('ding');
    
    // Celebrate current entry
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    speak(randomEncouragement);

    // Show mini celebration
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 }
    });

    // Move to next
    if (currentIndex < 2) {
      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        
        const prompts = [
          `Number 2: What's another thing you're thankful for? 🌟`,
          `Last one! Number 3: One more happy thing! 🎉`
        ];
        speak(prompts[currentIndex]);
      }, 1500);
    } else {
      // All done!
      setTimeout(() => {
        handleComplete();
      }, 1000);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    playSound('complete');
    
    // Big confetti celebration
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });

    speak(`Amazing job, ${childName || 'friend'}! You found THREE happy things! 🌟 That's so awesome! Thinking about good things helps us feel even happier! Great work! 🎉`);

    try {
      // Save gratitude entry
      const age = parseInt(childAge) || 7;
      const entryData = {
        child_member_id: 'gratitude_user',
        child_name: childName || 'Friend',
        child_age: age,
        entry_date: new Date().toISOString().split('T')[0],
        mood: 'happy',
        mood_emoji: '🌟',
        prompt: 'Gratitude Journal: What are you thankful for?',
        entry_content: `Grateful for: ${gratitudeItems.filter(i => i.trim()).join('; ')}`,
        entry_type: 'text',
        ai_response: `Wonderful job finding things to be grateful for! 🌟`,
        stickers_earned: ['heart-sticker', 'star-sticker', 'rainbow-sticker'],
        points_earned: 10,
        parent_can_view_content: false,
      };

      await base44.entities.KidsJournalEntry.create(entryData);
      
      setEarnedStickers(['❤️', '⭐', '🌈']);
      setShowCelebration(true);

      // Award points
      if (onComplete) {
        onComplete(10, 'star-sticker');
      }
    } catch (error) {
      console.error('Error saving gratitude entry:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-9xl"
            >
              🌟
            </motion.div>

            <div>
              <h2 className="text-4xl font-bold text-yellow-600 mb-3">The Gratitude Game! ✨</h2>
              <p className="text-2xl text-gray-700">
                Let's find THREE things that made you happy today!
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-8 rounded-3xl border-4 border-yellow-300">
              <div className="flex justify-center gap-4 mb-6">
                {happyEmojis.slice(0, 5).map((emoji, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity 
                    }}
                    className="text-5xl"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
              
              <p className="text-xl text-gray-700 mb-6">
                Thinking about good things helps us feel even happier! 🌈
              </p>

              <Button
                onClick={handleStart}
                size="lg"
                className="w-full py-8 text-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
              >
                <Star className="w-8 h-8 mr-3" />
                Let's Play! 🎯
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'gratitude' && !showCelebration && (
          <motion.div
            key="gratitude"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Progress Indicator */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: i <= currentIndex ? 1.2 : 1,
                    rotate: i === currentIndex ? [0, 10, -10, 0] : 0
                  }}
                  transition={{ 
                    scale: { type: "spring", stiffness: 300 },
                    rotate: { duration: 1, repeat: Infinity }
                  }}
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-3xl
                    ${i < currentIndex ? 'bg-green-400' : i === currentIndex ? 'bg-yellow-400' : 'bg-gray-200'}
                    border-4 border-white shadow-lg
                  `}
                >
                  {i < currentIndex ? '✅' : i === currentIndex ? '✏️' : '⭐'}
                </motion.div>
              ))}
            </div>

            {/* Current Item */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-3xl border-4 border-purple-300"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  {currentIndex === 0 ? '🌟' : currentIndex === 1 ? '✨' : '🎉'}
                </motion.div>
                <h3 className="text-3xl font-bold text-purple-800 mb-2">
                  Happy Thing #{currentIndex + 1}
                </h3>
                <p className="text-xl text-gray-700">
                  {currentIndex === 0 && "What made you smile today? 😊"}
                  {currentIndex === 1 && "What's another thing you're thankful for? 💜"}
                  {currentIndex === 2 && "One more happy thing! 🌈"}
                </p>
              </div>

              <Input
                value={gratitudeItems[currentIndex]}
                onChange={(e) => handleItemChange(currentIndex, e.target.value)}
                placeholder={
                  currentIndex === 0 ? "Like... playing with friends, yummy food, or a fun game!" :
                  currentIndex === 1 ? "Maybe... a nice person, a cozy place, or something fun!" :
                  "Last one... anything that made you happy today!"
                }
                className="text-xl p-6 rounded-2xl border-4 border-purple-300 focus:border-purple-500 bg-white mb-6"
                maxLength={100}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && gratitudeItems[currentIndex].trim()) {
                    handleNext();
                  }
                }}
              />

              {gratitudeItems[currentIndex].trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-4"
                >
                  <p className="text-2xl">
                    {encouragements[Math.floor(Math.random() * encouragements.length)]} 
                    {happyEmojis[Math.floor(Math.random() * happyEmojis.length)]}
                  </p>
                </motion.div>
              )}

              <Button
                onClick={handleNext}
                disabled={!gratitudeItems[currentIndex].trim() || isProcessing}
                size="lg"
                className="w-full py-8 text-2xl bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold"
              >
                {currentIndex < 2 ? (
                  <>
                    Next One! 
                    <ArrowRight className="w-8 h-8 ml-3" />
                  </>
                ) : (
                  <>
                    All Done! 
                    <Trophy className="w-8 h-8 ml-3" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Show previous items */}
            {currentIndex > 0 && (
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-600 text-center">Your Happy Things:</p>
                {gratitudeItems.slice(0, currentIndex).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-green-100 p-4 rounded-2xl border-2 border-green-300"
                  >
                    <span className="text-3xl">✅</span>
                    <span className="text-lg text-gray-700 flex-grow">{item}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {showCelebration && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-12"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.3, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
              className="text-9xl"
            >
              🏆
            </motion.div>

            <div>
              <h2 className="text-5xl font-bold text-yellow-600 mb-4">
                Amazing Work, {childName || 'Friend'}! 🎉
              </h2>
              <p className="text-2xl text-gray-700 mb-6">
                You found THREE happy things! That's awesome! 🌟
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-teal-100 p-8 rounded-3xl border-4 border-green-300">
              <h3 className="text-2xl font-bold text-green-800 mb-6">Your Happy Things:</h3>
              <div className="space-y-4">
                {gratitudeItems.filter(i => i.trim()).map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-lg"
                  >
                    <span className="text-5xl">{['🌟', '✨', '🌈'][i]}</span>
                    <span className="text-xl text-gray-800 font-semibold flex-grow text-left">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {earnedStickers.map((sticker, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: i * 0.2,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="text-7xl"
                >
                  {sticker}
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-100 p-6 rounded-2xl border-2 border-blue-300">
              <p className="text-xl text-gray-700">
                💙 Remember: Thinking about good things helps us feel happier! 
                You can play this game anytime you want! ✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}