import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp,
  Filter,
  Plus,
  Star,
  ThumbsUp,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const ReactionButton = ({ type, count, isActive, onClick, icon: Icon, label, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
      isActive
        ? `bg-${color}-100 text-${color}-700 border-2 border-${color}-300`
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-xs font-semibold">{count > 0 ? count : ''}</span>
  </button>
);

const PostCard = ({ post, onReact, onComment, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['womens-health-comments', post.id],
    queryFn: async () => {
      return await base44.entities.WomensHealthComment.filter({ post_id: post.id });
    },
    enabled: showComments
  });

  const { data: myReactions = [] } = useQuery({
    queryKey: ['my-womens-health-reactions', post.id],
    queryFn: async () => {
      return await base44.entities.WomensHealthReaction.filter({
        post_id: post.id,
        created_by: currentUser?.email
      });
    }
  });

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    setIsCommenting(true);
    try {
      await onComment(post.id, commentText);
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const categoryColors = {
    trying_to_conceive: 'bg-purple-100 text-purple-700',
    pregnancy_first_trimester: 'bg-blue-100 text-blue-700',
    pregnancy_second_trimester: 'bg-cyan-100 text-cyan-700',
    pregnancy_third_trimester: 'bg-teal-100 text-teal-700',
    postpartum: 'bg-pink-100 text-pink-700',
    breastfeeding: 'bg-rose-100 text-rose-700',
    baby_care: 'bg-orange-100 text-orange-700',
    cycle_health: 'bg-indigo-100 text-indigo-700',
    fertility: 'bg-violet-100 text-violet-700',
    pregnancy_loss: 'bg-gray-100 text-gray-700',
    general_wellness: 'bg-green-100 text-green-700'
  };

  const reactions = [
    { type: 'heart', icon: Heart, label: 'Heart', color: 'pink' },
    { type: 'hug', icon: Users, label: 'Hug', color: 'purple' },
    { type: 'strength', icon: Award, label: 'Strength', color: 'orange' },
    { type: 'relate', icon: ThumbsUp, label: 'Relate', color: 'blue' },
    { type: 'helpful', icon: Star, label: 'Helpful', color: 'yellow' }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {post.is_anonymous ? '👤' : post.author_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {post.is_anonymous ? 'Anonymous' : post.author_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={categoryColors[post.category] || 'bg-gray-100 text-gray-700'}>
                  {post.category?.replace(/_/g, ' ')}
                </Badge>
                {post.pregnancy_week && (
                  <Badge variant="outline" className="text-xs">
                    Week {post.pregnancy_week}
                  </Badge>
                )}
                {post.postpartum_week && (
                  <Badge variant="outline" className="text-xs">
                    {post.postpartum_week}w PP
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {post.ai_highlighted && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Featured
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
          <ReactMarkdown className="text-gray-700 text-sm prose prose-sm max-w-none">
            {post.content}
          </ReactMarkdown>
          {post.ai_highlight_reason && (
            <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-xs text-yellow-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">AI Coach:</span> {post.ai_highlight_reason}
              </p>
            </div>
          )}
        </div>

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

        {/* Reactions */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {reactions.map((reaction) => {
            const count = post.support_reactions?.[reaction.type] || 0;
            const isActive = myReactions.some(r => r.reaction_type === reaction.type);
            
            return (
              <ReactionButton
                key={reaction.type}
                type={reaction.type}
                count={count}
                isActive={isActive}
                onClick={() => onReact(post.id, reaction.type)}
                icon={reaction.icon}
                label={reaction.label}
                color={reaction.color}
              />
            );
          })}
        </div>

        {/* Comment Toggle */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-gray-600 hover:text-purple-600"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}
            {showComments ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                {/* Comments List */}
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                        {comment.is_anonymous ? '👤' : comment.author_name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-900">
                            {comment.is_anonymous ? 'Anonymous' : comment.author_name}
                          </p>
                          {comment.pregnancy_week && (
                            <Badge variant="outline" className="text-xs">
                              Week {comment.pregnancy_week}
                            </Badge>
                          )}
                          {comment.is_helpful && (
                            <Badge className="bg-green-500 text-white text-xs">
                              ✓ Helpful
                            </Badge>
                          )}
                          {comment.ai_highlighted && (
                            <Badge className="bg-yellow-500 text-white text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your support or advice..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={isCommenting || !commentText.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CommunityFeed() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  const [newPost, setNewPost] = useState({
    post_type: 'experience',
    category: 'general_wellness',
    title: '',
    content: '',
    is_anonymous: true,
    tags: []
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: pregnancyData } = useQuery({
    queryKey: ['pregnancy-tracking'],
    queryFn: async () => {
      const data = await base44.entities.PregnancyTracking.list();
      return data[0];
    }
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['womens-health-posts', filterCategory, sortBy],
    queryFn: async () => {
      let allPosts = await base44.entities.WomensHealthPost.list('-created_date');
      
      // Filter by category
      if (filterCategory !== 'all') {
        allPosts = allPosts.filter(p => p.category === filterCategory);
      }
      
      // Sort
      if (sortBy === 'popular') {
        allPosts.sort((a, b) => {
          const aTotal = Object.values(a.support_reactions || {}).reduce((sum, val) => sum + val, 0);
          const bTotal = Object.values(b.support_reactions || {}).reduce((sum, val) => sum + val, 0);
          return bTotal - aTotal;
        });
      } else if (sortBy === 'ai_featured') {
        allPosts = allPosts.filter(p => p.ai_highlighted);
      }
      
      return allPosts;
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      // Add current pregnancy/postpartum week if applicable
      const enrichedData = {
        ...postData,
        author_name: postData.is_anonymous ? 'Anonymous' : user?.full_name,
        author_avatar: postData.is_anonymous ? null : user?.avatar_url,
        pregnancy_week: pregnancyData?.pregnancy_status === 'pregnant' ? pregnancyData.current_week : null,
        postpartum_week: pregnancyData?.pregnancy_status === 'postpartum' ? pregnancyData.postpartum_weeks : null,
        last_activity_date: new Date().toISOString()
      };

      return await base44.entities.WomensHealthPost.create(enrichedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['womens-health-posts'] });
      setShowCreatePost(false);
      setNewPost({
        post_type: 'experience',
        category: 'general_wellness',
        title: '',
        content: '',
        is_anonymous: true,
        tags: []
      });
      toast.success('✅ Post shared with the community!');
    },
    onError: (error) => {
      toast.error('Failed to create post: ' + error.message);
    }
  });

  const reactMutation = useMutation({
    mutationFn: async ({ postId, reactionType }) => {
      const existing = await base44.entities.WomensHealthReaction.filter({
        post_id: postId,
        created_by: user?.email,
        reaction_type: reactionType
      });

      if (existing.length > 0) {
        // Remove reaction
        await base44.entities.WomensHealthReaction.delete(existing[0].id);
        
        // Update post count
        const post = posts.find(p => p.id === postId);
        if (post) {
          const newCount = Math.max(0, (post.support_reactions?.[reactionType] || 0) - 1);
          await base44.entities.WomensHealthPost.update(postId, {
            support_reactions: {
              ...post.support_reactions,
              [reactionType]: newCount
            }
          });
        }
      } else {
        // Add reaction
        await base44.entities.WomensHealthReaction.create({
          post_id: postId,
          reaction_type: reactionType,
          user_name: user?.full_name
        });

        // Update post count
        const post = posts.find(p => p.id === postId);
        if (post) {
          const newCount = (post.support_reactions?.[reactionType] || 0) + 1;
          await base44.entities.WomensHealthPost.update(postId, {
            support_reactions: {
              ...post.support_reactions,
              [reactionType]: newCount
            }
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['womens-health-posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-womens-health-reactions'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      const comment = await base44.entities.WomensHealthComment.create({
        post_id: postId,
        content,
        author_name: user?.full_name || 'Anonymous',
        author_avatar: user?.avatar_url,
        is_anonymous: true,
        pregnancy_week: pregnancyData?.pregnancy_status === 'pregnant' ? pregnancyData.current_week : null,
        postpartum_week: pregnancyData?.pregnancy_status === 'postpartum' ? pregnancyData.postpartum_weeks : null
      });

      // Update comment count
      const post = posts.find(p => p.id === postId);
      if (post) {
        await base44.entities.WomensHealthPost.update(postId, {
          comment_count: (post.comment_count || 0) + 1,
          last_activity_date: new Date().toISOString()
        });
      }

      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['womens-health-posts'] });
      queryClient.invalidateQueries({ queryKey: ['womens-health-comments'] });
    }
  });

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'trying_to_conceive', label: 'Trying to Conceive', icon: '💕' },
    { value: 'pregnancy_first_trimester', label: '1st Trimester', icon: '🌱' },
    { value: 'pregnancy_second_trimester', label: '2nd Trimester', icon: '🌸' },
    { value: 'pregnancy_third_trimester', label: '3rd Trimester', icon: '🌺' },
    { value: 'postpartum', label: 'Postpartum', icon: '👶' },
    { value: 'breastfeeding', label: 'Breastfeeding', icon: '🤱' },
    { value: 'baby_care', label: 'Baby Care', icon: '🍼' },
    { value: 'cycle_health', label: 'Cycle Health', icon: '📅' },
    { value: 'fertility', label: 'Fertility', icon: '🌿' },
    { value: 'pregnancy_loss', label: 'Pregnancy Loss', icon: '💜' },
    { value: 'general_wellness', label: 'General Wellness', icon: '✨' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            Women's Health Community
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Connect, share experiences, and support each other
          </p>
        </div>
        <Button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Create Post Form */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Share with the Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Post Type</Label>
                    <Select
                      value={newPost.post_type}
                      onValueChange={(val) => setNewPost(prev => ({ ...prev, post_type: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">❓ Question</SelectItem>
                        <SelectItem value="experience">📖 Experience</SelectItem>
                        <SelectItem value="milestone">🎉 Milestone</SelectItem>
                        <SelectItem value="support_needed">💜 Support Needed</SelectItem>
                        <SelectItem value="advice">💡 Advice</SelectItem>
                        <SelectItem value="celebration">🎊 Celebration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newPost.category}
                      onValueChange={(val) => setNewPost(prev => ({ ...prev, category: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.value !== 'all').map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What would you like to share?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Your Story</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your experience, ask a question, or offer support..."
                    className="h-32 mt-1"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <Label className="text-sm text-purple-900 cursor-pointer" htmlFor="anonymous">
                    Post anonymously for privacy
                  </Label>
                  <input
                    id="anonymous"
                    type="checkbox"
                    checked={newPost.is_anonymous}
                    onChange={(e) => setNewPost(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="ml-auto"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createPostMutation.mutate(newPost)}
                    disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {createPostMutation.isPending ? 'Posting...' : 'Share Post'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.icon && `${cat.icon} `}{cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="ai_featured">AI Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Coach Banner */}
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900 mb-1">AI Health Coach Monitoring</p>
              <p className="text-sm text-yellow-800">
                Our AI coach reviews posts to highlight helpful advice, ensure safety, and may join discussions 
                to provide evidence-based guidance. Posts with <Badge className="inline-flex items-center bg-yellow-500 text-white text-xs mx-1"><Sparkles className="w-3 h-3 mr-1" />AI Featured</Badge> badges contain particularly valuable information!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Loading community posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
              <p className="text-gray-600 mb-4">
                Be the first to share your experience with the community!
              </p>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.1 }}
              >
                <PostCard
                  post={post}
                  onReact={(postId, reactionType) => reactMutation.mutate({ postId, reactionType })}
                  onComment={(postId, content) => commentMutation.mutate({ postId, content })}
                  currentUser={user}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Community Guidelines */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Community Guidelines
          </h3>
          <div className="space-y-2 text-sm text-purple-800">
            <p>✨ Be kind, supportive, and respectful</p>
            <p>💜 Share your authentic experiences</p>
            <p>🤝 Offer empathy and understanding</p>
            <p>🔒 Respect privacy - use anonymous posting when sharing sensitive topics</p>
            <p>⚕️ Share experiences, not medical diagnoses</p>
            <p>🚫 No judgment, no shaming, no unsolicited advice</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}