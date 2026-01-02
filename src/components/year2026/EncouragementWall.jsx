import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Sparkles, Award, Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function EncouragementWall({ user }) {
  const [newEncouragement, setNewEncouragement] = useState('');
  const queryClient = useQueryClient();

  const { data: encouragements = [] } = useQuery({
    queryKey: ['2026Encouragements'],
    queryFn: async () => {
      const posts = await base44.entities.ContentPost.filter(
        { post_type: 'encouragement', tags: { $contains: '2026' } },
        '-created_date',
        50
      );
      return posts;
    },
    initialData: []
  });

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      return await base44.entities.ContentPost.create({
        title: 'Encouragement',
        content,
        post_type: 'encouragement',
        visibility: 'public',
        tags: ['2026', 'encouragement']
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['2026Encouragements']);
      setNewEncouragement('');
      toast.success('Encouragement sent! 💖');
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
      queryClient.invalidateQueries(['2026Encouragements']);
    }
  });

  const encouragementTemplates = [
    { emoji: '💪', text: "You've got this! One day at a time!" },
    { emoji: '🌟', text: "Your progress is inspiring! Keep shining!" },
    { emoji: '🔥', text: "That streak is amazing! Stay consistent!" },
    { emoji: '🎯', text: "Focus on progress, not perfection!" },
    { emoji: '✨', text: "Small steps lead to big changes!" },
    { emoji: '💖', text: "Proud of you for showing up today!" }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Send Encouragement Panel */}
      <Card className="lg:col-span-1 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Heart className="w-5 h-5" />
            Send Encouragement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-green-800 mb-3">Quick templates:</p>
            {encouragementTemplates.map((template, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setNewEncouragement(template.text)}
                className="w-full p-3 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 transition-all text-left"
              >
                <span className="text-2xl mr-2">{template.emoji}</span>
                <span className="text-sm text-gray-700">{template.text}</span>
              </motion.button>
            ))}
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="Write your own encouraging message..."
              value={newEncouragement}
              onChange={(e) => setNewEncouragement(e.target.value)}
              rows={4}
              className="border-2 border-green-300"
            />
            <Button
              onClick={() => {
                if (newEncouragement) {
                  sendMutation.mutate(newEncouragement);
                }
              }}
              disabled={!newEncouragement || sendMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Community
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Encouragement Wall */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Sparkles className="w-5 h-5" />
              Community Encouragement Wall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence>
                {encouragements.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                  >
                    <div className="bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-xl p-4 border-2 border-purple-300 shadow-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {post.created_by?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 leading-relaxed">
                            {post.content}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                        <button
                          onClick={() => likeMutation.mutate(post.id)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="font-semibold">{post.likes_count || 0}</span>
                        </button>
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {encouragements.length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">No messages yet</h3>
                <p className="text-gray-500 text-sm">Be the first to spread some encouragement!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-4 border-2 border-orange-300"
          >
            <Flame className="w-8 h-8 text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-900">{encouragements.length}</div>
            <div className="text-xs text-orange-700">Messages Sent</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300"
          >
            <Heart className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {encouragements.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
            </div>
            <div className="text-xs text-purple-700">Hearts Given</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300"
          >
            <Award className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {new Set(encouragements.map(p => p.created_by)).size}
            </div>
            <div className="text-xs text-green-700">Active Supporters</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}