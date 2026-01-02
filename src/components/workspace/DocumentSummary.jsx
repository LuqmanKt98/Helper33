import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  Loader2,
  Copy,
  RefreshCw,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentSummary({ 
  document, 
  extractedText, 
  onSummaryGenerated,
  compact = false 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSummary, setLocalSummary] = useState(document?.ai_summary || null);
  const [localKeyPoints, setLocalKeyPoints] = useState(document?.key_points || []);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateSummary = async () => {
    if (!extractedText || extractedText.trim().length < 50) {
      toast.error('Not enough text to summarize. Please extract text first.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document text and provide:
1. A concise summary (2-3 sentences) capturing the main purpose and content
2. 3-5 key points or important details
3. The document's main category/purpose

Document Text:
${extractedText.substring(0, 3000)}

Be clear, concise, and focus on actionable information.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { 
              type: "string",
              description: "2-3 sentence summary of the document"
            },
            key_points: { 
              type: "array",
              items: { type: "string" },
              description: "3-5 key points from the document"
            },
            document_purpose: {
              type: "string",
              description: "Main purpose or category of the document"
            }
          }
        }
      });

      setLocalSummary(response.summary);
      setLocalKeyPoints(response.key_points || []);

      // Update the document if it has an ID
      if (document?.id) {
        await base44.entities.ScannedDocument.update(document.id, {
          ai_summary: response.summary,
          key_points: response.key_points,
          summary_generated_at: new Date().toISOString()
        });

        // Log activity
        await base44.entities.DocumentActivity.create({
          document_id: document.id,
          document_title: document.title,
          user_email: (await base44.auth.me()).email,
          user_name: (await base44.auth.me()).full_name || (await base44.auth.me()).email,
          activity_type: 'extracted_text',
          activity_description: 'Generated AI summary',
          activity_timestamp: new Date().toISOString()
        });
      }

      if (onSummaryGenerated) {
        onSummaryGenerated({
          summary: response.summary,
          key_points: response.key_points
        });
      }

      toast.success('Summary generated! 📝');
      setIsExpanded(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySummary = () => {
    const fullSummary = `Summary:\n${localSummary}\n\nKey Points:\n${localKeyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    navigator.clipboard.writeText(fullSummary);
    toast.success('Summary copied to clipboard! 📋');
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {localSummary ? (
          <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-purple-900">AI Summary</span>
              </div>
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {localSummary}
                  </p>
                  {localKeyPoints.length > 0 && (
                    <ul className="text-xs space-y-1 ml-4 list-disc text-gray-600">
                      {localKeyPoints.slice(0, 3).map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Button
            onClick={generateSummary}
            disabled={isGenerating || !extractedText}
            variant="outline"
            size="sm"
            className="w-full bg-purple-50 hover:bg-purple-100 border-purple-200 text-xs"
          >
            {isGenerating ? (
              <><Loader2 className="w-3 h-3 animate-spin mr-2" />Generating...</>
            ) : (
              <><Sparkles className="w-3 h-3 mr-2" />Generate Summary</>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {localSummary ? (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-purple-900 flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                AI Summary
              </h4>
              <div className="flex gap-1">
                <Button
                  onClick={copySummary}
                  variant="outline"
                  size="sm"
                  className="touch-manipulation min-h-[32px]"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                  className="touch-manipulation min-h-[32px]"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-lg border border-purple-200">
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3">
                {localSummary}
              </p>

              {document?.summary_generated_at && (
                <p className="text-xs text-gray-500">
                  Generated {new Date(document.summary_generated_at).toLocaleString()}
                </p>
              )}
            </div>

            {localKeyPoints.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-semibold text-purple-800 flex items-center gap-2 text-xs sm:text-sm">
                  <List className="w-4 h-4" />
                  Key Points
                </h5>
                <ul className="space-y-1.5">
                  {localKeyPoints.map((point, idx) => (
                    <li 
                      key={idx}
                      className="flex items-start gap-2 p-2 bg-white/50 rounded border border-purple-100"
                    >
                      <Badge className="bg-purple-600 text-white text-xs flex-shrink-0">
                        {idx + 1}
                      </Badge>
                      <span className="text-xs sm:text-sm text-gray-700 flex-1">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-4 sm:p-6 bg-purple-50/50 border-2 border-dashed border-purple-200 rounded-lg">
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
            AI Summary Available
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Generate an AI-powered summary to quickly understand this document's content
          </p>
          <Button
            onClick={generateSummary}
            disabled={isGenerating || !extractedText}
            className="bg-purple-600 hover:bg-purple-700 touch-manipulation min-h-[44px]"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating Summary...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Generate AI Summary</>
            )}
          </Button>
          {!extractedText && (
            <p className="text-xs text-orange-600 mt-2">
              Extract text first to generate a summary
            </p>
          )}
        </div>
      )}
    </div>
  );
}