import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Send, Heart, TreePine, Flame, Mail, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { sendVirtualHug } from '@/functions/sendVirtualHug';
import { updateConstellationProgress } from './ConstellationHelper';

export default function ConnectZone({ onBack }) {
  const [activeTab, setActiveTab] = useState('kindness'); // Changed default to 'kindness'
  const [gratitudeRecipient, setGratitudeRecipient] = useState('loved_one');
  const [gratitudeNote, setGratitudeNote] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryType, setMemoryType] = useState('person');
  const [kindnessDescription, setKindnessDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: gratitudeNotes = [] } = useQuery({
    queryKey: ['gratitudeNotes'],
    queryFn: () => base44.entities.GratitudeNote.list('-created_date', 50),
  });

  const { data: memoryTable = [] } = useQuery({
    queryKey: ['memoryTable'],
    queryFn: () => base44.entities.MemoryTableEntry.list('-created_date', 50),
  });

  const { data: kindnessTree = [], isLoading: treeLoading, refetch: refetchKindnessTree } = useQuery({
    queryKey: ['kindnessTree'],
    queryFn: async () => {
      console.log('🌳 Fetching kindness tree...');
      const acts = await base44.entities.KindnessAct.list('-created_date', 100);
      const publicActs = acts.filter(act => act.share_publicly === true);
      console.log('🌳 Total acts:', acts.length, 'Public acts:', publicActs.length, publicActs);
      return publicActs;
    },
    refetchInterval: 3000, // Auto-refetch every 3 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // updateConstellation function is removed as it's replaced by updateConstellationProgress

  const handleSocialShare = async (platform, activityType) => {
    const shareMessages = {
      gratitude: `I just sent a gratitude note through Heartful Holidays! 💌 Spreading Christmas kindness. The holidays can be lonely - you're not alone in this moment. Join me!`,
      memory: `I honored a special memory at the Memory Table 🕯️ Grateful for the moments that shape us. You are not alone this holiday season.`,
      kindness: `Added to the Kindness Tree! 🍂 Small acts of kindness create ripples of hope. Join the Heartful Holidays journey!`,
      challenge: `I completed a Heartful Holidays challenge! 🎄✨ Lighting up my constellation one wellness activity at a time. You're not alone - join us!`,
    };

    const text = shareMessages[activityType] || `I'm participating in Heartful Holidays! 🎄✨ Finding calm, connection, and giving back. You are not alone. 🌟`;
    const url = 'https://www.helper33.com/HeartfulHolidays';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=HeartfulHolidays,YouAreNotAlone,MentalHealthMatters`,
      instagram: `https://www.instagram.com/`, // Instagram usually requires sharing through their app directly
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      tiktok: `https://www.tiktok.com/upload`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform}! Thanks for spreading kindness! 💫`);
    }
  };

  const handleSendVirtualHug = async (note, hugType, supportMessage) => {
    try {
      // Update hearts count
      await base44.entities.GratitudeNote.update(note.id, {
        hearts_received: (note.hearts_received || 0) + 1,
      });

      // Send email if note has recipient email
      if (note.recipient_email) { // Changed condition here based on outline
        const response = await sendVirtualHug({
          recipientEmail: note.recipient_email,
          recipientName: note.recipient_name || 'Someone Special',
          senderName: user?.preferred_name || user?.full_name || 'A caring friend',
          hugType: hugType,
          noteContent: supportMessage || note.note_content,
        });

        if (response.data.success) {
          toast.success(`${response.data.message} Email sent! 💌`);
        }
      } else {
        const hugEmojis = {
          heart: '❤️',
          see_you: '👁️',
          feel_you: '🫂',
          not_alone: '🌟',
          lonely_too: '💛',
        };
        toast.success(`${hugEmojis[hugType]} Virtual hug sent!`);
      }

      queryClient.invalidateQueries({ queryKey: ['gratitudeNotes'] });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send hug');
    }
  };

  const handleSendGratitude = async () => {
    if (!gratitudeNote.trim()) {
      toast.error('Please write your gratitude note');
      return;
    }
    if (!user) {
      toast.error('Please log in to send gratitude notes');
      return;
    }

    setIsSending(true);
    try {
      await base44.entities.GratitudeNote.create({
        sender_name: isAnonymous ? 'A Grateful Soul' : (user?.preferred_name || user?.full_name),
        sender_avatar: isAnonymous ? null : user?.avatar_url,
        recipient_type: gratitudeRecipient,
        recipient_name: recipientName || 'Someone Special',
        recipient_email: recipientEmail || null,
        note_content: gratitudeNote,
        is_anonymous: isAnonymous,
        is_public: gratitudeRecipient === 'stranger' || gratitudeRecipient === 'community',
      });

      const result = await updateConstellationProgress(user, {
        activity_date: new Date().toISOString().split('T')[0],
        zone: 'connect',
        activity_type: 'gratitude_note_sent',
        activity_title: `Gratitude to ${recipientName || 'someone special'}`,
        activity_content: gratitudeNote,
        points_earned: 15,
      });

      queryClient.invalidateQueries();
      
      const successMsg = result.isComplete 
        ? '🎉 CONSTELLATION COMPLETE! 💌 Gratitude sent! All 10 stars lit! 🏆'
        : `💌 Gratitude sent! Star #${result.starsLit} lit! +${result.pointsEarned} points!`;
      
      toast.success(successMsg, { duration: 5000 });
      setGratitudeNote('');
      setRecipientName('');
      setRecipientEmail('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleShareMemory = async () => {
    if (!memoryTitle.trim() || !memoryContent.trim()) {
      toast.error('Please add a title and memory');
      return;
    }
    if (!user) {
      toast.error('Please log in to share memories');
      return;
    }

    setIsSending(true);
    try {
      await base44.entities.MemoryTableEntry.create({
        memory_type: memoryType,
        title: memoryTitle,
        content: memoryContent,
        author_display_name: isAnonymous ? 'Anonymous' : (user?.preferred_name || user?.full_name),
        author_avatar: isAnonymous ? null : user?.avatar_url,
        is_anonymous: isAnonymous,
        candle_lit: true,
        candle_color: 'amber',
      });

      const result = await updateConstellationProgress(user, {
        activity_date: new Date().toISOString().split('T')[0],
        zone: 'connect',
        activity_type: 'memory_shared',
        activity_title: memoryTitle,
        activity_content: memoryContent,
        points_earned: 20,
      });

      queryClient.invalidateQueries();
      
      const successMsg = result.isComplete 
        ? '🎉 CONSTELLATION COMPLETE! 🕯️ Memory shared! All 10 stars lit! 🏆'
        : `🕯️ Memory shared! Star #${result.starsLit} lit! +${result.pointsEarned} points!`;
      
      toast.success(successMsg, { duration: 5000 });
      setMemoryTitle('');
      setMemoryContent('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to share. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogKindness = async () => {
    if (!kindnessDescription.trim()) {
      toast.error('Please describe your act of kindness');
      return;
    }
    
    if (!user) {
      toast.error('Please create an account to save your kindness and grow the tree! 🌳', { duration: 5000 });
      setTimeout(() => {
        base44.auth.redirectToLogin();
      }, 2000);
      return;
    }

    setIsSending(true);
    try {
      console.log('🍂 Creating kindness act...');
      
      const randomColor = ['amber', 'orange', 'red', 'gold', 'green'][Math.floor(Math.random() * 5)];
      
      const newAct = await base44.entities.KindnessAct.create({
        act_type: 'other',
        description: kindnessDescription,
        share_publicly: true,
        is_anonymous: isAnonymous,
        leaf_color: randomColor,
        community_reactions: 0,
      });

      console.log('✅ Kindness act created:', newAct);

      const result = await updateConstellationProgress(user, {
        activity_date: new Date().toISOString().split('T')[0],
        zone: 'connect',
        activity_type: 'kindness_logged',
        activity_title: 'Kindness Tree',
        activity_content: kindnessDescription,
        points_earned: 25,
      });

      console.log('⭐ Constellation updated:', result);

      const updatedTree = await refetchKindnessTree();
      console.log('🌳 Tree refetched:', updatedTree.data?.length, 'leaves');
      
      queryClient.invalidateQueries({ queryKey: ['kindnessTree'] });
      queryClient.invalidateQueries({ queryKey: ['holidayActivities'] });
      queryClient.invalidateQueries({ queryKey: ['constellationProgress'] });
      queryClient.invalidateQueries({ queryKey: ['myConstellationProgress'] });
      
      const treeCount = (kindnessTree.length || 0) + 1;
      const successMsg = result.isComplete 
        ? `🎉 CONSTELLATION COMPLETE! 🍂 ${randomColor} leaf added! All 10 stars lit! Tree has ${treeCount} leaves! 🏆`
        : `🍂 Beautiful ${randomColor} leaf added to the tree! Star #${result.starsLit} lit! +${result.pointsEarned} points! Tree now has ${treeCount} leaves! 🌳`;
      
      toast.success(successMsg, { duration: 7000 });
      setKindnessDescription('');
      setActiveTab('kindness');
      
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);
      
    } catch (error) {
      console.error('❌ Error logging kindness:', error);
      toast.error('Failed to add to tree. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="bg-white/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2">
          <Users className="w-4 h-4 mr-2" />
          Connect Zone
        </Badge>
      </div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">Create an account to save your progress!</p>
                  <p className="text-white/90 text-sm">Your stars, leaves, and wellness journey will be saved. Continue exploring or sign up now! ✨</p>
                </div>
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-white text-orange-600 hover:bg-orange-50 flex-shrink-0"
                >
                  Sign Up Free
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 p-1">
          <TabsTrigger value="gratitude"><Mail className="w-4 h-4 mr-2" />Gratitude</TabsTrigger>
          <TabsTrigger value="memory"><Flame className="w-4 h-4 mr-2" />Memory</TabsTrigger>
          <TabsTrigger value="kindness"><TreePine className="w-4 h-4 mr-2" />Kindness</TabsTrigger>
        </TabsList>

        <TabsContent value="gratitude" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-rose-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="w-6 h-6 text-rose-600" />Send Gratitude</CardTitle>
              <CardDescription>Express appreciation to loved ones, strangers, or yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Send to:</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'loved_one', label: 'Loved One', icon: '❤️' },
                    { value: 'stranger', label: 'Stranger', icon: '🌟' },
                    { value: 'community', label: 'Community', icon: '🌍' },
                    { value: 'self', label: 'Myself', icon: '🪞' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setGratitudeRecipient(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${gratitudeRecipient === option.value ? 'border-rose-500 bg-rose-50 shadow-lg' : 'border-gray-200 bg-white'}`}
                    >
                      <span className="text-2xl block mb-1">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {gratitudeRecipient === 'loved_one' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Their name" className="bg-white" />
                  <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Email (optional - for direct delivery)" className="bg-white" />
                </div>
              )}

              <Textarea value={gratitudeNote} onChange={(e) => setGratitudeNote(e.target.value)} placeholder="Your heartfelt message..." className="h-32 bg-white" />

              <div className="flex items-center gap-2">
                <input type="checkbox" id="anon-grat" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded" />
                <label htmlFor="anon-grat" className="text-sm">Send anonymously</label>
              </div>

              <Button onClick={handleSendGratitude} disabled={isSending} className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                {isSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send Gratitude</>}
              </Button>

              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-gray-600 w-full mb-1">Share your kindness:</span>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('facebook', 'gratitude')} className="flex-1">📘 Facebook</Button>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('twitter', 'gratitude')} className="flex-1">🐦 Twitter</Button>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('instagram', 'gratitude')} className="flex-1">📷 Instagram</Button>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('tiktok', 'gratitude')} className="flex-1">🎵 TikTok</Button>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('linkedin', 'gratitude')} className="flex-1">💼 LinkedIn</Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Community Gratitude Wall 💗</h3>
            <p className="text-sm text-gray-600 mb-4">Send virtual hugs and supportive messages to others in our community</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gratitudeNotes.filter(n => n.is_public).slice(0, 12).map((note, i) => (
                <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-white/90 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-rose-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {note.sender_avatar ? <img src={note.sender_avatar} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>}
                        <span className="text-sm font-medium">{note.sender_name}</span>
                      </div>
                      <p className="text-sm mb-3 italic text-gray-700">"{note.note_content}"</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>To: {note.recipient_name || note.recipient_type}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                          <span>{note.hearts_received || 0}</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-3 space-y-2">
                        <p className="text-xs text-gray-600 mb-2">Send support:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleSendVirtualHug(note, 'heart', null)} className="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-medium transition-all hover:scale-105 active:scale-95">
                            ❤️ Hug
                          </button>
                          <button onClick={() => handleSendVirtualHug(note, 'see_you', 'I see you. You are seen and valued.')} className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-medium transition-all hover:scale-105 active:scale-95">
                            👁️ I see you
                          </button>
                          <button onClick={() => handleSendVirtualHug(note, 'feel_you', 'I feel you. You\'re not alone in this.')} className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-xs font-medium transition-all hover:scale-105 active:scale-95">
                            🫂 I feel you
                          </button>
                          <button onClick={() => handleSendVirtualHug(note, 'not_alone', 'You are not alone. We\'re in this together.')} className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-xs font-medium transition-all hover:scale-105 active:scale-95">
                            🌟 Not alone
                          </button>
                        </div>
                        <button onClick={() => handleSendVirtualHug(note, 'lonely_too', 'The holidays can be lonely - you\'re not alone in this moment. Sending warmth your way.')} className="w-full px-2 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-xs font-medium transition-all hover:scale-105 active:scale-95">
                          💛 Holidays can be lonely - you're not alone
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Flame className="w-6 h-6 text-amber-600" />Memory Table</CardTitle>
              <CardDescription>Honor what and who you're thankful for - light a candle in their memory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Memory Type:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'person', label: 'Person', emoji: '👤' },
                    { value: 'moment', label: 'Moment', emoji: '⏰' },
                    { value: 'tradition', label: 'Tradition', emoji: '🎉' },
                    { value: 'blessing', label: 'Blessing', emoji: '🙏' },
                    { value: 'lesson_learned', label: 'Lesson', emoji: '📚' },
                    { value: 'hope', label: 'Hope', emoji: '🌟' },
                  ].map(type => (
                    <button key={type.value} onClick={() => setMemoryType(type.value)} className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${memoryType === type.value ? 'border-amber-500 bg-amber-50 shadow-lg' : 'border-gray-200 bg-white'}`}>
                      <span className="text-xl block mb-1">{type.emoji}</span>
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input value={memoryTitle} onChange={(e) => setMemoryTitle(e.target.value)} placeholder="e.g., My grandmother's laugh" className="bg-white" />
              <Textarea value={memoryContent} onChange={(e) => setMemoryContent(e.target.value)} placeholder="Share your memory..." className="h-32 bg-white" />

              <div className="flex items-center gap-2">
                <input type="checkbox" id="anon-mem" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded" />
                <label htmlFor="anon-mem" className="text-sm">Share anonymously</label>
              </div>

              <Button onClick={handleShareMemory} disabled={isSending} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                {isSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sharing...</> : <><Flame className="w-4 h-4 mr-2" />Light a Candle & Share</>}
              </Button>

              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-gray-600 w-full mb-1">Share this memory:</span>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('facebook', 'memory')} className="flex-1">📘 Facebook</Button>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('twitter', 'memory')} className="flex-1">🐦 Twitter</Button>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('tiktok', 'memory')} className="flex-1">🎵 TikTok</Button>
                <Button size="sm" variant="outline" onClick={() => handleSocialShare('linkedin', 'memory')} className="flex-1">💼 LinkedIn</Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-bold mb-4">Memory Table 🕯️</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {memoryTable.map((memory, i) => (
                <motion.div key={memory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-white/90 hover:shadow-lg transition-all border-l-4 border-amber-400">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <motion.div animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Flame className="w-6 h-6 text-amber-500" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="font-bold mb-1">{memory.title}</h4>
                          <p className="text-xs text-gray-500 mb-2">by {memory.author_display_name}</p>
                          <p className="text-sm text-gray-700">{memory.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <Badge variant="outline">{memory.memory_type.replace('_', ' ')}</Badge>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                          <span>{memory.hearts_received || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kindness" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TreePine className="w-7 h-7 text-green-600" />
                Kindness Tree
              </CardTitle>
              <CardDescription className="text-base">
                {user 
                  ? "Log an act of kindness and watch our community tree grow with colorful leaves! 🍂"
                  : "See the community's kindness! Create an account to add your own leaf and light up stars! 🌳✨"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={kindnessDescription} 
                onChange={(e) => setKindnessDescription(e.target.value)} 
                placeholder={user ? "What kindness did you share today? Even the smallest act counts! 💚" : "Create an account to add your kindness leaf to the tree! 🍂"}
                className="h-32 bg-white text-base resize-none"
                disabled={!user}
              />

              {user && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="anon-kind" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded" />
                  <label htmlFor="anon-kind" className="text-sm font-medium">Share anonymously</label>
                </div>
              )}

              <Button 
                onClick={handleLogKindness} 
                disabled={isSending || !kindnessDescription.trim() || !user} 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 text-lg py-6 shadow-lg hover:shadow-xl"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding your leaf to the tree...
                  </>
                ) : user ? (
                  <>
                    <TreePine className="w-5 h-5 mr-2" />
                    Add Leaf to Tree 🍂
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 mr-2" />
                    Sign Up to Add Your Leaf 🍂
                  </>
                )}
              </Button>

              {user && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs text-gray-600 w-full mb-1">Share your kindness:</span>
                  <Button size="sm" variant="outline" onClick={() => handleSocialShare('facebook', 'kindness')} className="flex-1">📘 Facebook</Button>
                  <Button size="sm" variant="outline" onClick={() => handleSocialShare('twitter', 'kindness')} className="flex-1">🐦 Twitter</Button>
                  <Button size="sm" variant="outline" onClick={() => handleSocialShare('instagram', 'kindness')} className="flex-1">📷 Instagram</Button>
                  <Button size="sm" variant="outline" onClick={() => handleSocialShare('tiktok', 'kindness')} className="flex-1">🎵 TikTok</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 opacity-5">
              <TreePine className="w-full h-full text-green-800" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <TreePine className="w-24 h-24 text-green-700 mx-auto mb-4 drop-shadow-lg" />
                </motion.div>
                <h3 className="text-4xl font-bold text-green-900 mb-3">🌳 Our Kindness Tree 🌳</h3>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <p className="text-green-700 text-2xl font-bold">
                    {treeLoading ? 'Loading...' : `${kindnessTree.length} Beautiful Leaves`}
                  </p>
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-base text-green-600 italic mb-4">Each colorful leaf represents an act of kindness in our community</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => refetchKindnessTree()}
                  className="mb-4"
                >
                  🔄 Refresh Tree
                </Button>
              </div>

              {treeLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-green-600 mx-auto mb-3 animate-spin" />
                  <p className="text-green-700">Loading kindness leaves...</p>
                </div>
              ) : kindnessTree.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {kindnessTree.map((act, i) => (
                      <motion.div 
                        key={act.id} 
                        initial={{ opacity: 0, rotate: -20, scale: 0.3, y: -100 }} 
                        animate={{ 
                          opacity: 1, 
                          rotate: [Math.random() * 30 - 15, Math.random() * 20 - 10], 
                          scale: 1,
                          y: 0 
                        }} 
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        transition={{ 
                          delay: i * 0.08,
                          type: 'spring',
                          stiffness: 120,
                          damping: 12
                        }}
                        whileHover={{ scale: 1.15, rotate: 0, zIndex: 10, y: -5 }}
                        layout
                      >
                        <div className={`p-5 rounded-2xl border-3 shadow-lg transition-all cursor-pointer bg-gradient-to-br ${
                          act.leaf_color === 'amber' ? 'from-amber-100 via-amber-200 to-amber-300 border-amber-500 hover:shadow-amber-300' :
                          act.leaf_color === 'orange' ? 'from-orange-100 via-orange-200 to-orange-300 border-orange-500 hover:shadow-orange-300' :
                          act.leaf_color === 'red' ? 'from-red-100 via-red-200 to-red-300 border-red-500 hover:shadow-red-300' :
                          act.leaf_color === 'gold' ? 'from-yellow-100 via-yellow-200 to-yellow-300 border-yellow-500 hover:shadow-yellow-300' :
                          'from-green-100 via-green-200 to-green-300 border-green-500 hover:shadow-green-300'
                        } hover:shadow-2xl`}>
                          <p className="text-sm text-gray-800 mb-4 line-clamp-4 font-medium leading-relaxed min-h-[80px]">
                            "{act.description}"
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t-2 border-white/50">
                            <motion.span 
                              className="text-4xl drop-shadow-lg"
                              animate={{ rotate: [-5, 5, -5] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                              🍂
                            </motion.span>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation(); // Prevent card click if there's any
                                await base44.entities.KindnessAct.update(act.id, {
                                  community_reactions: (act.community_reactions || 0) + 1,
                                });
                                refetchKindnessTree();
                                toast.success('💚 Support sent! Your kindness ripples outward!');
                              }}
                              className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-white/90 hover:bg-white transition-all hover:scale-110 active:scale-95 font-semibold shadow-md hover:shadow-lg"
                            >
                              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                              <span className="font-bold text-gray-800">{act.community_reactions || 0}</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 px-4"
                >
                  <div className="text-8xl mb-6">🌱</div>
                  <p className="text-green-800 text-2xl font-bold mb-3">The tree is waiting for its first leaf...</p>
                  <p className="text-green-600 text-lg mb-6">Be the first to add an act of kindness and watch it grow!</p>
                  <Button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  >
                    <TreePine className="w-5 h-5 mr-2" />
                    Add First Leaf
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}