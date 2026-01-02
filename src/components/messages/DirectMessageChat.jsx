import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Ban,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Smile,
  Loader2,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isToday, isYesterday } from 'date-fns';

export default function DirectMessageChat({ 
  conversation, 
  currentUser, 
  onBack, 
  recipientProfile 
}) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['directMessages', conversation?.id],
    queryFn: async () => {
      if (!conversation?.id) return [];
      const allMessages = await base44.entities.DirectMessage.filter(
        { conversation_id: conversation.id },
        'created_date',
        100
      );
      return allMessages.filter(m => 
        (m.sender_email === currentUser.email && !m.is_deleted_by_sender) ||
        (m.recipient_email === currentUser.email && !m.is_deleted_by_recipient)
      );
    },
    enabled: !!conversation?.id,
    refetchInterval: 3000
  });

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      if (!messages.length) return;
      const unread = messages.filter(
        m => m.recipient_email === currentUser.email && !m.is_read
      );
      for (const msg of unread) {
        await base44.entities.DirectMessage.update(msg.id, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      }
      if (unread.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['directMessages'] });
        queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
      }
    };
    markAsRead();
  }, [messages, currentUser.email]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const message = {
        sender_id: currentUser.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email,
        sender_avatar: currentUser.avatar_url,
        recipient_id: recipientProfile?.created_by || conversation.recipientId,
        recipient_email: recipientProfile?.created_by || conversation.recipientEmail,
        recipient_name: recipientProfile?.display_name || conversation.recipientName,
        content,
        conversation_id: conversation.id,
        is_read: false
      };
      return await base44.entities.DirectMessage.create(message);
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['directMessages', conversation?.id] });
    }
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const formatMessageTime = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
    return format(d, 'MMM d, h:mm a');
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const date = format(new Date(msg.created_date), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          {recipientProfile?.avatar_url ? (
            <img 
              src={recipientProfile.avatar_url} 
              alt={recipientProfile.display_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {recipientProfile?.display_name || conversation?.recipientName || 'User'}
            </h3>
            {recipientProfile?.privacy_settings?.show_online_status && recipientProfile?.last_seen && (
              <p className="text-xs text-gray-500">
                Last seen {formatMessageTime(recipientProfile.last_seen)}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-red-600">
              <Ban className="w-4 h-4 mr-2" />
              Block User
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              💬
            </motion.div>
            <p>Start a conversation!</p>
            <p className="text-sm">Send your first message below</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center justify-center my-4">
                <Badge variant="outline" className="bg-white/80 text-gray-600">
                  {isToday(new Date(date)) ? 'Today' : 
                   isYesterday(new Date(date)) ? 'Yesterday' : 
                   format(new Date(date), 'MMMM d, yyyy')}
                </Badge>
              </div>
              
              <AnimatePresence>
                {msgs.map((msg, idx) => {
                  const isSender = msg.sender_email === currentUser.email;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div className={`max-w-[75%] ${isSender ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                            isSender
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                              : 'bg-white border border-purple-200 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(msg.created_date)}
                          </span>
                          {isSender && (
                            msg.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-gray-400" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-purple-200 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600">
            <Smile className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600">
            <ImageIcon className="w-5 h-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border-purple-200 focus:border-purple-400 rounded-full"
          />
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full"
              size="icon"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}