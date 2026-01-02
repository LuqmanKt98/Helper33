import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  GraduationCap, Sparkles, BookOpen, Target, Lightbulb, FileText, Download, Copy, CheckCircle,
  Clock, Users, Brain, Loader2, Wand2, BookMarked, PenTool
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function LessonPlanGenerator() {
  const [formData, setFormData] = useState({
    subject: '',
    gradeLevel: '',
    topic: '',
    duration: '',
    learningObjectives: '',
    studentNeeds: '',
    resources: '',
    standards: ''
  });
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);

  const generatePlanMutation = useMutation({
    mutationFn: async (data) => {
      const prompt = `You are an expert educator creating a comprehensive lesson plan.

**Subject:** ${data.subject}
**Grade Level:** ${data.gradeLevel}
**Topic:** ${data.topic}
**Duration:** ${data.duration} minutes
**Learning Objectives:** ${data.learningObjectives}
**Student Needs/Accommodations:** ${data.studentNeeds || 'None specified'}
**Available Resources:** ${data.resources || 'Standard classroom resources'}
**Standards to Address:** ${data.standards || 'General curriculum standards'}

Create a detailed, engaging lesson plan that includes:

1. **Lesson Title & Overview** (brief, engaging summary)
2. **Learning Objectives** (specific, measurable, aligned with standards)
3. **Materials Needed** (complete list)
4. **Pre-Assessment** (how to gauge prior knowledge)
5. **Lesson Introduction/Hook** (5-10 min engaging opener)
6. **Direct Instruction** (main teaching content with timing)
7. **Guided Practice** (teacher-led practice activities)
8. **Independent Practice** (student work time)
9. **Differentiation Strategies** (for various learning needs)
10. **Assessment Methods** (formative and summative)
11. **Closure/Exit Ticket** (how to wrap up)
12. **Extension Activities** (for early finishers or enrichment)
13. **Homework/Follow-up** (optional reinforcement)
14. **Reflection Questions** (for teacher to consider)

Make it practical, engaging, and ready to use. Include specific examples, questions to ask students, and timing for each section.

Format using clear markdown with headers, bullet points, and organized sections.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      return {
        content: response,
        metadata: {
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          topic: data.topic,
          duration: data.duration,
          generatedAt: new Date().toISOString()
        }
      };
    },
    onSuccess: (data) => {
      setGeneratedPlan(data);
      toast.success('✨ Lesson plan generated successfully!');
    },
    onError: () => {
      toast.error('Failed to generate lesson plan. Please try again.');
    }
  });

  const handleGenerate = () => {
    if (!formData.subject || !formData.gradeLevel || !formData.topic) {
      toast.error('Please fill in at least subject, grade level, and topic');
      return;
    }

    generatePlanMutation.mutate(formData);
  };

  const handleSavePlan = () => {
    if (generatedPlan) {
      const planToSave = {
        id: Date.now().toString(),
        ...generatedPlan,
        savedAt: new Date().toISOString()
      };
      setSavedPlans(prev => [planToSave, ...prev]);
      toast.success('📚 Lesson plan saved to your collection!');
    }
  };

  const handleCopyPlan = () => {
    if (generatedPlan) {
      navigator.clipboard.writeText(generatedPlan.content);
      toast.success('📋 Lesson plan copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedPlan) return;
    
    // Create a simple HTML version for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lesson Plan - ${generatedPlan.metadata.topic}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
            h1 { color: #6366f1; border-bottom: 3px solid #6366f1; padding-bottom: 10px; }
            h2 { color: #8b5cf6; margin-top: 30px; }
            h3 { color: #a78bfa; }
            .meta { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
            .meta p { margin: 5px 0; }
            ul, ol { margin-left: 20px; }
            @media print { body { margin: 0; padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="meta">
            <p><strong>Subject:</strong> ${generatedPlan.metadata.subject}</p>
            <p><strong>Grade Level:</strong> ${generatedPlan.metadata.gradeLevel}</p>
            <p><strong>Topic:</strong> ${generatedPlan.metadata.topic}</p>
            <p><strong>Duration:</strong> ${generatedPlan.metadata.duration} minutes</p>
            <p><strong>Generated:</strong> ${new Date(generatedPlan.metadata.generatedAt).toLocaleDateString()}</p>
          </div>
          ${generatedPlan.content.replace(/\n/g, '<br>')}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-plan-${generatedPlan.metadata.topic.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('📥 Lesson plan downloaded! You can print it from your browser.');
  };

  const subjects = [
    'Mathematics', 'Science', 'English/Language Arts', 'Social Studies',
    'History', 'Geography', 'Computer Science', 'Art', 'Music',
    'Physical Education', 'Foreign Language', 'Health', 'STEM'
  ];

  const gradeLevels = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade',
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    '9th Grade', '10th Grade', '11th Grade', '12th Grade',
    'College/University', 'Adult Education'
  ];

  const durations = ['30', '45', '60', '90', '120'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl mb-4">
          <GraduationCap className="w-6 h-6" />
          <h2 className="text-xl font-bold">AI Lesson Plan Generator</h2>
          <Sparkles className="w-5 h-5" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create comprehensive, standards-aligned lesson plans in seconds with AI assistance
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <PenTool className="w-5 h-5" />
                Lesson Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Subject *
                </Label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Grade Level */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Grade Level *
                </Label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                >
                  <option value="">Select grade...</option>
                  {gradeLevels.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-600" />
                  Lesson Topic *
                </Label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Photosynthesis, World War II, Fractions"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                />
              </div>

              {/* Duration */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Duration (minutes) *
                </Label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Select duration...</option>
                  {durations.map(d => (
                    <option key={d} value={d}>{d} minutes</option>
                  ))}
                </select>
              </div>

              {/* Learning Objectives */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Learning Objectives *
                </Label>
                <Textarea
                  value={formData.learningObjectives}
                  onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                  placeholder="What should students be able to do by the end of this lesson?&#10;Example: Students will be able to explain the process of photosynthesis..."
                  className="min-h-[100px] px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              {/* Optional Fields - Collapsible */}
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-500 mb-3">📝 Optional Details (for better customization)</p>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-1">Student Needs/Accommodations</Label>
                    <Textarea
                      value={formData.studentNeeds}
                      onChange={(e) => setFormData({ ...formData, studentNeeds: e.target.value })}
                      placeholder="ELL students, IEP accommodations, differentiation needs..."
                      className="min-h-[70px] text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-1">Available Resources/Technology</Label>
                    <Textarea
                      value={formData.resources}
                      onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                      placeholder="Chromebooks, science lab, art supplies, specific textbooks..."
                      className="min-h-[70px] text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-1">Standards to Address</Label>
                    <Textarea
                      value={formData.standards}
                      onChange={(e) => setFormData({ ...formData, standards: e.target.value })}
                      placeholder="Common Core, NGSS, state standards..."
                      className="min-h-[70px] text-sm"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generatePlanMutation.isPending || !formData.subject || !formData.gradeLevel || !formData.topic}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl disabled:opacity-50 py-6 text-lg"
                size="lg"
              >
                {generatePlanMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Lesson Plan...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Lesson Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Plan Display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-purple-200 h-full">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <FileText className="w-5 h-5" />
                Generated Lesson Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {generatePlanMutation.isPending && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-4"
                    >
                      <Brain className="w-16 h-16 text-purple-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Creating Your Lesson Plan...
                    </h3>
                    <p className="text-gray-600">AI is designing a comprehensive plan tailored to your needs</p>
                    
                    <div className="mt-6 space-y-2 max-w-md mx-auto">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                      />
                      <p className="text-sm text-gray-500">Analyzing learning objectives...</p>
                    </div>
                  </motion.div>
                )}

                {!generatePlanMutation.isPending && !generatedPlan && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      📚
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to Create</h3>
                    <p className="text-gray-600">Fill out the form and click generate to create your lesson plan</p>
                  </motion.div>
                )}

                {generatedPlan && (
                  <motion.div
                    key="plan"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {/* Metadata */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Subject:</span>
                          <p className="font-bold text-indigo-900">{generatedPlan.metadata.subject}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Grade:</span>
                          <p className="font-bold text-purple-900">{generatedPlan.metadata.gradeLevel}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Topic:</span>
                          <p className="font-bold text-pink-900">{generatedPlan.metadata.topic}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-bold text-blue-900">{generatedPlan.metadata.duration} min</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={handleSavePlan}
                        variant="outline"
                        size="sm"
                        className="border-green-400 text-green-700 hover:bg-green-50"
                      >
                        <BookMarked className="w-4 h-4 mr-1" />
                        Save Plan
                      </Button>
                      <Button
                        onClick={handleCopyPlan}
                        variant="outline"
                        size="sm"
                        className="border-blue-400 text-blue-700 hover:bg-blue-50"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        size="sm"
                        className="border-purple-400 text-purple-700 hover:bg-purple-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>

                    {/* Generated Content */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 max-h-[600px] overflow-y-auto">
                      <ReactMarkdown
                        className="prose prose-sm max-w-none prose-headings:text-indigo-900 prose-h1:text-2xl prose-h2:text-xl prose-h2:text-purple-800 prose-h3:text-lg prose-h3:text-pink-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-indigo-900"
                      >
                        {generatedPlan.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Saved Plans Library */}
      {savedPlans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <BookMarked className="w-5 h-5" />
                Saved Lesson Plans ({savedPlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPlans.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card 
                      className="group hover:shadow-xl transition-all cursor-pointer border-2 border-gray-200 hover:border-indigo-400"
                      onClick={() => setGeneratedPlan(plan)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-indigo-600 text-white text-xs">
                            {plan.metadata.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {plan.metadata.gradeLevel}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                          {plan.metadata.topic}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {plan.metadata.duration} min • Saved {new Date(plan.savedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">💡 Tips for Best Results</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Be specific with learning objectives - the more detail, the better the plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Include student needs for personalized differentiation strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>You can regenerate anytime to get alternative approaches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Download and customize the plan in your preferred format</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}