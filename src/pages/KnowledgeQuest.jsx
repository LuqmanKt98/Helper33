
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronRight, ChevronLeft, Lightbulb, Heart,
  Volume2, VolumeX, Play, Lock, Crown, Home, Map, ArrowRight, Check, Star
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNotifications as useUISounds } from '../components/SoundManager';
import { KnowledgeQuestSoundProvider, useKnowledgeQuestSounds, KnowledgeQuestSoundControls } from '@/components/KnowledgeQuestSounds';
import { RewardTrigger } from '@/components/KnowledgeQuestRewards';
import {
  CharacterGuide,
  CharacterSelector,
  CharacterHint,
  CHARACTERS
} from '@/components/KnowledgeQuestCharacters';
import { EffectsManager } from '@/components/KnowledgeQuestEffects';
import SEO from '@/components/SEO';

const GRADE_LEVELS = [
  { id: 'prek', name: 'Pre-K', ageRange: '3-5 years', icon: '👶', color: 'from-pink-400 to-rose-500', description: 'Pictures, colors, and counting!', unlocked: true },
  { id: 'kindergarten', name: 'Kindergarten', ageRange: '5-6 years', icon: '🎨', color: 'from-purple-400 to-pink-500', description: 'Letters, numbers, and shapes!', unlocked: true },
  { id: 'grade1', name: '1st Grade', ageRange: '6-7 years', icon: '📚', color: 'from-blue-400 to-cyan-500', description: 'Reading, math, and science!', unlocked: true },
  { id: 'grade2', name: '2nd Grade', ageRange: '7-8 years', icon: '🔬', color: 'from-green-400 to-emerald-500', description: 'Explore and discover!', unlocked: true },
  { id: 'grade3', name: '3rd Grade', ageRange: '8-9 years', icon: '🌟', color: 'from-yellow-400 to-orange-500', description: 'Challenge yourself!', unlocked: true },
  { id: 'grade4', name: '4th Grade', ageRange: '9-10 years', icon: '🚀', color: 'from-indigo-400 to-purple-500', description: 'Master new skills!', unlocked: true },
  { id: 'grade5', name: '5th Grade', ageRange: '10-11 years', icon: '🏆', color: 'from-red-400 to-pink-500', description: 'Become a knowledge champion!', unlocked: true }
];

const THEME_SECTIONS = [
  { id: 'animal_kingdom', name: 'Animal Kingdom', subtitle: 'Jungle Safari Adventure', description: 'Meet amazing animals from around the world!', icon: '🦁', emoji: '🐾', colorPalette: { background: 'from-green-600 via-green-400 to-yellow-300', accent: '#ff8c42' }, decorativeElements: ['🌴', '🦋', '🐒', '🦜', '🌺'], unlockLevel: 0, backgroundStyle: 'jungle' },
  { id: 'mini_scientists', name: 'Mini Scientists', subtitle: 'Lab & Space Exploration', description: 'Explore science, space, and amazing discoveries!', icon: '🔬', emoji: '⚗️', colorPalette: { background: 'from-purple-400 via-blue-300 to-cyan-200', accent: '#a3e635' }, decorativeElements: ['🧪', '🚀', '🌟', '⚛️', '🦕'], unlockLevel: 0, backgroundStyle: 'laboratory' },
  { id: 'planet_earth', name: 'Planet Earth', subtitle: 'World Explorer', description: 'Discover countries, landmarks, and nature!', icon: '🌎', emoji: '🌍', colorPalette: { background: 'from-blue-500 via-cyan-400 to-emerald-300', accent: '#ffffff' }, decorativeElements: ['🏔️', '🌋', '🗽', '🗿', '🌲'], unlockLevel: 3, backgroundStyle: 'globe' },
  { id: 'smart_words', name: 'Smart Words', subtitle: 'Reading & Vocabulary', description: 'Build vocabulary and language skills!', icon: '📖', emoji: '📚', colorPalette: { background: 'from-orange-400 via-sky-300 to-amber-100', accent: '#fef3c7' }, decorativeElements: ['📝', '✏️', '📚', '🔤', '💭'], unlockLevel: 5, backgroundStyle: 'classroom' },
  { id: 'math_magic', name: 'Math Magic', subtitle: 'Numbers & Logic', description: 'Practice numbers, shapes, and logic!', icon: '✨', emoji: '🧮', colorPalette: { background: 'from-blue-600 via-yellow-400 to-teal-300', accent: '#14b8a6' }, decorativeElements: ['🔢', '➕', '➖', '✖️', '➗'], unlockLevel: 8, backgroundStyle: 'geometric' },
  { id: 'history_heroes', name: 'History & Heroes', subtitle: 'Time Travel Adventure', description: 'Learn about the past and amazing people!', icon: '🏰', emoji: '📜', colorPalette: { background: 'from-amber-700 via-red-800 to-blue-900', accent: '#1e3a8a' }, decorativeElements: ['🏛️', '⚔️', '👑', '🗿', '🏺'], unlockLevel: 10, backgroundStyle: 'ancient' },
  { id: 'life_skills', name: 'Life Skills Zone', subtitle: 'Everyday Adventures', description: 'Learn about daily life, safety, and health!', icon: '🏠', emoji: '🍳', colorPalette: { background: 'from-orange-50 via-amber-100 to-green-200', accent: '#86efac' }, decorativeElements: ['🧼', '🥄', '🐔', '🌱', '🏡'], unlockLevel: 12, backgroundStyle: 'home' }
];

const ENHANCED_THEME_SECTIONS = THEME_SECTIONS.map(theme => ({
  ...theme,
  character: Object.values(CHARACTERS).find(char => char.theme === theme.id || theme.id.includes(char.theme.split('_')[0])) || CHARACTERS.felix
}));

const VISUAL_QUESTION_BANK = {
  prek: {
    counting: [
      { question: 'Count the stars!', visual: '⭐⭐⭐', options: ['1', '2', '3', '4'], correct: 2, explanation: 'Great counting! There are 3 stars!', points: 10 },
      { question: 'How many apples?', visual: '🍎🍎🍎🍎🍎', options: ['3', '4', '5', '6'], correct: 2, explanation: 'Perfect! There are 5 red apples!', points: 10 },
      { question: 'How many barking friends do you see?', visual: '🐶🐶', options: ['1', '2', '3', '4'], correct: 1, explanation: 'There are 2 dogs! Woof woof!', points: 10, animal: 'dog' }
    ],
    colors: [
      { question: 'What color is the sun?', visual: '☀️', options: ['🔵 Blue', '🟡 Yellow', '🔴 Red', '🟢 Green'], correct: 1, explanation: 'The sun is yellow! It gives us light and warmth!', points: 10 },
      { question: 'What color is grass?', visual: '🌱', options: ['🟢 Green', '🟤 Brown', '🔵 Blue', '🟡 Yellow'], correct: 0, explanation: 'Grass is green! Plants are green because of something called chlorophyll!', points: 10 }
    ]
  },
  kindergarten: {
    alphabet: [
      { question: 'What letter does Apple start with?', visual: '🍎', options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'Apple starts with the letter A!', points: 10 },
      { question: 'What sound does a cat make?', visual: '🐱', options: ['Woof', 'Meow', 'Moo', 'Roar'], correct: 1, explanation: 'A cat says Meow!', points: 10, animal: 'cat' }
    ]
  },
  grade1: [
    { question: 'What is 5 + 3?', options: ['6', '7', '8', '9'], correct: 2, explanation: 'Great job! 5 + 3 = 8', visual: '🍎🍎🍎🍎🍎 + 🍎🍎🍎 = ?', points: 15 },
    { question: 'Which animal lives in water?', options: ['🐕 Dog', '🐠 Fish', '🐱 Cat', '🐦 Bird'], correct: 1, explanation: 'Fish live in water! They have gills to breathe underwater.', points: 15 }
  ],
  grade2: [
    { question: 'What is 12 - 7?', options: ['3', '4', '5', '6'], correct: 2, explanation: '12 - 7 = 5. Great subtraction!', points: 20 }
  ],
  grade3: [
    { question: 'What is 6 × 4?', options: ['20', '22', '24', '26'], correct: 2, explanation: '6 × 4 = 24. Multiplication makes adding faster!', points: 25 }
  ]
};

const AR_ANIMALS = {
  dog: { name: 'Dog', emoji: '🐕', facts: ['Dogs have about 300 million smell sensors!', 'A dog\'s nose print is unique, like a human fingerprint!', 'Dogs can understand up to 250 words and gestures!'], habitat: 'Dogs live with humans as pets!', diet: 'Dogs eat meat, vegetables, and dog food!' },
  cat: { name: 'Cat', emoji: '🐱', facts: ['Cats sleep 12-16 hours a day!', 'A group of cats is called a "clowder"!', 'Cats can rotate their ears 180 degrees!'], habitat: 'Cats live with humans or in the wild!', diet: 'Cats are carnivores and eat meat!' },
  elephant: { name: 'Elephant', emoji: '🐘', facts: ['Elephants are the largest land animals!', 'They can recognize themselves in a mirror!', 'Elephants never forget - they have amazing memory!'], habitat: 'Elephants live in Africa and Asia!', diet: 'Elephants eat grass, bark, and leaves!' },
  lion: { name: 'Lion', emoji: '🦁', facts: ['Lions sleep up to 20 hours a day!', 'A male lion\'s roar can be heard 5 miles away!', 'Female lions do most of the hunting!'], habitat: 'Lions live in Africa on grasslands!', diet: 'Lions eat zebras, antelopes, and other animals!' }
};

const COLORING_PAGES = {
  prek: [{ title: 'Count the Apples', image: '🍎🍎🍎', activity: 'Color and count!' }, { title: 'Rainbow Colors', image: '🌈', activity: 'Color the rainbow!' }, { title: 'Happy Sun', image: '☀️', activity: 'Color the sun yellow!' }],
  kindergarten: [{ title: 'Letter A - Apple', image: '🍎', activity: 'Trace the letter A!' }, { title: 'Shapes Fun', image: '⭕🔺🟦', activity: 'Color different shapes!' }],
  grade1: [{ title: 'Addition Practice', image: '➕', activity: 'Solve and color!' }, { title: 'Animal Friends', image: '🐶🐱🐦', activity: 'Learn animal names!' }]
};

const FLASHCARD_SETS = {
  prek: [{ front: '🍎', back: 'Apple', category: 'Food' }, { front: '🔴', back: 'Red', category: 'Colors' }, { front: '⭐', back: 'Star', category: 'Shapes' }],
  kindergarten: [{ front: 'A', back: '🍎 Apple', category: 'Letters' }, { front: '5', back: '✋ Five', category: 'Numbers' }],
  grade1: [{ front: '5 + 3', back: '8', category: 'Math' }, { front: '🐠', back: 'Fish - Lives in water', category: 'Science' }]
};

const KIDS_CREATIVE_FACTS = [
  { id: 1, text: 'Did you know a group of flamingos is called a "flamboyance"?', emoji: '🦩' },
  { id: 2, text: 'The highest mountain in the world is Mount Everest!', emoji: '🏔️' },
  { id: 3, text: 'Honey never spoils! Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.', emoji: '🍯' },
  { id: 4, text: 'A baby owl is called an owlet!', emoji: '🦉' },
  { id: 5, text: 'Butterflies taste with their feet!', emoji: '🦋' },
  { id: 6, text: 'The Great Wall of China is the longest man-made structure in the world.', emoji: '🧱' },
  { id: 7, text: 'Octopuses have three hearts!', emoji: '🐙' },
  { id: 8, text: 'The Earth is approximately 4.54 billion years old.', emoji: '🌎' },
  { id: 9, text: 'A lightning bolt is five times hotter than the sun!', emoji: '⚡' },
  { id: 10, text: 'Koalas have fingerprints almost identical to humans.', emoji: '🐨' }
];

const LearningVillageHub = ({ userLevel, user, onThemeSelect, onCreativeStudioSelect }) => {
  const [hoveredTheme, setHoveredTheme] = useState(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const { playSound, startAmbience, narrateText } = useKnowledgeQuestSounds();
  const { playSound: playUISound } = useUISounds();
  
  const isAdmin = user?.role === 'admin';
  const isSubscribed = user?.subscription_tier === 'pro' || 
                       user?.subscription_tier === 'executive' || 
                       user?.subscription_status === 'active' || 
                       user?.subscription_status === 'trial';
  const hasFullAccess = isAdmin || isSubscribed;

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    playSound('main_theme');
    startAmbience('nature');
    narrateText('Welcome to the Learning Village! Choose your adventure!');
  }, []);

  const handleThemeClick = (theme) => {
    const canAccess = hasFullAccess || userLevel >= theme.unlockLevel;
    
    if (canAccess) {
      playSound('select_theme');
      startAmbience(theme.backgroundStyle === 'jungle' ? 'nature' : theme.backgroundStyle === 'laboratory' ? 'science_lab' : theme.backgroundStyle === 'classroom' ? 'classroom' : 'nature');
      onThemeSelect(theme);
      narrateText(`Entering ${theme.name}. Get ready for fun!`);
    } else {
      playSound('negative');
      narrateText(`This theme is locked. You need to reach level ${theme.unlockLevel} or subscribe to unlock it.`);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-green-100">
        {[...Array(6)].map((_, i) => (
          <motion.div key={`cloud-${i}`} className="absolute text-6xl opacity-70" style={{ top: `${10 + i * 12}%`, left: `-10%` }} animate={{ x: [`0vw`, `calc(110vw)`] }} transition={{ duration: 30 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 2 }}>☁️</motion.div>
        ))}
        <motion.div className="absolute top-8 right-12 text-8xl" animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>☀️</motion.div>
        {windowWidth > 0 && [...Array(3)].map((_, i) => (
          <motion.div key={`bird-${i}`} className="absolute text-4xl" style={{ top: `${20 + i * 15}%`, left: `${windowWidth}px` }} animate={{ x: [0, -windowWidth - 100], y: [0, -20, 0, 20, 0] }} transition={{ duration: 15 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 4 }}>🦅</motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center pt-8 px-4">
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, type: 'spring' }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 rounded-full shadow-lg mb-4 border-4 border-yellow-400">
            <Home className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">Learning Village</h1>
            <Map className="w-8 h-8 text-blue-600" />
          </div>
          <p className="mt-4 text-xl font-semibold text-gray-700 bg-white/70 backdrop-blur-sm inline-block px-6 py-2 rounded-full">Choose your adventure! 🗺️✨</p>
          {isAdmin && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-2 rounded-full shadow-lg"
            >
              <Crown className="w-5 h-5" />
              <span className="font-bold">Admin - All Themes Unlocked</span>
            </motion.div>
          )}
          {!isAdmin && isSubscribed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg"
            >
              <Star className="w-5 h-5" />
              <span className="font-bold">Premium Member - All Themes Unlocked</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="relative z-10 w-full p-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <motion.div initial={{ scale: 0, rotate: -10, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ delay: 0, type: 'spring', stiffness: 200, damping: 15 }} whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.95 }} onClick={() => { playUISound('click'); onCreativeStudioSelect(); narrateText("Welcome to the Kids Creative Studio! Let's discover fun facts!"); }} className="relative cursor-pointer">
            <Card className="relative overflow-hidden border-4 border-yellow-400 shadow-2xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90" />
              <motion.div className="absolute inset-0" animate={{ boxShadow: [`0 0 20px #FFD70040`, `0 0 40px #FFD70060`, `0 0 20px #FFD70040`] }} transition={{ duration: 2, repeat: Infinity }} />
              <CardContent className="relative z-10 p-6">
                <motion.div animate={{ rotate: [0, -5, 5, -5, 0], y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl text-center mb-4">🎨</motion.div>
                <h3 className="text-2xl font-extrabold text-white text-center mb-2 drop-shadow-lg">Kids Creative Studio</h3>
                <p className="text-sm font-semibold text-white/90 text-center mb-4 drop-shadow">Discover amazing facts!</p>
                <div className="flex justify-center gap-2 mb-4"><span className="text-3xl">✨</span><span className="text-3xl">💡</span><span className="text-3xl">📖</span></div>
                <p className="text-center text-white/80 text-sm bg-black/20 rounded-lg p-3 backdrop-blur-sm">Explore fun facts about animals, nature, and more!</p>
                <Button className="w-full mt-4 bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg py-6 shadow-lg"><Lightbulb className="w-5 h-5 mr-2" />Explore Facts</Button>
              </CardContent>
            </Card>
          </motion.div>

          {ENHANCED_THEME_SECTIONS.map((theme, index) => {
            const isLocked = !hasFullAccess && userLevel < theme.unlockLevel;
            const isHovered = hoveredTheme === theme.id;
            const unlockedBySubscription = !isAdmin && isSubscribed && userLevel < theme.unlockLevel;
            
            return (
              <motion.div key={theme.id} initial={{ scale: 0, rotate: -10, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ delay: index * 0.15 + 0.2, type: 'spring', stiffness: 200, damping: 15 }} whileHover={{ scale: isLocked ? 1 : 1.05, y: -10 }} whileTap={{ scale: isLocked ? 1 : 0.95 }} onHoverStart={() => { if (!isLocked) { setHoveredTheme(theme.id); playUISound('hover'); narrateText(theme.name); } }} onHoverEnd={() => setHoveredTheme(null)} onClick={() => handleThemeClick(theme)} className={`relative cursor-pointer ${isLocked ? 'opacity-60 grayscale' : ''}`}>
                <Card className={`relative overflow-hidden border-4 ${isLocked ? 'border-gray-400' : 'border-white'} shadow-2xl h-full`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.colorPalette.background} opacity-90`} />
                  {!isLocked && <motion.div className="absolute inset-0" animate={{ boxShadow: [`0 0 20px ${theme.colorPalette.accent}40`, `0 0 40px ${theme.colorPalette.accent}60`, `0 0 20px ${theme.colorPalette.accent}40`] }} transition={{ duration: 2, repeat: Infinity }} />}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                      <div className="text-center">
                        <Lock className="w-16 h-16 text-white mx-auto mb-2" />
                        <p className="text-white font-bold text-lg">Level {theme.unlockLevel} Required</p>
                        <p className="text-white/80 text-sm mt-2">or Subscribe to Unlock All</p>
                      </div>
                    </div>
                  )}
                  {isAdmin && userLevel < theme.unlockLevel && (
                    <div className="absolute top-2 right-2 z-30">
                      <Badge className="bg-amber-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin Access
                      </Badge>
                    </div>
                  )}
                  {unlockedBySubscription && (
                    <div className="absolute top-2 right-2 z-30">
                      <Badge className="bg-purple-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  <CardContent className="relative z-10 p-6">
                    {theme.character && <motion.div animate={{ rotate: [0, -5, 5, -5, 0], y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl text-center mb-4">{theme.character.emoji}</motion.div>}
                    <h3 className="text-2xl font-extrabold text-white text-center mb-2 drop-shadow-lg">{theme.name}</h3>
                    <p className="text-sm font-semibold text-white/90 text-center mb-4 drop-shadow">{theme.subtitle}</p>
                    {theme.character && <p className="text-center text-purple-900 font-semibold mb-3 bg-white/30 rounded-lg py-1">with {theme.character.name}</p>}
                    <div className="flex justify-center gap-2 flex-wrap mb-4">{theme.decorativeElements.map((elem, i) => <motion.span key={i} className="text-3xl" animate={{ y: isHovered && !isLocked ? [0, -8, 0] : 0 }} transition={{ delay: i * 0.1, duration: 0.6, repeat: isHovered && !isLocked ? Infinity : 0 }}>{elem}</motion.span>)}</div>
                    <p className="text-center text-white/80 text-sm bg-black/20 rounded-lg p-3 backdrop-blur-sm mb-4">{theme.description}</p>
                    {!isLocked ? <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg py-6 shadow-lg" onClick={(e) => { e.stopPropagation(); handleThemeClick(theme); }}><Play className="w-5 h-5 mr-2" />Enter {theme.emoji}</Button> : <Button className="w-full bg-white text-gray-900 font-bold text-lg py-6 shadow-lg" disabled><Lock className="w-5 h-5 mr-2" />Locked</Button>}
                  </CardContent>
                </Card>
                {!isLocked && isHovered && <div className="absolute inset-0 pointer-events-none">{[...Array(8)].map((_, i) => <motion.div key={i} className="absolute text-2xl" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [0, -50] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}>✨</motion.div>)}</div>}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-green-600 to-green-400 z-10">
        <div className="flex justify-around items-end h-full px-8">{[...Array(12)].map((_, i) => <motion.div key={`tree-${i}`} className="text-5xl" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2 + i * 0.1, type: 'spring', stiffness: 100 }}>{i % 3 === 0 ? '🌳' : i % 3 === 1 ? '🌲' : '🌴'}</motion.div>)}</div>
      </div>
    </div>
  );
};

const KidsCreativeStudio = ({ onComplete }) => {
  const [factIndex, setFactIndex] = useState(0);
  const { playSound, narrateText } = useKnowledgeQuestSounds();
  const currentFact = KIDS_CREATIVE_FACTS[factIndex];

  useEffect(() => {
    if (currentFact) {
      narrateText(currentFact.text);
      playSound('sparkle');
    }
  }, [factIndex, currentFact]);

  if (!currentFact) {
    return (
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center p-8 text-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
        <Trophy className="w-20 h-20 text-yellow-500 mb-4 animate-bounce" />
        <h2 className="text-3xl font-extrabold mb-4 text-gray-800">All Facts Learned!</h2>
        <p className="text-lg text-gray-600 mb-6">Great job exploring the creative studio!</p>
        <Button onClick={onComplete} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"><ArrowRight className="w-5 h-5 mr-2" />Back to Village</Button>
      </motion.div>
    );
  }

  return (
    <div className="relative p-6 font-comic-sans text-gray-800 bg-gradient-to-br from-pink-100 to-purple-100 min-h-screen flex items-center justify-center">
      <motion.div key={currentFact.id} initial={{ opacity: 0, x: 300, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -300, scale: 0.8 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="bg-white rounded-lg shadow-2xl p-10 max-w-2xl text-center border-4 border-dashed border-gray-300">
        <div className="text-8xl mb-6 animate-pulse-emoji">{currentFact.emoji}</div>
        <h2 className="text-4xl font-extrabold mb-6 text-purple-600">{currentFact.text}</h2>
        <Button onClick={() => factIndex < KIDS_CREATIVE_FACTS.length - 1 ? (setFactIndex(factIndex + 1), playSound('click')) : onComplete()} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl py-6">
          {factIndex < KIDS_CREATIVE_FACTS.length - 1 ? <>Next Fun Fact <ArrowRight className="w-6 h-6 ml-2" /></> : <>Finish Studio <Check className="w-6 h-6 ml-2" /></>}
        </Button>
      </motion.div>
    </div>
  );
};

const QuizView = ({ theme, gradeLevel, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [showReward, setShowReward] = useState(null);
  const [earnedRewards, setEarnedRewards] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [showCharacterIntro, setShowCharacterIntro] = useState(true);
  const [effects, setEffects] = useState({ sparkleBurst: false, balloonFloat: false, rainbowSwipe: false, thoughtBubble: false, badgeName: '', thoughtMessage: '', thoughtPosition: 'center' });
  const character = theme.character || CHARACTERS.felix;
  const [characterMessage, setCharacterMessage] = useState(character.greetings[Math.floor(Math.random() * character.greetings.length)]);
  const [characterEmotion, setCharacterEmotion] = useState('happy');
  const [showCharacter, setShowCharacter] = useState(true);
  const { playSound, narrateText, startAmbience } = useKnowledgeQuestSounds();

  const getQuestions = () => {
    const gradeQuestions = VISUAL_QUESTION_BANK[gradeLevel.id];
    if (!gradeQuestions) return [];
    if (Array.isArray(gradeQuestions)) return gradeQuestions;
    const allQuestions = [];
    Object.values(gradeQuestions).forEach(category => { if (Array.isArray(category)) allQuestions.push(...category); });
    return allQuestions;
  };

  const questions = getQuestions();
  const currentQ = questions[currentQuestion];

  const startQuiz = useCallback(() => {
    startAmbience(theme.backgroundStyle === 'jungle' ? 'nature' : theme.backgroundStyle === 'laboratory' ? 'laboratory' : theme.backgroundStyle === 'classroom' ? 'classroom' : 'nature');
    if (questions.length > 0 && questions[0]) {
      const intro = `Let's start! ${questions[0].question}`;
      setCharacterMessage(intro);
      narrateText(intro);
    }
  }, [theme.backgroundStyle, startAmbience, narrateText, questions]);

  useEffect(() => {
    if (showCharacterIntro) {
      narrateText(characterMessage);
      const timer = setTimeout(() => { setShowCharacterIntro(false); startQuiz(); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCharacterIntro, characterMessage, narrateText, startQuiz]);

  const handleAnswer = (answerIndex) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQ.correct;

    if (isCorrect) {
      setEffects(prev => ({ ...prev, sparkleBurst: true }));
      const earnedPoints = (currentQ.points || 10) + (streak * 5);
      setScore(score + earnedPoints);
      setStreak(streak + 1);
      playSound('correct');
      const celebration = character.encouragement[Math.floor(Math.random() * character.encouragement.length)];
      setCharacterMessage(celebration);
      setCharacterEmotion('celebrating');
      narrateText(celebration + ' ' + currentQ.explanation);
      setTimeout(() => { setShowReward({ type: 'star' }); setEarnedRewards(prev => [...prev, 'star']); }, 500);
      if (currentQ.animal) playSound('animal', { animal: currentQ.animal });
    } else {
      setStreak(0);
      setLives(lives - 1);
      playSound('wrong');
      const encouragement = "Not quite, but don't worry! " + character.encouragement[0];
      setCharacterMessage(encouragement);
      setCharacterEmotion('thinking');
      narrateText(encouragement + ' ' + currentQ.explanation);
      setEffects(prev => ({ ...prev, thoughtBubble: true, thoughtMessage: currentQ.explanation, thoughtPosition: 'center' }));
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCharacterEmotion('happy');
      setEffects(prev => ({ ...prev, thoughtMessage: '', thoughtBubble: false }));
      const nextQ = questions[currentQuestion + 1];
      setCharacterMessage(`Next question! ${nextQ.question}`);
      narrateText(`Next question! ${nextQ.question}`);
    } else {
      playSound('badge');
      setCharacterEmotion('celebrating');
      setEffects(prev => ({ ...prev, balloonFloat: true }));
      narrateText("Congratulations! You completed the quest!");
    }
  };

  if (showCharacterIntro) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.colorPalette.background} p-8 flex items-center justify-center font-comic-sans`}>
        <CharacterSelector theme={theme} onSelectCharacter={() => { playSound('theme'); setShowCharacterIntro(false); startQuiz(); }} character={character} />
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card><CardContent className="p-8 text-center"><p className="text-xl mb-4">No questions available for this level yet!</p><Button onClick={onBack}><ChevronLeft className="w-5 h-5 mr-2" />Go Back</Button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.colorPalette.background} p-8 relative overflow-hidden font-comic-sans`}>
      <EffectsManager effects={effects} onEffectComplete={(effectName) => setEffects(prev => ({ ...prev, [effectName]: false, badgeName: '', thoughtMessage: '', thoughtBubble: false }))} />
      <CharacterGuide character={character} visible={showCharacter} message={characterMessage} emotion={characterEmotion} onDismiss={() => setShowCharacter(false)} />
      <AnimatePresence>{showReward && <RewardTrigger type={showReward.type} onComplete={() => setShowReward(null)} />}</AnimatePresence>

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" className="bg-white/90 hover:bg-white"><ChevronLeft className="w-5 h-5 mr-2" />Back to Village</Button>
          <Button onClick={() => { setShowCharacter(!showCharacter); playSound('click'); }} variant="outline" className="bg-white/90 hover:bg-white">{showCharacter ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</Button>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full">{[...Array(3)].map((_, i) => <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />)}</div>
          {streak > 0 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full font-bold">🔥 {streak} Streak!</motion.div>}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-lg">⭐ {score}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-white mb-2"><span>Question {currentQuestion + 1} of {questions.length}</span><span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span></div>
        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-4 bg-white/30" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
          <Card className="bg-white/95 backdrop-blur-md shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-8">
              {currentQ.visual && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center mb-8"><div className="text-8xl mb-4">{currentQ.visual}</div></motion.div>}
              <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">{currentQ.question}</h2>
              {!showExplanation && <div className="flex justify-center mb-6"><CharacterHint character={character} onUseHint={() => { if (hintsRemaining > 0) { setHintsRemaining(hintsRemaining - 1); playSound('paint'); setEffects(prev => ({ ...prev, thoughtBubble: true, thoughtMessage: character.hints[0], thoughtPosition: 'top' })); } }} hintsRemaining={hintsRemaining} /></div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {currentQ.options.map((option, index) => (
                  <motion.button key={index} whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }} whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(index)} disabled={selectedAnswer !== null} className={`p-6 rounded-2xl text-xl sm:text-2xl font-bold transition-all ${selectedAnswer === null ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' : selectedAnswer === index ? (index === currentQ.correct ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-400 to-rose-500 text-white') : (index === currentQ.correct ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gray-200 text-gray-400')}`}>
                    {option}
                    {selectedAnswer === index && index === currentQ.correct && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-3">✓</motion.span>}
                    {selectedAnswer === index && index !== currentQ.correct && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-3">✗</motion.span>}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {showExplanation && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className={`p-6 rounded-xl ${selectedAnswer === currentQ.correct ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                      <p className="text-xl font-semibold mb-2">{selectedAnswer === currentQ.correct ? '🎉 Correct!' : '💡 Not quite!'}</p>
                      <p className="text-lg text-gray-700">{currentQ.explanation}</p>
                    </div>
                    <Button onClick={handleNext} size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl py-6">
                      {currentQuestion < questions.length - 1 ? <>Next Question <ChevronRight className="w-6 h-6 ml-2" /></> : <>Complete Quest! <Trophy className="w-6 h-6 ml-2" /></>}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {earnedRewards.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-8 left-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
          <p className="text-sm font-semibold text-gray-700 mb-2">Rewards Earned:</p>
          <div className="flex gap-2">{earnedRewards.map((reward, i) => <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">{reward === 'star' && '⭐'}{reward === 'seed' && '🌱'}{reward === 'badge' && '🏅'}{reward === 'mystery' && '🎁'}</motion.div>)}</div>
        </motion.div>
      )}
    </div>
  );
};

export default function KnowledgeQuestWrapper() {
  return (
    <KnowledgeQuestSoundProvider>
      <KnowledgeQuest />
    </KnowledgeQuestSoundProvider>
  );
}

function KnowledgeQuest() {
  const [currentView, setCurrentView] = useState('village');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [userLevel, setUserLevel] = useState(0);
  const [user, setUser] = useState(null);
  const { playSound, narrateText } = useKnowledgeQuestSounds();

  useEffect(() => {
    (async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        const progress = userData.knowledge_quest_progress || {};
        setUserLevel(Math.floor((progress.total_points || 0) / 100));
      } catch (error) {
        console.log('User not authenticated');
      }
    })();
  }, []);

  const isSubscribed = user?.subscription_tier === 'pro' || 
                       user?.subscription_tier === 'executive' || 
                       user?.subscription_status === 'active' || 
                       user?.subscription_status === 'trial';

  return (
    <>
      <SEO title="Knowledge Quest - Educational Games for Kids | Helper33" description="Fun educational games and quizzes for kids Pre-K through 5th grade. Learn with AI characters, earn rewards, and explore interactive learning adventures!" keywords="educational games for kids, kids learning games, AI tutor for kids, homework help games" />
      <div className="min-h-screen">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap'); .font-comic-sans { font-family: 'Comic Neue', cursive; } @keyframes pulse-emoji { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } } .animate-pulse-emoji { animation: pulse-emoji 2s infinite ease-in-out; }`}</style>
        <div className="fixed top-4 right-4 z-[100]"><KnowledgeQuestSoundControls /></div>
        {user && (
          <motion.div className="fixed top-4 left-4 z-50" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <div className="bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border-4 border-yellow-400 flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-xs font-semibold text-gray-600">Level</p>
                <p className="text-2xl font-extrabold text-purple-600">{userLevel}</p>
              </div>
              {user.role === 'admin' && (
                <Badge className="bg-amber-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              {user.role !== 'admin' && isSubscribed && (
                <Badge className="bg-purple-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {currentView === 'village' && <motion.div key="village" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-comic-sans"><LearningVillageHub userLevel={userLevel} user={user} onThemeSelect={(theme) => { setSelectedTheme(theme); setCurrentView('grade_select'); narrateText(`Welcome to ${theme.name}! Choose your grade level!`); }} onCreativeStudioSelect={() => { setCurrentView('creative_studio'); narrateText("Time for some amazing facts in the Creative Studio!"); }} /></motion.div>}
          {currentView === 'creative_studio' && <motion.div key="creative_studio" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}><KidsCreativeStudio onComplete={() => setCurrentView('village')} /></motion.div>}
          {currentView === 'grade_select' && selectedTheme && (
            <motion.div key="grade_select" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className={`min-h-screen bg-gradient-to-br ${selectedTheme.colorPalette.background} p-8 font-comic-sans`}>
              <Button onClick={() => { setCurrentView('village'); playSound('back_button'); }} variant="outline" className="mb-6"><ChevronLeft className="w-5 h-5 mr-2" />Back to Village</Button>
              <div className="text-center mb-8"><h1 className="text-6xl font-extrabold text-white drop-shadow-lg mb-4">{selectedTheme.icon} {selectedTheme.name}</h1><p className="text-2xl text-white/90 font-semibold">Choose your grade level!</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {GRADE_LEVELS.map((grade, index) => (
                  <motion.div key={grade.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                    <Card className="cursor-pointer hover:shadow-2xl transition-all h-full" onClick={() => { setSelectedGrade(grade); setCurrentView('quiz'); playSound('select_grade'); narrateText(`You selected ${grade.name}. Let's begin the quest!`); }}>
                      <div className={`h-3 bg-gradient-to-r ${grade.color}`} />
                      <CardContent className="p-6 text-center"><div className="text-6xl mb-4">{grade.icon}</div><h3 className="text-2xl font-bold text-gray-800 mb-2">{grade.name}</h3><p className="text-purple-600 font-semibold mb-2">{grade.ageRange}</p><p className="text-gray-600">{grade.description}</p></CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          {currentView === 'quiz' && selectedTheme && selectedGrade && <QuizView key="quiz" theme={selectedTheme} gradeLevel={selectedGrade} onBack={() => { setCurrentView('grade_select'); playSound('back_button'); }} />}
        </AnimatePresence>
      </div>
    </>
  );
}
