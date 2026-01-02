import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const cheerOptions = [
  { type: 'fire', emoji: '🔥', label: 'On Fire!' },
  { type: 'heart', emoji: '❤️', label: 'Love it!' },
  { type: 'clap', emoji: '👏', label: 'Amazing!' },
  { type: 'trophy', emoji: '🏆', label: 'Champion!' },
  { type: 'star', emoji: '⭐', label: 'Superstar!' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate!' },
  { type: 'strong', emoji: '💪', label: 'Strong!' },
  { type: 'wow', emoji: '😮', label: 'Wow!' }
];

export default function CheerButton({ activityId, activityOwnerId, currentCheer, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const cheerMutation = useMutation({
    mutationFn: async (reactionType) => {
      if (currentCheer) {
        return base44.entities.CheerReaction.update(currentCheer.id, {
          reaction_type: reactionType
        });
      }

      return base44.entities.CheerReaction.create({
        activity_id: activityId,
        cheerer_email: user.email,
        cheerer_name: user.full_name,
        cheerer_avatar: user.avatar_url,
        recipient_email: activityOwnerId,
        reaction_type: reactionType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-activities']);
      queryClient.invalidateQueries(['my-cheer-reactions']);
      setIsOpen(false);
    }
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {currentCheer ? (
          <Button 
            variant="outline" 
            size={compact ? 'sm' : 'default'}
            className="bg-purple-100 border-purple-400"
          >
            <span className="text-lg mr-2">{cheerOptions.find(c => c.type === currentCheer.reaction_type)?.emoji}</span>
            Cheered
          </Button>
        ) : (
          <Button 
            variant="outline"
            size={compact ? 'sm' : 'default'}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Cheer
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="grid grid-cols-4 gap-2">
          {cheerOptions.map((option) => (
            <motion.button
              key={option.type}
              onClick={() => cheerMutation.mutate(option.type)}
              disabled={cheerMutation.isPending}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-purple-100 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{option.emoji}</span>
              <span className="text-xs text-gray-700">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}