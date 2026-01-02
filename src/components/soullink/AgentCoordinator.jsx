import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from '@/components/ai/MessageBubble';
import { Sparkles, Send, Loader2, RefreshCw, Heart, Brain, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { soullinkCheckIn } from '@/functions/soullinkCheckIn';

export default function AgentCoordinator({ settings }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasProactiveMessage, setHasProactiveMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  // Check for proactive check-in on mount
  useEffect(() => {
    checkForProactiveMessage();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkForProactiveMessage = async () => {
    try {
      const result = await soullinkCheckIn({});
      
      if (result.data.should_check_in) {
        // Create a new conversation
        const conv = await base44.agents.createConversation({
          agent_name: 'soullink',
          metadata: {
            name: `Check-in: ${result.data.reason}`,
            type: result.data.reason,
            urgency: result.data.urgency
          }
        });

        setConversationId(conv.id);
        setHasProactiveMessage(true);

        // Add the proactive message
        setMessages([{
          role: 'assistant',
          content: result.data.message,
          timestamp: new Date().toISOString(),
          context: result.data.context_summary
        }]);

        // Show notification for urgent messages
        if (result.data.urgency === 'high') {
          toast.info('SoulLink has an important message for you 💜', {
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error checking for proactive message:', error);
    }
  };

  const startNewConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'soullink',
        metadata: {
          name: 'Chat with SoulLink',
          started_at: new Date().toISOString()
        }
      });

      setConversationId(conv.id);
      setMessages([]);
      setHasProactiveMessage(false);
      toast.success('New conversation started');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create conversation if needed
      let convId = conversationId;
      if (!convId) {
        const conv = await base44.agents.createConversation({
          agent_name: 'soullink',
          metadata: {
            name: 'Chat with SoulLink',
            started_at: new Date().toISOString()
          }
        });
        convId = conv.id;
        setConversationId(convId);
      }

      // Get current conversation
      const conversation = await base44.agents.getConversation(convId);

      // Add user message
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });

      // Messages will update via subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [conversationId]);

  return (
    <div className="space-y-6">
      {/* Proactive Message Alert */}
      {hasProactiveMessage && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-purple-900 mb-1">
                    SoulLink reached out to you 💜
                  </p>
                  <p className="text-sm text-purple-800">
                    Based on your recent activity, I wanted to check in on you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Conversation Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {settings?.companion_name || 'SoulLink'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {conversationId && (
                <Button
                  onClick={startNewConversation}
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Chat
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-white">
            {messages.length === 0 && !hasProactiveMessage && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  I'm here for you, whenever you need me.
                </p>
                <p className="text-sm text-gray-500">
                  Start a conversation or I'll check in on you periodically.
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <MessageBubble message={msg} />
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-purple-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-purple-700">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-purple-200 p-4 bg-white">
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
                placeholder={`Message ${settings?.companion_name || 'SoulLink'}...`}
                disabled={isLoading}
                className="flex-1 min-h-[60px] resize-none rounded-xl border-purple-200 focus:border-purple-400"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="self-end bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Brain className="w-3 h-3" />
              <span>
                I remember your past conversations, journal themes, and wellness patterns
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Awareness Indicators */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            What I Know About You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ContextBadge
            icon={Heart}
            label="Mood Patterns"
            value="Last 7 days tracked"
            color="pink"
          />
          <ContextBadge
            icon={Brain}
            label="Journal Themes"
            value="Recent reflections analyzed"
            color="purple"
          />
          <ContextBadge
            icon={AlertCircle}
            label="Health Insights"
            value="Active correlations monitored"
            color="blue"
          />
          <ContextBadge
            icon={Sparkles}
            label="Personal Memories"
            value="Important details remembered"
            color="yellow"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ContextBadge({ icon: Icon, label, value, color }) {
  const colorClasses = {
    pink: 'bg-pink-100 text-pink-700 border-pink-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[color]}`}>
      <Icon className="w-5 h-5" />
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs opacity-80">{value}</p>
      </div>
    </div>
  );
}