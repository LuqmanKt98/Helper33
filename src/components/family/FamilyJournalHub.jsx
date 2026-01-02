import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function FamilyJournalHub() {
  const queryClient = useQueryClient();
  const [entryContent, setEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['familyMoodEntries'],
    queryFn: () => base44.entities.FamilyMoodEntry.list('-created_date', 20)
  });

  const createMoodEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMoodEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMoodEntries']);
      setEntryContent('');
      setSelectedMood('');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      toast.success('Journal entry shared with family! 💜');
    }
  });

  const moods = [
    { value: 'great', emoji: '😊', label: 'Great', color: 'from-green-400 to-emerald-500' },
    { value: 'good', emoji: '🙂', label: 'Good', color: 'from-blue-400 to-cyan-500' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-amber-500' },
    { value: 'struggling', emoji: '😔', label: 'Struggling', color: 'from-orange-400 to-red-500' },
    { value: 'excited', emoji: '🤩', label: 'Excited', color: 'from-purple-400 to-pink-500' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful', color: 'from-amber-400 to-yellow-500' }
  ];

  const handleSubmit = () => {
    if (!selectedMood) {
      toast.error('Please select how you\'re feeling');
      return;
    }

    const memberData = familyMembers.find(m => m.user_id === user?.id);

    createMoodEntryMutation.mutate({
      member_id: memberData?.id || user?.id,
      member_name: memberData?.name || user?.full_name || 'Family Member',
      entry_date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      mood_emoji: moods.find(m => m.value === selectedMood)?.emoji,
      mood_rating: moods.findIndex(m => m.value === selectedMood) + 1,
      note: entryContent || undefined,
      visible_to_family: true,
      privacy_level: 'everyone'
    });
  };

  return (
    <div className="space-y-6">
      {/* Create Entry Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-300 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selector */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Choose your mood:</p>
              <div className="grid grid-cols-3 gap-3">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMood === mood.value
                        ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <p className="text-sm font-semibold">{mood.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Share more (optional):</p>
              <Textarea
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="What's on your mind? Your family can see this..."
                className="min-h-24 border-2 border-purple-200 focus:border-purple-400"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || createMoodEntryMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              Share with Family
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Family Mood Feed */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Family Mood Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {moodEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{entry.mood_emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900">{entry.member_name}</p>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {entry.mood}
                          </Badge>
                        </div>
                        {entry.note && (
                          <p className="text-gray-700 mb-2">{entry.note}</p>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </p>

                        {/* Support Reactions */}
                        {entry.support_given && entry.support_given.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                            {entry.support_given.map((support, idx) => (
                              <Badge key={idx} className="bg-pink-100 text-pink-800 text-xs">
                                {support.reaction} from {support.from_member_name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {moodEntries.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No family journal entries yet</p>
              <p className="text-sm text-gray-400">Be the first to share!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}