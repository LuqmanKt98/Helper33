import React, { useState, useEffect, useRef } from "react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import {
  X, Send, Loader2, Mic, StopCircle, Minus, Maximize, GripVertical,
  Sparkles, Zap, Bot, HelpCircle, Lightbulb, MessageCircle,
  Heart, Calendar, TrendingUp, Baby, Users, Target, Briefcase,
  Shield, Mail, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import MessageBubble from '@/components/ai/MessageBubble';
import { useNotifications } from '@/components/SoundManager';

const AIAssistant = ({ currentPageName, embedded = false, initialMessage = "", initialAgent = "personal_assistant" }) => {
  const [isChatOpen, setIsChatOpen] = useState(embedded);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentAgent, setCurrentAgent] = useState(initialAgent);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const { playSound } = useNotifications();

  const [isThinking, setIsThinking] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();

  // Available agents
  const agents = [
    { id: 'personal_assistant', name: 'Personal Assistant', icon: Sparkles, color: 'from-purple-500 to-pink-500', description: 'Main AI assistant' },
    { id: 'grief_coach', name: 'Grief Coach', icon: Heart, color: 'from-rose-500 to-pink-500', description: 'Healing support' },
    { id: 'organizer', name: 'Task Organizer', icon: Calendar, color: 'from-blue-500 to-cyan-500', description: 'Task management' },
    { id: 'life_coach', name: 'Life Coach', icon: TrendingUp, color: 'from-green-500 to-teal-500', description: 'Goal planning' },
    { id: 'womens_health_coach', name: "Women's Health", icon: Baby, color: 'from-pink-500 to-rose-500', description: 'Health support' },
    { id: '2026_life_planner', name: '2026 Planner', icon: Target, color: 'from-indigo-500 to-purple-500', description: 'Year planning' },
    { id: 'concierge', name: 'Family Concierge', icon: Users, color: 'from-orange-500 to-red-500', description: 'Family coordination' },
    { id: 'social_media_manager', name: 'Social Media', icon: Briefcase, color: 'from-yellow-500 to-orange-500', description: 'Content creation' },
    { id: 'crisis_support', name: 'Crisis Support', icon: Shield, color: 'from-red-500 to-rose-500', description: 'Emergency help' },
    { id: 'email_assistant', name: 'Email Helper', icon: Mail, color: 'from-indigo-500 to-blue-500', description: 'Email drafting' }
  ];

  const getCurrentAgentInfo = () => {
    return agents.find(a => a.id === currentAgent) || agents[0];
  };

  const agentInfo = getCurrentAgentInfo();
  const AgentIcon = agentInfo.icon;

  // Listen for force open event
  useEffect(() => {
    const handleForceOpen = (e) => {
      const { message, agent } = e.detail || {};
      
      if (agent) {
        setCurrentAgent(agent);
      }
      
      setIsChatOpen(true);
      setIsMinimized(false);
      setShowSuggestions(true);
      
      if (message) {
        setTimeout(() => {
          setInput(message);
          setTimeout(() => handleSendMessage(), 300);
        }, 500);
      }
    };

    window.addEventListener('forceOpenAI', handleForceOpen);
    return () => window.removeEventListener('forceOpenAI', handleForceOpen);
  }, [currentAgent]);

  // Update agent when initialAgent changes
  useEffect(() => {
    if (initialAgent && initialAgent !== currentAgent) {
      setCurrentAgent(initialAgent);
    }
  }, [initialAgent]);

  // Auto-detect agent based on page
  useEffect(() => {
    const pageToAgent = {
      'Wellness': 'personal_assistant',
      'GriefCoach': 'grief_coach',
      'Organizer': 'organizer',
      'LifeCoach': 'life_coach',
      'Year2026Hub': '2026_life_planner',
      'Family': 'concierge',
      'WomensHealthHub': 'womens_health_coach',
      'SocialMediaManager': 'social_media_manager',
      'CrisisHub': 'crisis_support'
    };
    
    if (pageToAgent[currentPageName] && !activeConversationId) {
      setCurrentAgent(pageToAgent[currentPageName]);
    }
  }, [currentPageName, activeConversationId]);

  // Handle initial message from proactive support
  useEffect(() => {
    if (initialMessage && isChatOpen) {
      setInput(initialMessage);
      setTimeout(() => {
        handleSendMessage();
      }, 500);
    }
  }, [initialMessage, isChatOpen]);

  const getPageSuggestions = () => {
    const pageSuggestions = {
      Dashboard: [
        { text: "Show me my tasks for today", icon: Zap, color: "from-blue-500 to-cyan-500" },
        { text: "What's my wellness score?", icon: Sparkles, color: "from-green-500 to-emerald-500" },
        { text: "Check upcoming appointments", icon: Bot, color: "from-purple-500 to-pink-500" }
      ],
      Wellness: [
        { text: "Log my mood today", icon: Sparkles, color: "from-purple-500 to-pink-500" },
        { text: "Create a wellness entry", icon: Zap, color: "from-green-500 to-teal-500" },
        { text: "Show wellness trends", icon: Bot, color: "from-blue-500 to-indigo-500" }
      ],
      Family: [
        { text: "Add a family event", icon: Zap, color: "from-rose-500 to-pink-500" },
        { text: "Create a family task", icon: Sparkles, color: "from-blue-500 to-indigo-500" },
        { text: "Show family calendar", icon: Bot, color: "from-purple-500 to-pink-500" }
      ]
    };

    return pageSuggestions[currentPageName] || [
      { text: "Help me get started", icon: HelpCircle, color: "from-purple-500 to-pink-500" },
      { text: "Show me around the app", icon: Lightbulb, color: "from-blue-500 to-cyan-500" },
      { text: "What can you help me with?", icon: MessageCircle, color: "from-green-500 to-emerald-500" }
    ];
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!embedded) {
      const savedX = localStorage.getItem('aiAssistantX');
      const savedY = localStorage.getItem('aiAssistantY');
      if (savedX) x.set(parseFloat(savedX));
      if (savedY) y.set(parseFloat(savedY));
    }
  }, [embedded, x, y]);

  const handleDragEnd = () => {
    if (!embedded) {
      localStorage.setItem('aiAssistantX', x.get().toString());
      localStorage.setItem('aiAssistantY', y.get().toString());
    }
  };

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    try {
      const unsubscribe = base44.agents.subscribeToConversation(
        activeConversationId,
        (data) => {
          if (!data || !data.messages) return;
          setMessages(data.messages || []);

          const lastMessage = data.messages[data.messages.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage?.status !== 'in_progress') {
            setIsLoading(false);
            setIsThinking(false);
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
      setIsThinking(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
        playSound('success');
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        playSound('error');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [playSound]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
      playSound('click');
    } else {
      toast.error('Voice input not supported on this browser');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const quickSuggestions = getPageSuggestions();

  const handleSuggestionClick = (text) => {
    setInput(text);
    setShowSuggestions(false);
    setTimeout(() => handleSendMessage(), 300);
  };

  const switchAgent = async (agentId) => {
    setCurrentAgent(agentId);
    setShowAgentSelector(false);
    setActiveConversationId(null);
    setCurrentConversation(null);
    setMessages([]);
    setShowSuggestions(true);
    playSound('success');
    
    const agent = agents.find(a => a.id === agentId);
    toast.success(`Switched to ${agent?.name}!`);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isThinking) return;

    const userMessageContent = input.trim();
    const contextPrefix = currentPageName ? `[User is on ${currentPageName} page] ` : '';
    const enhancedMessage = contextPrefix + userMessageContent;

    setInput("");
    setIsLoading(true);
    setIsThinking(true);
    setShowSuggestions(false);
    if (!embedded) playSound('click');

    try {
      if (!currentConversation && !activeConversationId) {
        setIsCreating(true);
        setMessages([]);
        
        const agent = agents.find(a => a.id === currentAgent);
        const newConv = await base44.agents.createConversation({
          agent_name: currentAgent,
          metadata: { 
            name: `Chat with ${agent?.name}`,
            description: agent?.description,
            page: currentPageName
          }
        });
        
        if (!newConv || !newConv.id) {
          throw new Error('Failed to create conversation');
        }
        
        setCurrentConversation(newConv);
        setActiveConversationId(newConv.id);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await base44.agents.addMessage(newConv, { role: "user", content: enhancedMessage });
        setIsCreating(false);
      } else {
        const convToUse = currentConversation || { id: activeConversationId };
        await base44.agents.addMessage(convToUse, { role: "user", content: enhancedMessage });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (!embedded) playSound('error');
      setInput(userMessageContent);
      setIsLoading(false);
      setIsThinking(false);
      setIsCreating(false);
      toast.error('Could not send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseChat = () => {
    if (embedded) return;
    
    setIsChatOpen(false);
    setIsMinimized(false);
    setIsMaximized(false);
    setShowAgentSelector(false);
    if (isRecording) stopRecording();
    playSound('click');
  };

  const renderWelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`w-24 h-24 rounded-full bg-gradient-to-br ${agentInfo.color} flex items-center justify-center mb-6 shadow-2xl`}
      >
        <AgentIcon className="w-12 h-12 text-white" />
      </motion.div>
      
      <h4 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        {agentInfo.name}
      </h4>
      <p className="text-sm text-gray-600 mb-4">{agentInfo.description}</p>

      <Button
        onClick={() => setShowAgentSelector(!showAgentSelector)}
        variant="outline"
        size="sm"
        className="mb-6"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Switch Agent
      </Button>

      {showAgentSelector && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md mb-6"
        >
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <motion.button
                key={agent.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => switchAgent(agent.id)}
                className={`p-3 rounded-xl bg-gradient-to-br ${agent.color} text-white text-left shadow-lg hover:shadow-2xl transition-all border-2 ${
                  currentAgent === agent.id ? 'border-yellow-300 ring-2 ring-yellow-300' : 'border-white/20'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <p className="text-xs font-bold">{agent.name}</p>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {!showAgentSelector && (
        <>
          <p className="text-xs font-semibold text-purple-600 mb-4">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {quickSuggestions.slice(0, 4).map((suggestion, idx) => {
              const SugIcon = suggestion.icon;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className={`p-4 rounded-xl bg-gradient-to-br ${suggestion.color} text-white text-left shadow-lg hover:shadow-2xl transition-all border-2 border-white/20`}
                >
                  <SugIcon className="w-5 h-5 mb-2" />
                  <p className="text-xs font-semibold leading-tight">{suggestion.text}</p>
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-pink-50">
        <div className={`flex items-center gap-2 p-3 bg-gradient-to-r ${agentInfo.color} text-white`}>
          <AgentIcon className="w-5 h-5" />
          <span className="font-bold flex-1">{agentInfo.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAgentSelector(!showAgentSelector)}
            className="text-white hover:bg-white/20 h-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {showAgentSelector && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-b bg-white"
          >
            <p className="text-sm font-semibold mb-3">Switch Agent:</p>
            <div className="grid grid-cols-3 gap-2">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <motion.button
                    key={agent.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => switchAgent(agent.id)}
                    className={`p-2 rounded-lg bg-gradient-to-br ${agent.color} text-white text-center shadow-md ${
                      currentAgent === agent.id ? 'ring-2 ring-yellow-300' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-[10px] font-bold">{agent.name.split(' ')[0]}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(!messages || messages.length === 0) && !isCreating && !isLoading && showSuggestions && renderWelcomeScreen()}
          
          {Array.isArray(messages) && messages.length > 0 && messages.map((msg, idx) => {
            if (!msg) return null;
            return <MessageBubble key={msg.id || idx} message={msg} />;
          })}
          
          {(isCreating || isLoading || isThinking) && (
            <div className="flex items-center gap-3 text-purple-600 p-4 bg-purple-50 rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">
                {isCreating ? 'Starting conversation...' : isThinking ? 'Thinking and taking action...' : 'Processing...'}
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 min-h-[44px] max-h-32 resize-none border-2 focus:border-purple-500"
              rows={1}
              disabled={isLoading || isThinking || isCreating}
            />
            
            {recognitionRef.current && (
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                className="h-11 w-11 flex-shrink-0"
                disabled={isLoading || isThinking || isCreating}
              >
                {isRecording ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                    <StopCircle className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            )}
            
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || isThinking || isCreating}
              size="icon"
              className={`h-11 w-11 flex-shrink-0 bg-gradient-to-r ${agentInfo.color} hover:opacity-90`}
            >
              {(isLoading || isCreating || isThinking) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // FLOATING ASSISTANT - Always render when not embedded
  return (
    <div>
      {/* Floating Button - ALWAYS VISIBLE when chat is closed */}
      {!isChatOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          style={{ x, y }}
          drag
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{
            top: -window.innerHeight / 2 + 50,
            left: -window.innerWidth / 2 + 50,
            right: window.innerWidth / 2 - 50,
            bottom: window.innerHeight / 2 - 50,
          }}
          onDragEnd={handleDragEnd}
          className="fixed bottom-6 right-6 z-[9999]"
        >
          <motion.button
            onClick={() => {
              setIsChatOpen(true);
              setShowSuggestions(true);
              playSound('click');
            }}
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br ${agentInfo.color} text-white shadow-2xl flex items-center justify-center transition-transform relative group touch-manipulation`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-ai-assistant-trigger
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <AgentIcon className="w-8 h-8" />
            </motion.div>
            
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [0.5, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            
            <Badge className={`absolute -top-1 -right-1 bg-gradient-to-r ${agentInfo.color} border-2 border-white text-white text-[10px] px-2 py-0.5 shadow-lg`}>
              AI
            </Badge>
          </motion.button>
        </motion.div>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          style={{ x, y }}
          drag={!isMaximized}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{
            top: -window.innerHeight / 2 + 100,
            left: -window.innerWidth / 2 + 200,
            right: window.innerWidth / 2 - 200,
            bottom: window.innerHeight / 2 - 100,
          }}
          dragListener={!isMaximized}
          onDragEnd={handleDragEnd}
          className={`fixed z-[9999] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 flex flex-col overflow-hidden ${
            isMaximized 
              ? "inset-2 sm:inset-4 lg:inset-8" 
              : isMinimized 
                ? "bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-96 h-16"
                : "bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-[450px] h-[550px] sm:h-[650px] max-h-[calc(100vh-3rem)]"
          }`}
        >
          <div 
            className={`flex items-center justify-between p-4 border-b bg-gradient-to-r ${agentInfo.color} text-white relative overflow-hidden ${!isMaximized ? 'cursor-move' : ''}`}
            onPointerDown={(e) => !isMaximized && dragControls.start(e)}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
              {!isMaximized && <GripVertical className="w-5 h-5 flex-shrink-0 opacity-70" />}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <AgentIcon className="w-6 h-6 flex-shrink-0" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{agentInfo.name}</h3>
                {!isMinimized && (
                  <p className="text-xs opacity-90 truncate">{agentInfo.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Switch Agent"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Maximize className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseChat}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {showAgentSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50"
                >
                  <p className="text-sm font-semibold mb-3">Switch to:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {agents.map((agent) => {
                      const Icon = agent.icon;
                      return (
                        <motion.button
                          key={agent.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => switchAgent(agent.id)}
                          className={`p-3 rounded-lg bg-gradient-to-br ${agent.color} text-white text-center shadow-md hover:shadow-lg transition-all ${
                            currentAgent === agent.id ? 'ring-2 ring-yellow-300' : ''
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <p className="text-[10px] font-bold leading-tight">{agent.name}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                {(!messages || messages.length === 0) && !isCreating && !isLoading && showSuggestions && renderWelcomeScreen()}
                
                {Array.isArray(messages) && messages.length > 0 && messages.map((msg, idx) => {
                  if (!msg) return null;
                  return <MessageBubble key={msg.id || idx} message={msg} />;
                })}
                
                {(isCreating || isLoading || isThinking) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-purple-600 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">
                      {isCreating ? 'Starting conversation...' : isThinking ? '🧠 Thinking and taking action...' : 'Processing...'}
                    </span>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex gap-2 items-end">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 min-h-[50px] max-h-32 resize-none border-2 focus:border-purple-500 rounded-xl"
                    rows={1}
                    disabled={isLoading || isThinking || isCreating}
                  />
                  
                  {recognitionRef.current && (
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      size="icon"
                      onClick={isRecording ? stopRecording : startRecording}
                      className="h-12 w-12 flex-shrink-0 rounded-xl"
                      disabled={isLoading || isThinking || isCreating}
                    >
                      {isRecording ? (
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                          <StopCircle className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading || isThinking || isCreating}
                    size="icon"
                    className={`h-12 w-12 flex-shrink-0 bg-gradient-to-r ${agentInfo.color} hover:opacity-90 rounded-xl shadow-lg`}
                  >
                    {(isLoading || isCreating || isThinking) ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  💡 {agentInfo.name} is ready to help!
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AIAssistant;