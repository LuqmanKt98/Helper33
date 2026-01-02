import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecommendationsCarousel({ userId }) {
  const navigate = useNavigate();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      try {
        const recs = await base44.entities.ProductRecommendation.filter({
          dismissed: false
        });
        return recs.slice(0, 5);
      } catch (error) {
        return [];
      }
    },
    enabled: !!userId,
    initialData: []
  });

  if (isLoading || recommendations.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Recommended For You</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex-shrink-0 w-64 cursor-pointer"
            onClick={() => {
              const url = rec.item_type === 'course'
                ? createPageUrl('CourseDetail') + `?id=${rec.item_id}`
                : createPageUrl('ProductDetail') + `?id=${rec.item_id}`;
              navigate(url);
            }}
          >
            <Card className="hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="p-4">
                {rec.item_image && (
                  <img
                    src={rec.item_image}
                    alt={rec.item_name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {rec.recommendation_reason.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className="bg-green-600 text-white text-xs">
                    {rec.item_type}
                  </Badge>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{rec.item_name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">${rec.item_price}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <TrendingUp className="w-3 h-3" />
                    {Math.round(rec.recommendation_score * 100)}% match
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}