import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, BookOpen, Trophy, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

const storyPrompts = {
  1: [
    "Write about your favorite animal and what it does all day",
    "Tell a story about a magical tree in your backyard",
    "What happens when you find a talking toy?"
  ],
  2: [
    "Describe an adventure you had with a friend",
    "Write about a time you helped someone",
    "Imagine you could fly - where would you go?"
  ],
  3: [
    "Create a story with a problem that needs solving",
    "Write about a character who learns something important",
    "Tell a story that takes place in a different time period"
  ]
};

export default function MontessoriStories({ progress, onComplete, childAge, childName }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [userStory, setUserStory] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');

  const level = progress?.level || 1;
  const storiesCreated = progress?.stories_created || 0;
  const prompts = storyPrompts[level] || storyPrompts[1];

  const generateAIFeedback = async () => {
    if (!userStory.trim()) return;

    setIsGeneratingFeedback(true);

    try {
      const feedbackPrompt = `You are an encouraging Montessori teacher for a ${childAge}-year-old child named ${childName}. 

They just wrote this story:
"""
${userStory}
"""

Provide warm, encouraging feedback that:
1. Celebrates what they did well (creativity, word choice, ideas)
2. Asks 1-2 curious questions to extend their thinking
3. Suggests one gentle improvement (if appropriate for their age)
4. Encourages them to keep writing

Keep it warm, age-appropriate, and under 100 words. Use simple language and lots of encouragement!`;

      const feedback = await base44.integrations.Core.InvokeLLM({
        prompt: feedbackPrompt
      });

      setAiFeedback(feedback);
      
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      onComplete({ score: 100, skillLearned: 'creative_writing' });
      
    } catch (error) {
      console.error('Error generating feedback:', error);
      setAiFeedback("What a wonderful story! I love your creativity! Keep writing amazing stories! 🌟");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const startNewStory = () => {
    setSelectedPrompt(null);
    setUserStory('');
    setStoryTitle('');
    setAiFeedback('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-orange-700 mb-2">Creative Writing - Level {level}</h2>
        <p className="text-gray-600">Stories Created: {storiesCreated}</p>
      </div>

      {!selectedPrompt && !aiFeedback ? (
        /* Prompt Selection */
        <div>
          <p className="text-xl font-semibold text-gray-900 text-center mb-6">
            Choose a story prompt to get started!
          </p>
          <div className="grid gap-4">
            {prompts.map((prompt, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer border-2 border-orange-300 hover:border-orange-500 transition-all"
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  <CardContent className="p-6">
                    <p className="text-lg text-gray-800">{prompt}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : !aiFeedback ? (
        /* Story Writing */
        <Card className="border-4 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-8">
            <div className="mb-6">
              <Badge className="bg-orange-100 text-orange-800 mb-4">
                <BookOpen className="w-4 h-4 mr-1" />
                Your Story Prompt
              </Badge>
              <p className="text-lg text-gray-800 italic">"{selectedPrompt}"</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Story Title:
                </label>
                <Input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Give your story a title..."
                  className="text-lg border-2 border-orange-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Story:
                </label>
                <Textarea
                  value={userStory}
                  onChange={(e) => setUserStory(e.target.value)}
                  placeholder="Once upon a time..."
                  className="min-h-[300px] text-lg border-2 border-orange-200 leading-relaxed"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateAIFeedback}
                  disabled={!userStory.trim() || isGeneratingFeedback}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-6"
                >
                  {isGeneratingFeedback ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      AI is Reading...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Get AI Feedback
                    </>
                  )}
                </Button>
                <Button
                  onClick={startNewStory}
                  variant="outline"
                >
                  Different Prompt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* AI Feedback Display */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 mb-6">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  Story Complete! 🎉
                </h3>
                {storyTitle && (
                  <p className="text-xl font-semibold text-gray-800 mb-4">
                    "{storyTitle}"
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-6 border-2 border-green-200 mb-6">
                <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Teacher Feedback:
                </p>
                <p className="text-gray-800 leading-relaxed">{aiFeedback}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200 mb-6">
                <p className="text-sm font-semibold text-purple-700 mb-2">Your Story:</p>
                <p className="text-gray-700 italic leading-relaxed">{userStory}</p>
              </div>

              <Button
                onClick={startNewStory}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Write Another Story
              </Button>
            </CardContent>
          </Card>

          {/* Stories Created Badge */}
          <div className="text-center">
            <Badge className="bg-orange-100 text-orange-800 px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Total Stories Created: {storiesCreated + 1}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}