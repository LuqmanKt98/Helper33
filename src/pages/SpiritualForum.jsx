import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Heart,
  Eye,
  Sparkles,
  TrendingUp,
  Plus,
  Filter,
  Send,
  Loader2,
  BookOpen,
  Lightbulb,
  Users,
  Pin,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  Brain
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import CommunityDiscovery from '../components/spiritual/CommunityDiscovery';

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: MessageCircle, color: 'from-purple-400 to-pink-500' },
  { id: 'meditation', label: 'Meditation', icon: Brain, color: 'from-blue-400 to-indigo-500' },
  { id: 'reading', label: 'Reading Insights', icon: BookOpen, color: 'from-emerald-400 to-teal-500' },
  { id: 'prayer', label: 'Prayer', icon: Heart, color: 'from-rose-400 to-pink-500' },
  { id: 'mindfulness', label: 'Mindfulness', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
  { id: 'philosophy', label: 'Philosophy', icon: Lightbulb, color: 'from-purple-400 to-indigo-500' },
  { id: 'practices', label: 'Practices', icon: Users, color: 'from-green-400 to-emerald-500' },
  { id: 'experiences', label: 'Experiences', icon: MessageSquare, color: 'from-cyan-400 to-blue-500' },
  { id: 'questions', label: 'Questions', icon: MessageCircle, color: 'from-pink-400 to-rose-500' },
  { id: 'inspiration', label: 'Inspiration', icon: Sparkles, color: 'from-yellow-400 to-amber-500' }
];

export default function SpiritualForum() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestedTopics, setAiSuggestedTopics] = useState(null);
  const [showCommunity, setShowCommunity] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['spiritual-forum-posts', selectedCategory],
    queryFn: async () => {
      const allPosts = await base44.entities.SpiritualForumPost.list('-created_date', 100);
      if (selectedCategory === 'all') return allPosts;
      return allPosts.filter(p => p.category === selectedCategory);
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['spiritual-forum-comments', selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost) return [];
      return await base44.entities.SpiritualForumComment.filter({ post_id: selectedPost.id }, '-created_date', 100);
    },
    enabled: !!selectedPost
  });

  const { data: userActivity } = useQuery({
    queryKey: ['user-spiritual-activity', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return {
        reading_plans: user.spiritual_reading_plans || [],
        bookmarks: user.spiritual_bookmarks || [],
        posts: posts.filter(p => p.created_by === user.email).length
      };
    },
    enabled: !!user
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      return await base44.entities.SpiritualForumPost.create({
        ...postData,
        author_name: user.full_name || user.email.split('@')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-forum-posts']);
      toast.success('🌟 Post created!');
      setShowCreatePost(false);
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      const comment = await base44.entities.SpiritualForumComment.create({
        ...commentData,
        author_name: user.full_name || user.email.split('@')[0]
      });
      
      await base44.entities.SpiritualForumPost.update(selectedPost.id, {
        comment_count: (selectedPost.comment_count || 0) + 1
      });
      
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-forum-comments']);
      queryClient.invalidateQueries(['spiritual-forum-posts']);
      toast.success('💬 Comment added!');
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (post) => {
      const likes = post.likes || [];
      const hasLiked = likes.includes(user.id);
      const updatedLikes = hasLiked 
        ? likes.filter(id => id !== user.id)
        : [...likes, user.id];
      
      return await base44.entities.SpiritualForumPost.update(post.id, { likes: updatedLikes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-forum-posts']);
    }
  });

  const generateAISuggestionsMutation = useMutation({
    mutationFn: async () => {
      const recentBooks = userActivity?.reading_plans?.map(p => p.book_id).slice(0, 3) || [];
      const recentPosts = posts.slice(0, 10).map(p => p.title).join(', ');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on user activity and popular discussions, suggest 5 engaging spiritual topics for forum discussion.

User Context:
- Recent reading: ${recentBooks.join(', ') || 'New to the community'}
- Active posts: ${user ? userActivity?.posts || 0 : 0}
- Popular topics: ${recentPosts}

Suggest topics that:
1. Are relevant to spiritual growth
2. Encourage meaningful discussion
3. Connect to current community interests
4. Are specific and actionable

For each topic provide:
- Title (engaging question or statement)
- Description (why this matters now)
- Suggested category
- Starter question to kickstart discussion`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  starter_question: { type: 'string' }
                }
              }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setAiSuggestedTopics(data);
      setShowAISuggestions(true);
      toast.success('💡 AI suggestions ready!');
    }
  });

  const generateThreadSummaryMutation = useMutation({
    mutationFn: async (post) => {
      const postComments = await base44.entities.SpiritualForumComment.filter({ post_id: post.id });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this spiritual forum discussion in 2-3 sentences.

Post: ${post.title}
Content: ${post.content}
Comments (${postComments.length}): ${postComments.map(c => c.content).join('; ')}

Create a compassionate summary highlighting:
1. Main question or topic
2. Key insights shared
3. Common themes in responses`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            key_insights: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      await base44.entities.SpiritualForumPost.update(post.id, {
        ai_summary: response.summary
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spiritual-forum-posts']);
      toast.success('✨ Summary generated!');
    }
  });

  const incrementViewCount = async (post) => {
    await base44.entities.SpiritualForumPost.update(post.id, {
      view_count: (post.view_count || 0) + 1
    });
    queryClient.invalidateQueries(['spiritual-forum-posts']);
  };

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trendingPosts = [...posts].sort((a, b) => 
    ((b.likes?.length || 0) + (b.comment_count || 0)) - ((a.likes?.length || 0) + (a.comment_count || 0))
  ).slice(0, 5);

  if (showCommunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => setShowCommunity(false)} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
          <CommunityDiscovery currentUser={user} />
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return <PostDetailView 
      post={selectedPost} 
      comments={comments}
      user={user}
      onBack={() => setSelectedPost(null)}
      onComment={(content) => createCommentMutation.mutate({ post_id: selectedPost.id, content })}
      onGenerateSummary={() => generateThreadSummaryMutation.mutate(selectedPost)}
      isGeneratingSummary={generateThreadSummaryMutation.isPending}
    />;
  }

  return (
    <>
      <SEO 
        title="Spiritual Community Forum - Connect & Share"
        description="Join our AI-powered spiritual community to discuss topics, share insights, and connect with like-minded seekers"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Spiritual Community
            </h1>
            <p className="text-gray-600">Share insights, ask questions, and grow together</p>
          </motion.div>

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
            <Button
              onClick={() => setShowCommunity(true)}
              variant="outline"
              className="border-2 border-emerald-300 text-emerald-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Discover Members
            </Button>
            <Button
              onClick={() => generateAISuggestionsMutation.mutate()}
              disabled={generateAISuggestionsMutation.isPending}
              variant="outline"
              className="border-2 border-purple-300 text-purple-700"
            >
              {generateAISuggestionsMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> AI Topic Suggestions</>
              )}
            </Button>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 border-purple-200"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                      className={`w-full justify-start text-sm ${
                        selectedCategory === cat.id 
                          ? `bg-gradient-to-r ${cat.color} text-white` 
                          : ''
                      }`}
                    >
                      <cat.icon className="w-4 h-4 mr-2" />
                      {cat.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Trending */}
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Trending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {trendingPosts.map((post) => (
                    <motion.button
                      key={post.id}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        incrementViewCount(post);
                        setSelectedPost(post);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white transition-all text-xs"
                    >
                      <p className="font-semibold text-gray-900 line-clamp-2">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-gray-500">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes?.length || 0}</span>
                        <MessageCircle className="w-3 h-3 ml-2" />
                        <span>{post.comment_count || 0}</span>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="pt-6 text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No discussions yet</p>
                    <Button
                      onClick={() => setShowCreatePost(true)}
                      className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      Start the first discussion
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    user={user}
                    delay={idx * 0.05}
                    onClick={() => {
                      incrementViewCount(post);
                      setSelectedPost(post);
                    }}
                    onLike={() => likePostMutation.mutate(post)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showCreatePost && (
            <CreatePostModal
              user={user}
              onClose={() => setShowCreatePost(false)}
              onSubmit={(data) => createPostMutation.mutate(data)}
              isSubmitting={createPostMutation.isPending}
            />
          )}
        </AnimatePresence>

        {/* AI Suggestions Modal */}
        <AnimatePresence>
          {showAISuggestions && aiSuggestedTopics && (
            <AISuggestionsModal
              suggestions={aiSuggestedTopics}
              onClose={() => setShowAISuggestions(false)}
              onSelectTopic={(topic) => {
                setShowAISuggestions(false);
                setShowCreatePost(true);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function PostCard({ post, user, delay, onClick, onLike }) {
  const category = CATEGORIES.find(c => c.id === post.category);
  const isLiked = post.likes?.includes(user?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <Card className="border-2 border-purple-200 hover:shadow-xl transition-all cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1" onClick={onClick}>
              {post.is_pinned && (
                <Badge className="mb-2 bg-amber-500 text-white">
                  <Pin className="w-3 h-3 mr-1" />
                  Pinned
                </Badge>
              )}
              <h3 className="font-bold text-lg text-gray-900 mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={`bg-gradient-to-r ${category?.color} text-white`}>
                {category?.label}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{post.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comment_count || 0}</span>
              </div>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              variant="ghost"
              size="sm"
              className={isLiked ? 'text-rose-500' : ''}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {post.likes?.length || 0}
            </Button>
          </div>

          {post.ai_summary && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                AI Summary
              </p>
              <p className="text-xs text-gray-700">{post.ai_summary}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              by <span className="font-semibold">{post.author_name}</span>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <div className="text-xs text-gray-500">
              {new Date(post.created_date).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PostDetailView({ post, comments, user, onBack, onComment, onGenerateSummary, isGeneratingSummary }) {
  const [commentText, setCommentText] = useState('');
  const category = CATEGORIES.find(c => c.id === post.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-purple-200 mb-6">
            <CardContent className="pt-6">
              <Badge className={`mb-3 bg-gradient-to-r ${category?.color} text-white`}>
                {category?.label}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  by <span className="font-semibold">{post.author_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.view_count || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes?.length || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.comment_count || 0}
                  </div>
                </div>
              </div>

              {!post.ai_summary && comments.length > 3 && (
                <Button
                  onClick={onGenerateSummary}
                  disabled={isGeneratingSummary}
                  variant="outline"
                  className="mt-4 border-2 border-blue-300"
                >
                  {isGeneratingSummary ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Brain className="w-4 h-4 mr-2" /> Generate AI Summary</>
                  )}
                </Button>
              )}

              {post.ai_summary && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Summary
                  </p>
                  <p className="text-gray-700 leading-relaxed">{post.ai_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {comments.length} {comments.length === 1 ? 'Response' : 'Responses'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              {user && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="border-2 border-purple-200"
                  />
                  <Button
                    onClick={() => {
                      if (commentText.trim()) {
                        onComment(commentText);
                        setCommentText('');
                      }
                    }}
                    disabled={!commentText.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Response
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3 pt-4 border-t">
                {comments.map((comment, idx) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                  >
                    <p className="text-gray-800 mb-3 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.author_name}</span>
                        <span>•</span>
                        <span>{new Date(comment.created_date).toLocaleDateString()}</span>
                      </div>
                      {comment.is_helpful && (
                        <Badge className="bg-emerald-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Helpful
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function CreatePostModal({ user, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'questions',
    tags: ''
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl my-8"
      >
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-2 border-purple-200"
            />

            <Textarea
              placeholder="Share your thoughts, questions, or insights..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[150px] border-2 border-purple-200"
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <Button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    variant={formData.category === cat.id ? 'default' : 'outline'}
                    className={`justify-start ${
                      formData.category === cat.id 
                        ? `bg-gradient-to-r ${cat.color} text-white` 
                        : ''
                    }`}
                  >
                    <cat.icon className="w-4 h-4 mr-2" />
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="border-2 border-purple-200"
            />

            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Post</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function AISuggestionsModal({ suggestions, onClose, onSelectTopic }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl my-8"
      >
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI-Suggested Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto">
            {suggestions.suggestions?.map((topic, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{topic.title}</h4>
                    <p className="text-sm text-gray-700 mb-3">{topic.description}</p>
                    <Badge className="mb-2 bg-purple-500 text-white">{topic.category}</Badge>
                    <p className="text-xs text-gray-600 italic mt-2">"{topic.starter_question}"</p>
                    <Button
                      onClick={() => onSelectTopic(topic)}
                      className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      Start Discussion
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}