import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Brain, Copy, CheckCircle, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIQuizGenerator({ onAddToModule }) {
  const [lessonContent, setLessonContent] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('mixed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const handleGenerate = async () => {
    if (!lessonContent.trim()) {
      toast.error('Please enter lesson content');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Based on the following lesson content, create ${questionCount} multiple-choice quiz questions.

Lesson Content:
${lessonContent}

Difficulty Level: ${difficulty}

Generate questions that test understanding of the key concepts. For each question, provide:
1. The question text
2. 4 answer options (labeled A, B, C, D)
3. The correct answer (indicate which letter)
4. A brief explanation of why that's the correct answer

Make the questions engaging and educational. Mix different types (recall, application, analysis).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedQuiz(response.questions || []);
      toast.success(`${response.questions?.length || 0} questions generated! 🎉`);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedQuiz) {
      const quizText = generatedQuiz.map((q, idx) => 
        `Question ${idx + 1}: ${q.question}\n` +
        q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n') +
        `\nCorrect Answer: ${String.fromCharCode(65 + q.correct_answer)}\n` +
        `Explanation: ${q.explanation}\n`
      ).join('\n---\n\n');
      
      navigator.clipboard.writeText(quizText);
      toast.success('Quiz copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lesson Content *</label>
            <Textarea
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Paste your lesson content here (text, transcript, or key points)..."
              rows={8}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <Input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                min="3"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !lessonContent.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Quiz Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQuiz && generatedQuiz.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Generated Quiz ({generatedQuiz.length} Questions)
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  {onAddToModule && (
                    <Button
                      onClick={() => {
                        onAddToModule(generatedQuiz);
                        toast.success('Quiz added to module!');
                      }}
                      size="sm"
                      className="bg-green-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Module
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {generatedQuiz.map((question, idx) => (
                  <Card key={idx} className="bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-900 mb-3">
                        Question {idx + 1}: {question.question}
                      </h4>
                      <div className="space-y-2 mb-3">
                        {question.options?.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg ${
                              optIdx === question.correct_answer
                                ? 'bg-green-100 border-2 border-green-500'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <span className="font-semibold">{String.fromCharCode(65 + optIdx)}.</span> {option}
                            {optIdx === question.correct_answer && (
                              <Badge className="ml-2 bg-green-600 text-white">Correct</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
                        <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-800">{question.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}