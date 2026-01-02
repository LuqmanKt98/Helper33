import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WaterTracker({ currentIntake, goal, onIntakeUpdate }) {
  const [localIntake, setLocalIntake] = useState(currentIntake);
  const percentage = Math.min((localIntake / goal) * 100, 100);
  const isGoalMet = localIntake >= goal;

  // Sync with parent when currentIntake changes
  useEffect(() => {
    setLocalIntake(currentIntake);
  }, [currentIntake]);

  const adjustIntake = (change) => {
    const newValue = Math.max(0, localIntake + change);
    setLocalIntake(newValue);
    onIntakeUpdate(newValue);
  };

  const handleDirectInput = (e) => {
    const value = parseInt(e.target.value) || 0;
    const newValue = Math.max(0, value);
    setLocalIntake(newValue);
    onIntakeUpdate(newValue);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Hydration Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{localIntake}</div>
            <div className="text-sm text-gray-500">glasses</div>
          </div>
          
          {/* Visual Water Glass */}
          <div className="relative">
            <div className="w-24 h-32 border-4 border-blue-300 rounded-b-full rounded-t-lg bg-blue-50 overflow-hidden relative">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300"
                initial={{ height: 0 }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="absolute top-2 left-2 right-2 h-1 bg-blue-200 rounded-full"
                animate={{ 
                  backgroundColor: isGoalMet ? "#10b981" : "#bfdbfe",
                  boxShadow: isGoalMet ? "0 0 10px rgba(16, 185, 129, 0.5)" : "none"
                }}
              />
              
              {/* Water droplet animation when adding */}
              <AnimatePresence>
                {percentage > 0 && percentage < 100 && (
                  <motion.div
                    key="droplet"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 10, opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Droplets className="w-4 h-4 text-blue-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{goal}</div>
            <div className="text-sm text-gray-500">goal</div>
          </div>
        </div>

        {/* Quick Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustIntake(-1)}
            disabled={localIntake === 0}
            className="rounded-full"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold text-gray-700">
              {localIntake} / {goal}
            </span>
            {/* Direct input field */}
            <div className="flex items-center gap-2">
              <Label htmlFor="water-input" className="text-xs text-gray-500">
                Quick set:
              </Label>
              <Input
                id="water-input"
                type="number"
                min="0"
                value={localIntake}
                onChange={handleDirectInput}
                className="w-16 h-8 text-center text-sm"
              />
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustIntake(1)}
            className="rounded-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Progress Feedback */}
        <div className="text-center">
          {isGoalMet ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.div>
              Daily goal achieved! Great job staying hydrated!
            </motion.div>
          ) : (
            <div className="text-gray-600 text-sm">
              {goal - localIntake} more glass{goal - localIntake !== 1 ? 'es' : ''} to reach your goal
            </div>
          )}
        </div>

        {/* Hydration Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-700">
            <strong>💧 Hydration Tip:</strong> {
              localIntake === 0 ? "Start your day with a glass of water!" :
              localIntake < goal / 2 ? "You're doing great! Keep sipping throughout the day." :
              localIntake < goal ? "Almost there! Just a few more glasses to go." :
              "Excellent hydration! Your body thanks you! 🌟"
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}