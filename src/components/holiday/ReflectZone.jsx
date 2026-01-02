import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Heart, Sparkles, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { updateConstellationProgress, shareToSocialMedia } from './ConstellationHelper';

export default function ReflectZone({ onBack }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const christmasPrompts = [
    { id: 'warm_heart', question: 'What moment this year still warms your heart?', guidance: 'Think of a specific memory that brings you comfort.', emoji: '❤️' },
    { id: 'thank_someone', question: 'Who do you wish you could thank right now?', guidance: 'What would you want them to know?', emoji: '🙏' },
    { id: 'forgive_self', question: 'What can you forgive yourself for?', guidance: 'What are you ready to release?', emoji: '🕊️' },
    { id: 'unexpected_blessing', question: 'What unexpected blessing came from difficulty?', guidance: 'What did you discover?', emoji: '🌟' },
    { id: 'grateful_body', question: 'What is your body grateful for today?', guidance: 'What has your body done for you?', emoji: '🌸' },
    { id: 'future_hope', question: 'What are you hopeful about for next year?', guidance: 'Even the smallest hope counts.', emoji: '🌅' },
    { id: 'lesson_learned', question: 'What did hardship teach you this year?', guidance: 'What have you learned about yourself?', emoji: '📚' },
    { id: 'present_moment', question: 'What are you grateful for right now?', guidance: 'In this breath, what is here for you?', emoji: '🧘' },
  ];

  const handleSave = async () => {
    if (!journalEntry.trim()) {
      toast.error('Please write your reflection');
      return;
    }
    if (!user) {
      toast.error('Please log in to save journal entries');
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.UserJournalEntry.create({
        journal_type: 'gratitude',
        entry_title: selectedPrompt.question,
        entry_content: journalEntry,
        mood: currentMood,
        tags: ['christmas', 'heartful_holidays'],
      });

      const result = await updateConstellationProgress(user, {
        activity_date: new Date().toISOString().split('T')[0],
        zone: 'reflect',
        activity_type: 'journal_entry',
        activity_title: selectedPrompt.question,
        activity_content: journalEntry,
        points_earned: 30,
      });

      queryClient.invalidateQueries();
      
      const successMsg = result.isComplete 
        ? '🎉 CONSTELLATION COMPLETE! 📝 Journal saved! All 10 stars lit! You earned the Heartful Holidays badge! 🏆'
        : `📝 Journal saved! Star #${result.starsLit} lit! +${result.pointsEarned} points! ${10 - result.starsLit} more to go!`;
      
      toast.success(successMsg, { duration: 5000 });
      
      // Share achievement
      setTimeout(() => {
        if (confirm('🎉 Share your reflection milestone on social media?')) {
          const shareURLs = shareToSocialMedia('reflect', selectedPrompt.question, result.starsLit, result.isComplete);
          const platform = prompt('Choose:\n1. Facebook\n2. Twitter\n3. LinkedIn\n4. Instagram\n5. TikTok\n(Enter 1-5)');
          const platformMap = { '1': 'facebook', '2': 'twitter', '3': 'linkedin', '4': 'instagram', '5': 'tiktok' };
          const selected = platformMap[platform];
          if (selected && shareURLs[selected]) {
            window.open(shareURLs[selected], '_blank', 'width=600,height=400');
            toast.success('Thanks for sharing! 💫');
          } else if (platform === '5') {
            toast.info("Opening TikTok - you can create your own video about your reflection journey!");
          } else if (platform === '4') { // Instagram specific handling
             toast.info("For Instagram, you'll need to manually post. Consider saving an image!");
          } else {
             toast.info("No social media platform selected or recognized.");
          }
        }
      }, 1500);
      
      setJournalEntry('');
      setSelectedPrompt(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const moods = [
    { value: 'peaceful', emoji: '😌' },
    { value: 'grateful', emoji: '🙏' },
    { value: 'hopeful', emoji: '🌟' },
    { value: 'sad', emoji: '😢' },
    { value: 'overwhelmed', emoji: '😵' },
    { value: 'calm', emoji: '☮️' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="bg-white/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2">
          <BookOpen className="w-4 h-4 mr-2" />
          Reflect Zone
        </Badge>
      </div>

      {!selectedPrompt ? (
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold mb-2">Christmas Reflections</h3>
                <p className="text-purple-100 text-lg">Guided questions to help you find meaning</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {christmasPrompts.map((prompt, i) => (
              <motion.div key={prompt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -5 }}>
                <Card className="h-full bg-white/90 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="text-4xl mb-2">{prompt.emoji}</div>
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">{prompt.question}</CardTitle>
                    <CardDescription>{prompt.guidance}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setSelectedPrompt(prompt)} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Reflect on This
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={() => { setSelectedPrompt(null); setJournalEntry(''); setCurrentMood(''); }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Different Prompt
                </Button>
                <span className="text-3xl">{selectedPrompt.emoji}</span>
              </div>
              <CardTitle className="text-2xl text-purple-900">{selectedPrompt.question}</CardTitle>
              <CardDescription>{selectedPrompt.guidance}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                <div className="flex gap-2 flex-wrap">
                  {moods.map(mood => (
                    <button key={mood.value} onClick={() => setCurrentMood(mood.value)} className={`px-4 py-2 rounded-full border-2 transition-all ${currentMood === mood.value ? 'border-purple-500 bg-purple-50 scale-110' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <span className="text-xl">{mood.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Textarea value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} placeholder="Write freely... this is your space." className="h-64 bg-white text-base" />

              <Button onClick={handleSave} disabled={isSaving || !journalEntry.trim()} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save & Light a Star</>}
              </Button>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900">
                  <Heart className="w-4 h-4 inline text-purple-600 mr-2" />
                  Your reflections are private and safe.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}