import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Tag,
  Eye,
  EyeOff,
  Sparkles,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CreateForumPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const categories = [
    { id: 'grief', name: 'Grief & Loss Support', color: 'rose' },
    { id: 'family', name: 'Family Coordination', color: 'purple' },
    { id: 'productivity', name: 'Productivity & Organization', color: 'blue' },
    { id: 'mental-health', name: 'Mental Health & Wellness', color: 'green' },
    { id: 'parenting', name: 'Parenting & Kids', color: 'yellow' },
    { id: 'success', name: 'Success Stories', color: 'amber' },
  ];

  // Generate AI suggestions for tags and content improvement
  const generateAISuggestions = async () => {
    if (!title || !content) return;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this forum post, suggest 3-5 relevant tags and a brief content improvement tip:
        
Title: ${title}
Content: ${content}

Return a JSON object with:
- tags: array of 3-5 relevant tags
- tip: one sentence to improve the post`,
        response_json_schema: {
          type: "object",
          properties: {
            tags: { type: "array", items: { type: "string" } },
            tip: { type: "string" }
          }
        }
      });

      setAiSuggestions(response);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !selectedCategory) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // AI Moderation check
      const moderationResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this forum post for safety and appropriateness:

Title: ${title}
Content: ${content}

Check for:
- Harmful content
- Personal information
- Inappropriate language
- Spam

Return a safety score from 0 (unsafe) to 1 (safe) and brief notes.`,
        response_json_schema: {
          type: "object",
          properties: {
            safety_score: { type: "number" },
            notes: { type: "string" },
            is_safe: { type: "boolean" }
          }
        }
      });

      // Create the post
      const newPost = await base44.entities.ForumPost.create({
        category_id: selectedCategory,
        title: title.trim(),
        content: content.trim(),
        author_name: isAnonymous ? 'Anonymous' : user.full_name,
        author_avatar: isAnonymous ? null : user.avatar_url,
        is_anonymous: isAnonymous,
        tags: tags,
        status: moderationResponse.is_safe ? 'approved' : 'pending',
        ai_moderation_score: moderationResponse.safety_score,
        ai_moderation_notes: moderationResponse.notes,
        last_activity_date: new Date().toISOString(),
        view_count: 0,
        comment_count: 0,
        like_count: 0
      });

      // Update category post count
      queryClient.invalidateQueries(['forumCategories']);
      queryClient.invalidateQueries(['forumPosts']);

      if (moderationResponse.is_safe) {
        toast.success('Post created successfully!');
        navigate(createPageUrl(`ForumPost?id=${newPost.id}`));
      } else {
        toast.info('Your post is under review and will be published once approved.');
        navigate(createPageUrl('CommunityForum'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('CommunityForum'))}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Post
              </h1>
              <p className="text-gray-600 text-sm">
                Share your thoughts with the community
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Fill in the details below to create your discussion post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCategory === category.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{category.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="What's on your mind?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/150 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length} characters
                </p>
              </div>

              {/* AI Suggestions */}
              {title && content && (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateAISuggestions}
                    className="mb-3"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Suggestions
                  </Button>

                  {aiSuggestions.tags && (
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-purple-900 mb-2">
                            Suggested Tags:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestions.tags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-purple-100"
                                onClick={() => {
                                  if (!tags.includes(tag)) {
                                    setTags([...tags, tag]);
                                  }
                                }}
                              >
                                + {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {aiSuggestions.tip && (
                          <div>
                            <p className="text-sm font-semibold text-purple-900 mb-1">
                              💡 Tip:
                            </p>
                            <p className="text-sm text-purple-800">{aiSuggestions.tip}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <label
                  htmlFor="anonymous"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  {isAnonymous ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                  Post anonymously
                </label>
              </div>

              {/* AI Moderation Notice */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">AI Moderation</p>
                      <p>
                        Your post will be automatically reviewed by AI for safety and community
                        guidelines. Most posts are approved instantly!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl('CommunityForum'))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title || !content || !selectedCategory}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Post
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}