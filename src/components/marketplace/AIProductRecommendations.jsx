import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ShoppingBag, Loader2, TrendingUp, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIProductRecommendations({ userId }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['publishedCourses'],
    queryFn: () => base44.entities.Course.filter({ status: 'published' }, '-created_date', 50),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['activeProducts'],
    queryFn: () => base44.entities.MarketplaceProduct.filter({ status: 'active' }, '-created_date', 50),
  });

  const { data: userActivities = [] } = useQuery({
    queryKey: ['userActivities', user?.email],
    queryFn: () => base44.entities.UserActivity.filter({}, '-created_date', 20),
    enabled: !!user
  });

  const { data: userGoals = [] } = useQuery({
    queryKey: ['userGoals', user?.email],
    queryFn: () => base44.entities.CoachingGoal.filter({ status: 'active' }, '-created_date', 10),
    enabled: !!user
  });

  const generateRecommendations = async () => {
    if (!user) {
      toast.error('Please sign in to get personalized recommendations');
      return;
    }

    setIsGenerating(true);
    try {
      // Analyze user interests from activities and goals
      const recentActivities = userActivities.slice(0, 10).map(a => a.activity_category).join(', ');
      const activeGoals = userGoals.map(g => g.category).join(', ');
      
      const availableProducts = [
        ...courses.map(c => ({ id: c.id, name: c.title, type: 'course', category: c.category })),
        ...products.map(p => ({ id: p.id, name: p.product_name, type: 'product', category: p.category }))
      ];

      const prompt = `Based on the user's interests and activities, recommend the most relevant products and courses.

User's Recent Activities: ${recentActivities || 'Getting started with wellness journey'}
User's Active Goals: ${activeGoals || 'General wellness and personal growth'}

Available Products/Courses:
${availableProducts.slice(0, 20).map((item, i) => `${i+1}. ${item.name} (${item.type}, ${item.category})`).join('\n')}

Analyze the user's profile and recommend the top 5 most relevant items. For each recommendation, return:
- item_id (from the list above)
- item_name
- item_type
- recommendation_score (1-10)
- why_recommended (2-3 sentences explaining the match)
- key_benefit (main benefit for this user)

Return as JSON array.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item_id: { type: "string" },
                  item_name: { type: "string" },
                  item_type: { type: "string" },
                  recommendation_score: { type: "number" },
                  why_recommended: { type: "string" },
                  key_benefit: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (response?.recommendations) {
        // Enrich with actual product data
        const enrichedRecs = response.recommendations.map(rec => {
          const item = availableProducts.find(p => p.id === rec.item_id);
          const fullItem = rec.item_type === 'course' 
            ? courses.find(c => c.id === rec.item_id)
            : products.find(p => p.id === rec.item_id);
          
          return {
            ...rec,
            ...fullItem,
            category: item?.category
          };
        }).filter(rec => rec.id); // Filter out items that weren't found

        setRecommendations(enrichedRecs);
        toast.success(`${enrichedRecs.length} personalized recommendations found! ✨`);
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      toast.error('Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Auto-generate on component mount if user is logged in
    if (user && courses.length > 0 && products.length > 0) {
      generateRecommendations();
    }
  }, [user, courses.length, products.length]);

  if (!user) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Get Personalized Recommendations</h3>
          <p className="text-gray-600 mb-4">Sign in to see courses and products tailored to your wellness journey</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-purple-600">
            Sign In for Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Recommended For You
            </CardTitle>
            <Button
              onClick={generateRecommendations}
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isGenerating && recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Analyzing your interests...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white hover:shadow-lg transition-all border border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={rec.cover_image_url || rec.images?.[0]?.url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200'}
                            alt={rec.item_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 line-clamp-1">{rec.item_name}</h4>
                            <Badge className="bg-purple-100 text-purple-800 flex-shrink-0">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {rec.recommendation_score}/10
                            </Badge>
                          </div>
                          <Badge className="mb-2 text-xs">
                            {rec.item_type === 'course' ? '📚 Course' : '🛍️ Product'}
                          </Badge>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            <strong>Why for you:</strong> {rec.why_recommended}
                          </p>
                          <p className="text-xs text-purple-700 mb-3">
                            <strong>✨ Key benefit:</strong> {rec.key_benefit}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-purple-600 text-xs">
                              View Details
                            </Button>
                            <span className="text-sm font-bold text-gray-900">
                              ${rec.price || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No recommendations yet. Try exploring the marketplace!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}