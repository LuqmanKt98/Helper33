
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, X } from 'lucide-react';

// Character Definitions
export const CHARACTERS = {
  felix: {
    id: 'felix',
    name: 'Felix the Fox',
    emoji: '🦊',
    theme: 'animal_kingdom',
    personality: 'Clever & playful',
    voiceTone: 'upbeat_curious',
    color: 'from-orange-400 to-red-500',
    greetings: [
      "Hey there, little explorer! Ready to learn about animals?",
      "Hi friend! I'm Felix! Let's discover amazing creatures together!",
      "Welcome to my kingdom! Time for some wild learning!"
    ],
    encouragement: [
      "You're doing pawsome! Keep going!",
      "Wow! You're as clever as a fox!",
      "That's the spirit! You're amazing!",
      "High five! You're on fire! 🔥",
      "Fantastic! You're learning so fast!"
    ],
    hints: [
      "Think about where animals live... 🤔",
      "Remember what animals eat! 🍖",
      "Picture the animal in your mind! 🧠",
      "Use your fox instincts! You've got this!"
    ],
    celebrations: [
      "YES! You're the smartest cub in the forest! 🎉",
      "AMAZING! Even I couldn't do better!",
      "WOW! You've earned your fox badge! 🏅"
    ],
    characterTraits: {
      curiosity: 9,
      playfulness: 10,
      wisdom: 7
    }
  },
  
  luna: {
    id: 'luna',
    name: 'Luna the Lab Girl',
    emoji: '👩‍🔬',
    theme: 'mini_scientists',
    personality: 'Smart & encouraging',
    voiceTone: 'confident_gentle',
    color: 'from-purple-400 to-blue-500',
    greetings: [
      "Hello, young scientist! Ready to discover amazing things?",
      "Welcome to my laboratory! Let's experiment with knowledge!",
      "Hi there! I'm Luna, and today we're doing science!"
    ],
    encouragement: [
      "Excellent thinking! You're a natural scientist!",
      "Your brain is brilliant! Keep it up!",
      "That's scientific thinking right there!",
      "You're making amazing discoveries!",
      "Wonderful! You understand science!"
    ],
    hints: [
      "Let's think scientifically about this... 🔬",
      "What do we know about how things work? 🧪",
      "Remember our experiments! ⚗️",
      "Use your observation skills!"
    ],
    celebrations: [
      "EUREKA! You've made a breakthrough! 🎊",
      "Scientific excellence! You're incredible!",
      "You've earned your scientist badge! 👩‍🔬"
    ],
    characterTraits: {
      intelligence: 10,
      patience: 9,
      enthusiasm: 8
    }
  },
  
  rex: {
    id: 'rex',
    name: 'Rex the Dino',
    emoji: '🦖',
    theme: 'dinosaurs',
    personality: 'Fun & energetic',
    voiceTone: 'deep_friendly',
    color: 'from-green-400 to-emerald-600',
    greetings: [
      "ROAR! Welcome to the age of dinosaurs!",
      "Hey little friend! Ready to go prehistoric?",
      "Time to learn about us dinosaurs! Let's STOMP into knowledge!"
    ],
    encouragement: [
      "ROAR-some job! You're incredible!",
      "You're as strong as a T-Rex! 💪",
      "Dino-mite work! Keep going!",
      "You're making prehistoric progress!",
      "That's dino-rific! Great job!"
    ],
    hints: [
      "Think about when dinosaurs lived... 🦕",
      "Remember: we were HUGE! 🦖",
      "What did different dinosaurs eat? 🌿",
      "Use your dino brain power!"
    ],
    celebrations: [
      "MEGA ROAR! You're a dino expert! 🎉",
      "You've conquered the Jurassic! 🏆",
      "You're now an honorary dinosaur! 🦖✨"
    ],
    characterTraits: {
      energy: 10,
      friendliness: 9,
      strength: 10
    }
  },
  
  chicky: {
    id: 'chicky',
    name: 'Chicky Chick',
    emoji: '🐣',
    theme: 'life_skills',
    personality: 'Curious & giggly',
    voiceTone: 'childlike_giggly',
    color: 'from-yellow-300 to-orange-400',
    greetings: [
      "Cheep cheep! Let's learn life skills together!",
      "Hi hi! I'm Chicky! Want to learn cool things?",
      "Peep! Ready to discover how to do new things?"
    ],
    encouragement: [
      "Yay yay! You're doing great! *giggles*",
      "Peep peep! You're so smart!",
      "Hehe! You're learning so fast!",
      "Cheep! That's egg-cellent work!",
      "You make me so happy! Great job!"
    ],
    hints: [
      "Think about what you do every day... 🏠",
      "How do grown-ups do this? 🤔",
      "You can do it! Just try your best! 💪",
      "Remember when you helped at home?"
    ],
    celebrations: [
      "YAY! *happy chirps* You're amazing! 🎉",
      "Peep peep HOORAY! You did it! 🌟",
      "You're the best helper ever! *giggles* 🏅"
    ],
    characterTraits: {
      cuteness: 10,
      curiosity: 10,
      cheerfulness: 10
    }
  },
  
  ellie: {
    id: 'ellie',
    name: 'Ellie the Explorer',
    emoji: '🐘',
    theme: 'planet_earth',
    personality: 'Brave & kind',
    voiceTone: 'adventurous_warm',
    color: 'from-blue-400 to-cyan-500',
    greetings: [
      "Hello, fellow explorer! Ready to discover the world?",
      "Welcome! I'm Ellie, and I've traveled everywhere!",
      "Hi there! Let's explore our amazing planet together!"
    ],
    encouragement: [
      "Wonderful exploring! You're doing great!",
      "You have the spirit of an adventurer!",
      "Keep going! The world is waiting for you!",
      "Brilliant! You're learning so much!",
      "You're becoming a great explorer!"
    ],
    hints: [
      "Think about different countries... 🗺️",
      "Where in the world could this be? 🌍",
      "Remember the continents we learned! 🌎",
      "Picture yourself traveling there!"
    ],
    celebrations: [
      "AMAZING! You're a world expert now! 🌟",
      "You've explored brilliantly! 🗺️✨",
      "You've earned your explorer badge! 🏅"
    ],
    characterTraits: {
      bravery: 9,
      kindness: 10,
      wisdom: 9
    }
  },
  
  max: {
    id: 'max',
    name: 'Max the Math Wizard',
    emoji: '🧙‍♂️',
    theme: 'math_magic',
    personality: 'Funny & clever',
    voiceTone: 'whimsical_magical',
    color: 'from-indigo-400 to-purple-600',
    greetings: [
      "Abra-cadabra! Welcome to Math Magic!",
      "*waves wand* Hello! I'm Max, the Math Wizard!",
      "By the power of numbers, let's learn math!"
    ],
    encouragement: [
      "Math-tastic! You're brilliant!",
      "*sparkles* That's magical thinking!",
      "You've got the math magic touch!",
      "Spectacular! Your brain is powerful!",
      "Wizard-level work right there!"
    ],
    hints: [
      "Use your magic number sense... ✨",
      "Remember the spell... I mean, the formula! 🪄",
      "Think about patterns in numbers... 🔮",
      "Let the math magic guide you!"
    ],
    celebrations: [
      "MAGICAL! You're a math wizard now! ⭐",
      "By my wand! You're incredible! 🪄✨",
      "You've mastered the math spell! 🎩🌟"
    ],
    characterTraits: {
      intelligence: 10,
      humor: 9,
      creativity: 9
    }
  },
  
  tia: {
    id: 'tia',
    name: 'Tia the Time Traveler',
    emoji: '👑',
    theme: 'history_heroes',
    personality: 'Wise & calm',
    voiceTone: 'wise_elegant',
    color: 'from-rose-400 to-purple-500',
    greetings: [
      "Greetings, young historian! Shall we journey through time?",
      "Welcome! I'm Tia, your guide through history!",
      "Hello there! Ready to meet heroes from the past?"
    ],
    encouragement: [
      "Splendid thinking! You're quite clever!",
      "Marvelous! You understand history well!",
      "Excellent work, young scholar!",
      "You're becoming quite wise!",
      "Brilliant! You have a historian's mind!"
    ],
    hints: [
      "Think about when this happened in history... ⏳",
      "Remember what we learned about the past... 📜",
      "Consider how people lived back then... 🏰",
      "Let history guide your answer..."
    ],
    celebrations: [
      "Magnificent! You're a true historian! 👑",
      "Splendid work! You've mastered history! ⏰✨",
      "You've earned your time traveler badge! 🏅"
    ],
    characterTraits: {
      wisdom: 10,
      elegance: 9,
      patience: 10
    }
  }
};

// Character Animation Component
export const CharacterGuide = ({ character, visible, message, emotion = 'happy', onDismiss }) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible || !character) return null;

  const emotionStyles = {
    happy: 'animate-bounce',
    excited: 'animate-pulse',
    thinking: 'animate-pulse-slow',
    celebrating: 'animate-spin-slow'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed left-8 bottom-8 z-40"
      >
        <Card className={`bg-gradient-to-r ${character.color} text-white shadow-2xl max-w-md`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Character Avatar */}
              <motion.div
                animate={emotion === 'celebrating' ? {
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                } : emotion === 'thinking' ? {
                  y: [0, -5, 0]
                } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className={`text-6xl ${emotionStyles[emotion]}`}
              >
                {character.emoji}
              </motion.div>

              {/* Message Bubble */}
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">{character.name}</h4>
                <motion.p
                  key={currentMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/95 leading-relaxed"
                >
                  {currentMessage}
                </motion.p>

                {/* Personality traits visualization */}
                <div className="flex gap-2 mt-3">
                  {character.characterTraits && Object.entries(character.characterTraits).slice(0, 2).map(([trait, value]) => (
                    <div key={trait} className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                      {trait === 'curiosity' && '🤔'}
                      {trait === 'intelligence' && '🧠'}
                      {trait === 'kindness' && '💝'}
                      {trait === 'bravery' && '🦁'}
                      {trait === 'wisdom' && '📚'}
                      {trait === 'energy' && '⚡'}
                      {trait === 'playfulness' && '🎮'}
                      {trait === 'cuteness' && '💖'}
                      {trait === 'cheerfulness' && '😊'}
                      {trait === 'patience' && '🧘'}
                      {trait === 'humor' && '😄'}
                      {trait === 'creativity' && '🎨'}
                      {trait === 'friendliness' && '🤗'}
                      {trait === 'strength' && '💪'}
                      {trait === 'elegance' && '👑'}
                      <span className="capitalize">{trait}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close button */}
              {onDismiss && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sparkle effects */}
        {emotion === 'celebrating' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos(i * Math.PI / 3) * 60,
                  y: Math.sin(i * Math.PI / 3) * 60 - 50
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="absolute top-1/2 left-20 text-2xl"
              >
                ✨
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Character Selection Component
export const CharacterSelector = ({ theme, onSelectCharacter }) => {
  const themeCharacters = Object.values(CHARACTERS).filter(char => 
    char.theme === theme.id || theme.id.includes(char.theme.split('_')[0])
  );

  // If no specific character, show default character
  const character = themeCharacters[0] || CHARACTERS.felix;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <Card className={`bg-gradient-to-r ${character.color} text-white max-w-md mx-auto`}>
        <CardContent className="p-8">
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-9xl mb-4"
          >
            {character.emoji}
          </motion.div>
          
          <h3 className="text-3xl font-bold mb-2">{character.name}</h3>
          <p className="text-white/90 text-lg mb-4">{character.personality}</p>
          
          <div className="bg-white/20 rounded-xl p-4 mb-6">
            <p className="text-white/95 italic">
              "{character.greetings[Math.floor(Math.random() * character.greetings.length)]}"
            </p>
          </div>

          <Button
            onClick={() => onSelectCharacter(character)}
            size="lg"
            className="bg-white text-purple-600 hover:bg-white/90 font-bold text-xl w-full"
          >
            Start Learning with {character.name.split(' ')[0]}! 🚀
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Character Hint System
export const CharacterHint = ({ character, onUseHint, hintsRemaining }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center"
    >
      <Button
        onClick={onUseHint}
        disabled={hintsRemaining === 0}
        className={`bg-gradient-to-r ${character.color} text-white hover:scale-105 transition-transform`}
      >
        <Lightbulb className="w-5 h-5 mr-2" />
        Ask {character.name.split(' ')[0]} for a Hint
        {hintsRemaining > 0 && (
          <Badge className="ml-2 bg-white/30">{hintsRemaining} left</Badge>
        )}
      </Button>
    </motion.div>
  );
};
