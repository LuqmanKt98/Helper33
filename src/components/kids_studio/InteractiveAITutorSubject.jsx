import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function InteractiveAITutorSubject({ 
  subject, 
  childAge, 
  onComplete,
  icon = '📚',
  color = 'from-blue-500 to-purple-500'
}) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.4;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    const userMessage = { role: 'user', content: question };
    setMessages([...messages, userMessage]);
    setQuestion('');
    setIsLoading(true);
    setQuestionsAsked(q => q + 1);

    try {
      const prompt = `You are a friendly, encouraging AI tutor helping a ${childAge || 6}-year-old child learn about ${subject}.

The child asked: "${question}"

Respond in a way that:
1. Is age-appropriate and simple
2. Encourages curiosity
3. Uses examples the child can relate to
4. Keeps it short (2-3 sentences max)
5. Ends with a follow-up question to keep them engaged

Be warm, enthusiastic, and supportive!`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      const aiMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMessage]);
      
      speak(response);
      
      // Award points every 3 questions
      if (questionsAsked % 3 === 2) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        toast.success('Great questions! +5 points!');
        if (onComplete) onComplete(5);
      }
    } catch (error) {
      console.error('Error getting tutor response:', error);
      toast.error('Oops! The tutor had trouble answering. Try again!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`bg-gradient-to-r ${color} text-white border-0 shadow-xl`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{icon}</div>
                <div>
                  <h2 className="text-2xl font-bold">{subject} Tutor</h2>
                  <p className="text-white/90 text-sm">Ask me anything!</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{questionsAsked}</div>
                  <div className="text-xs text-white/80">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.floor(questionsAsked / 3) * 5}</div>
                  <div className="text-xs text-white/80">Points</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat Area */}
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-purple-50 rounded-xl">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Brain className="w-16 h-16 text-purple-300 mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Hi! I'm your {subject} tutor! 👋
                </h4>
                <p className="text-sm text-gray-600">
                  Ask me anything about {subject} and I'll help you learn!
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white border-2 border-purple-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-purple-600"
              >
                <Brain className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Thinking...</span>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder={`Ask about ${subject}...`}
              className="flex-1 border-2 border-purple-300 focus:border-purple-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!question.trim() || isLoading}
              className={`bg-gradient-to-r ${color}`}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            💡 Every 3 questions = 5 bonus points!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}