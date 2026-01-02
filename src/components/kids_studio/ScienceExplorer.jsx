import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Beaker, Sparkles, Play, RotateCcw, 
  Lightbulb, Droplet, Zap, Leaf, Sun 
} from 'lucide-react';
import { toast } from 'sonner';

const EXPERIMENTS = [
  {
    id: 'color_mix',
    title: 'Color Mixing Lab',
    description: 'Mix colors and see what happens!',
    icon: '🎨',
    emoji: Droplet,
    color: 'from-pink-400 to-purple-500',
    minAge: 3,
    points: 10
  },
  {
    id: 'plant_grow',
    title: 'Plant Growth',
    description: 'Watch a plant grow in fast motion!',
    icon: '🌱',
    emoji: Leaf,
    color: 'from-green-400 to-emerald-500',
    minAge: 4,
    points: 12
  },
  {
    id: 'volcano',
    title: 'Virtual Volcano',
    description: 'Make a volcano erupt with bubbles!',
    icon: '🌋',
    emoji: Zap,
    color: 'from-orange-400 to-red-500',
    minAge: 5,
    points: 15
  },
  {
    id: 'rainbow',
    title: 'Rainbow Maker',
    description: 'Learn how rainbows are made!',
    icon: '🌈',
    emoji: Sun,
    color: 'from-blue-400 to-pink-400',
    minAge: 4,
    points: 10
  },
  {
    id: 'magnet',
    title: 'Magnet Magic',
    description: 'Explore magnetic forces!',
    icon: '🧲',
    emoji: Sparkles,
    color: 'from-red-400 to-blue-500',
    minAge: 5,
    points: 12
  },
  {
    id: 'water_cycle',
    title: 'Water Cycle',
    description: 'See how rain and clouds work!',
    icon: '💧',
    emoji: Droplet,
    color: 'from-cyan-400 to-blue-500',
    minAge: 5,
    points: 13
  }
];

export default function ScienceExplorer({ onComplete, childName = "friend", childAge = 6 }) {
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [experimentStep, setExperimentStep] = useState(0);
  const [experimentRunning, setExperimentRunning] = useState(false);
  const [mixedColor, setMixedColor] = useState(null);
  const [plantGrowth, setPlantGrowth] = useState(0);
  const [volcanoActive, setVolcanoActive] = useState(false);

  // Color Mixing Experiment
  const runColorMixing = (color1, color2) => {
    const colorMap = {
      'red_blue': '#800080',
      'blue_red': '#800080',
      'red_yellow': '#FF8C00',
      'yellow_red': '#FF8C00',
      'blue_yellow': '#008000',
      'yellow_blue': '#008000',
      'red_green': '#8B4513',
      'green_red': '#8B4513'
    };
    
    const result = colorMap[`${color1}_${color2}`] || '#808080';
    setMixedColor(result);
    toast.success('Colors mixed! ✨');
  };

  // Plant Growth Experiment
  const runPlantGrowth = () => {
    setExperimentRunning(true);
    let growth = 0;
    const interval = setInterval(() => {
      growth += 10;
      setPlantGrowth(growth);
      if (growth >= 100) {
        clearInterval(interval);
        setExperimentRunning(false);
        toast.success('Your plant is fully grown! 🌱');
      }
    }, 300);
  };

  // Volcano Experiment
  const runVolcano = () => {
    setVolcanoActive(true);
    setExperimentRunning(true);
    setTimeout(() => {
      setVolcanoActive(false);
      setExperimentRunning(false);
      toast.success('Volcano eruption complete! 🌋');
    }, 3000);
  };

  const resetExperiment = () => {
    setExperimentStep(0);
    setMixedColor(null);
    setPlantGrowth(0);
    setVolcanoActive(false);
    setExperimentRunning(false);
  };

  const completeExperiment = () => {
    if (selectedExperiment) {
      toast.success(`Experiment complete! You're a scientist! 🧪`);
      onComplete(selectedExperiment.points, null);
      setSelectedExperiment(null);
      resetExperiment();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <AnimatePresence mode="wait">
        {!selectedExperiment ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className="border-4 border-teal-300 bg-teal-50">
              <CardContent className="p-6">
                <h3 className="text-3xl font-bold text-center text-teal-800 mb-6 flex items-center justify-center gap-3">
                  <Beaker className="w-8 h-8" />
                  Science Explorer Lab
                  <Sparkles className="w-8 h-8" />
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {EXPERIMENTS.map((exp, idx) => {
                    const Icon = exp.emoji;
                    return (
                      <motion.div
                        key={exp.id}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card
                          onClick={() => setSelectedExperiment(exp)}
                          className={`cursor-pointer border-2 hover:border-purple-400 transition-all bg-gradient-to-br ${exp.color} bg-opacity-10`}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-5xl mb-3">{exp.icon}</div>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">{exp.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{exp.description}</p>
                            <Badge className="bg-yellow-400 text-gray-800">
                              +{exp.points} points
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            <Card className={`border-4 border-purple-300 bg-gradient-to-br ${selectedExperiment.color} bg-opacity-20`}>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
                    <Beaker className="w-7 h-7" />
                    {selectedExperiment.title}
                  </h3>
                  <p className="text-gray-700 text-lg">{selectedExperiment.description}</p>
                </div>

                {/* Color Mixing Experiment */}
                {selectedExperiment.id === 'color_mix' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="font-bold text-lg mb-4">Pick 2 colors to mix!</p>
                      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        {[
                          { color: '#FF0000', name: 'red' },
                          { color: '#0000FF', name: 'blue' },
                          { color: '#FFFF00', name: 'yellow' },
                          { color: '#00FF00', name: 'green' }
                        ].map(({color, name}) => (
                          <Button
                            key={name}
                            onClick={() => {
                              if (!mixedColor) {
                                setMixedColor({ first: name });
                              } else {
                                runColorMixing(mixedColor.first, name);
                              }
                            }}
                            className="h-20 text-white font-bold"
                            style={{ backgroundColor: color }}
                          >
                            {name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {mixedColor && typeof mixedColor === 'string' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-center p-8 rounded-xl"
                        style={{ backgroundColor: mixedColor }}
                      >
                        <p className="text-white font-bold text-2xl drop-shadow-lg">
                          ✨ New Color Created! ✨
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Plant Growth */}
                {selectedExperiment.id === 'plant_grow' && (
                  <div className="space-y-4 text-center">
                    <div className="h-64 flex items-end justify-center bg-gradient-to-b from-sky-300 to-green-200 rounded-xl relative overflow-hidden">
                      <div className="absolute bottom-0 w-full h-20 bg-gradient-to-b from-amber-700 to-amber-900"></div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${plantGrowth}%` }}
                        className="text-8xl absolute bottom-20 z-10"
                      >
                        🌱
                      </motion.div>
                      <div className="absolute top-4 right-4 text-4xl">☀️</div>
                    </div>
                    <Button
                      onClick={runPlantGrowth}
                      disabled={experimentRunning || plantGrowth >= 100}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {plantGrowth >= 100 ? 'Fully Grown! 🌱' : 'Watch Plant Grow'}
                    </Button>
                  </div>
                )}

                {/* Volcano */}
                {selectedExperiment.id === 'volcano' && (
                  <div className="space-y-4 text-center">
                    <div className="h-64 flex items-end justify-center bg-gradient-to-b from-sky-400 to-green-300 rounded-xl relative overflow-hidden">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-b from-amber-800 to-amber-900 clip-triangle"></div>
                        <AnimatePresence>
                          {volcanoActive && (
                            <>
                              {[...Array(20)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute bottom-full left-1/2 w-4 h-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full"
                                  initial={{ y: 0, x: 0, opacity: 1 }}
                                  animate={{
                                    y: -100 - Math.random() * 100,
                                    x: (Math.random() - 0.5) * 100,
                                    opacity: 0
                                  }}
                                  transition={{ duration: 1 + Math.random() }}
                                />
                              ))}
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <Button
                      onClick={runVolcano}
                      disabled={experimentRunning}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 px-8"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {volcanoActive ? 'Erupting! 🌋' : 'Make Volcano Erupt!'}
                    </Button>
                  </div>
                )}

                {/* Rainbow Maker */}
                {selectedExperiment.id === 'rainbow' && (
                  <div className="space-y-4 text-center">
                    <div className="h-64 flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200 rounded-xl relative">
                      {experimentRunning && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute"
                        >
                          <div className="text-9xl">🌈</div>
                        </motion.div>
                      )}
                      <div className="absolute top-4 right-4 text-5xl">☀️</div>
                      <div className="absolute bottom-4 left-4 text-3xl">💧</div>
                    </div>
                    <Button
                      onClick={() => {
                        setExperimentRunning(true);
                        setTimeout(() => {
                          setExperimentRunning(false);
                          toast.success('Rainbow created! 🌈');
                        }, 2000);
                      }}
                      disabled={experimentRunning}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 px-8"
                    >
                      <Sun className="w-5 h-5 mr-2" />
                      Make a Rainbow!
                    </Button>
                    {experimentRunning && (
                      <p className="text-purple-700 font-bold">When sunlight ☀️ shines through water droplets 💧, it makes a rainbow! 🌈</p>
                    )}
                  </div>
                )}

                {/* Magnet Magic */}
                {selectedExperiment.id === 'magnet' && (
                  <div className="space-y-4 text-center">
                    <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl relative">
                      <div className="text-6xl">🧲</div>
                      {experimentRunning && (
                        <>
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute text-4xl"
                              initial={{ x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 150 }}
                              animate={{ x: 0, y: 0 }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                            >
                              📎
                            </motion.div>
                          ))}
                        </>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setExperimentRunning(true);
                        setTimeout(() => {
                          setExperimentRunning(false);
                          toast.success('Magnets attract metal! 🧲');
                        }, 2000);
                      }}
                      disabled={experimentRunning}
                      className="bg-gradient-to-r from-red-500 to-blue-500 text-white font-bold py-4 px-8"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Activate Magnet!
                    </Button>
                  </div>
                )}

                {/* Water Cycle */}
                {selectedExperiment.id === 'water_cycle' && (
                  <div className="space-y-4 text-center">
                    <div className="h-64 bg-gradient-to-b from-sky-400 to-blue-200 rounded-xl relative overflow-hidden">
                      <div className="absolute top-4 right-4 text-5xl">☀️</div>
                      {experimentRunning && experimentStep >= 1 && (
                        <motion.div
                          initial={{ y: 100, opacity: 0 }}
                          animate={{ y: 20, opacity: 1 }}
                          className="absolute left-1/2 -translate-x-1/2 text-4xl"
                        >
                          ☁️
                        </motion.div>
                      )}
                      {experimentRunning && experimentStep >= 2 && (
                        <motion.div
                          className="absolute left-1/2 top-24"
                          initial={{ y: 0 }}
                          animate={{ y: 100 }}
                          transition={{ duration: 1 }}
                        >
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute text-2xl"
                              style={{ left: (i - 5) * 15 }}
                              initial={{ y: 0, opacity: 0 }}
                              animate={{ y: 100, opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              💧
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      <div className="absolute bottom-0 w-full h-16 bg-blue-600"></div>
                    </div>
                    <Button
                      onClick={() => {
                        setExperimentRunning(true);
                        setExperimentStep(1);
                        setTimeout(() => setExperimentStep(2), 1000);
                        setTimeout(() => {
                          setExperimentRunning(false);
                          setExperimentStep(0);
                          toast.success('The water cycle is amazing! 💧');
                        }, 3000);
                      }}
                      disabled={experimentRunning}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Water Cycle!
                    </Button>
                    {experimentRunning && (
                      <p className="text-blue-700 font-bold">
                        {experimentStep === 1 && 'Water evaporates and becomes clouds! ☁️'}
                        {experimentStep === 2 && 'Clouds make rain! 💧'}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={resetExperiment}
                    variant="outline"
                    className="flex-1 border-orange-400 hover:bg-orange-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => setSelectedExperiment(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Choose Different Experiment
                  </Button>
                  <Button
                    onClick={completeExperiment}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
}