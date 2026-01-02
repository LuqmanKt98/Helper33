import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PostCard({ post, user, onLike }) {
  const navigate = useNavigate();
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const moods = {
    celebrating: { label: '🎉 Celebrating', color: 'from-yellow-400 to-orange-500' },
    grateful: { label: '🙏 Grateful', color: 'from-green-400 to-emerald-500' },
    inspired: { label: '✨ Inspired', color: 'from-purple-400 to-pink-500' },
    peaceful: { label: '🕊️ Peaceful', color: 'from-blue-400 to-cyan-500' },
    motivated: { label: '💪 Motivated', color: 'from-red-400 to-orange-500' },
    creative: { label: '🎨 Creative', color: 'from-indigo-400 to-purple-500' },
  };

  const handleLikeClick = async () => {
    if (!user) {
      toast.info('Please log in to like posts');
      return;
    }
    
    setHasLiked(!hasLiked);
    if (onLike) {
      await onLike(post);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-xl transition-all">
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(createPageUrl(`UserProfile?email=${post.created_by}`))}
            >
              <Avatar className="ring-2 ring-purple-200">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold hover:text-purple-600 transition-colors">
                  {post.author_name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(post.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Mood Badge */}
          {post.mood && moods[post.mood] && (
            <Badge className={`mb-3 bg-gradient-to-r ${moods[post.mood].color} text-white border-0`}>
              {moods[post.mood].label}
            </Badge>
          )}

          {/* Title */}
          {post.title && (
            <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
          )}

          {/* Content */}
          <p className="text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
              {post.media_urls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="Post media"
                  className="w-full h-48 object-cover"
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Achievement */}
          {post.content_type === 'achievement' && post.achievement_data && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{post.achievement_data.achievement_icon || '🏆'}</div>
                <div>
                  <p className="font-bold text-yellow-900">Achievement Unlocked!</p>
                  <p className="text-sm text-yellow-800">{post.achievement_data.achievement_name}</p>
                  <p className="text-xs text-yellow-700">+{post.achievement_data.achievement_points} points</p>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center gap-6 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              className={`gap-2 ${hasLiked ? 'text-pink-600' : ''}`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
              {post.like_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              {post.comment_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="w-5 h-5" />
              {post.share_count || 0}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-purple-600' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}