import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Search,
  Loader2,
  User,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

export default function ConversationList() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { user: authUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark messages as read
      if (data && data.length > 0) {
        const unreadIds = data
          .filter(m => m.recipient_id === user.id && !m.is_read)
          .map(m => m.id);

        if (unreadIds.length > 0) {
          await supabase
            .from('direct_messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .in('id', unreadIds);
        }
      }

      return data || [];
    },
    enabled: !!selectedConversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (params) => {
      const { conversationId, content } = params;
      const conversation = conversations.find(c => c.id === conversationId);
      const recipientId = conversation.participant_1_id === user.id
        ? conversation.participant_2_id
        : conversation.participant_1_id;

      const { error: messageError } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_email: user.email,
          sender_name: user.full_name,
          recipient_id: recipientId,
          content: content,
          is_read: false
        });

      if (messageError) throw messageError;

      // Update conversation
      const unreadField = conversation.participant_1_id === recipientId
        ? 'unread_count_p1'
        : 'unread_count_p2';

      await supabase
        .from('direct_conversations')
        .update({
          last_message_content: content,
          last_message_time: new Date().toISOString(),
          last_message_sender_id: user.id,
          [unreadField]: (conversation[unreadField] || 0) + 1
        })
        .eq('id', conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      setMessageText('');
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: messageText
    });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participant_1_id === user?.id
      ? {
        id: conversation.participant_2_id,
        email: conversation.participant_2_email
      }
      : {
        id: conversation.participant_1_id,
        email: conversation.participant_1_email
      };
  };

  const getUnreadCount = (conversation) => {
    return conversation.participant_1_id === user?.id
      ? conversation.unread_count_p1 || 0
      : conversation.unread_count_p2 || 0;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    return other.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <div className="md:col-span-1 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[520px]">
          {filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <motion.div
                  key={conversation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => setSelectedConversation(conversation)}
                    className={`cursor-pointer transition-all ${isSelected
                      ? 'border-2 border-purple-500 bg-purple-50'
                      : 'hover:shadow-md'
                      }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {other.email?.[0]?.toUpperCase() || 'U'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                              {other.email}
                            </h4>
                            {unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 truncate mb-1">
                            {conversation.last_message_content || 'No messages yet'}
                          </p>

                          <p className="text-xs text-gray-500">
                            {conversation.last_message_time
                              ? formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })
                              : 'Just now'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className="md:col-span-2">
        {selectedConversation ? (
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {getOtherParticipant(selectedConversation).email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {getOtherParticipant(selectedConversation).email}
                  </h3>
                  <p className="text-xs text-gray-600">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((message, idx) => {
                  const isMine = message.sender_id === user?.id;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${isMine
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${isMine ? 'text-purple-100' : 'text-gray-500'
                            }`}
                        >
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || !messageText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Select a Conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the list to start messaging
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}