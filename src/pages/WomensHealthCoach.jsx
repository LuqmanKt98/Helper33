import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart,
  Send,
  Sparkles,
  Baby,
  Brain,
  BookOpen,
  Loader2,
  ChevronDown,
  Salad,
  Activity,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '@/components/ai/MessageBubble';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WomensHealthCoach() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: pregnancyData } = useQuery({
    queryKey: ['pregnancy-tracking'],
    queryFn: async () => {
      const data = await base44.entities.PregnancyTracking.list();
      return data[0] || null;
    }
  });

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsInitializing(true);
        const conv = await base44.agents.createConversation({
          agent_name: 'womens_health_coach',
          metadata: {
            name: 'My Women\'s Health Journey',
            description: 'Personalized health coaching and support'
          }
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to start conversation. Please refresh the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    if (!conversationId) {
      initConversation();
    }
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    try {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        if (data && data.messages) {
          setMessages(data.messages);
          
          const lastMessage = data.messages[data.messages.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage?.status !== 'in_progress') {
            setIsLoading(false);
          }
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error subscribing to conversation:', error);
      setIsLoading(false);
    }
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || !conversationId || isLoading) return;

    setIsLoading(true);
    setInput('');
    setShowQuickActions(false);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: text
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsLoading(false);
      setInput(text); // Restore input on error
    }
  };

  const quickActions = [
    {
      icon: Baby,
      title: 'This Week\'s Guide',
      description: 'Get personalized tips for my pregnancy week',
      prompt: pregnancyData?.current_week 
        ? `I'm in week ${pregnancyData.current_week} of pregnancy. Can you give me a personalized guide for this week including what's happening with my baby, nutrition tips, and what I should focus on?`
        : 'Can you help me understand what I should track for my women\'s health journey?',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Salad,
      title: 'Create Meal Plan',
      description: 'Custom nutrition plan for my stage',
      prompt: pregnancyData?.pregnancy_status === 'pregnant'
        ? `Can you create a 3-day meal plan for week ${pregnancyData.current_week} of pregnancy? Please include foods that help with common symptoms and support baby's development.`
        : pregnancyData?.pregnancy_status === 'postpartum'
        ? `Can you create a 3-day postpartum meal plan for me? I'm ${pregnancyData.postpartum_weeks} weeks postpartum. Please focus on recovery, energy, and breastfeeding nutrition if applicable.`
        : 'Can you create a healthy meal plan for me based on my health profile and goals?',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Brain,
      title: 'Guided Meditation',
      description: 'Calming meditation for my needs',
      prompt: pregnancyData?.pregnancy_status === 'pregnant'
        ? `Can you guide me through a meditation for pregnancy? I'm in trimester ${pregnancyData.current_trimester}. Help me relax and connect with my baby.`
        : pregnancyData?.pregnancy_status === 'postpartum'
        ? 'Can you guide me through a meditation for postpartum relaxation and bonding with my baby?'
        : 'Can you guide me through a calming meditation for stress relief and emotional wellness?',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Activity,
      title: 'Symptom Guidance',
      description: 'Understanding what I\'m experiencing',
      prompt: 'I\'m experiencing some symptoms and would like guidance on what\'s normal and when I should be concerned.',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: BookOpen,
      title: 'Ask a Question',
      description: 'Get answers about my health',
      prompt: '',
      color: 'from-indigo-500 to-purple-500',
      isCustom: true
    }
  ];

  const getGreeting = () => {
    if (!pregnancyData) {
      return {
        title: "Welcome to Your Women's Health Coach! 🌸",
        subtitle: "I'm here to support your wellness journey"
      };
    }

    if (pregnancyData.pregnancy_status === 'pregnant') {
      return {
        title: `Week ${pregnancyData.current_week} of Your Pregnancy Journey! 💕`,
        subtitle: `Trimester ${pregnancyData.current_trimester} - Your personalized health companion`
      };
    }

    if (pregnancyData.pregnancy_status === 'postpartum') {
      const weeksPostpartum = pregnancyData.postpartum_weeks || 0;
      return {
        title: `${weeksPostpartum} Weeks Postpartum - You're Doing Amazing! 🌟`,
        subtitle: "Supporting you through motherhood and recovery"
      };
    }

    if (pregnancyData.pregnancy_status === 'trying_to_conceive') {
      return {
        title: "Your Fertility Journey 🌺",
        subtitle: "Cycle tracking and conception support"
      };
    }

    return {
      title: "Your Women's Health Companion 💜",
      subtitle: "Cycle tracking and wellness support"
    };
  };

  const greeting = getGreeting();

  // Show initialization screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Starting Your Health Coach...</h2>
          <p className="text-gray-600">Just a moment 💙</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white p-6 shadow-xl"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('WomensHealthHub')}>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Heart className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{greeting.title}</h1>
                <p className="text-white/90 text-sm sm:text-base">{greeting.subtitle}</p>
              </div>
            </div>
            
            {/* WhatsApp Integration */}
            <a
              href={base44.agents.getWhatsAppConnectURL('womens_health_coach')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
            >
              <Button
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                💬 WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm shadow-2xl h-[calc(100vh-280px)] flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {messages.length === 0 && !isLoading && !isInitializing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4"
                      >
                        <Heart className="w-10 h-10 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Hello {user?.full_name?.split(' ')[0] || 'there'}! 👋
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        I'm your personal Women's Health AI Coach with access to your health data. 
                        I'll provide personalized guidance based on what you're tracking.
                      </p>
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-sm text-purple-600 font-medium"
                      >
                        Choose a quick action or ask me anything! 💬
                      </motion.p>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {messages.map((message, idx) => (
                      <motion.div
                        key={message.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <MessageBubble message={message} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-gray-500"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                      </div>
                      <span className="text-sm">Coach is analyzing your health data...</span>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input Area */}
                <div className="border-t bg-white p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(input);
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about your health journey..."
                      disabled={isLoading || !conversationId}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim() || !conversationId}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-4">
            {/* Current Status Card */}
            {pregnancyData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Baby className="w-6 h-6 text-pink-600" />
                      <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        {pregnancyData.pregnancy_status === 'pregnant' && (
                          <p className="font-bold text-pink-700">
                            Week {pregnancyData.current_week} Pregnant
                          </p>
                        )}
                        {pregnancyData.pregnancy_status === 'postpartum' && (
                          <p className="font-bold text-pink-700">
                            {pregnancyData.postpartum_weeks} Weeks Postpartum
                          </p>
                        )}
                        {pregnancyData.pregnancy_status === 'trying_to_conceive' && (
                          <p className="font-bold text-pink-700">
                            Trying to Conceive
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {pregnancyData.pregnancy_status === 'pregnant' 
                        ? `✨ I have access to week ${pregnancyData.current_week} guidance, your wellness tracking, and symptom logs.`
                        : pregnancyData.pregnancy_status === 'postpartum'
                        ? `✨ I can see your baby care logs, wellness data, and recovery progress.`
                        : '✨ I have access to your health profile and cycle tracking data.'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Quick Actions
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickActions(!showQuickActions)}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <AnimatePresence>
                  {showQuickActions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <CardContent className="space-y-3 pt-0">
                        {quickActions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (action.isCustom) {
                                document.querySelector('input[placeholder*="Ask me"]')?.focus();
                              } else {
                                sendMessage(action.prompt);
                              }
                            }}
                            disabled={isLoading || !conversationId}
                            className={`w-full p-4 rounded-xl bg-gradient-to-r ${action.color} text-white text-left hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <action.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold mb-1 text-sm">{action.title}</p>
                                <p className="text-xs text-white/80 line-clamp-2">{action.description}</p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Coach Capabilities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    What I Can Help With
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-700">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-2"
                    >
                      <Baby className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p>Personalized pregnancy week guidance using YOUR tracked data</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-start gap-2"
                    >
                      <Salad className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p>Custom meal plans based on your current week and wellness logs</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-start gap-2"
                    >
                      <Brain className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <p>Guided meditations adapted to your trimester and mood data</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-start gap-2"
                    >
                      <Activity className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p>Symptom insights from YOUR actual tracking logs</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex items-start gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p>Evidence-based answers referencing your health profile</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex items-start gap-2"
                    >
                      <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      <p>Emotional support based on your mood patterns</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Important Notice */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900">
                      <p className="font-semibold mb-1">⚕️ Important Medical Notice:</p>
                      <p>
                        I provide guidance and support, but I'm not a replacement for medical care. 
                        Always consult your healthcare provider for medical decisions, concerning symptoms, 
                        or emergencies.
                      </p>
                      <p className="mt-2 font-semibold">
                        🆘 Emergency? Call 911 or your local emergency number immediately.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}