import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Heart, Shield, BookOpen
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

// Pages that are completely free (no trial needed) - matches Free plan features
const FREE_PAGES = [
  // Static pages
  'Home', 'About', 'OurStory', 'Blog', 'BlogPost', 'PrivacyPolicy', 'TermsOfService', 
  'LegalDisclaimer', 'SupportUs', 'Campaign', 'Upgrade', 'PricingPlans',
  // Account & settings
  'Account', 'AccountManager', 'Profile', 'Settings', 'Security', 'FeedbackSurvey',
  // Books have their own purchase flow
  'InfinityBook', 'ThingsTheyTookBook', 'InfinityJournal',
  // FREE PLAN FEATURES:
  'GriefCoach',           // Grief Coach AI support
  'CrisisHub',            // Crisis support hub
  'Community',            // Community access
  'CommunityHub',         // Community access
  'CommunityForum',       // Community forum
  'ForumPost',            // Community forum posts
  'CreateForumPost',      // Create forum posts
  'SocialFeed',           // Social feed
  'Events',               // Social events
  'EventDetail',          // Event details
  'Challenges',           // Basic challenges
  'SpiritualHub',         // Spiritual community
  'SpiritualForum'        // Spiritual forum
];

// Pages that require subscription after trial (Basic plan and above)
const PREMIUM_PAGES = [
  // Basic Plan Features
  'Dashboard', 'Organizer', 'LifeCoach', 'MindfulnessHub', 'MindfulGames', 
  'MindfulExercises', 'MindfulTools', 'JournalStudio', 'HeartShiftJournal',
  'VisionBoard', 'MemoryVault', 'GratitudeJournal', 'PlannersHub', 
  'GentleFlowPlanner', 'Year2026Hub', 'TherapyTools',
  // Pro Plan Features  
  'Wellness', 'WellnessTools', 'WellnessPlans', 'CoachingProgress',
  'Family', 'MealPlanner', 'WomensHealthHub', 'HomeworkHub', 
  'KidsCreativeStudio', 'SoulLink', 'Discover', 'SafePlace', 'HeartfulHolidays',
  // Executive Plan Features
  'FindPractitioners', 'ClientPortal', 'CareHub', 'FindCare', 
  'SocialMediaManager', 'Workspace', 'Marketplace', 'AgentsHub',
  'AppointmentScheduler', 'ParentDashboard', 'TranslatorHub',
  // Other premium features
  'Messages', 'WellnessShop', 'IntegrationsHub', 'ExportData'
];

const PaywallGate = ({ children, currentPageName }) => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const hasActiveSubscription = user?.subscription_status === 'active' || 
                                 user?.subscription_tier === 'pro' || 
                                 user?.subscription_tier === 'executive' ||
                                 user?.has_made_purchase === true;

  useEffect(() => {
    if (!user) {
      setShowPaywall(false);
      return;
    }

    // Admin users have full access
    if (user.role === 'admin') {
      setShowPaywall(false);
      return;
    }

    // Calculate trial days left
    const createdDate = new Date(user.created_date);
    const now = new Date();
    const daysSinceSignup = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 3 - daysSinceSignup);
    setTrialDaysLeft(daysLeft);

    // User has 3-day free trial
    const hasActiveTrial = daysLeft > 0;

    // Free pages are always accessible
    if (FREE_PAGES.includes(currentPageName)) {
      setShowPaywall(false);
      return;
    }

    // Premium pages require subscription after trial ends
    const isPremiumPage = PREMIUM_PAGES.includes(currentPageName);
    const shouldLock = isPremiumPage && !hasActiveSubscription && !hasActiveTrial;

    setShowPaywall(shouldLock);
  }, [currentPageName, user, hasActiveSubscription]);

  if (!user || !showPaywall) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-4 border-purple-200 shadow-2xl bg-white/90 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
          
          <CardHeader className="text-center pb-4 pt-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <BookOpen className="w-10 h-10 text-white" />
            </motion.div>
            
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Your 3-Day Free Trial Has Ended
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Upgrade to continue accessing all premium features, AI tools, and wellness resources!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <div className="text-center">
              <Link to={createPageUrl('Upgrade')}>
                <Button className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl text-lg font-bold">
                  View All Plans & Features
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-semibold text-gray-700">Secure Payment</p>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-xs font-semibold text-gray-700">Cancel Anytime</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-semibold text-gray-700">Instant Access</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Have questions? <Link to={createPageUrl('About')} className="text-purple-600 hover:text-purple-700 font-semibold">Contact support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaywallGate;