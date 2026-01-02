
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  Sparkles,
  Lightbulb,
  ChevronDown,
  Heart,
  Trophy,
  Zap,
  Play,
  RefreshCw,
  Target,
  Coffee,
  Smile,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function AITutor({
  childName = "friend",
  childAge = 6,
  currentModule = "general",
  currentActivity = { name: "exploring", concept: "learning" },
  learningGaps = [],
  interests = [],
  recentProgress = {},
  onSpeakResponse,
  compact = false,
  onBrainBreakRequest,
  currentDifficulty = "medium"
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [frustrationLevel, setFrustrationLevel] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [lastActivityChange, setLastActivityChange] = useState(Date.now());
  const [showBrainBreak, setShowBrainBreak] = useState(false);
  const [brainBreakSuggestion, setBrainBreakSuggestion] = useState(null);
  const [showConfidenceBoost, setShowConfidenceBoost] = useState(false);
  const [confidenceBoostData, setConfidenceBoostData] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [contextAwareHints, setContextAwareHints] = useState([]);
  const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 200 });
  const dragControls = useDragControls();

  // Define dimensions constants
  const COMPACT_WIDTH = 180;
  const COMPACT_HEIGHT = 80;
  const EXPANDED_WIDTH = 384;
  const EXPANDED_HEIGHT = 500;

  const { data: childProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['childProgress'],
    queryFn: async () => {
      try {
        const allProgress = await base44.entities.ChildProgress.list();
        return allProgress[0];
      } catch (error) {
        console.warn('Could not load child progress:', error);
        return null;
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000
  });

  useEffect(() => {
    setLastActivityChange(Date.now());
    setConsecutiveErrors(0);
    setFrustrationLevel(0);
    setHintLevel(0);
    setContextAwareHints([]);
  }, [currentActivity.name]);

  const buildPersonalizedContext = () => {
    let context = `Current Activity: ${currentActivity.name}\n`;
    context += `Module: ${currentModule}\n`;
    context += `Concept Being Learned: ${currentActivity.concept}\n`;
    
    if (childProgress) {
      if (childProgress.achievements?.length > 0) {
        const recentAchievements = childProgress.achievements.slice(0, 3).map(a => a.achievement_name).join(', ');
        context += `Recent Achievements: ${recentAchievements}\n`;
      }

      const activeGoals = childProgress.learning_goals?.filter(g => g.status === 'active') || [];
      if (activeGoals.length > 0) {
        context += `Active Goals: ${activeGoals.map(g => `${g.description} (${g.progress_percentage || 0}% complete)`).join(', ')}\n`;
      }

      if (childProgress.strengths?.length > 0) {
        context += `Strengths: ${childProgress.strengths.join(', ')}\n`;
      }

      const struggles = Object.entries(childProgress.module_progress || {})
        .flatMap(([module, data]) => {
          if (!data || !data.struggling_with || !Array.isArray(data.struggling_with)) {
            return [];
          }
          return data.struggling_with.map(concept => `${module}: ${concept}`);
        })
        .filter(Boolean);
      
      if (struggles.length > 0) {
        context += `Needs Practice: ${struggles.join(', ')}\n`;
      }

      if (childProgress.interests?.length > 0) {
        context += `Interests: ${childProgress.interests.join(', ')}\n`;
      }

      const moduleProgress = childProgress.module_progress?.[currentModule];
      if (moduleProgress?.concepts_mastered?.length > 0) {
        context += `Already Mastered in ${currentModule}: ${moduleProgress.concepts_mastered.join(', ')}\n`;
      }

      if (childProgress.weekly_summary) {
        context += `This Week: ${childProgress.weekly_summary.activities_completed || 0} activities completed\n`;
      }
    }

    return context;
  };

  const generateBrainBreak = async (trigger = 'fatigue') => {
    setIsThinking(true);
    try {
      const context = buildPersonalizedContext();
      const childInterests = interests.length > 0 ? interests : (childProgress?.interests || ['animals', 'colors', 'games']);
      
      const prompt = `${childName} needs a brain break! They're showing signs of ${trigger}.
CONTEXT: ${context}
Interests: ${childInterests.join(', ')}
Generate a 2-3 minute personalized brain break. Return JSON with: brain_break_name, duration_minutes, activity_type, instructions (array), why_this_helps, transition_back`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            brain_break_name: { type: "string" },
            duration_minutes: { type: "number" },
            activity_type: { type: "string" },
            instructions: { type: "array", items: { type: "string" } },
            why_this_helps: { type: "string" },
            transition_back: { type: "string" }
          }
        }
      });

      setBrainBreakSuggestion(response);
      setShowBrainBreak(true);
      if (onSpeakResponse) {
        onSpeakResponse(`Time for a quick brain break! Let's ${response.brain_break_name}!`);
      }
    } catch (error) {
      console.error('Error generating brain break:', error);
      
      // Fallback brain break suggestion
      const fallbackBreak = {
        brain_break_name: "Dance Party Break",
        duration_minutes: 2,
        activity_type: "movement",
        instructions: [
          "Stand up and stretch your arms high!",
          "Do 5 silly jumps in place",
          "Spin around slowly 3 times",
          "Take 3 deep breaths and smile!"
        ],
        why_this_helps: "Movement helps your brain reset and feel refreshed!",
        transition_back: "Great job! Now you're ready to learn again!"
      };
      
      setBrainBreakSuggestion(fallbackBreak);
      setShowBrainBreak(true);
      if (onSpeakResponse) {
        onSpeakResponse(`Looks like we hit a small snag, but no worries! How about a quick ${fallbackBreak.brain_break_name}?`);
      }
      toast.info('Using default brain break - network issue detected');
    }
    setIsThinking(false);
  };

  const generateConfidenceBoost = async () => {
    setIsThinking(true);
    try {
      const context = buildPersonalizedContext();
      const achievements = childProgress?.achievements || [];
      
      const prompt = `${childName} is stuck on ${currentActivity.concept}. Boost their confidence using their past achievements: ${achievements.slice(0, 3).map(a => a.achievement_name).join(', ') || 'their learning journey'}
Return JSON with: opening_encouragement, past_success_reminder, connection_to_now, actionable_tips (array), motivational_close, suggested_review_activity`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            opening_encouragement: { type: "string" },
            past_success_reminder: { type: "string" },
            connection_to_now: { type: "string" },
            actionable_tips: { type: "array", items: { type: "string" } },
            motivational_close: { type: "string" },
            suggested_review_activity: { type: "string" }
          }
        }
      });

      setConfidenceBoostData(response);
      setShowConfidenceBoost(true);
      const fullMessage = `${response.opening_encouragement} ${response.past_success_reminder}`;
      if (onSpeakResponse) {
        onSpeakResponse(fullMessage);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: fullMessage, type: 'confidence_boost', data: response }]);
    } catch (error) {
      console.error('Error generating confidence boost:', error);
      
      // Fallback confidence boost
      const fallbackBoost = {
        opening_encouragement: `Hey ${childName}, you're doing great!`,
        past_success_reminder: "You've learned so many things already - remember all the activities you've completed!",
        connection_to_now: "The same skills that helped you before will help you now.",
        actionable_tips: [
          "Take a deep breath and try one small step at a time",
          "Remember - making mistakes is how we learn!"
        ],
        motivational_close: "You can do this! I believe in you!",
        suggested_review_activity: "Try something fun you've done before"
      };
      
      setConfidenceBoostData(fallbackBoost);
      setShowConfidenceBoost(true);
      if (onSpeakResponse) {
        onSpeakResponse(fallbackBoost.opening_encouragement);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackBoost.opening_encouragement, type: 'confidence_boost', data: fallbackBoost }]);
      toast.info('Showing encouragement - network issue detected');
    }
    setIsThinking(false);
  };

  const generateContextAwareHint = async (currentProblem, previousAttempts = []) => {
    setIsThinking(true);
    try {
      const context = buildPersonalizedContext();
      const moduleProgress = childProgress?.module_progress?.[currentModule];
      const relatedMasteredConcepts = moduleProgress?.concepts_mastered || [];
      const userInterests = interests.length > 0 ? interests : (childProgress?.interests || ['learning']);

      const prompt = `${childName} needs help with: ${currentProblem}. Hint level: ${hintLevel + 1}/3. 
Context: ${context}
They know: ${relatedMasteredConcepts.join(', ')}
Interests: ${userInterests.join(', ')}
Return JSON with: hint_text, uses_mastered_concept, hint_type, encouragement, if_still_stuck`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            hint_text: { type: "string" },
            uses_mastered_concept: { type: "string" },
            hint_type: { type: "string" },
            encouragement: { type: "string" },
            if_still_stuck: { type: "string" }
          }
        }
      });

      setContextAwareHints(prev => [...prev, response]);
      setHintLevel(prev => prev + 1);
      setMessages(prev => [...prev, { role: 'assistant', content: `💡 ${response.hint_text}`, type: 'context_hint', data: response }]);
      if (onSpeakResponse) {
        onSpeakResponse(response.hint_text);
      }
      toast.success('Hint unlocked!');
    } catch (error) {
      console.error('Error generating hint:', error);
      
      // Fallback hints
      const fallbackHints = [
        { hint_text: "Try breaking this into smaller steps. What's the first thing you need to do?", uses_mastered_concept: "problem solving", encouragement: "You can do this!" },
        { hint_text: "Think about something similar you've done before. How did you solve it then?", uses_mastered_concept: "prior knowledge", encouragement: "You're on the right track!" },
        { hint_text: "Let's work through this together. Can you try one part at a time?", uses_mastered_concept: "step by step thinking", encouragement: "You're so close!" }
      ];
      
      const fallbackHint = fallbackHints[Math.min(hintLevel, fallbackHints.length - 1)];
      setContextAwareHints(prev => [...prev, fallbackHint]);
      setHintLevel(prev => prev + 1);
      setMessages(prev => [...prev, { role: 'assistant', content: `💡 ${fallbackHint.hint_text}`, type: 'context_hint', data: fallbackHint }]);
      if (onSpeakResponse) {
        onSpeakResponse(fallbackHint.hint_text);
      }
      toast.info('Showing hint - network issue detected');
    }
    setIsThinking(false);
  };

  const detectAndIntervene = (eventType, eventData = {}) => {
    switch (eventType) {
      case 'error':
        setConsecutiveErrors(prev => prev + 1);
        setFrustrationLevel(prev => Math.min(prev + 1, 10));
        if (consecutiveErrors >= 2 && !showBrainBreak) {
          generateBrainBreak('frustration');
        } else if (consecutiveErrors >= 1 && !showConfidenceBoost) {
          generateConfidenceBoost();
        }
        break;
      case 'success':
        setConsecutiveErrors(0);
        setFrustrationLevel(prev => Math.max(prev - 2, 0));
        setHintLevel(0);
        setContextAwareHints([]);
        break;
      case 'long_activity':
        const timeSpent = (Date.now() - lastActivityChange) / 1000 / 60;
        if (timeSpent > 10 && !showBrainBreak) {
          generateBrainBreak('fatigue');
        }
        break;
      case 'hint_request':
        generateContextAwareHint(eventData.currentProblem || currentActivity.concept, eventData.previousAttempts || []);
        break;
      case 'stuck':
        if (!showConfidenceBoost) {
          generateConfidenceBoost();
        }
        break;
    }
  };

  useEffect(() => {
    window.aiTutorDetectEvent = detectAndIntervene;
    window.aiTutorRequestHint = (problem, attempts) => {
      detectAndIntervene('hint_request', { currentProblem: problem, previousAttempts: attempts });
    };
    window.aiTutorReportError = () => detectAndIntervene('error');
    window.aiTutorReportSuccess = () => detectAndIntervene('success');
    window.aiTutorCheckFatigue = () => detectAndIntervene('long_activity');
    
    return () => {
      // Cleanup
      delete window.aiTutorDetectEvent;
      delete window.aiTutorRequestHint;
      delete window.aiTutorReportError;
      delete window.aiTutorReportSuccess;
      delete window.aiTutorCheckFatigue;
    };
  }, [consecutiveErrors, frustrationLevel, lastActivityChange, currentActivity, childProgress, hintLevel]);

  const provideFeedback = async (activityType, result) => {
    try {
      const context = buildPersonalizedContext();
      const prompt = `${childName} completed ${activityType} with result: ${result}. ${context}
Give warm feedback (2-3 sentences, age ${childAge}).`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const feedbackMessage = { role: 'assistant', content: `🌟 ${response}`, type: 'personalized_feedback' };
      setMessages(prev => [...prev, feedbackMessage]);
      if (onSpeakResponse) {
        onSpeakResponse(response);
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
      // Fallback feedback
      const fallbackFeedback = `Great job on ${activityType}, ${childName}! You're learning and growing! Keep it up! 🌟`;
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackFeedback, type: 'personalized_feedback' }]);
      if (onSpeakResponse) {
        onSpeakResponse(fallbackFeedback);
      }
      toast.info('Could not generate personalized feedback. Showing a default message.');
    }
  };

  useEffect(() => {
    window.aiTutorProvideFeedback = provideFeedback;
    return () => {
      delete window.aiTutorProvideFeedback;
    };
  }, [childProgress, childName, childAge, currentActivity]);

  const BrainBreakModal = () => (
    <AnimatePresence>
      {showBrainBreak && brainBreakSuggestion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          onClick={(e) => e.target === e.currentTarget && setShowBrainBreak(false)}
        >
          <Card className="max-w-lg w-full bg-gradient-to-br from-green-50 to-blue-50 border-4 border-green-300 shadow-2xl">
            <CardHeader className="text-center relative">
              <Button size="icon" variant="ghost" onClick={() => setShowBrainBreak(false)} className="absolute top-2 right-2">
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Coffee className="w-8 h-8 text-green-600" />
                Time for a Brain Break!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{brainBreakSuggestion.brain_break_name}</h3>
                <Badge className="bg-green-500 text-white">{brainBreakSuggestion.duration_minutes} minutes</Badge>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  <Smile className="w-4 h-4 inline mr-1 text-green-600" />
                  {brainBreakSuggestion.why_this_helps}
                </p>
                <div className="space-y-2">
                  {brainBreakSuggestion.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Badge className="bg-green-500 text-white w-6 h-6 flex items-center justify-center p-0">{idx + 1}</Badge>
                      <p className="text-sm text-gray-700 flex-1">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => {
                if (onBrainBreakRequest) onBrainBreakRequest(brainBreakSuggestion);
                setShowBrainBreak(false);
                setFrustrationLevel(0);
                setConsecutiveErrors(0);
                toast.success('Brain break time! 🎉');
              }} className="w-full bg-gradient-to-r from-green-500 to-blue-500">
                <Play className="w-4 h-4 mr-2" />
                Let's Do It!
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ConfidenceBoostModal = () => (
    <AnimatePresence>
      {showConfidenceBoost && confidenceBoostData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          onClick={(e) => e.target === e.currentTarget && setShowConfidenceBoost(false)}
        >
          <Card className="max-w-lg w-full bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-300 shadow-2xl">
            <CardHeader className="text-center relative">
              <Button size="icon" variant="ghost" onClick={() => setShowConfidenceBoost(false)} className="absolute top-2 right-2">
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Trophy className="w-8 h-8 text-yellow-600" />
                You've Got This!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-3">
                <p className="text-gray-800 font-medium">{confidenceBoostData.opening_encouragement}</p>
                <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    Remember When:
                  </p>
                  <p className="text-sm text-gray-700">{confidenceBoostData.past_success_reminder}</p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800 text-sm">
                    <Lightbulb className="w-4 h-4 inline mr-1 text-purple-600" />
                    Tips Just for You:
                  </p>
                  {confidenceBoostData.actionable_tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-purple-50 p-2 rounded">
                      <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => setShowConfidenceBoost(false)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <Heart className="w-4 h-4 mr-2" />
                I'm Ready!
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (compact && !isExpanded) {
    return (
      <>
        <motion.div
          drag
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={{
            left: 0,
            right: window.innerWidth - COMPACT_WIDTH,
            top: 0,
            bottom: window.innerHeight - COMPACT_HEIGHT
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 60,
            cursor: 'grab'
          }}
          onDragEnd={(event, info) => {
            setPosition({
              x: Math.max(0, Math.min(window.innerWidth - COMPACT_WIDTH, position.x + info.offset.x)),
              y: Math.max(0, Math.min(window.innerHeight - COMPACT_HEIGHT, position.y + info.offset.y))
            });
          }}
          className="touch-none"
        >
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(true);
              if (onSpeakResponse) {
                onSpeakResponse("Hi! I'm your AI tutor! Click any button to get help!");
              }
              toast.success("AI Tutor opened! Click the buttons for help! 🧠", { duration: 3000 });
            }}
            size="lg"
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 shadow-2xl rounded-full px-5 py-4 text-white font-bold border-4 border-white hover:border-yellow-300 transition-all relative"
          >
            <Brain className="w-6 h-6 mr-2 animate-pulse" />
            <span className="text-base">AI Tutor</span>
            {frustrationLevel > 3 && (
              <Badge className="ml-2 bg-orange-500 text-white animate-pulse text-xs">Help!</Badge>
            )}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>
        </motion.div>
        <BrainBreakModal />
        <ConfidenceBoostModal />
      </>
    );
  }

  return (
    <>
      <BrainBreakModal />
      <ConfidenceBoostModal />

      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{
          left: 0,
          right: window.innerWidth - EXPANDED_WIDTH,
          top: 0,
          bottom: window.innerHeight - EXPANDED_HEIGHT
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 60,
          width: EXPANDED_WIDTH,
          maxWidth: 'calc(100vw - 2rem)'
        }}
        onDragEnd={(event, info) => {
          setPosition({
            x: Math.max(0, Math.min(window.innerWidth - EXPANDED_WIDTH, position.x + info.offset.x)),
            y: Math.max(0, Math.min(window.innerHeight - EXPANDED_HEIGHT, position.y + info.offset.y))
          });
        }}
        className="touch-none"
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-indigo-400 shadow-2xl">
          <CardHeader 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white cursor-grab active:cursor-grabbing hover:from-indigo-600 hover:to-purple-600 transition-all" 
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 animate-pulse" />
                <span className="font-bold text-base">✋ Drag Me Anywhere!</span>
                {frustrationLevel > 5 && (
                  <Badge className="bg-orange-500 text-white animate-pulse text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Help
                  </Badge>
                )}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 max-h-96 overflow-y-auto space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => detectAndIntervene('hint_request', { currentProblem: currentActivity.concept })}
                className="bg-purple-500 hover:bg-purple-600 text-white border-0"
                disabled={hintLevel >= 3 || isThinking}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                {isThinking ? 'Loading...' : `Hint ${hintLevel > 0 ? `${hintLevel}/3` : ''}`}
              </Button>
              <Button
                size="sm"
                onClick={() => generateBrainBreak('requested')}
                className="bg-green-500 hover:bg-green-600 text-white border-0"
                disabled={isThinking}
              >
                <Coffee className="w-4 h-4 mr-1" />
                Break
              </Button>
              <Button
                size="sm"
                onClick={generateConfidenceBoost}
                className="bg-yellow-500 hover:bg-yellow-600 text-white border-0"
                disabled={isThinking}
              >
                <Trophy className="w-4 h-4 mr-1" />
                Boost!
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFrustrationLevel(0);
                  setConsecutiveErrors(0);
                  setHintLevel(0);
                  setMessages([]);
                  toast.success('Tutor reset! 🌟');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white border-0"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-gray-700 font-bold mb-2">
                  👋 Hi {childName}! I'm here to help!
                </p>
                <p className="text-xs text-gray-600 px-4">
                  💡 Click "Hint" for help • ☕ "Break" when tired • 🏆 "Boost" for confidence!
                </p>
                {progressLoading && (
                  <p className="text-xs text-indigo-500 mt-2">
                    <Sparkles className="w-3 h-3 inline animate-spin mr-1" />
                    Loading your progress...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-lg p-3 border-2 border-indigo-200 shadow-md"
                  >
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{message.content}</p>
                    {message.type === 'context_hint' && message.data && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <Target className="w-3 h-3 inline mr-1" />
                          Building on: {message.data.uses_mastered_concept}
                        </p>
                        {message.data.encouragement && (
                          <p className="text-xs text-purple-600 mt-1 font-semibold">
                            💜 {message.data.encouragement}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {frustrationLevel > 0 && (
              <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-orange-800">Challenge Level</span>
                  <span className="text-xs text-orange-600 font-bold">{frustrationLevel}/10</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2.5">
                  <motion.div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${frustrationLevel * 10}%` }}
                  />
                </div>
                {frustrationLevel > 5 && (
                  <p className="text-xs text-orange-700 mt-2 font-medium">
                    💚 Take a break when you need it!
                  </p>
                )}
              </div>
            )}

            {isThinking && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 justify-center bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span className="font-bold">Thinking...</span>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-center text-purple-700 font-semibold">
                💡 Drag me anywhere! Click buttons for help!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
