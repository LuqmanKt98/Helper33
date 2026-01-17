import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image,
  Smile,
  Hash,
  Send,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePostModal({ user, onClose }) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [aiCheckStatus, setAiCheckStatus] = useState(null);
  const queryClient = useQueryClient();

  const moods = [
    { id: 'celebrating', label: '🎉 Celebrating', color: 'from-yellow-400 to-orange-500' },
    { id: 'grateful', label: '🙏 Grateful', color: 'from-green-400 to-emerald-500' },
    { id: 'inspired', label: '✨ Inspired', color: 'from-purple-400 to-pink-500' },
    { id: 'peaceful', label: '🕊️ Peaceful', color: 'from-blue-400 to-cyan-500' },
    { id: 'motivated', label: '💪 Motivated', color: 'from-red-400 to-orange-500' },
    { id: 'creative', label: '🎨 Creative', color: 'from-indigo-400 to-purple-500' },
  ];

  const moderateContent = async (text) => {
    setAiCheckStatus('checking');

    try {
      const { data: response, error } = await supabase.functions.invoke('process-ai', {
        body: {
          action: 'moderate-post',
          content: text
        }
      });

      if (error) throw error;

      setAiCheckStatus(response.severity);
      return response;
    } catch (error) {
      console.error('Moderation error:', error);
      setAiCheckStatus('safe');
      return { is_safe: true, severity: 'safe', reason: 'Auto-approved' };
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const moderationResult = await moderateContent(postData.content);

      if (moderationResult.severity === 'crisis') {
        toast.error('Your post contains crisis language. Please reach out to Crisis Hub for immediate support.', {
          duration: 8000,
          action: {
            label: 'Get Help',
            onClick: () => window.location.href = '/crisis-hub'
          }
        });
        throw new Error('Crisis content detected');
      }

      if (moderationResult.severity === 'blocked') {
        toast.error(`Post cannot be published: ${moderationResult.reason}`);
        throw new Error('Content blocked by moderation');
      }

      if (!user?.id) {
        throw new Error('You must be logged in to create a post');
      }

      const privacy = user?.community_privacy || { is_fully_anonymous: true };

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          user_id: user.id,
          author_id: user.id,
          author_name: privacy.is_fully_anonymous
            ? `${user?.profile_emoji || '🎭'} Anonymous`
            : user?.preferred_name || user?.full_name,
          author_avatar_url: privacy.is_fully_anonymous ? null : user?.avatar_url,
          is_anonymous: privacy.is_fully_anonymous,
          moderation_status: moderationResult.severity === 'warning' ? 'flagged' : 'approved',
          moderation_notes: moderationResult.reason,
          like_count: 0,
          comment_count: 0,
          share_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
      queryClient.invalidateQueries({ queryKey: ['anonymousPosts'] });
      toast.success('🎉 Your post is live!');
      onClose();
    },
    onError: (error) => {
      console.error('Post creation error:', error);
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${Date.now()}_${fileName}`;

        const { data, error } = await supabase.storage
          .from('community-posts')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('community-posts')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setMediaUrls([...mediaUrls, ...urls]);
      toast.success(`${files.length} image(s) uploaded!`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please write something to share!');
      return;
    }

    createPostMutation.mutate({
      content,
      title: title.trim() || null,
      mood: mood || null,
      tags: tags.length > 0 ? tags : null,
      media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      content_type: 'post',
      privacy_level: user?.community_privacy?.post_default_privacy || 'community'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Share with Community
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* AI Safety Notice */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg"
          >
            <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">🛡️ AI Safety Check Enabled</p>
              <p className="text-xs text-blue-800">
                Your post will be automatically checked for safety before publishing. Crisis content will be redirected to support resources.
              </p>
            </div>
          </motion.div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title (optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              className="border-2 border-purple-200 focus:border-purple-400"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What's on your mind? <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, progress, wins, or ask for support..."
              className="min-h-32 border-2 border-purple-200 focus:border-purple-400"
            />
            <p className="text-xs text-gray-500 mt-1">{content.length} characters</p>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Smile className="w-4 h-4" />
              How are you feeling?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {moods.map((m) => (
                <Button
                  key={m.id}
                  onClick={() => setMood(mood === m.id ? '' : m.id)}
                  variant={mood === m.id ? 'default' : 'outline'}
                  className={`${mood === m.id
                    ? `bg-gradient-to-r ${m.color} text-white border-0`
                    : 'border-2'
                    }`}
                  size="sm"
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="wellness, gratitude, milestone..."
                className="flex-1 border-2 border-purple-200"
              />
              <Button onClick={addTag} size="sm" variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-800 gap-1">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-purple-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Images (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="post-image-upload"
              disabled={isUploading}
            />
            <label htmlFor="post-image-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-dashed border-purple-300 hover:border-purple-400"
                disabled={isUploading}
                asChild
              >
                <div>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 mr-2" />
                      Add Images
                    </>
                  )}
                </div>
              </Button>
            </label>

            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-purple-200"
                    />
                    <button
                      onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Check Status */}
          <AnimatePresence>
            {aiCheckStatus && aiCheckStatus !== 'safe' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-3 rounded-lg border-2 ${aiCheckStatus === 'warning'
                  ? 'bg-yellow-50 border-yellow-300'
                  : aiCheckStatus === 'checking'
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-red-50 border-red-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {aiCheckStatus === 'checking' ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : aiCheckStatus === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  )}
                  <p className="text-sm font-semibold">
                    {aiCheckStatus === 'checking'
                      ? 'AI is reviewing your content...'
                      : aiCheckStatus === 'warning'
                        ? 'Content flagged for review'
                        : 'Content requires attention'
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={createPostMutation.isPending || !content.trim()}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Share Post
                </>
              )}
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
            <p>
              {user?.community_privacy?.is_fully_anonymous
                ? '🎭 Posted as anonymous • Your identity is protected'
                : '🌟 Posted with your profile • Visible to community'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}