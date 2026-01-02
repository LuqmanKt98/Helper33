import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Share2,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShareProgressModal({ onClose, onSuccess }) {
  const [content, setContent] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('personal_growth');
  const [progressType, setProgressType] = useState('small_win');
  const [moodEmoji, setMoodEmoji] = useState('😊');
  const [daysIntoJourney, setDaysIntoJourney] = useState('');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const name = displayName.trim() || 
        user?.app_settings?.anonymous_display_name ||
        `WellnessWarrior${Math.floor(Math.random() * 1000)}`;

      await base44.entities.SharedProgress.create({
        goal_category: selectedCategory,
        progress_type: progressType,
        content,
        display_name: name,
        is_anonymous: true,
        mood_emoji: moodEmoji,
        days_into_journey: daysIntoJourney ? parseInt(daysIntoJourney) : null,
        support_reactions: { hearts: 0, hugs: 0, strength: 0, relate: 0 }
      });

      // Save display name for future use
      if (displayName.trim()) {
        await base44.auth.updateMe({
          app_settings: {
            ...(user?.app_settings || {}),
            anonymous_display_name: displayName.trim()
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sharedProgress']);
      toast.success('Progress shared! 🌟');
      onSuccess();
    }
  });

  const categories = [
    { value: 'grief_processing', label: 'Grief Support', emoji: '💜' },
    { value: 'personal_growth', label: 'Personal Growth', emoji: '🌱' },
    { value: 'emotional_healing', label: 'Healing', emoji: '🌸' },
    { value: 'habit_building', label: 'Habits', emoji: '⚡' },
    { value: 'self_care', label: 'Self-Care', emoji: '🧘' },
    { value: 'relationships', label: 'Relationships', emoji: '💕' }
  ];

  const progressTypes = [
    { value: 'milestone', label: 'Milestone', emoji: '🎯' },
    { value: 'breakthrough', label: 'Breakthrough', emoji: '⚡' },
    { value: 'small_win', label: 'Small Win', emoji: '🌟' },
    { value: 'struggle_overcome', label: 'Overcame Challenge', emoji: '💪' },
    { value: 'lesson_learned', label: 'Lesson Learned', emoji: '💡' }
  ];

  const moodEmojis = ['😊', '😌', '🥰', '💪', '🌟', '✨', '💜', '🌸', '🦋', '🌈'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-6 h-6" />
                Share Your Progress
              </CardTitle>
              <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Display Name */}
            <div>
              <Label className="font-semibold mb-2 block">Display Name (Optional)</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.app_settings?.anonymous_display_name || 'Choose a name or leave blank'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your identity will remain anonymous
              </p>
            </div>

            {/* Category */}
            <div>
              <Label className="font-semibold mb-2 block">Category</Label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${
                      selectedCategory === cat.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="block text-2xl mb-1">{cat.emoji}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Type */}
            <div>
              <Label className="font-semibold mb-2 block">Progress Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {progressTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setProgressType(type.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      progressType === type.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="mr-2">{type.emoji}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <Label className="font-semibold mb-2 block">How are you feeling?</Label>
              <div className="flex gap-2 flex-wrap">
                {moodEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setMoodEmoji(emoji)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      moodEmoji === emoji
                        ? 'bg-purple-100 ring-2 ring-purple-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Days Into Journey */}
            <div>
              <Label className="font-semibold mb-2 block">Days Into Your Journey (Optional)</Label>
              <Input
                type="number"
                value={daysIntoJourney}
                onChange={(e) => setDaysIntoJourney(e.target.value)}
                placeholder="e.g., 30"
                min="1"
              />
            </div>

            {/* Content */}
            <div>
              <Label className="font-semibold mb-2 block">Share Your Story</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What progress have you made? What breakthrough did you have? What did you learn?"
                rows={6}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => shareMutation.mutate()}
                disabled={!content.trim() || shareMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
              >
                {shareMutation.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Share with Community
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}