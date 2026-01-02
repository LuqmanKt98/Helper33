import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, Sparkles, Heart, Activity, Users, 
  Briefcase, Loader2,
  Brain, Home, Target, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const SURVEY_SECTIONS = [
  {
    title: "Physical Health & Body",
    icon: Activity,
    color: "from-red-400 to-pink-500",
    questions: [
      { id: 'weight_goals', label: 'Do you have weight or body transformation goals?', type: 'rating' },
      { id: 'sleep_quality', label: 'How would you rate your sleep quality?', type: 'rating' },
      { id: 'eating_habits', label: 'How satisfied are you with your eating habits?', type: 'rating' },
      { id: 'movement_routine', label: 'How consistent is your movement/exercise routine?', type: 'rating' },
      { id: 'stress_levels', label: 'How would you rate your current stress levels?', type: 'rating' }
    ]
  },
  {
    title: "Emotional & Mental Health",
    icon: Heart,
    color: "from-purple-400 to-pink-500",
    questions: [
      { id: 'mood_stability', label: 'How stable is your mood day-to-day?', type: 'rating' },
      { id: 'emotional_connection', label: 'Do you feel emotionally connected to loved ones?', type: 'rating' },
      { id: 'mindset_challenges', label: 'How often do negative thoughts impact you?', type: 'rating_inverse' },
      { id: 'self_care', label: 'How well do you take care of your emotional needs?', type: 'rating' }
    ]
  },
  {
    title: "Family & Social Life",
    icon: Users,
    color: "from-blue-400 to-cyan-500",
    questions: [
      { id: 'quality_time_kids', label: 'Quality time with kids/family?', type: 'rating' },
      { id: 'family_routines', label: 'How organized are your family routines?', type: 'rating' },
      { id: 'social_connection', label: 'Do you feel socially connected?', type: 'rating' },
      { id: 'relationship_satisfaction', label: 'Satisfaction with close relationships?', type: 'rating' }
    ]
  },
  {
    title: "Career & Business",
    icon: Briefcase,
    color: "from-indigo-400 to-purple-500",
    questions: [
      { id: 'career_satisfaction', label: 'How satisfied are you with your career?', type: 'rating' },
      { id: 'income_goals', label: 'Are you meeting your income goals?', type: 'rating' },
      { id: 'skills_development', label: 'Are you learning/growing professionally?', type: 'rating' },
      { id: 'work_life_balance', label: 'How balanced is your work and life?', type: 'rating' }
    ]
  },
  {
    title: "Home & Lifestyle",
    icon: Home,
    color: "from-green-400 to-emerald-500",
    questions: [
      { id: 'home_organization', label: 'How organized is your living space?', type: 'rating' },
      { id: 'cleaning_habits', label: 'Satisfaction with cleaning/maintenance routines?', type: 'rating' },
      { id: 'financial_organization', label: 'How organized are your finances?', type: 'rating' }
    ]
  },
  {
    title: "Personal Growth & Dreams",
    icon: Star,
    color: "from-yellow-400 to-orange-500",
    questions: [
      { id: 'confidence', label: 'How confident do you feel?', type: 'rating' },
      { id: 'hobbies_creativity', label: 'Time for hobbies and creativity?', type: 'rating' },
      { id: 'spiritual_practice', label: 'Connection to spirituality/meaning?', type: 'rating' }
    ]
  }
];

const PERSONALITY_QUESTIONS = [
  {
    question: "When you think about change, you typically...",
    options: [
      { value: "visionary", label: "Dream big and plan boldly", personality: "visionary" },
      { value: "rebuilder", label: "Start fresh from the ground up", personality: "rebuilder" },
      { value: "achiever", label: "Set targets and crush them", personality: "achiever" },
      { value: "caregiver", label: "Focus on others first", personality: "caregiver" }
    ]
  },
  {
    question: "Your biggest motivation is...",
    options: [
      { value: "growth", label: "Personal growth and transformation", personality: "achiever" },
      { value: "healing", label: "Healing and inner peace", personality: "healer" },
      { value: "connection", label: "Deep connection with loved ones", personality: "caregiver" },
      { value: "freedom", label: "Freedom and independence", personality: "visionary" }
    ]
  },
  {
    question: "When life gets hard, you...",
    options: [
      { value: "push_through", label: "Push through quietly", personality: "quiet_fighter" },
      { value: "ask_help", label: "Reach out for support", personality: "rebuilder" },
      { value: "overwhelmed", label: "Feel overwhelmed", personality: "overwhelmed" },
      { value: "strategic", label: "Make a strategic plan", personality: "achiever" }
    ]
  }
];

export default function Year2026Survey({ onComplete }) {
  const [surveyStep, setSurveyStep] = useState(0); // 0=intro, 1-6=sections, 7=personality, 8=vision, 9=final
  const [isGenerating, setIsGenerating] = useState(false);
  const [surveyData, setSurveyData] = useState({
    section_responses: {},
    focus_areas: [],
    biggest_challenge: '',
    vision_2026: '',
    boldest_dream: '',
    daily_commitment: '30',
    personality_answers: [],
    personality_type: ''
  });

  const totalSteps = 10;
  const progress = (surveyStep / totalSteps) * 100;

  const handleRating = (sectionIdx, questionId, rating) => {
    setSurveyData(prev => ({
      ...prev,
      section_responses: {
        ...prev.section_responses,
        [questionId]: rating
      }
    }));
  };

  const calculatePersonality = () => {
    const counts = {};
    surveyData.personality_answers.forEach(answer => {
      counts[answer] = (counts[answer] || 0) + 1;
    });
    
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return dominant ? dominant[0] : 'achiever';
  };

  const identifyFocusAreas = () => {
    const lowAreas = [];
    SURVEY_SECTIONS.forEach(section => {
      section.questions.forEach(q => {
        const rating = surveyData.section_responses[q.id];
        if (rating && rating <= 6) {
          lowAreas.push(section.title);
        }
      });
    });
    return [...new Set(lowAreas)];
  };

  const generateComprehensivePlan = async () => {
    setIsGenerating(true);
    try {
      const personality = calculatePersonality();
      const focusAreas = identifyFocusAreas();
      
      await base44.auth.updateMe({
        year_2026_personality: personality,
        year_2026_survey_completed: true
      });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive, science-based 2026 transformation plan for a ${personality} personality type.

ASSESSMENT DATA:
${JSON.stringify(surveyData.section_responses)}

IDENTIFIED FOCUS AREAS:
${focusAreas.join(', ')}

BIGGEST CHALLENGE:
${surveyData.biggest_challenge}

2026 VISION:
${surveyData.vision_2026}

BOLDEST DREAM:
${surveyData.boldest_dream}

DAILY COMMITMENT: ${surveyData.daily_commitment} minutes

PERSONALITY TYPE: ${personality}

Create 4-6 transformative goals. For EACH goal provide:

1. SMART Goal Framework
2. 12 Monthly Missions (Jan-Dec with specific mission titles and descriptions)
3. 52 Weekly Milestones (specific, measurable)
4. Daily Micro-Tasks (4-5 small daily actions, each 5-15 min)
5. Target Metrics (specific numbers/outcomes)
6. Integrated Features (from: Wellness, MealPlanner, Family, KidsCreativeStudio, Organizer, HomeworkHub, SocialMediaManager, JournalStudio, LifeCoach, MindfulnessHub)
7. Motivational "Why This Matters" statement

Use behavioral psychology, habit stacking, BJ Fogg Behavior Model, and positive psychology.
Make it realistic, achievable, and deeply personalized.`,
        response_json_schema: {
          type: "object",
          properties: {
            personality_description: { type: "string" },
            goals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  goal_title: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  why_this_matters: { type: "string" },
                  smart_goal: {
                    type: "object",
                    properties: {
                      specific: { type: "string" },
                      measurable: { type: "string" },
                      achievable: { type: "string" },
                      relevant: { type: "string" },
                      time_bound: { type: "string" }
                    }
                  },
                  monthly_missions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        month: { type: "number" },
                        month_name: { type: "string" },
                        mission_title: { type: "string" },
                        mission_description: { type: "string" },
                        completed: { type: "boolean" }
                      }
                    }
                  },
                  weekly_milestones: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        week: { type: "number" },
                        milestone: { type: "string" },
                        achieved: { type: "boolean" }
                      }
                    }
                  },
                  daily_micro_tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        task: { type: "string" },
                        time_minutes: { type: "number" }
                      }
                    }
                  },
                  integrated_features: { type: "array", items: { type: "string" } },
                  target_metrics: { type: "object" }
                }
              }
            },
            welcome_message: { type: "string" },
            first_week_focus: { type: "string" }
          }
        }
      });

      for (const goal of response.goals) {
        await base44.entities.Year2026Goal.create({
          ...goal,
          status: 'active',
          progress_percentage: 0,
          days_completed: 0,
          current_streak: 0,
          longest_streak: 0,
          xp_earned: 0,
          level: 1,
          start_date: '2026-01-01'
        });
      }

      toast.success(`🎉 Your 2026 HU Plan is activated! ${response.goals.length} goals created.`);
      onComplete();
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="bg-white/95 backdrop-blur-xl border-2 border-purple-300 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{
              backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)',
              backgroundSize: '200% 100%'
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-3xl font-bold">🌟 2026 HU Life Survey</CardTitle>
              <Badge className="bg-white/20 text-white px-4 py-1.5 text-sm">
                Step {surveyStep + 1}/{totalSteps}
              </Badge>
            </div>
            <p className="text-purple-100 mb-3">Science-based assessment for your best year yet</p>
            <Progress value={progress} className="h-3 bg-white/30" />
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {/* Intro */}
            {surveyStep === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 space-y-6"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center shadow-2xl"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome to 2026 HU
                </h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Human Upgrade: Your Year, Reimagined by Science + AI
                </p>
                <p className="text-gray-600 max-w-xl mx-auto">
                  This intelligent survey combines behavioral psychology, wellness science, and AI to create 
                  your personalized 366-day transformation plan. It takes 10-15 minutes.
                </p>
                <Button
                  onClick={() => setSurveyStep(1)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-lg px-10 py-6 shadow-xl"
                >
                  Begin Your 2026 Journey
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Survey Sections */}
            {surveyStep >= 1 && surveyStep <= 6 && (
              <SurveySection
                section={SURVEY_SECTIONS[surveyStep - 1]}
                responses={surveyData.section_responses}
                onRate={handleRating}
                sectionIndex={surveyStep - 1}
              />
            )}

            {/* Personality Assessment */}
            {surveyStep === 7 && (
              <motion.div
                key="personality"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Personality Profile</h2>
                  <p className="text-gray-600">Help us understand your approach to change</p>
                </div>

                {PERSONALITY_QUESTIONS.map((pq, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="font-semibold text-gray-800 text-lg">{pq.question}</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {pq.options.map((opt, oidx) => (
                        <motion.button
                          key={oidx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: oidx * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const newAnswers = [...surveyData.personality_answers];
                            newAnswers[idx] = opt.personality;
                            setSurveyData(prev => ({ ...prev, personality_answers: newAnswers }));
                          }}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            surveyData.personality_answers[idx] === opt.personality
                              ? 'border-purple-500 bg-purple-50 shadow-lg'
                              : 'border-gray-200 hover:border-purple-300 bg-white'
                          }`}
                        >
                          <p className="font-medium text-gray-800">{opt.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Vision Questions */}
            {surveyStep === 8 && (
              <motion.div
                key="vision"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <Target className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Your 2026 Vision</h2>
                  <p className="text-gray-600">Paint the picture of your transformed life</p>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Imagine it's December 31, 2026. What has changed? What have you achieved?
                  </Label>
                  <Textarea
                    value={surveyData.vision_2026}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, vision_2026: e.target.value }))}
                    placeholder="Be specific and vivid... I've lost 30 pounds, my family has weekly game nights, I launched my business, I feel calm and centered..."
                    rows={6}
                    className="text-lg border-2 border-purple-300"
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    What's the main thing holding you back from your ideal life?
                  </Label>
                  <Textarea
                    value={surveyData.biggest_challenge}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, biggest_challenge: e.target.value }))}
                    placeholder="Be honest... Time, energy, motivation, knowledge, support, fear..."
                    rows={4}
                    className="text-lg border-2 border-purple-300"
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    If 2026 were your rebirth year, what's your boldest dream?
                  </Label>
                  <Textarea
                    value={surveyData.boldest_dream}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, boldest_dream: e.target.value }))}
                    placeholder="The dream that scares and excites you..."
                    rows={4}
                    className="text-lg border-2 border-purple-300"
                  />
                </div>
              </motion.div>
            )}

            {/* Commitment Level */}
            {surveyStep === 9 && (
              <motion.div
                key="commitment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <Sparkles className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Daily Commitment</h2>
                  <p className="text-gray-600">How much time can you realistically dedicate daily?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { value: '15', label: '15 Minutes', subtitle: 'Small, sustainable steps', emoji: '🌱' },
                    { value: '30', label: '30 Minutes', subtitle: 'Steady, meaningful progress', emoji: '🚀' },
                    { value: '60', label: '1 Hour', subtitle: 'Dedicated transformation', emoji: '⚡' },
                    { value: '120', label: '2+ Hours', subtitle: 'All-in life upgrade', emoji: '🔥' }
                  ].map((opt, idx) => (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSurveyData(prev => ({ ...prev, daily_commitment: opt.value }))}
                      className={`p-8 rounded-2xl border-2 transition-all ${
                        surveyData.daily_commitment === opt.value
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-2xl'
                          : 'border-purple-200 bg-white hover:border-purple-400'
                      }`}
                    >
                      <div className="text-5xl mb-3">{opt.emoji}</div>
                      <h4 className="font-bold text-xl text-gray-800 mb-1">{opt.label}</h4>
                      <p className="text-sm text-gray-600">{opt.subtitle}</p>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center pt-8">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Button
                      onClick={generateComprehensivePlan}
                      disabled={isGenerating || !surveyData.vision_2026 || !surveyData.biggest_challenge}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-lg px-12 py-7 shadow-2xl"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          Crafting Your 2026 Transformation...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 mr-2" />
                          Generate My 2026 HU Plan
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {surveyStep > 0 && surveyStep < 9 && (
            <div className="flex gap-4 mt-8">
              <Button onClick={() => setSurveyStep(prev => prev - 1)} variant="outline" className="flex-1 border-2 border-purple-300">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setSurveyStep(prev => prev + 1)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SurveySection({ section, responses, onRate, sectionIndex }) {
  const Icon = section.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{section.title}</h2>
        <p className="text-gray-600">Rate each area honestly (1 = needs work, 10 = thriving)</p>
      </div>

      <div className="space-y-6">
        {section.questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
          >
            <Label className="text-base font-semibold mb-4 block text-gray-800">{q.label}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRate(sectionIndex, q.id, rating)}
                  className={`flex-1 h-12 rounded-lg font-bold transition-all ${
                    responses[q.id] === rating
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-purple-200 hover:border-purple-400 text-gray-600'
                  }`}
                >
                  {rating}
                </motion.button>
              ))}
            </div>
            {responses[q.id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <Badge className={`${
                  responses[q.id] >= 8 ? 'bg-green-100 text-green-700' :
                  responses[q.id] >= 6 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {responses[q.id] >= 8 ? '✨ Thriving!' :
                   responses[q.id] >= 6 ? '📈 Room for growth' :
                   '🎯 Focus area for 2026'}
                </Badge>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}