
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileStack, Copy, CheckCircle, Loader2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AISupplementalMaterialsGenerator({ onAddMaterials }) {
  const [lessonContent, setLessonContent] = useState('');
  const [materialTypes, setMaterialTypes] = useState(['worksheets', 'reading_list']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMaterials, setGeneratedMaterials] = useState(null);

  const MATERIAL_TYPES = [
    { value: 'worksheets', label: 'Worksheets & Exercises', icon: '📝' },
    { value: 'reading_list', label: 'Recommended Reading', icon: '📚' },
    { value: 'practice_activities', label: 'Practice Activities', icon: '🎯' },
    { value: 'reflection_prompts', label: 'Reflection Prompts', icon: '💭' },
    { value: 'checklists', label: 'Checklists & Templates', icon: '✅' },
    { value: 'case_studies', label: 'Case Studies', icon: '📊' }
  ];

  const handleGenerate = async () => {
    if (!lessonContent.trim()) {
      toast.error('Please enter lesson content');
      return;
    }

    if (materialTypes.length === 0) {
      toast.error('Please select at least one material type');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedTypes = materialTypes.map(type => 
        MATERIAL_TYPES.find(t => t.value === type)?.label
      ).join(', ');

      const prompt = `Based on the following lesson content, create supplemental learning materials.

Lesson Content:
${lessonContent}

Generate the following types of materials: ${selectedTypes}

For each material type, provide:

${materialTypes.includes('worksheets') ? `
**Worksheets & Exercises:**
- 3-5 hands-on exercises that reinforce the lesson concepts
- Include clear instructions, space for answers, and answer keys
- Make them practical and applicable to real-world situations
` : ''}

${materialTypes.includes('reading_list') ? `
**Recommended Reading:**
- 5-7 relevant articles, books, or resources
- Include brief descriptions of what each resource offers
- Mix of beginner-friendly and advanced resources
- Include links or citations
` : ''}

${materialTypes.includes('practice_activities') ? `
**Practice Activities:**
- 3-4 activities students can do to practice the concepts
- Include step-by-step instructions
- Specify time required and materials needed
` : ''}

${materialTypes.includes('reflection_prompts') ? `
**Reflection Prompts:**
- 5-7 thought-provoking questions
- Help students apply concepts to their own life
- Encourage deeper thinking and self-awareness
` : ''}

${materialTypes.includes('checklists') ? `
**Checklists & Templates:**
- Create 2-3 practical checklists or templates
- Make them actionable and easy to use
- Include examples of completed versions
` : ''}

${materialTypes.includes('case_studies') ? `
**Case Studies:**
- 2-3 real-world examples or scenarios
- Show how the concepts apply in practice
- Include analysis and key takeaways
` : ''}

Make all materials engaging, practical, and directly relevant to the lesson content.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setGeneratedMaterials(response);
      toast.success('Supplemental materials generated! 📚');
    } catch (error) {
      console.error('Failed to generate materials:', error);
      toast.error('Failed to generate materials. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedMaterials) {
      navigator.clipboard.writeText(generatedMaterials);
      toast.success('Materials copied to clipboard!');
    }
  };

  const toggleMaterialType = (type) => {
    if (materialTypes.includes(type)) {
      setMaterialTypes(materialTypes.filter(t => t !== type));
    } else {
      setMaterialTypes([...materialTypes, type]);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="w-6 h-6 text-amber-600" />
            AI Supplemental Materials Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lesson Content *</label>
            <Textarea
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Paste your lesson content or outline here..."
              rows={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Material Types to Generate *</label>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => toggleMaterialType(type.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    materialTypes.includes(type.value)
                      ? 'border-amber-500 bg-amber-100'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-sm font-semibold">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !lessonContent.trim() || materialTypes.length === 0}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Materials...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Supplemental Materials
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedMaterials && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Supplemental Materials
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                  {onAddMaterials && (
                    <Button
                      onClick={() => {
                        onAddMaterials(generatedMaterials);
                        toast.success('Materials added!');
                      }}
                      size="sm"
                      className="bg-green-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Add to Course
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {generatedMaterials}
                </pre>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {materialTypes.map(type => {
                  const typeInfo = MATERIAL_TYPES.find(t => t.value === type);
                  return (
                    <Badge key={type} className="bg-amber-100 text-amber-800">
                      {typeInfo?.icon} {typeInfo?.label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
