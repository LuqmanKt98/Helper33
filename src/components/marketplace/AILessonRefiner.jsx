import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2, Copy, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AILessonRefiner({ onUseRefined }) {
  const [originalText, setOriginalText] = useState('');
  const [refinementGoal, setRefinementGoal] = useState('clarity');
  const [targetTone, setTargetTone] = useState('professional_warm');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedText, setRefinedText] = useState(null);

  const handleRefine = async () => {
    if (!originalText.trim()) {
      toast.error('Please enter text to refine');
      return;
    }

    setIsRefining(true);
    try {
      const goalDescriptions = {
        clarity: 'Make the text clearer and easier to understand',
        engagement: 'Make the text more engaging and interesting',
        simplify: 'Simplify the language for beginners',
        elaborate: 'Expand and elaborate on the concepts',
        restructure: 'Restructure for better flow and organization'
      };

      const toneDescriptions = {
        professional_warm: 'professional yet warm and approachable',
        casual_friendly: 'casual and friendly',
        empathetic_supportive: 'empathetic and supportive',
        motivational_inspiring: 'motivational and inspiring',
        academic_formal: 'academic and formal'
      };

      const prompt = `Refine the following lesson content.

Original Text:
${originalText}

Goal: ${goalDescriptions[refinementGoal]}
Tone: ${toneDescriptions[targetTone]}

Please:
1. Improve clarity and readability
2. Ensure the tone is ${toneDescriptions[targetTone]}
3. ${goalDescriptions[refinementGoal]}
4. Maintain the core educational value
5. Keep important details and examples

Return the refined version that's ready to use in a course.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setRefinedText(response);
      toast.success('Text refined! ✨');
    } catch (error) {
      console.error('Failed to refine text:', error);
      toast.error('Failed to refine text. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = () => {
    if (refinedText) {
      navigator.clipboard.writeText(refinedText);
      toast.success('Copied to clipboard!');
    }
  };

  const handleUse = () => {
    if (refinedText && onUseRefined) {
      onUseRefined(refinedText);
      toast.success('Refined text applied!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Lesson Text Refiner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Original Lesson Text *</label>
            <Textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste your lesson text here..."
              rows={10}
            />
            <p className="text-xs text-gray-600 mt-1">
              {originalText.split(' ').filter(w => w).length} words
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Refinement Goal</label>
              <select
                value={refinementGoal}
                onChange={(e) => setRefinementGoal(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="clarity">Improve Clarity</option>
                <option value="engagement">Increase Engagement</option>
                <option value="simplify">Simplify Language</option>
                <option value="elaborate">Add More Detail</option>
                <option value="restructure">Better Structure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Tone</label>
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="professional_warm">Professional & Warm</option>
                <option value="casual_friendly">Casual & Friendly</option>
                <option value="empathetic_supportive">Empathetic & Supportive</option>
                <option value="motivational_inspiring">Motivational & Inspiring</option>
                <option value="academic_formal">Academic & Formal</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleRefine}
            disabled={isRefining || !originalText.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refining Text...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Refine Lesson Text
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {refinedText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-4"
        >
          <Card className="bg-white border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Original Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{originalText}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  Refined Text
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  {onUseRefined && (
                    <Button onClick={handleUse} size="sm" className="bg-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Use This
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{refinedText}</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {refinedText.split(' ').filter(w => w).length} words
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}