import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Wand2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AIMessageAssistant({ clientMessage, onUseDraft }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResponse, setDraftResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const { output } = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional, empathetic licensed practitioner responding to a client inquiry.

Client Message: "${clientMessage}"

Generate a warm, professional response that:
- Acknowledges their message
- Provides helpful information about scheduling/availability/services
- Encourages them to book an appointment
- Maintains professional boundaries (no clinical advice)
- Is concise (2-3 sentences)

Response:`,
        response_json_schema: {
          type: "object",
          properties: {
            draft: { type: "string" }
          }
        }
      });

      setDraftResponse(output.draft);
    } catch (error) {
      toast.error('Failed to generate draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftResponse);
    setCopied(true);
    toast.success('Copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-semibold text-gray-800">AI Response Assistant</span>
            </div>
            {!draftResponse && (
              <Button
                size="sm"
                onClick={generateDraft}
                disabled={isGenerating}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 mr-1" />
                    Generate Draft
                  </>
                )}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {draftResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Textarea
                  value={draftResponse}
                  onChange={(e) => setDraftResponse(e.target.value)}
                  rows={4}
                  className="border-2 border-cyan-300 bg-white"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onUseDraft(draftResponse)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Use This Draft
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="border-2 border-cyan-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateDraft}
                    className="border-2 border-cyan-300"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}