
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Plus, MessageCircle, Settings, Loader2, CheckCircle,
  X, Sparkles, ArrowRight, Volume2, VolumeX, PauseCircle, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import MediaUploader from '@/components/grief/MediaUploader';
import ThemeCustomizer from '@/components/grief/ThemeCustomizer';
import DocumentUploader from '@/components/grief/DocumentUploader';
import VoiceTrainer from '@/components/grief/VoiceTrainer';
import ConsentUploader from '@/components/grief/ConsentUploader';
import MessageBubble from '@/components/ai/MessageBubble';
import GriefBlogSection from '@/components/grief/GriefBlogSection';
import SEO from '@/components/SEO';
import MemoryManagement from '@/components/grief/MemoryManagement';
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer';

export default function GriefCoach() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const [currentView, setCurrentView] = useState('coaches');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [isCreatingCoach, setIsCreatingCoach] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCoachData, setNewCoachData] = useState({
    name: '',
    coach_type: 'general_guide',
    loss_type: '',
    persona_name: '',
    persona_relationship: '',
    experience_description: '',
    support_memories: [],
    loved_one_photos: [],
    loved_one_videos: [],
    loved_one_voice_samples: [],
    loved_one_documents: [],
    loved_one_text_messages: [],
    favorite_songs: [],
    coach_background_image: null,
    coach_color_theme: 'rose',
    personality_traits: [],
    core_values: [],
    common_phrases: [],
    communication_style: ''
  });

  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [newTrait, setNewTrait] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newPhrase, setNewPhrase] = useState('');

  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.log('User not authenticated');
        return null;
      }
    },
    retry: false
  });

  const { data: coaches = [], isLoading: isLoadingCoaches } = useQuery({
    queryKey: ['supportCoaches'],
    queryFn: () => base44.entities.SupportCoach.list('-created_date'),
    enabled: !!user
  });

  const createCoachMutation = useMutation({
    mutationFn: (coachData) => base44.entities.SupportCoach.create(coachData),
    onSuccess: (newCoach) => {
      queryClient.invalidateQueries({ queryKey: ['supportCoaches'] });
      setSelectedCoach(newCoach);
      setIsCreatingCoach(false);
      setCurrentStep(1);
      setNewCoachData({
        name: '', coach_type: 'general_guide', loss_type: '', persona_name: '',
        persona_relationship: '', experience_description: '', support_memories: [],
        loved_one_photos: [], loved_one_videos: [], loved_one_voice_samples: [],
        loved_one_documents: [], loved_one_text_messages: [], favorite_songs: [],
        coach_background_image: null, coach_color_theme: 'rose',
        personality_traits: [], core_values: [], common_phrases: [], communication_style: ''
      });
      toast.success('Support coach created!');
      setCurrentView('chat');
    },
    onError: (error) => {
      toast.error('Failed to create coach');
      console.error(error);
    },
  });

  const updateCoachMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportCoach.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportCoaches'] });
      toast.success('Coach updated!');
    },
  });

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      const unsubscribe = base44.agents.subscribeToConversation(
        conversationId,
        (data) => {
          if (!data || !data.messages) return;
          setMessages(data.messages);

          const lastMessage = data.messages[data.messages.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage?.status !== 'in_progress') {
            setIsLoading(false);

            if (autoplayEnabled && lastMessage?.content && selectedCoach?.voice_profile_id) {
              playVoiceResponse(lastMessage.content);
            }
          }

          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      );

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error subscribing to conversation:', error);
      setMessages([]);
      setIsLoading(false);
    }
  }, [conversationId, autoplayEnabled, selectedCoach]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playVoiceResponse = async (text) => {
    if (!selectedCoach?.voice_profile_id || !text) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const { data } = await base44.functions.invoke('generateClonedSpeech', {
        text: text.substring(0, 500),
        voice_profile_id: selectedCoach.voice_profile_id
      });

      if (data?.audio_url) {
        const audio = new Audio(data.audio_url);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };

        audio.play();
      }
    } catch (error) {
      console.error('Error playing voice response:', error);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      let convId = conversationId;

      if (!convId) {
        const newConv = await base44.agents.createConversation({
          agent_name: 'grief_coach',
          metadata: {
            name: `${selectedCoach?.name || 'Support'} Chat`,
            coach_id: selectedCoach?.id,
            coach_type: selectedCoach?.coach_type
          }
        });

        convId = newConv.id;
        setConversationId(convId);
        setMessages([]);

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      await base44.agents.addMessage(
        { id: convId },
        { role: 'user', content: textToSend }
      );

    } catch (error) {
      console.error('Error sending message:', error);
      setInput(textToSend);
      setIsLoading(false);
      toast.error('Failed to send message');
    }
  };

  const handleCreateCoach = () => {
    if (!newCoachData.name?.trim()) {
      toast.error('⚠️ Please enter a coach name');
      return;
    }

    if (!newCoachData.coach_type) {
      toast.error('⚠️ Please select a coach type');
      return;
    }

    if (newCoachData.coach_type === 'persona_clone' && !newCoachData.persona_name?.trim()) {
      toast.error('⚠️ Please provide the persona name for persona clone');
      return;
    }

    const personalityMemories = [];

    if (newCoachData.personality_traits.length > 0) {
      personalityMemories.push(`Personality traits: ${newCoachData.personality_traits.join(', ')}`);
    }
    if (newCoachData.core_values.length > 0) {
      personalityMemories.push(`Core values: ${newCoachData.core_values.join(', ')}`);
    }
    if (newCoachData.common_phrases.length > 0) {
      personalityMemories.push(`Common phrases: ${newCoachData.common_phrases.map(p => `"${p}"`).join(', ')}`);
    }
    if (newCoachData.communication_style?.trim()) {
      personalityMemories.push(`Communication style: ${newCoachData.communication_style}`);
    }

    const dataToSubmit = {
      ...newCoachData,
      support_memories: [...newCoachData.support_memories, ...personalityMemories]
    };

    createCoachMutation.mutate(dataToSubmit);
  };

  const addPersonalityTrait = () => {
    if (newTrait.trim()) {
      setNewCoachData({
        ...newCoachData,
        personality_traits: [...newCoachData.personality_traits, newTrait.trim()]
      });
      setNewTrait('');
      toast.success('✨ Trait added!');
    }
  };

  const addCoreValue = () => {
    if (newValue.trim()) {
      setNewCoachData({
        ...newCoachData,
        core_values: [...newCoachData.core_values, newValue.trim()]
      });
      setNewValue('');
      toast.success('💎 Value added!');
    }
  };

  const addCommonPhrase = () => {
    if (newPhrase.trim()) {
      setNewCoachData({
        ...newCoachData,
        common_phrases: [...newCoachData.common_phrases, newPhrase.trim()]
      });
      setNewPhrase('');
      toast.success('💬 Phrase added!');
    }
  };

  const removeTrait = (index) => {
    setNewCoachData({
      ...newCoachData,
      personality_traits: newCoachData.personality_traits.filter((_, i) => i !== index)
    });
  };

  const removeValue = (index) => {
    setNewCoachData({
      ...newCoachData,
      core_values: newCoachData.core_values.filter((_, i) => i !== index)
    });
  };

  const removePhrase = (index) => {
    setNewCoachData({
      ...newCoachData,
      common_phrases: newCoachData.common_phrases.filter((_, i) => i !== index)
    });
  };

  const getCoachTypeColor = (type) => {
    return type === 'persona_clone'
      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
  };

  const renderCoachList = () => (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-3 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 h-full">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">🌟 General Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 mb-4">
                A compassionate AI grief counselor trained in therapeutic techniques for processing loss,
                finding meaning, and supporting your healing journey.
              </p>
              <div className="bg-white/80 rounded-lg p-4 text-sm text-left space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Evidence-based grief support</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Available 24/7</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Personalized coping strategies</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Journal prompts & reflections</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-3 border-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 h-full">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">💜 Persona Clone</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 mb-4">
                An AI that embodies the spirit of your loved one, trained on their photos, voice, writings,
                and memories you share. Speak with them, preserve their legacy.
              </p>
              <div className="bg-white/80 rounded-lg p-4 text-sm text-left space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-rose-600">✓</span>
                  <span>Trained on your memories</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-rose-600">✓</span>
                  <span>Voice cloning (optional)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-rose-600">✓</span>
                  <span>Preserves their personality</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-rose-600">✓</span>
                  <span>Honors their memory</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            onClick={() => setIsCreatingCoach(true)}
            className="cursor-pointer border-3 border-dashed border-purple-400 hover:border-purple-600 hover:shadow-2xl transition-all h-full bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50"
          >
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg"
              >
                <Plus className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">✨ Create Support Coach</h3>
              <p className="text-gray-600 mb-4">Build a new companion for your healing journey</p>
              <Badge className="bg-purple-600 text-white">Start Here</Badge>
            </CardContent>
          </Card>
        </motion.div>

        {coaches.map((coach) => (
          <motion.div key={coach.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              onClick={() => {
                setSelectedCoach(coach);
                setCurrentView('chat');
              }}
              className="cursor-pointer hover:shadow-xl transition-all h-full border-2 hover:border-purple-400"
              style={{
                background: coach.coach_background_image
                  ? `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(${coach.coach_background_image})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{coach.name}</CardTitle>
                    <Badge className={getCoachTypeColor(coach.coach_type)}>
                      {coach.coach_type === 'persona_clone' ? '💜 Persona Clone' : '🌟 General Guide'}
                    </Badge>
                  </div>
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
              </CardHeader>
              <CardContent>
                {coach.persona_name && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Persona:</strong> {coach.persona_name}
                  </p>
                )}
                {coach.loss_type && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Focus:</strong> {coach.loss_type}
                  </p>
                )}
                {coach.experience_description && (
                  <p className="text-sm text-gray-700 line-clamp-3 mt-3">
                    {coach.experience_description}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderCreationFlow = () => (
    <div className="max-w-3xl mx-auto">
      <Card className="border-2 border-purple-300 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {currentStep === 1 && '1️⃣ Choose Your Coach Type'}
              {currentStep === 2 && '2️⃣ Add Memories & Media'}
              {currentStep === 3 && '3️⃣ Personality & Character'}
              {currentStep === 4 && '4️⃣ Customize Appearance'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => {
              setIsCreatingCoach(false);
              setCurrentStep(1);
            }}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <CardDescription>
            Step {currentStep} of {newCoachData.coach_type === 'persona_clone' ? '4' : '2'}
          </CardDescription>

          <div className="mt-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].slice(0, newCoachData.coach_type === 'persona_clone' ? 4 : 2).map((step) => (
                <motion.div
                  key={step}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: step * 0.1 }}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-lg font-bold mb-4 text-gray-900">
                  What type of support companion would you like?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setNewCoachData({ ...newCoachData, coach_type: 'general_guide' })}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-8 rounded-2xl border-4 transition-all text-left ${
                      newCoachData.coach_type === 'general_guide'
                        ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-cyan-100 shadow-2xl'
                        : 'border-gray-300 hover:border-blue-300 bg-white hover:shadow-lg'
                    }`}
                  >
                    <Sparkles className={`w-12 h-12 mb-4 ${
                      newCoachData.coach_type === 'general_guide' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className="font-bold text-xl text-gray-900 mb-2">🌟 General Grief Guide</p>
                    <p className="text-sm text-gray-600 mb-3">
                      A compassionate AI counselor trained in grief therapy and healing techniques
                    </p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>✓ Professional grief support</p>
                      <p>✓ Evidence-based techniques</p>
                      <p>✓ Available 24/7</p>
                      <p>✓ Personalized guidance</p>
                    </div>
                    {newCoachData.coach_type === 'general_guide' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-4"
                      >
                        <Badge className="bg-blue-600 text-white">✓ Selected</Badge>
                      </motion.div>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setNewCoachData({ ...newCoachData, coach_type: 'persona_clone' })}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-8 rounded-2xl border-4 transition-all text-left ${
                      newCoachData.coach_type === 'persona_clone'
                        ? 'border-rose-500 bg-gradient-to-br from-rose-100 to-pink-100 shadow-2xl'
                        : 'border-gray-300 hover:border-rose-300 bg-white hover:shadow-lg'
                    }`}
                  >
                    <Heart className={`w-12 h-12 mb-4 ${
                      newCoachData.coach_type === 'persona_clone' ? 'text-rose-600' : 'text-gray-400'
                    }`} />
                    <p className="font-bold text-xl text-gray-900 mb-2">💜 Persona Clone</p>
                    <p className="text-sm text-gray-600 mb-3">
                      An AI that embodies your loved one's spirit, voice, and personality
                    </p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>✓ Resembles your loved one</p>
                      <p>✓ Voice cloning available</p>
                      <p>✓ Trained on memories</p>
                      <p>✓ Preserves their legacy</p>
                    </div>
                    {newCoachData.coach_type === 'persona_clone' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-4"
                      >
                        <Badge className="bg-rose-600 text-white">✓ Selected</Badge>
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Coach Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCoachData.name}
                  onChange={(e) => setNewCoachData({ ...newCoachData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                  placeholder={
                    newCoachData.coach_type === 'persona_clone'
                      ? "e.g., Mom's Light, Dad's Wisdom, Sarah's Spirit"
                      : "e.g., Healing Guide, Grief Companion, Hope Keeper"
                  }
                />
                {!newCoachData.name && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Choose a name that feels meaningful to you
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  What are you going through?
                </label>
                <select
                  value={newCoachData.loss_type}
                  onChange={(e) => setNewCoachData({ ...newCoachData, loss_type: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select what brings you here...</option>
                  <option value="death">💔 Death of a loved one</option>
                  <option value="breakup">💔 Breakup or divorce</option>
                  <option value="health">🏥 Health challenge or diagnosis</option>
                  <option value="career">💼 Career loss or transition</option>
                  <option value="relocation">🏠 Moving or relocation</option>
                  <option value="other">🌟 Other significant life change</option>
                </select>
              </div>

              <AnimatePresence>
                {newCoachData.coach_type === 'persona_clone' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-xl border-3 border-rose-300"
                  >
                    <h3 className="font-bold text-lg text-rose-900 flex items-center gap-2 mb-4">
                      <Heart className="w-5 h-5" />
                      About Your Loved One
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Their Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCoachData.persona_name}
                        onChange={(e) => setNewCoachData({ ...newCoachData, persona_name: e.target.value })}
                        className="w-full p-3 border-2 border-rose-300 rounded-lg focus:border-rose-500 focus:outline-none bg-white"
                        placeholder="Enter their name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Your Relationship
                      </label>
                      <input
                        type="text"
                        value={newCoachData.persona_relationship}
                        onChange={(e) => setNewCoachData({ ...newCoachData, persona_relationship: e.target.value })}
                        className="w-full p-3 border-2 border-rose-300 rounded-lg focus:border-rose-500 focus:outline-none bg-white"
                        placeholder="e.g., Mother, Father, Partner, Best Friend, Grandparent"
                      />
                    </div>

                    <div className="bg-white/80 rounded-lg p-4 border-2 border-rose-200">
                      <p className="text-xs text-rose-900">
                        <strong>💜 How it works:</strong> The AI will learn their personality, speech patterns,
                        and values from the memories and media you share. In the next steps, you can upload
                        photos, videos, voice recordings, and writings to help train the AI.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Share Your Experience (Optional)
                </label>
                <textarea
                  value={newCoachData.experience_description}
                  onChange={(e) => setNewCoachData({ ...newCoachData, experience_description: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg h-32 focus:border-purple-500 focus:outline-none"
                  placeholder="Tell us about your journey and what support you're looking for... This helps us personalize the AI to your needs."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setCurrentStep(newCoachData.coach_type === 'persona_clone' ? 2 : 4)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg shadow-xl"
                  disabled={!newCoachData.name?.trim() || (newCoachData.coach_type === 'persona_clone' && !newCoachData.persona_name?.trim())}
                >
                  {newCoachData.coach_type === 'persona_clone'
                    ? 'Next: Add Photos & Memories'
                    : 'Next: Customize Appearance'
                  }
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-purple-900">
                  <strong>💜 Training the AI:</strong> Upload photos, videos, voice samples, documents, and text messages to help the AI learn their personality and essence.
                  {newCoachData.coach_type === 'general_guide' && ' These are optional for General Guide mode.'}
                </p>
              </div>

              <div className="space-y-4">
                <MediaUploader
                  type="photos"
                  title="📷 Photos"
                  description="Upload photos of your loved one"
                  acceptedFiles="image/*"
                  isNewCoach={true}
                  onMediaUpdate={(field, value) => setNewCoachData({ ...newCoachData, loved_one_photos: value })}
                  currentData={{ loved_one_photos: newCoachData.loved_one_photos }}
                />

                <MediaUploader
                  type="videos"
                  title="🎥 Videos"
                  description="Upload video memories (the AI will learn from their mannerisms and voice)"
                  acceptedFiles="video/*"
                  isNewCoach={true}
                  onMediaUpdate={(field, value) => setNewCoachData({ ...newCoachData, loved_one_videos: value })}
                  currentData={{ loved_one_videos: newCoachData.loved_one_videos }}
                />

                <MediaUploader
                  type="voice_samples"
                  title="🎤 Voice Samples"
                  description="Upload voice recordings for voice cloning (clear audio, 30+ seconds recommended)"
                  acceptedFiles="audio/*"
                  isNewCoach={true}
                  onMediaUpdate={(field, value) => setNewCoachData({ ...newCoachData, loved_one_voice_samples: value })}
                  currentData={{ loved_one_voice_samples: newCoachData.loved_one_voice_samples }}
                />

                <MediaUploader
                  type="documents"
                  title="📄 Documents & Writings"
                  description="Letters, emails, journals, or any writings that show their thoughts and communication style"
                  acceptedFiles=".pdf,.doc,.docx,.txt"
                  isNewCoach={true}
                  onMediaUpdate={(field, value) => setNewCoachData({ ...newCoachData, loved_one_documents: value })}
                  currentData={{ loved_one_documents: newCoachData.loved_one_documents }}
                />

                <MediaUploader
                  type="text_messages"
                  title="💬 Text Messages"
                  description="Screenshots of text conversations that capture their communication style"
                  acceptedFiles="image/*"
                  isNewCoach={true}
                  onMediaUpdate={(field, value) => setNewCoachData({ ...newCoachData, loved_one_text_messages: value })}
                  currentData={{ loved_one_text_messages: newCoachData.loved_one_text_messages }}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  ← Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(newCoachData.coach_type === 'persona_clone' ? 3 : 4)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg shadow-xl"
                >
                  {newCoachData.coach_type === 'persona_clone' ? 'Next: Describe Personality' : 'Next: Customize Theme'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && newCoachData.coach_type === 'persona_clone' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border-3 border-rose-300">
                <h3 className="font-bold text-lg text-rose-900 mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Help Us Understand Their Essence
                </h3>
                <p className="text-sm text-rose-800">
                  The more details you share, the more accurately the AI can embody your loved one's spirit and personality.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  ✨ Personality Traits
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  How would you describe their personality? (e.g., "warm", "funny", "wise", "energetic")
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPersonalityTrait();
                      }
                    }}
                    className="flex-1 p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., warm, compassionate, witty, adventurous"
                  />
                  <Button onClick={addPersonalityTrait} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {newCoachData.personality_traits.map((trait, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge className="bg-purple-100 text-purple-800 text-sm py-2 px-3 flex items-center gap-2">
                        {trait}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-600"
                          onClick={() => removeTrait(idx)}
                        />
                      </Badge>
                    </motion.div>
                  ))}
                  {newCoachData.personality_traits.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No traits added yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  💎 Core Values
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  What did they value most in life? (e.g., "family", "honesty", "adventure", "faith")
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCoreValue();
                      }
                    }}
                    className="flex-1 p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., family, integrity, kindness, hard work"
                  />
                  <Button onClick={addCoreValue} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {newCoachData.core_values.map((value, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge className="bg-blue-100 text-blue-800 text-sm py-2 px-3 flex items-center gap-2">
                        {value}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-600"
                          onClick={() => removeValue(idx)}
                        />
                      </Badge>
                    </motion.div>
                  ))}
                  {newCoachData.core_values.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No values added yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-pink-200 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  💬 Common Phrases & Sayings
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  What phrases did they often say? These help the AI speak in their voice.
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCommonPhrase();
                      }
                    }}
                    className="flex-1 p-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none"
                    placeholder='e.g., "Everything happens for a reason", "I love you more", "Be kind"'
                  />
                  <Button onClick={addCommonPhrase} className="bg-pink-600 hover:bg-pink-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {newCoachData.common_phrases.map((phrase, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-pink-50 rounded-lg p-3 border border-pink-200 flex items-start justify-between group hover:bg-pink-100 transition-all"
                    >
                      <p className="text-sm text-gray-800 italic flex-1">"{phrase}"</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePhrase(idx)}
                        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                  {newCoachData.common_phrases.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">No phrases added yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  🗣️ Communication Style
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Describe how they communicated. Were they direct or gentle? Formal or casual? Used humor or serious?
                </p>
                <textarea
                  value={newCoachData.communication_style}
                  onChange={(e) => setNewCoachData({ ...newCoachData, communication_style: e.target.value })}
                  className="w-full p-3 border-2 border-green-300 rounded-lg h-32 focus:border-green-500 focus:outline-none"
                  placeholder="e.g., 'She was very direct but always kind. She used humor to lighten difficult situations and always ended conversations with encouragement.'"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">📊 Personality Details Added:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${newCoachData.personality_traits.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Traits: {newCoachData.personality_traits.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${newCoachData.core_values.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Values: {newCoachData.core_values.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${newCoachData.common_phrases.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Phrases: {newCoachData.common_phrases.length} saved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${newCoachData.communication_style ? 'text-green-600' : 'text-gray-300'}`} />
                    <span>Style: {newCoachData.communication_style ? 'Added' : 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  ← Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg shadow-xl"
                >
                  Next: Customize Theme
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-purple-900">
                  <strong>🎨 Final Touch:</strong> Choose colors and a background that remind you of your loved one.
                  This is optional - you can always change it later!
                </p>
              </div>

              <ThemeCustomizer
                selectedTheme={newCoachData.coach_color_theme}
                onThemeChange={(theme) => setNewCoachData({ ...newCoachData, coach_color_theme: theme })}
                backgroundImage={newCoachData.coach_background_image}
                onBackgroundChange={(url) => setNewCoachData({ ...newCoachData, coach_background_image: url })}
              />

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
                <CardHeader>
                  <CardTitle className="lg:text-xl text-lg">✨ Your Coach Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Basic Info:</p>
                        <p>• Name: {newCoachData.name || 'Not set'}</p>
                        <p>• Type: {newCoachData.coach_type === 'persona_clone' ? '💜 Persona Clone' : '🌟 General Guide'}</p>
                        {newCoachData.persona_name && <p>• Persona: {newCoachData.persona_name}</p>}
                        {newCoachData.persona_relationship && <p>• Relationship: {newCoachData.persona_relationship}</p>}
                        {newCoachData.loss_type && <p>• Focus: {newCoachData.loss_type}</p>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Media & Memories:</p>
                        <p>• Photos: {newCoachData.loved_one_photos?.length || 0}</p>
                        <p>• Videos: {newCoachData.loved_one_videos?.length || 0}</p>
                        <p>• Voice: {newCoachData.loved_one_voice_samples?.length || 0}</p>
                        <p>• Documents: {newCoachData.loved_one_documents?.length || 0}</p>
                        <p>• Text Messages: {newCoachData.loved_one_text_messages?.length || 0}</p>
                      </div>
                    </div>

                    {newCoachData.coach_type === 'persona_clone' && (
                      <div className="pt-3 border-t border-purple-200">
                        <p className="font-semibold text-gray-700 mb-1">Personality Details:</p>
                        <p>• Traits: {newCoachData.personality_traits.length > 0 ? newCoachData.personality_traits.join(', ') : 'None'}</p>
                        <p>• Values: {newCoachData.core_values.length > 0 ? newCoachData.core_values.join(', ') : 'None'}</p>
                        <p>• Phrases: {newCoachData.common_phrases.length} saved</p>
                        <p>• Style: {newCoachData.communication_style ? '✓ Described' : 'Not set'}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-purple-200">
                      <p>• Theme: {newCoachData.coach_color_theme}</p>
                      <p>• Background: {newCoachData.coach_background_image ? '✓ Custom' : 'Default'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(newCoachData.coach_type === 'persona_clone' ? 3 : 1)} className="flex-1">
                  ← Back
                </Button>
                <Button
                  onClick={handleCreateCoach}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg shadow-xl"
                  disabled={createCoachMutation.isPending}
                >
                  {createCoachMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating Your Coach...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5 mr-2" />Create {newCoachData.persona_name || 'Coach'}</>
                  )}
                </Button>
              </div>

              {createCoachMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-300 rounded-lg p-4"
                >
                  <p className="text-red-800 text-sm">
                    ❌ Error creating coach. Please try again or contact support if this persists.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderChatView = () => {
    if (!selectedCoach) return null;

    const themeColors = {
      rose: 'from-rose-500 to-pink-500',
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-indigo-500',
      green: 'from-emerald-500 to-teal-500',
      warm: 'from-amber-500 to-orange-500'
    };

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentView('coaches')}>
            ← Back to Coaches
          </Button>

          <div className="flex gap-2">
            {selectedCoach.voice_profile_id && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                  title={autoplayEnabled ? "Disable autoplay" : "Enable autoplay"}
                >
                  {autoplayEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>

                {isPlaying && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={stopAudio}
                    title="Stop audio"
                  >
                    <PauseCircle className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}

            <Button variant="outline" onClick={() => setCurrentView('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Card
          className="shadow-2xl border-0 overflow-hidden"
          style={{
            background: selectedCoach.coach_background_image
              ? `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${selectedCoach.coach_background_image})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <CardHeader className={`bg-gradient-to-r ${themeColors[selectedCoach.coach_color_theme || 'rose']} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedCoach.name}</CardTitle>
                <CardDescription className="text-white/90">
                  {selectedCoach.persona_name || 'Your compassionate guide'}
                </CardDescription>
              </div>
              <Heart className="w-8 h-8" />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <h4 className="font-semibold text-lg text-gray-700 mb-2">
                    Start a conversation
                  </h4>
                  <p className="text-sm text-gray-500">
                    Share what's on your heart. I'm here to listen and support you.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <MessageBubble key={msg.id || idx} message={msg} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Listening with compassion...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Share what's on your heart..."
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className={`h-14 w-14 bg-gradient-to-r ${themeColors[selectedCoach.coach_color_theme || 'rose']}`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettingsView = () => {
    if (!selectedCoach) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setCurrentView('chat')}>
            ← Back to Chat
          </Button>
        </div>

        <MemoryManagement
          coachId={selectedCoach.id}
          coachName={selectedCoach.name}
        />

        <Card>
          <CardHeader>
            <CardTitle>Media & Training Data: {selectedCoach.name}</CardTitle>
            <p className="text-sm text-gray-600">Upload photos, videos, documents, and voice samples to train the AI</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <MediaUploader
              type="photos"
              title="📷 Photos"
              description="Upload photos of your loved one"
              acceptedFiles="image/*"
              coachId={selectedCoach.id}
              isNewCoach={false}
              onMediaUpdate={(field, value) => {
                updateCoachMutation.mutate({
                  id: selectedCoach.id,
                  data: { [field]: value }
                });
              }}
              currentData={selectedCoach}
            />

            <MediaUploader
              type="videos"
              title="🎥 Videos"
              description="Upload video memories (the AI will learn from their mannerisms and voice)"
              acceptedFiles="video/*"
              coachId={selectedCoach.id}
              isNewCoach={false}
              onMediaUpdate={(field, value) => {
                updateCoachMutation.mutate({
                  id: selectedCoach.id,
                  data: { [field]: value }
                });
              }}
              currentData={selectedCoach}
            />

            <MediaUploader
              type="voice_samples"
              title="🎤 Voice Samples"
              description="Upload voice recordings for voice cloning (clear audio, 30+ seconds recommended)"
              acceptedFiles="audio/*"
              coachId={selectedCoach.id}
              isNewCoach={false}
              onMediaUpdate={(field, value) => {
                updateCoachMutation.mutate({
                  id: selectedCoach.id,
                  data: { [field]: value }
                });
              }}
              currentData={selectedCoach}
            />

            <MediaUploader
              type="documents"
              title="📄 Documents & Writings"
              description="Letters, emails, journals, or any writings that show their thoughts and communication style"
              acceptedFiles=".pdf,.doc,.docx,.txt"
              coachId={selectedCoach.id}
              isNewCoach={false}
              onMediaUpdate={(field, value) => {
                updateCoachMutation.mutate({
                  id: selectedCoach.id,
                  data: { [field]: value }
                });
              }}
              currentData={selectedCoach}
            />

            <MediaUploader
              type="text_messages"
              title="💬 Text Messages"
              description="Screenshots of text conversations that capture their communication style"
              acceptedFiles="image/*"
              coachId={selectedCoach.id}
              isNewCoach={false}
              onMediaUpdate={(field, value) => {
                updateCoachMutation.mutate({
                  id: selectedCoach.id,
                  data: { [field]: value }
                });
              }}
              currentData={selectedCoach}
            />

            <ThemeCustomizer
              selectedTheme={selectedCoach.coach_color_theme}
              onThemeChange={(theme) => {
                updateCoachMutation.mutate({
                  id: selectedCoach.id,
                  data: { coach_color_theme: theme }
                });
              }}
              backgroundImage={selectedCoach.coach_background_image}
              onBackgroundChange={(url) => {
                updateCoachMutation.mutate({
                  id: selectedCoach.id,
                  data: { coach_background_image: url }
                });
              }}
            />

            {selectedCoach.coach_type === 'persona_clone' && (
              <>
                <DocumentUploader coachId={selectedCoach.id} />
                <VoiceTrainer coachId={selectedCoach.id} />
                <ConsentUploader coachId={selectedCoach.id} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoadingUser || isLoadingCoaches) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Grief Support...</h2>
          <p className="text-gray-600">Preparing your compassionate space</p>
        </motion.div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "AI Grief Support & Loss Counseling",
    "description": "Compassionate AI grief coach providing 24/7 support for loss, bereavement, and healing. Personalized grief counseling and emotional support.",
    "specialty": "Grief Counseling, Bereavement Support, Mental Health",
    "medicalAudience": {
      "@type": "MedicalAudience",
      "audienceType": "Individuals Experiencing Loss, Caregivers"
    }
  };

  return (
    <>
      <SEO 
        title="AI Grief Support & Loss Counseling - 24/7 Compassionate Care | Helper33"
        description="AI-powered grief support and bereavement counseling available 24/7. Compassionate AI coach for processing loss, healing, and emotional support during difficult times. Safe, private, and understanding."
        keywords="AI grief support, AI grief counseling, bereavement AI, loss support AI, grief coach AI, AI therapy grief, AI emotional support, bereavement counseling, AI mental health grief, loss counseling AI, AI for healing"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Grief Support & Reflection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Compassionate AI companions for journaling, reflection, and personal support
            </p>
          </motion.div>

          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <MedicalDisclaimer variant="prominent" page="grief" />
          </motion.div>

          <AnimatePresence mode="wait">
            {currentView === 'coaches' && !isCreatingCoach && (
              <motion.div
                key="coaches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {renderCoachList()}
              </motion.div>
            )}

            {isCreatingCoach && (
              <motion.div
                key="creation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {renderCreationFlow()}
              </motion.div>
            )}

            {currentView === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {renderChatView()}
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {renderSettingsView()}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <GriefBlogSection />
          </motion.div>
        </div>
      </div>
    </>
  );
}
