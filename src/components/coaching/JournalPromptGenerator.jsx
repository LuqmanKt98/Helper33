
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { PenTool, Sparkles, RefreshCw, Heart, Copy, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function JournalPromptGenerator({ 
  coachType = 'grief_coach',
  supportCoachId = null,
  userMood = null,
  recentEntries = [],
  onSave 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPrompts([]);
    setSelectedPrompt(null);

    try {
      const recentThemes = recentEntries
        ?.slice(0, 5)
        .map(e => e.content?.substring(0, 100))
        .join('; ') || 'No recent entries';

      const moodContext = userMood ? `Current mood: ${userMood}` : '';

      const prompt = `You are an expert ${coachType === 'grief_coach' ? 'grief counselor' : 'life coach'} creating therapeutic journaling prompts.

${moodContext}

Recent journal themes (last 5 entries): ${recentThemes}

Create 5 unique, deeply therapeutic journaling prompts that:
- Are personalized based on their recent themes and current mood
- ${coachType === 'grief_coach' ? 'Help process grief, honor memories, and find healing' : 'Encourage self-discovery, goal clarity, and personal growth'}
- Are open-ended and thought-provoking
- Encourage honest self-reflection
- Are compassionate and gentle in tone
- Build on previous insights while exploring new angles

Return your response as a JSON array with this exact structure:
[
  {
    "prompt": "The actual journaling prompt question",
    "focus": "Brief focus area (e.g., 'Processing Loss', 'Finding Strength')",
    "why": "Why this prompt is helpful right now (1-2 sentences)"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  focus: { type: "string" },
                  why: { type: "string" }
                }
              }
            }
          }
        }
      });

      const promptsArray = response.prompts || [];
      setPrompts(promptsArray);
      toast.success(`✨ ${promptsArray.length} personalized prompts created!`);
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast.error('Failed to generate prompts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = async (promptData) => {
    try {
      await base44.entities.SavedCoachingInteraction.create({
        coach_type: coachType,
        support_coach_id: supportCoachId,
        interaction_type: 'journal_prompt',
        title: promptData.focus,
        content: promptData.prompt + '\n\n' + promptData.why,
        context_mood: userMood,
        context_tags: [promptData.focus.toLowerCase().replace(/\s+/g, '_')],
        is_favorite: true,
        last_accessed: new Date().toISOString()
      });

      if (onSave) onSave();
      toast.success('💜 Prompt saved to favorites!');
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleCopyPrompt = (promptText) => {
    navigator.clipboard.writeText(promptText);
    toast.success('Prompt copied!');
  };

  return (
    <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-pink-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Custom Journal Prompts</h3>
            <p className="text-sm text-gray-600 font-normal">Personalized based on your mood & history</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {userMood && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-900">Current Mood:</strong> {userMood}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Prompts will be tailored to support how you're feeling right now
            </p>
          </div>
        )}

        {recentEntries?.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
            <p className="text-sm text-gray-700">
              <strong className="text-purple-900">Recent Themes Detected:</strong> Based on your last {recentEntries.length} journal entries
            </p>
            <p className="text-xs text-gray-600 mt-1">
              AI will build on your previous reflections while exploring new perspectives
            </p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-6 text-lg shadow-xl"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Creating Personalized Prompts...
            </>
          ) : (
            <>
              <PenTool className="w-5 h-5 mr-2" />
              Generate Journal Prompts
            </>
          )}
        </Button>

        {/* Generated Prompts */}
        <AnimatePresence>
          {prompts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">Your Personalized Prompts</h4>
                <Badge className="bg-purple-100 text-purple-800">
                  {prompts.length} prompts
                </Badge>
              </div>

              <div className="space-y-3">
                {prompts.map((promptData, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                        {promptData.focus}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyPrompt(promptData.prompt)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSavePrompt(promptData)}
                          className="text-pink-600 hover:text-pink-800"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-lg font-semibold text-gray-900 mb-3 leading-relaxed">
                      {promptData.prompt}
                    </p>

                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-sm text-purple-900">
                        <strong>Why this helps:</strong> {promptData.why}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Link to={createPageUrl('JournalStudio')}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Start Journaling
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                variant="outline"
                className="w-full bg-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Prompts
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
