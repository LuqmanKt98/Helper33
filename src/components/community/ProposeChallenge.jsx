import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Send,
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProposeChallenge({ user, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎯',
    color_theme: 'from-purple-500 to-blue-500',
    duration_days: 30,
    goal_description: '',
    goal_value: 30,
    category: 'wellness',
    difficulty_level: 'beginner'
  });

  const [aiCheckStatus, setAiCheckStatus] = useState(null);
  const queryClient = useQueryClient();

  const categories = [
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'mindfulness', label: 'Mindfulness', icon: '🧠' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
    { id: 'creativity', label: 'Creativity', icon: '🎨' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'other', label: 'Other', icon: '✨' }
  ];

  const colorThemes = [
    { id: 'from-purple-500 to-blue-500', label: 'Purple-Blue' },
    { id: 'from-pink-500 to-rose-500', label: 'Pink-Rose' },
    { id: 'from-green-500 to-emerald-500', label: 'Green-Emerald' },
    { id: 'from-orange-500 to-red-500', label: 'Orange-Red' },
    { id: 'from-yellow-500 to-amber-500', label: 'Yellow-Amber' },
    { id: 'from-indigo-500 to-purple-500', label: 'Indigo-Purple' }
  ];

  const popularIcons = ['🎯', '💪', '🧘', '📚', '🎨', '🌟', '💜', '🔥', '🚀', '⭐', '🌈', '💫'];

  const submitProposalMutation = useMutation({
    mutationFn: async (proposalData) => {
      // AI moderation check
      setAiCheckStatus('checking');
      
      const moderationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Review this community challenge proposal for safety and appropriateness:

Title: ${proposalData.title}
Description: ${proposalData.description}
Goal: ${proposalData.goal_description}

Check for:
1. Harmful or dangerous activities
2. Inappropriate content
3. Spam or promotional intent
4. Unrealistic or potentially harmful goals
5. Positive community value

Return JSON with is_safe (boolean), severity ("safe" | "warning" | "blocked"), and reason (string).`,
        response_json_schema: {
          type: "object",
          properties: {
            is_safe: { type: "boolean" },
            severity: { type: "string" },
            reason: { type: "string" }
          }
        }
      });

      setAiCheckStatus(moderationResult.severity);

      if (moderationResult.severity === 'blocked') {
        toast.error(`Challenge cannot be submitted: ${moderationResult.reason}`);
        throw new Error('Content blocked');
      }

      // Create proposal
      return base44.entities.ChallengeProposal.create({
        ...proposalData,
        proposer_name: user.preferred_name || user.full_name,
        proposer_email: user.email,
        status: 'pending_review',
        ai_moderation_result: moderationResult
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challengeProposals']);
      toast.success('🎉 Challenge submitted for review! Admins will review it soon.');
      onClose();
    }
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.goal_description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitProposalMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Propose a Community Challenge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* AI Moderation Notice */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">🛡️ Admin Review Required</p>
                <p className="text-xs text-blue-800">Your challenge will be reviewed by admins and AI for safety before going live.</p>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Challenge Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="30 Days of Gratitude"
              className="border-2 border-purple-200"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Write down 3 things you're grateful for every day for 30 days. Build a positive mindset and appreciate life's blessings!"
              className="min-h-24 border-2 border-purple-200"
            />
          </div>

          {/* Goal Description */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Goal <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.goal_description}
              onChange={(e) => setFormData({...formData, goal_description: e.target.value})}
              placeholder="Complete 30 days of gratitude journaling"
              className="border-2 border-purple-200"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Choose an Icon
            </Label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {popularIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormData({...formData, icon})}
                  className={`text-3xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                    formData.icon === icon 
                      ? 'border-purple-500 bg-purple-100 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Color Theme
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colorThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({...formData, color_theme: theme.id})}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.color_theme === theme.id 
                      ? 'border-purple-500 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className={`h-8 rounded bg-gradient-to-r ${theme.id} mb-1`} />
                  <p className="text-xs font-semibold text-gray-700">{theme.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 border-2 border-purple-200 rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Duration (days)
              </Label>
              <Input
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value) || 30})}
                min="1"
                max="365"
                className="border-2 border-purple-200"
              />
            </div>

            {/* Goal Value */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Goal Value
              </Label>
              <Input
                type="number"
                value={formData.goal_value}
                onChange={(e) => setFormData({...formData, goal_value: parseInt(e.target.value) || 30})}
                min="1"
                className="border-2 border-purple-200"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Difficulty Level</Label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <Button
                  key={level}
                  onClick={() => setFormData({...formData, difficulty_level: level})}
                  variant={formData.difficulty_level === level ? 'default' : 'outline'}
                  className={`capitalize ${
                    formData.difficulty_level === level 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                      : 'border-2 border-purple-200'
                  }`}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* AI Check Status */}
          {aiCheckStatus === 'checking' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-blue-900">AI is reviewing your challenge...</p>
              </div>
            </motion.div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={submitProposalMutation.isPending}
            >
              {submitProposalMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>

          {/* Info Notice */}
          <div className="text-xs text-center text-gray-600 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              Your challenge will be reviewed within 24-48 hours
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}