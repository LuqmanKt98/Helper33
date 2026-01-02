
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  RefreshCw,
  Heart,
  Copy,
  Check,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { trackCoachingInteraction } from '@/functions/trackCoachingInteraction';

export default function PersonalizedAffirmations({ goal, currentMood, recentProgress, userPreferences }) {
  const [affirmations, setAffirmations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    generateAffirmations();
  }, [goal?.id, currentMood, userPreferences]); // Added userPreferences to dependency array to regenerate on preference changes

  const generateAffirmations = async () => {
    setIsLoading(true);

    try {
      const moodContext = currentMood <= 4 ? 'struggling' : currentMood <= 6 ? 'steady' : 'thriving';
      const progressSummary = recentProgress?.slice(0, 3).map(p => 
        `${p.progress_type}: Mood ${p.mood_rating}/10`
      ).join(', ') || 'Beginning journey';

      // Get user's preferred categories
      const preferredCategories = userPreferences?.preferred_affirmation_categories || 
        ['self_compassion', 'progress', 'strength'];
      
      const prefs = userPreferences || {};

      const prompt = `Create personalized affirmations for this specific user.

USER PROFILE & PREFERENCES:
- Communication Style: ${prefs.communication_style || 'warm_conversational'}
- Preferred Categories: ${preferredCategories.join(', ')}
- Core Values: ${prefs.values_keywords?.join(', ') || 'authenticity, growth'}
- Celebration Style: ${prefs.celebration_style || 'reflective_gratitude'}
- Avoid These Words: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
- Spiritual Approach: ${prefs.spiritual_openness || 'varied'}

CURRENT CONTEXT:
- Goal: ${goal.goal_title} (${goal.category})
- Mood: ${currentMood}/10 (${moodContext})
- Progress: ${goal.progress_percentage}%
- Journey: ${progressSummary}

Create 5 affirmations that:
1. Focus primarily on their preferred categories: ${preferredCategories.join(', ')}
2. Use ${prefs.communication_style || 'warm'} language
3. Incorporate their values: ${prefs.values_keywords?.slice(0, 3).join(', ') || 'personal growth'}
4. Match their ${prefs.spiritual_openness || 'varied'} spiritual approach
5. NEVER use: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
6. Are genuinely believable for someone feeling ${moodContext}

Also create ONE reframing exercise using their preferred ${prefs.response_to_setbacks || 'reframing'} approach.

Return JSON with affirmations array, reframing object, and daily_mantra`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            affirmations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            reframing: {
              type: "object",
              properties: {
                negative_thought: { type: "string" },
                reframe: { type: "string" },
                practice: { type: "string" }
              }
            },
            daily_mantra: { type: "string" }
          }
        }
      });

      setAffirmations(result);

      // Track generation
      await trackCoachingInteraction({
        interaction_type: 'affirmation_generated'
      });

    } catch (error) {
      console.error('Affirmation generation error:', error);
      toast.error('Failed to generate affirmations');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, index, category) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    
    // Track save
    await trackCoachingInteraction({
      interaction_type: 'affirmation_saved',
      data: { category }
    });
    
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const speakAffirmation = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Creating your personalized affirmations...</p>
        </CardContent>
      </Card>
    );
  }

  if (!affirmations) return null;

  const categoryColors = {
    self_compassion: 'from-pink-500 to-rose-500',
    strength: 'from-orange-500 to-amber-500',
    progress: 'from-blue-500 to-cyan-500',
    healing: 'from-purple-500 to-indigo-500',
    capability: 'from-emerald-500 to-teal-500'
  };

  return (
    <div className="space-y-6">
      {/* Daily Mantra */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-3" />
            <p className="text-2xl font-bold italic leading-relaxed">
              "{affirmations.daily_mantra}"
            </p>
            <p className="text-sm text-purple-100 mt-3">Your mantra for today</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button
                onClick={() => copyToClipboard(affirmations.daily_mantra, 'mantra', 'daily_mantra')}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                {copiedIndex === 'mantra' ? (
                  <><Check className="w-4 h-4" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy</>
                )}
              </Button>
              <Button
                onClick={() => speakAffirmation(affirmations.daily_mantra)}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Volume2 className="w-4 h-4" /> Hear It
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Affirmations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" fill="currentColor" />
            Your Personal Affirmations
          </h3>
          <Button
            onClick={generateAffirmations}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {affirmations.affirmations.map((affirmation, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Badge className={`bg-gradient-to-r ${categoryColors[affirmation.category] || 'from-gray-500 to-gray-600'} text-white text-xs mb-2`}>
                        {affirmation.category.replace('_', ' ')}
                      </Badge>
                      <p className="text-gray-800 leading-relaxed font-medium">
                        {affirmation.text}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => copyToClipboard(affirmation.text, idx, affirmation.category)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => speakAffirmation(affirmation.text)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reframing Exercise */}
      {affirmations.reframing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💭 Reframing Exercise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  ❌ Limiting Thought:
                </p>
                <p className="text-gray-700 italic">
                  "{affirmations.reframing.negative_thought}"
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 flex items-center justify-center">
                  <span className="text-white font-bold">→</span>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                <p className="text-sm font-semibold text-green-900 mb-1">
                  ✅ Compassionate Reframe:
                </p>
                <p className="text-gray-700 font-medium">
                  "{affirmations.reframing.reframe}"
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  🌟 Practice:
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {affirmations.reframing.practice}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
