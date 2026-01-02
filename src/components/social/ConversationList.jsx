import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Flame, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ConversationList() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['allDirectConversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('direct_conversations')
        .select(`
          *,
          p1:participant_1_id (id, full_name, avatar_url),
          p2:participant_2_id (id, full_name, avatar_url)
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_time', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return null;
    const isP1 = conversation.participant_1_id === user.id;
    const other = isP1 ? conversation.p2 : conversation.p1;
    return {
      id: other?.id,
      name: other?.full_name || 'User',
      avatar: other?.avatar_url
    };
  };

  const getUnreadCount = (conversation) => {
    if (!user || !conversation) return 0;
    return conversation.participant_1_id === user.id
      ? conversation.unread_count_p1
      : conversation.unread_count_p2;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Conversations Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start chatting with friends to see your conversations here!
          </p>
          <Link to={createPageUrl('Messages')}>
            <Button className="bg-purple-600">
              Start a Conversation
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="space-y-1">
          {conversations.map((conversation, idx) => {
            const other = getOtherParticipant(conversation);
            const unreadCount = getUnreadCount(conversation);

            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={createPageUrl('Messages') + `?conversation=${conversation.id}`}>
                  <div
                    className={`p-4 cursor-pointer border-b transition-all hover:bg-purple-50 ${unreadCount > 0 ? 'bg-purple-50/50' : ''
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ring-2 ring-purple-200">
                          {other?.avatar ? (
                            <img src={other.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            other?.name?.[0] || 'U'
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                            {other?.name}
                          </p>
                          {conversation.last_message_time && (
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.last_message_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate flex-1 ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {conversation.last_message_sender_id === user.id && 'You: '}
                            {conversation.last_message_content || 'Start chatting...'}
                          </p>
                        </div>

                        {conversation.streak_days > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-orange-600 font-semibold">
                              {conversation.streak_days} day streak!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}