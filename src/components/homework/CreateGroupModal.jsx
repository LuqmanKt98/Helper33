import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { X, Loader2, Users, Lock, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateGroupModal({ onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [formData, setFormData] = useState({
    group_name: '',
    description: '',
    subject: 'mixed',
    group_emoji: '📚',
    group_color: '#8b5cf6',
    is_private: false,
    max_members: 10
  });

  const emojis = ['📚', '🔬', '🔢', '📖', '🌍', '💻', '🎨', '🎵', '⚗️', '⚛️', '🧬', '🏛️'];
  const colors = [
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#14b8a6', label: 'Teal' }
  ];

  const createGroupMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.email) {
        throw new Error('You must be logged in to create a group.');
      }

      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      return await base44.entities.StudyGroup.create({
        ...data,
        creator_email: user.email,
        creator_name: user.full_name || user.email.split('@')[0],
        member_emails: [user.email],
        member_count: 1,
        invite_code: inviteCode,
        shared_materials: [],
        total_sessions: 0,
        total_questions_solved: 0,
        is_active: true
      });
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
      toast.success(`🎉 Study group "${newGroup.group_name}" created! Invite code: ${newGroup.invite_code}`);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create study group');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.group_name) {
      toast.error('Please enter a group name');
      return;
    }
    createGroupMutation.mutate(formData);
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
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-green-300"
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-8 h-8" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Create Study Group</h2>
              <p className="text-green-100 text-sm">Collaborate with classmates</p>
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
          {/* Group Name */}
          <div>
            <Label htmlFor="group-name" className="text-sm font-bold text-gray-700">
              Group Name *
            </Label>
            <Input
              id="group-name"
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              placeholder="e.g., Math Warriors, Chemistry Study Squad..."
              className="mt-2 border-2 border-green-200 focus:border-green-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-bold text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this group about? What will you study together?"
              rows={3}
              className="mt-2 border-2 border-green-200 focus:border-green-400"
            />
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-sm font-bold text-gray-700">
              Primary Subject
            </Label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border-2 border-green-200 rounded-lg mt-2 focus:border-green-400 focus:outline-none"
            >
              <option value="mixed">Mixed Subjects 📚</option>
              <option value="math">Math 🔢</option>
              <option value="science">Science 🔬</option>
              <option value="english">English 📖</option>
              <option value="history">History 🏛️</option>
              <option value="computer_science">Computer Science 💻</option>
              <option value="other">Other 📝</option>
            </select>
          </div>

          {/* Privacy Setting - ENHANCED */}
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-3 block">
              Group Privacy
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, is_private: false })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !formData.is_private
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-400 shadow-xl'
                    : 'bg-white border-gray-200 hover:border-blue-400'
                }`}
              >
                <Globe className={`w-8 h-8 mx-auto mb-2 ${!formData.is_private ? 'text-white' : 'text-blue-600'}`} />
                <p className={`font-bold text-sm mb-1 ${!formData.is_private ? 'text-white' : 'text-gray-700'}`}>
                  Public Group
                </p>
                <p className={`text-xs ${!formData.is_private ? 'text-blue-100' : 'text-gray-500'}`}>
                  Anyone can discover and join
                </p>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, is_private: true })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.is_private
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-400 shadow-xl'
                    : 'bg-white border-gray-200 hover:border-purple-400'
                }`}
              >
                <Lock className={`w-8 h-8 mx-auto mb-2 ${formData.is_private ? 'text-white' : 'text-purple-600'}`} />
                <p className={`font-bold text-sm mb-1 ${formData.is_private ? 'text-white' : 'text-gray-700'}`}>
                  Private Group
                </p>
                <p className={`text-xs ${formData.is_private ? 'text-purple-100' : 'text-gray-500'}`}>
                  Invite-only access
                </p>
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {formData.is_private 
                ? 'You\'ll get a unique invite code to share with friends' 
                : 'Your group will appear in the public study groups directory'}
            </p>
          </div>

          {/* Emoji Selection */}
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-2 block">
              Group Emoji
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData({ ...formData, group_emoji: emoji })}
                  className={`p-3 text-3xl rounded-xl border-2 transition-all ${
                    formData.group_emoji === emoji
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-400 shadow-xl'
                      : 'bg-white border-gray-200 hover:border-green-400'
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-2 block">
              Group Color
            </Label>
            <div className="grid grid-cols-7 gap-2">
              {colors.map((color) => (
                <motion.button
                  key={color.value}
                  type="button"
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData({ ...formData, group_color: color.value })}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    formData.group_color === color.value
                      ? 'border-gray-800 shadow-xl'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Max Members */}
          <div>
            <Label htmlFor="max-members" className="text-sm font-bold text-gray-700">
              Maximum Members
            </Label>
            <div className="flex gap-2 mt-2">
              {[5, 10, 15, 20].map((count) => (
                <Button
                  key={count}
                  type="button"
                  onClick={() => setFormData({ ...formData, max_members: count })}
                  variant={formData.max_members === count ? 'default' : 'outline'}
                  size="sm"
                  className={formData.max_members === count ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : ''}
                >
                  {count}
                </Button>
              ))}
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
              disabled={createGroupMutation.isPending}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white touch-manipulation"
            >
              {createGroupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}