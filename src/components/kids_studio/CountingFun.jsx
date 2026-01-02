import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Sparkles, Volume2, VolumeX, Trophy, Play } from 'lucide-react';
import { useNotifications as useSounds } from '../../SoundManager';
import { base44 } from '@/api/base44Client';

const countingItems = [
  { emoji: '🍎', name: 'apples', color: '#ef4444' },
  { emoji: '🌟', name: 'stars', color: '#eab308' },
  { emoji: '🐸', name: 'frogs', color: '#22c5e' },
  { emoji: '🎈', name: 'balloons', color: '#3b82f6' },
  { emoji: '🐠', name: 'fish', color: '#0ea5e9' },
  { emoji: '🦋', name: 'butterflies', color: '#ec4899' },
  { emoji: '🌸', name: 'flowers', color: '#f97316' },
  { emoji: '🍓', name: 'strawberries', color: '#dc2626' },
  { emoji: '🎾', name: 'balls', color: '#65a30d' },
  { emoji: '🎯', name: 'targets', color: '#7c3aed' },
];

const CelebrationBalloon = ({ delay = 0, onComplete }) => (
  <motion.div
    initial={{ scale: 0, y: 200, x: Math.random() * 200 - 100 }}
    animate={{
      scale: [0, 1.5, 0],
      y: [-50, -100, -150],
      rotate: [0, 360, 720]
    }}
    transition={{
      duration: 2,
      delay,
      ease: "easeOut",
      times: [0, 0.7, 1]
    }}
    onAnimationComplete={onComplete}
    className="absolute text-6xl pointer-events-none z-50"
  >
    🎈
  </motion.div>
);

const ConfettiExplosion = () => {
  const confettiPieces = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: ['#ef4444', '#eab308', '#22c5e', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 0.5
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {confettiPieces.map(piece => (
        <motion.div
          key={piece.id}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: `${piece.x}%`,
            y: `${piece.y}%`,
            scale: [0, 1, 0],
            rotate: 720
          }}
          transition={{
            duration: 1.5,
            delay: piece.delay,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
};

export default function CountingFun({ onComplete }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentItem, setCurrentItem] = useState(countingItems[0]);
  const [touchedItems, setTouchedItems] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const { playSound } = useSounds();
  const [itemsToDisplay, setItemsToDisplay] = useState([]);
  const [balloons, setBalloons] = useState([]);

  const [autoRead, setAutoRead] = useState(true);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(true);
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const utteranceRef = useRef(null);

  const speakNext = useCallback(() => {
    if (speechQueueRef.current.length === 0) {
      isSpeakingRef.current = false;
      return;
    }

    if (!('speechSynthesis' in window)) {
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      return;
    }

    isSpeakingRef.current = true;
    const { text, isLoud, isEmphatic } = speechQueueRef.current.shift();

    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (isLoud) {
        utterance.pitch = 1.6;
        utterance.rate = 0.9;
        utterance.volume = 1.0;
      } else if (isEmphatic) {
        utterance.pitch = 1.5;
        utterance.rate = 1.0;
        utterance.volume = 0.95;
      } else {
        utterance.pitch = 1.4;
        utterance.rate = 1.1;
        utterance.volume = 0.85;
      }

      utterance.lang = 'en-US';

      utterance.onend = () => {
        setTimeout(() => {
          speakNext();
        }, isLoud ? 300 : 200);
      };

      utterance.onerror = (event) => {
        console.log('TTS error (non-critical):', event.error);
        // Don't show error to user, just continue
        isSpeakingRef.current = false;
        setTimeout(() => {
          speakNext();
        }, 100);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.log('TTS not available, continuing silently');
      isSpeakingRef.current = false;
      setTimeout(() => {
        speakNext();
      }, 100);
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    const { isLoud = false, isEmphatic = false } = options;

    if (!isSpeechSupported || !autoRead || !text) return;

    try {
      const speechItem = { text, isLoud, isEmphatic };
      speechQueueRef.current.push(speechItem);

      if (!isSpeakingRef.current) {
        speakNext();
      }
    } catch (error) {
      console.log('Speech queueing not available, continuing without audio');
    }
  }, [isSpeechSupported, autoRead, speakNext]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      try {
        const voices = window.speechSynthesis?.getVoices() || [];
        if (voices.length > 0) {
          console.log('TTS voices available:', voices.length);
        }
      } catch (error) {
        console.log('TTS voices check failed, continuing without audio');
      }
    };

    if ('speechSynthesis' in window) {
      setIsSpeechSupported(true);
      try {
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        handleVoicesChanged();
      } catch (error) {
        console.log('TTS setup failed, continuing without audio');
      }
    } else {
      console.log('Speech synthesis not supported in this browser');
    }

    return () => {
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        }
      } catch (error) {
        console.log('TTS cleanup skipped');
      }
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
    };
  }, []);

  const activateVoice = useCallback(() => {
    if (!isSpeechSupported || !needsActivation) return;

    try {
      const testUtterance = new SpeechSynthesisUtterance("Ready to count!");
      testUtterance.volume = 0.9;
      testUtterance.pitch = 1.4;
      testUtterance.rate = 1.1;
      testUtterance.lang = 'en-US';
      
      testUtterance.onend = () => {
        setNeedsActivation(false);
      };
      
      testUtterance.onerror = (event) => {
        console.log('Voice activation failed (non-critical):', event.error);
        setNeedsActivation(false);
      };
      
      window.speechSynthesis.speak(testUtterance);
      playSound('click');
    } catch (error) {
      console.log('Voice activation not available, continuing without audio');
      setNeedsActivation(false);
    }
  }, [isSpeechSupported, playSound, needsActivation]);

  const isMilestone = useCallback((level) => level % 5 === 0 && level <= 20, []);

  const setupLevel = useCallback((level) => {
    setCurrentLevel(level);

    const itemIndex = (level - 1) % countingItems.length;
    const newItem = countingItems[itemIndex];
    setCurrentItem(newItem);

    const gridSize = Math.max(Math.ceil(level * 1.5), 6);
    const newItems = Array.from({ length: gridSize }, (_, i) => ({ id: i }));
    setItemsToDisplay(newItems);

    setTouchedItems([]);
    setShowCelebration(false);
    setShowMilestoneCelebration(false);
    setBalloons([]);

    speechQueueRef.current = [];
    isSpeakingRef.current = false;
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      // Silently continue
    }

    if (!needsActivation) {
      if (isMilestone(level)) {
        speak(`Amazing! Level ${level}! This is a special milestone! Touch ${level} ${newItem.name}!`, { isEmphatic: true });
      } else {
        speak(`Level ${level}! Touch ${level} ${newItem.name}!`);
      }
    }
  }, [speak, isMilestone, needsActivation]);

  useEffect(() => {
    setupLevel(1);
  }, [setupLevel]);

  const createBalloonExplosion = () => {
    const newBalloons = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      delay: i * 0.1
    }));
    setBalloons(newBalloons);
  };

  const handleItemTouch = (itemId) => {
    if (needsActivation) {
      activateVoice();
      setTimeout(() => {
        const itemIndex = (currentLevel - 1) % countingItems.length;
        const newItem = countingItems[itemIndex];
        if (isMilestone(currentLevel)) {
          speak(`Amazing! Level ${currentLevel}! This is a special milestone! Touch ${currentLevel} ${newItem.name}!`, { isEmphatic: true });
        } else {
          speak(`Level ${currentLevel}! Touch ${currentLevel} ${newItem.name}!`);
        }
      }, 500);
    }

    if (touchedItems.includes(itemId)) return;

    playSound('pop');
    const newTouchedItems = [...touchedItems, itemId];
    setTouchedItems(newTouchedItems);

    const currentNumber = newTouchedItems.length;
    const isLastNumber = currentNumber === currentLevel;

    if (isLastNumber) {
      speak(`${currentNumber}!`, { isLoud: true });

      const isLevelMilestone = isMilestone(currentLevel);

      if (isLevelMilestone) {
        speak(`Incredible! You've reached ${currentLevel}! You're a counting superstar!`, { isEmphatic: true });

        setTimeout(() => {
          setShowMilestoneCelebration(true);
          createBalloonExplosion();
          playSound('complete');

          const stickerTypes = ['star-sticker', 'trophy-sticker', 'rainbow-sticker', 'crown-sticker'];
          const stickerId = stickerTypes[Math.floor(Math.random() * stickerTypes.length)];

          setTimeout(() => {
            if (currentLevel >= 20) {
              onComplete(50, stickerId);
            } else {
              onComplete(20, stickerId);
              setTimeout(() => setupLevel(currentLevel + 1), 1000);
            }
          }, 3500);
        }, 800);
      } else {
        speak(`Yes! You counted to ${currentLevel}! Great job!`, { isEmphatic: true });

        setTimeout(() => {
          setShowCelebration(true);
          playSound('complete');

          setTimeout(() => {
            if (currentLevel >= 20) {
              onComplete(30, 'number-sticker');
            } else {
              setupLevel(currentLevel + 1);
            }
          }, 2000);
        }, 800);
      }

      setTotalCorrect(prev => prev + 1);
    } else {
      speak(`${currentNumber}`);
    }
  };

  const resetGame = () => {
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      // Silently continue
    }

    setupLevel(1);
    setTotalCorrect(0);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl min-h-[600px] relative overflow-hidden">
      <h3 className="text-3xl font-bold text-orange-800 mb-4">🔢 Counting Adventures! 🔢</h3>

      {needsActivation && isSpeechSupported && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          className="w-full max-w-md mb-4 p-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl text-white text-center shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <span className="font-bold text-lg">I'm ready to count with you!</span>
          </div>
          <p className="text-sm mb-3">Touch any {currentItem.emoji} to start, and I'll count along!</p>
          <Button
            onClick={activateVoice}
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Activate Voice
          </Button>
        </motion.div>
      )}

      <div className="w-full max-w-md mb-4">
        <div className="bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentLevel / 20) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-center mt-1 text-sm text-gray-600">
          Level {currentLevel} of 20
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="text-4xl font-bold" style={{ color: currentItem.color }}>
            {currentLevel}
          </div>
          {isMilestone(currentLevel) && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Trophy className="w-8 h-8 text-yellow-500" />
            </motion.div>
          )}
        </div>
        <div className="text-xl text-gray-700">
          Touch {currentLevel} {currentItem.name}!
          {isMilestone(currentLevel) && (
            <div className="text-sm text-yellow-600 font-bold">✨ Milestone Level! ✨</div>
          )}
        </div>
        {!needsActivation && autoRead && isSpeechSupported && (
          <div className="mt-2 flex items-center justify-center gap-1 text-sm text-green-600">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Counting with you! 🎵</span>
          </div>
        )}
      </div>

      <div className={`grid gap-3 mb-6 ${
        itemsToDisplay.length <= 6 ? 'grid-cols-3' :
        itemsToDisplay.length <= 12 ? 'grid-cols-4' : 'grid-cols-5'
      }`}>
        {itemsToDisplay.map((item) => {
          const touchedIndex = touchedItems.indexOf(item.id);
          const isTouched = touchedIndex !== -1;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleItemTouch(item.id)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl relative ${
                isTouched
                  ? 'bg-green-200 scale-110'
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={{ scale: isTouched ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTouched}
            >
              {currentItem.emoji}
              <AnimatePresence>
                {isTouched && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute w-6 h-6 bg-green-500 rounded-full -top-1 -right-1 flex items-center justify-center border-2 border-white shadow-md"
                  >
                    <span className="text-white font-bold text-xs">{touchedIndex + 1}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm font-bold text-gray-700">
          Touched: {touchedItems.length} / {currentLevel}
        </div>
        <Button onClick={resetGame} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
        {isSpeechSupported && !needsActivation && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAutoRead(!autoRead)}
            title={autoRead ? "Mute Voice" : "Unmute Voice"}
            className="w-9 h-9"
          >
            {autoRead ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {balloons.map((balloon) => (
          <CelebrationBalloon
            key={balloon.id}
            delay={balloon.delay}
            onComplete={() => setBalloons(prev => prev.filter(b => b.id !== balloon.id))}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showMilestoneCelebration && (
          <>
            <ConfettiExplosion />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-5xl font-bold text-rainbow mb-4">
                  🎉 MILESTONE! 🎉
                </h2>
                <p className="text-3xl text-gray-700 mb-2">You counted to {currentLevel}!</p>
                <p className="text-xl text-yellow-600 font-bold mb-2">⭐ You earned a special sticker! ⭐</p>
                {currentLevel < 20 ? (
                  <p className="text-lg text-gray-600">Get ready for {currentLevel + 1}!</p>
                ) : (
                  <p className="text-lg text-gray-600">You're a counting champion!</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && !showMilestoneCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-xl"
          >
            <div className="text-center">
              <Sparkles className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold text-green-600 mb-2">🎉 Great Job! 🎉</h2>
              <p className="text-2xl text-gray-700 mb-2">You counted {currentLevel}!</p>
              {currentLevel < 20 ? (
                <p className="text-lg text-gray-600">Next up: {currentLevel + 1}!</p>
              ) : (
                <p className="text-lg text-gray-600">You completed all levels! Amazing!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .text-rainbow {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #f0932b, #eb4d4b, #6c5ce7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}