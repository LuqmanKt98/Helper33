
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Wand2, TrendingUp, Target, Star, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AIActivitySuggestions({ 
  childAge, 
  childName, 
  completedActivities = [],
  onActivitySelect 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Fetch child progress for personalized suggestions
  const { data: childProgress } = useQuery({
    queryKey: ['childProgress'],
    queryFn: async () => {
      try {
        const allProgress = await base44.entities.ChildProgress.list();
        // Assuming there's only one child progress record for simplicity, or we need to filter by childId
        return allProgress[0]; 
      } catch (error) {
        console.error("Error fetching child progress:", error);
        return null;
      }
    }
  });

  useEffect(() => {
    // Only generate suggestions if childProgress is available, suggestions are meant to be shown, and no suggestions are currently displayed
    if (childProgress && showSuggestions && suggestions.length === 0 && !isGenerating) {
      generatePersonalizedSuggestions();
    }
  }, [childProgress, showSuggestions, suggestions.length, isGenerating]); // Added isGenerating to dependency array

  const generatePersonalizedSuggestions = async () => {
    setIsGenerating(true);
    setSuggestions([]); // Clear previous suggestions when regenerating

    try {
      // Build comprehensive context
      let context = `Child: ${childName}, Age: ${childAge}\n`;
      
      if (childProgress) {
        // Learning gaps and struggles - with null checks
        const struggles = Object.entries(childProgress.module_progress || {})
          .flatMap(([module, data]) => {
            // CRITICAL: Check if data exists and has struggling_with
            if (!data || !data.struggling_with) return [];
            return data.struggling_with.map(concept => `${module}: ${concept}`);
          })
          .filter(Boolean); // Remove any null/undefined values
        
        if (struggles.length > 0) {
          context += `Learning Gaps: ${struggles.join(', ')}\n`;
        }

        // Strengths to leverage
        if (childProgress.strengths?.length > 0) {
          context += `Strengths: ${childProgress.strengths.join(', ')}\n`;
        }

        // Interests to incorporate
        if (childProgress.interests?.length > 0) {
          context += `Interests: ${childProgress.interests.join(', ')}\n`;
        }

        // Parent-set focus areas (PRIORITY)
        if (childProgress.focus_areas?.length > 0) {
          context += `Parent Focus Areas (HIGH PRIORITY): ${childProgress.focus_areas.join(', ')}\n`;
        }

        // Active learning goals from Parent Dashboard
        const activeGoals = childProgress.learning_goals?.filter(g => g.status === 'active') || [];
        if (activeGoals.length > 0) {
          context += `Active Goals from Parent Dashboard:\n`;
          activeGoals.forEach(goal => {
            context += `  - ${goal.description} (${goal.progress_percentage || 0}% complete, target: ${goal.target_date})\n`;
          });
        }

        // Recent achievements for encouragement
        if (childProgress.achievements?.length > 0) {
          const recentAchievements = childProgress.achievements.slice(0, 3).map(a => a.achievement_name).join(', ');
          context += `Recent Achievements: ${recentAchievements}\n`;
        }

        // What they've been doing this week
        if (childProgress.weekly_summary?.favorite_activity) {
          context += `Favorite Activity This Week: ${childProgress.weekly_summary.favorite_activity}\n`;
        }

        // Recently completed activities
        if (completedActivities.length > 0) {
          context += `Just Completed: ${completedActivities.slice(-3).join(', ')}\n`;
        }
      }

      const prompt = `You are an AI learning advisor helping ${childName}.

COMPREHENSIVE LEARNING DATA:
${context}

TASK: Suggest 3 SPECIFIC activities from Kids Creative Studio that will:
1. ADDRESS PARENT-SET GOALS - Prioritize focus areas and active goals from Parent Dashboard
2. CLOSE LEARNING GAPS - Target identified struggles
3. LEVERAGE STRENGTHS - Build on what they're good at
4. INCORPORATE INTERESTS - Make learning fun using their interests
5. PROVIDE PROGRESSION - Suggest next logical steps in their journey

Available activities:
- Homework Helper (age 5+) - Math, reading, general homework
- My Feelings Journal (age 4+) - Emotional expression
- Gratitude Game (age 3+) - Positive thinking
- AI Story Creator (age 4+) - Creative writing
- Digital Coloring Book (age 3+) - Fine motor skills, creativity
- Fun Calculator (age 6+) - Math practice
- Letter & Shape Tracing (age 3+) - Writing skills
- Sticker Collection (age 2+) - Rewards review

For EACH suggestion, explain:
- Why it helps with their SPECIFIC goals
- How it addresses their learning gaps
- What achievement/goal progress it supports

Return JSON:
{
  "suggestions": [
    {
      "activity_name": "exact activity name from list",
      "priority": "critical|high|medium",
      "reason": "why this is perfect for them RIGHT NOW",
      "goal_connection": "which parent goal or learning gap this addresses",
      "expected_outcome": "what skill/concept they'll improve",
      "motivation": "encouraging message referencing past achievements"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activity_name: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" },
                  goal_connection: { type: "string" },
                  expected_outcome: { type: "string" },
                  motivation: { type: "string" }
                },
                required: ["activity_name", "priority", "reason", "goal_connection", "expected_outcome", "motivation"] // Added required fields for better type enforcement
              }
            }
          },
          required: ["suggestions"]
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Could not generate suggestions');
    }

    setIsGenerating(false);
  };

  if (!showSuggestions) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl border-4 border-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="w-8 h-8" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold">Perfect Activities for You, {childName}!</h3>
                  <p className="text-sm text-purple-100">
                    Based on your goals, interests, and what you're learning
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => generatePersonalizedSuggestions()}
                  disabled={isGenerating}
                  className="text-white hover:bg-white/20"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowSuggestions(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {isGenerating ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="w-12 h-12 mx-auto mb-3" />
                </motion.div>
                <p className="text-white">Creating perfect activities just for you...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    // Clicks on the entire card should select the activity, but the button should stop propagation
                    onClick={() => onActivitySelect(suggestion.activity_name)}
                    className="bg-white/95 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {suggestion.priority === 'critical' && (
                          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {suggestion.priority === 'high' && (
                          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {suggestion.priority === 'medium' && (
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-800 text-lg">{suggestion.activity_name}</h4>
                          <Badge className={
                            suggestion.priority === 'critical' ? 'bg-red-500 hover:bg-red-500/80' :
                            suggestion.priority === 'high' ? 'bg-orange-500 hover:bg-orange-500/80' :
                            'bg-blue-500 hover:bg-blue-500/80'
                          }>
                            {suggestion.priority}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{suggestion.motivation}</p>

                        {suggestion.goal_connection && (
                          <div className="bg-purple-50 rounded-lg p-2 mb-2">
                            <div className="flex items-center gap-1 text-xs text-purple-700">
                              <Target className="w-3 h-3" />
                              <span className="font-semibold">Goal:</span>
                              <span>{suggestion.goal_connection}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-600" />
                          <span><strong>Will help:</strong> {suggestion.expected_outcome}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card's onClick from firing
                        onActivitySelect(suggestion.activity_name);
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try This Now!
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
