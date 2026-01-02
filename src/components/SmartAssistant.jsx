import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  X,
  Send,
  Baby,
  Users,
  Smile,
  Calendar,
  UtensilsCrossed,
  Loader2,
  Sparkles,
  MessageSquare,
  Mic,
  StopCircle
} from 'lucide-react';
import MessageBubble from './ai/MessageBubble';
import { toast } from 'sonner';

const quickActions = [
  { id: 'baby', label: 'Baby', icon: Baby, prompt: 'Help me log baby care activities' },
  { id: 'family', label: 'Family', icon: Users, prompt: "What's on the family calendar tomorrow?" },
  { id: 'mood', label: 'Mood', icon: Smile, prompt: 'I want to track my mood today' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, prompt: "Show me who's assigned to what today" },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed, prompt: 'Plan healthy dinners for this week' },
];

export default function SmartAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Subscribe to conversation updates with navigation detection
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const navRegex = /\[NAVIGATE:(.*?)\]/;

    try {
      const unsubscribe = base44.agents.subscribeToConversation(
        conversationId,
        (data) => {
          try {
            if (!data || !data.messages || !Array.isArray(data.messages)) {
              console.warn('Invalid conversation data received');
              setIsLoading(false);
              return;
            }

            // Process messages and detect navigation
            const validMessages = data.messages
              .filter(msg => msg && typeof msg === 'object')
              .map(msg => {
                try {
                  const match = msg.content?.match(navRegex);
                  if (match && msg.role === 'assistant') {
                    const pageName = match[1];
                    const url = createPageUrl(pageName);
                    
                    // Navigate after a short delay
                    setTimeout(() => {
                      navigate(url);
                      setIsOpen(false);
                    }, 800);
                    
                    // Remove navigation marker from displayed message
                    return {
                      ...msg,
                      content: msg.content.replace(navRegex, '').trim()
                    };
                  }
                  return msg;
                } catch (msgError) {
                  console.error('Error processing message:', msgError);
                  return msg;
                }
              });

            setMessages(validMessages);

            const lastMessage = validMessages[validMessages.length - 1];
            const isThinking = lastMessage?.role === 'assistant' && lastMessage?.status === 'in_progress';
            
            if (!isThinking) {
              setIsLoading(false);
            }

            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } catch (error) {
            console.error('Error processing conversation update:', error);
            setIsLoading(false);
          }
        }
      );

      return () => {
        try {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      };
    } catch (error) {
      console.error('Error subscribing to conversation:', error);
      setMessages([]);
      setIsLoading(false);
    }
  }, [conversationId, navigate]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported');
      return;
    }

    try {
      setIsRecording(true);
      recognitionRef.current.start();
      toast.info('Listening...');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      toast.error('Could not start voice input');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const originalInput = input;
    setInput('');
    setIsLoading(true);

    try {
      let convId = conversationId;

      if (!convId) {
        const newConv = await base44.agents.createConversation({
          agent_name: 'personal_assistant',
          metadata: {
            name: 'Smart Assistant Chat',
            description: 'Family helper conversation'
          }
        });

        if (!newConv?.id) {
          throw new Error('Failed to create conversation');
        }

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
      setInput(originalInput);
      setIsLoading(false);
      
      toast.error('Failed to send message. Please try again.', {
        description: error.message || 'Network error'
      });
    }
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    handleSendMessage(prompt);
  };

  const handleClose = () => {
    setIsOpen(false);
    setConversationId(null);
    setMessages([]);
    setInput('');
    setIsLoading(false);
    if (isRecording) stopRecording();
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-8 h-8" />
            
            <motion.div
              className="absolute inset-0 rounded-full bg-white opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-50 w-full max-w-md h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs opacity-90">Your intelligent family helper</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            {(!messages || messages.length === 0) && !isLoading && (
              <div className="p-4 border-b bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.prompt)}
                      className="gap-2"
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {(!messages || messages.length === 0) && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                  <h4 className="font-semibold text-lg text-gray-700 mb-2">
                    Hi {user?.full_name?.split(' ')[0] || 'there'}!
                  </h4>
                  <p className="text-sm text-gray-500">
                    I can help with baby care, family tasks, meal planning, and navigate you anywhere in DobryLife.
                  </p>
                </div>
              )}

              {Array.isArray(messages) && messages.length > 0 && messages.map((msg, idx) => {
                if (!msg) return null;
                return <MessageBubble key={msg.id || idx} message={msg} />;
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[44px] max-h-32 resize-none"
                  rows={1}
                  disabled={isLoading}
                />

                {recognitionRef.current && (
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    className="h-11 w-11"
                    disabled={isLoading}
                  >
                    {isRecording ? (
                      <StopCircle className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-11 w-11 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}