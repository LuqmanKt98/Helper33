import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Target,
  Flame,
  Sparkles,
  ThumbsUp,
  Send,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';

const REACTION_TYPES = [
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'heart', emoji: '❤️', label: 'Love' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'support', emoji: '💪', label: 'Support' },
  { type: 'clap', emoji: '👏', label: 'Applause' }
];

export default function ActivityFeed({ friends = [] }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { user: authUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  // Fetch friend activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['friendActivities', friends],
    queryFn: async () => {
      if (!friends || friends.length === 0) return [];

      const friendIds = friends.map(f => f.id);

      const { data, error } = await supabase
        .from('friend_activities')
        .select('*')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: friends && friends.length > 0
  });

  // Fetch reactions for activities
  const { data: reactions = [] } = useQuery({
    queryKey: ['activityReactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cheer_reactions')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch comments for activities
  const { data: comments = [] } = useQuery({
    queryKey: ['activityComments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_comments')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (params) => {
      const { activityId, reactionType } = params;
      const activity = activities.find(a => a.id === activityId);

      const { error } = await supabase
        .from('cheer_reactions')
        .insert({
          activity_id: activityId,
          cheerer_id: user.id,
          cheerer_email: user.email,
          cheerer_name: user.full_name,
          cheerer_avatar: user.avatar_url,
          recipient_email: activity.user_id,
          reaction_type: reactionType
        });

      if (error) throw error;

      // Update activity cheer count
      await supabase
        .from('friend_activities')
        .update({ cheer_count: (activity.cheer_count || 0) + 1 })
        .eq('id', activityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendActivities'] });
      queryClient.invalidateQueries({ queryKey: ['activityReactions'] });
      toast.success('Reaction added! 🎉');
    },
    onError: (error) => {
      toast.error('Failed to add reaction');
      console.error('Reaction error:', error);
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (params) => {
      const { activityId, comment } = params;
      const activity = activities.find(a => a.id === activityId);

      const { error } = await supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          commenter_id: user.id,
          commenter_email: user.email,
          commenter_name: user.full_name,
          commenter_avatar: user.avatar_url,
          comment_text: comment
        });

      if (error) throw error;

      // Update activity comment count
      await supabase
        .from('friend_activities')
        .update({ comment_count: (activity.comment_count || 0) + 1 })
        .eq('id', activityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendActivities'] });
      queryClient.invalidateQueries({ queryKey: ['activityComments'] });
      setCommentText('');
      setSelectedActivity(null);
      toast.success('Comment added! 💬');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Comment error:', error);
    }
  });

  const handleReaction = (activityId, reactionType) => {
    if (!user) {
      toast.error('Please log in to react');
      return;
    }
    addReactionMutation.mutate({ activityId, reactionType });
  };

  const handleComment = (activityId) => {
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    addCommentMutation.mutate({ activityId, comment: commentText });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'badge_earned':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'challenge_completed':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'streak_milestone':
        return <Flame className="w-5 h-5 text-orange-600" />;
      case 'level_up':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const getActivityReactions = (activityId) => {
    return reactions.filter(r => r.activity_id === activityId);
  };

  const getActivityComments = (activityId) => {
    return comments.filter(c => c.activity_id === activityId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading activity feed...</p>
        </CardContent>
      </Card>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-12 text-center">
          <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Connect with Friends
          </h3>
          <p className="text-gray-600">
            Add friends to see their achievements and celebrate together!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Recent Activity
          </h3>
          <p className="text-gray-600">
            Your friends haven't shared any achievements yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => {
        const activityReactions = getActivityReactions(activity.id);
        const activityComments = getActivityComments(activity.id);
        const userReaction = activityReactions.find(r => r.cheerer_id === user?.id);

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                {/* Activity Header */}
                <div className="flex items-start gap-4 mb-4">
                  {activity.user_avatar ? (
                    <img
                      src={activity.user_avatar}
                      alt={activity.user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {activity.user_name?.[0] || 'U'}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{activity.user_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getActivityIcon(activity.activity_type)}
                        <span className="ml-1">{activity.activity_type.replace(/_/g, ' ')}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Activity Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {activity.achievement_title}
                  </h3>
                  <p className="text-gray-700">{activity.achievement_description}</p>

                  {activity.achievement_data && Object.keys(activity.achievement_data).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      {Object.entries(activity.achievement_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-semibold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {REACTION_TYPES.map(reaction => {
                    const count = activityReactions.filter(r => r.reaction_type === reaction.type).length;
                    const isActive = userReaction?.reaction_type === reaction.type;

                    return (
                      <button
                        key={reaction.type}
                        onClick={() => handleReaction(activity.id, reaction.type)}
                        disabled={addReactionMutation.isPending}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${isActive
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                          }`}
                        title={reaction.label}
                      >
                        <span className="text-lg">{reaction.emoji}</span>
                        {count > 0 && <span className="font-semibold">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-3 border-t">
                  <button
                    onClick={() => setSelectedActivity(selectedActivity === activity.id ? null : activity.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {activity.comment_count || 0} {activity.comment_count === 1 ? 'Comment' : 'Comments'}
                    </span>
                  </button>

                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {selectedActivity === activity.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t space-y-3"
                    >
                      {/* Existing Comments */}
                      {activityComments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          {comment.commenter_avatar ? (
                            <img
                              src={comment.commenter_avatar}
                              alt={comment.commenter_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                              {comment.commenter_name?.[0] || 'U'}
                            </div>
                          )}
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-sm text-gray-900 mb-1">
                              {comment.commenter_name}
                            </p>
                            <p className="text-sm text-gray-700">{comment.comment_text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Button
                          onClick={() => handleComment(activity.id)}
                          disabled={addCommentMutation.isPending || !commentText.trim()}
                          className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          {addCommentMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
