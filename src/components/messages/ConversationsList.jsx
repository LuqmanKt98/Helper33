import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
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

  // Get all messages for current user
  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['allDirectMessages', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const messages = await base44.entities.DirectMessage.filter(
        {},
        '-created_date',
        500
      );
      return messages.filter(m => 
        (m.sender_email === currentUser.email && !m.is_deleted_by_sender) ||
        (m.recipient_email === currentUser.email && !m.is_deleted_by_recipient)
      );
    },
    enabled: !!currentUser?.email,
    refetchInterval: 5000
  });

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadMessages', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return 0;
      const unread = allMessages.filter(
        m => m.recipient_email === currentUser.email && !m.is_read
      );
      return unread.length;
    },
    enabled: !!currentUser?.email && allMessages.length > 0
  });

  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const convMap = {};
    
    allMessages.forEach(msg => {
      const convId = msg.conversation_id;
      if (!convMap[convId]) {
        const isUserSender = msg.sender_email === currentUser.email;
        convMap[convId] = {
          id: convId,
          recipientId: isUserSender ? msg.recipient_id : msg.sender_id,
          recipientEmail: isUserSender ? msg.recipient_email : msg.sender_email,
          recipientName: isUserSender ? msg.recipient_name : msg.sender_name,
          recipientAvatar: isUserSender ? null : msg.sender_avatar,
          lastMessage: msg,
          unreadCount: 0,
          messages: []
        };
      }
      
      convMap[convId].messages.push(msg);
      
      // Update last message if newer
      if (new Date(msg.created_date) > new Date(convMap[convId].lastMessage.created_date)) {
        convMap[convId].lastMessage = msg;
      }
      
      // Count unread
      if (msg.recipient_email === currentUser.email && !msg.is_read) {
        convMap[convId].unreadCount++;
      }
    });

    return Object.values(convMap).sort(
      (a, b) => new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
    );
  }, [allMessages, currentUser?.email]);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
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
                  className={`w-full p-4 flex items-center gap-3 hover:bg-purple-50 transition-all border-b border-gray-100 ${
                    selectedConversationId === conv.id ? 'bg-purple-100' : ''
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