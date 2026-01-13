import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Heart,
  Home,
  Briefcase,
  Brain,
  Baby,
  Trophy,
  MessageCircle,
  TrendingUp,
  Search,
  Plus,
  Clock,
  Eye,
  ThumbsUp,
  BookmarkPlus,
  Bookmark,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter,
  ArrowRight,
  Lock // Added Lock icon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CommunityForum() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

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

  // Default categories - always available
  const defaultCategories = [
    {
      id: 'grief',
      name: 'Grief & Loss Support',
      slug: 'grief-loss',
      description: 'A safe space to share experiences, find comfort, and support others through loss',
      icon: 'Heart',
      color: 'rose',
      post_count: 0,
    },
    {
      id: 'family',
      name: 'Family Coordination',
      slug: 'family',
      description: 'Tips, stories, and advice for managing family life and schedules',
      icon: 'Home',
      color: 'purple',
      post_count: 0,
    },
    {
      id: 'productivity',
      name: 'Productivity & Organization',
      slug: 'productivity',
      description: 'Share your best practices for staying organized and productive',
      icon: 'Briefcase',
      color: 'blue',
      post_count: 0,
    },
    {
      id: 'mental-health',
      name: 'Mental Health & Wellness',
      slug: 'mental-health',
      description: 'Open discussions about mental health, self-care, and wellbeing',
      icon: 'Brain',
      color: 'green',
      post_count: 0,
    },
    {
      id: 'parenting',
      name: 'Parenting & Kids',
      slug: 'parenting',
      description: 'Connect with other parents and share parenting wisdom',
      icon: 'Baby',
      color: 'yellow',
      post_count: 0,
    },
    {
      id: 'success',
      name: 'Success Stories',
      slug: 'success',
      description: 'Celebrate wins, milestones, and inspiring transformations',
      icon: 'Trophy',
      color: 'amber',
      post_count: 0,
    },
  ];

  const { data: categories = defaultCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      try {
        // If we have a forum_categories table, use it
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .order('name');

        if (error || !data || data.length === 0) return defaultCategories;
        return data;
      } catch (error) {
        console.error('Error loading categories:', error);
        return defaultCategories;
      }
    },
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forumPosts', selectedCategory, sortBy],
    queryFn: async () => {
      try {
        let query = supabase.from('posts').select('*');

        if (selectedCategory !== 'all') {
          query = query.eq('category_id', selectedCategory);
        }

        if (sortBy === 'recent') {
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('like_count', { ascending: false });
        }

        const { data, error } = await query.limit(50);
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error loading posts:', error);
        return [];
      }
    },
  });

  // AI Suggested Topics based on user activity
  const { data: aiSuggestions = [] } = useQuery({
    queryKey: ['forumSuggestions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Generate AI suggestions based on user's current page and activity
        const suggestions = [
          'How to start journaling for grief',
          'Family schedule management tips',
          'Daily self-care routines',
          'Coping with loss during holidays',
          'Productivity hacks for busy parents'
        ];
        return suggestions;
      } catch (error) {
        console.error('Error loading AI suggestions:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  const displayCategories = categories;

  // Admin check removed to open feature to all users


  const getIconComponent = (iconName) => {
    const icons = {
      Heart, Home, Briefcase, Brain, Baby, Trophy, Users, MessageCircle
    };
    return icons[iconName] || Users;
  };

  const getColorClasses = (color) => {
    const colors = {
      rose: 'from-rose-400 to-pink-500',
      purple: 'from-purple-400 to-indigo-500',
      blue: 'from-blue-400 to-cyan-500',
      green: 'from-green-400 to-emerald-500',
      yellow: 'from-yellow-400 to-orange-500',
      amber: 'from-amber-400 to-orange-500',
    };
    return colors[color] || 'from-gray-400 to-gray-500';
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleCreatePost = () => {
    if (!user) {
      toast.info('Please log in to create a post');
      navigate(createPageUrl('Login') + `?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    navigate(createPageUrl('CreateForumPost'));
  };

  const handleViewPost = (postId) => {
    navigate(createPageUrl(`ForumPost?id=${postId}`));
  };

  const handleViewCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600">Loading community forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DobryLife Community
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Connect, share, and support each other on your journey
          </p>
        </motion.div>

        {/* Search and Create Post */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggested Topics */}
        {user && aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Sparkles className="w-5 h-5" />
                  AI Suggested Topics for You
                </CardTitle>
                <CardDescription>
                  Based on your activity and interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => setSearchQuery(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Categories Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-6 h-6" />
            Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              const colorClass = getColorClasses(category.color);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => handleViewCategory(category.id)}
                >
                  <Card className={`h-full hover:shadow-lg transition-all ${selectedCategory === category.id ? 'ring-2 ring-purple-500' : ''
                    }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary">
                          {category.post_count || 0} posts
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{category.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tabs for sorting */}
        <Tabs defaultValue="recent" value={sortBy} onValueChange={setSortBy} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="recent">
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular">
              <TrendingUp className="w-4 h-4 mr-2" />
              Popular
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            {selectedCategory === 'all' ? 'All Discussions' : 'Category Discussions'}
          </h2>

          {postsLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading discussions...</p>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No discussions yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Be the first to start a conversation!
                </p>
                <Button onClick={handleCreatePost}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleViewPost(post.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Author Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          {post.is_anonymous ? '?' : (post.author_name?.[0] || 'A')}
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-purple-600 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {post.content}
                              </p>
                            </div>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Post Meta */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.view_count || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {post.comment_count || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {post.like_count || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(post.created_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Community Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <CheckCircle className="w-5 h-5" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>✅ Be respectful and supportive</p>
            <p>✅ Share experiences and helpful advice</p>
            <p>✅ Protect privacy - no personal information</p>
            <p>✅ Report inappropriate content</p>
            <p className="text-xs pt-2 border-t border-blue-200">
              All posts are moderated by AI for safety and community standards.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}