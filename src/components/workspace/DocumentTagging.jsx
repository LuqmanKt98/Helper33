import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tag,
  Sparkles,
  Plus,
  X,
  Check,
  Loader2,
  Lightbulb,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const AUTO_TAG_RULES = {
  receipt: ['receipt', 'expense', 'purchase'],
  invoice: ['invoice', 'billing', 'payment'],
  contract: ['contract', 'legal', 'agreement'],
  medical: ['medical', 'health', 'healthcare'],
  legal: ['legal', 'document', 'official'],
  business_card: ['contact', 'business', 'networking'],
  id_card: ['identification', 'personal', 'official'],
  passport: ['travel', 'identification', 'official'],
  whiteboard: ['notes', 'meeting', 'brainstorm'],
  note: ['notes', 'personal', 'memo']
};

export default function DocumentTagging({ 
  documentTitle, 
  extractedText, 
  documentType,
  currentTags = [],
  onTagsUpdate 
}) {
  const [tags, setTags] = useState(currentTags);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setTags(currentTags);
  }, [currentTags]);

  const generateAITags = async () => {
    if (!documentTitle && !extractedText) {
      toast.error('Please add a title or extract text first');
      return;
    }

    setIsGenerating(true);
    setShowSuggestions(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this document and suggest 5-8 relevant tags for organization and searchability.

Document Title: ${documentTitle || 'Untitled'}
Document Type: ${documentType || 'Unknown'}
Extracted Text: ${extractedText ? extractedText.substring(0, 500) : 'No text extracted'}

Suggest tags that would help:
- Categorize the document (e.g., finance, legal, medical, personal)
- Identify the subject matter (e.g., insurance, tax, receipt, contract)
- Enable quick searching (e.g., 2024, company name, project name)
- Organize by function (e.g., important, urgent, reference)

Return ONLY short, single-word or two-word tags that are specific and useful.
Avoid generic tags like "document" or "file".
Focus on actionable, searchable keywords.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_tags: {
              type: "array",
              items: { type: "string" }
            },
            reasoning: {
              type: "string"
            },
            document_category: {
              type: "string"
            }
          }
        }
      });

      setSuggestedTags(response.suggested_tags || []);
      
      if (response.suggested_tags && response.suggested_tags.length > 0) {
        toast.success(`Found ${response.suggested_tags.length} tag suggestions! ✨`);
      } else {
        toast.info('No specific tags suggested');
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      toast.error('Failed to generate tag suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAutoTags = () => {
    if (documentType && AUTO_TAG_RULES[documentType]) {
      const autoTags = AUTO_TAG_RULES[documentType];
      const newTags = [...new Set([...tags, ...autoTags])];
      setTags(newTags);
      onTagsUpdate(newTags);
      toast.success(`Applied ${autoTags.length} auto-tags for ${documentType}`);
    } else {
      toast.info('No auto-tags available for this document type');
    }
  };

  const addTag = (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (!normalizedTag) return;
    
    if (tags.includes(normalizedTag)) {
      toast.error('Tag already added');
      return;
    }

    const newTags = [...tags, normalizedTag];
    setTags(newTags);
    onTagsUpdate(newTags);
    setCustomTag('');
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    onTagsUpdate(newTags);
  };

  const acceptSuggestedTag = (tag) => {
    addTag(tag);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  const acceptAllSuggestions = () => {
    const newTags = [...new Set([...tags, ...suggestedTags])];
    setTags(newTags);
    onTagsUpdate(newTags);
    setSuggestedTags([]);
    toast.success('All suggestions applied! ✨');
  };

  const dismissAllSuggestions = () => {
    setSuggestedTags([]);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* AI Tag Generation Buttons - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={generateAITags}
          disabled={isGenerating}
          variant="outline"
          className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-300 touch-manipulation min-h-[44px]"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />AI Suggest Tags</>
          )}
        </Button>
        
        {documentType && AUTO_TAG_RULES[documentType] && (
          <Button
            onClick={applyAutoTags}
            variant="outline"
            className="flex-1 sm:flex-none bg-blue-50 hover:bg-blue-100 border-blue-300 touch-manipulation min-h-[44px]"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Auto-Tag ({documentType})</span>
            <span className="sm:hidden">Auto-Tag</span>
          </Button>
        )}
      </div>

      {/* AI Suggested Tags - Mobile Optimized */}
      <AnimatePresence>
        {showSuggestions && suggestedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-purple-900 flex items-center gap-2 text-sm sm:text-base">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                AI Suggestions ({suggestedTags.length})
              </h4>
              <div className="flex gap-1">
                <Button
                  onClick={acceptAllSuggestions}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-xs touch-manipulation min-h-[32px]"
                >
                  <Check className="w-3 h-3 sm:mr-1" />
                  <span className="hidden sm:inline">Accept All</span>
                </Button>
                <Button
                  onClick={dismissAllSuggestions}
                  variant="ghost"
                  size="sm"
                  className="touch-manipulation min-h-[32px] min-w-[32px]"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag, idx) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Button
                    onClick={() => acceptSuggestedTag(tag)}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-purple-100 border-purple-200 touch-manipulation min-h-[32px] text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {tag}
                  </Button>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-purple-700 mt-3 flex items-start gap-2">
              <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>Click tags to add them to your document, or use "Accept All" to add everything</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Tags - Mobile Optimized */}
      <div className="space-y-2">
        <Label className="text-xs sm:text-sm flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600" />
          Document Tags
        </Label>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {tags.map(tag => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge className="bg-blue-600 text-white pr-1 text-xs sm:text-sm">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-blue-700 rounded-full p-0.5 touch-manipulation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Custom Tag - Mobile Optimized */}
        <div className="flex gap-2">
          <Input
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag(customTag)}
            placeholder="Add custom tag..."
            className="flex-1 text-sm sm:text-base min-h-[44px]"
          />
          <Button
            onClick={() => addTag(customTag)}
            disabled={!customTag.trim()}
            className="bg-blue-600 hover:bg-blue-700 touch-manipulation min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {tags.length === 0 && (
          <p className="text-xs text-gray-500 italic">
            No tags yet. Use AI suggestions or add custom tags to organize your documents.
          </p>
        )}
      </div>
    </div>
  );
}