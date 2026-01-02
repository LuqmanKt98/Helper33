import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Bot,
  User as UserIcon,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function ConsultantChatAssistant({ consultants }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      // Initial greeting
      setMessages([{
        role: 'assistant',
        content: "Hi! 👋 I'm your AI consultant matchmaker. Tell me what you're looking for help with, and I'll recommend the best consultants for your needs. You can ask me anything about our experts!",
        timestamp: new Date()
      }]);
    }
  }, [isExpanded]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const consultantsContext = consultants.map(c => ({
        id: c.id,
        name: c.full_name,
        title: c.title,
        expertise: c.expertise,
        specializations: c.specializations?.map(s => ({ area: s.area, description: s.description })),
        bio: c.bio,
        rate: c.consultation_rate,
        experience: c.years_of_experience,
        rating: c.average_rating,
        reviews: c.total_reviews,
        languages: c.languages_spoken?.map(l => l.language),
        certifications: c.certifications?.map(cert => cert.certification_name)
      }));

      const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful AI assistant helping users find the perfect consultant. Be conversational, friendly, and helpful.

Available consultants:
${JSON.stringify(consultantsContext, null, 2)}

Conversation history:
${conversationHistory}

User's latest message: "${inputMessage}"

Respond naturally and helpfully. If they're asking about consultants:
- Recommend specific consultants by name
- Explain why each is a good fit
- Mention their rates, experience, and unique qualifications
- Include their consultant ID in your response when recommending someone

If they have questions, answer based on the consultant data. Be warm and supportive.`,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            recommended_consultant_ids: { 
              type: "array", 
              items: { type: "string" } 
            }
          }
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: result.message,
        recommendedConsultants: result.recommended_consultant_ids || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Sorry, I had trouble processing that. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Who can help with AI strategy?",
    "I need grief counseling support",
    "Show me wellness experts",
    "Who's best for career coaching?"
  ];

  return (
    <div className="mb-8">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card 
              className="border-4 border-blue-400 shadow-2xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 cursor-pointer hover:shadow-3xl transition-all"
              onClick={() => setIsExpanded(true)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl"
                    >
                      <MessageSquare className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        💬 Chat with AI Assistant
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Ask me anything to find your perfect consultant match
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-4 border-blue-400 shadow-2xl bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">AI Consultant Assistant</CardTitle>
                      <p className="text-white/80 text-sm">Powered by Helper33 AI</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsExpanded(false)}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Messages Area */}
                <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/30 to-purple-50/30">
                  {messages.map((message, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                        <div className={`rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border-2 border-blue-200 text-gray-900'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>

                        {/* Consultant Cards */}
                        {message.recommendedConsultants && message.recommendedConsultants.length > 0 && (
                          <div className="mt-3 space-y-2 w-full">
                            {message.recommendedConsultants.map(consultantId => {
                              const consultant = consultants.find(c => c.id === consultantId);
                              if (!consultant) return null;

                              return (
                                <motion.div
                                  key={consultantId}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <Card className="border-2 border-purple-300 bg-gradient-to-br from-white to-purple-50 shadow-lg hover:shadow-xl transition-all">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        {consultant.profile_picture_url ? (
                                          <img
                                            src={consultant.profile_picture_url}
                                            alt={consultant.full_name}
                                            className="w-12 h-12 rounded-full border-2 border-purple-300 object-cover"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                            <UserIcon className="w-6 h-6 text-white" />
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <p className="font-bold text-gray-900">{consultant.full_name}</p>
                                          <p className="text-xs text-gray-600">{consultant.title}</p>
                                        </div>
                                        {consultant.consultation_rate && (
                                          <Badge className="bg-green-100 text-green-800">
                                            ${consultant.consultation_rate}/hr
                                          </Badge>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <Link to={createPageUrl(`ConsultantProfile?consultantId=${consultant.id}`)} className="flex-1">
                                          <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Book Now
                                          </Button>
                                        </Link>
                                        <Link to={createPageUrl(`ConsultantProfile?consultantId=${consultant.id}`)}>
                                          <Button size="sm" variant="outline" className="border-purple-300">
                                            <ExternalLink className="w-4 h-4" />
                                          </Button>
                                        </Link>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white border-2 border-blue-200 rounded-2xl p-4">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex gap-2"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          <div className="w-2 h-2 bg-purple-600 rounded-full" />
                          <div className="w-2 h-2 bg-pink-600 rounded-full" />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">💡 Quick Questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setInputMessage(question)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-xs bg-white hover:bg-purple-50 text-purple-700 px-3 py-2 rounded-lg border border-purple-300 transition-all"
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t-2 border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about our consultants..."
                      className="flex-1 border-2 border-purple-300 focus:border-purple-500"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}