import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Brain, Sparkles, ArrowRight, Heart, Copy, RefreshCw, Lightbulb, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ThoughtReframingTool({ 
  coachType = 'grief_coach',
  supportCoachId = null,
  userMood = null,
  onSave 
}) {
  const [negativeThought, setNegativeThought] = useState('');
  const [isReframing, setIsReframing] = useState(false);
  const [reframedThoughts, setReframedThoughts] = useState(null);

  const handleReframe = async () => {
    if (!negativeThought.trim()) {
      toast.error('Please enter a thought to reframe');
      return;
    }

    setIsReframing(true);
    setReframedThoughts(null);

    try {
      const prompt = `You are an expert ${coachType === 'grief_coach' ? 'grief counselor' : 'life coach'} skilled in cognitive reframing and compassionate thought work.

The user is experiencing this thought or belief:
"${negativeThought}"

${userMood ? `Their current mood: ${userMood}\n` : ''}

Your task:
1. Acknowledge the thought with compassion (don't dismiss or minimize it)
2. Identify the cognitive distortion if present (e.g., all-or-nothing thinking, catastrophizing, etc.)
3. Provide 3 different reframed perspectives:
   - A compassionate reframe (gentle, self-compassionate version)
   - A realistic reframe (balanced, evidence-based version)  
   - An empowering reframe (growth-oriented, strength-focused version)
4. Offer a gentle action step they can take

${coachType === 'grief_coach' ? 'Remember: Grief is valid. The goal is not to eliminate sadness but to find a way to hold it with more compassion.' : 'Focus on growth mindset, personal agency, and realistic optimism.'}

Return your response as JSON with this exact structure:
{
  "acknowledgment": "Compassionate validation of their thought",
  "cognitive_pattern": "Name of cognitive distortion if present, or 'Valid emotional response'",
  "reframes": {
    "compassionate": "Gentle, self-compassionate reframe",
    "realistic": "Balanced, evidence-based reframe",
    "empowering": "Growth-oriented, strength-based reframe"
  },
  "action_step": "Small, doable action they can take",
  "affirmation": "A supportive affirmation to hold onto"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            acknowledgment: { type: "string" },
            cognitive_pattern: { type: "string" },
            reframes: {
              type: "object",
              properties: {
                compassionate: { type: "string" },
                realistic: { type: "string" },
                empowering: { type: "string" }
              }
            },
            action_step: { type: "string" },
            affirmation: { type: "string" }
          }
        }
      });

      setReframedThoughts(response);
      toast.success('✨ Thought reframing complete!');
    } catch (error) {
      console.error('Error reframing thought:', error);
      toast.error('Failed to reframe thought. Please try again.');
    } finally {
      setIsReframing(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!reframedThoughts) return;

    try {
      const content = `Original Thought: ${negativeThought}

Acknowledgment: ${reframedThoughts.acknowledgment}

Pattern: ${reframedThoughts.cognitive_pattern}

Compassionate Reframe: ${reframedThoughts.reframes.compassionate}

Realistic Reframe: ${reframedThoughts.reframes.realistic}

Empowering Reframe: ${reframedThoughts.reframes.empowering}

Action Step: ${reframedThoughts.action_step}

Affirmation: ${reframedThoughts.affirmation}`;

      await base44.entities.SavedCoachingInteraction.create({
        coach_type: coachType,
        support_coach_id: supportCoachId,
        interaction_type: 'thought_reframing',
        title: negativeThought.substring(0, 50) + '...',
        content: content,
        context_mood: userMood,
        context_tags: ['thought_reframing', reframedThoughts.cognitive_pattern.toLowerCase().replace(/\s+/g, '_')],
        is_favorite: true,
        last_accessed: new Date().toISOString()
      });

      if (onSave) onSave();
      toast.success('💜 Reframing saved to favorites!');
    } catch (error) {
      console.error('Error saving reframing:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Thought Reframing</h3>
            <p className="text-sm text-gray-600 font-normal">Transform difficult thoughts with compassion</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <strong className="text-blue-900">How it works:</strong> Share a difficult thought or belief. 
              AI will help you see it from different, more compassionate perspectives. This is a gentle CBT technique.
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">
            What thought would you like to reframe?
          </label>
          <Textarea
            value={negativeThought}
            onChange={(e) => setNegativeThought(e.target.value)}
            placeholder={coachType === 'grief_coach' 
              ? 'e.g., "I should be over this by now" or "I feel guilty for having a good day"'
              : 'e.g., "I\'m not good enough" or "I always fail at this"'
            }
            className="min-h-[120px] bg-white border-2 border-gray-200 focus:border-blue-500 text-base"
          />
          <p className="text-xs text-gray-500">
            Be honest and specific. This is a safe space for your thoughts.
          </p>
        </div>

        <Button
          onClick={handleReframe}
          disabled={isReframing || !negativeThought.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg shadow-xl"
        >
          {isReframing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Reframing Your Thought...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5 mr-2" />
              Reframe This Thought
            </>
          )}
        </Button>

        {/* Reframing Results */}
        <AnimatePresence>
          {reframedThoughts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Acknowledgment */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2">First, let's acknowledge this thought:</h5>
                    <p className="text-gray-700 leading-relaxed italic">"{reframedThoughts.acknowledgment}"</p>
                  </div>
                </div>
              </div>

              {/* Cognitive Pattern */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Pattern identified:</strong> {reframedThoughts.cognitive_pattern}
                </p>
              </div>

              {/* Three Reframes */}
              <div className="space-y-4">
                <h5 className="font-bold text-gray-900">Three Ways to See This Differently:</h5>

                {/* Compassionate */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-5 border-2 border-pink-200 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <h6 className="font-bold text-pink-900">Compassionate Perspective</h6>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(reframedThoughts.reframes.compassionate)}
                      className="ml-auto"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {reframedThoughts.reframes.compassionate}
                  </p>
                </motion.div>

                {/* Realistic */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h6 className="font-bold text-blue-900">Realistic Perspective</h6>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(reframedThoughts.reframes.realistic)}
                      className="ml-auto"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {reframedThoughts.reframes.realistic}
                  </p>
                </motion.div>

                {/* Empowering */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl p-5 border-2 border-purple-200 shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h6 className="font-bold text-purple-900">Empowering Perspective</h6>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(reframedThoughts.reframes.empowering)}
                      className="ml-auto"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {reframedThoughts.reframes.empowering}
                  </p>
                </motion.div>
              </div>

              {/* Action Step */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2">Your Action Step:</h5>
                    <p className="text-gray-700 leading-relaxed">{reframedThoughts.action_step}</p>
                  </div>
                </div>
              </div>

              {/* Affirmation */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-purple-300 text-center">
                <p className="text-sm text-purple-700 font-medium mb-2">✨ Affirmation to Carry With You ✨</p>
                <p className="text-xl font-bold text-purple-900 leading-relaxed">
                  "{reframedThoughts.affirmation}"
                </p>
              </div>

              {/* Save Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveFavorite}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save to Favorites
                </Button>

                <Button
                  onClick={() => {
                    setNegativeThought('');
                    setReframedThoughts(null);
                  }}
                  variant="outline"
                  className="bg-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reframe Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Prompts */}
        {!reframedThoughts && !isReframing && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Need ideas? Try reframing:</p>
            <div className="space-y-2">
              {(coachType === 'grief_coach' ? [
                "I should be over this by now",
                "I feel guilty for having a good day",
                "Everyone else is moving on but I can't",
                "I'm a burden to my friends and family"
              ] : [
                "I'm not good enough for this",
                "I always fail at everything",
                "Everyone is more successful than me",
                "I'll never achieve my goals"
              ]).map((example, index) => (
                <button
                  key={index}
                  onClick={() => setNegativeThought(example)}
                  className="w-full text-left text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}