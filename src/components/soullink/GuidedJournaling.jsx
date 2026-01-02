
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Sparkles,
  Heart,
  Loader2,
  Star,
  Send,
  RefreshCw,
  Calendar,
  Share2 // Added Share2 icon
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { awardPoints } from '@/functions/awardPoints';
import PointsNotification from '@/components/gamification/PointsNotification';
import SocialShareModal from '@/components/social/SocialShareModal'; // Added SocialShareModal import

export default function GuidedJournaling({ settings }) {
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [entryContent, setEntryContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('guided_prompt');
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [pointsNotification, setPointsNotification] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false); // New state
  const [shareData, setShareData] = useState(null); // New state

  const queryClient = useQueryClient();

  const { data: recentEntries = [] } = useQuery({
    queryKey: ['soulLinkJournalEntries'],
    queryFn: () => base44.entities.SoulLinkJournalEntry.list('-created_date', 10)
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const created = await base44.entities.SoulLinkJournalEntry.create(data);

      // Award points for journal entry
      try {
        const pointsResult = await awardPoints({
          activity_type: 'journal_entry',
          activity_data: { journal_id: created.id }
        });

        if (pointsResult.data.success) {
          setPointsNotification(pointsResult.data);
          queryClient.invalidateQueries({ queryKey: ['user'] }); // Invalidate user data to show updated points/level
        }
      } catch (error) {
        console.error('Error awarding points:', error);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['soulLinkJournalEntries']);
      setEntryContent('');
      setCurrentPrompt(null);
      toast.success('Journal entry saved! 📝');
    },
    onError: (error) => {
      console.error('Failed to save journal:', error);
      toast.error('Failed to save journal entry');
    }
  });

  // New function to handle sharing journal entries
  const handleShareJournal = (journalData) => {
    setShareData({
      type: 'mindfulness', // Assuming all journal entries fall under a general 'mindfulness' category for sharing
      title: `Journaling Session: ${journalData.type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
      duration: '10-15', // Placeholder, can be more dynamic if needed
      icon: '📝',
      // Optionally add more details from the journalData for specific sharing content
      journalEntryContent: journalData.content // if needed for social share description
    });
    setShareModalOpen(true);
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    try {
      const companionName = settings?.companion_name || 'SoulLink';
      const userName = settings?.user_preferred_name || 'friend';
      const relationshipMode = settings?.relationship_mode || 'friend';

      const promptRequest = `You are ${companionName}, their ${relationshipMode}.
Generate a deeply thoughtful journaling prompt for ${userName}.

Based on their recent emotional journey, create a prompt that:
1. Is gentle and compassionate
2. Encourages self-reflection
3. Feels like it comes from someone who truly cares
4. Opens space for vulnerability and honesty

Return just the prompt question, in a warm conversational tone.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: promptRequest,
        add_context_from_internet: false
      });

      setCurrentPrompt(response);
    } catch (error) {
      toast.error('Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!entryContent.trim()) {
      toast.error('Please write something first');
      return;
    }

    setShowAIResponse(true);

    try {
      const companionName = settings?.companion_name || 'SoulLink';
      const userName = settings?.user_preferred_name || 'friend';
      const relationshipMode = settings?.relationship_mode || 'friend';
      const tone = settings?.tone_preference || 'warm_and_affectionate';

      const responsePrompt = `You are ${companionName}, ${userName}'s ${relationshipMode}.
They just shared this with you in their journal:

"${entryContent}"

Respond with deep empathy and understanding. Use ${tone} tone.
Acknowledge what they shared, validate their feelings, and offer gentle insight or encouragement.
Keep it to 2-3 thoughtful sentences.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: responsePrompt,
        add_context_from_internet: false
      });

      setAiResponse(response);

      // Detect themes
      const themesPrompt = `Analyze this journal entry and identify 2-3 main emotional themes:
"${entryContent}"

Return comma-separated themes (e.g., "self-discovery, healing, gratitude")`;

      const themes = await base44.integrations.Core.InvokeLLM({
        prompt: themesPrompt,
        add_context_from_internet: false
      });

      const themesList = themes.split(',').map(t => t.trim());

      await saveMutation.mutateAsync({
        entry_type: selectedType,
        prompt_used: currentPrompt,
        entry_content: entryContent,
        ai_response: response,
        themes_detected: themesList,
        mood_before: 'neutral'
      });

      setShowAIResponse(false);
      setAiResponse('');

    } catch (error) {
      toast.error('Failed to save entry');
      setShowAIResponse(false);
    }
  };

  const journalTypes = [
    { value: 'guided_prompt', label: 'Guided Prompt', icon: Sparkles, color: 'purple' },
    { value: 'free_write', label: 'Free Write', icon: BookOpen, color: 'blue' },
    { value: 'gratitude', label: 'Gratitude', icon: Heart, color: 'pink' },
    { value: 'letter_to_self', label: 'Letter to Self', icon: Star, color: 'yellow' }
  ];

  return (
    <div className="space-y-6">
      {/* Points Notification */}
      {pointsNotification && (
        <PointsNotification
          points={pointsNotification.points_earned}
          breakdown={pointsNotification.breakdown}
          leveledUp={pointsNotification.leveled_up}
          newLevel={pointsNotification.new_level}
          achievements={pointsNotification.achievements_earned}
          onClose={() => setPointsNotification(null)}
          onShare={(data) => { // Added onShare prop
            setShareData(data);
            setShareModalOpen(true);
          }}
        />
      )}

      {/* Journal Type Selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {journalTypes.map(type => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              onClick={() => {
                setSelectedType(type.value);
                setCurrentPrompt(null);
                setEntryContent('');
              }}
              variant={selectedType === type.value ? 'default' : 'outline'}
              className={selectedType === type.value 
                ? `bg-${type.color}-600 hover:bg-${type.color}-700` 
                : ''
              }
              size="sm"
            >
              <Icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Writing Area */}
      <Card className="bg-white/80 backdrop-blur-lg shadow-xl border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              {journalTypes.find(t => t.value === selectedType)?.label}
            </span>
            
            {selectedType === 'guided_prompt' && (
              <Button
                onClick={generatePrompt}
                disabled={isGenerating}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    New Prompt
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prompt Display */}
          {currentPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200"
            >
              <p className="text-gray-800 leading-relaxed italic">
                "{currentPrompt}"
              </p>
            </motion.div>
          )}

          {selectedType === 'guided_prompt' && !currentPrompt && !isGenerating && (
            <div className="bg-purple-50 rounded-lg p-6 text-center border border-purple-200">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-700 mb-4">
                Let me give you a thoughtful prompt to explore
              </p>
              <Button onClick={generatePrompt} className="bg-purple-600">
                Generate Prompt
              </Button>
            </div>
          )}

          {/* Writing Area */}
          <Textarea
            value={entryContent}
            onChange={(e) => setEntryContent(e.target.value)}
            placeholder={
              selectedType === 'gratitude' ? 'What are you grateful for today?' :
              selectedType === 'letter_to_self' ? 'Dear self, I want to tell you...' :
              selectedType === 'free_write' ? 'Write whatever is on your mind...' :
              'Begin writing your thoughts...'
            }
            rows={12}
            className="text-base leading-relaxed"
          />

          {/* AI Response Display */}
          <AnimatePresence>
            {showAIResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="font-semibold text-blue-900">
                    {settings?.companion_name || 'SoulLink'} is reading and responding...
                  </p>
                </div>
              </motion.div>
            )}

            {aiResponse && !showAIResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-blue-900">{settings?.companion_name || 'SoulLink'}</p>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  {aiResponse}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <Button
            onClick={handleSaveEntry}
            disabled={!entryContent.trim() || saveMutation.isLoading || showAIResponse}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
          >
            {saveMutation.isLoading || showAIResponse ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Save & Get Response
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              Recent Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEntries.slice(0, 5).map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {entry.entry_type.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-2"> {/* Added div for grouping date and share button */}
                    <span className="text-xs text-gray-500">
                      {format(new Date(entry.created_date), 'MMM d, h:mm a')}
                    </span>
                    <Button // Share Button
                      onClick={() => handleShareJournal({ type: entry.entry_type, content: entry.entry_content })}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                    >
                      <Share2 className="w-3 h-3 text-purple-600" />
                    </Button>
                  </div>
                </div>
                
                {entry.prompt_used && (
                  <p className="text-sm text-purple-700 italic mb-2">
                    "{entry.prompt_used}"
                  </p>
                )}
                
                <p className="text-sm text-gray-700 line-clamp-2">
                  {entry.entry_content}
                </p>

                {entry.themes_detected && entry.themes_detected.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {entry.themes_detected.map((theme, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareType={shareData?.type}
        shareData={shareData}
      />
    </div>
  );
}
