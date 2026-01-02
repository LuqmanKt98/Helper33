
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import PostCard from '@/components/social/PostCard';
import {
  Filter,
  TrendingUp,
  Clock,
  Sparkles,
  Plus,
  Loader2
} from 'lucide-react';

export default function AnonymousProgressFeed({ onCreatePost }) {
  const [sortBy, setSortBy] = useState('recent');
  const [filterMood, setFilterMood] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['contentPosts', sortBy, filterMood],
    queryFn: async () => {
      let allPosts = await base44.entities.ContentPost.list('-created_date');
      
      if (filterMood !== 'all') {
        allPosts = allPosts.filter(p => p.mood === filterMood);
      }

      if (sortBy === 'popular') {
        allPosts.sort((a, b) => 
          ((b.like_count || 0) + (b.comment_count || 0)) - 
          ((a.like_count || 0) + (a.comment_count || 0))
        );
      }

      return allPosts;
    },
    enabled: !!user
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const existingLikes = await base44.entities.PostLike.filter({
        post_id: post.id,
        created_by: user.email
      });

      if (existingLikes.length > 0) {
        await base44.entities.PostLike.delete(existingLikes[0].id);
        await base44.entities.ContentPost.update(post.id, {
          like_count: Math.max(0, (post.like_count || 0) - 1)
        });
      } else {
        await base44.entities.PostLike.create({
          post_id: post.id,
          liker_name: user?.community_privacy?.is_fully_anonymous 
            ? 'Anonymous' 
            : user?.preferred_name || user?.full_name
        });
        await base44.entities.ContentPost.update(post.id, {
          like_count: (post.like_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentPosts']);
    }
  });

  const moods = [
    { id: 'all', label: 'All Posts', color: 'from-gray-400 to-gray-600' },
    { id: 'celebrating', label: '🎉 Celebrating', color: 'from-yellow-400 to-orange-500' },
    { id: 'grateful', label: '🙏 Grateful', color: 'from-green-400 to-emerald-500' },
    { id: 'inspired', label: '✨ Inspired', color: 'from-purple-400 to-pink-500' },
    { id: 'peaceful', label: '🕊️ Peaceful', color: 'from-blue-400 to-cyan-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post CTA */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card 
          className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:shadow-xl transition-all"
          onClick={onCreatePost}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                {user?.community_privacy?.is_fully_anonymous 
                  ? user?.profile_emoji || '🎭'
                  : user?.avatar_url 
                    ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                    : user?.profile_emoji || '😊'
                }
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-lg">What's on your mind?</p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <Button
                onClick={() => setSortBy('recent')}
                size="sm"
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                className={sortBy === 'recent' ? 'bg-purple-600' : ''}
              >
                <Clock className="w-4 h-4 mr-1" />
                Recent
              </Button>
              <Button
                onClick={() => setSortBy('popular')}
                size="sm"
                variant={sortBy === 'popular' ? 'default' : 'outline'}
                className={sortBy === 'popular' ? 'bg-purple-600' : ''}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Popular
              </Button>
            </div>

            {/* Mood Filter */}
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <Button
                  key={m.id}
                  onClick={() => setFilterMood(m.id)}
                  size="sm"
                  variant={filterMood === m.id ? 'default' : 'outline'}
                  className={`text-xs ${
                    filterMood === m.id 
                      ? `bg-gradient-to-r ${m.color} text-white border-0` 
                      : ''
                  }`}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="border-2 border-dashed border-purple-300">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Posts Yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share something inspiring!</p>
              <Button
                onClick={onCreatePost}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <PostCard 
                post={post} 
                user={user}
                onLike={() => likeMutation.mutate(post)}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {posts.length > 0 && posts.length % 20 === 0 && (
        <div className="text-center">
          <Button variant="outline" className="border-2 border-purple-300">
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
}
