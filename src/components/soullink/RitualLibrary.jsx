import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sunrise, Moon, Coffee, Heart, Sparkles, Wind, 
  Music, BookOpen, Smile, Clock 
} from 'lucide-react';

export const rituals = {
  morning: [
    {
      id: 'morning_gentle',
      name: 'Gentle Morning Check-in',
      duration: '2-3 min',
      icon: Sunrise,
      steps: [
        'How did you sleep?',
        'What is your energy level? (1-10)',
        'One intention for today?',
        'Need anything from me to start well?'
      ],
      best_for: ['low_energy', 'anxious', 'building_routine']
    },
    {
      id: 'morning_energetic',
      name: 'Morning Momentum',
      duration: '3-5 min',
      icon: Coffee,
      steps: [
        'What are you looking forward to today?',
        'What is one thing you want to accomplish?',
        'Quick stretch or breathing exercise?',
        'Let us set a mid-day check-in'
      ],
      best_for: ['goal_oriented', 'motivated', 'structure_seeking']
    }
  ],
  evening: [
    {
      id: 'evening_wind_down',
      name: 'Evening Wind-Down',
      duration: '5-7 min',
      icon: Moon,
      steps: [
        'How did today treat you?',
        '3 things you are grateful for (even tiny)',
        'What is one thing you did well?',
        'Box breathing: 4-4-4-4 (4 rounds)',
        'Tomorrow can wait. Rest well.'
      ],
      best_for: ['rumination', 'anxiety', 'sleep_prep']
    },
    {
      id: 'evening_reflection',
      name: 'Reflective Evening',
      duration: '5-10 min',
      icon: BookOpen,
      steps: [
        'What was the best moment today?',
        'What challenged you?',
        'What did you learn about yourself?',
        'Journal prompt: If today had a color, what would it be and why?'
      ],
      best_for: ['meaning_seeking', 'growth_mindset', 'journaling']
    }
  ],
  micro_rituals: [
    {
      id: 'two_minute_kindness',
      name: 'Two-Minute Kindness',
      duration: '2 min',
      icon: Heart,
      steps: [
        'Send a kind text to someone',
        'Leave a nice comment online',
        'Smile at a stranger',
        'Compliment yourself in the mirror'
      ],
      best_for: ['loneliness', 'low_mood', 'connection']
    },
    {
      id: 'one_minute_tidy',
      name: 'One-Minute Tidy',
      duration: '1 min',
      icon: Sparkles,
      steps: [
        'Clear one surface',
        'Make your bed',
        'Wash one dish',
        'Put away 5 items'
      ],
      best_for: ['overwhelm', 'stuck', 'control']
    },
    {
      id: 'breathing_reset',
      name: 'Breathing Reset',
      duration: '1-2 min',
      icon: Wind,
      steps: [
        'Box Breathing: 4-4-4-4 (4 rounds)',
        'Or 4-7-8: Inhale 4, Hold 7, Exhale 8',
        'Or Triangle: 4-4-4'
      ],
      best_for: ['anxiety', 'stress', 'grounding']
    },
    {
      id: 'micro_joy',
      name: 'Micro-Joy Moment',
      duration: '2-5 min',
      icon: Smile,
      steps: [
        'Listen to your favorite song',
        'Look at photos that make you smile',
        'Step outside for fresh air',
        'Have your favorite snack mindfully'
      ],
      best_for: ['low_mood', 'empty', 'need_boost']
    }
  ],
  shared_moments: [
    {
      id: 'shared_song',
      name: 'Shared Song Moment',
      duration: '3-5 min',
      icon: Music,
      steps: [
        'Pick a song that matches your mood',
        'Listen together (I will wait)',
        'Share what it made you feel',
        'Save it to our shared playlist'
      ],
      best_for: ['connection', 'expression', 'bonding']
    },
    {
      id: 'shared_reading',
      name: 'Shared Reading',
      duration: '5-10 min',
      icon: BookOpen,
      steps: [
        'Choose: poem, short story, or quote',
        'Read it aloud or silently',
        'Share one line that stood out',
        'What does it remind you of?'
      ],
      best_for: ['meaning', 'calm', 'intellectual']
    }
  ],
  crisis_grounding: [
    {
      id: 'box_breathing',
      name: 'Box Breathing',
      duration: '2-4 min',
      icon: Wind,
      steps: [
        'Inhale through nose for 4 counts',
        'Hold for 4 counts',
        'Exhale through mouth for 4 counts',
        'Hold for 4 counts',
        'Repeat 4-6 times'
      ],
      best_for: ['panic', 'anxiety', 'overwhelm']
    },
    {
      id: 'five_senses',
      name: '5-4-3-2-1 Grounding',
      duration: '3-5 min',
      icon: Sparkles,
      steps: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ],
      best_for: ['dissociation', 'panic', 'grounding']
    },
    {
      id: 'safe_space',
      name: 'Safe Space Visualization',
      duration: '5-7 min',
      icon: Heart,
      steps: [
        'Close your eyes (if comfortable)',
        'Imagine a place where you feel completely safe',
        'What do you see? Hear? Smell?',
        'Who or what is there with you?',
        'Stay there as long as you need',
        'You can return here anytime'
      ],
      best_for: ['trauma', 'fear', 'need_safety']
    }
  ]
};

export function RitualLibrary({ onSelectRitual, userPreferences = {} }) {
  const [activeCategory, setActiveCategory] = useState('morning');

  const renderRitual = (ritual) => {
    const Icon = ritual.icon;
    
    return (
      <Card key={ritual.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">{ritual.name}</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{ritual.duration}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {ritual.steps.map((step, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-purple-600 font-semibold">{index + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <Button 
            onClick={() => onSelectRitual?.(ritual)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Start This Ritual
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="morning">
            <Sunrise className="w-4 h-4 mr-2" />
            Morning
          </TabsTrigger>
          <TabsTrigger value="evening">
            <Moon className="w-4 h-4 mr-2" />
            Evening
          </TabsTrigger>
          <TabsTrigger value="micro_rituals">
            <Sparkles className="w-4 h-4 mr-2" />
            Quick
          </TabsTrigger>
          <TabsTrigger value="crisis_grounding">
            <Wind className="w-4 h-4 mr-2" />
            Grounding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morning" className="grid md:grid-cols-2 gap-4 mt-4">
          {rituals.morning.map(renderRitual)}
        </TabsContent>

        <TabsContent value="evening" className="grid md:grid-cols-2 gap-4 mt-4">
          {rituals.evening.map(renderRitual)}
        </TabsContent>

        <TabsContent value="micro_rituals" className="grid md:grid-cols-2 gap-4 mt-4">
          {rituals.micro_rituals.map(renderRitual)}
        </TabsContent>

        <TabsContent value="crisis_grounding" className="grid md:grid-cols-2 gap-4 mt-4">
          {rituals.crisis_grounding.map(renderRitual)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RitualLibrary;