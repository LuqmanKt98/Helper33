import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Sparkles,
  Loader2,
  BookmarkPlus,
  Phone,
  MessageSquare,
  Globe,
  ExternalLink,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Bot,
  User as UserIcon,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DirectoryChat({ allResources = [], isCollapsed = false, onToggleCollapse }) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savingResourceId, setSavingResourceId] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const saveResourceMutation = useMutation({
    mutationFn: async (resource) => {
      return await base44.entities.SavedCrisisResource.create({
        resource_id: resource.id,
        resource_name: resource.resource_name,
        resource_category: resource.category,
        quick_access: false,
        contact_attempts: 0,
        notes: ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCrisisResources'] });
      toast.success('✅ Resource saved!');
      setSavingResourceId(null);
    },
    onError: () => {
      toast.error('Failed to save resource');
      setSavingResourceId(null);
    }
  });

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: 'resource_navigator',
          metadata: {
            name: 'Resource Navigation',
            description: 'Finding the perfect support resources'
          }
        });
        setConversationId(conv.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    if (!conversationId && !isCollapsed) {
      initConversation();
    }
  }, [conversationId, isCollapsed]);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId) return;

    try {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        if (data?.messages) {
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
      console.error('Error subscribing:', error);
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsLoading(false);
      setInput(userMessage);
    }
  };

  const extractResourceFromMessage = (content) => {
    if (!content || !allResources || allResources.length === 0) return [];
    
    const resourceNames = allResources.map(r => r.resource_name);
    const mentioned = resourceNames.filter(name => content.includes(name));
    return mentioned.map(name => allResources.find(r => r.resource_name === name)).filter(Boolean);
  };

  const quickStarters = [
    { icon: '🆘', text: 'I need immediate crisis support', color: 'from-red-500 to-rose-500' },
    { icon: '🧠', text: 'Looking for therapy services', color: 'from-purple-500 to-indigo-500' },
    { icon: '💬', text: 'I want to join a support group', color: 'from-blue-500 to-cyan-500' },
    { icon: '🏥', text: 'Need help for addiction', color: 'from-green-500 to-emerald-500' }
  ];

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="mb-6"
      >
        <Button
          onClick={onToggleCollapse}
          className="w-full h-auto py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-2xl border-4 border-purple-300"
        >
          <div className="flex items-center gap-4 w-full">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
            >
              <Bot className="w-7 h-7" />
            </motion.div>
            <div className="text-left flex-1">
              <div className="font-bold text-2xl mb-1">🤖 Ask AI to Help You Find Resources</div>
              <div className="text-sm text-white/90">
                I'll ask questions to understand your needs and find perfect matches
              </div>
            </div>
            <ChevronDown className="w-8 h-8" />
          </div>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6"
    >
      <Card className="shadow-2xl border-4 border-purple-400 bg-white overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Bot className="w-6 h-6" />
              </motion.div>
              <div>
                <CardTitle className="text-xl">🤖 AI Resource Navigator</CardTitle>
                <p className="text-white/90 text-sm">Tell me what you need - I'll help you find it</p>
              </div>
            </div>
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <ChevronUp className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages Area */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
            {messages.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  👋 Hi! I'm here to help you find support
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                  Tell me what you're looking for, and I'll ask some questions to find the perfect resources for you.
                </p>

                {/* Quick Starters */}
                <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                  {quickStarters.map((starter, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setInput(starter.text);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className={`p-3 rounded-xl bg-gradient-to-r ${starter.color} text-white text-left shadow-lg hover:shadow-xl transition-all text-sm`}
                    >
                      <div className="text-2xl mb-1">{starter.icon}</div>
                      <div className="font-medium">{starter.text}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const mentionedResources = !isUser ? extractResourceFromMessage(msg.content || '') : [];

                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg"
                        >
                          <Bot className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                      
                      <div className={`max-w-[75%] ${isUser ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-white border-2 border-purple-200'} rounded-2xl p-4 shadow-lg`}>
                        {isUser && (
                          <div className="flex items-center gap-2 mb-1">
                            <UserIcon className="w-4 h-4" />
                            <span className="text-xs font-semibold">You</span>
                          </div>
                        )}
                        
                        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? '' : 'text-gray-800'}`}>
                          {msg.content || ''}
                        </div>

                        {/* Show mentioned resources with save buttons */}
                        {!isUser && mentionedResources.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t-2 border-purple-100 space-y-3"
                          >
                            {mentionedResources.map((resource, ridx) => {
                              if (!resource) return null;
                              
                              return (
                                <motion.div
                                  key={ridx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: ridx * 0.1 }}
                                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200"
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900 text-sm flex-1">
                                      {resource.resource_name}
                                    </h4>
                                    <Button
                                      onClick={() => {
                                        setSavingResourceId(resource.id);
                                        saveResourceMutation.mutate(resource);
                                      }}
                                      disabled={savingResourceId === resource.id}
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-md flex-shrink-0"
                                    >
                                      {savingResourceId === resource.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <>
                                          <BookmarkPlus className="w-3 h-3 mr-1" />
                                          Save
                                        </>
                                      )}
                                    </Button>
                                  </div>

                                  {/* Quick Contact Buttons */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {resource.phone_number && (
                                      <a href={`tel:${resource.phone_number.replace(/[^0-9]/g, '')}`}>
                                        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                                          <Phone className="w-3 h-3 mr-1" />
                                          {resource.phone_number}
                                        </Button>
                                      </a>
                                    )}
                                    {resource.text_number && (
                                      <a href={`sms:${resource.text_number}`}>
                                        <Button size="sm" variant="outline" className="h-8 border-blue-500 text-blue-600 text-xs">
                                          <MessageSquare className="w-3 h-3 mr-1" />
                                          Text
                                        </Button>
                                      </a>
                                    )}
                                    {resource.website_url && (
                                      <a href={resource.website_url} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" variant="outline" className="h-8 text-xs">
                                          <Globe className="w-3 h-3 mr-1" />
                                          Visit
                                          <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                      </a>
                                    )}
                                    {resource.chat_url && (
                                      <a href={resource.chat_url} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" variant="outline" className="h-8 border-purple-500 text-purple-600 text-xs">
                                          <MessageSquare className="w-3 h-3 mr-1" />
                                          Chat
                                        </Button>
                                      </a>
                                    )}
                                  </div>

                                  {/* Availability & Cost */}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {resource.availability === '24_7' && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        24/7 Available
                                      </Badge>
                                    )}
                                    {resource.cost === 'free' && (
                                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                                        Free
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="bg-white rounded-2xl p-4 border-2 border-purple-200 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-700">Finding resources for you...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-4 border-purple-200 bg-white p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What kind of support do you need?"
                  disabled={isLoading || !conversationId}
                  className="flex-1 border-2 border-purple-300 focus:border-purple-500 bg-white"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || !conversationId}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg px-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                💡 Example: "I need 24/7 crisis support" or "Looking for free therapy"
              </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}