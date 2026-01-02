
import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: post, isLoading } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      if (!slug) return null;
      const posts = await base44.entities.BlogPost.filter({ slug, status: 'published' });
      if (posts.length > 0) {
        await base44.entities.BlogPost.update(posts[0].id, {
          views_count: (posts[0].views_count || 0) + 1
        });
        return posts[0];
      }
      const postById = await base44.entities.BlogPost.get(slug);
      if (postById) {
        await base44.entities.BlogPost.update(postById.id, {
          views_count: (postById.views_count || 0) + 1
        });
      }
      return postById;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to={createPageUrl('Blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button asChild variant="ghost" className="mb-8">
            <Link to={createPageUrl('Blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Writings
            </Link>
          </Button>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            {post.featured_image_url && (
              <div 
                className="h-96 bg-cover bg-center"
                style={{ backgroundImage: `url('${post.featured_image_url}')` }}
              />
            )}

            <CardContent className="p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-0">
                  <Heart className="w-3 h-3 mr-1" />
                  {post.category}
                </Badge>
                {post.tags && post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  {post.author_image_url && (
                    <img 
                      src={post.author_image_url} 
                      alt={post.author_name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{post.author_name}</p>
                    {post.author_bio && (
                      <p className="text-sm text-gray-600">{post.author_bio}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(post.publish_date), 'MMMM d, yyyy')}
                      </span>
                      {post.read_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.read_time_minutes} min read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg prose-rose max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-900">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 ml-6 list-disc text-gray-700">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal text-gray-700">{children}</ol>,
                    li: ({ children }) => <li className="mb-2">{children}</li>,
                    a: ({ children, href }) => (
                      <a href={href} className="text-rose-600 hover:text-rose-700 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-rose-400 pl-6 my-6 italic text-gray-700">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to={createPageUrl('Blog')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Read More Healing Writings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Copyright Notice */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 border-t border-gray-200">
        <p className="text-center text-sm opacity-80 text-gray-600">
          © 2025 Ruby Dobry — Creative works on this site are artistic expressions and not legal statements. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
