import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Drumstick, Gamepad2, Moon, Sparkles, 
  Trophy, Star, Gift 
} from 'lucide-react';
import { toast } from 'sonner';

const PETS = [
  { id: 'cat', emoji: '🐱', name: 'Kitty', sounds: ['Meow!', 'Purr~', 'Mew!'] },
  { id: 'dog', emoji: '🐶', name: 'Puppy', sounds: ['Woof!', 'Arf!', 'Ruff!'] },
  { id: 'bunny', emoji: '🐰', name: 'Bunny', sounds: ['Hop!', '*wiggle*', 'Boing!'] },
  { id: 'dragon', emoji: '🐲', name: 'Dragon', sounds: ['Roar!', '*breathes fire*', 'Grrr!'] }
];

export default function VirtualPet({ onComplete, childName = "friend" }) {
  const [selectedPet, setSelectedPet] = useState(null);
  const [petStats, setPetStats] = useState({
    happiness: 100,
    hunger: 50,
    energy: 80,
    cleanliness: 90
  });
  const [petMood, setPetMood] = useState('happy');
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [actionCooldown, setActionCooldown] = useState(false);

  useEffect(() => {
    if (!selectedPet) return;

    const interval = setInterval(() => {
      setPetStats(prev => ({
        happiness: Math.max(0, prev.happiness - 2),
        hunger: Math.max(0, prev.hunger - 3),
        energy: Math.max(0, prev.energy - 2),
        cleanliness: Math.max(0, prev.cleanliness - 1)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedPet]);

  useEffect(() => {
    const avg = (petStats.happiness + petStats.hunger + petStats.energy + petStats.cleanliness) / 4;
    
    if (avg >= 80) setPetMood('very_happy');
    else if (avg >= 60) setPetMood('happy');
    else if (avg >= 40) setPetMood('okay');
    else if (avg >= 20) setPetMood('sad');
    else setPetMood('very_sad');

    if (avg < 30 && petMood !== 'very_sad') {
      toast.error(`Your ${selectedPet?.name} needs care!`, { icon: '😢' });
    }
  }, [petStats, selectedPet]);

  const performAction = (action) => {
    if (actionCooldown) {
      toast.error('Wait a moment before doing that again!');
      return;
    }

    setActionCooldown(true);
    setTimeout(() => setActionCooldown(false), 1000);

    const soundIndex = Math.floor(Math.random() * selectedPet.sounds.length);
    const sound = selectedPet.sounds[soundIndex];

    let updates = {};
    let points = 0;
    let message = '';

    switch (action) {
      case 'feed':
        updates = { hunger: Math.min(100, petStats.hunger + 30) };
        points = 5;
        message = `${sound} Yummy! Thanks for the food!`;
        break;
      case 'play':
        updates = { 
          happiness: Math.min(100, petStats.happiness + 25),
          energy: Math.max(0, petStats.energy - 10)
        };
        points = 8;
        message = `${sound} So much fun!`;
        break;
      case 'sleep':
        updates = { 
          energy: Math.min(100, petStats.energy + 40),
          happiness: Math.min(100, petStats.happiness + 10)
        };
        points = 6;
        message = `${sound} *yawn* I feel refreshed!`;
        break;
      case 'clean':
        updates = { 
          cleanliness: Math.min(100, petStats.cleanliness + 35),
          happiness: Math.min(100, petStats.happiness + 10)
        };
        points = 7;
        message = `${sound} I'm so clean now!`;
        break;
    }

    setPetStats(prev => ({ ...prev, ...updates }));
    setTotalPoints(prev => prev + points);
    toast.success(message, { duration: 2000 });

    checkAchievements();
  };

  const checkAchievements = () => {
    const allStatsHigh = Object.values(petStats).every(v => v >= 80);
    
    if (allStatsHigh && !achievements.includes('perfect_care')) {
      setAchievements([...achievements, 'perfect_care']);
      toast.success('Achievement Unlocked: Perfect Care! 🏆', { duration: 4000 });
    }

    if (totalPoints >= 50 && !achievements.includes('devoted_owner')) {
      setAchievements([...achievements, 'devoted_owner']);
      toast.success('Achievement Unlocked: Devoted Owner! ⭐', { duration: 4000 });
    }
  };

  const getPetExpression = () => {
    switch (petMood) {
      case 'very_happy': return '😊';
      case 'happy': return '🙂';
      case 'okay': return '😐';
      case 'sad': return '😢';
      case 'very_sad': return '😭';
      default: return '🙂';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-4 border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-3xl font-bold text-center text-pink-800 flex items-center justify-center gap-3">
            <Heart className="w-8 h-8" />
            Virtual Pet Care
            <Sparkles className="w-8 h-8" />
          </h3>

          {!selectedPet ? (
            <div className="space-y-4">
              <p className="text-center text-gray-700 font-semibold text-lg">
                Choose your pet to take care of!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PETS.map((pet) => (
                  <motion.button
                    key={pet.id}
                    onClick={() => {
                      setSelectedPet(pet);
                      toast.success(`You chose ${pet.name}! Take good care! 💕`);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 rounded-2xl bg-white border-4 border-pink-300 hover:border-pink-500 shadow-lg transition-all"
                  >
                    <div className="text-6xl mb-2">{pet.emoji}</div>
                    <div className="font-bold text-lg">{pet.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pet Display */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center border-4 border-pink-300 relative">
                <motion.div
                  animate={{
                    y: petMood === 'very_happy' ? [0, -10, 0] : [0],
                    rotate: petMood === 'very_happy' ? [-5, 5, -5] : [0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block"
                >
                  <div className="text-9xl mb-4">{selectedPet.emoji}</div>
                </motion.div>
                <div className="text-6xl mb-2">{getPetExpression()}</div>
                <h4 className="text-2xl font-bold text-purple-800">{selectedPet.name}</h4>
                
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-lg">{totalPoints} pts</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border-2 border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-bold">Happiness</span>
                  </div>
                  <Progress value={petStats.happiness} className="h-3 mb-1" />
                  <span className="text-sm text-gray-600">{Math.round(petStats.happiness)}%</span>
                </div>

                <div className="p-4 bg-white rounded-xl border-2 border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Drumstick className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">Hunger</span>
                  </div>
                  <Progress value={petStats.hunger} className="h-3 mb-1" />
                  <span className="text-sm text-gray-600">{Math.round(petStats.hunger)}%</span>
                </div>

                <div className="p-4 bg-white rounded-xl border-2 border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-blue-500" />
                    <span className="font-bold">Energy</span>
                  </div>
                  <Progress value={petStats.energy} className="h-3 mb-1" />
                  <span className="text-sm text-gray-600">{Math.round(petStats.energy)}%</span>
                </div>

                <div className="p-4 bg-white rounded-xl border-2 border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span className="font-bold">Clean</span>
                  </div>
                  <Progress value={petStats.cleanliness} className="h-3 mb-1" />
                  <span className="text-sm text-gray-600">{Math.round(petStats.cleanliness)}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => performAction('feed')}
                  disabled={actionCooldown}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6 text-lg"
                >
                  <Drumstick className="w-6 h-6 mr-2" />
                  Feed
                </Button>
                <Button
                  onClick={() => performAction('play')}
                  disabled={actionCooldown}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-6 text-lg"
                >
                  <Gamepad2 className="w-6 h-6 mr-2" />
                  Play
                </Button>
                <Button
                  onClick={() => performAction('sleep')}
                  disabled={actionCooldown}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-6 text-lg"
                >
                  <Moon className="w-6 h-6 mr-2" />
                  Sleep
                </Button>
                <Button
                  onClick={() => performAction('clean')}
                  disabled={actionCooldown}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 text-lg"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Clean
                </Button>
              </div>

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                  <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Achievements ({achievements.length})
                  </h4>
                  <div className="flex gap-2">
                    {achievements.map((ach) => (
                      <Badge key={ach} className="bg-yellow-400 text-gray-800">
                        <Star className="w-4 h-4 mr-1" />
                        {ach === 'perfect_care' ? 'Perfect Care' : 'Devoted Owner'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  toast.success(`Great job taking care of ${selectedPet.name}! 🎉`);
                  if (onComplete) onComplete(totalPoints, null);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4"
              >
                <Gift className="w-5 h-5 mr-2" />
                Finish & Earn {totalPoints} Points!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}