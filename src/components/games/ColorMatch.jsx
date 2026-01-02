import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Repeat, Trophy, Brain, Star, Award, Target, Timer, Accessibility, Settings, Palette, Volume2, Eye } from "lucide-react";
import { useNotifications } from "../SoundManager";

const colorPatterns = {
  Red: { dots: '●●', stripes: '|||' },
  Blue: { dots: '◆◆', stripes: '///' },
  Green: { dots: '■■', stripes: '\\\\\\' },
  Yellow: { dots: '★★', stripes: '===' },
  Purple: { dots: '♦♦', stripes: '◇◇◇' },
  Orange: { dots: '▲▲', stripes: '◁◁◁' },
  Pink: { dots: '♥♥', stripes: '~~~' },
  Cyan: { dots: '◈◈', stripes: '◀◀◀' },
  Teal: { dots: '✦✦', stripes: '▬▬▬' },
  Indigo: { dots: '◉◉', stripes: '▭▭▭' },
  Lime: { dots: '⬢⬢', stripes: '▱▱▱' },
  Rose: { dots: '❀❀', stripes: '⬚⬚⬚' },
  Lavender: { dots: '✿✿', stripes: '≈≈≈' },
  Mint: { dots: '◐◐', stripes: '⊡⊡⊡' },
  Coral: { dots: '◕◕', stripes: '⊟⊟⊟' },
  Sky: { dots: '◔◔', stripes: '⊠⊠⊠' }
};

const colorPalettes = {
  standard: {
    name: "Standard",
    description: "Classic vibrant colors",
    colors: {
      easy: [
        { name: "Red", value: "#dc2626", light: "#fecaca" },
        { name: "Blue", value: "#2563eb", light: "#bfdbfe" },
        { name: "Green", value: "#16a34a", light: "#bbf7d0" },
        { name: "Yellow", value: "#eab308", light: "#fef08a" },
      ],
      medium: [
        { name: "Red", value: "#dc2626", light: "#fecaca" },
        { name: "Blue", value: "#2563eb", light: "#bfdbfe" },
        { name: "Green", value: "#16a34a", light: "#bbf7d0" },
        { name: "Yellow", value: "#eab308", light: "#fef08a" },
        { name: "Purple", value: "#9333ea", light: "#e9d5ff" },
        { name: "Orange", value: "#ea580c", light: "#fed7aa" },
        { name: "Pink", value: "#db2777", light: "#fbcfe8" },
        { name: "Cyan", value: "#0891b2", light: "#cffafe" },
      ],
      hard: [
        { name: "Red", value: "#dc2626", light: "#fecaca" },
        { name: "Blue", value: "#2563eb", light: "#bfdbfe" },
        { name: "Green", value: "#16a34a", light: "#bbf7d0" },
        { name: "Yellow", value: "#eab308", light: "#fef08a" },
        { name: "Purple", value: "#9333ea", light: "#e9d5ff" },
        { name: "Orange", value: "#ea580c", light: "#fed7aa" },
        { name: "Pink", value: "#db2777", light: "#fbcfe8" },
        { name: "Cyan", value: "#0891b2", light: "#cffafe" },
        { name: "Teal", value: "#0d9488", light: "#ccfbf1" },
        { name: "Indigo", value: "#4f46e5", light: "#e0e7ff" },
        { name: "Lime", value: "#65a30d", light: "#ecfccb" },
        { name: "Rose", value: "#e11d48", light: "#ffe4e6" },
      ]
    }
  },
  therapeutic: {
    name: "Therapeutic",
    description: "Calming pastel tones",
    colors: {
      easy: [
        { name: "Lavender", value: "#a78bfa", light: "#e9d5ff" },
        { name: "Mint", value: "#6ee7b7", light: "#d1fae5" },
        { name: "Sky", value: "#7dd3fc", light: "#e0f2fe" },
        { name: "Coral", value: "#fda4af", light: "#fecdd3" },
      ],
      medium: [
        { name: "Lavender", value: "#a78bfa", light: "#e9d5ff" },
        { name: "Mint", value: "#6ee7b7", light: "#d1fae5" },
        { name: "Sky", value: "#7dd3fc", light: "#e0f2fe" },
        { name: "Coral", value: "#fda4af", light: "#fecdd3" },
        { name: "Peach", value: "#fdba74", light: "#fed7aa" },
        { name: "Rose", value: "#f9a8d4", light: "#fce7f3" },
        { name: "Sage", value: "#86efac", light: "#dcfce7" },
        { name: "Lilac", value: "#c4b5fd", light: "#ede9fe" },
      ],
      hard: [
        { name: "Lavender", value: "#a78bfa", light: "#e9d5ff" },
        { name: "Mint", value: "#6ee7b7", light: "#d1fae5" },
        { name: "Sky", value: "#7dd3fc", light: "#e0f2fe" },
        { name: "Coral", value: "#fda4af", light: "#fecdd3" },
        { name: "Peach", value: "#fdba74", light: "#fed7aa" },
        { name: "Rose", value: "#f9a8d4", light: "#fce7f3" },
        { name: "Sage", value: "#86efac", light: "#dcfce7" },
        { name: "Lilac", value: "#c4b5fd", light: "#ede9fe" },
        { name: "Cream", value: "#fef3c7", light: "#fef9e7" },
        { name: "Blush", value: "#fbcfe8", light: "#fce7f3" },
        { name: "Aqua", value: "#99f6e4", light: "#ccfbf1" },
        { name: "Butter", value: "#fde68a", light: "#fef3c7" },
      ]
    }
  },
  vibrant: {
    name: "Vibrant",
    description: "High energy colors",
    colors: {
      easy: [
        { name: "Red", value: "#ef4444", light: "#fca5a5" },
        { name: "Blue", value: "#3b82f6", light: "#93c5fd" },
        { name: "Green", value: "#22c55e", light: "#86efac" },
        { name: "Yellow", value: "#facc15", light: "#fde047" },
      ],
      medium: [
        { name: "Red", value: "#ef4444", light: "#fca5a5" },
        { name: "Blue", value: "#3b82f6", light: "#93c5fd" },
        { name: "Green", value: "#22c55e", light: "#86efac" },
        { name: "Yellow", value: "#facc15", light: "#fde047" },
        { name: "Purple", value: "#a855f7", light: "#d8b4fe" },
        { name: "Orange", value: "#f97316", light: "#fdba74" },
        { name: "Pink", value: "#ec4899", light: "#f9a8d4" },
        { name: "Cyan", value: "#06b6d4", light: "#67e8f9" },
      ],
      hard: [
        { name: "Red", value: "#ef4444", light: "#fca5a5" },
        { name: "Blue", value: "#3b82f6", light: "#93c5fd" },
        { name: "Green", value: "#22c55e", light: "#86efac" },
        { name: "Yellow", value: "#facc15", light: "#fde047" },
        { name: "Purple", value: "#a855f7", light: "#d8b4fe" },
        { name: "Orange", value: "#f97316", light: "#fdba74" },
        { name: "Pink", value: "#ec4899", light: "#f9a8d4" },
        { name: "Cyan", value: "#06b6d4", light: "#67e8f9" },
        { name: "Teal", value: "#14b8a6", light: "#5eead4" },
        { name: "Indigo", value: "#6366f1", light: "#a5b4fc" },
        { name: "Lime", value: "#84cc16", light: "#bef264" },
        { name: "Rose", value: "#f43f5e", light: "#fda4af" },
      ]
    }
  },
  nature: {
    name: "Nature",
    description: "Earth-inspired tones",
    colors: {
      easy: [
        { name: "Forest", value: "#059669", light: "#a7f3d0" },
        { name: "Ocean", value: "#0284c7", light: "#bae6fd" },
        { name: "Sand", value: "#d97706", light: "#fcd34d" },
        { name: "Clay", value: "#b91c1c", light: "#fca5a5" },
      ],
      medium: [
        { name: "Forest", value: "#059669", light: "#a7f3d0" },
        { name: "Ocean", value: "#0284c7", light: "#bae6fd" },
        { name: "Sand", value: "#d97706", light: "#fcd34d" },
        { name: "Clay", value: "#b91c1c", light: "#fca5a5" },
        { name: "Stone", value: "#78716c", light: "#d6d3d1" },
        { name: "Moss", value: "#65a30d", light: "#d9f99d" },
        { name: "Sky", value: "#0ea5e9", light: "#7dd3fc" },
        { name: "Rust", value: "#c2410c", light: "#fdba74" },
      ],
      hard: [
        { name: "Forest", value: "#059669", light: "#a7f3d0" },
        { name: "Ocean", value: "#0284c7", light: "#bae6fd" },
        { name: "Sand", value: "#d97706", light: "#fcd34d" },
        { name: "Clay", value: "#b91c1c", light: "#fca5a5" },
        { name: "Stone", value: "#78716c", light: "#d6d3d1" },
        { name: "Moss", value: "#65a30d", light: "#d9f99d" },
        { name: "Sky", value: "#0ea5e9", light: "#7dd3fc" },
        { name: "Rust", value: "#c2410c", light: "#fdba74" },
        { name: "Bark", value: "#92400e", light: "#fbbf24" },
        { name: "Leaf", value: "#16a34a", light: "#bbf7d0" },
        { name: "Water", value: "#06b6d4", light: "#a5f3fc" },
        { name: "Earth", value: "#a16207", light: "#fde047" },
      ]
    }
  }
};

const visualThemes = {
  default: { name: "Default", bg: "from-purple-50 via-pink-50 to-blue-50", orb1: "purple-300", orb2: "blue-300", orb3: "pink-300" },
  ocean: { name: "Ocean", bg: "from-blue-50 via-cyan-50 to-teal-50", orb1: "blue-300", orb2: "cyan-300", orb3: "teal-300" },
  sunset: { name: "Sunset", bg: "from-orange-50 via-pink-50 to-purple-50", orb1: "orange-300", orb2: "pink-300", orb3: "purple-300" },
  forest: { name: "Forest", bg: "from-green-50 via-emerald-50 to-teal-50", orb1: "green-300", orb2: "emerald-300", orb3: "teal-300" },
  lavender: { name: "Lavender", bg: "from-purple-50 via-violet-50 to-indigo-50", orb1: "purple-300", orb2: "violet-300", orb3: "indigo-300" }
};

const soundProfiles = {
  standard: { name: "Standard", success: "success", error: "error", click: "click" },
  gentle: { name: "Gentle", success: "notification", error: "click", click: "click" },
  energetic: { name: "Energetic", success: "achievement", error: "error", click: "levelUp" },
  minimal: { name: "Minimal", success: "click", error: "click", click: "click" }
};

const gameModes = {
  classic: { name: "Classic", time: 45, icon: Target, desc: "Traditional color matching", color: "from-green-400 to-emerald-500" },
  reactionRush: { name: "Reaction Rush", time: 30, icon: Timer, desc: "Speed-focused rapid matching", color: "from-red-400 to-orange-500" },
  memoryMatch: { name: "Memory Match", time: 40, icon: Brain, desc: "Remember hidden colors", color: "from-blue-400 to-cyan-500" },
};

const difficultySettings = {
  easy: { gridCols: 2, multiplier: 1 },
  medium: { gridCols: 4, multiplier: 1.5 },
  hard: { gridCols: 4, multiplier: 2 }
};

const ColorMatch = ({ onComplete }) => {
  const { soundEnabled, playSound } = useNotifications();
  const [showCustomization, setShowCustomization] = useState(false);
  const [colorPalette, setColorPalette] = useState('standard');
  const [visualTheme, setVisualTheme] = useState('default');
  const [soundProfile, setSoundProfile] = useState('standard');
  const [customTimer, setCustomTimer] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [colorblindMode, setColorblindMode] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showFeedback, setShowFeedback] = useState(null);
  const [memoryPhase, setMemoryPhase] = useState('showing');
  const [reactionTimer, setReactionTimer] = useState(0);

  const currentTheme = visualThemes[visualTheme];
  const currentSoundProfile = soundProfiles[soundProfile];
  const colorSets = colorPalettes[colorPalette].colors;

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      playSound(currentSoundProfile.success);
      
      (async () => {
        try {
          const { base44 } = await import('@/api/base44Client');
          await base44.functions.invoke('updateMindfulStreak', {
            item_key: 'color_match',
            item_type: 'game',
            duration_seconds: customTimer || gameModes[gameMode].time
          });
        } catch (error) {
          console.error('Error updating mindful streak:', error);
        }
      })();
      
      if (onComplete) onComplete();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, onComplete, gameMode, playSound, currentSoundProfile, customTimer]);

  useEffect(() => {
    let timer;
    if (gameMode === 'reactionRush' && isPlaying && currentColor) {
      setReactionTimer(0);
      timer = setInterval(() => {
        setReactionTimer(prev => prev + 0.01);
      }, 10);
    }
    return () => clearInterval(timer);
  }, [gameMode, isPlaying, currentColor]);

  useEffect(() => {
    let timer;
    if (gameMode === 'memoryMatch' && isPlaying && memoryPhase === 'showing') {
      timer = setTimeout(() => {
        setMemoryPhase('hidden');
        playSound('notification');
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [gameMode, isPlaying, memoryPhase, playSound]);

  const startGame = (selectedMode, selectedDifficulty) => {
    setGameMode(selectedMode);
    setDifficulty(selectedDifficulty);
    setIsPlaying(true);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setAccuracy(100);
    setComboMultiplier(1);
    setTimeLeft(customTimer || gameModes[selectedMode].time);
    setMemoryPhase('showing');
    playSound('notification');
    generateNewColor(selectedDifficulty);
  };

  const generateNewColor = (diff = difficulty) => {
    const colors = colorSets[diff];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentColor(randomColor);
    if (gameMode === 'memoryMatch') {
      setMemoryPhase('showing');
    }
  };

  const handleColorClick = (clickedColor) => {
    if (!isPlaying) return;
    if (gameMode === 'memoryMatch' && memoryPhase === 'showing') return;

    setTotalAttempts(prev => prev + 1);

    if (clickedColor.name === currentColor.name) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      
      const newMultiplier = Math.floor(newStreak / 5) + 1;
      setComboMultiplier(newMultiplier);
      
      let points = Math.round(10 * difficultySettings[difficulty].multiplier * newMultiplier);
      
      if (gameMode === 'reactionRush' && reactionTimer < 1) {
        points *= 2;
        setShowFeedback('⚡ Lightning! +' + points);
        playSound(currentSoundProfile.success);
      } else if (gameMode === 'memoryMatch') {
        points *= 1.5;
        setShowFeedback('🧠 Remembered! +' + Math.round(points));
        playSound(currentSoundProfile.success);
      } else if (newStreak % 10 === 0) {
        playSound(currentSoundProfile.success);
        setShowFeedback('🎉 Amazing! +' + points);
      } else if (newStreak % 5 === 0) {
        playSound(currentSoundProfile.click);
        setShowFeedback('🔥 Combo! +' + points);
      } else {
        playSound(currentSoundProfile.click);
        setShowFeedback('✓ +' + points);
      }
      
      setScore(prev => prev + Math.round(points));
      setCorrectAttempts(prev => prev + 1);
      
      generateNewColor();
    } else {
      setStreak(0);
      setComboMultiplier(1);
      playSound(currentSoundProfile.error);
      setShowFeedback('✗ Try again!');
    }
    
    setTimeout(() => setShowFeedback(null), 800);
    
    const newAccuracy = Math.round(((correctAttempts + (clickedColor.name === currentColor.name ? 1 : 0)) / (totalAttempts + 1)) * 100);
    setAccuracy(newAccuracy);
  };

  const resetGame = () => {
    setGameMode(null);
    setDifficulty(null);
    setIsPlaying(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setAccuracy(100);
    setComboMultiplier(1);
    setMemoryPhase('showing');
    setCurrentColor(null);
  };

  // Customization Screen
  if (showCustomization) {
    return (
      <div className={`flex flex-col items-center p-6 bg-gradient-to-br ${currentTheme.bg} rounded-2xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Game Customization
            </h3>
            <Button onClick={() => setShowCustomization(false)} variant="outline">Done</Button>
          </div>

          <div className="space-y-6">
            {/* Color Palette */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-gray-900">Color Palette</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(colorPalettes).map(([key, palette]) => (
                    <motion.div key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card className={`cursor-pointer transition-all ${colorPalette === key ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setColorPalette(key)}>
                        <CardContent className="p-3">
                          <h5 className="font-semibold text-sm mb-1">{palette.name}</h5>
                          <p className="text-xs text-gray-600 mb-2">{palette.description}</p>
                          <div className="flex gap-1">
                            {palette.colors.easy.slice(0, 4).map((color, i) => (
                              <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: color.value }} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Visual Theme */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-gray-900">Visual Theme</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(visualThemes).map(([key, theme]) => (
                    <motion.div key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Card className={`cursor-pointer transition-all ${visualTheme === key ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setVisualTheme(key)}>
                        <CardContent className="p-2">
                          <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${theme.bg} mb-1`} />
                          <p className="text-xs font-semibold text-center">{theme.name}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timer Customization */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-gray-900">Custom Timer (seconds)</h4>
                </div>
                <div className="flex items-center gap-3">
                  <input type="range" min="15" max="120" step="5" value={customTimer || 45}
                    onChange={(e) => setCustomTimer(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  <Badge className="bg-orange-500 text-white px-3 py-1">{customTimer || 45}s</Badge>
                  <Button onClick={() => setCustomTimer(null)} variant="outline" size="sm">Reset</Button>
                </div>
              </CardContent>
            </Card>

            {/* Sound Profile */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-gray-900">Sound Profile</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(soundProfiles).map(([key, profile]) => (
                    <motion.div key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card className={`cursor-pointer transition-all ${soundProfile === key ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSoundProfile(key)}>
                        <CardContent className="p-3 text-center">
                          <p className="font-semibold text-sm">{profile.name}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mode Selection Screen
  if (!gameMode || !difficulty || !isPlaying) {
    return (
      <div className={`flex flex-col items-center p-4 bg-gradient-to-br ${currentTheme.bg} rounded-2xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden min-h-[500px]`}>
        <motion.div className={`absolute top-0 left-0 w-40 h-40 bg-${currentTheme.orb1}/20 rounded-full blur-3xl pointer-events-none`}
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        
        <motion.button onClick={() => setShowCustomization(true)}
          className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
          <Settings className="w-5 h-5 text-purple-600" />
        </motion.button>

        <motion.button onClick={() => setColorblindMode(!colorblindMode)}
          className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Accessibility className={`w-5 h-5 ${colorblindMode ? 'text-blue-600' : 'text-gray-500'}`} />
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative z-10 w-full py-6">
          <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl relative">
            <Brain className="w-8 h-8 text-white" />
            <motion.div className="absolute inset-0 rounded-full bg-white/30" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          </motion.div>
          
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Color Match Challenge
          </h3>
          <p className="text-gray-700 mb-6 text-sm">Choose your game mode & difficulty</p>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Object.entries(gameModes).map(([mode, config], idx) => {
              const Icon = config.icon;
              return (
                <motion.div key={mode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className={`cursor-pointer hover:shadow-xl transition-all bg-white/90 backdrop-blur-sm border-2 ${gameMode === mode ? 'border-purple-500 shadow-lg ring-2 ring-purple-300' : 'border-purple-200'}`}
                    onClick={() => setGameMode(mode)}>
                    <CardContent className="p-3 text-center">
                      <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center mx-auto mb-1`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xs font-bold text-gray-800">{config.name}</h4>
                      <p className="text-[10px] text-gray-600">{config.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {gameMode && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-3 gap-3">
              {[
                { level: 'easy', label: 'Beginner', colors: '4 Colors', color: 'from-green-400 to-emerald-500' },
                { level: 'medium', label: 'Medium', colors: '8 Colors', color: 'from-blue-400 to-purple-500' },
                { level: 'hard', label: 'Expert', colors: '12 Colors', color: 'from-orange-400 to-red-500' }
              ].map(({ level, label, colors, color }, idx) => (
                <motion.div key={level} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}>
                  <Card className="cursor-pointer hover:shadow-2xl transition-all bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400"
                    onClick={() => startGame(gameMode, level)}>
                    <CardContent className="p-3 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 mb-1">{label}</h4>
                      <p className="text-purple-600 font-semibold text-xs">{colors}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Active Game Screen
  return (
    <div className={`flex flex-col items-center p-4 bg-gradient-to-br ${currentTheme.bg} rounded-2xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden`}>
      <motion.div className={`absolute top-0 left-0 w-40 h-40 bg-${currentTheme.orb1}/20 rounded-full blur-3xl pointer-events-none`}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />

      <motion.button onClick={() => setColorblindMode(!colorblindMode)}
        className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
        whileHover={{ scale: 1.1 }}>
        <Accessibility className={`w-5 h-5 ${colorblindMode ? 'text-blue-600' : 'text-gray-500'}`} />
      </motion.button>

      <div className="relative z-10 w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mb-4 justify-center">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 shadow-lg">
            <Trophy className="w-4 h-4 mr-1" />{score}
          </Badge>
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm px-3 py-1 shadow-lg">
            ⏱️ {timeLeft}s
          </Badge>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 shadow-lg">
            🎯 {accuracy}%
          </Badge>
          {gameMode === 'reactionRush' && isPlaying && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm px-3 py-1 shadow-lg animate-pulse">
              ⚡ {reactionTimer.toFixed(2)}s
            </Badge>
          )}
          {streak > 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-1 shadow-lg animate-pulse">
                🔥 {streak}
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {currentColor && (
          <motion.div key={currentColor.name} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }} className="text-center mb-4 relative">
            <motion.div className="absolute inset-0 rounded-lg blur-xl opacity-30" style={{ backgroundColor: currentColor.value }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
            
            <div className="relative bg-white/90 backdrop-blur-sm border-4 shadow-xl rounded-lg p-4" style={{ borderColor: currentColor.value }}>
              <motion.div className="w-24 h-24 rounded-lg border-4 border-white shadow-xl mx-auto mb-2 relative overflow-hidden"
                style={{ backgroundColor: gameMode === 'memoryMatch' && memoryPhase === 'hidden' ? '#e5e7eb' : currentColor.light }}>
                {gameMode === 'memoryMatch' && memoryPhase === 'hidden' && (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">❓</div>
                )}
              </motion.div>
              <motion.div className="text-3xl font-bold" style={{ color: currentColor.value }}>
                {gameMode === 'memoryMatch' && memoryPhase === 'hidden' ? '???' : currentColor.name}
              </motion.div>
              
              <AnimatePresence>
                {showFeedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -15 }} exit={{ opacity: 0, y: -30 }}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 text-lg font-bold"
                    style={{ color: showFeedback.includes('✗') ? '#ef4444' : '#10b981' }}>
                    {showFeedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${difficultySettings[difficulty].gridCols}, minmax(0, 1fr))` }}>
          {colorSets[difficulty].map((color, idx) => (
            <motion.button key={color.name} onClick={() => handleColorClick(color)}
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="aspect-square rounded-xl border-4 border-white shadow-xl relative overflow-hidden min-h-[80px]"
              style={{ backgroundColor: color.value }}>
              {colorblindMode && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold pointer-events-none">
                  <div className="text-sm">{colorPatterns[color.name].dots}</div>
                  <div className="text-sm mt-1">{colorPatterns[color.name].stripes}</div>
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {!isPlaying && timeLeft === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 shadow-2xl">
              <CardContent className="p-6">
                <Award className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-purple-900 mb-4">{gameModes[gameMode].name} Complete! 🎉</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Score", value: score, color: "purple" },
                    { label: "Accuracy", value: `${accuracy}%`, color: "blue" },
                    { label: "Best Streak", value: bestStreak, color: "orange" },
                    { label: "Correct", value: correctAttempts, color: "green" }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/70 rounded-lg p-3">
                      <p className={`text-xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={() => startGame(gameMode, difficulty)} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Repeat className="w-4 h-4 mr-2" />Play Again
                  </Button>
                  <Button onClick={resetGame} variant="outline">Change Mode</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ColorMatch;