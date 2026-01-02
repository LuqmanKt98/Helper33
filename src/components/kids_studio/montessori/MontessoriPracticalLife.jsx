import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy, Sparkles,
  Shirt, Utensils, Home, Droplets, Flower
} from 'lucide-react';
import confetti from 'canvas-confetti';

const activities = [
  {
    id: 'tying_shoes',
    title: 'Tying Shoes',
    icon: Shirt,
    description: 'Learn to tie your shoes step by step!',
    steps: [
      'Cross the laces to make an X',
      'Pull one lace through the bottom',
      'Pull tight to make a knot',
      'Make a loop (bunny ear) with one lace',
      'Wrap the other lace around the loop',
      'Pull through to make second loop',
      'Pull both loops tight!'
    ],
    skill: 'fine_motor'
  },
  {
    id: 'pouring_water',
    title: 'Pouring Water',
    icon: Droplets,
    description: 'Practice pouring without spilling!',
    steps: [
      'Hold the pitcher with both hands',
      'Tilt slowly and carefully',
      'Watch the water level',
      'Stop pouring when cup is 3/4 full',
      'Set pitcher down gently',
      'Wipe up any spills with towel'
    ],
    skill: 'coordination'
  },
  {
    id: 'setting_table',
    title: 'Setting the Table',
    icon: Utensils,
    description: 'Help set up for family meals!',
    steps: [
      'Put a plate at each seat',
      'Fork goes on the left side',
      'Knife and spoon on the right',
      'Napkin under the fork or on plate',
      'Cup above the knife',
      'Add anything special needed'
    ],
    skill: 'organization'
  },
  {
    id: 'watering_plants',
    title: 'Watering Plants',
    icon: Flower,
    description: 'Take care of plants and watch them grow!',
    steps: [
      'Feel the soil - is it dry?',
      'Fill watering can with water',
      'Pour slowly at the base of plant',
      'Water until soil is moist, not soggy',
      'Wipe up any spilled water',
      'Put watering can back in its place'
    ],
    skill: 'care_taking'
  },
  {
    id: 'folding_clothes',
    title: 'Folding Clothes',
    icon: Home,
    description: 'Learn to fold and organize clothes!',
    steps: [
      'Lay the shirt flat and smooth',
      'Fold one side to the middle',
      'Fold the other side to meet it',
      'Fold in half from bottom to top',
      'Smooth out any wrinkles',
      'Place neatly in drawer'
    ],
    skill: 'independence'
  }
];

export default function MontessoriPracticalLife({ progress, onComplete, childName }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const skillsLearned = progress?.skills_learned || [];

  const handleStepComplete = () => {
    const newCompleted = [...completedSteps, currentStep];
    setCompletedSteps(newCompleted);

    if (currentStep === selectedActivity.steps.length - 1) {
      // Activity complete!
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      onComplete({ 
        score: 100,
        skillLearned: selectedActivity.skill
      });
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const resetActivity = () => {
    setSelectedActivity(null);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  if (!selectedActivity) {
    return (
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-amber-700 mb-2">Practical Life Skills</h2>
          <p className="text-gray-600">Learn everyday skills for independence!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const isLearned = skillsLearned.includes(activity.skill);
            
            return (
              <motion.div
                key={activity.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer border-2 border-amber-300 hover:border-amber-500 transition-all"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{activity.title}</h3>
                          {isLearned && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Learned!
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <Badge className="bg-amber-100 text-amber-800 text-xs">
                          {activity.steps.length} steps
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Skills Learned */}
        {skillsLearned.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-amber-200">
            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Skills You've Learned:
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsLearned.map(skill => (
                <Badge key={skill} className="bg-green-100 text-green-800 capitalize">
                  {skill.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const Icon = selectedActivity.icon;
  const isComplete = completedSteps.length === selectedActivity.steps.length;

  return (
    <div className="max-w-2xl mx-auto">
      <Button onClick={resetActivity} variant="outline" className="mb-4">
        ← Choose Different Activity
      </Button>

      <Card className="border-4 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedActivity.title}</h3>
            <p className="text-gray-600">{selectedActivity.description}</p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-bold text-amber-700">
                {completedSteps.length} / {selectedActivity.steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps.length / selectedActivity.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {selectedActivity.steps.map((step, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isCurrent = idx === currentStep;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    isCompleted 
                      ? 'bg-green-100 border-green-300' 
                      : isCurrent
                      ? 'bg-yellow-100 border-yellow-400'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <p className={`flex-1 ${isCurrent ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {step}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Button */}
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <Button
                onClick={handleStepComplete}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 py-6 text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                I Did Step {currentStep + 1}!
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-3xl font-bold text-green-700 mb-2">You Did It! 🎉</h4>
                <p className="text-lg text-gray-700 mb-6">
                  You learned how to {selectedActivity.title.toLowerCase()}!
                </p>
                <Button
                  onClick={resetActivity}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Learn Another Skill
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}