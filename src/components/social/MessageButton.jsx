import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MessageButton({ targetUserEmail, targetUserName, currentUser, variant = 'default', size = 'default' }) {
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    if (!currentUser) {
      toast.info('Please log in to send messages');
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    try {
      // Check if conversation exists
      const existingConvos = await base44.entities.Conversation.list();
      const existing = existingConvos.find(c => 
        c.participant_emails?.includes(currentUser.email) &&
        c.participant_emails?.includes(targetUserEmail)
      );

      if (existing) {
        navigate(createPageUrl(`Messages?conversation=${existing.id}`));
        return;
      }

      // Create new conversation
      const newConvo = await base44.entities.Conversation.create({
        participant_emails: [currentUser.email, targetUserEmail],
        participant_names: [currentUser.full_name, targetUserName],
        participant_avatars: [currentUser.avatar_url || '', ''],
        last_message: '',
        last_message_time: new Date().toISOString(),
        last_message_sender: currentUser.email,
        total_messages: 0
      });

      navigate(createPageUrl(`Messages?conversation=${newConvo.id}`));
      toast.success('Conversation started! +5 points');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <Button
      onClick={handleStartConversation}
      variant={variant}
      size={size}
      className="gap-2"
    >
      <MessageCircle className="w-4 h-4" />
      Message
    </Button>
  );
}