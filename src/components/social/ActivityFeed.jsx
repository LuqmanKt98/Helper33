
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Trophy,
  Flame,
  Star,
  Award,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Loader2,
  CheckCircle, // Added
  Target, // Added
  BookOpen, // Added
  Calendar // Added
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const activityIcons = {
  badge_earned: Trophy,
  challenge_completed: CheckCircle, // Modified
  level_up: TrendingUp,
  streak_milestone: Flame,
  perfect_day: Star,
  wellness_plan_generated: Target, // Modified
  journal_milestone: BookOpen, // Modified
  event_attendance: Calendar, // Added
  event_badge_earned: Award // Added
};

const activityColors = {
  badge_earned: 'from-yellow-500 to-amber-500',
  challenge_completed: 'from-green-500 to-emerald-500',
  level_up: 'from-blue-500 to-cyan-500',
  streak_milestone: 'from-orange-500 to-red-500',
  perfect_day: 'from-purple-500 to-pink-500',
  wellness_plan_generated: 'from-indigo-500 to-purple-500',
  journal_milestone: 'from-rose-500 to-pink-500',
  event_attendance: 'from-purple-500 to-pink-500',
  event_badge_earned: 'from-amber-500 to-orange-500'
};

const cheerEmojis = {
  fire: '🔥',
  heart: '❤️',
  clap: '👏',
  trophy: '🏆',
  star: '⭐',
  celebrate: '🎉',
  strong: '💪',
  wow: '😮'
};

export default function ActivityFeed({ friends }) {
  const [commentingOn, setCommentingOn] = useState(null);
  const [commentText, setCommentText] = useState('');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const friendEmails = friends.map(f => f.email);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['friend-activities', friendEmails],
    queryFn: async () => {
      if (friendEmails.length === 0) return [];

      const { data, error } = await supabase
        .from('friend_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.filter(activity =>
        friendEmails.includes(activity.user_email) || activity.user_email === user?.email
      );
    },
    enabled: !!user && friendEmails.length > 0
  });

  const { data: myReactions = [] } = useQuery({
    queryKey: ['my-cheer-reactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cheer_reactions')
        .select('*')
        .eq('cheerer_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['activity-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_comments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const cheerMutation = useMutation({
    mutationFn: async ({ activityId, activityOwnerId, reactionType }) => {
      // Check if already cheered
      const { data: existing, error: fetchError } = await supabase
        .from('cheer_reactions')
        .select('*')
        .eq('activity_id', activityId)
        .eq('cheerer_id', user.id);

      if (fetchError) throw fetchError;

      if (existing && existing.length > 0) {
        // Update existing cheer
        const { error: updateError } = await supabase
          .from('cheer_reactions')
          .update({
            reaction_type: reactionType
          })
          .eq('id', existing[0].id);

        if (updateError) throw updateError;
      } else {
        const { error: createError } = await supabase
          .from('cheer_reactions')
          .insert({
            activity_id: activityId,
            cheerer_id: user.id,
            cheerer_email: user.email,
            cheerer_name: user.full_name,
            cheerer_avatar: user.avatar_url,
            recipient_email: activityOwnerId,
            reaction_type: reactionType
          });

        if (createError) throw createError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-activities']);
      queryClient.invalidateQueries(['my-cheer-reactions']);
      toast.success('Cheer sent! 🎉');
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ activityId }) => {
      const { error } = await supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          commenter_id: user.id,
          commenter_email: user.email,
          commenter_name: user.full_name,
          commenter_avatar: user.avatar_url,
          comment_text: commentText
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activity-comments']);
      queryClient.invalidateQueries(['friend-activities']);
      setCommentingOn(null);
      setCommentText('');
      toast.success('Comment posted!');
    }
  });

  if (friendEmails.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Connect with Friends First
          </h3>
          <p className="text-gray-600 mb-4">
            Add friends to see their amazing achievements here!
          </p>
          <Button onClick={() => { }} className="bg-purple-600">
            Find Friends
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => {
        const Icon = activityIcons[activity.activity_type] || Trophy;
        const activityComments = allComments.filter(c => c.activity_id === activity.id);
        const activityCheers = myReactions.filter(r => r.activity_id === activity.id);
        const myCheer = activityCheers[0];

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:shadow-xl transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {activity.user_avatar ? (
                      <img src={activity.user_avatar} alt={activity.user_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      activity.user_name?.charAt(0) || 'U'
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{activity.user_name}</p>
                      <Icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.achievement_description}
                    </p>

                    {/* Achievement Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-300 mb-3">
                      <div className="flex items-center gap-3">
                        {activity.achievement_data?.badge_icon && (
                          <div className="text-3xl">{activity.achievement_data.badge_icon}</div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{activity.achievement_title}</p>
                          {activity.achievement_data?.badge_tier && (
                            <Badge className={`bg-gradient-to-r ${activityColors[activity.activity_type] || 'from-purple-600 to-pink-600'} text-xs mt-1`}>
                              {activity.achievement_data.badge_tier.toUpperCase()}
                            </Badge>
                          )}
                          {activity.achievement_data?.points_earned > 0 && (
                            <p className="text-xs text-purple-700 mt-1">
                              +{activity.achievement_data.points_earned} points
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Cheer Reactions */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                  {Object.entries(cheerEmojis).map(([type, emoji]) => (
                    <button
                      key={type}
                      onClick={() => cheerMutation.mutate({
                        activityId: activity.id,
                        activityOwnerId: activity.created_by,
                        reactionType: type
                      })}
                      className={`px-3 py-1.5 rounded-full text-lg transition-all ${myCheer?.reaction_type === type
                        ? 'bg-purple-600 scale-110'
                        : 'bg-gray-100 hover:bg-purple-100 hover:scale-110'
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <div className="ml-auto text-sm text-gray-600">
                    {activity.cheer_count || 0} cheers
                  </div>
                </div>

                {/* Comments */}
                {activityComments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {activityComments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs font-semibold text-gray-900">{comment.commenter_name}</p>
                        <p className="text-sm text-gray-700">{comment.comment_text}</p>
                      </div>
                    ))}
                    {activityComments.length > 2 && (
                      <p className="text-xs text-gray-600">
                        +{activityComments.length - 2} more comments
                      </p>
                    )}
                  </div>
                )}

                {/* Comment Input */}
                {commentingOn === activity.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a supportive comment..."
                      rows={2}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => commentMutation.mutate({ activityId: activity.id })}
                        disabled={!commentText.trim() || commentMutation.isPending}
                        size="sm"
                        className="bg-purple-600"
                      >
                        Post Comment
                      </Button>
                      <Button
                        onClick={() => {
                          setCommentingOn(null);
                          setCommentText('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setCommentingOn(activity.id)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-gray-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {activities.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Recent Activity
            </h3>
            <p className="text-gray-600">
              Your friends' achievements will appear here!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
