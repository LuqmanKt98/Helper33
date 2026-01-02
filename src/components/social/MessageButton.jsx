import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function MessageButton({ targetUserEmail, targetUserName, currentUser, variant = 'default', size = 'default' }) {
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    if (!currentUser) {
      toast.info('Please log in to send messages');
      return;
    }

    try {
      // Check if conversation exists (using UUIDs)
      const { data: existingConvs } = await supabase
        .from('direct_conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${currentUser.id},participant_2_id.eq.${targetUserEmail}),and(participant_1_id.eq.${targetUserEmail},participant_2_id.eq.${currentUser.id})`);

      if (existingConvs && existingConvs.length > 0) {
        navigate(createPageUrl(`Messages?conversation=${existingConvs[0].id}`));
        return;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from('direct_conversations')
        .insert({
          participant_1_id: currentUser.id,
          participant_2_id: targetUserEmail, // Assuming targetUserEmail is actually a UUID here based on usage
          last_message_content: 'Conversation started!',
          last_message_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

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