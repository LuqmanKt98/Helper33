import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  User,
  Loader2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationsList({
  currentUser,
  onSelectConversation,
  onNewMessage,
  selectedConversationId
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get all conversations for current user
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['allDirectConversations', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const { data, error } = await supabase
        .from('direct_conversations')
        .select(`
          *,
          participant_1:profiles!participant_1_id(id, email, full_name, avatar_url),
          participant_2:profiles!participant_2_id(id, email, full_name, avatar_url)
        `)
        .or(`participant_1_id.eq.${currentUser.id},participant_2_id.eq.${currentUser.id}`)
        .order('last_message_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser?.id,
    refetchInterval: 5000
  });

  // Get unread count across all conversations
  const unreadCount = conversations.reduce((acc, conv) => {
    const countsAsP1 = conv.participant_1_id === currentUser.id;
    return acc + (countsAsP1 ? conv.unread_count_p1 : conv.unread_count_p2);
  }, 0);

  // Process conversations for display
  const processedConversations = React.useMemo(() => {
    return conversations.map(conv => {
      const isParticipant1 = conv.participant_1_id === currentUser.id;
      const other = isParticipant1 ? conv.participant_2 : conv.participant_1;
      const unreadCount = isParticipant1 ? conv.unread_count_p1 : conv.unread_count_p2;

      return {
        id: conv.id,
        recipientId: other.id,
        recipientEmail: other.email,
        recipientName: other.full_name,
        recipientAvatar: other.avatar_url,
        lastMessage: {
          content: conv.last_message_content,
          created_date: conv.last_message_time,
          sender_id: conv.last_message_sender_id
        },
        unreadCount,
        streakDays: conv.streak_days
      };
    });
  }, [conversations, currentUser?.id]);

  // Filter conversations by search
  const filteredConversations = processedConversations.filter(conv =>
    conv.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-b border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              Messages
            </h2>
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onNewMessage}
              size="icon"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 border-purple-200 focus:border-purple-400 rounded-full"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              💬
            </motion.div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm text-center mt-2">
              Start a conversation with someone from the community!
            </p>
            <Button
              onClick={onNewMessage}
              className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conv, idx) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-purple-50 transition-all border-b border-gray-100 ${selectedConversationId === conv.id ? 'bg-purple-100' : ''
                    }`}
                >
                  {/* Avatar */}
                  {conv.recipientAvatar ? (
                    <img
                      src={conv.recipientAvatar}
                      alt={conv.recipientName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {conv.recipientName || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(conv.lastMessage.created_date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage.sender_email === currentUser.email && (
                        <span className="text-purple-600">You: </span>
                      )}
                      {conv.lastMessage.content}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full min-w-[24px] h-6 flex items-center justify-center">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}