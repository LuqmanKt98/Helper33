import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Users, ArrowRight, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const quickExercises = [
  {
    id: 1,
    title: "Desk Stretches",
    duration: 5,
    description: "Gentle stretches for neck, shoulders, and back",
    category: "Stretching",
  },
  {
    id: 2,
    title: "Standing Energizer",
    duration: 5,
    description: "Quick standing movements to boost energy",
    category: "Energy Boost",
  },
  {
    id: 3,
    title: "Chair Exercises",
    duration: 5,
    description: "Gentle movements you can do seated",
    category: "Flexibility",
  },
  {
    id: 4,
    title: "Quick Cardio Burst",
    duration: 5,
    description: "Low-impact cardio to get your heart pumping",
    category: "Cardio",
  }
];

export default function ExercisePrompts({ exerciseMinutes, onUpdateExercise }) {
  const [localMinutes, setLocalMinutes] = useState(exerciseMinutes);

  // Sync with parent when exerciseMinutes changes
  useEffect(() => {
    setLocalMinutes(exerciseMinutes);
  }, [exerciseMinutes]);

  const addExerciseTime = (minutes) => {
    const newValue = localMinutes + minutes;
    setLocalMinutes(newValue);
    onUpdateExercise(newValue);
  };

  const adjustMinutes = (change) => {
    const newValue = Math.max(0, localMinutes + change);
    setLocalMinutes(newValue);
    onUpdateExercise(newValue);
  };

  const handleDirectInput = (e) => {
    const value = parseInt(e.target.value) || 0;
    const newValue = Math.max(0, value);
    setLocalMinutes(newValue);
    onUpdateExercise(newValue);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Movement Breaks
        </CardTitle>
      </CardHeader>
      <CardContent>
          <div className="space-y-4">
            <div className="text-center mb-4 space-y-2">
              <div className="text-2xl font-bold text-orange-600">{localMinutes}</div>
              <div className="text-sm text-gray-500">minutes active today</div>
              
              {/* Direct input controls */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustMinutes(-5)}
                  disabled={localMinutes < 5}
                  className="h-8 w-8 rounded-full"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="exercise-input" className="text-xs text-gray-500">
                    Minutes:
                  </Label>
                  <Input
                    id="exercise-input"
                    type="number"
                    min="0"
                    value={localMinutes}
                    onChange={handleDirectInput}
                    className="w-20 h-8 text-center text-sm"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustMinutes(5)}
                  className="h-8 w-8 rounded-full"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-600">Need inspiration? Try one of these 5-minute breaks.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickExercises.map((exercise) => (
                <motion.div
                  key={exercise.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{exercise.title}</h4>
                    <Badge className="bg-orange-100 text-orange-700">
                      {exercise.duration}min
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {exercise.category}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => addExerciseTime(exercise.duration)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Log {exercise.duration} min
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-800">Ready for More?</span>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Explore interactive exercises and mindfulness games to make movement fun.
              </p>
              <Link to={createPageUrl('MindfulnessHub')}>
                <Button variant="outline" className="w-full bg-white/50 border-purple-300 text-purple-700 hover:bg-white">
                    Go to Mindfulness Hub
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}