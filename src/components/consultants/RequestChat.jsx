import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Send,
  User
} from 'lucide-react';
import { toast } from 'sonner';

export default function RequestChat({ requestId, offerId, clientEmail, consultantEmail }) {
  const [message, setMessage] = useState('');
  const [proposalData, setProposalData] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isClient = user?.email === clientEmail;

  const { data: conversation } = useQuery({
    queryKey: ['requestConversation', requestId, offerId],
    queryFn: async () => {
      const convos = await base44.entities.RequestConversation.filter({
        request_id: requestId,
        offer_id: offerId
      });
      
      if (convos.length === 0) {
        // Create conversation
        const newConvo = await base44.entities.RequestConversation.create({
          request_id: requestId,
          offer_id: offerId,
          client_email: clientEmail,
          consultant_email: consultantEmail,
          client_name: isClient ? user.full_name : '',
          consultant_name: !isClient ? user.full_name : ''
        });
        return newConvo;
      }
      
      return convos[0];
    },
    enabled: !!requestId && !!offerId
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['requestMessages', conversation?.id],
    queryFn: async () => {
      const msgs = await base44.entities.RequestMessage.filter({
        conversation_id: conversation.id
      }, 'created_date');
      return msgs || [];
    },
    enabled: !!conversation,
    refetchInterval: 5000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msgData) => {
      const msg = await base44.entities.RequestMessage.create({
        conversation_id: conversation.id,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
        sender_type: isClient ? 'client' : 'consultant',
        ...msgData
      });

      // Update conversation
      await base44.entities.RequestConversation.update(conversation.id, {
        last_message: msgData.content,
        last_message_at: new Date().toISOString(),
        last_message_sender: isClient ? 'client' : 'consultant',
        message_count: (conversation.message_count || 0) + 1,
        [isClient ? 'unread_by_consultant' : 'unread_by_client']: 
          (conversation[isClient ? 'unread_by_consultant' : 'unread_by_client'] || 0) + 1
      });

      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['requestMessages']);
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      content: message,
      message_type: 'text'
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="border-4 border-blue-400 shadow-2xl bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          💬 Conversation
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/30 to-purple-50/30">
          {messages.map((msg, idx) => {
            const isMine = msg.sender_email === user?.email;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${isMine ? 'flex flex-col items-end' : ''}`}>
                  <div className={`rounded-2xl p-4 ${
                    isMine
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white border-2 border-blue-200 text-gray-900'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    
                    {msg.meeting_proposal_data && (
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-xs font-semibold mb-2">📅 Meeting Proposal</p>
                        <p className="text-xs">
                          Date: {new Date(msg.meeting_proposal_data.proposed_date).toLocaleString()}
                        </p>
                        <p className="text-xs">
                          Duration: {msg.meeting_proposal_data.proposed_duration} min
                        </p>
                        <p className="text-xs">
                          Rate: ${msg.meeting_proposal_data.proposed_rate}/hr
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.created_date).toLocaleTimeString()}
                  </p>
                </div>

                {isMine && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t-2 border-gray-200">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 border-2 border-purple-300"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}