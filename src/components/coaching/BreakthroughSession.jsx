
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Lightbulb,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Brain,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { trackCoachingInteraction } from '@/functions/trackCoachingInteraction';

export default function BreakthroughSession({ goal, reflectionHistory, onComplete, userPreferences }) {
  const [sessionData, setSessionData] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [breakthroughInsights, setBreakthroughInsights] = useState(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    generateBreakthroughSession();
  }, []);

  const generateBreakthroughSession = async () => {
    setIsGenerating(true);

    try {
      const recentReflections = reflectionHistory.slice(0, 5).map(r => 
        `${r.date}: "${r.note}" (Mood: ${r.mood}/10)`
      ).join('\n');

      const prefs = userPreferences || {};

      const prompt = `Create breakthrough session personalized for this user.

USER PREFERENCES:
- Style: ${prefs.communication_style || 'warm_conversational'}
- Values: ${prefs.values_keywords?.join(', ') || 'growth'}
- Metaphors: ${prefs.metaphor_preferences?.join(', ') || 'journey'}
- Avoid: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
- Spiritual: ${prefs.spiritual_openness || 'varied'}

GOAL: ${goal.goal_title}
REFLECTIONS: ${recentReflections || 'Beginning'}

Create 5 powerful prompts using their preferred ${prefs.communication_style || 'warm_conversational'} style.

Return JSON with session_title, session_intention, prompts array, integration_practice`;

      const session = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            session_title: { type: "string" },
            session_intention: { type: "string" },
            prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  order: { type: "number" },
                  category: { type: "string" },
                  question: { type: "string" },
                  guidance: { type: "string" },
                  why_this_matters: { type: "string" }
                }
              }
            },
            integration_practice: { type: "string" }
          }
        }
      });

      setSessionData(session);

    } catch (error) {
      console.error('Session error:', error);
      toast.error('Failed to generate session');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextPrompt = () => {
    if (currentResponse.trim()) {
      setResponses([...responses, {
        prompt: sessionData.prompts[currentPrompt].question,
        response: currentResponse,
        category: sessionData.prompts[currentPrompt].category
      }]);
      setCurrentResponse('');
      
      if (currentPrompt < sessionData.prompts.length - 1) {
        setCurrentPrompt(currentPrompt + 1);
      } else {
        generateBreakthroughInsights();
      }
    }
  };

  const generateBreakthroughInsights = async () => {
    setIsGenerating(true);

    try {
      const sessionSummary = responses.map((r, idx) => 
        `Q${idx + 1}: ${r.prompt}\nA: ${r.response}`
      ).join('\n\n');

      const prefs = userPreferences || {};

      const prompt = `Analyze breakthrough responses using user's ${prefs.communication_style || 'warm_conversational'} style.

USER VALUES: ${prefs.values_keywords?.join(', ') || 'growth'}
RESPONSES: ${sessionSummary}

Return JSON with key_breakthrough, underlying_pattern, shift_occurring, integration_action, affirmation, next_growth_edge, celebration`;

      const insights = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            key_breakthrough: { type: "string" },
            underlying_pattern: { type: "string" },
            shift_occurring: { type: "string" },
            integration_action: { type: "string" },
            affirmation: { type: "string" },
            next_growth_edge: { type: "string" },
            celebration: { type: "string" }
          }
        }
      });

      setBreakthroughInsights(insights);

      await base44.entities.CoachingSession.create({
        coach_type: goal.coach_type,
        session_type: 'breakthrough_session',
        session_title: sessionData.session_title,
        duration_minutes: Math.ceil(responses.length * 5),
        user_responses: responses,
        ai_summary: insights.key_breakthrough,
        insights_gained: [insights.underlying_pattern, insights.shift_occurring],
        action_items: [{ action: insights.integration_action, completed: false }],
        related_goal_ids: [goal.id]
      });

      // Track completion
      await trackCoachingInteraction({
        interaction_type: 'breakthrough_completed'
      });

      queryClient.invalidateQueries(['coachingSessions']);

    } catch (error) {
      console.error('Insights error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating && !sessionData) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-12 text-center">
          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Preparing Your Breakthrough Session...
          </h3>
          <p className="text-gray-600">
            Creating prompts based on your journey
          </p>
        </CardContent>
      </Card>
    );
  }

  if (breakthroughInsights) {
    return (
      <BreakthroughInsightsView 
        insights={breakthroughInsights}
        sessionData={sessionData}
        onComplete={onComplete}
      />
    );
  }

  const currentPromptData = sessionData?.prompts[currentPrompt];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{sessionData.session_title}</h2>
              <p className="text-purple-100 text-sm mt-1">{sessionData.session_intention}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <ProgressBar value={(currentPrompt / sessionData.prompts.length) * 100} />
            <span className="text-sm">{currentPrompt + 1}/{sessionData.prompts.length}</span>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPrompt}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="shadow-xl">
            <CardHeader>
              <Badge className="w-fit mb-2 bg-purple-100 text-purple-700">
                {currentPromptData.category}
              </Badge>
              <CardTitle className="text-2xl leading-relaxed">
                {currentPromptData.question}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-3">
                💡 {currentPromptData.guidance}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-900">
                  <strong>Why this matters:</strong> {currentPromptData.why_this_matters}
                </p>
              </div>

              <Textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Take your time... let your thoughts flow freely"
                rows={8}
                className="resize-none"
              />

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  There are no wrong answers
                </p>
                
                <Button
                  onClick={handleNextPrompt}
                  disabled={!currentResponse.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 gap-2"
                >
                  {currentPrompt < sessionData.prompts.length - 1 ? (
                    <>Next Question <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Complete <Sparkles className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BreakthroughInsightsView({ insights, onComplete }) {
  const [copied, setCopied] = useState(false);

  const copyAffirmation = async () => {
    await navigator.clipboard.writeText(insights.affirmation);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Breakthrough Achieved! 🎉</h2>
          <p className="text-xl">{insights.celebration}</p>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Your Key Breakthrough
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-lg text-gray-800 leading-relaxed">{insights.key_breakthrough}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Pattern</h4>
            </div>
            <p className="text-gray-700">{insights.underlying_pattern}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Shift</h4>
            </div>
            <p className="text-gray-700">{insights.shift_occurring}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4" fill="currentColor" />
          <p className="text-2xl font-bold italic mb-4">"{insights.affirmation}"</p>
          <Button onClick={copyAffirmation} variant="secondary" className="gap-2">
            {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Save</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            Integration Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <p className="text-gray-800 font-medium text-lg">{insights.integration_action}</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <Button
          onClick={onComplete}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 px-12"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Complete Session
        </Button>
      </div>
    </motion.div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full bg-purple-300/50 rounded-full h-2 overflow-hidden flex-1">
      <div 
        className="bg-white h-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
