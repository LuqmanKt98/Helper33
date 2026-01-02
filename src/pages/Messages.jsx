import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';
import ConversationsList from '@/components/messages/ConversationsList';
import DirectMessageChat from '@/components/messages/DirectMessageChat';
import NewMessageModal from '@/components/messages/NewMessageModal';

export default function Messages() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile;
    }
  });

  // Get recipient profile when conversation is selected
  const { data: recipientProfile } = useQuery({
    queryKey: ['recipientProfile', selectedConversation?.recipientEmail],
    queryFn: async () => {
      if (!selectedConversation?.recipientId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedConversation.recipientId)
        .single();
      return data || null;
    },
    enabled: !!selectedConversation?.recipientId
  });

  const handleConversationCreated = (conversation) => {
    setSelectedConversation(conversation);
    setShowNewMessage(false);
    queryClient.invalidateQueries({ queryKey: ['allDirectConversations'] });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            💬
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In to Message</h2>
          <p className="text-gray-600">Please log in to view and send messages</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Messages - Helper33"
        description="Send and receive direct messages with the Helper33 community"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 -right-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 -left-20 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                Messages
              </h1>
              <p className="text-gray-600 mt-1">Connect with the Helper33 community</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
              {/* Conversations List */}
              <AnimatePresence mode="wait">
                {(!isMobileView || !selectedConversation) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="md:col-span-1"
                  >
                    <Card className="h-full overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
                      <ConversationsList
                        currentUser={user}
                        onSelectConversation={setSelectedConversation}
                        onNewMessage={() => setShowNewMessage(true)}
                        selectedConversationId={selectedConversation?.id}
                      />
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Area */}
              <AnimatePresence mode="wait">
                {(!isMobileView || selectedConversation) && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="md:col-span-2"
                  >
                    <Card className="h-full overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
                      {selectedConversation ? (
                        <DirectMessageChat
                          conversation={selectedConversation}
                          currentUser={user}
                          recipientProfile={recipientProfile}
                          onBack={() => setSelectedConversation(null)}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center p-8">
                            <motion.div
                              animate={{ y: [0, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-7xl mb-6"
                            >
                              💬
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Select a Conversation
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Choose a conversation from the list or start a new one
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowNewMessage(true)}
                              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                              Start New Message
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* New Message Modal */}
        <NewMessageModal
          isOpen={showNewMessage}
          onClose={() => setShowNewMessage(false)}
          currentUser={user}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </>
  );
}