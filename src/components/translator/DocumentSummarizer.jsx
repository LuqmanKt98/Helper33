import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Sparkles, Copy, Download, Loader2, List, BookOpen, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DocumentSummarizer({ 
  originalText, 
  translatedText, 
  sourceLang, 
  targetLang,
  languages 
}) {
  const [summaries, setSummaries] = useState({
    brief: { original: '', translated: '' },
    detailed: { original: '', translated: '' },
    comprehensive: { original: '', translated: '' }
  });
  const [keyPoints, setKeyPoints] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSummaryType, setActiveSummaryType] = useState('detailed');

  const generateSummary = async (type) => {
    setIsGenerating(true);

    try {
      const sourceLangName = languages.find(l => l.code === sourceLang)?.name;
      const targetLangName = languages.find(l => l.code === targetLang)?.name;

      const lengthGuide = {
        brief: '2-3 sentences',
        detailed: '1-2 paragraphs',
        comprehensive: '3-4 detailed paragraphs'
      };

      // Generate summary in original language
      const originalPrompt = `Analyze and summarize the following ${sourceLangName} document.

Create a ${type} summary (${lengthGuide[type]}) that captures:
- Main message and purpose
- Key points and arguments
- Important details and conclusions
${type === 'comprehensive' ? '- Context and implications' : ''}

Also extract 5-7 key bullet points.

Document:
${originalText}

Return JSON with: {
  "summary": "...", 
  "key_points": ["point1", "point2", ...]
}`;

      const originalSummary = await base44.integrations.Core.InvokeLLM({
        prompt: originalPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Generate summary in translated language
      const translatedPrompt = `Analyze and summarize the following ${targetLangName} document.

Create a ${type} summary (${lengthGuide[type]}) IN ${targetLangName} that captures:
- Main message and purpose
- Key points and arguments
- Important details and conclusions
${type === 'comprehensive' ? '- Context and implications' : ''}

Also extract 5-7 key bullet points IN ${targetLangName}.

Document:
${translatedText}

Return JSON with: {
  "summary": "...", 
  "key_points": ["point1", "point2", ...]
}`;

      const translatedSummary = await base44.integrations.Core.InvokeLLM({
        prompt: translatedPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSummaries(prev => ({
        ...prev,
        [type]: {
          original: originalSummary.summary,
          translated: translatedSummary.summary
        }
      }));

      setKeyPoints(translatedSummary.key_points || []);
      setActiveSummaryType(type);

      // Save to database
      await base44.entities.TranslationSummary.create({
        original_text: originalText,
        translated_text: translatedText,
        source_language: sourceLang,
        target_language: targetLang,
        summary_type: type,
        summary_original_language: originalSummary.summary,
        summary_translated_language: translatedSummary.summary,
        key_points: translatedSummary.key_points,
        word_count_original: originalText.split(/\s+/).length,
        word_count_translated: translatedText.split(/\s+/).length
      });

      toast.success('Summary generated!');
    } catch (error) {
      console.error('Summary generation error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadSummary = () => {
    const sourceLangName = languages.find(l => l.code === sourceLang)?.name;
    const targetLangName = languages.find(l => l.code === targetLang)?.name;
    
    let content = `Document Summary\n`;
    content += `${sourceLangName} → ${targetLangName}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Summary Type: ${activeSummaryType}\n\n`;
    content += `---\n\n`;
    
    content += `SUMMARY (${sourceLangName}):\n${summaries[activeSummaryType].original}\n\n`;
    content += `---\n\n`;
    content += `SUMMARY (${targetLangName}):\n${summaries[activeSummaryType].translated}\n\n`;
    content += `---\n\n`;
    content += `KEY POINTS:\n`;
    keyPoints.forEach((point, idx) => {
      content += `${idx + 1}. ${point}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${activeSummaryType}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    toast.success('Summary downloaded!');
  };

  const sourceLangDetails = languages.find(l => l.code === sourceLang);
  const targetLangDetails = languages.find(l => l.code === targetLang);

  return (
    <div className="space-y-6">
      {/* Summary Type Selection */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { type: 'brief', icon: Zap, label: 'Brief', desc: '2-3 sentences' },
          { type: 'detailed', icon: FileText, label: 'Detailed', desc: '1-2 paragraphs' },
          { type: 'comprehensive', icon: BookOpen, label: 'Full', desc: '3-4 paragraphs' }
        ].map((option) => (
          <Button
            key={option.type}
            onClick={() => generateSummary(option.type)}
            disabled={isGenerating}
            variant={activeSummaryType === option.type && summaries[option.type].original ? 'default' : 'outline'}
            className="h-auto flex flex-col items-center p-4 gap-2"
          >
            <option.icon className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">{option.label}</div>
              <div className="text-xs opacity-80">{option.desc}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Generated Summaries */}
      <AnimatePresence>
        {summaries[activeSummaryType].original && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Document Summary ({activeSummaryType})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadSummary}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="original" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="original">
                      {sourceLangDetails?.flag} {sourceLangDetails?.name}
                    </TabsTrigger>
                    <TabsTrigger value="translated">
                      {targetLangDetails?.flag} {targetLangDetails?.name}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="original" className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {summaries[activeSummaryType].original}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyText(summaries[activeSummaryType].original)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Summary
                    </Button>
                  </TabsContent>

                  <TabsContent value="translated" className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {summaries[activeSummaryType].translated}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyText(summaries[activeSummaryType].translated)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Summary
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Key Points */}
                {keyPoints.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <List className="w-5 h-5 text-indigo-600" />
                      Key Points
                    </h4>
                    <ul className="space-y-2">
                      {keyPoints.map((point, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Indicator */}
      {isGenerating && (
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-full shadow-xl"
          >
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span className="font-medium text-gray-700">Analyzing and summarizing document...</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}