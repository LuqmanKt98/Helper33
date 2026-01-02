
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Save, Film, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CHARACTERS = [
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'robot', emoji: '🤖', name: 'Robot' },
  { id: 'princess', emoji: '👸', name: 'Princess' },
  { id: 'superhero', emoji: '🦸', name: 'Hero' },
  { id: 'dinosaur', emoji: '🦕', name: 'Dino' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' }
];

const BACKGROUNDS = [
  { id: 'forest', emoji: '🌲', gradient: 'from-green-300 to-emerald-400', name: 'Forest' },
  { id: 'beach', emoji: '🏖️', gradient: 'from-yellow-200 to-blue-300', name: 'Beach' },
  { id: 'space', emoji: '🌌', gradient: 'from-indigo-900 to-purple-600', name: 'Space' },
  { id: 'city', emoji: '🏙️', gradient: 'from-gray-400 to-blue-500', name: 'City' },
  { id: 'rainbow', emoji: '🌈', gradient: 'from-pink-300 via-purple-300 to-blue-300', name: 'Rainbow' }
];

const ANIMATIONS = [
  { id: 'bounce', name: 'Bounce', icon: '⬆️' },
  { id: 'spin', name: 'Spin', icon: '🔄' },
  { id: 'wiggle', name: 'Wiggle', icon: '〰️' },
  { id: 'grow', name: 'Grow', icon: '📈' },
  { id: 'jump', name: 'Jump', icon: '🦘' },
  { id: 'slide', name: 'Slide', icon: '➡️' }
];

export default function SimpleAnimationCreator({ onComplete, childName = "friend" }) {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0]);
  const [selectedAnimation, setSelectedAnimation] = useState(ANIMATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scenes, setScenes] = useState([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const getAnimationVariants = (animId) => {
    switch (animId) {
      case 'bounce':
        return { y: [0, -80, 0] };
      case 'spin':
        return { rotate: [0, 360] };
      case 'wiggle':
        return { rotate: [-15, 15, -15, 15, 0] };
      case 'grow':
        return { scale: [1, 1.5, 1] };
      case 'jump':
        return { y: [0, -100, 0], rotate: [0, 360, 0] };
      case 'slide':
        return { x: [-200, 200, -200] };
      default:
        return {};
    }
  };

  const addScene = () => {
    if (!selectedCharacter) {
      toast.error('Pick a character first!');
      return;
    }

    const scene = {
      id: Date.now(),
      character: selectedCharacter,
      background: selectedBackground,
      animation: selectedAnimation
    };

    setScenes([...scenes, scene]);
    toast.success('Scene added! 🎬');
  };

  const playAnimation = () => {
    if (scenes.length === 0) {
      toast.error('Add at least one scene first!');
      return;
    }

    setIsPlaying(true);
    setCurrentSceneIndex(0);

    let index = 0;
    const playNext = () => {
      if (index < scenes.length - 1) {
        index++;
        setCurrentSceneIndex(index);
        setTimeout(playNext, 3000);
      } else {
        setIsPlaying(false);
        toast.success('Animation complete! 🎉');
      }
    };

    setTimeout(playNext, 3000);
  };

  const saveAnimation = () => {
    if (scenes.length < 2) {
      toast.error('Add at least 2 scenes before saving!');
      return;
    }

    toast.success('Animation saved! You\'re a filmmaker! 🎬');
    if (onComplete) onComplete(25, null);
  };

  const currentScene = isPlaying ? scenes[currentSceneIndex] : null;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card className="border-4 border-red-300 bg-gradient-to-br from-red-50 to-pink-50">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-3xl font-bold text-center text-red-800 flex items-center justify-center gap-3">
            <Film className="w-8 h-8" />
            Simple Animation Creator
          </h3>

          {/* Animation Preview */}
          <div className={`h-80 rounded-2xl bg-gradient-to-br ${(currentScene || selectedBackground).gradient} relative overflow-hidden shadow-2xl border-4 border-white`}>
            <AnimatePresence mode="wait">
              {isPlaying && currentScene ? (
                <motion.div
                  key={currentScene.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    ...getAnimationVariants(currentScene.animation.id)
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="text-9xl drop-shadow-2xl">
                    {currentScene.character.emoji}
                  </div>
                </motion.div>
              ) : selectedCharacter && !isPlaying ? (
                <motion.div
                  animate={getAnimationVariants(selectedAnimation.id)}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="text-9xl drop-shadow-2xl">
                    {selectedCharacter.emoji}
                  </div>
                </motion.div>
              ) : (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-white text-2xl font-bold drop-shadow-lg">
                    Create your animation!
                  </p>
                </div>
              )}
            </AnimatePresence>

            {isPlaying && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full font-bold">
                Scene {currentSceneIndex + 1} of {scenes.length}
              </div>
            )}
          </div>

          {/* Character Selection */}
          <div>
            <h4 className="font-bold text-red-800 mb-3 text-lg">Pick Character:</h4>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(char)}
                  className={`p-3 rounded-xl border-4 transition-all ${
                    selectedCharacter?.id === char.id
                      ? 'border-red-600 bg-red-100 scale-110'
                      : 'border-gray-300 bg-white hover:border-red-300'
                  }`}
                >
                  <div className="text-4xl">{char.emoji}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div>
            <h4 className="font-bold text-red-800 mb-3 text-lg">Pick Background:</h4>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg)}
                  className={`h-16 rounded-xl bg-gradient-to-br ${bg.gradient} border-4 transition-all relative ${
                    selectedBackground.id === bg.id
                      ? 'border-red-600 scale-110'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {bg.emoji}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Selection */}
          <div>
            <h4 className="font-bold text-red-800 mb-3 text-lg">Pick Animation:</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ANIMATIONS.map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => setSelectedAnimation(anim)}
                  className={`p-3 rounded-xl border-4 transition-all ${
                    selectedAnimation.id === anim.id
                      ? 'border-red-600 bg-red-100'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{anim.icon}</div>
                  <div className="text-xs font-bold">{anim.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scenes Timeline */}
          {scenes.length > 0 && (
            <div className="p-4 bg-white rounded-xl border-2 border-red-200">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Film className="w-5 h-5" />
                Your Scenes ({scenes.length}):
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {scenes.map((scene, idx) => (
                  <div 
                    key={scene.id} 
                    className={`flex-shrink-0 text-center p-3 rounded-lg border-2 ${
                      isPlaying && currentSceneIndex === idx 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-bold mb-2">Scene {idx + 1}</div>
                    <div className="text-5xl mb-2">{scene.character.emoji}</div>
                    <Badge className="text-xs mb-1">{scene.background.name}</Badge>
                    <div className="text-xs text-gray-600">{scene.animation.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              onClick={addScene}
              disabled={!selectedCharacter || isPlaying}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Scene
            </Button>
            <Button
              onClick={playAnimation}
              disabled={scenes.length === 0 || isPlaying}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4"
            >
              {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              Play
            </Button>
            <Button
              onClick={() => {
                setScenes([]);
                setCurrentSceneIndex(0);
                setIsPlaying(false);
                toast.success('Animation cleared!');
              }}
              variant="outline"
              disabled={scenes.length === 0 || isPlaying}
              className="border-red-400 hover:bg-red-50 py-4"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Clear
            </Button>
            <Button
              onClick={saveAnimation}
              disabled={scenes.length < 2}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4"
            >
              <Save className="w-5 h-5 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
