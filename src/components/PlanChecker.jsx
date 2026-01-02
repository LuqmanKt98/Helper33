import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Clock, Gift, Key, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

// Feature access configuration
export const PLAN_FEATURES = {
  free: [
    'gratitude_journal_kids',
    'gratitude_journal_adults',
    'homework_space',
    'basic_wellness'
  ],
  pro_monthly: [
    'gratitude_journal_kids',
    'gratitude_journal_adults',
    'homework_space',
    'basic_wellness',
    'life_coaches',
    'soullink',
    'kids_studio',
    'wellness_hub',
    'limited_planners',
    'gentle_flow_planner',
    'vision_board',
    'wassup_chats_limited',
    'wellness_insights'
  ],
  pro_yearly: [
    'gratitude_journal_kids',
    'gratitude_journal_adults',
    'homework_space',
    'basic_wellness',
    'life_coaches',
    'soullink',
    'kids_studio',
    'wellness_hub',
    'limited_planners',
    'gentle_flow_planner',
    'vision_board',
    'wassup_chats_limited',
    'wellness_insights'
  ],
  executive_monthly: [
    'gratitude_journal_kids',
    'gratitude_journal_adults',
    'homework_space',
    'basic_wellness',
    'life_coaches',
    'soullink',
    'kids_studio',
    'wellness_hub',
    'limited_planners',
    'gentle_flow_planner',
    'vision_board',
    'wassup_chats_limited',
    'wellness_insights',
    'books_journals',
    'story_hub',
    'memory_vault',
    'meal_planner',
    'full_planners',
    'life_organizer',
    'premium_ai',
    'wassup_chats_unlimited',
    'priority_access',
    'executive_badge',
    'infinity_journal',
    'things_they_took'
  ],
  executive_yearly: [
    'gratitude_journal_kids',
    'gratitude_journal_adults',
    'homework_space',
    'basic_wellness',
    'life_coaches',
    'soullink',
    'kids_studio',
    'wellness_hub',
    'limited_planners',
    'gentle_flow_planner',
    'vision_board',
    'wassup_chats_limited',
    'wellness_insights',
    'books_journals',
    'story_hub',
    'memory_vault',
    'meal_planner',
    'full_planners',
    'life_organizer',
    'premium_ai',
    'wassup_chats_unlimited',
    'priority_access',
    'executive_badge',
    'infinity_journal',
    'things_they_took'
  ],
  infinity_journal: [
    'gratitude_journal_kids',
    'gratitude_journal_adults',
    'homework_space',
    'basic_wellness',
    'infinity_journal'
  ],
  things_they_took: [
    'gratitude_journal_kids',
    'gratitude_journal_adults',
    'homework_space',
    'basic_wellness',
    'things_they_took'
  ]
};

// Features excluded from trial (require purchase/subscription)
const TRIAL_EXCLUDED_FEATURES = [
  'infinity_journal',
  'things_they_took',
  'books_journals',
  'story_hub'
];

// Check if user is in active trial
export const isInActiveTrial = (user) => {
  if (!user?.trial_status) return false;
  
  const { trial_started_date, trial_used } = user.trial_status;
  
  if (!trial_started_date || trial_used === true) return false;
  
  const trialStart = new Date(trial_started_date);
  const now = new Date();
  const hoursSinceStart = (now - trialStart) / (1000 * 60 * 60);
  const daysSinceStart = hoursSinceStart / 24;
  
  return daysSinceStart <= 3;
};

// Get days remaining in trial
export const getTrialDaysRemaining = (user) => {
  if (!user?.trial_status?.trial_started_date) return 0;
  
  const trialStart = new Date(user.trial_status.trial_started_date);
  const now = new Date();
  const hoursSinceStart = (now - trialStart) / (1000 * 60 * 60);
  const daysRemaining = Math.max(0, 3 - (hoursSinceStart / 24));
  
  return Math.ceil(daysRemaining);
};

// Check if user has access to a feature (including trial)
export const hasFeatureAccess = (user, featureKey) => {
  const planType = user?.plan_type || 'free';
  const features = PLAN_FEATURES[planType] || PLAN_FEATURES.free;
  
  // Check if user already has access through their plan
  if (features.includes(featureKey)) return true;
  
  // Check if feature is excluded from trial
  if (TRIAL_EXCLUDED_FEATURES.includes(featureKey)) return false;
  
  // Check if user is in active trial
  if (isInActiveTrial(user)) {
    const trialLevel = user.trial_status?.trial_plan_level || 'pro';
    const trialFeatures = trialLevel === 'executive' 
      ? PLAN_FEATURES.executive_monthly 
      : PLAN_FEATURES.pro_monthly;
    
    return trialFeatures.includes(featureKey) && !TRIAL_EXCLUDED_FEATURES.includes(featureKey);
  }
  
  return false;
};

// Get required plan for a feature
export const getRequiredPlan = (featureKey) => {
  if (PLAN_FEATURES.executive_monthly.includes(featureKey) && 
      !PLAN_FEATURES.pro_monthly.includes(featureKey)) {
    return 'executive';
  }
  if (PLAN_FEATURES.pro_monthly.includes(featureKey) && 
      !PLAN_FEATURES.free.includes(featureKey)) {
    return 'pro';
  }
  return 'free';
};

// Start trial for user
export const startTrial = async (user, trialLevel = 'pro') => {
  if (!user || user.trial_status?.trial_used) return false;
  
  try {
    await base44.auth.updateMe({
      trial_status: {
        trial_started_date: new Date().toISOString(),
        trial_used: false,
        trial_plan_level: trialLevel
      }
    });
    return true;
  } catch (error) {
    console.error('Error starting trial:', error);
    return false;
  }
};

// Component to show when user doesn't have access
export function UpgradePrompt({ featureKey, featureName, featureDescription, user }) {
  const queryClient = useQueryClient();
  const [accessCode, setAccessCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  
  const requiredPlan = getRequiredPlan(featureKey);
  const canUseTrial = !TRIAL_EXCLUDED_FEATURES.includes(featureKey);
  const hasUsedTrial = user?.trial_status?.trial_used === true;
  const isInTrial = isInActiveTrial(user);
  const daysRemaining = getTrialDaysRemaining(user);
  
  const applyAccessCodeMutation = useMutation({
    mutationFn: async (code) => {
      if (code !== '6060') {
        throw new Error('Invalid access code');
      }
      await base44.auth.updateMe({ access_code: code });
    },
    onSuccess: () => {
      toast.success('Access code applied! Redirecting...');
      queryClient.invalidateQueries(['user']);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || 'Invalid access code');
    }
  });
  
  const handleStartTrial = async () => {
    const success = await startTrial(user, requiredPlan);
    if (success) {
      window.location.reload();
    }
  };

  const handleApplyCode = () => {
    if (!accessCode.trim()) {
      toast.error('Please enter an access code');
      return;
    }
    applyAccessCodeMutation.mutate(accessCode);
  };

  // Feature requires purchase (books)
  if (TRIAL_EXCLUDED_FEATURES.includes(featureKey)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex items-center justify-center p-4"
      >
        <Card className="max-w-2xl w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200">
          <CardHeader className="space-y-4 pt-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>

            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {featureName || 'Premium Feature'}
            </CardTitle>

            <CardDescription className="text-center text-gray-600 text-lg">
              {featureDescription || 'This feature requires a separate purchase'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-purple-200">
              <p className="text-center text-gray-700 mb-4">
                This premium content requires a <strong className="text-purple-600">separate purchase</strong>
              </p>
              <p className="text-sm text-gray-600 text-center">
                Books and exclusive content are not included in trials or subscriptions
              </p>
            </div>

            {/* Access Code Section */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-900">Have an Access Code?</h3>
              </div>
              
              {!showCodeInput ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCodeInput(true)}
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Enter Access Code
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Enter code (e.g., 6060)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="border-amber-300 focus:ring-amber-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApplyCode}
                      disabled={applyAccessCodeMutation.isPending}
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                      {applyAccessCodeMutation.isPending ? (
                        <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Apply Code</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCodeInput(false)}
                      className="border-amber-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600"
              >
                <Link to={createPageUrl('Upgrade')}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Purchase Options
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="flex-1 h-12 text-lg font-semibold"
              >
                <Link to={createPageUrl('Dashboard')}>
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[60vh] flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200">
        <CardHeader className="space-y-4 pt-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl"
          >
            {isInTrial ? (
              <Clock className="w-10 h-10 text-white" />
            ) : canUseTrial && !hasUsedTrial ? (
              <Gift className="w-10 h-10 text-white" />
            ) : (
              <Lock className="w-10 h-10 text-white" />
            )}
          </motion.div>

          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {featureName || 'Premium Feature'}
          </CardTitle>

          <CardDescription className="text-center text-gray-600 text-lg">
            {featureDescription || 'This feature requires a premium subscription'}
          </CardDescription>

          {isInTrial && (
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in trial
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 mt-6">
          {canUseTrial && !hasUsedTrial && !isInTrial && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-center text-white"
            >
              <Gift className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-2">🎁 Start Your 3-Day Free Trial!</h3>
              <p className="text-emerald-50 mb-4">
                Get full access to {requiredPlan === 'executive' ? 'Executive' : 'Pro'} features for 3 days
              </p>
              <p className="text-sm text-emerald-100">
                No credit card required • Cancel anytime
              </p>
            </motion.div>
          )}

          {hasUsedTrial && !isInTrial && (
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
              <p className="text-blue-800 text-sm">
                You've already used your free trial. Subscribe to continue enjoying premium features!
              </p>
            </div>
          )}

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-purple-200">
            <p className="text-center text-gray-700 mb-4">
              Unlock <strong className="text-purple-600">Dobry{requiredPlan === 'executive' ? 'Executive' : 'Pro'}</strong>:
            </p>
            
            <div className="grid gap-3">
              {requiredPlan === 'executive' ? (
                <>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span>All Pro features + Executive benefits</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span>Memory Vault for cherished moments</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span>Full access to all planners</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    <span>Unlimited AI conversations</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span>Life Coaches & AI guidance</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span>SoulLink AI companion</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span>Wellness Hub & Kids Studio</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <span>Vision Board & planning tools</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {canUseTrial && !hasUsedTrial && !isInTrial && (
              <Button
                onClick={handleStartTrial}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Gift className="w-5 h-5 mr-2" />
                Start 3-Day Free Trial
              </Button>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                asChild
                className={`h-12 text-lg font-semibold ${
                  requiredPlan === 'executive'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                <Link to={createPageUrl('Upgrade')}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upgrade Now
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="h-12 text-lg font-semibold"
              >
                <Link to={createPageUrl('Dashboard')}>
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {!isInTrial && (
            <p className="text-center text-sm text-gray-500">
              {canUseTrial && !hasUsedTrial ? (
                <>Try free for <strong>3 days</strong> • No credit card required • Cancel anytime</>
              ) : (
                <>Subscribe monthly or yearly • Cancel anytime</>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Hook to check feature access
export function useFeatureAccess(featureKey) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const hasAccess = hasFeatureAccess(user, featureKey);
  const requiredPlan = getRequiredPlan(featureKey);
  const inTrial = isInActiveTrial(user);
  const trialDaysRemaining = getTrialDaysRemaining(user);
  
  return {
    hasAccess,
    requiredPlan,
    currentPlan: user?.plan_type || 'free',
    isLoading,
    inTrial,
    trialDaysRemaining,
    canStartTrial: !TRIAL_EXCLUDED_FEATURES.includes(featureKey) && !user?.trial_status?.trial_used
  };
}

// Wrapper component that shows upgrade prompt if user doesn't have access
export function FeatureGate({ featureKey, featureName, featureDescription, children }) {
  const { hasAccess, isLoading } = useFeatureAccess(featureKey);
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <UpgradePrompt
        featureKey={featureKey}
        featureName={featureName}
        featureDescription={featureDescription}
        user={user}
      />
    );
  }

  return <>{children}</>;
}