
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Shield,
  Target,
  Sparkles,
  Unlock,
  TrendingUp,
  Calendar,
  Award,
  Send,
  Plus,
  Settings as SettingsIcon,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SoulLinkCommunity({ settings }) {
  const [communityTab, setCommunityTab] = useState('feed');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ['soulLinkCommunityPosts'],
    queryFn: () => base44.entities.SoulLinkCommunityPost.list('-created_date', 50)
  });

  const { data: activeChallenges = [] } = useQuery({
    queryKey: ['soulLinkChallenges'],
    queryFn: () => base44.entities.SoulLinkChallenge.filter({ status: 'active' })
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['mySoulLinkChallenges'],
    queryFn: () => base44.entities.SoulLinkChallengeParticipant.filter({})
  });

  const communityEnabled = settings?.community_privacy?.allow_anonymous_sharing;
  const displayName = settings?.community_privacy?.community_display_name || 'Anonymous Friend';

  if (!communityEnabled) {
    return <PrivacyOnboarding settings={settings} />;
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-900 font-semibold mb-1">
                Your Privacy is Protected
              </p>
              <p className="text-xs text-green-700">
                You're sharing as <strong>{displayName}</strong>. No personal info is ever shared.
              </p>
            </div>
            <Button
              onClick={() => setShowPrivacySettings(true)}
              size="sm"
              variant="outline"
              className="flex-shrink-0"
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Tabs */}
      <Tabs value={communityTab} onValueChange={setCommunityTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/80">
          <TabsTrigger value="feed" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="w-4 h-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <Heart className="w-4 h-4" />
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <CommunityFeed 
            posts={communityPosts} 
            displayName={displayName}
            onShare={() => setShowShareModal(true)}
          />
        </TabsContent>

        <TabsContent value="challenges">
          <ChallengeBrowser 
            challenges={activeChallenges}
            myChallenges={myChallenges}
            displayName={displayName}
          />
        </TabsContent>

        <TabsContent value="support">
          <SupportSpace posts={communityPosts} displayName={displayName} />
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      {showShareModal && (
        <ShareToCommunityModal
          settings={settings}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            setShowShareModal(false);
            queryClient.invalidateQueries(['soulLinkCommunityPosts']);
          }}
        />
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <CommunityPrivacyModal
          settings={settings}
          onClose={() => setShowPrivacySettings(false)}
        />
      )}
    </div>
  );
}

function PrivacyOnboarding({ settings }) {
  const [displayName, setDisplayName] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const queryClient = useQueryClient();

  const handleEnable = async () => {
    if (!displayName.trim()) {
      toast.error('Please choose a display name');
      return;
    }

    setIsEnabling(true);
    try {
      await base44.entities.CompanionSettings.update(settings.id, {
        community_privacy: {
          ...settings.community_privacy,
          allow_anonymous_sharing: true,
          community_display_name: displayName.trim(),
          share_mood_trends: false,
          share_journal_themes: false,
          participate_in_challenges: true,
          allow_community_support: true
        }
      });

      queryClient.invalidateQueries(['companion-settings']);
      toast.success('Community features enabled! 🌟');
    } catch (error) {
      toast.error('Failed to enable community features');
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-lg shadow-xl border-2 border-purple-200">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join the SoulLink Community
          </h2>
          <p className="text-gray-600">
            Connect with others on similar journeys. Share anonymously, support each other, and grow together.
          </p>
        </div>

        <div className="space-y-6">
          {/* Privacy Features */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Privacy is Protected
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>100% anonymous - choose your own display name</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>No personal information ever shared</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>You control what you share (themes, trends, insights only)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>AI moderation keeps the space safe and supportive</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Opt out anytime - you're in full control</span>
              </div>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Choose Your Anonymous Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Peaceful Warrior, Hopeful Soul, Gentle Heart"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be visible to the community. Choose something meaningful to you!
            </p>
          </div>

          <Button
            onClick={handleEnable}
            disabled={!displayName.trim() || isEnabling}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
          >
            {isEnabling ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5 mr-2" />
                Enable Community Features
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            You can change your privacy settings anytime in the Community tab
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CommunityFeed({ posts, displayName, onShare }) {
  const queryClient = useQueryClient();

  const reactToPostMutation = useMutation({
    mutationFn: async ({ postId, reactionType }) => {
      const post = posts.find(p => p.id === postId);
      const currentReactions = post.support_reactions || {};
      
      return base44.entities.SoulLinkCommunityPost.update(postId, {
        support_reactions: {
          ...currentReactions,
          [reactionType]: (currentReactions[reactionType] || 0) + 1
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['soulLinkCommunityPosts']);
      toast.success('Support sent 💜');
    }
  });

  const handleReaction = (postId, reactionType) => {
    reactToPostMutation.mutate({ postId, reactionType });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Community Feed</h3>
        <Button onClick={onShare} className="gap-2 bg-purple-600">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {post.display_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{post.display_name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(post.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {post.post_type.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-gray-800 leading-relaxed mb-4">
                  {post.content}
                </p>

                {post.mood_data && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 mb-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{post.mood_data.mood_emoji}</span>
                      <span className="font-semibold text-gray-900">
                        {post.mood_data.current_mood}
                      </span>
                      {post.mood_data.trend && (
                        <Badge className={`ml-auto ${
                          post.mood_data.trend === 'improving' ? 'bg-green-600' :
                          post.mood_data.trend === 'declining' ? 'bg-orange-600' :
                          'bg-blue-600'
                        }`}>
                          {post.mood_data.trend === 'improving' && <TrendingUp className="w-3 h-3 mr-1" />}
                          {post.mood_data.trend}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Tracking for {post.mood_data.days_tracked} days
                    </p>
                  </div>
                )}

                {post.journal_themes && post.journal_themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.journal_themes.map((theme, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag, i) => (
                      <Badge key={i} className="bg-purple-100 text-purple-700 text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleReaction(post.id, 'hearts')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.support_reactions?.hearts || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(post.id, 'hugs')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <span>🤗</span>
                    <span>{post.support_reactions?.hugs || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(post.id, 'strength')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <span>💪</span>
                    <span>{post.support_reactions?.strength || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReaction(post.id, 'relate')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <span>🙋</span>
                    <span>{post.support_reactions?.relate || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors ml-auto">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comment_count || 0}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {posts.length === 0 && (
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Posts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share with the community!
              </p>
              <Button onClick={onShare} className="bg-purple-600">
                Share Your Journey
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ChallengeBrowser({ challenges, myChallenges, displayName }) {
  const queryClient = useQueryClient();

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = challenges.find(c => c.id === challengeId);
      
      await base44.entities.SoulLinkChallengeParticipant.create({
        challenge_id: challengeId,
        display_name: displayName,
        joined_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });

      await base44.entities.SoulLinkChallenge.update(challengeId, {
        participant_count: (challenge.participant_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mySoulLinkChallenges']);
      queryClient.invalidateQueries(['soulLinkChallenges']);
      toast.success('Challenge joined! Let\'s do this! 🎯');
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async ({ participantId, day, note, mood }) => {
      const participant = myChallenges.find(p => p.id === participantId);
      const completedDays = [...(participant.completed_days || []), day];
      const checkIns = [...(participant.check_ins || []), {
        day,
        completed: true,
        note,
        mood,
        timestamp: new Date().toISOString()
      }];

      return base44.entities.SoulLinkChallengeParticipant.update(participantId, {
        completed_days: completedDays,
        check_ins: checkIns,
        current_day: day,
        completion_percentage: (completedDays.length / (participant.challenge_id ? challenges.find(c => c.id === participant.challenge_id)?.duration_days : 1)) * 100
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mySoulLinkChallenges']);
      toast.success('Day completed! Keep going! 🌟');
    }
  });

  return (
    <div className="space-y-6">
      {myChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Active Challenges
          </h3>
          <div className="grid gap-4">
            {myChallenges.map(participation => {
              const challenge = challenges.find(c => c.id === participation.challenge_id);
              if (!challenge) return null;

              return (
                <Card key={participation.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{challenge.title}</h4>
                        <p className="text-sm text-gray-600">
                          Day {participation.current_day || 0} of {challenge.duration_days}
                        </p>
                      </div>
                      <Badge className="bg-purple-600">
                        {participation.completion_percentage?.toFixed(0) || 0}%
                      </Badge>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${participation.completion_percentage || 0}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>

                    {challenge.daily_prompts && challenge.daily_prompts[participation.current_day || 0] && (
                      <div className="bg-white/60 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-purple-900 mb-2">
                          Today's Practice:
                        </p>
                        <p className="text-sm text-gray-700">
                          {challenge.daily_prompts[participation.current_day || 0].prompt}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const nextDay = (participation.current_day || 0) + 1;
                          checkInMutation.mutate({
                            participantId: participation.id,
                            day: nextDay,
                            note: '',
                            mood: 'peaceful'
                          });
                        }}
                        disabled={checkInMutation.isPending}
                        className="flex-1 bg-purple-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Day
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Join a Challenge
        </h3>
        <div className="grid gap-4">
          {challenges.map(challenge => {
            const isJoined = myChallenges.some(p => p.challenge_id === challenge.id);

            return (
              <Card key={challenge.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {challenge.image_url && (
                      <img
                        src={challenge.image_url}
                        alt={challenge.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{challenge.title}</h4>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                        <Badge className="bg-blue-600 ml-2">
                          {challenge.duration_days} days
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {challenge.participant_count || 0} joined
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Starts {format(new Date(challenge.start_date), 'MMM d')}
                        </span>
                      </div>

                      {isJoined ? (
                        <Badge className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Joined
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => joinChallengeMutation.mutate(challenge.id)}
                          disabled={joinChallengeMutation.isPending}
                          size="sm"
                          className="bg-purple-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Join Challenge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Active Challenges
              </h3>
              <p className="text-gray-600">
                Check back soon for new wellness challenges!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SupportSpace({ posts, displayName }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');
  const queryClient = useQueryClient();

  const sendSupportMutation = useMutation({
    mutationFn: async ({ postId, message }) => {
      const post = posts.find(p => p.id === postId);
      
      await base44.entities.SoulLinkCommunityComment.create({
        post_id: postId,
        display_name: displayName,
        content: message,
        support_type: 'encouragement'
      });

      await base44.entities.SoulLinkCommunityPost.update(postId, {
        comment_count: (post.comment_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['soulLinkCommunityPosts']);
      setSupportMessage('');
      setSelectedPost(null);
      toast.success('Support sent! 💜');
    }
  });

  const seekingSupportPosts = posts.filter(p => p.post_type === 'seeking_support');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-900">Support Space</p>
              <p className="text-sm text-orange-700">
                Offer kindness and encouragement to others on their journey
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {seekingSupportPosts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {post.display_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{post.display_name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(post.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>

                <p className="text-gray-800 leading-relaxed mb-4">
                  {post.content}
                </p>

                {selectedPost === post.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Write a supportive message..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => sendSupportMutation.mutate({ 
                          postId: post.id, 
                          message: supportMessage 
                        })}
                        disabled={!supportMessage.trim() || sendSupportMutation.isPending}
                        className="flex-1 bg-orange-600"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Support
                      </Button>
                      <Button
                        onClick={() => setSelectedPost(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedPost(post.id)}
                    variant="outline"
                    className="w-full"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Offer Support
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {seekingSupportPosts.length === 0 && (
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Support Requests
              </h3>
              <p className="text-gray-600">
                Everyone is doing well! Check back later to offer support.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ShareToCommunityModal({ settings, onClose, onSuccess }) {
  const [shareType, setShareType] = useState('reflection');
  const [content, setContent] = useState('');
  const [includeMoodTrend, setIncludeMoodTrend] = useState(false);
  const [includeJournalThemes, setIncludeJournalThemes] = useState(false);
  const [tags, setTags] = useState([]);
  const [isSharing, setIsSharing] = useState(false);

  const { data: recentMoods = [] } = useQuery({
    queryKey: ['soulLinkMoodHistory'],
    queryFn: () => base44.entities.SoulLinkMoodEntry.list('-created_date', 7),
    enabled: includeMoodTrend
  });

  const { data: recentJournals = [] } = useQuery({
    queryKey: ['soulLinkJournalEntries'],
    queryFn: () => base44.entities.SoulLinkJournalEntry.list('-created_date', 10),
    enabled: includeJournalThemes
  });

  const handleShare = async () => {
    if (!content.trim()) {
      toast.error('Please write something to share');
      return;
    }

    setIsSharing(true);
    try {
      const postData = {
        display_name: settings?.community_privacy?.community_display_name || 'Anonymous',
        post_type: shareType,
        content: content.trim(),
        tags: tags
      };

      if (includeMoodTrend && recentMoods.length > 0) {
        const latestMood = recentMoods[0];
        const avgMood = recentMoods.reduce((sum, m) => sum + m.mood_rating, 0) / recentMoods.length;
        const trend = avgMood > 6 ? 'improving' : avgMood < 4 ? 'declining' : 'stable';

        postData.mood_data = {
          current_mood: latestMood.mood_label,
          mood_emoji: latestMood.mood_emoji,
          trend: trend,
          days_tracked: recentMoods.length
        };
      }

      if (includeJournalThemes && recentJournals.length > 0) {
        const allThemes = recentJournals.flatMap(j => j.themes_detected || []);
        const uniqueThemes = [...new Set(allThemes)].slice(0, 5);
        postData.journal_themes = uniqueThemes;
      }

      const moderationPrompt = `Moderate this community post for safety and supportiveness:
"${content}"

Check for:
- Harmful content
- Personal information
- Inappropriate language
- Crisis indicators

Return JSON:
{
  "is_safe": true/false,
  "score": 0.0-1.0,
  "reason": "explanation if not safe"
}`;

      const moderation = await base44.integrations.Core.InvokeLLM({
        prompt: moderationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            is_safe: { type: "boolean" },
            score: { type: "number" },
            reason: { type: "string" }
          }
        }
      });

      if (!moderation.is_safe) {
        toast.error('Your post needs revision: ' + moderation.reason);
        setIsSharing(false);
        return;
      }

      postData.moderation_score = moderation.score;
      postData.is_moderated = true;

      await base44.entities.SoulLinkCommunityPost.create(postData);

      toast.success('Shared with the community! 💜');
      onSuccess();
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const commonTags = ['healing', 'gratitude', 'anxiety', 'hope', 'growth', 'self-compassion', 'resilience', 'connection'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Share with Community
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="text-2xl">×</span>
            </button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              What would you like to share?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'reflection', label: 'Reflection', icon: Sparkles },
                { value: 'milestone', label: 'Milestone', icon: Award },
                { value: 'seeking_support', label: 'Need Support', icon: Heart },
                { value: 'offering_support', label: 'Offer Wisdom', icon: MessageCircle }
              ].map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setShareType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      shareType === type.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-gray-700" />
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Your Message
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, insights, or request support..."
              rows={6}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">
              Include Additional Context (Optional)
            </label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-purple-50">
              <input
                type="checkbox"
                checked={includeMoodTrend}
                onChange={(e) => setIncludeMoodTrend(e.target.checked)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Share Mood Trend</p>
                <p className="text-xs text-gray-600">
                  Shows if your mood is improving/stable/declining (no specific details)
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-purple-50">
              <input
                type="checkbox"
                checked={includeJournalThemes}
                onChange={(e) => setIncludeJournalThemes(e.target.checked)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Share Journal Themes</p>
                <p className="text-xs text-gray-600">
                  Shows themes like "healing", "gratitude" (never actual journal content)
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Add Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <Badge
                  key={tag}
                  onClick={() => {
                    if (tags.includes(tag)) {
                      setTags(tags.filter(t => t !== tag));
                    } else {
                      setTags([...tags, tag]);
                    }
                  }}
                  className={`cursor-pointer ${
                    tags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={handleShare}
            disabled={!content.trim() || isSharing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
          >
            {isSharing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 mr-2" />
                Share Anonymously
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CommunityPrivacyModal({ settings, onClose }) {
  const [privacySettings, setPrivacySettings] = useState(
    settings?.community_privacy || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.CompanionSettings.update(settings.id, {
        community_privacy: privacySettings
      });

      queryClient.invalidateQueries(['companion-settings']);
      toast.success('Privacy settings updated! 🔒');
      onClose();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Community Privacy Settings
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="text-2xl">×</span>
            </button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Display Name
            </label>
            <input
              type="text"
              value={privacySettings.community_display_name || ''}
              onChange={(e) => setPrivacySettings({
                ...privacySettings,
                community_display_name: e.target.value
              })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.share_mood_trends || false}
              onChange={(e) => setPrivacySettings({
                ...privacySettings,
                share_mood_trends: e.target.checked
              })}
              className="w-4 h-4 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Share Mood Trends</p>
              <p className="text-xs text-gray-600">
                Allow sharing anonymized mood patterns (improving/stable/declining)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.share_journal_themes || false}
              onChange={(e) => setPrivacySettings({
                ...privacySettings,
                share_journal_themes: e.target.checked
              })}
              className="w-4 h-4 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Share Journal Themes</p>
              <p className="text-xs text-gray-600">
                Share detected themes like "healing", "gratitude" (never actual content)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.participate_in_challenges || false}
              onChange={(e) => setPrivacySettings({
                ...privacySettings,
                participate_in_challenges: e.target.checked
              })}
              className="w-4 h-4 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Join Group Challenges</p>
              <p className="text-xs text-gray-600">
                Participate in wellness challenges with others
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={privacySettings.allow_community_support || false}
              onChange={(e) => setPrivacySettings({
                ...privacySettings,
                allow_community_support: e.target.checked
              })}
              className="w-4 h-4 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Receive Community Support</p>
              <p className="text-xs text-gray-600">
                Allow others to react and comment on your posts
              </p>
            </div>
          </label>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
