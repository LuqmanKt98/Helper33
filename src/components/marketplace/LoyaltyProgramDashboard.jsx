import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Gift,
  TrendingUp,
  Award,
  Sparkles,
  Copy,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const TIER_CONFIG = {
  bronze: { name: 'Bronze', min: 0, color: 'from-orange-600 to-amber-700', icon: '🥉', benefits: ['1 point per $1 spent', 'Birthday discount'] },
  silver: { name: 'Silver', min: 500, color: 'from-gray-400 to-gray-600', icon: '🥈', benefits: ['1.5 points per $1', 'Early access to sales', 'Birthday discount'] },
  gold: { name: 'Gold', min: 2000, color: 'from-yellow-500 to-yellow-600', icon: '🥇', benefits: ['2 points per $1', 'Priority support', 'Exclusive deals', 'Birthday discount'] },
  platinum: { name: 'Platinum', min: 5000, color: 'from-purple-500 to-indigo-600', icon: '💎', benefits: ['3 points per $1', 'VIP access', 'Free shipping', 'Exclusive products'] },
  diamond: { name: 'Diamond', min: 10000, color: 'from-blue-400 to-cyan-500', icon: '💠', benefits: ['5 points per $1', 'Concierge service', 'Early product releases', 'Lifetime benefits'] }
};

export default function LoyaltyProgramDashboard() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: loyaltyPoints, isLoading } = useQuery({
    queryKey: ['loyaltyPoints', user?.email],
    queryFn: async () => {
      const points = await base44.entities.BuyerLoyaltyPoints.filter({ created_by: user.email });
      if (points.length === 0) {
        // Create initial loyalty record
        const newPoints = await base44.entities.BuyerLoyaltyPoints.create({
          total_points: 0,
          available_points: 0,
          tier: 'bronze',
          referral_code: `REF${Date.now().toString(36).toUpperCase()}`
        });
        return newPoints;
      }
      return points[0];
    },
    enabled: !!user
  });

  const currentTier = TIER_CONFIG[loyaltyPoints?.tier || 'bronze'];
  const nextTierKey = Object.keys(TIER_CONFIG).find(key => TIER_CONFIG[key].min > (loyaltyPoints?.total_points || 0));
  const nextTier = nextTierKey ? TIER_CONFIG[nextTierKey] : null;
  const progressToNext = nextTier ? ((loyaltyPoints?.total_points || 0) / nextTier.min) * 100 : 100;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(loyaltyPoints?.referral_code);
    toast.success('Referral code copied! Share it to earn bonus points! 🎁');
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <Card className={`bg-gradient-to-br ${currentTier.color} text-white border-0 shadow-xl`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{currentTier.icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{currentTier.name} Member</h3>
                <p className="text-white/90">Level {Object.keys(TIER_CONFIG).indexOf(loyaltyPoints?.tier || 'bronze') + 1}</p>
              </div>
            </div>
            <Trophy className="w-12 h-12 opacity-20" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{loyaltyPoints?.available_points || 0}</div>
              <div className="text-sm text-white/90">Points Available</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{loyaltyPoints?.total_points || 0}</div>
              <div className="text-sm text-white/90">Total Earned</div>
            </div>
          </div>

          {nextTier && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span className="font-bold">{loyaltyPoints?.points_to_next_tier || 0} points to go</span>
              </div>
              <Progress value={progressToNext} className="h-3 bg-white/30" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Your Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentTier.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referral Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Earn Bonus Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border-2 border-dashed border-green-300">
              <p className="text-sm text-gray-700 mb-2">Your Referral Code:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-bold bg-white px-3 py-2 rounded border border-green-300">
                  {loyaltyPoints?.referral_code}
                </code>
                <Button onClick={copyReferralCode} size="sm" variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>Earn 100 points when someone uses your code!</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-3 h-3 text-green-500" />
                <span>They get 50 points on their first purchase!</span>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {loyaltyPoints?.referrals_count || 0} successful referrals
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold text-gray-800">Make Purchases</div>
              <div className="text-xs text-gray-600">1-5 points per $1 spent</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-bold text-gray-800">Leave Reviews</div>
              <div className="text-xs text-gray-600">+25 points per review</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">🎁</div>
              <div className="font-bold text-gray-800">Refer Friends</div>
              <div className="text-xs text-gray-600">+100 points per referral</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl mb-2">🎂</div>
              <div className="font-bold text-gray-800">Birthday Bonus</div>
              <div className="text-xs text-gray-600">+200 points annually</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {loyaltyPoints?.points_history && loyaltyPoints.points_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loyaltyPoints.points_history.slice(0, 5).map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{entry.reason}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-bold ${entry.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.points_change > 0 ? '+' : ''}{entry.points_change} pts
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tiers Preview */}
      <Card>
        <CardHeader>
          <CardTitle>All Membership Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(TIER_CONFIG).map(([key, tier]) => {
              const isCurrentTier = loyaltyPoints?.tier === key;
              const isUnlocked = (loyaltyPoints?.total_points || 0) >= tier.min;
              
              return (
                <motion.div
                  key={key}
                  whileHover={{ y: -4 }}
                  className={`p-4 rounded-lg border-2 text-center ${
                    isCurrentTier 
                      ? 'border-purple-500 bg-purple-50' 
                      : isUnlocked
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{tier.icon}</div>
                  <h4 className="font-bold text-gray-800 mb-1">{tier.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{tier.min} points</p>
                  {isCurrentTier && (
                    <Badge className="bg-purple-600 text-white">Current</Badge>
                  )}
                  {!isCurrentTier && isUnlocked && (
                    <Badge className="bg-green-600 text-white">Unlocked</Badge>
                  )}
                  {!isUnlocked && (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}