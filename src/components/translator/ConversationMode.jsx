import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Copy, Download, UserCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ConversationMode({ lang1, lang2, languages }) {
  const [isRecording, setIsRecording] = useState(false);
  const [activeParticipant, setActiveParticipant] = useState('participant_1');
  const [conversationLog, setConversationLog] = useState([]);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        await handleSpeechResult(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition error. Please try again.');
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSpeechResult = async (transcript) => {
    setIsProcessing(true);
    
    try {
      const isParticipant1 = activeParticipant === 'participant_1';
      const sourceLang = isParticipant1 ? lang1 : lang2;
      const targetLang = isParticipant1 ? lang2 : lang1;
      const sourceLangName = languages.find(l => l.code === sourceLang)?.name;
      const targetLangName = languages.find(l => l.code === targetLang)?.name;

      // Translate using AI
      const prompt = `Translate the following ${sourceLangName} text to ${targetLangName}. Provide ONLY the translation:

${transcript}`;

      const translation = await base44.integrations.Core.InvokeLLM({ prompt });

      // Add to conversation log
      const logEntry = {
        speaker: activeParticipant,
        original_text: transcript,
        translated_text: translation,
        timestamp: new Date().toISOString(),
        sourceLang,
        targetLang
      };

      setConversationLog(prev => [...prev, logEntry]);

      // Speak the translation
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(translation);
        utterance.lang = targetLang;
        speechSynthesis.speak(utterance);
      }

      toast.success('Translated!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = (participant) => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    setActiveParticipant(participant);
    setIsRecording(true);

    const isParticipant1 = participant === 'participant_1';
    const recordingLang = isParticipant1 ? lang1 : lang2;
    
    recognitionRef.current.lang = recordingLang;
    recognitionRef.current.start();
    
    toast.info('Listening... Speak now');
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const saveConversation = async () => {
    try {
      await base44.entities.ConversationTranslation.create({
        session_id: sessionId,
        participant_1_language: lang1,
        participant_2_language: lang2,
        conversation_log: conversationLog,
        total_exchanges: conversationLog.length,
        duration_minutes: Math.round((Date.now() - parseInt(sessionId.split('_')[1])) / 60000)
      });
      
      toast.success('Conversation saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save conversation');
    }
  };

  const exportConversation = () => {
    const lang1Name = languages.find(l => l.code === lang1)?.name;
    const lang2Name = languages.find(l => l.code === lang2)?.name;
    
    let exportText = `Conversation Translation\n`;
    exportText += `${lang1Name} ⟷ ${lang2Name}\n`;
    exportText += `Date: ${new Date().toLocaleString()}\n`;
    exportText += `Total Exchanges: ${conversationLog.length}\n\n`;
    exportText += `---\n\n`;

    conversationLog.forEach((entry, idx) => {
      const speaker = entry.speaker === 'participant_1' ? lang1Name : lang2Name;
      exportText += `[${speaker}]: ${entry.original_text}\n`;
      exportText += `[Translation]: ${entry.translated_text}\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast.success('Conversation exported!');
  };

  const clearConversation = () => {
    setConversationLog([]);
    toast.success('Conversation cleared');
  };

  const lang1Details = languages.find(l => l.code === lang1);
  const lang2Details = languages.find(l => l.code === lang2);

  return (
    <div className="space-y-6">
      {/* Participant Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Participant 1 */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className={`cursor-pointer transition-all ${
            activeParticipant === 'participant_1' && isRecording 
              ? 'ring-4 ring-blue-500 shadow-xl' 
              : 'hover:shadow-lg'
          } ${activeParticipant === 'participant_1' && isRecording ? 'bg-blue-50' : 'bg-white'}`}>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg ${
                  activeParticipant === 'participant_1' && isRecording ? 'animate-pulse' : ''
                }`}>
                  <UserCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <Badge className="mb-3 text-lg px-4 py-1 bg-blue-100 text-blue-800">
                <span className="text-2xl mr-2">{lang1Details?.flag}</span>
                {lang1Details?.name}
              </Badge>
              <Button
                onClick={() => isRecording ? stopRecording() : startRecording('participant_1')}
                disabled={isProcessing || (isRecording && activeParticipant !== 'participant_1')}
                className={`w-full ${
                  activeParticipant === 'participant_1' && isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                size="lg"
              >
                {activeParticipant === 'participant_1' && isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Speaking
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Speaking
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Participant 2 */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className={`cursor-pointer transition-all ${
            activeParticipant === 'participant_2' && isRecording 
              ? 'ring-4 ring-purple-500 shadow-xl' 
              : 'hover:shadow-lg'
          } ${activeParticipant === 'participant_2' && isRecording ? 'bg-purple-50' : 'bg-white'}`}>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg ${
                  activeParticipant === 'participant_2' && isRecording ? 'animate-pulse' : ''
                }`}>
                  <UserCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <Badge className="mb-3 text-lg px-4 py-1 bg-purple-100 text-purple-800">
                <span className="text-2xl mr-2">{lang2Details?.flag}</span>
                {lang2Details?.name}
              </Badge>
              <Button
                onClick={() => isRecording ? stopRecording() : startRecording('participant_2')}
                disabled={isProcessing || (isRecording && activeParticipant !== 'participant_2')}
                className={`w-full ${
                  activeParticipant === 'participant_2' && isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                size="lg"
              >
                {activeParticipant === 'participant_2' && isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Speaking
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Speaking
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Conversation Log */}
      {conversationLog.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Conversation ({conversationLog.length} exchanges)
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportConversation}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={saveConversation}>
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={clearConversation}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {conversationLog.map((entry, index) => {
                  const isParticipant1 = entry.speaker === 'participant_1';
                  const speakerLang = languages.find(l => l.code === entry.sourceLang);
                  const targetLangDetails = languages.find(l => l.code === entry.targetLang);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 rounded-xl ${
                        isParticipant1 
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 ml-0 mr-12' 
                          : 'bg-gradient-to-r from-purple-50 to-pink-50 ml-12 mr-0'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${
                          isParticipant1 
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        } flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
                          {isParticipant1 ? '1' : '2'}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {speakerLang?.flag} {speakerLang?.name}
                            </Badge>
                            <p className="text-gray-900 font-medium">{entry.original_text}</p>
                          </div>
                          <div className="border-t border-gray-200 pt-2">
                            <Badge variant="outline" className="mb-2 bg-white">
                              {targetLangDetails?.flag} {targetLangDetails?.name}
                            </Badge>
                            <p className="text-gray-700">{entry.translated_text}</p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const utterance = new SpeechSynthesisUtterance(entry.translated_text);
                                utterance.lang = entry.targetLang;
                                speechSynthesis.speak(utterance);
                              }}
                            >
                              <Volume2 className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(entry.translated_text);
                                toast.success('Copied!');
                              }}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Indicator */}
      {isProcessing && (
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
          >
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Processing translation...</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}