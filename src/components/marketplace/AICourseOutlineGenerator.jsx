import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AICourseOutlineGenerator({ onUseOutline }) {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [courseGoals, setCourseGoals] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a course topic');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a comprehensive course outline for the following:

Topic: ${topic}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${courseGoals ? `Course Goals: ${courseGoals}` : ''}

Generate a detailed course structure with:
1. A compelling course title and tagline
2. A course description (3-4 sentences)
3. 5-8 modules, each with:
   - Module title
   - Module description
   - 3-5 lesson topics per module
4. Overall learning outcomes (5-7 points)
5. Target audience description
6. Prerequisites (if any)
7. Suggested course duration

Format the response as a well-structured plan that's ready to implement.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedOutline(response);
      toast.success('Course outline generated! 🎉');
    } catch (error) {
      console.error('Failed to generate outline:', error);
      toast.error('Failed to generate outline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedOutline) {
      navigator.clipboard.writeText(generatedOutline);
      toast.success('Copied to clipboard!');
    }
  };

  const handleUse = () => {
    if (generatedOutline && onUseOutline) {
      onUseOutline(generatedOutline);
      toast.success('Outline applied to course!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI Course Outline Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course Topic *</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Mindfulness for Beginners, Advanced Grief Processing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Audience (Optional)</label>
            <Input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Working professionals, Parents, Teens"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Course Goals (Optional)</label>
            <Textarea
              value={courseGoals}
              onChange={(e) => setCourseGoals(e.target.value)}
              placeholder="What should students be able to do after completing this course?"
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Course Outline...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Course Outline
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedOutline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Generated Course Outline
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={handleUse} size="sm" className="bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Use This Outline
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {generatedOutline}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}