import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Sparkles, Save, RefreshCw, BookOpen, Loader2, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const PROMPT_CATEGORIES = [
  { id: 'adventure', emoji: '🗺️', label: 'Adventure', color: 'from-blue-400 to-cyan-500' },
  { id: 'fantasy', emoji: '🦄', label: 'Fantasy', color: 'from-purple-400 to-pink-500' },
  { id: 'mystery', emoji: '🔍', label: 'Mystery', color: 'from-gray-600 to-purple-600' },
  { id: 'funny', emoji: '😄', label: 'Funny', color: 'from-yellow-400 to-orange-500' },
  { id: 'animals', emoji: '🐾', label: 'Animals', color: 'from-green-400 to-emerald-500' },
  { id: 'space', emoji: '🚀', label: 'Space', color: 'from-indigo-500 to-purple-600' }
];

export default function CreativeWritingPrompts({ onComplete, childName = "friend", childAge = 6 }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [userStory, setUserStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setWordCount(userStory.trim().split(/\s+/).filter(w => w).length);
  }, [userStory]);

  const generatePrompt = async (category) => {
    setIsGenerating(true);
    setSelectedCategory(category);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a fun, creative writing prompt for a ${childAge}-year-old child who loves ${category.label} stories.

The prompt should:
1. Be exciting and age-appropriate
2. Include specific characters, settings, or situations
3. Be about 2-3 sentences
4. Spark imagination
5. Be simple enough for a ${childAge}-year-old to understand

Just return the prompt text, nothing else.`,
        add_context_from_internet: false
      });

      setCurrentPrompt(response);
      toast.success('New prompt ready! ✨');
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Could not generate prompt. Try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveStory = () => {
    if (userStory.trim().length < 10) {
      toast.error('Write at least a few words before saving!');
      return;
    }

    const story = {
      id: Date.now(),
      category: selectedCategory.label,
      prompt: currentPrompt,
      story: userStory,
      wordCount,
      date: new Date().toISOString()
    };

    setSavedStories([story, ...savedStories]);
    
    const points = wordCount >= 50 ? 20 : wordCount >= 25 ? 15 : 10;
    toast.success(`Story saved! You wrote ${wordCount} words! ✨`);
    
    if (onComplete) onComplete(points, null);

    setUserStory('');
    setCurrentPrompt('');
    setSelectedCategory(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-3xl font-bold text-center text-purple-800 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8" />
            Creative Writing Prompts
            <Sparkles className="w-8 h-8" />
          </h3>

          {!currentPrompt ? (
            <div className="space-y-4">
              <p className="text-center text-gray-700 font-semibold text-lg">
                Pick a story type to get started!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PROMPT_CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => generatePrompt(cat)}
                    disabled={isGenerating}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
                  >
                    <div className="text-5xl mb-2">{cat.emoji}</div>
                    <div className="font-bold text-lg">{cat.label}</div>
                  </motion.button>
                ))}
              </div>

              {isGenerating && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-3" />
                  <p className="text-purple-700 font-bold">Creating your prompt...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border-4 border-purple-300 shadow-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl">{selectedCategory.emoji}</div>
                  <div>
                    <Badge className={`bg-gradient-to-r ${selectedCategory.color} text-white mb-2`}>
                      {selectedCategory.label} Story
                    </Badge>
                    <p className="text-lg text-gray-800 leading-relaxed font-medium">
                      {currentPrompt}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => generatePrompt(selectedCategory)}
                  variant="outline"
                  size="sm"
                  className="border-purple-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Get Different Prompt
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-800">Write Your Story:</label>
                  <Badge variant="outline" className="text-sm">
                    {wordCount} words
                  </Badge>
                </div>
                <textarea
                  value={userStory}
                  onChange={(e) => setUserStory(e.target.value)}
                  placeholder="Once upon a time..."
                  className="w-full h-64 p-4 border-4 border-purple-300 rounded-xl text-lg resize-none focus:border-purple-500 focus:outline-none font-sans"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setCurrentPrompt('');
                    setUserStory('');
                    setSelectedCategory(null);
                  }}
                  variant="outline"
                  className="flex-1 border-gray-400"
                >
                  Pick New Category
                </Button>
                <Button
                  onClick={saveStory}
                  disabled={userStory.trim().length < 10}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Story!
                </Button>
              </div>

              {wordCount >= 50 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center p-4 bg-yellow-100 rounded-xl border-2 border-yellow-400"
                >
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-bold text-yellow-800">
                    Amazing! You wrote over 50 words! 🌟
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {savedStories.length > 0 && !currentPrompt && (
            <div className="mt-6 pt-6 border-t-4 border-purple-200">
              <h4 className="font-bold text-xl text-purple-800 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Your Saved Stories ({savedStories.length})
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {savedStories.map((story) => (
                  <div key={story.id} className="p-4 bg-white rounded-lg border-2 border-purple-200">
                    <Badge className="mb-2">{story.category}</Badge>
                    <p className="text-sm text-gray-700 line-clamp-3">{story.story}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {story.wordCount} words • {new Date(story.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}