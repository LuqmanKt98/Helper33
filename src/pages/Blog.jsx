
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, Search, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GriefBlogSection from '@/components/grief/GriefBlogSection';
import SEO from '@/components/SEO';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      // Assuming base44.entities.BlogPost provides the necessary fields like id, slug, title, excerpt, image_url, category, author_name, publish_date
      // The status: 'published' is a filter for published posts.
      // '-publish_date' implies sorting in descending order of publish_date.
      const allPosts = await base44.entities.BlogPost.filter({ status: 'published' }, '-publish_date');
      return allPosts || [];
    }
  });

  const categories = ['All', 'Grief & Loss', 'Wellness', 'Family', 'Personal Growth', 'Mental Health', 'Mindfulness', 'Parenting', 'Life Transitions', 'Stories'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Find a featured post, prioritizing one explicitly marked or just taking the first available.
  const featuredPost = posts.find(post => post.is_featured) || posts[0];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Helper33 Blog",
    "description": "Expert articles on mental wellness, grief support, mindfulness, personal growth, and therapeutic practices",
    "url": "https://www.helper33.com/blog"
  };

  return (
    <>
      <SEO
        title="Blog - Helper33 | Mental Wellness, Grief Support & Personal Growth Articles"
        description="Expert articles on mental health, grief support, mindfulness practices, wellness tips, and personal growth strategies. Evidence-based insights for your healing journey."
        keywords="mental health blog, grief support articles, wellness tips, mindfulness blog, therapy insights, personal growth, healing journey, bereavement resources"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 px-8 py-4 rounded-full shadow-lg border-2 border-white mb-6"
          >
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              The Dobry Dialogue
            </h1>
            <Sparkles className="w-6 h-6 text-pink-600" />
          </motion.div>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stories of healing, hope, and humanity — written to remind you that you're not alone.
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 relative max-w-lg mx-auto"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search posts..."
            className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-purple-400 focus:ring-purple-400 w-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 text-sm rounded-full ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </motion.div>

        {/* Featured Post */}
        {isLoading ? (
          <div className="text-center text-gray-600 py-10">Loading featured post...</div>
        ) : featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur-sm">
              <Link to={createPageUrl('blog', featuredPost.slug)}>
                <CardHeader className="relative p-0">
                  {featuredPost.image_url && (
                    <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-64 object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                    <Badge className="mb-2 bg-purple-500 hover:bg-purple-600">{featuredPost.category}</Badge>
                    <CardTitle className="text-3xl font-bold leading-tight">{featuredPost.title}</CardTitle>
                    <p className="text-sm mt-2 text-gray-200 line-clamp-2">{featuredPost.excerpt}</p>
                    <div className="flex items-center text-xs text-gray-300 mt-4 gap-4">
                      {featuredPost.author_name && (
                        <span className="flex items-center gap-1">
                          <User size={14} /> {featuredPost.author_name}
                        </span>
                      )}
                      {featuredPost.publish_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {new Date(featuredPost.publish_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          </motion.div>
        )}

        {/* All Articles Section */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">All Articles</h2>
        {isLoading ? (
          <div className="text-center text-gray-600 py-10">Loading articles...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-600 py-10">No articles found matching your criteria.</div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm">
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
                  )}
                  <CardContent className="flex-grow p-6 flex flex-col">
                    <Badge className="mb-3 self-start bg-pink-500 hover:bg-pink-600">{post.category}</Badge>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center text-xs text-gray-500 gap-4 mt-auto">
                      {post.author_name && (
                        <span className="flex items-center gap-1">
                          <User size={12} /> {post.author_name}
                        </span>
                      )}
                      {post.publish_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(post.publish_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Link to={createPageUrl('blog', post.slug)} className="mt-5 self-start">
                      <Button variant="outline" className="text-purple-600 border-purple-300 hover:bg-purple-50">
                        Read More <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Grief Blog Section - As an example of another section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <GriefBlogSection />
        </motion.div>
      </div>
    </>
  );
}
