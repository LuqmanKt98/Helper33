
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Send,
  Loader2,
  X,
  Brain,
  BookmarkPlus,
  Shield
} from 'lucide-react';
import MessageBubble from '@/components/ai/MessageBubble';
import { toast } from 'sonner';

export default function AIResourceNavigator({ onClose, userCountry, userLanguage }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
  }, [conversationId]);

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      let convId = conversationId;

      if (!convId) {
        // Create a new conversation with resource navigation mode
        const newConv = await base44.agents.createConversation({
          agent_name: 'crisis_support',
          metadata: {
            name: 'AI Resource Navigator', // Changed from 'Resource Navigation'
            mode: 'resource_finder',
            user_country: userCountry,
            user_language: userLanguage,
            initial_query: textToSend // Added initial_query
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

  const quickStartQuestions = [
    "I need immediate crisis support",
    "Looking for a therapist near me", // Changed
    "Help with addiction recovery",    // Changed
    "Domestic violence resources",
    "Support for LGBTQ+ person",
    "Veterans mental health support", // Changed
    "Youth crisis support"
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-purple-600" />
            AI Resource Navigator
          </h2>
          <p className="text-gray-600 text-sm">
            Tell me what you need, and I'll find the best resources for you
          </p>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200"
      >
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How I can help:</p>
            <ul className="space-y-1 text-blue-800">
              <li>✓ Ask questions to understand your specific needs</li>
              <li>✓ Search and recommend the best resources for you</li>
              <li>✓ Provide contact information and help save resources</li> {/* Changed */}
              <li>✓ Filter by location, language, and availability</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <Card className="border-2 border-purple-200 shadow-xl">
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-purple-50/30">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Heart className="w-16 h-16 text-purple-400 mb-4 fill-current" />
                </motion.div>
                <h4 className="font-semibold text-lg text-gray-700 mb-2">
                  Hi! I'm here to help you find support 💜
                </h4>
                <p className="text-sm text-gray-600 mb-6 max-w-md">
                  I can guide you to the right resources based on your needs. Just tell me what kind of help you're looking for, or click a quick start below.
                </p>

                {/* Quick Start Buttons */}
                <div className="grid md:grid-cols-2 gap-2 w-full max-w-md">
                  {quickStartQuestions.map((question, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Button
                        onClick={() => handleSendMessage(question)}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto py-3 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400"
                      >
                        <span className="text-xs">{question}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <MessageBubble key={msg.id || idx} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Finding the best resources for you...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t-2 border-purple-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Describe what you need help with..."
                className="flex-1 border-2 border-purple-200 focus:border-purple-400"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                💡 Be specific about your needs for better recommendations
              </p>
              {userCountry && (
                <Badge variant="outline" className="text-xs border-purple-300">
                  📍 {userCountry} • {userLanguage?.toUpperCase() || 'EN'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-blue-900">Smart Matching</p>
          <p className="text-xs text-blue-700">AI finds resources that fit your needs</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg text-center">
          <BookmarkPlus className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-purple-900">Auto-Save</p>
          <p className="text-xs text-purple-700">Recommended resources saved for you</p>
        </div>
        <div className="p-3 bg-pink-50 rounded-lg text-center">
          <Heart className="w-6 h-6 text-pink-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-pink-900">Personalized</p>
          <p className="text-xs text-pink-700">Based on your location & language</p>
        </div>
      </div>
    </div>
  );
}
