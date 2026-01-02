import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIBookingAssistant({ practitionerId, practitionerName }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'appointment_scheduler',
        metadata: {
          practitioner_id: practitionerId,
          practitioner_name: practitionerName
        }
      });
      setConversation(conv);

      // Add welcome message
      const welcomeMsg = {
        role: 'assistant',
        content: `Hi! 👋 I'm your AI scheduling assistant. I can help you book an appointment with ${practitionerName}.\n\nJust let me know your preferred date and time, and I'll check availability for you!`
      };
      setMessages([welcomeMsg]);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      toast.error('Failed to start chat. Please refresh the page.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, userMessage);
      
      // The response will come through the subscription
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [conversation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            AI Booking Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white border-2 border-purple-200 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    
                    {message.tool_calls && message.tool_calls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.tool_calls.map((toolCall, idx) => (
                          <div key={idx} className="bg-purple-50 rounded-lg p-2 text-xs">
                            <div className="flex items-center gap-2 text-purple-700">
                              {toolCall.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              )}
                              <span className="font-semibold">
                                {toolCall.name.includes('create') && '📅 Creating appointment...'}
                                {toolCall.name.includes('update') && '✏️ Updating appointment...'}
                                {toolCall.name.includes('read') && '🔍 Checking availability...'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border-2 border-purple-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-purple-200 p-4 bg-white">
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message... (e.g., 'I'd like to book an appointment for next Tuesday at 2pm')"
                className="flex-1 resize-none border-2 border-purple-300 focus:border-purple-500 rounded-xl"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Tip: Be specific about dates, times, and appointment type (telehealth/in-person)
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}