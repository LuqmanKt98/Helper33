import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Smile, 
  Heart, 
  ThumbsUp,
  Star,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, isToday, startOfWeek, endOfWeek } from 'date-fns';

const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'from-green-400 to-emerald-500' },
  { value: 'good', label: 'Good', emoji: '😊', color: 'from-blue-400 to-cyan-500' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'from-yellow-400 to-amber-500' },
  { value: 'struggling', label: 'Struggling', emoji: '😔', color: 'from-orange-400 to-red-500' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'from-blue-500 to-indigo-600' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'from-purple-400 to-pink-500' },
  { value: 'angry', label: 'Angry', emoji: '😠', color: 'from-red-500 to-rose-600' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'from-yellow-500 to-orange-500' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'from-gray-400 to-slate-500' },
  { value: 'stressed', label: 'Stressed', emoji: '😣', color: 'from-red-400 to-orange-500' }
];

const REACTION_OPTIONS = [
  { type: 'heart', icon: Heart, color: 'text-red-500' },
  { type: 'hug', icon: Users, color: 'text-purple-500' },
  { type: 'thumbs_up', icon: ThumbsUp, color: 'text-blue-500' },
  { type: 'star', icon: Star, color: 'text-yellow-500' }
];

export default function FamilyMoodTracker({ familyMembers }) {
  const queryClient = useQueryClient();
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedMemberForLog, setSelectedMemberForLog] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['familyMoodEntries'],
    queryFn: () => base44.entities.FamilyMoodEntry.list('-created_date')
  });

  const createMoodMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMoodEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMoodEntries']);
      setShowLogModal(false);
      toast.success('Mood logged! 💚');
    }
  });

  const updateMoodMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyMoodEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMoodEntries']);
      toast.success('Support sent! 💜');
    }
  });

  // Get today's mood entries
  const todayEntries = moodEntries.filter(entry => 
    isToday(new Date(entry.entry_date))
  );

  // Get this week's entries
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.entry_date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  const handleLogMood = (member) => {
    setSelectedMemberForLog(member);
    setShowLogModal(true);
  };

  const handleSendSupport = (entry, reactionType) => {
    const currentMember = familyMembers?.find(m => m.user_id === user?.id);
    const newSupport = {
      from_member_id: currentMember?.id,
      from_member_name: currentMember?.name || user?.full_name,
      reaction: reactionType,
      timestamp: new Date().toISOString()
    };

    updateMoodMutation.mutate({
      id: entry.id,
      data: {
        support_given: [...(entry.support_given || []), newSupport]
      }
    });
  };

  const getMoodConfig = (moodValue) => {
    return MOOD_OPTIONS.find(m => m.value === moodValue) || MOOD_OPTIONS[2];
  };

  // Calculate family wellness score
  const avgMoodScore = todayEntries.length > 0
    ? (todayEntries.reduce((sum, e) => sum + (e.mood_rating || 5), 0) / todayEntries.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Family Wellness</p>
                <p className="text-3xl font-bold text-purple-800">{avgMoodScore}/10</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Check-ins Today</p>
                <p className="text-3xl font-bold text-blue-800">{todayEntries.length}/{familyMembers?.length || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">This Week</p>
                <p className="text-3xl font-bold text-green-800">{thisWeekEntries.length}</p>
              </div>
              <Users className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Log for All Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-6 h-6 text-purple-600" />
            Log Family Moods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {familyMembers?.map(member => {
              const todayMood = todayEntries.find(e => e.member_id === member.id);
              const moodConfig = todayMood ? getMoodConfig(todayMood.mood) : null;

              return (
                <motion.div
                  key={member.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center gap-1 relative"
                    onClick={() => handleLogMood(member)}
                  >
                    {todayMood && (
                      <div className="absolute top-2 right-2">
                        <span className="text-2xl">{moodConfig.emoji}</span>
                      </div>
                    )}
                    <span className="text-lg">{member.emoji || '👤'}</span>
                    <span className="text-sm font-medium">{member.name}</span>
                    {todayMood && (
                      <Badge className={`bg-gradient-to-r ${moodConfig.color} text-white text-xs`}>
                        {todayMood.mood_rating}/10
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Mood Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {todayEntries.map((entry, idx) => {
                const moodConfig = getMoodConfig(entry.mood);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${moodConfig.color} rounded-full flex items-center justify-center text-3xl flex-shrink-0`}>
                            {moodConfig.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{entry.member_name}</span>
                              <Badge className={`bg-gradient-to-r ${moodConfig.color} text-white`}>
                                {entry.mood_rating}/10
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {format(new Date(entry.created_date), 'h:mm a')}
                              </span>
                            </div>
                            {entry.note && (
                              <p className="text-sm text-gray-600 mb-2">{entry.note}</p>
                            )}
                            
                            {/* Support Reactions */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {REACTION_OPTIONS.map(({ type, icon: Icon, color }) => {
                                const count = entry.support_given?.filter(s => s.reaction === type).length || 0;
                                const hasReacted = entry.support_given?.some(
                                  s => s.from_member_id === familyMembers?.find(m => m.user_id === user?.id)?.id && s.reaction === type
                                );

                                return (
                                  <Button
                                    key={type}
                                    variant={hasReacted ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => !hasReacted && handleSendSupport(entry, type)}
                                    disabled={hasReacted}
                                    className={`h-8 ${hasReacted ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
                                  >
                                    <Icon className={`w-3 h-3 ${hasReacted ? 'text-white' : color}`} />
                                    {count > 0 && <span className="ml-1 text-xs">{count}</span>}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {todayEntries.length === 0 && (
              <div className="text-center py-12">
                <Smile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No mood check-ins today yet</p>
                <p className="text-sm text-gray-400 mt-1">Click a family member above to log their mood</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Mood Modal */}
      <LogMoodModal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setSelectedMemberForLog(null);
        }}
        member={selectedMemberForLog}
        onSubmit={(data) => createMoodMutation.mutate(data)}
        isLoading={createMoodMutation.isPending}
      />
    </div>
  );
}

// Log Mood Modal
function LogMoodModal({ isOpen, onClose, member, onSubmit, isLoading }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodRating, setMoodRating] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    const moodConfig = MOOD_OPTIONS.find(m => m.value === selectedMood);
    
    onSubmit({
      member_id: member?.id,
      member_name: member?.name,
      entry_date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      mood_emoji: moodConfig.emoji,
      mood_rating: moodRating,
      energy_level: energyLevel,
      note: note.trim() || undefined,
      visible_to_family: true
    });

    // Reset form
    setSelectedMood(null);
    setMoodRating(5);
    setEnergyLevel(5);
    setNote('');
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{member.emoji || '👤'}</span>
            How is {member.name} feeling today?
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Select Mood</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOOD_OPTIONS.map(mood => (
                <motion.button
                  key={mood.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMood === mood.value
                      ? `bg-gradient-to-br ${mood.color} text-white border-transparent shadow-lg`
                      : 'bg-white border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium">{mood.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mood Rating Slider */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Mood Rating: {moodRating}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodRating}
              onChange={(e) => setMoodRating(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Energy Level Slider */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Energy Level: {energyLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Drained</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Note (Optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any thoughts or context about this mood?"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedMood}>
              {isLoading ? 'Saving...' : 'Log Mood'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}