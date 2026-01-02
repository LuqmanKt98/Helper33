import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Heart, MessageCircle, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function GoalShareCard({ user, goals, checkIns }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: sharedPosts = [] } = useQuery({
    queryKey: ['2026SharedProgress'],
    queryFn: async () => {
      const posts = await base44.entities.ContentPost.filter(
        { post_type: '2026_progress' },
        '-created_date',
        30
      );
      return posts;
    },
    initialData: []
  });

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ContentPost.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['2026SharedProgress']);
      setSelectedGoal(null);
      setShareMessage('');
      toast.success('Progress shared! 🎉');
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const existing = await base44.entities.PostLike.filter({ 
        post_id: postId, 
        user_email: user.email 
      });
      if (existing.length > 0) {
        await base44.entities.PostLike.delete(existing[0].id);
      } else {
        await base44.entities.PostLike.create({ post_id: postId, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['2026SharedProgress']);
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      return await base44.entities.PostComment.create({
        post_id: postId,
        content,
        author_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['2026SharedProgress']);
      toast.success('Comment added! 💬');
    }
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Share Panel */}
      <Card className="lg:col-span-1 bg-white/90 backdrop-blur-sm border-2 border-purple-300 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Share2 className="w-5 h-5" />
            Share Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {goals.map(goal => (
              <motion.button
                key={goal.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGoal(goal)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedGoal?.id === goal.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{goal.goal_title}</span>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">{goal.progress_percentage}%</Badge>
                </div>
                <Progress value={goal.progress_percentage} className="h-2" />
              </motion.button>
            ))}
          </div>

          {selectedGoal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Textarea
                placeholder="Share your story, wins, or lessons learned..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={4}
                className="border-2 border-purple-300"
              />
              <Button
                onClick={() => {
                  if (shareMessage) {
                    shareMutation.mutate({
                      title: `Progress on ${selectedGoal.goal_title}`,
                      content: shareMessage,
                      post_type: '2026_progress',
                      visibility: 'public',
                      metadata: {
                        goal_id: selectedGoal.id,
                        progress: selectedGoal.progress_percentage,
                        category: selectedGoal.category
                      }
                    });
                  }
                }}
                disabled={!shareMessage || shareMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Share Progress
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Community Feed */}
      <div className="lg:col-span-2 space-y-4">
        <AnimatePresence>
          {sharedPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {post.created_by?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-800">{post.title}</h4>
                        {post.metadata?.category && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            {post.metadata.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                      
                      {post.metadata?.progress && (
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <Progress value={post.metadata.progress} className="h-2 flex-1" />
                          <span className="text-sm font-semibold text-green-600">
                            {post.metadata.progress}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => likeMutation.mutate(post.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{post.likes_count || 0} cheers</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count || 0} comments</span>
                        </button>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(post.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {sharedPosts.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
            <CardContent className="text-center py-12">
              <Share2 className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">No shared progress yet</h3>
              <p className="text-gray-500 text-sm">Be the first to share your 2026 journey!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}