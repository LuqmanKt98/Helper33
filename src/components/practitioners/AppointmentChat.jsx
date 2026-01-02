
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, AlertCircle, CheckCircle, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AIMessageAssistant from './AIMessageAssistant';

export default function AppointmentChat({ practitioner, isPractitioner = false }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false); // Fixed: should be boolean for disabled prop
  const [showAIAssistant, setShowAIAssistant] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['appointmentChat', practitioner.id, user?.email],
    queryFn: () => {
      if (isPractitioner) {
        return base44.entities.AppointmentChat.filter({ practitioner_id: practitioner.id }, '-created_date');
      } else {
        return base44.entities.AppointmentChat.filter({
          practitioner_id: practitioner.id,
          client_email: user.email
        }, '-created_date');
      }
    },
    enabled: !!user,
    initialData: [],
    refetchInterval: 5000
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUseDraft = (draft) => {
    setMessage(draft);
    setShowAIAssistant(null);
    toast.success('Draft added! Review and send when ready.');
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    setSending(true);
    try {
      await base44.entities.AppointmentChat.create({
        practitioner_id: practitioner.id,
        practitioner_name: practitioner.full_name,
        client_email: user.email,
        client_name: user.full_name || user.email,
        message: message.trim(),
        sender_type: isPractitioner ? 'practitioner' : 'client'
      });

      const recipientEmail = isPractitioner
        ? (messages[0]?.client_email || user.email)
        : practitioner.created_by;

      if (recipientEmail) {
        await base44.entities.Notification.create({
          user_email: recipientEmail,
          title: '💬 New Scheduling Message',
          message: `New message from ${isPractitioner ? practitioner.full_name : user.full_name || user.email} about appointment scheduling.`,
          type: 'new_chat_message',
          entity_type: 'AppointmentChat',
          entity_id: practitioner.id,
          is_read: false
        });
      }

      setMessage('');
      queryClient.invalidateQueries(['appointmentChat']);
      toast.success('Message sent! 💬');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please log in to message this practitioner</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Critical Disclaimer */}
      <Card className="bg-red-50 border-2 border-red-400 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="text-sm text-gray-800">
              <p className="font-bold mb-2 text-red-700 text-base">⚠️ IMPORTANT: This messaging feature is for scheduling and general inquiries only.</p>
              <p className="font-semibold mb-3">It cannot be used for clinical advice, diagnosis, or emergency communication.</p>

              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <p className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    You CAN message about:
                  </p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Scheduling inquiries</li>
                    <li>• Availability questions</li>
                    <li>• Fee and insurance questions</li>
                    <li>• Intake process questions</li>
                    <li>• "Are you accepting new clients?"</li>
                    <li>• "Can I book an appointment?"</li>
                  </ul>
                </div>

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                  <p className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    You CANNOT message about:
                  </p>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Crisis care or emergencies</li>
                    <li>• Diagnosis or medical advice</li>
                    <li>• Clinical recommendations</li>
                    <li>• Treatment interventions</li>
                    <li>• Symptom discussions</li>
                    <li>• Mental health emergencies</li>
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-xs font-semibold text-red-700">
                🚨 If you're experiencing a crisis, call 988 (Suicide & Crisis Lifeline) or 911 immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Scheduling & Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-16 h-16 text-purple-300 mb-4" />
                <p className="text-gray-600 font-medium mb-2">No messages yet</p>
                <p className="text-sm text-gray-500">Start a conversation about scheduling or general inquiries</p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, idx) => {
                  const isOwnMessage = msg.sender_type === 'client' && !isPractitioner || msg.sender_type === 'practitioner' && isPractitioner;

                  return (
                    <React.Fragment key={msg.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3 rounded-xl shadow-md ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border-2 border-purple-200'
                        }`}>
                          <p className="text-xs font-semibold mb-1 opacity-70">
                            {msg.sender_type === 'practitioner' ? practitioner.full_name : msg.client_name}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>

                      {/* AI Assistant for Practitioner responding to client messages */}
                      {isPractitioner && msg.sender_type === 'client' && showAIAssistant === msg.id && (
                        <AIMessageAssistant
                          clientMessage={msg.message}
                          onUseDraft={handleUseDraft}
                        />
                      )}

                      {/* AI Button for Practitioner */}
                      {isPractitioner && msg.sender_type === 'client' && !isOwnMessage && (
                        <div className="flex justify-start mt-1"> {/* Added mt-1 for spacing */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowAIAssistant(showAIAssistant === msg.id ? null : msg.id)}
                            className="text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {showAIAssistant === msg.id ? 'Hide AI' : 'AI Suggest Response'}
                          </Button>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about scheduling, availability, fees, or general inquiries..."
              rows={2}
              className="border-2 border-purple-300 focus:border-purple-500 transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
