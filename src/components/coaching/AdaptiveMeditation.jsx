
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  RotateCcw,
  Wind,
  Heart,
  Sun,
  Moon,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

import { trackCoachingInteraction } from '@/functions/trackCoachingInteraction';

export default function AdaptiveMeditation({ goal, currentMood, emotionalState, userPreferences }) {
  const [meditation, setMeditation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    generateAdaptiveMeditation();
  }, [goal?.id, currentMood, emotionalState]);

  const generateAdaptiveMeditation = async () => {
    setIsLoading(true);

    try {
      const moodLevel = currentMood <= 4 ? 'struggling' : currentMood <= 6 ? 'steady' : 'good';
      
      // Get user's preferred meditation types
      const preferredTypes = userPreferences?.preferred_meditation_types || 
        ['breathing', 'body_scan'];
      
      const sessionLength = userPreferences?.session_length_preference || 'moderate_10min';
      const durationMinutes = {
        'brief_5min': 5,
        'moderate_10min': 10,
        'extended_15min': 15,
        'deep_20min': 20
      }[sessionLength] || 10;

      const prefs = userPreferences || {};
      
      const prompt = `Create a personalized meditation for this specific user.

USER PREFERENCES:
- Preferred Types: ${preferredTypes.join(', ')}
- Communication: ${prefs.communication_style || 'warm_conversational'}
- Session Length: ${durationMinutes} minutes
- Spiritual Approach: ${prefs.spiritual_openness || 'varied'}
- Values: ${prefs.values_keywords?.join(', ') || 'peace, growth'}
- Metaphors: ${prefs.metaphor_preferences?.join(', ') || 'journey, nature'}
- AVOID: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
- Learning Style: ${prefs.learning_modality || 'mixed'}

CURRENT STATE:
- Goal: ${goal.goal_title}
- Mood: ${currentMood}/10 (${moodLevel})
- Emotional State: ${emotionalState || 'stable'}
- Coach Type: ${goal.coach_type}

CREATE ${durationMinutes}-MINUTE MEDITATION:
1. Choose from their preferred types: ${preferredTypes[0]} or ${preferredTypes[1] || 'breathing'}
2. Use ${prefs.metaphor_preferences?.[0] || 'journey'} metaphors
3. Match ${prefs.communication_style || 'warm'} tone
4. Respect ${prefs.spiritual_openness || 'varied'} spirituality
5. Never use: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
6. Incorporate values: ${prefs.values_keywords?.slice(0, 2).join(', ') || 'authenticity'}

Return meditation with title, type, intro, steps, closing, breathing_pattern, benefits`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            duration_minutes: { type: "number" },
            type: { type: "string" },
            intro: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  instruction: { type: "string" },
                  duration_seconds: { type: "number" },
                  voice_guidance: { type: "string" }
                }
              }
            },
            closing: { type: "string" },
            breathing_pattern: { type: "string" },
            benefits: { type: "string" }
          }
        }
      });

      setMeditation(result);
      setCurrentStep(0);
      setProgress(0);

    } catch (error) {
      console.error('Meditation generation error:', error);
      toast.error('Failed to generate meditation');
    } finally {
      setIsLoading(false);
    }
  };

  const startMeditation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    
    if (audioEnabled && meditation.intro) {
      speakText(meditation.intro);
    }
    
    playCurrentStep(0);
  };

  const playCurrentStep = (stepIndex) => {
    if (!meditation || stepIndex >= meditation.steps.length) {
      // Meditation complete
      setIsPlaying(false);
      if (audioEnabled && meditation.closing) {
        speakText(meditation.closing);
      }
      completeMeditation();
      return;
    }

    const step = meditation.steps[stepIndex];
    
    if (audioEnabled && step.voice_guidance) {
      speakText(step.voice_guidance);
    }

    // Progress bar animation
    const stepDuration = step.duration_seconds * 1000;
    const intervalTime = 100;
    const incrementPerInterval = 100 / (stepDuration / intervalTime);
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += incrementPerInterval;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setCurrentStep(stepIndex + 1);
        setTimeout(() => playCurrentStep(stepIndex + 1), 500);
      }
    }, intervalTime);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.75;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const pauseMeditation = () => {
    setIsPlaying(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  };

  const resetMeditation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const completeMeditation = async () => {
    if (meditation) {
      // Track completion
      await trackCoachingInteraction({
        interaction_type: 'meditation_completed',
        data: {
          meditation_type: meditation.type,
          duration_minutes: meditation.duration_minutes
        }
      });

      toast.success('Meditation complete 🌸');
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Crafting your personalized meditation...</p>
        </CardContent>
      </Card>
    );
  }

  if (!meditation) return null;

  const typeIcons = {
    breathing: Wind,
    body_scan: Heart,
    loving_kindness: Heart,
    grief_meditation: Moon,
    visualization: Sun
  };

  const TypeIcon = typeIcons[meditation.type] || Wind;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-purple-200 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className="w-6 h-6 text-purple-600" />
            {meditation.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {meditation.duration_minutes} min
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">{meditation.intro}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Breathing Pattern */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">
                Breathing Pattern
              </p>
              <p className="text-2xl font-bold text-purple-700">
                {meditation.breathing_pattern}
              </p>
            </div>
            <Wind className="w-10 h-10 text-purple-300" />
          </div>
        </div>

        {/* Current Step Display */}
        {isPlaying && meditation.steps[currentStep] && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-300 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-purple-600 text-white">
                Step {currentStep + 1} of {meditation.steps.length}
              </Badge>
              {isSpeaking && (
                <Badge className="bg-blue-500 text-white flex items-center gap-1">
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  Speaking...
                </Badge>
              )}
            </div>
            
            <p className="text-lg text-gray-800 leading-relaxed mb-4">
              {meditation.steps[currentStep].instruction}
            </p>
            
            <Progress value={progress} className="h-2" />
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              {Math.ceil((meditation.steps[currentStep].duration_seconds * (100 - progress)) / 100)}s remaining
            </p>
          </motion.div>
        )}

        {/* Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-2">
            🌿 How this helps your goal:
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {meditation.benefits}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => setAudioEnabled(!audioEnabled)}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            {audioEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>

          {!isPlaying ? (
            <Button
              onClick={startMeditation}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 px-8 gap-2"
              size="lg"
            >
              <Play className="w-5 h-5" />
              {currentStep > 0 ? 'Resume' : 'Begin'}
            </Button>
          ) : (
            <Button
              onClick={pauseMeditation}
              variant="outline"
              className="h-14 px-8 gap-2"
              size="lg"
            >
              <Pause className="w-5 h-5" />
              Pause
            </Button>
          )}

          <Button
            onClick={resetMeditation}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress through meditation */}
        {meditation.steps.length > 0 && (
          <div className="flex items-center gap-2">
            {meditation.steps.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx < currentStep ? 'bg-purple-600' :
                  idx === currentStep ? 'bg-purple-400' :
                  'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
