
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  BookOpen, 
  Activity,
  Zap,
  BarChart3,
  Settings,
  Sparkles,
  Heart,
  Brain,
  CheckCircle,
  X,
  Users,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingFlow from '@/components/soullink/OnboardingFlow';
import ThemeCustomizer from '@/components/soullink/ThemeCustomizer';
import CompanionAnalytics from '@/components/soullink/CompanionAnalytics';
import GuidedJournaling from '@/components/soullink/GuidedJournaling';
import MoodTracking from '@/components/soullink/MoodTracking';
import PersonalizedRecommendations from '@/components/soullink/PersonalizedRecommendations';
import FeatureGate from '@/components/SubscriptionGate';
import SoulLinkCommunity from '@/components/soullink/SoulLinkCommunity';
import ConversationMemory, { extractMemoriesFromConversation, getRelevantMemories, memoryTypeConfig } from '@/components/soullink/ConversationMemory';
import HealthDataIntegration from '@/components/soullink/HealthDataIntegration';

const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export default function SoulLink() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('sunset_dream');
  const [showMemoryExtraction, setShowMemoryExtraction] = useState(false);
  const [extractedMemories, setExtractedMemories] = useState([]);
  const [memoriesUsedInLastResponse, setMemoriesUsedInLastResponse] = useState([]);
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const queryClient = useQueryClient();

  // Listen for tab change events
  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail);
    };

    window.addEventListener('changeSoulLinkTab', handleTabChange);
    return () => window.removeEventListener('changeSoulLinkTab', handleTabChange);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['companion-settings'],
    queryFn: async () => {
      try {
        const allSettings = await base44.entities.CompanionSettings.list();
        if (allSettings.length > 0) {
          setCurrentTheme(allSettings[0].theme || 'sunset_dream');
          return allSettings[0];
        }
        return null;
      } catch (error) {
        console.error('Error fetching companion settings:', error);
        return null;
      }
    },
  });

  const { data: conversations } = useQuery({
    queryKey: ['companion-conversations'],
    queryFn: async () => {
      try {
        return await base44.entities.CompanionConversation.list('-created_date');
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    },
  });

  const { data: companionMemories = [] } = useQuery({
    queryKey: ['companion-memories'],
    queryFn: async () => {
      try {
        return await base44.entities.CompanionMemory.filter({ is_active: true }, '-importance_score');
      } catch (error) {
        console.error('Error fetching memories:', error);
        return [];
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'voice.wav', { type: 'audio/wav' });
        sendMessage('', audioFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendMessage = async (messageContent = message, voiceFile = null) => {
    if (!messageContent.trim() && !voiceFile) return;

    const userMessage = {
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage('');
    setIsThinking(true);
    setMemoriesUsedInLastResponse([]);
    scrollToBottom();

    try {
      const relevantMemories = await getRelevantMemories(messageContent, companionMemories);
      
      const memoryContext = relevantMemories.length > 0
        ? `\n\nIMPORTANT CONTEXT - Key facts you remember about this user:\n${relevantMemories.map((m, i) => `${i + 1}. ${m.memory_content}${m.context ? ` (${m.context})` : ''}`).join('\n')}\n\nReference these memories naturally when relevant to show you truly know and care about them.`
        : '';

      if (relevantMemories.length > 0) {
        setMemoriesUsedInLastResponse(relevantMemories);
        for (const memory of relevantMemories) {
          await base44.entities.CompanionMemory.update(memory.id, {
            reference_count: (memory.reference_count || 0) + 1,
            last_referenced: new Date().toISOString()
          });
        }
      }

      const conversationHistory = updatedMessages
        .slice(-10)
        .map(m => `${m.role === 'user' ? 'User' : settings?.companion_name || 'Companion'}: ${m.content}`)
        .join('\n\n');

      const systemPrompt = buildSystemPrompt(settings);

      const fullPrompt = `${systemPrompt}

${memoryContext}

Recent conversation:
${conversationHistory}

Respond with warmth and empathy. When appropriate, reference what you remember to show genuine care and understanding.`;

      let aiResponse;
      if (voiceFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: voiceFile });
        aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          file_urls: [file_url]
        });
      } else {
        aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt
        });
      }

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        memories_used: relevantMemories.map(m => m.id)
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      const userMessageCount = finalMessages.filter(m => m.role === 'user').length;
      if (userMessageCount % 5 === 0 && userMessageCount > 0) {
        const newMemories = await extractMemoriesFromConversation(finalMessages, companionMemories);
        
        if (newMemories.length > 0) {
          setExtractedMemories(newMemories);
          setShowMemoryExtraction(true);
        }
      }

      if (settings?.use_voice_responses && settings?.voice_id) {
        try {
          const speechResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `Convert to natural speech (remove markdown): ${aiResponse}`
          });

          const voiceData = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${settings.voice_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': 'demo'
            },
            body: JSON.stringify({
              text: speechResponse,
              voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
          });

          if (voiceData.ok) {
            const audioBlob = await voiceData.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
          }
        } catch (error) {
          console.error('Voice error:', error);
        }
      }

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages(messages);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAcceptMemories = async () => {
    try {
      for (const memory of extractedMemories) {
        await base44.entities.CompanionMemory.create(memory);
      }
      queryClient.invalidateQueries(['companion-memories']);
      toast.success(`Added ${extractedMemories.length} new memories! 🧠`);
      setShowMemoryExtraction(false);
      setExtractedMemories([]);
    } catch (error) {
      console.error('Error saving memories:', error);
      toast.error('Failed to save memories');
    }
  };

  const handleRejectMemories = () => {
    setShowMemoryExtraction(false);
    setExtractedMemories([]);
  };

  const buildSystemPrompt = (settings) => {
    if (!settings) return 'You are a compassionate AI companion.';

    let prompt = `You are ${settings.companion_name || 'SoulLink'}, an AI companion in a ${settings.relationship_mode || 'friend'} relationship with the user.`;

    if (settings.user_preferred_name) {
      prompt += ` The user prefers to be called ${settings.user_preferred_name}.`;
    }

    const toneMap = {
      warm_and_affectionate: 'warm, caring, and affectionate',
      casual_and_friendly: 'casual, friendly, and relaxed',
      calm_and_reflective: 'calm, thoughtful, and reflective',
      playful_and_lighthearted: 'playful, lighthearted, and fun'
    };

    prompt += ` Your tone should be ${toneMap[settings.tone_preference] || 'warm and supportive'}.`;

    if (settings.use_terms_of_endearment && settings.preferred_endearments?.length > 0) {
      prompt += ` You may use terms of endearment like: ${settings.preferred_endearments.join(', ')}.`;
    }

    if (settings.custom_instructions) {
      prompt += ` Additional instructions: ${settings.custom_instructions}`;
    }

    if (settings.topics_to_avoid?.length > 0) {
      prompt += ` Avoid discussing: ${settings.topics_to_avoid.join(', ')}.`;
    }

    return prompt;
  };

  const themeStyles = {
    sunset_dream: { bg: 'from-orange-100 via-pink-50 to-purple-100', card: 'from-orange-50 to-pink-50' },
    ocean_breeze: { bg: 'from-blue-100 via-cyan-50 to-teal-100', card: 'from-blue-50 to-cyan-50' },
    forest_calm: { bg: 'from-green-100 via-emerald-50 to-teal-100', card: 'from-green-50 to-emerald-50' },
    midnight_sky: { bg: 'from-indigo-100 via-purple-50 to-pink-100', card: 'from-indigo-50 to-purple-50' },
    lavender_fields: { bg: 'from-purple-100 via-pink-50 to-purple-100', card: 'from-purple-50 to-pink-50' }
  };

  const activeTheme = themeStyles[currentTheme] || themeStyles.sunset_dream;

  // Show onboarding if no settings exist (for all users including admins)
  if (!user || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-lg p-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading your companion...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return <OnboardingFlow onComplete={() => queryClient.invalidateQueries(['companion-settings'])} />;
  }

  return (
    <FeatureGate
      featureKey="soullink"
      featureName="SoulLink AI Companion"
      featureDescription="Connect emotionally with your AI companion for daily support, reflection, and meaningful conversations."
    >
      <div className={`min-h-screen bg-gradient-to-br ${activeTheme.bg} p-4`}>
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-6 bg-white/80 backdrop-blur-sm text-xs sm:text-sm">
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Journal</span>
              </TabsTrigger>
              <TabsTrigger value="mood" className="flex items-center gap-1">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Mood</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-1">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-1">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">For You</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Community</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              {companionMemories.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-900 font-semibold">
                          {settings?.companion_name || 'Your companion'} remembers {companionMemories.length} details about you
                        </span>
                        <Button onClick={() => setActiveTab('settings')} size="sm" variant="ghost" className="ml-auto text-xs">
                          View →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <AnimatePresence>
                {memoriesUsedInLastResponse.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-blue-900 mb-1">
                              Referenced {memoriesUsedInLastResponse.length} memories:
                            </p>
                            <div className="space-y-1">
                              {memoriesUsedInLastResponse.slice(0, 3).map((mem, i) => (
                                <p key={i} className="text-xs text-blue-700">• {mem.memory_content}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showMemoryExtraction && extractedMemories.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl bg-white">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            New Memories Discovered
                          </span>
                          <button onClick={handleRejectMemories} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                          </button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                          I noticed some important details. Should I remember these?
                        </p>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {extractedMemories.map((mem, i) => (
                            <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <Badge className="bg-purple-600 mb-2">
                                {memoryTypeConfig[mem.memory_type]?.label || mem.memory_type}
                              </Badge>
                              <p className="text-sm text-gray-900 font-medium">{mem.memory_content}</p>
                              {mem.context && <p className="text-xs text-gray-600 mt-1">{mem.context}</p>}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handleAcceptMemories} className="flex-1 bg-purple-600">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Remember These
                          </Button>
                          <Button onClick={handleRejectMemories} variant="outline" className="flex-1">
                            <X className="w-4 h-4 mr-2" />
                            No Thanks
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className={`bg-gradient-to-r ${activeTheme.card} backdrop-blur-lg shadow-2xl border-2 border-white/50`}>
                <CardContent className="p-6">
                  <div className="h-96 overflow-y-auto mb-4 space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/80 text-gray-800 backdrop-blur-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder="Share what's on your mind..."
                      className="flex-1 resize-none"
                      rows={2}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => (isRecording ? stopRecording() : startRecording())}
                        variant={isRecording ? "destructive" : "outline"}
                        size="icon"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => sendMessage()} disabled={isThinking} size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="journal">
              <GuidedJournaling settings={settings} />
            </TabsContent>

            <TabsContent value="mood">
              <MoodTracking settings={settings} />
            </TabsContent>

            <TabsContent value="health">
              <HealthDataIntegration settings={settings} />
            </TabsContent>

            <TabsContent value="recommendations">
              <PersonalizedRecommendations settings={settings} />
            </TabsContent>

            <TabsContent value="community">
              <SoulLinkCommunity settings={settings} />
            </TabsContent>

            <TabsContent value="analytics">
              <CompanionAnalytics conversations={conversations || []} settings={settings} />
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <ThemeCustomizer settings={settings} onSettingsUpdate={() => queryClient.invalidateQueries(['companion-settings'])} />
                <ConversationMemory settings={settings} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FeatureGate>
  );
}
