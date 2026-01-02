import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, Sparkles, Lock, Gift, Clock, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SubscriptionGate({ 
  children, 
  requiredTier = 'pro',
  featureName = 'this feature',
  customMessage = null
}) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const tierHierarchy = {
    'free': 0,
    'waitlist': 1,
    'pro': 2,
    'executive': 3
  };

  const isWithinTrialPeriod = (user) => {
    if (!user?.trial_start_date) return false;
    const trialEnd = new Date(user.trial_end_date || user.trial_start_date);
    trialEnd.setDate(trialEnd.getDate() + 3); // 3-day trial
    return new Date() <= trialEnd;
  };

  const getTierName = (tier) => {
    const names = {
      'free': 'Free',
      'waitlist': 'Waitlist ($9.99)',
      'pro': 'Pro',
      'executive': 'Executive'
    };
    return names[tier] || tier;
  };

  const getRequiredTierName = () => getTierName(requiredTier);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-center text-2xl">Sign In to Access</CardTitle>
            <CardDescription className="text-center text-base">
              Join Helper33 for free and get instant access to {featureName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">🎁 Free 3-Day Trial</p>
                  <p className="text-sm text-green-700">
                    Get instant access to all features for 3 days, completely free!
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Sign In / Sign Up Free
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is admin - admins get full access
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  // Get current user tier
  const currentTier = user.subscription_plan || 'free';
  const currentTierLevel = tierHierarchy[currentTier] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier] || 0;

  // Check if within trial period
  const inTrial = isWithinTrialPeriod(user);

  // Grant access if:
  // 1. User is in trial period OR
  // 2. User's tier is equal to or higher than required tier
  const hasAccess = inTrial || currentTierLevel >= requiredTierLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show upgrade prompt
  const tierBenefits = {
    waitlist: [
      'Continue using all features after trial',
      'Support Helper33 development',
      'Early access to new features',
      'Exclusive waitlist community',
      'Priority support',
      'All current features unlocked'
    ],
    pro: [
      'Everything in Waitlist',
      'Advanced AI personalization',
      'Unlimited wellness plans',
      'Priority feature requests',
      'Ad-free experience',
      'Extended data history'
    ],
    executive: [
      'Everything in Pro',
      'White-glove support',
      'Custom AI training',
      'Family access (up to 5)',
      'Exclusive executive features',
      'Lifetime updates'
    ]
  };

  const pricingInfo = {
    waitlist: { monthly: 9.99, yearly: null, description: 'One-time $9.99 to continue access' },
    pro: { monthly: 14, yearly: 140, description: 'Full-featured wellness companion' },
    executive: { monthly: 55, yearly: 499, description: 'Ultimate wellness & family support' }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-center text-2xl">
            {customMessage || `Upgrade to ${getRequiredTierName()} for ${featureName}`}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {user.trial_used 
              ? 'Your trial has ended. Upgrade to continue accessing premium features.'
              : 'Join the waitlist for just $9.99 to continue your wellness journey'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trial Status */}
          {!user.trial_used && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Your 3-Day Trial Has Ended</p>
                  <p className="text-sm text-blue-700">
                    You've experienced all the features. Ready to continue your journey?
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Waitlist Option - Always show as first upgrade path */}
          {requiredTier === 'waitlist' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-orange-900">Waitlist Access</h3>
                  <Badge className="bg-orange-600 text-white text-lg px-4 py-1">
                    $9.99 One-Time
                  </Badge>
                </div>
                <p className="text-orange-800 mb-4">
                  {pricingInfo.waitlist.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {tierBenefits.waitlist.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-orange-900">
                      <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl('Upgrade')}>
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg py-6">
                    <Rocket className="w-5 h-5 mr-2" />
                    Join Waitlist - $9.99
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Need more features? <Link to={createPageUrl('Upgrade')} className="text-orange-600 hover:underline font-medium">View all plans</Link></p>
              </div>
            </div>
          )}

          {/* Pro/Executive tiers */}
          {(requiredTier === 'pro' || requiredTier === 'executive') && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-purple-900">{getRequiredTierName()} Plan</h3>
                  <div className="text-right">
                    <Badge className="bg-purple-600 text-white text-lg px-4 py-1 mb-1">
                      ${pricingInfo[requiredTier].monthly}/mo
                    </Badge>
                    {pricingInfo[requiredTier].yearly && (
                      <p className="text-xs text-purple-700">or ${pricingInfo[requiredTier].yearly}/year</p>
                    )}
                  </div>
                </div>
                <p className="text-purple-800 mb-4">
                  {pricingInfo[requiredTier].description}
                </p>
                <ul className="space-y-2 mb-6">
                  {tierBenefits[requiredTier].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-purple-900">
                      <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link to={createPageUrl('Upgrade')}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6">
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to {getRequiredTierName()}
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Or start with <Link to={createPageUrl('Upgrade')} className="text-orange-600 hover:underline font-medium">Waitlist for $9.99</Link></p>
              </div>
            </div>
          )}

          {/* What you keep with free plan */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 font-medium mb-2">✨ Free plan includes:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Crisis Support (24/7)</li>
              <li>• Holiday Wellness</li>
              <li>• Basic journaling</li>
              <li>• Community access</li>
              <li>• Limited AI interactions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}