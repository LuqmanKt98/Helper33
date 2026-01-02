import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Check, Crown, Rocket, Sparkles, Star, Shield, Zap, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    icon: Heart,
    color: 'from-gray-400 to-gray-500',
    price: { monthly: 0, yearly: 0 },
    description: 'Start your wellness journey',
    features: [
      'Grief Coach AI support',
      'Community access',
      'Social feed & events',
      'Crisis support hub',
      'Basic challenges',
      'Community forum'
    ]
  },
  basic: {
    name: 'Basic',
    icon: Star,
    color: 'from-blue-500 to-cyan-500',
    price: { monthly: 9, yearly: 90 },
    description: 'Essential wellness & productivity',
    badge: 'Popular',
    features: [
      'Everything in Free',
      'Life Coach AI',
      'Mindfulness Hub (limited)',
      'Life Organizer (tasks & habits)',
      'Journal Studio',
      'Vision Board',
      'Memory Vault',
      'All planning tools',
      'Year 2026 planner'
    ]
  },
  pro: {
    name: 'Pro',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    price: { monthly: 14, yearly: 140 },
    description: 'Complete family & wellness toolkit',
    badge: 'Best Value',
    features: [
      'Everything in Basic',
      'Daily Wellness tracking',
      'Family Hub & calendar',
      'Meal Planner with AI',
      "Women's Health tracker",
      'Homework Hub (AI tutoring)',
      'Kids Creative Studio',
      'Knowledge Quest games',
      'Book Studio access',
      'SoulLink companion',
      'Advanced features'
    ]
  },
  executive: {
    name: 'Executive',
    icon: Crown,
    color: 'from-orange-500 to-red-500',
    price: { monthly: 55, yearly: 499 },
    description: 'For providers & business professionals',
    badge: 'Premium',
    features: [
      'Everything in Pro',
      'Find & list practitioners',
      'Practitioner Dashboard',
      'Care Hub (caregivers)',
      'Client Portal',
      'Social Media Manager AI',
      'Workspace & documents',
      'Marketplace access',
      'Consultant platform',
      'Coach & Mentor tools',
      'All 13+ AI agents',
      'Unlimited family members',
      'Custom AI training',
      'White-label options',
      'Dedicated support',
      'API access'
    ]
  }
};

function UpgradePageContent({ user }) {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const currentTier = user?.subscription_tier?.toLowerCase() || 'free';

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Admin Full Access</h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                As an administrator, you have unlimited access to all Helper33 features. No subscription required.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl px-8 py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
              <p className="mt-6 text-sm text-white/70">💜 Thank you for building and maintaining Helper33</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const STRIPE_PAYMENT_LINKS = {
    basic: 'https://buy.stripe.com/5kQbJ16uo5qjc4T3bQcAo02',
    pro: 'https://buy.stripe.com/5kQbJ16uo5qjc4T3bQcAo02', // Replace with actual Pro link when provided
  };

  const handleCheckout = async (tier) => {
    if (STRIPE_PAYMENT_LINKS[tier]) {
      window.open(STRIPE_PAYMENT_LINKS[tier], '_blank');
    } else {
      alert(`Checkout for ${tier} plan coming soon!`);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Unlock Full Access
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            You've explored 10 pages. Upgrade now to access all 33+ AI tools, 13+ agents, and 700+ features!
          </p>
          
          {/* Limited Time Banner */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg mb-8">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Limited Time: Save 50% on Annual Plans</span>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-10">
          <Label htmlFor="billing-cycle" className={`font-semibold transition-colors ${!isYearly ? 'text-purple-600' : 'text-gray-500'}`}>Monthly</Label>
          <Switch 
            id="billing-cycle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-purple-600"
          />
          <Label htmlFor="billing-cycle" className={`font-semibold transition-colors ${isYearly ? 'text-purple-600' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Save $161</span>
          </Label>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan], index) => {
            const Icon = plan.icon;
            const isCurrent = currentTier === key;
            const isHighlighted = plan.badge;
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative"
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-bold shadow-lg">
                      ⭐ {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full border-2 transition-all ${
                  isHighlighted ? 'border-purple-500 shadow-2xl shadow-purple-200/50' : 
                  isCurrent ? 'border-green-500' : 'border-gray-200 hover:border-purple-300'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Pricing */}
                    <div className="text-center py-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${isYearly ? plan.price.yearly : plan.price.monthly}
                        </span>
                        <span className="text-gray-600">/{isYearly ? 'year' : 'month'}</span>
                      </div>
                      {isYearly && plan.price.yearly > 0 && (
                        <p className="text-xs text-emerald-600 mt-2 font-semibold">
                          or ${(plan.price.yearly / 12).toFixed(0)}/month
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : key === 'free' ? (
                      <Button variant="outline" className="w-full" disabled>
                        Free Forever
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white shadow-lg font-semibold`}
                        onClick={() => handleCheckout(key)}
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Get {plan.name} Plan
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12"
        >
          <div className="text-center">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
            <p className="text-xs text-gray-600">256-bit SSL encryption</p>
          </div>
          <div className="text-center">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Cancel Anytime</h3>
            <p className="text-xs text-gray-600">No questions asked</p>
          </div>
          <div className="text-center">
            <Zap className="w-12 h-12 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Instant Access</h3>
            <p className="text-xs text-gray-600">Activate immediately</p>
          </div>
        </motion.div>

        {/* FAQ/Contact */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Have questions? <a href="mailto:support@helper33.com" className="text-purple-600 font-semibold hover:underline">Contact support</a></p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Upgrade() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <UpgradePageContent user={user} />;
}