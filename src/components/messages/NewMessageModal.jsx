import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  User,
  Send,
  Loader2,
  X,
  MessageSquare,
  Lock
} from 'lucide-react';

export default function NewMessageModal({ isOpen, onClose, currentUser, onConversationCreated }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  // Get community profiles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['communityProfiles', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id)
        .limit(50);

      if (searchQuery) {
        query = query.ilike('full_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(p => ({
        ...p,
        display_name: p.full_name // Map to expected display_name
      }));
    },
    enabled: isOpen
  });

  // Generate conversation ID
  const generateConversationId = (user1Email, user2Email) => {
    const sorted = [user1Email, user2Email].sort();
    return `conv_${sorted[0]}_${sorted[1]}`.replace(/[^a-zA-Z0-9_]/g, '_');
  };

  // Check if user can receive messages
  const canSendMessage = (profile) => {
    const settings = profile.privacy_settings || {};
    if (settings.allow_messages === false) return false;
    if (settings.allow_messages_from === 'nobody') return false;
    if (settings.allow_messages_from === 'followers_only') {
      return profile.followers?.includes(currentUser.id);
    }
    if (profile.blocked_users?.includes(currentUser.id)) return false;
    return true;
  };

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      // 1. Check if conversation already exists
      const { data: convs, error: findError } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`participant_1_id.eq.${currentUser.id},participant_2_id.eq.${currentUser.id}`);

      if (findError) throw findError;

      let conversation = convs?.find(c =>
        (c.participant_1_id === currentUser.id && c.participant_2_id === selectedUser.id) ||
        (c.participant_1_id === selectedUser.id && c.participant_2_id === currentUser.id)
      );

      if (!conversation) {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('direct_conversations')
          .insert({
            participant_1_id: currentUser.id,
            participant_2_id: selectedUser.id,
            participant_1_email: currentUser.email,
            participant_2_email: selectedUser.email,
            last_message_content: message,
            last_message_time: new Date().toISOString(),
            last_message_sender_id: currentUser.id,
            unread_count_p2: 1
          })
          .select()
          .single();

        if (createError) throw createError;
        conversation = newConv;
      }

      const messageContent = message;
      const messageData = {
        sender_id: currentUser.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email,
        recipient_id: selectedUser.id,
        recipient_email: selectedUser.email,
        recipient_name: selectedUser.display_name,
        content: messageContent,
        conversation_id: conversation.id,
        is_read: false
      };

      await supabase.from('direct_messages').insert(messageData);

      // Update conversation metadata if it existed
      if (conversation.id) {
        const isParticipant1 = conversation.participant_1_id === currentUser.id;
        const otherUnreadField = isParticipant1 ? 'unread_count_p2' : 'unread_count_p1';

        await supabase
          .from('direct_conversations')
          .update({
            last_message_content: messageContent,
            last_message_time: new Date().toISOString(),
            last_message_sender_id: currentUser.id,
            [otherUnreadField]: (conversation[otherUnreadField] || 0) + 1
          })
          .eq('id', conversation.id);
      }

      return {
        ...conversation,
        recipientId: selectedUser.id,
        recipientEmail: selectedUser.email,
        recipientName: selectedUser.display_name,
        recipientAvatar: selectedUser.avatar_url
      };
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['allDirectMessages'] });
      onConversationCreated(conversation);
      handleClose();
    }
  });

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUser(null);
    setMessage('');
    onClose();
  };

  const handleSend = () => {
    if (!selectedUser || !message.trim()) return;
    sendMessageMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!selectedUser ? (
            <>
              {/* Search Users */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a user..."
                  className="pl-10 border-purple-200"
                />
              </div>

              {/* User List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {profiles.map((profile, idx) => {
                      const canMessage = canSendMessage(profile);
                      return (
                        <motion.button
                          key={profile.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => canMessage && setSelectedUser(profile)}
                          disabled={!canMessage}
                          className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all ${canMessage
                            ? 'hover:bg-purple-50 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.display_name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{profile.display_name}</p>
                            {profile.interests?.length > 0 && (
                              <p className="text-xs text-gray-500 truncate">
                                {profile.interests.slice(0, 2).join(', ')}
                              </p>
                            )}
                          </div>
                          {!canMessage && (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected User */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg mb-4">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.display_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedUser.display_name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message Input */}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                className="flex-1 min-h-[120px] border-purple-200 resize-none"
              />

              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}