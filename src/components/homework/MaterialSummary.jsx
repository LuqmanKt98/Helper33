import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BookOpen, Loader2, CheckCircle, Lightbulb,
  ChevronDown, ChevronUp, Brain, List
} from 'lucide-react';
import { toast } from 'sonner';

export default function MaterialSummary({ material, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this ${material.subject} study material titled "${material.title}" and provide: 1) A concise summary (3-4 sentences), 2) 5-7 key takeaways, 3) Main topics covered, 4) Important concepts to remember.`,
        file_urls: material.file_url ? [material.file_url] : undefined,
        add_context_from_internet: material.external_url ? true : false,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_takeaways: { 
              type: "array", 
              items: { type: "string" }
            },
            main_topics: {
              type: "array",
              items: { type: "string" }
            },
            important_concepts: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Update material with AI summary
      await base44.entities.HomeworkMaterial.update(material.id, {
        ai_summary: result.summary,
        key_topics: result.main_topics || []
      });

      toast.success('✨ Summary generated!');
      setExpanded(true);
      onUpdate?.();
      
      return result;
    } catch (error) {
      console.error('Summary generation error:', error);
      toast.error('Failed to generate summary');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const hasSummary = material.ai_summary && material.ai_summary.length > 0;

  return (
    <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-5 h-5" />
            AI Summary & Key Takeaways
          </CardTitle>
          {!hasSummary && (
            <Button
              onClick={generateSummary}
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-3 h-3 mr-1" />
                  Generate
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {hasSummary && (
        <CardContent>
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Summary Ready
              </Badge>
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-indigo-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-indigo-600" />
              )}
            </div>
          </motion.button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Summary */}
                <div className="bg-white/60 rounded-lg p-4 border-2 border-indigo-200">
                  <p className="font-semibold text-indigo-900 text-sm mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Summary:
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{material.ai_summary}</p>
                </div>

                {/* Key Topics */}
                {material.key_topics && material.key_topics.length > 0 && (
                  <div className="bg-white/60 rounded-lg p-4 border-2 border-purple-200">
                    <p className="font-semibold text-purple-900 text-sm mb-3 flex items-center gap-2">
                      <List className="w-4 h-4" />
                      Main Topics Covered:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {material.key_topics.map((topic, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            {topic}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Tip */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border-2 border-yellow-300">
                  <p className="text-xs font-semibold text-yellow-900 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Pro Tip:
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Focus on the main topics when generating practice questions for better learning outcomes.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      )}

      {!hasSummary && !generating && (
        <CardContent>
          <div className="text-center py-6">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-3"
            >
              🤖
            </motion.div>
            <p className="text-sm text-gray-600 mb-3">
              Let AI analyze your material and extract key insights!
            </p>
            <Button
              onClick={generateSummary}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}