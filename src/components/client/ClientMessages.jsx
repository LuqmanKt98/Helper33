import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientMessages({ user }) {
  const { data: allMessages = [] } = useQuery({
    queryKey: ['clientMessages', user.email],
    queryFn: () => base44.entities.AppointmentChat.filter({ client_email: user.email }, '-created_date'),
    initialData: []
  });

  const conversationsByPractitioner = allMessages.reduce((acc, msg) => {
    if (!acc[msg.practitioner_id]) {
      acc[msg.practitioner_id] = {
        practitioner_id: msg.practitioner_id,
        practitioner_name: msg.practitioner_name,
        messages: []
      };
    }
    acc[msg.practitioner_id].messages.push(msg);
    return acc;
  }, {});

  const conversations = Object.values(conversationsByPractitioner);

  return (
    <div className="space-y-6">
      <Card className="bg-red-50 border-2 border-red-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">⚠️ Scheduling Communication Only</p>
              <p>These messages are <strong>ONLY</strong> for appointment scheduling. DO NOT discuss symptoms, treatment, or clinical matters through this system.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            My Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conv, idx) => (
                <ConversationCard key={conv.practitioner_id} conversation={conv} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No messages yet</p>
              <Link to={createPageUrl('FindPractitioners')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Find Practitioners
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConversationCard({ conversation, index }) {
  const lastMessage = conversation.messages[0];
  const unreadCount = conversation.messages.filter(m => !m.is_read && m.sender_type === 'practitioner').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={createPageUrl(`PractitionerDetail?id=${conversation.practitioner_id}`)}>
        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{conversation.practitioner_name}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {lastMessage.message}
                </p>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white ml-2">{unreadCount}</Badge>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(lastMessage.created_date).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}