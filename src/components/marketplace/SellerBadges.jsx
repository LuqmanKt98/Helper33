import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Star, 
  Zap, 
  Award, 
  Sparkles,
  TrendingUp,
  Heart,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const SELLER_TIER_CONFIG = {
  new: { 
    name: 'New Seller', 
    icon: '🌱', 
    color: 'from-green-400 to-emerald-500',
    description: 'Welcome to the marketplace!',
    requirements: 'Just getting started'
  },
  bronze: { 
    name: 'Bronze Seller', 
    icon: '🥉', 
    color: 'from-orange-600 to-amber-700',
    description: 'Making your first sales!',
    requirements: '10+ sales & 4.0+ rating'
  },
  silver: { 
    name: 'Silver Seller', 
    icon: '🥈', 
    color: 'from-gray-400 to-gray-600',
    description: 'Established seller',
    requirements: '50+ sales & 4.3+ rating'
  },
  gold: { 
    name: 'Gold Seller', 
    icon: '🥇', 
    color: 'from-yellow-500 to-yellow-600',
    description: 'Top rated seller!',
    requirements: '200+ sales & 4.5+ rating'
  },
  platinum: { 
    name: 'Platinum Seller', 
    icon: '💎', 
    color: 'from-purple-500 to-indigo-600',
    description: 'Elite marketplace creator',
    requirements: '500+ sales & 4.7+ rating'
  }
};

const SELLER_BADGES = {
  fast_shipper: { name: 'Fast Shipper', icon: Zap, color: 'bg-blue-500', description: 'Ships within 24h' },
  top_rated: { name: 'Top Rated', icon: Star, color: 'bg-yellow-500', description: '4.8+ rating' },
  bestseller: { name: 'Bestseller', icon: TrendingUp, color: 'bg-green-500', description: '100+ sales this month' },
  verified_expert: { name: 'Verified Expert', icon: CheckCircle, color: 'bg-purple-500', description: 'Credentials verified' },
  customer_favorite: { name: 'Customer Favorite', icon: Heart, color: 'bg-pink-500', description: 'High repeat customers' },
  rising_star: { name: 'Rising Star', icon: Sparkles, color: 'bg-orange-500', description: 'Trending seller' }
};

export default function SellerBadges({ sellerProfile, compact = false }) {
  if (!sellerProfile) return null;

  const tier = SELLER_TIER_CONFIG[sellerProfile.seller_level || 'new'];
  
  const earnedBadges = [];
  
  if (sellerProfile.average_rating >= 4.8) earnedBadges.push('top_rated');
  if (sellerProfile.total_orders >= 100) earnedBadges.push('bestseller');
  if (sellerProfile.verification_status === 'verified') earnedBadges.push('verified_expert');
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>
          {tier.icon} {tier.name}
        </Badge>
        {earnedBadges.slice(0, 2).map(badgeKey => {
          const badge = SELLER_BADGES[badgeKey];
          const BadgeIcon = badge.icon;
          return (
            <Badge key={badgeKey} className={`${badge.color} text-white`}>
              <BadgeIcon className="w-3 h-3 mr-1" />
              {badge.name}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className={`bg-gradient-to-br ${tier.color} text-white border-0`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-6xl">{tier.icon}</div>
            <div>
              <h3 className="text-2xl font-bold">{tier.name}</h3>
              <p className="text-white/90 text-sm">{tier.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{sellerProfile.total_orders || 0}</div>
              <div className="text-xs text-white/90">Total Sales</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{sellerProfile.average_rating?.toFixed(1) || 'N/A'}</div>
              <div className="text-xs text-white/90">Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Achievement Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {earnedBadges.map(badgeKey => {
                const badge = SELLER_BADGES[badgeKey];
                const BadgeIcon = badge.icon;
                
                return (
                  <motion.div
                    key={badgeKey}
                    whileHover={{ scale: 1.05 }}
                    className={`${badge.color} text-white p-4 rounded-lg flex items-center gap-3`}
                  >
                    <BadgeIcon className="w-8 h-8" />
                    <div>
                      <div className="font-bold">{badge.name}</div>
                      <div className="text-xs opacity-90">{badge.description}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seller Tier Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(SELLER_TIER_CONFIG).map(([key, tierInfo]) => {
              const isCurrentTier = sellerProfile.seller_level === key;
              
              return (
                <div 
                  key={key} 
                  className={`flex items-center justify-between p-2 rounded ${
                    isCurrentTier ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tierInfo.icon}</span>
                    <div>
                      <div className="font-semibold text-sm">{tierInfo.name}</div>
                      <div className="text-xs text-gray-600">{tierInfo.requirements}</div>
                    </div>
                  </div>
                  {isCurrentTier && (
                    <Badge className="bg-purple-600 text-white">Current</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}