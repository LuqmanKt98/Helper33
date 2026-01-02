import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  User, Briefcase, Heart, Sparkles, Crown, Settings, CreditCard, Users, 
  Shield, Zap, TrendingUp, CheckCircle, ExternalLink,
  Award, Target, Package, BarChart3, Globe, HeartHandshake,
  Brain, Stethoscope, Building2, Loader2, ShoppingBag, Star, Repeat, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

export default function AccountManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: practitionerProfile } = useQuery({
    queryKey: ['practitionerProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.PractitionerProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user && user.account_type === 'practitioner'
  });

  const { data: caregiverProfile } = useQuery({
    queryKey: ['caregiverProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CaregiverProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user && user.account_type === 'caregiver'
  });

  const { data: consultantProfile } = useQuery({
    queryKey: ['consultantProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.ConsultantProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user && user.account_type === 'consultant'
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ['sellerProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.SellerProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user && user.account_type === 'seller'
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ is_active: true }),
    initialData: []
  });

  const { data: addons = [] } = useQuery({
    queryKey: ['subscriptionAddons'],
    queryFn: () => base44.entities.SubscriptionAddon.filter({ is_active: true }),
    initialData: []
  });

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'practitioner': return <Stethoscope className="w-5 h-5" />;
      case 'caregiver': return <HeartHandshake className="w-5 h-5" />;
      case 'consultant': return <Brain className="w-5 h-5" />;
      case 'seller': return <ShoppingBag className="w-5 h-5" />;
      case 'business': return <Building2 className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getTierBadge = (tier) => {
    const config = {
      free: { color: 'bg-gray-500', icon: <Package className="w-3 h-3" /> },
      pro: { color: 'bg-blue-500', icon: <Sparkles className="w-3 h-3" /> },
      executive: { color: 'bg-purple-500', icon: <Crown className="w-3 h-3" /> },
      enterprise: { color: 'bg-amber-500', icon: <Award className="w-3 h-3" /> }
    };
    return config[tier] || config.free;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const tierConfig = getTierBadge(user?.subscription_tier || 'free');
  const availableAddons = addons.filter(addon => 
    addon.available_for_account_types?.includes(user?.account_type) &&
    addon.available_for_tiers?.includes(user?.subscription_tier)
  );

  return (
    <>
      <SEO
        title="Account Manager | Helper33"
        description="Manage your Helper33 account, subscription, and professional profiles"
        keywords="account management, subscription, profile, professional dashboard"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-6 text-white shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-white" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    {getAccountTypeIcon(user?.account_type)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{user?.preferred_name || user?.full_name}</h1>
                  <p className="text-white/80">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${tierConfig.color} text-white`}>
                      {tierConfig.icon}
                      <span className="ml-1">{user?.subscription_tier?.toUpperCase()}</span>
                    </Badge>
                    <Badge className="bg-white/20 text-white">
                      {getAccountTypeIcon(user?.account_type)}
                      <span className="ml-1 capitalize">{user?.account_type}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={createPageUrl('Account')}>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {user?.account_type !== 'individual' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {user?.account_type === 'practitioner' && (
                <Link to={createPageUrl('PractitionerDashboard')}>
                  <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 hover:shadow-xl transition-all cursor-pointer h-full">
                      <CardContent className="p-6">
                        <Stethoscope className="w-12 h-12 text-purple-600 mb-3" />
                        <h3 className="font-bold text-lg">Practitioner Portal</h3>
                        <p className="text-sm text-gray-600">Manage appointments & clients</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              )}
              {user?.account_type === 'caregiver' && (
                <Link to={createPageUrl('CaregiverDashboard')}>
                  <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                    <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 hover:shadow-xl transition-all cursor-pointer h-full">
                      <CardContent className="p-6">
                        <HeartHandshake className="w-12 h-12 text-green-600 mb-3" />
                        <h3 className="font-bold text-lg">Caregiver Portal</h3>
                        <p className="text-sm text-gray-600">Manage bookings & services</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              )}
              {user?.account_type === 'consultant' && (
                <Link to={createPageUrl('ConsultantDashboard')}>
                  <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 hover:shadow-xl transition-all cursor-pointer h-full">
                      <CardContent className="p-6">
                        <Brain className="w-12 h-12 text-blue-600 mb-3" />
                        <h3 className="font-bold text-lg">Consultant Portal</h3>
                        <p className="text-sm text-gray-600">Manage projects & clients</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              )}
              {user?.account_type === 'seller' && (
                <Link to={createPageUrl('SellerDashboard')}>
                  <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 hover:shadow-xl transition-all cursor-pointer h-full">
                      <CardContent className="p-6">
                        <ShoppingBag className="w-12 h-12 text-pink-600 mb-3" />
                        <h3 className="font-bold text-lg">Seller Portal</h3>
                        <p className="text-sm text-gray-600">Manage products & sales</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="addons">Add-ons</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Subscription Status</p>
                      <p className="text-2xl font-bold text-purple-700 capitalize">{user?.subscription_status || 'Trialing'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Active Add-ons</p>
                      <p className="text-2xl font-bold text-blue-700">{user?.subscription_add_ons?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                      <p className="text-sm text-gray-600 mb-1">Account Type</p>
                      <p className="text-xl font-bold text-amber-700 capitalize">{user?.account_type || 'Individual'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role-Based Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <RoleBasedFeatures user={user} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6 mt-6">
              <SubscriptionPlans user={user} plans={plans} />
            </TabsContent>

            <TabsContent value="addons" className="space-y-6 mt-6">
              <AddonMarketplace user={user} addons={availableAddons} />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6 mt-6">
              <BillingManagement user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function RoleBasedFeatures({ user }) {
  const features = {
    individual: [
      { icon: Heart, name: 'AI Wellness Coach', desc: 'Personal mental health support' },
      { icon: Users, name: 'Family Hub', desc: 'Manage family tasks & calendar' },
      { icon: Target, name: 'Goal Tracking', desc: 'Track personal goals' }
    ],
    practitioner: [
      { icon: Stethoscope, name: 'Client Portal', desc: 'Manage client appointments' },
      { icon: CheckCircle, name: 'Session Notes', desc: 'AI-powered documentation' },
      { icon: Star, name: 'Review Management', desc: 'Track client feedback' }
    ],
    caregiver: [
      { icon: HeartHandshake, name: 'Booking System', desc: 'Manage service bookings' },
      { icon: Shield, name: 'Verification', desc: 'Background check status' },
      { icon: Star, name: 'Client Reviews', desc: 'Build your reputation' }
    ],
    consultant: [
      { icon: Brain, name: 'AI Partnership', desc: 'Collaborate with AI tools' },
      { icon: Briefcase, name: 'Project Management', desc: 'Track client projects' },
      { icon: BarChart3, name: 'Analytics', desc: 'Performance insights' }
    ],
    seller: [
      { icon: ShoppingBag, name: 'Product Listings', desc: 'Manage your inventory' },
      { icon: DollarSign, name: 'Commission Tracking', desc: 'Monitor earnings' },
      { icon: TrendingUp, name: 'Sales Analytics', desc: 'Track performance' }
    ],
    business: [
      { icon: Building2, name: 'Team Management', desc: 'Multi-user access' },
      { icon: Globe, name: 'White Label', desc: 'Custom branding' },
      { icon: Zap, name: 'API Access', desc: 'Integration options' }
    ]
  };

  const userFeatures = features[user?.account_type] || features.individual;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {userFeatures.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200"
          >
            <Icon className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-bold text-gray-800">{feature.name}</h4>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function SubscriptionPlans({ user, plans }) {
  const currentTier = user?.subscription_tier || 'free';
  const accountPlans = plans.filter(plan => 
    plan.account_types?.includes(user?.account_type) || !plan.account_types?.length
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleUpgrade = async (plan, interval = 'monthly') => {
    setIsLoading(true);
    setLoadingPlan(plan.id);
    
    try {
      const priceId = interval === 'monthly' ? plan.stripe_monthly_price_id : plan.stripe_yearly_price_id;
      
      if (!priceId) {
        toast.error('Price ID not configured for this plan');
        return;
      }

      const response = await base44.functions.invoke('createStripeCheckoutSession', {
        priceId,
        successUrl: `${window.location.origin}${createPageUrl('AccountManager')}?success=true`,
        cancelUrl: `${window.location.origin}${createPageUrl('AccountManager')}`,
        metadata: {
          plan_tier: plan.plan_tier,
          interval
        }
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Unlock more features with a premium subscription</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {accountPlans.map((plan, idx) => {
          const tierConfig = {
            free: 'from-gray-400 to-gray-600',
            pro: 'from-blue-500 to-indigo-600',
            executive: 'from-purple-500 to-pink-600',
            enterprise: 'from-amber-500 to-orange-600'
          };

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <Card className={`${currentTier === plan.plan_tier ? 'ring-4 ring-purple-500' : ''} hover:shadow-2xl transition-all`}>
                <CardHeader className={`bg-gradient-to-r ${tierConfig[plan.plan_tier]} text-white rounded-t-lg`}>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.plan_name}</span>
                    {currentTier === plan.plan_tier && <CheckCircle className="w-5 h-5" />}
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    ${plan.monthly_price}/mo or ${plan.yearly_price}/yr
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <ul className="space-y-2">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {currentTier !== plan.plan_tier && plan.plan_tier !== 'free' && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => handleUpgrade(plan, 'monthly')}
                        disabled={isLoading}
                      >
                        {isLoading && loadingPlan === plan.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Monthly: ${plan.monthly_price}/mo
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full border-2 border-purple-300 hover:bg-purple-50"
                        onClick={() => handleUpgrade(plan, 'yearly')}
                        disabled={isLoading}
                      >
                        {isLoading && loadingPlan === plan.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Crown className="w-4 h-4 mr-2 text-purple-600" />
                        )}
                        Yearly: ${plan.yearly_price}/yr
                      </Button>
                    </div>
                  )}
                  {currentTier === plan.plan_tier && (
                    <Badge className="w-full justify-center py-2 bg-green-100 text-green-700">
                      Current Plan
                    </Badge>
                  )}
                  {plan.plan_tier === 'free' && currentTier !== 'free' && (
                    <Badge className="w-full justify-center py-2 bg-gray-100 text-gray-700">
                      Downgrade Available
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AddonMarketplace({ user, addons }) {
  const [selectedAddons, setSelectedAddons] = useState(user?.subscription_add_ons || []);

  const toggleAddon = (addonType) => {
    setSelectedAddons(prev => 
      prev.includes(addonType) 
        ? prev.filter(a => a !== addonType)
        : [...prev, addonType]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Customize Your Experience</h2>
        <p className="text-gray-600">Add powerful features to match your needs</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((addon, idx) => {
          const isActive = user?.subscription_add_ons?.includes(addon.addon_type);
          const isSelected = selectedAddons.includes(addon.addon_type);

          return (
            <motion.div
              key={addon.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className={`${isActive ? 'ring-4 ring-green-500' : isSelected ? 'ring-4 ring-purple-500' : ''} hover:shadow-xl transition-all cursor-pointer h-full`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{addon.addon_name}</span>
                    {isActive && <Badge className="bg-green-500">Active</Badge>}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    ${addon.monthly_price}/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{addon.description}</p>
                  <ul className="space-y-2">
                    {addon.features?.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}
                    onClick={() => toggleAddon(addon.addon_type)}
                  >
                    {isActive ? 'Remove Add-on' : isSelected ? 'Selected' : 'Add to Plan'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedAddons.length > 0 && !selectedAddons.every(a => user?.subscription_add_ons?.includes(a)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
            <CardContent className="p-6">
              <p className="font-bold text-lg mb-2">
                Total: ${addons.filter(a => selectedAddons.includes(a.addon_type) && !user?.subscription_add_ons?.includes(a.addon_type)).reduce((sum, a) => sum + a.monthly_price, 0)}/month
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8">
                Checkout
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function BillingManagement({ user }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('createStripePortalSession', {
        return_url: window.location.href
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">Manage your billing information and payment methods</p>
          {user?.stripe_customer_id ? (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800 mb-1">✅ Payment Method Connected</p>
              <p className="text-xs text-green-600">Stripe Customer ID: {user.stripe_customer_id.slice(0, 20)}...</p>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">⚠️ No payment method on file</p>
              <p className="text-xs text-orange-600 mt-1">Subscribe to a plan to add payment details</p>
            </div>
          )}
          {user?.stripe_customer_id && (
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleManageBilling}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Manage Billing & Subscriptions
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {user?.stripe_customer_id ? (
            <>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleManageBilling}
                disabled={isLoading}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleManageBilling}
                disabled={isLoading}
              >
                <Repeat className="w-4 h-4 mr-2" />
                View Billing History
              </Button>
              {user?.stripe_subscription_id && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleManageBilling}
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-600">Subscribe to a plan to access billing management</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Subscription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {user?.stripe_subscription_id ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Status:</p>
                <Badge className={`${
                  user.subscription_status === 'active' ? 'bg-green-500' :
                  user.subscription_status === 'trialing' ? 'bg-blue-500' :
                  user.subscription_status === 'past_due' ? 'bg-orange-500' :
                  'bg-gray-500'
                } text-white`}>
                  {user.subscription_status?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Subscription ID:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{user.stripe_subscription_id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Current Tier:</p>
                <Badge className="bg-purple-500 text-white capitalize">
                  {user.subscription_tier || 'Free'}
                </Badge>
              </div>
            </>
          ) : (
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-center">
              <p className="text-gray-600 text-sm mb-3">No active subscription</p>
              <Link to={createPageUrl('AccountManager')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Star className="w-4 h-4 mr-2" />
                  Browse Plans
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}