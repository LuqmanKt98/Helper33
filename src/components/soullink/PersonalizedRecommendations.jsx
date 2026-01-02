import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Wind,
  Heart,
  Brain,
  Sunrise,
  Loader2,
  Play,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedRecommendations({ settings }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const { data: moodHistory = [] } = useQuery({
    queryKey: ['soulLinkMoodHistory'],
    queryFn: () => base44.entities.SoulLinkMoodEntry.list('-created_date', 7)
  });

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      const recentMoods = moodHistory.slice(0, 5).map(m => 
        `${m.mood_label} (${m.mood_rating}/10) - ${m.emotional_tags?.join(', ') || ''}`
      ).join('\n');

      const userName = settings?.user_preferred_name || 'friend';
      const companionName = settings?.companion_name || 'SoulLink';

      const prompt = `You are ${companionName}, ${userName}'s compassionate AI companion.

RECENT MOOD PATTERN:
${recentMoods || 'No recent moods logged'}

USER PREFERENCES:
- Relationship Mode: ${settings?.relationship_mode || 'friend'}
- Tone: ${settings?.tone_preference || 'warm_and_affectionate'}

Generate 5 PERSONALIZED recommendations for ${userName} right now.
Mix of:
- Meditations (specific guided meditations)
- Affirmations (powerful, personal affirmations)
- Breathing exercises (specific techniques)
- Activities (gentle, meaningful activities)
- Reflections (journaling prompts)

Return JSON:
[
  {
    "type": "meditation" | "affirmation" | "breathing" | "activity" | "reflection",
    "title": "Brief title",
    "content": "The actual content/instruction (2-3 sentences)",
    "duration": "5-10 min" (optional),
    "why_recommended": "Why this is perfect for them right now"
  }
]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  content: { type: "string" },
                  duration: { type: "string" },
                  why_recommended: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(response.recommendations || []);
      toast.success('Recommendations generated! 💜');

    } catch (error) {
      console.error('Recommendation error:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const typeIcons = {
    meditation: Wind,
    affirmation: Heart,
    breathing: Brain,
    activity: Sunrise,
    reflection: BookOpen
  };

  const typeColors = {
    meditation: 'from-blue-500 to-cyan-500',
    affirmation: 'from-pink-500 to-rose-500',
    breathing: 'from-purple-500 to-indigo-500',
    activity: 'from-green-500 to-emerald-500',
    reflection: 'from-orange-500 to-amber-500'
  };

  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.type === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">
            Get Personalized Recommendations
          </h3>
          <p className="text-purple-100 mb-4">
            Based on your recent moods and preferences
          </p>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            variant="secondary"
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Category Filter */}
      {recommendations.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All
          </Button>
          {['meditation', 'affirmation', 'breathing', 'activity', 'reflection'].map(type => (
            <Button
              key={type}
              onClick={() => setSelectedCategory(type)}
              variant={selectedCategory === type ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredRecommendations.map((rec, idx) => {
          const Icon = typeIcons[rec.type] || Sparkles;
          const gradient = typeColors[rec.type] || 'from-gray-400 to-gray-500';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <Badge className={`bg-gradient-to-r ${gradient} text-white mb-2`}>
                        {rec.type}
                      </Badge>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {rec.title}
                      </h4>
                      {rec.duration && (
                        <p className="text-xs text-gray-500 mt-1">
                          ⏱️ {rec.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">
                    {rec.content}
                  </p>

                  {rec.why_recommended && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-sm text-purple-900">
                        <strong>Why this for you:</strong> {rec.why_recommended}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4 gap-2"
                    variant="outline"
                  >
                    <Play className="w-4 h-4" />
                    Try This Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {recommendations.length === 0 && !isGenerating && (
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Recommendations Yet
            </h3>
            <p className="text-gray-600">
              Click "Generate Recommendations" to get personalized suggestions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}