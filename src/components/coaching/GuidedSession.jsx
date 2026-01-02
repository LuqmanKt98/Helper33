
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Heart,
  Brain,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

const SESSION_TEMPLATES = {
  grief_coach: {
    guided_reflection: {
      title: "Guided Grief Reflection",
      prompts: [
        "How are you feeling today? Take a moment to notice what's present for you right now.",
        "What's one memory that feels important to honor today?",
        "What emotion has been strongest for you lately?",
        "What do you need most right now - comfort, space, understanding, or something else?",
        "What's one small way you've been caring for yourself through this?",
        "What would you like to tell your grief today?"
      ]
    },
    progress_review: {
      title: "Grief Journey Check-in",
      prompts: [
        "Looking back over the past week, what's one moment where you felt your strength?",
        "What's been the hardest part of your grief journey lately?",
        "Have you noticed any shifts in how you're experiencing your loss?",
        "What support has been most helpful to you?",
        "What's one thing you're proud of yourself for doing, even on hard days?"
      ]
    }
  },
  life_coach: {
    goal_setting: {
      title: "Goal Setting Session",
      prompts: [
        "What area of your life would you most like to focus on right now?",
        "What would success look like for you in this area?",
        "What's one specific, achievable goal you could set for the next 30 days?",
        "What obstacles might come up, and how will you handle them?",
        "What support or resources do you need to achieve this goal?",
        "How will you celebrate when you reach this milestone?"
      ]
    },
    breakthrough_session: {
      title: "Breakthrough Exploration",
      prompts: [
        "What limiting belief has been holding you back?",
        "If that belief wasn't true, what would become possible?",
        "What's one thing you know you need to do but have been avoiding?",
        "What would it feel like to take that first step?",
        "What's the smallest action you could take today toward this?"
      ]
    }
  }
};

export default function GuidedSession({ coachType, sessionType, onComplete, relatedGoalIds = [] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [sessionStartTime] = useState(new Date());
  
  const queryClient = useQueryClient();

  const template = SESSION_TEMPLATES[coachType]?.[sessionType];
  const prompts = template?.prompts || [];
  const totalSteps = prompts.length + 2; // +2 for mood check-in before/after

  const saveSessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      return await base44.entities.CoachingSession.create(sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingSessions']);
      toast.success('Session saved! 🌟');
    }
  });

  const handleNext = () => {
    if (currentStep === 0) {
      // Mood check-in
      if (!moodBefore) {
        toast.error('Please select how you\'re feeling');
        return;
      }
    } else if (currentStep <= prompts.length) {
      // Prompt response
      if (!currentResponse.trim()) {
        toast.error('Please share your thoughts');
        return;
      }
      setResponses(prev => ({
        ...prev,
        [currentStep - 1]: currentResponse
      }));
      setCurrentResponse('');
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeSession();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep <= prompts.length) {
        setCurrentResponse(responses[currentStep - 1] || '');
      }
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeSession = async () => {
    if (!moodAfter) {
      toast.error('Please share how you\'re feeling now');
      return;
    }

    setIsGeneratingInsights(true);

    try {
      // Generate AI insights
      const responsesText = Object.values(responses).join('\n\n');
      const aiPrompt = `As a compassionate ${coachType.replace('_', ' ')}, analyze this session and provide:
1. A brief, encouraging summary
2. 2-3 key insights or patterns you notice
3. One actionable next step

Session responses:
${responsesText}`;

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt: aiPrompt
      });

      const duration = Math.round((new Date() - sessionStartTime) / 1000 / 60);

      const sessionData = {
        coach_type: coachType,
        session_type: sessionType,
        session_title: template.title,
        duration_minutes: duration,
        prompts_used: prompts,
        user_responses: prompts.map((prompt, idx) => ({
          prompt,
          response: responses[idx] || '',
          timestamp: new Date().toISOString()
        })),
        mood_before: moodBefore,
        mood_after: moodAfter,
        insights_gained: [aiResult],
        related_goal_ids: relatedGoalIds,
        ai_summary: aiResult
      };

      await saveSessionMutation.mutateAsync(sessionData);

      if (onComplete) {
        onComplete(sessionData);
      }
    } catch (error) {
      console.error('Session completion error:', error);
      toast.error('Error saving session');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const moodOptions = [
    { value: 'struggling', emoji: '😔', label: 'Struggling' },
    { value: 'overwhelmed', emoji: '😰', label: 'Overwhelmed' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'hopeful', emoji: '🙂', label: 'Hopeful' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'good', emoji: '😊', label: 'Good' },
    { value: 'great', emoji: '😄', label: 'Great' }
  ];

  const renderMoodCheckIn = (isBefore) => {
    const selectedMood = isBefore ? moodBefore : moodAfter;
    const setMood = isBefore ? setMoodBefore : setMoodAfter;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {isBefore ? 'How are you feeling?' : 'How are you feeling now?'}
          </h3>
          <p className="text-gray-600">
            {isBefore 
              ? 'Take a moment to check in with yourself before we begin'
              : 'Notice any shifts in how you\'re feeling after this session'
            }
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(mood.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMood === mood.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="text-4xl mb-2">{mood.emoji}</div>
              <div className={`text-sm font-medium ${
                selectedMood === mood.value ? 'text-purple-700' : 'text-gray-700'
              }`}>
                {mood.label}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderPrompt = () => {
    const promptIndex = currentStep - 1;
    const prompt = prompts[promptIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <Brain className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Question {promptIndex + 1} of {prompts.length}
          </h3>
        </div>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <p className="text-lg text-gray-800 leading-relaxed">
                {prompt}
              </p>
            </div>
          </CardContent>
        </Card>

        <Textarea
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          placeholder="Take your time... there's no right or wrong answer"
          rows={8}
          className="text-lg"
        />

        <p className="text-sm text-gray-500 text-center">
          💡 Tip: Be honest and write freely. This is a safe space for your thoughts.
        </p>
      </motion.div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Session Progress
          </span>
          <span className="text-sm text-gray-500">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
      </div>

      {/* Content */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && renderMoodCheckIn(true)}
            {currentStep > 0 && currentStep <= prompts.length && renderPrompt()}
            {currentStep === totalSteps - 1 && renderMoodCheckIn(false)}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={isGeneratingInsights}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
        >
          {isGeneratingInsights ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Completing...
            </>
          ) : currentStep === totalSteps - 1 ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Complete Session
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
