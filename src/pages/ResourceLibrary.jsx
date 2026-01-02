import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Search,
  Star,
  Clock,
  ArrowRight,
  Heart,
  Baby,
  Brain,
  Stethoscope,
  Moon,
  Smile,
  AlertCircle,
  ThumbsUp,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function ResourceLibrary() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['educational-articles', authUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('educational_articles')
        .select('*')
        .eq('is_published', true);
      if (error) throw error;
      return data;
    }
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async (articleId) => {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const { data, error } = await supabase
        .from('educational_articles')
        .update({ helpful_count: (article.helpful_count || 0) + 1 })
        .eq('id', articleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educational-articles'] });
      toast.success('Thanks for your feedback! 💜');
    }
  });

  const trackViewMutation = useMutation({
    mutationFn: async (articleId) => {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      return await supabase
        .from('educational_articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', articleId);
    }
  });

  const categories = [
    { key: 'all', label: 'All Resources', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
    { key: 'pregnancy_stages', label: 'Pregnancy Stages', icon: Baby, color: 'from-blue-500 to-cyan-500' },
    { key: 'pregnancy_discomforts', label: 'Discomforts & Relief', icon: Heart, color: 'from-rose-500 to-pink-500' },
    { key: 'breastfeeding', label: 'Breastfeeding', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { key: 'baby_care', label: 'Baby Care', icon: Baby, color: 'from-cyan-500 to-blue-500' },
    { key: 'sleep_training', label: 'Sleep Training', icon: Moon, color: 'from-indigo-500 to-purple-500' },
    { key: 'developmental_milestones', label: 'Milestones', icon: Star, color: 'from-amber-500 to-orange-500' },
    { key: 'baby_health', label: 'Baby Health', icon: Stethoscope, color: 'from-green-500 to-emerald-500' },
    { key: 'postpartum_mental_health', label: 'Mental Health', icon: Brain, color: 'from-purple-500 to-indigo-500' },
    { key: 'nutrition', label: 'Nutrition', icon: Smile, color: 'from-emerald-500 to-green-500' }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = articles.filter(a => a.is_featured).slice(0, 3);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    trackViewMutation.mutate(article.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setSelectedArticle(null)}
            variant="outline"
            className="mb-6 bg-white/80 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              {selectedArticle.featured_image_url && (
                <div className="w-full h-64 sm:h-80 overflow-hidden rounded-t-xl">
                  <img
                    src={selectedArticle.featured_image_url}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6 sm:p-10">
                <Badge className="mb-4 capitalize bg-gradient-to-r from-purple-500 to-pink-500">
                  {selectedArticle.category.replace(/_/g, ' ')}
                </Badge>

                <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
                  {selectedArticle.title}
                </h1>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
                  {selectedArticle.reading_time_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedArticle.reading_time_minutes} min read
                    </span>
                  )}
                  {selectedArticle.view_count > 0 && (
                    <span>{selectedArticle.view_count} views</span>
                  )}
                  {selectedArticle.helpful_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-pink-500" />
                      {selectedArticle.helpful_count} found helpful
                    </span>
                  )}
                </div>

                {selectedArticle.author_name && (
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                      {selectedArticle.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {selectedArticle.author_name}
                        {selectedArticle.author_credentials && `, ${selectedArticle.author_credentials}`}
                      </p>
                      {selectedArticle.author_bio && (
                        <p className="text-sm text-gray-600">{selectedArticle.author_bio}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedArticle.key_takeaways && selectedArticle.key_takeaways.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200"
                  >
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-xl">
                      <Star className="w-6 h-6" />
                      Key Takeaways
                    </h3>
                    <ul className="space-y-3">
                      {selectedArticle.key_takeaways.map((point, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="text-blue-900 flex items-start gap-3 text-base"
                        >
                          <span className="text-blue-600 font-bold text-xl flex-shrink-0">•</span>
                          <span>{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <div className="prose prose-lg max-w-none mb-8">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                      code: ({ node, ...props }) => <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 my-4" {...props} />
                    }}
                  >
                    {selectedArticle.content}
                  </ReactMarkdown>
                </div>

                {selectedArticle.warning_signs && selectedArticle.warning_signs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg"
                  >
                    <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-xl">
                      <AlertCircle className="w-6 h-6" />
                      When to Seek Medical Help
                    </h3>
                    <ul className="space-y-2">
                      {selectedArticle.warning_signs.map((sign, idx) => (
                        <li key={idx} className="text-red-800 text-base flex items-start gap-2">
                          <span className="text-red-600 font-bold">🚨</span>
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {selectedArticle.resources && selectedArticle.resources.length > 0 && (
                  <div className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-200 mb-8">
                    <h3 className="font-bold text-purple-900 mb-4 text-xl">📚 Additional Resources</h3>
                    <div className="space-y-3">
                      {selectedArticle.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                        >
                          <div>
                            <p className="font-semibold text-purple-900 group-hover:text-purple-700">
                              {resource.title}
                            </p>
                            <p className="text-xs text-purple-600 capitalize">{resource.type}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="mb-8">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t">
                  <p className="text-sm text-gray-600">Was this article helpful?</p>
                  <Button
                    onClick={() => markHelpfulMutation.mutate(selectedArticle.id)}
                    variant="outline"
                    className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Mark as Helpful
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Resource Library
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Expert guides on pregnancy, breastfeeding, baby care, and mental health
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search articles by topic, keyword, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-base sm:text-lg bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && !searchQuery && activeCategory === 'all' && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-7 h-7 text-amber-500" />
              Featured Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article, idx) => {
                const categoryInfo = categories.find(c => c.key === article.category);
                const Icon = categoryInfo?.icon || BookOpen;
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      className="bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full group"
                      onClick={() => handleArticleClick(article)}
                    >
                      {article.featured_image_url && (
                        <div className="w-full h-48 overflow-hidden rounded-t-xl">
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <Badge className={`mb-3 self-start bg-gradient-to-r ${categoryInfo?.color || 'from-gray-500 to-gray-600'}`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {categoryInfo?.label || article.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 border-t">
                          {article.reading_time_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.reading_time_minutes} min
                            </span>
                          )}
                          {article.helpful_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-pink-500" />
                              {article.helpful_count}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            const count = articles.filter(a => cat.key === 'all' || a.category === cat.key).length;

            return (
              <motion.button
                key={cat.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                  ${activeCategory === cat.key
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Loading resources...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredArticles.map((article, idx) => {
                const categoryInfo = categories.find(c => c.key === article.category);
                const Icon = categoryInfo?.icon || BookOpen;

                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all cursor-pointer h-full flex flex-col group"
                      onClick={() => handleArticleClick(article)}
                    >
                      {article.featured_image_url && (
                        <div className="w-full h-48 overflow-hidden rounded-t-xl">
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={`bg-gradient-to-r ${categoryInfo?.color || 'from-gray-500 to-gray-600'} text-white`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {article.subcategory || categoryInfo?.label}
                          </Badge>
                          {article.difficulty_level && (
                            <Badge variant="outline" className="capitalize text-xs">
                              {article.difficulty_level}
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                          {article.summary}
                        </p>

                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{article.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {article.reading_time_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.reading_time_minutes} min
                              </span>
                            )}
                            {article.view_count > 0 && (
                              <span>{article.view_count} views</span>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredArticles.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `No results for "${searchQuery}". Try different keywords.`
                    : 'No articles in this category yet. Check back soon!'}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Crisis Resources Footer */}
        <Card className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
              <div className="text-sm text-red-900">
                <p className="font-bold mb-3 text-lg">🆘 Crisis Resources - Available 24/7</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-semibold mb-1">📞 Immediate Help:</p>
                    <ul className="space-y-1 text-xs sm:text-sm">
                      <li><strong>Suicide & Crisis:</strong> Call/Text 988</li>
                      <li><strong>Postpartum Support:</strong> 1-800-944-4773</li>
                      <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🤱 Maternal Health:</p>
                    <ul className="space-y-1 text-xs sm:text-sm">
                      <li><strong>Maternal Hotline:</strong> 1-833-943-5746</li>
                      <li><strong>La Leche League:</strong> Breastfeeding support</li>
                      <li><strong>SAMHSA Helpline:</strong> 1-800-662-4357</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}