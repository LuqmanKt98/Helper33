import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, user, onLike }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const moods = {
    celebrating: { label: '🎉 Celebrating', color: 'from-yellow-400 to-orange-500' },
    grateful: { label: '🙏 Grateful', color: 'from-green-400 to-emerald-500' },
    inspired: { label: '✨ Inspired', color: 'from-purple-400 to-pink-500' },
    peaceful: { label: '🕊️ Peaceful', color: 'from-blue-400 to-cyan-500' },
    motivated: { label: '💪 Motivated', color: 'from-red-400 to-orange-500' },
    creative: { label: '🎨 Creative', color: 'from-indigo-400 to-purple-500' },
  };

  // Check if user has liked this post
  const { data: userLike } = useQuery({
    queryKey: ['postLike', post.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!user && !!post.id
  });

  const hasLiked = !!userLike;

  // Fetch comments for this post
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['postComments', post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: showComments
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postLike', post.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!newComment.trim()) throw new Error('Comment cannot be empty');

      const isAnonymous = user?.community_privacy?.is_fully_anonymous;

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim(),
          author_name: isAnonymous
            ? `${user?.profile_emoji || '🎭'} Anonymous`
            : user?.preferred_name || user?.full_name,
          author_avatar: isAnonymous ? null : user?.avatar_url,
          is_anonymous: isAnonymous
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
      setNewComment('');
      toast.success('Comment added!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add comment');
    }
  });

  const handleLikeClick = async () => {
    if (!user) {
      toast.info('Please log in to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Check out this post',
        text: post.content?.slice(0, 100) + '...',
        url: window.location.origin + createPageUrl(`ForumPost?id=${post.id}`)
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + createPageUrl(`ForumPost?id=${post.id}`));
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAddComment = () => {
    if (!user) {
      toast.info('Please log in to comment');
      return;
    }
    if (!newComment.trim()) return;
    commentMutation.mutate();
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-xl transition-all">
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => !post.is_anonymous && navigate(createPageUrl(`UserProfile?email=${post.created_by}`))}
            >
              <Avatar className="ring-2 ring-purple-200">
                <AvatarImage src={post.author_avatar_url || post.author_avatar} />
                <AvatarFallback>{post.author_name?.[0] || post.author_display_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold hover:text-purple-600 transition-colors">
                  {post.author_name || post.author_display_name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(post.created_at || post.created_date)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Mood Badge */}
          {post.mood && moods[post.mood] && (
            <Badge className={`mb-3 bg-gradient-to-r ${moods[post.mood].color} text-white border-0`}>
              {moods[post.mood].label}
            </Badge>
          )}

          {/* Title */}
          {post.title && (
            <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
          )}

          {/* Content */}
          <p className="text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
              {post.media_urls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="Post media"
                  className="w-full h-48 object-cover"
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Achievement */}
          {post.content_type === 'achievement' && post.achievement_data && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{post.achievement_data.achievement_icon || '🏆'}</div>
                <div>
                  <p className="font-bold text-yellow-900">Achievement Unlocked!</p>
                  <p className="text-sm text-yellow-800">{post.achievement_data.achievement_name}</p>
                  <p className="text-xs text-yellow-700">+{post.achievement_data.achievement_points} points</p>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center gap-6 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              disabled={likeMutation.isPending}
              className={`gap-2 ${hasLiked ? 'text-pink-600' : ''}`}
            >
              {likeMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
              )}
              {post.like_count || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-5 h-5" />
              {post.comment_count || 0}
              {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
              {post.share_count || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-purple-600' : ''}`} />
            </Button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t space-y-4"
              >
                {/* Add Comment */}
                {user && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[80px] mb-2"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || commentMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        {commentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Comment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.author_avatar} />
                          <AvatarFallback>{comment.author_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-gray-900">{comment.author_name}</p>
                            <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
