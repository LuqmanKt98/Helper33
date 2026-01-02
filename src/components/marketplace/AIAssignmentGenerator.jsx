import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ClipboardList, Copy, CheckCircle, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIAssignmentGenerator({ onAddAssignment }) {
  const [lessonObjectives, setLessonObjectives] = useState('');
  const [assignmentType, setAssignmentType] = useState('project');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [numberOfAssignments, setNumberOfAssignments] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssignments, setGeneratedAssignments] = useState(null);

  const ASSIGNMENT_TYPES = [
    { value: 'project', label: 'Project-Based', description: 'Hands-on projects' },
    { value: 'written', label: 'Written Response', description: 'Essays or reflections' },
    { value: 'practical', label: 'Practical Application', description: 'Real-world practice' },
    { value: 'creative', label: 'Creative Expression', description: 'Creative output' },
    { value: 'research', label: 'Research Task', description: 'Investigation & analysis' }
  ];

  const handleGenerate = async () => {
    if (!lessonObjectives.trim()) {
      toast.error('Please enter lesson objectives');
      return;
    }

    setIsGenerating(true);
    try {
      const assignmentTypeInfo = ASSIGNMENT_TYPES.find(t => t.value === assignmentType);

      const prompt = `Create ${numberOfAssignments} assignment prompts for an online course lesson.

Lesson Objectives:
${lessonObjectives}

Assignment Type: ${assignmentTypeInfo?.label} (${assignmentTypeInfo?.description})
Difficulty Level: ${difficulty}

For each assignment, provide:

1. **Assignment Title** (clear and engaging)
2. **Objective** (what students will demonstrate or achieve)
3. **Instructions** (step-by-step, clear and detailed)
4. **Deliverables** (what students should submit)
5. **Evaluation Criteria** (how it will be graded - 3-5 criteria)
6. **Estimated Time** (how long it should take)
7. **Resources Needed** (materials, tools, or references)
8. **Success Example** (what a great submission looks like)

Make assignments:
- Aligned with the lesson objectives
- Practical and applicable to real-world scenarios
- Appropriate for ${difficulty} level learners
- Engaging and meaningful
- Clear with specific success criteria

Format each assignment clearly and ready to use.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setGeneratedAssignments(response);
      toast.success(`${numberOfAssignments} assignments generated! 📋`);
    } catch (error) {
      console.error('Failed to generate assignments:', error);
      toast.error('Failed to generate assignments. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedAssignments) {
      navigator.clipboard.writeText(generatedAssignments);
      toast.success('Assignments copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-rose-600" />
            AI Assignment Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lesson Objectives *</label>
            <Textarea
              value={lessonObjectives}
              onChange={(e) => setLessonObjectives(e.target.value)}
              placeholder="What should students be able to do after this lesson? (e.g., 'Apply mindfulness techniques in daily life', 'Identify stress triggers')"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Assignment Type</label>
            <div className="grid grid-cols-1 gap-2">
              {ASSIGNMENT_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setAssignmentType(type.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    assignmentType === type.value
                      ? 'border-rose-500 bg-rose-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Number of Assignments</label>
              <Input
                type="number"
                value={numberOfAssignments}
                onChange={(e) => setNumberOfAssignments(parseInt(e.target.value))}
                min="1"
                max="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
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

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !lessonObjectives.trim()}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Assignments...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Assignment Prompts
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedAssignments && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Generated Assignments
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  {onAddAssignment && (
                    <Button
                      onClick={() => {
                        onAddAssignment(generatedAssignments);
                        toast.success('Assignments added!');
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
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {generatedAssignments}
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-rose-100 text-rose-800">
                  {numberOfAssignments} Assignment{numberOfAssignments > 1 ? 's' : ''}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {ASSIGNMENT_TYPES.find(t => t.value === assignmentType)?.label}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  {difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}