import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, ThumbsUp, CheckCircle, Send, Loader2,
  ChevronRight, ChevronDown, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function DiscussionThread({ discussion, onClose }) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ['discussionReplies', discussion.id],
    queryFn: () => base44.entities.StudyDiscussionReply.filter({ discussion_id: discussion.id }, '-created_date'),
    initialData: []
  });

  const postReplyMutation = useMutation({
    mutationFn: async (content) => {
      if (!user?.email) throw new Error('Please log in to reply');
      
      return await base44.entities.StudyDiscussionReply.create({
        discussion_id: discussion.id,
        content,
        author_email: user.email,
        author_name: user.full_name || user.email.split('@')[0],
        author_avatar: user.avatar_url || '',
        is_solution: false,
        helpful_count: 0
      });
    },
    onSuccess: async () => {
      await base44.entities.StudyDiscussion.update(discussion.id, {
        reply_count: (discussion.reply_count || 0) + 1
      });
      queryClient.invalidateQueries({ queryKey: ['discussionReplies', discussion.id] });
      queryClient.invalidateQueries({ queryKey: ['materialDiscussions'] });
      setReplyText('');
      toast.success('💬 Reply posted!');
    },
    onError: () => {
      toast.error('Failed to post reply');
    }
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (replyId) => {
      const reply = replies.find(r => r.id === replyId);
      return await base44.entities.StudyDiscussionReply.update(replyId, {
        helpful_count: (reply.helpful_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionReplies', discussion.id] });
      toast.success('👍 Marked as helpful!');
    }
  });

  const markResolvedMutation = useMutation({
    mutationFn: async (replyId) => {
      await base44.entities.StudyDiscussionReply.update(replyId, { is_solution: true });
      await base44.entities.StudyDiscussion.update(discussion.id, {
        is_resolved: true,
        resolved_by: user.email,
        resolved_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussionReplies', discussion.id] });
      queryClient.invalidateQueries({ queryKey: ['materialDiscussions'] });
      toast.success('✅ Marked as solution!');
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-300"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 z-10 rounded-t-3xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20">
                  {discussion.discussion_type}
                </Badge>
                {discussion.is_resolved && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolved
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-1">{discussion.title}</h2>
              <p className="text-purple-100 text-sm">
                by {discussion.author_name} • {discussion.reply_count || 0} replies
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Original Question */}
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                  {discussion.author_name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{discussion.author_name}</p>
                  <p className="text-xs text-gray-500">
                    {discussion.specific_page && `Page ${discussion.specific_page} • `}
                    {discussion.topic}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{discussion.content}</p>
            </CardContent>
          </Card>

          {/* Replies Section */}
          <div>
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2 text-gray-700 font-semibold mb-4 hover:text-purple-600 transition-colors"
            >
              {showReplies ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <span>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</span>
            </button>

            <AnimatePresence>
              {showReplies && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Loading replies...</p>
                    </div>
                  ) : replies.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No replies yet. Be the first to help!</p>
                    </div>
                  ) : (
                    replies.map((reply, idx) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={`border-2 ${reply.is_solution ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {reply.author_name?.[0] || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 text-sm">{reply.author_name}</p>
                                  {reply.is_solution && (
                                    <Badge className="bg-green-600 text-white">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Solution
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(reply.created_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{reply.content}</p>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => markHelpfulMutation.mutate(reply.id)}
                                variant="outline"
                                size="sm"
                                className="border-blue-300 hover:bg-blue-50"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Helpful ({reply.helpful_count || 0})
                              </Button>
                              
                              {discussion.author_email === user?.email && !discussion.is_resolved && (
                                <Button
                                  onClick={() => markResolvedMutation.mutate(reply.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-green-300 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark as Solution
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reply Form */}
          <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <p className="font-semibold text-gray-900">Post a Reply</p>
              </div>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Share your knowledge or ask for clarification..."
                rows={4}
                className="mb-3 border-2 border-indigo-200 focus:border-indigo-400"
              />
              <Button
                onClick={() => postReplyMutation.mutate(replyText)}
                disabled={!replyText.trim() || postReplyMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white touch-manipulation"
              >
                {postReplyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Reply
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}