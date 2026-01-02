
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users,
  MessageCircle,
  Lock,
  Globe,
  CheckCircle,
  Heart,
  ArrowRight,
  Plus,
  Send,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import CircleDiscovery from './CircleDiscovery';

export default function SupportCircles() {
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [activeView, setActiveView] = useState('my-circles'); // New state for tabs

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: circles = [] } = useQuery({
    queryKey: ['supportCircles'],
    queryFn: () => base44.entities.SupportCircle.list('-created_date')
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['myCircleMemberships'],
    queryFn: () => base44.entities.CircleMembership.list()
  });

  const myCircleIds = myMemberships?.map(m => m.circle_id) || [];

  return (
    <div className="space-y-6">
      {selectedCircle ? (
        <CircleView
          circle={selectedCircle}
          membership={myMemberships?.find(m => m.circle_id === selectedCircle.id)}
          onBack={() => setSelectedCircle(null)}
        />
      ) : (
        <>
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid w-full grid-cols-2 bg-white">
              <TabsTrigger value="my-circles" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                My Circles
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Discover
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-circles">
              {/* My Circles */}
              {myMemberships && myMemberships.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-pink-500" />
                    My Support Circles
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {circles
                      .filter(c => myCircleIds.includes(c.id))
                      .map((circle, idx) => (
                        <CircleCard
                          key={circle.id}
                          circle={circle}
                          membership={myMemberships.find(m => m.circle_id === circle.id)}
                          onClick={() => setSelectedCircle(circle)}
                          index={idx}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                <Card className="bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      You haven't joined any circles yet.
                    </h3>
                    <p className="text-gray-600">
                      Explore the "Discover" tab to find a community that's right for you!
                    </p>
                    <Button onClick={() => setActiveView('discover')} className="mt-4">
                      Discover Circles
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="discover">
              <CircleDiscovery user={user} setSelectedCircle={setSelectedCircle} myCircleIds={myCircleIds} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function CircleCard({ circle, membership, onClick, index }) {
  const isJoined = !!membership;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        onClick={onClick}
        className="cursor-pointer hover:shadow-xl transition-all bg-white/80 backdrop-blur-sm border-2 hover:border-purple-400"
      >
        {circle.image_url && (
          <div className="h-32 overflow-hidden rounded-t-lg">
            <img
              src={circle.image_url}
              alt={circle.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="text-xs">
              {circle.circle_type.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {circle.is_private ? (
                <>
                  <Lock className="w-3 h-3" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  Open
                </>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">{circle.name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {circle.description}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-700">
              <Users className="w-4 h-4 text-purple-500" />
              <span>{circle.member_count || 0} members</span>
            </div>

            {isJoined && (
              <Badge className="bg-green-500 text-white ml-auto">
                <CheckCircle className="w-3 h-3 mr-1" />
                Member
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CircleView({ circle, membership, onBack }) {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');

  const queryClient = useQueryClient();
  const isJoined = !!membership;

  const { data: posts = [] } = useQuery({
    queryKey: ['circlePosts', circle.id],
    queryFn: () => base44.entities.CirclePost.filter({ circle_id: circle.id }, '-created_date')
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const displayName = anonymousName.trim() || `Member${Math.floor(Math.random() * 1000)}`;

      await base44.entities.CircleMembership.create({
        circle_id: circle.id,
        display_name: displayName,
        is_anonymous: true,
        joined_date: new Date().toISOString().split('T')[0]
      });

      await base44.entities.SupportCircle.update(circle.id, {
        member_count: (circle.member_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myCircleMemberships']);
      queryClient.invalidateQueries(['supportCircles']);
      toast.success('Welcome to the circle! 💜');
      setShowJoinForm(false);
    }
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CirclePost.create({
        circle_id: circle.id,
        author_display_name: membership.display_name,
        is_anonymous: membership.is_anonymous,
        title: newPostTitle,
        content: newPostContent,
        post_type: 'general'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['circlePosts', circle.id]); // Invalidate specific circle's posts
      setNewPostContent('');
      setNewPostTitle('');
      toast.success('Post shared! 💬');
    }
  });

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to Circles
      </Button>

      <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{circle.name}</h1>
              <p className="text-purple-100 mb-4">{circle.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{circle.member_count || 0} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{posts.length} posts</span>
                </div>
              </div>
            </div>

            {!isJoined && (
              <Button
                onClick={() => setShowJoinForm(true)}
                variant="secondary"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Join Circle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showJoinForm && !isJoined && (
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <CardTitle>Join This Circle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={anonymousName}
              onChange={(e) => setAnonymousName(e.target.value)}
              placeholder="Choose a display name..."
            />
            <p className="text-xs text-gray-500">
              Your display name will be visible to circle members
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isLoading}
                className="flex-1 bg-purple-600"
              >
                Join Circle
              </Button>
              <Button onClick={() => setShowJoinForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isJoined && (
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="text-lg">Share with the Circle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Post title (optional)..."
            />
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your thoughts, ask a question, or offer support..."
              rows={4}
            />
            <Button
              onClick={() => postMutation.mutate()}
              disabled={!newPostContent.trim() || postMutation.isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Post to Circle
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, idx) => (
          <CirclePostCard key={post.id} post={post} index={idx} />
        ))}

        {posts.length === 0 && isJoined && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-gray-700">
                Be the first to post in this circle!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CirclePostCard({ post, index }) {
  const [showComments, setShowComments] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['circleComments', post.id],
    queryFn: () => base44.entities.CircleComment.filter({ post_id: post.id }),
    enabled: showComments
  });

  const reactions = post.support_reactions || { hearts: 0, hugs: 0, strength: 0, relate: 0, helpful: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
              {post.author_display_name[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{post.author_display_name}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(post.created_date), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>

          {post.title && (
            <h4 className="font-bold text-gray-900 mb-2">{post.title}</h4>
          )}
          <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          <div className="flex items-center gap-6 text-sm">
            <button className="flex items-center gap-1 text-gray-600 hover:text-pink-600">
              <Heart className="w-4 h-4" />
              <span>{reactions.hearts || 0}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600">
              🤗 <span>{reactions.hugs || 0}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              💪 <span>{reactions.strength || 0}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 ml-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count || 0}</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4 pt-4 border-t space-y-2">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-sm text-gray-900 mb-1">
                    {comment.author_display_name}
                  </p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
