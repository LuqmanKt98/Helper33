import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const COLLECTION_ICONS = {
  curated: Sparkles,
  trending: TrendingUp,
  new_arrivals: Star,
  best_sellers: Flame,
  staff_picks: Star,
  seasonal: Sparkles,
  category_spotlight: Star
};

export default function FeaturedCollections() {
  const navigate = useNavigate();

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['featuredCollections'],
    queryFn: async () => {
      const now = new Date();
      const allCollections = await base44.entities.FeaturedCollection.filter({ 
        is_active: true 
      });
      
      return allCollections
        .filter(c => {
          const hasStarted = !c.start_date || new Date(c.start_date) <= now;
          const notEnded = !c.end_date || new Date(c.end_date) >= now;
          return hasStarted && notEnded;
        })
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    },
    initialData: []
  });

  if (isLoading || collections.length === 0) return null;

  return (
    <div className="space-y-6 mb-8">
      {collections.map((collection, idx) => {
        const Icon = COLLECTION_ICONS[collection.collection_type] || Sparkles;
        const gradient = collection.gradient_colors 
          ? `from-${collection.gradient_colors.from} to-${collection.gradient_colors.to}`
          : 'from-purple-500 to-pink-500';

        return (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="overflow-hidden bg-white shadow-lg border-2 border-purple-200">
              <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      {collection.icon_emoji ? (
                        <span className="text-2xl">{collection.icon_emoji}</span>
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{collection.collection_name}</h3>
                      <p className="text-white/90">{collection.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {collection.featured_items?.length || 0} items
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {collection.featured_items?.slice(0, 4).map((item) => (
                    <motion.div
                      key={item.item_id}
                      whileHover={{ y: -4 }}
                      onClick={() => {
                        const url = item.item_type === 'course'
                          ? createPageUrl('CourseDetail') + `?id=${item.item_id}`
                          : createPageUrl('ProductDetail') + `?id=${item.item_id}`;
                        navigate(url);
                      }}
                      className="cursor-pointer"
                    >
                      <Card className="h-full hover:shadow-lg transition-all">
                        <div className="relative h-32 overflow-hidden">
                          {item.item_image ? (
                            <img 
                              src={item.item_image} 
                              alt={item.item_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-bold text-sm line-clamp-2 mb-1">{item.item_name}</h4>
                          <p className="text-xs text-gray-600 mb-2">{item.seller_name}</p>
                          <div className="text-lg font-bold text-purple-600">${item.item_price}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {collection.featured_items?.length > 4 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => toast.info('Full collection view coming soon!')}
                  >
                    View All {collection.featured_items.length} Items
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}