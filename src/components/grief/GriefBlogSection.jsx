
import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Clock, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '@/components/Translations';

export default function GriefBlogSection({ limit = 3, showHeader = true }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { t } = useTranslation(user);

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['griefBlogPosts', limit],
    queryFn: async () => {
      const posts = await base44.entities.BlogPost.filter(
        { status: 'published', category: 'Grief & Loss' },
        '-publish_date',
        limit
      );
      return posts;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <BookOpen className="w-8 h-8 text-purple-500 animate-pulse" />
      </div>
    );
  }

  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" />
              {t('dashboard.healingWritings')}
            </h2>
            <p className="text-gray-600 mt-1">{t('dashboard.healingWritingsDesc')}</p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link to={createPageUrl('Blog')}>
              {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={createPageUrl(`BlogPost?slug=${post.slug || post.id}`)}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
                {post.featured_image_url && (
                  <div 
                    className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url('${post.featured_image_url}')` }}
                  />
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-0">
                      <Heart className="w-3 h-3 mr-1" />
                      {post.category}
                    </Badge>
                    {post.read_time_minutes && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time_minutes} min
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {post.author_image_url && (
                        <img 
                          src={post.author_image_url} 
                          alt={post.author_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{post.author_name}</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.publish_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-rose-300 group-hover:text-rose-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {showHeader && (
        <div className="text-center md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link to={createPageUrl('Blog')}>
              {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
