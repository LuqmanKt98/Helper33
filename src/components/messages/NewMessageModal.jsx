import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
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
      const allProfiles = await base44.entities.CommunityProfile.filter({}, '-created_date', 50);
      return allProfiles.filter(p => 
        p.created_by !== currentUser.email &&
        (p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)
      );
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
      const conversationId = generateConversationId(currentUser.email, selectedUser.created_by);
      
      const messageData = {
        sender_id: currentUser.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email,
        sender_avatar: currentUser.avatar_url,
        recipient_id: selectedUser.id,
        recipient_email: selectedUser.created_by,
        recipient_name: selectedUser.display_name,
        content: message,
        conversation_id: conversationId,
        is_read: false
      };

      await base44.entities.DirectMessage.create(messageData);

      return {
        id: conversationId,
        recipientId: selectedUser.id,
        recipientEmail: selectedUser.created_by,
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
                          className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all ${
                            canMessage 
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