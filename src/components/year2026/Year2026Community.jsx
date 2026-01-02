import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Heart, MessageCircle, Users, 
  Sparkles, Trophy, Send
} from 'lucide-react';
import { toast } from 'sonner';
import GoalShareCard from './GoalShareCard';
import Challenge2026Card from './Challenge2026Card';
import EncouragementWall from './EncouragementWall';

export default function Year2026Community({ user, goals, checkIns }) {
  const [activeTab, setActiveTab] = useState('share');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Community Header */}
      <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-300 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                <Users className="w-6 h-6" />
                2026 Transformation Community
              </h2>
              <p className="text-purple-700">Share your journey, inspire others, grow together</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl"
            >
              🌟
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-xl border-2 border-purple-300 shadow-lg">
          <TabsTrigger value="share" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share Progress
          </TabsTrigger>
          <TabsTrigger value="challenges" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="encouragement" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <Heart className="w-4 h-4 mr-2" />
            Encouragement
          </TabsTrigger>
          <TabsTrigger value="forums" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Forums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="share">
          <GoalShareCard user={user} goals={goals} checkIns={checkIns} />
        </TabsContent>

        <TabsContent value="challenges">
          <Challenge2026Card user={user} goals={goals} />
        </TabsContent>

        <TabsContent value="encouragement">
          <EncouragementWall user={user} />
        </TabsContent>

        <TabsContent value="forums">
          <ForumDiscussions user={user} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function ForumDiscussions({ user }) {
  const [newTopic, setNewTopic] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: forumPosts = [] } = useQuery({
    queryKey: ['2026ForumPosts'],
    queryFn: async () => {
      const posts = await base44.entities.ContentPost.filter(
        { tags: { $contains: '2026' } },
        '-created_date',
        50
      );
      return posts;
    },
    initialData: []
  });

  const createTopicMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ContentPost.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['2026ForumPosts']);
      setShowCreateDialog(false);
      setNewTopic('');
      setNewTopicContent('');
      toast.success('Topic created! 💬');
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      return await base44.entities.PostLike.create({
        post_id: postId,
        user_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['2026ForumPosts']);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              2026 Transformation Forum
            </CardTitle>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Topic
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {forumPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {post.created_by?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-800">{post.title}</h4>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">2026</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button
                            onClick={() => likeMutation.mutate(post.id)}
                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span>{post.likes_count || 0}</span>
                          </button>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {forumPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <p className="text-gray-600">No discussions yet. Start the first one!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Discussion Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              placeholder="Topic title..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <Textarea
              placeholder="Share your thoughts, questions, or experiences..."
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              rows={5}
              className="border-2 border-blue-300"
            />
            <Button
              onClick={() => {
                if (newTopic && newTopicContent) {
                  createTopicMutation.mutate({
                    title: newTopic,
                    content: newTopicContent,
                    post_type: 'discussion',
                    tags: ['2026', 'transformation'],
                    visibility: 'public'
                  });
                }
              }}
              disabled={!newTopic || !newTopicContent || createTopicMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Post Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}