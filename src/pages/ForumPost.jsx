
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  Send,
  Loader2,
  Eye,
  Clock,
  MoreVertical,
  Flag,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ForumPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  // Get post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

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
      if (error) return null;
      return data;
    },
    enabled: !!authUser
  });

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['forumPost', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;

      if (data) {
        // Increment view count
        await supabase
          .from('posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', postId);
      }

      return data;
    },
    enabled: !!postId,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['forumComments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });

  // Check if user has liked or bookmarked
  useEffect(() => {
    if (user && postId) {
      // Check bookmark
      // Assuming a community_engagements table or similar for likes/bookmarks
      // For now, let's assume we store them in a way we can query
      const checkEngagement = async () => {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', user.id);
        setHasLiked(likes && likes.length > 0);

        // Similar for bookmarks
        const { data: bookmarks } = await supabase
          .from('post_bookmarks')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', user.id);
        setIsBookmarked(bookmarks && bookmarks.length > 0);
      };

      checkEngagement();
    }
  }, [user, postId]);

  const handleLike = async () => {
    if (!user) {
      toast.info('Please log in to like posts');
      navigate(createPageUrl('Login') + `?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        await supabase
          .from('posts')
          .update({ like_count: Math.max(0, (post.like_count || 0) - 1) })
          .eq('id', postId);

        setHasLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        await supabase
          .from('posts')
          .update({ like_count: (post.like_count || 0) + 1 })
          .eq('id', postId);

        setHasLiked(true);
      }
      queryClient.invalidateQueries(['forumPost', postId]);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.info('Please log in to bookmark posts');
      navigate(createPageUrl('Login') + `?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
        setIsBookmarked(true);
        toast.success('Post bookmarked!');
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info('Please log in to comment');
      navigate(createPageUrl('Login') + `?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setIsSubmittingComment(true);

    try {
      // AI Moderation for comment
      const { data: moderationResponse, error: moderationError } = await supabase.functions.invoke('process-ai', {
        body: {
          action: 'moderate-comment',
          content: commentContent.trim()
        }
      });

      if (moderationError) throw moderationError;

      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          content: commentContent.trim(),
          author_name: user.full_name,
          author_avatar_url: user.avatar_url,
          status: moderationResponse.is_safe ? 'approved' : 'pending',
          ai_moderation_score: moderationResponse.safety_score,
          created_by: user.id
        });

      if (commentError) throw commentError;

      // Update post comment count and last activity
      await supabase
        .from('posts')
        .update({
          comment_count: (post.comment_count || 0) + 1,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', postId);

      setCommentContent('');
      queryClient.invalidateQueries(['forumComments', postId]);
      queryClient.invalidateQueries(['forumPost', postId]);

      if (moderationResponse.is_safe) {
        toast.success('Comment posted!');
      } else {
        toast.info('Your comment is under review');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReport = async () => {
    if (!user) {
      toast.info('Please log in to report');
      return;
    }
    toast.info('Post reported. Our team will review it.');
  };

  if (postLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
        <p className="text-gray-600 mb-4">This post may have been removed or doesn't exist.</p>
        <Button onClick={() => navigate(createPageUrl('CommunityForum'))}>
          Back to Forum
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('CommunityForum'))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Discussion</h1>
        </div>

        {/* Main Post */}
        <Card>
          <CardContent className="p-6">
            {/* Author Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author_avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                    {post.is_anonymous ? '?' : (post.author_name?.[0] || 'A')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{post.author_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {new Date(post.created_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>

            {/* Post Content */}
            <div className="prose prose-sm max-w-none mb-4">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={hasLiked ? 'text-purple-600' : ''}
              >
                <ThumbsUp className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
                {post.like_count || 0}
              </Button>

              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                {post.comment_count || 0}
              </Button>

              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                {post.view_count || 0}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="ml-auto"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-purple-600 fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingComment || !commentContent.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">
            Comments ({comments.length})
          </h3>

          {commentsLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
              </CardContent>
            </Card>
          ) : comments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No comments yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={comment.author_avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                            {comment.is_anonymous ? '?' : (comment.author_name?.[0] || 'A')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">{comment.author_name}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>

                          <div className="flex items-center gap-3 mt-3">
                            <Button variant="ghost" size="sm" className="h-8 text-xs">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {comment.like_count || 0}
                            </Button>
                            {comment.is_solution && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Solution
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
