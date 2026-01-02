import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { X, Loader2, MessageSquare, HelpCircle, Lightbulb, BookOpen, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateDiscussionModal({ material, groupId = null, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [formData, setFormData] = useState({
    discussion_type: 'question',
    title: '',
    content: '',
    topic: '',
    specific_page: ''
  });

  const discussionTypes = [
    { value: 'question', label: 'Question', icon: HelpCircle, color: 'from-blue-500 to-cyan-500', emoji: '❓' },
    { value: 'concept_clarification', label: 'Concept Help', icon: Lightbulb, color: 'from-yellow-500 to-orange-500', emoji: '💡' },
    { value: 'study_tip', label: 'Study Tip', icon: BookOpen, color: 'from-green-500 to-emerald-500', emoji: '📚' },
    { value: 'resource_share', label: 'Share Resource', icon: Users, color: 'from-purple-500 to-pink-500', emoji: '🔗' }
  ];

  const createDiscussionMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.email) throw new Error('Please log in to post');

      return await base44.entities.StudyDiscussion.create({
        material_id: material.id,
        group_id: groupId,
        discussion_type: data.discussion_type,
        title: data.title,
        content: data.content,
        author_email: user.email,
        author_name: user.full_name || user.email.split('@')[0],
        author_avatar: user.avatar_url || '',
        specific_page: data.specific_page,
        topic: data.topic || material.subject,
        is_resolved: false,
        helpful_count: 0,
        reply_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materialDiscussions'] });
      toast.success('💬 Discussion started!');
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create discussion');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    createDiscussionMutation.mutate(formData);
  };

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
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-300"
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Start Discussion</h2>
              <p className="text-purple-100 text-sm">{material.title}</p>
            </div>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Discussion Type */}
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-3 block">
              Discussion Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {discussionTypes.map((type, idx) => (
                <motion.button
                  key={type.value}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, discussion_type: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.discussion_type === type.value
                      ? `bg-gradient-to-br ${type.color} text-white border-white shadow-xl`
                      : 'bg-white border-gray-200 hover:border-purple-400'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.emoji}</div>
                  <p className={`font-semibold text-sm ${formData.discussion_type === type.value ? 'text-white' : 'text-gray-700'}`}>
                    {type.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-bold text-gray-700">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., How do I solve quadratic equations?"
              className="mt-2 border-2 border-purple-200 focus:border-purple-400"
              required
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="text-sm font-bold text-gray-700">
              Details *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Describe your question or share your knowledge..."
              rows={5}
              className="mt-2 border-2 border-purple-200 focus:border-purple-400"
              required
            />
          </div>

          {/* Optional Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic" className="text-sm font-bold text-gray-700">
                Specific Topic
              </Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Derivatives"
                className="mt-2 border-2 border-purple-200 focus:border-purple-400"
              />
            </div>
            <div>
              <Label htmlFor="page" className="text-sm font-bold text-gray-700">
                Page/Section
              </Label>
              <Input
                id="page"
                value={formData.specific_page}
                onChange={(e) => setFormData({ ...formData, specific_page: e.target.value })}
                placeholder="e.g., Page 42, Section 3.2"
                className="mt-2 border-2 border-purple-200 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-gray-300 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDiscussionMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white touch-manipulation"
            >
              {createDiscussionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Post Discussion
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}