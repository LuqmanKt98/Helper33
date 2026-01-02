
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Languages, Upload, FileText, Download, Copy, Volume2, RefreshCw,
  Loader2, ArrowLeftRight, CheckCircle, Globe, Sparkles,
  Mic, Package, MessageSquare, Database, Lightbulb, Zap, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import GuestPrompt from '@/components/common/GuestPrompt';
import ConversationMode from '@/components/translator/ConversationMode';
import OfflinePacksManager from '@/components/translator/OfflinePacksManager';
import DocumentSummarizer from '@/components/translator/DocumentSummarizer';
import DocumentPreview from '@/components/translator/DocumentPreview';
import BatchProcessor from '@/components/translator/BatchProcessor';
import TranslationMemoryManager from '@/components/translator/TranslationMemoryManager';
import SEO from '@/components/SEO';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
];

export default function TranslatorHub() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: translationMemory = [] } = useQuery({
    queryKey: ['translationMemory'],
    queryFn: () => base44.entities.TranslationMemory.list('-usage_count', 500),
    initialData: []
  });

  const [activeTab, setActiveTab] = useState('text');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [documentTranslation, setDocumentTranslation] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [extractedOCRText, setExtractedOCRText] = useState('');
  const [memorySuggestions, setMemorySuggestions] = useState([]);
  const [showMemorySuggestions, setShowMemorySuggestions] = useState(false);

  useEffect(() => {
    if (!sourceText.trim() || sourceText.length < 10) {
      setMemorySuggestions([]);
      setShowMemorySuggestions(false);
      return;
    }

    const matches = translationMemory.filter(entry => {
      const matchesLanguages = entry.source_language === sourceLang && 
                               entry.target_language === targetLang;
      const textMatch = entry.source_text.toLowerCase().includes(sourceText.toLowerCase().trim()) ||
                       sourceText.toLowerCase().includes(entry.source_text.toLowerCase());
      return matchesLanguages && textMatch;
    });

    if (matches.length > 0) {
      setMemorySuggestions(matches.slice(0, 5));
      setShowMemorySuggestions(true);
    } else {
      setMemorySuggestions([]);
      setShowMemorySuggestions(false);
    }
  }, [sourceText, sourceLang, targetLang, translationMemory]);

  const saveToTranslationMemory = async (sourceText, translatedText, context = '') => {
    if (!user) return;

    try {
      const sentences = sourceText.match(/[^.!?]+[.!?]+/g) || [sourceText];
      const translatedSentences = translatedText.match(/[^.!?]+[.!?]+/g) || [translatedText];

      if (sentences.length === translatedSentences.length) {
        for (let i = 0; i < sentences.length; i++) {
          const sourceSentence = sentences[i].trim();
          const translatedSentence = translatedSentences[i].trim();

          if (sourceSentence.length < 5) continue;

          const exists = translationMemory.some(entry => 
            entry.source_text.toLowerCase() === sourceSentence.toLowerCase() &&
            entry.source_language === sourceLang &&
            entry.target_language === targetLang
          );

          if (!exists) {
            await base44.entities.TranslationMemory.create({
              source_text: sourceSentence,
              translated_text: translatedSentence,
              source_language: sourceLang,
              target_language: targetLang,
              domain: 'general',
              context: context,
              confidence_score: 1,
              usage_count: 1,
              last_used: new Date().toISOString()
            });
          } else {
            const existingEntry = translationMemory.find(entry => 
              entry.source_text.toLowerCase() === sourceSentence.toLowerCase() &&
              entry.source_language === sourceLang &&
              entry.target_language === targetLang
            );
            if (existingEntry) {
              await base44.entities.TranslationMemory.update(existingEntry.id, {
                usage_count: (existingEntry.usage_count || 0) + 1,
                last_used: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error saving to translation memory:', error);
    }
  };

  const applySuggestion = (suggestion) => {
    setTranslatedText(suggestion.translated_text);
    setShowMemorySuggestions(false);
    toast.success('Applied from Translation Memory!');
    
    base44.entities.TranslationMemory.update(suggestion.id, {
      usage_count: (suggestion.usage_count || 0) + 1,
      last_used: new Date().toISOString()
    });
  };

  const handleTextTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');
    setShowSummarizer(false);

    try {
      const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

      const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. 
Provide ONLY the translation, no explanations or additional text.
Preserve the original formatting, tone, and style.

Text to translate:
${sourceText}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
      });

      setTranslatedText(response);
      
      await saveToTranslationMemory(sourceText, response);
      
      const historyItem = {
        id: Date.now(),
        source: sourceText,
        translation: response,
        sourceLang,
        targetLang,
        timestamp: new Date().toLocaleString()
      };
      setTranslationHistory(prev => [historyItem, ...prev.slice(0, 9)]);

      toast.success('Translation complete & saved to memory!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      setShowGuestPrompt(true);
      return;
    }

    setIsUploadingDoc(true);
    setUploadedFile(file);
    setDocumentTranslation('');
    setShowSummarizer(false);
    setShowPreview(false);
    setExtractedOCRText('');

    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(uploadResponse.file_url);
      setShowPreview(true);
      toast.success('File uploaded! Review preview below.');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setUploadedFile(null);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDocumentTranslate = async () => {
    if (!uploadedFileUrl) {
      toast.error('Please upload a document first');
      return;
    }

    setIsTranslating(true);
    setDocumentTranslation('');
    setShowSummarizer(false);

    try {
      const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
      const isImage = uploadedFile?.type.startsWith('image/');

      let translatedContent = '';
      let originalContent = '';

      if (isImage) {
        toast.info('📷 Extracting text from image using OCR...');
        
        const ocrPrompt = `Extract ALL text from this image using Optical Character Recognition (OCR).
Return the complete text exactly as it appears in the image.
Preserve all formatting, line breaks, and structure.
If there are multiple columns or sections, maintain their order.`;

        const extractedText = await base44.integrations.Core.InvokeLLM({
          prompt: ocrPrompt,
          file_urls: [uploadedFileUrl]
        });

        setExtractedOCRText(extractedText);
        originalContent = extractedText;
        toast.success('✅ Text extracted! Now translating...');

        const translatePrompt = `Translate the following text from ${sourceLangName} to ${targetLangName}.
Preserve formatting, structure, and meaning.

Text to translate:
${extractedText}`;

        translatedContent = await base44.integrations.Core.InvokeLLM({
          prompt: translatePrompt
        });

        setSourceText(extractedText);
      } else {
        const prompt = `You are a professional translator and document interpreter. 

Please:
1. Extract and interpret ALL content from the attached document
2. Translate the entire document from ${sourceLangName} to ${targetLangName}
3. Preserve the structure, formatting, and meaning
4. If there are images or charts, describe them in ${targetLangName}
5. Maintain professional terminology and context

Provide a complete, accurate translation of the entire document.`;

        translatedContent = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          file_urls: [uploadedFileUrl]
        });
        
        originalContent = 'Document content';
      }

      setDocumentTranslation(translatedContent);
      setShowSummarizer(true);
      
      await saveToTranslationMemory(originalContent, translatedContent, uploadedFile?.name);
      
      toast.success(isImage ? '🎉 OCR, Translation & Memory saved!' : 'Document translated & saved to memory!');
    } catch (error) {
      console.error('Document translation error:', error);
      toast.error('Document translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    
    if (translatedText) {
      const tempText = sourceText;
      setSourceText(translatedText);
      setTranslatedText(tempText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const speakText = (text, langCode) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      speechSynthesis.speak(utterance);
      toast.success('Playing audio...');
    } else {
      toast.error('Text-to-speech not supported in your browser');
    }
  };

  const downloadTranslation = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Download started!');
  };

  return (
    <>
      <SEO 
        title="Translator Hub - DobryLife | AI Translation with OCR & Memory"
        description="Advanced AI translation tool with OCR for images, translation memory, batch processing, real-time conversation mode, and offline packs. Support for 30+ languages."
        keywords="AI translator, OCR translation, document translation, real-time translation, translation memory, batch translation, multilingual support, language translator"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
        {showGuestPrompt && (
          <GuestPrompt 
            action="upload and translate documents"
            onCancel={() => setShowGuestPrompt(false)}
          />
        )}

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Languages className="w-12 h-12 text-blue-600" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Translator Hub
              </h1>
            </div>
            <p className="text-lg text-gray-600 mb-2">
              AI-Powered Translation with Memory, OCR & Batch Processing
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Globe className="w-4 h-4" />
              <span>Available at <strong className="text-blue-700">dobrylife.com</strong></span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-lg shadow-2xl border-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="document" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Document</span>
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Batch</span>
                    </TabsTrigger>
                    <TabsTrigger value="conversation" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Talk</span>
                    </TabsTrigger>
                    <TabsTrigger value="memory" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span className="hidden sm:inline">Memory</span>
                    </TabsTrigger>
                    <TabsTrigger value="offline" className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span className="hidden sm:inline">Offline</span>
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="space-y-6">
                  {activeTab !== 'offline' && activeTab !== 'memory' && (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">From</label>
                        <Select value={sourceLang} onValueChange={setSourceLang}>
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {LANGUAGES.map(lang => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <span className="flex items-center gap-2">
                                  <span className="text-xl">{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={swapLanguages}
                        className="mt-7 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
                      >
                        <ArrowLeftRight className="w-5 h-5" />
                      </motion.button>

                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">To</label>
                        <Select value={targetLang} onValueChange={setTargetLang}>
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {LANGUAGES.map(lang => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <span className="flex items-center gap-2">
                                  <span className="text-xl">{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <TabsContent value="text" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-700">
                            Original Text
                          </label>
                          <Badge variant="outline" className="bg-blue-50">
                            {LANGUAGES.find(l => l.code === sourceLang)?.flag} {LANGUAGES.find(l => l.code === sourceLang)?.name}
                          </Badge>
                        </div>
                        <div className="relative">
                          <Textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Enter text to translate..."
                            className="min-h-[300px] bg-white border-2 border-gray-200 focus:border-blue-500 resize-none"
                          />
                          
                          <AnimatePresence>
                            {showMemorySuggestions && memorySuggestions.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-blue-300 z-10 overflow-hidden"
                              >
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3">
                                  <div className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    <span className="font-bold">Translation Memory Suggestions</span>
                                    <Badge className="ml-auto bg-white/20">
                                      {memorySuggestions.length} match{memorySuggestions.length > 1 ? 'es' : ''}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                  {memorySuggestions.map((suggestion, index) => (
                                    <motion.div
                                      key={suggestion.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors"
                                      onClick={() => applySuggestion(suggestion)}
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <Badge variant="outline" className="text-xs">
                                          {suggestion.domain}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <TrendingUp className="w-3 h-3" />
                                          <span>Used {suggestion.usage_count}x</span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-1">
                                        <strong>Source:</strong> {suggestion.source_text}
                                      </p>
                                      <p className="text-sm text-indigo-700 font-medium">
                                        <strong>Translation:</strong> {suggestion.translated_text}
                                      </p>
                                      {suggestion.context && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Context: {suggestion.context}
                                        </p>
                                      )}
                                    </motion.div>
                                  ))}
                                </div>
                                <div className="bg-gray-50 p-2 text-center">
                                  <button
                                    onClick={() => setShowMemorySuggestions(false)}
                                    className="text-xs text-gray-600 hover:text-gray-900"
                                  >
                                    Close suggestions
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => speakText(sourceText, sourceLang)}
                            disabled={!sourceText}
                            className="bg-white"
                          >
                            <Volume2 className="w-4 h-4 mr-1" />
                            Listen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSourceText('')}
                            disabled={!sourceText}
                            className="bg-white"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-700">
                            Translation
                          </label>
                          <Badge variant="outline" className="bg-purple-50">
                            {LANGUAGES.find(l => l.code === targetLang)?.flag} {LANGUAGES.find(l => l.code === targetLang)?.name}
                          </Badge>
                        </div>
                        <div className="relative">
                          <Textarea
                            value={translatedText}
                            readOnly
                            placeholder="Translation will appear here..."
                            className="min-h-[300px] bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 resize-none"
                          />
                          {isTranslating && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                              <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Translating...</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(translatedText)}
                            disabled={!translatedText}
                            className="bg-white"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => speakText(translatedText, targetLang)}
                            disabled={!translatedText}
                            className="bg-white"
                          >
                            <Volume2 className="w-4 h-4 mr-1" />
                            Listen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTranslation(translatedText, `translation_${targetLang}.txt`)}
                            disabled={!translatedText}
                            className="bg-white"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleTextTranslate}
                        disabled={isTranslating || !sourceText.trim()}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-12 shadow-xl"
                      >
                        {isTranslating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Translate & Save to Memory
                          </>
                        )}
                      </Button>
                    </div>

                    {translationMemory.length > 0 && (
                      <div className="text-center">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                          <Database className="w-3 h-3 mr-1" />
                          {translationMemory.length} entries in your Translation Memory
                        </Badge>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="document" className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">OCR + Translation Memory</h3>
                          <p className="text-sm text-gray-700">
                            Upload scanned documents or images. AI extracts text (OCR), translates it, and saves to your Translation Memory for future use!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
                      <input
                        type="file"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {uploadedFile ? (
                            <div className="space-y-3">
                              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                              <div>
                                <p className="text-lg font-semibold text-gray-800">{uploadedFile.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(uploadedFile.size / 1024).toFixed(2)} KB
                                </p>
                                {uploadedFile.type.startsWith('image/') && (
                                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    OCR will be applied
                                  </Badge>
                                )}
                              </div>
                              <Button variant="outline" size="sm" onClick={(e) => { 
                                e.preventDefault(); 
                                setUploadedFile(null); 
                                setUploadedFileUrl(''); 
                                setDocumentTranslation(''); 
                                setShowSummarizer(false);
                                setShowPreview(false);
                                setExtractedOCRText('');
                              }}>
                                Upload Different File
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-lg font-semibold text-gray-800">
                                  {isUploadingDoc ? 'Uploading...' : 'Click to Upload Document'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  PDF, Word, Text, or Image files (OCR supported)
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </label>
                    </div>

                    {showPreview && uploadedFile && uploadedFileUrl && !documentTranslation && (
                      <DocumentPreview
                        file={uploadedFile}
                        fileUrl={uploadedFileUrl}
                        onRemove={() => {
                          setUploadedFile(null);
                          setUploadedFileUrl('');
                          setShowPreview(false);
                        }}
                        onConfirm={handleDocumentTranslate}
                      />
                    )}

                    {extractedOCRText && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            OCR Extracted Text
                          </label>
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Extracted
                          </Badge>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 p-6 max-h-64 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed text-sm">
                            {extractedOCRText}
                          </pre>
                        </div>
                      </motion.div>
                    )}

                    {documentTranslation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">
                              Translated Document
                            </label>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                              <Badge className="bg-indigo-100 text-indigo-800">
                                <Database className="w-3 h-3 mr-1" />
                                Saved to Memory
                              </Badge>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg border-2 border-purple-200 p-6 max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                              {documentTranslation}
                            </pre>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(documentTranslation)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadTranslation(documentTranslation, `translated_${uploadedFile.name}.txt`)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {showSummarizer && (
                          <DocumentSummarizer
                            originalText={extractedOCRText || sourceText || 'Uploaded document content'}
                            translatedText={documentTranslation}
                            sourceLang={sourceLang}
                            targetLang={targetLang}
                            languages={LANGUAGES}
                          />
                        )}
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="batch">
                    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                      <div className="flex items-start gap-3">
                        <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">Batch Processing with Memory</h3>
                          <p className="text-sm text-gray-700 mb-2">
                            Process multiple documents at once. All translations are automatically saved to your Translation Memory for consistency across projects!
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Automatic OCR for scanned documents</li>
                            <li>• Progress tracking for each file</li>
                            <li>• All segments saved to Translation Memory</li>
                            <li>• Download all translations at once</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <BatchProcessor
                      sourceLang={sourceLang}
                      targetLang={targetLang}
                      languages={LANGUAGES}
                    />
                  </TabsContent>

                  <TabsContent value="conversation">
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-start gap-3">
                        <Mic className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">Real-Time Conversation Mode</h3>
                          <p className="text-sm text-gray-700 mb-2">
                            Have a live conversation with someone who speaks a different language. Each translation is saved to memory for future conversations!
                          </p>
                        </div>
                      </div>
                    </div>

                    <ConversationMode 
                      lang1={sourceLang} 
                      lang2={targetLang} 
                      languages={LANGUAGES}
                    />
                  </TabsContent>

                  <TabsContent value="memory">
                    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                      <div className="flex items-start gap-3">
                        <Database className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">Translation Memory System</h3>
                          <p className="text-sm text-gray-700">
                            Your personal database of translations. Build consistency across all your documents and conversations. 
                            The system automatically suggests matching translations as you type!
                          </p>
                        </div>
                      </div>
                    </div>

                    <TranslationMemoryManager 
                      languages={LANGUAGES}
                      onMemoryUpdate={() => {}}
                    />
                  </TabsContent>

                  <TabsContent value="offline">
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                      <div className="flex items-start gap-3">
                        <Package className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">Offline Translation Packs</h3>
                          <p className="text-sm text-gray-700">
                            Download pre-translated phrase packs for offline use. Perfect for travel, emergencies, or areas with limited internet!
                          </p>
                        </div>
                      </div>
                    </div>

                    <OfflinePacksManager 
                      sourceLang={sourceLang}
                      targetLang={targetLang}
                      languages={LANGUAGES}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </motion.div>

          {translationHistory.length > 0 && activeTab === 'text' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="bg-white/80 backdrop-blur-lg shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-600" />
                    Recent Translations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {translationHistory.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="bg-white">
                              {LANGUAGES.find(l => l.code === item.sourceLang)?.flag} {LANGUAGES.find(l => l.code === item.sourceLang)?.name}
                            </Badge>
                            <ArrowLeftRight className="w-3 h-3 text-gray-400" />
                            <Badge variant="outline" className="bg-white">
                              {LANGUAGES.find(l => l.code === item.targetLang)?.flag} {LANGUAGES.find(l => l.code === item.targetLang)?.name}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">{item.timestamp}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Original:</p>
                            <p className="text-gray-600 line-clamp-2">{item.source}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Translation:</p>
                            <p className="text-gray-600 line-clamp-2">{item.translation}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSourceText(item.source);
                              setSourceLang(item.sourceLang);
                              setTargetLang(item.targetLang);
                              setTranslatedText(item.translation);
                            }}
                            className="text-xs"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Reuse
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid md:grid-cols-6 gap-4 mt-12">
            {[
              {
                icon: Languages,
                title: '30+ Languages',
                description: 'Global coverage',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Database,
                title: 'Smart Memory',
                description: 'Auto-suggestions',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Mic,
                title: 'Live Talk',
                description: 'Real-time speech',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Sparkles,
                title: 'OCR Tech',
                description: 'Extract from images',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: Zap,
                title: 'Batch Process',
                description: 'Multiple files',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Package,
                title: 'Offline Packs',
                description: 'Work anywhere',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-xs">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600">
              Part of the <strong className="text-purple-700">DobryLife.com</strong> wellness ecosystem
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
