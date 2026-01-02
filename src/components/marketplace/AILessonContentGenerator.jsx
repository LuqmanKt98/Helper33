import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, CheckCircle, Loader2, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AILessonContentGenerator({ onUseContent }) {
  const [lessonTitle, setLessonTitle] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [targetDuration, setTargetDuration] = useState(15);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleGenerate = async () => {
    if (!lessonTitle.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create comprehensive lesson content for an online course.

Lesson Title: ${lessonTitle}
${learningObjectives ? `Learning Objectives: ${learningObjectives}` : ''}
Target Duration: ${targetDuration} minutes
Difficulty Level: ${difficulty}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate a complete, engaging lesson that includes:

1. **Introduction** (engaging hook that captures attention)
2. **Core Content** (well-structured main teaching points with explanations, examples, and analogies)
3. **Practical Applications** (how students can apply this in real life)
4. **Key Takeaways** (3-5 main points to remember)
5. **Reflection Questions** (2-3 questions for students to think about)
6. **Next Steps** (what to do after completing this lesson)

Make the content:
- Clear and easy to understand
- Engaging with real-world examples
- Appropriate for ${difficulty} level learners
- Structured for a ${targetDuration}-minute learning session
- Action-oriented and practical
- Supportive and encouraging in tone

Format the lesson in a way that's ready to copy into a course platform.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setGeneratedContent(response);
      toast.success('Lesson content generated! 📚');
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast.success('Content copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            AI Lesson Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lesson Title *</label>
            <Input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g., Understanding Mindful Breathing Techniques"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Learning Objectives (Optional)</label>
            <Textarea
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              placeholder="What should students be able to do after this lesson? (e.g., 'Practice 3 different breathing techniques, Understand the science behind breath work')"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Input
                type="number"
                value={targetDuration}
                onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                min="5"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Additional Context (Optional)</label>
            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any specific examples, theories, or approaches you want included..."
              rows={2}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !lessonTitle.trim()}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Lesson Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Full Lesson
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Generated Lesson Content
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  {onUseContent && (
                    <Button
                      onClick={() => {
                        onUseContent(generatedContent);
                        toast.success('Content applied!');
                      }}
                      size="sm"
                      className="bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Use This Content
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {generatedContent}
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  ~{generatedContent.split(' ').filter(w => w).length} words
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  ~{Math.ceil(generatedContent.split(' ').filter(w => w).length / 200)} min read
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}