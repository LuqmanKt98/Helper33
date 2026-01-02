
import React from 'react';
import { Check, X, Sparkles, Crown, Gift } from 'lucide-react';

// 💎 DobryLife Membership Tiers Configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    icon: Gift,
    color: 'from-gray-400 to-gray-600',
    price: { monthly: 0, yearly: 0 },
    tagline: 'Explore DobryLife basics',
    features: {
      dashboard: { enabled: true, label: 'Dashboard Access', hidden: true },
      home: { enabled: true, label: 'Home Page', hidden: true },
      ourStory: { enabled: true, label: 'Our Story & Mission', hidden: true },
      griefCoachBasic: { enabled: true, limited: true, label: 'Basic Grief Coach', highlight: true },
      gratitudeJournalAdult: { enabled: true, label: 'Gratitude Journal (Adults) - Because we are grateful for you', highlight: true },
      gratitudeJournalKids: { enabled: true, label: 'Gratitude Journal (Kids) - Because we are grateful for you', highlight: true },
      homeworkHelper: { enabled: true, limited: true, label: 'Kids Homework Helper (Sponsored by Dobry Foundation)', highlight: true },
      resources: { enabled: true, limited: true, label: 'Resources (View Only)', highlight: true },
      lifeCoach: { enabled: false, label: 'Life Coaches' },
      soulLink: { enabled: false, label: 'SoulLink AI Companion' },
      kidsStudio: { enabled: false, label: 'Kids Studio' },
      wellnessHub: { enabled: false, label: 'Wellness Hub' },
      wassupChats: { enabled: false, label: 'Wassup Chats' },
      booksJournals: { enabled: false, label: 'Books & Journals' },
      storyHub: { enabled: false, label: 'Story Hub' },
      premiumAI: { enabled: false, label: 'Premium AI Features' }
    }
  },
  
  PRO: {
    id: 'pro',
    name: 'DobryPro',
    icon: Sparkles,
    color: 'from-blue-500 to-indigo-600',
    price: { monthly: 14, yearly: 140 },
    tagline: 'For individuals and families ready to integrate wellness into everyday life',
    popular: true,
    description: 'Everything in DobryBasic plus',
    features: {
      allBasicFeatures: { enabled: true, label: 'Access to all basic features of the DobryLife ecosystem', highlight: true },
      lifeCoaches: { enabled: true, label: 'Access to Life Coaches', highlight: true },
      personalizedAI: { enabled: true, label: 'Personalized AI guidance', highlight: true },
      griefCoach: { enabled: true, label: 'Unlimited Grief Coach conversations' },
      soulLink: { enabled: true, label: 'SoulLink – AI companion for emotional connection & self-discovery', highlight: true },
      kidsStudioFull: { enabled: true, label: 'Full Kids Studio access – interactive learning, journaling & play', highlight: true },
      wellnessHubFull: { enabled: true, label: 'Full Wellness Hub – meditation, self-care tracking & lifestyle planning', highlight: true },
      mindfulnessExercises: { enabled: true, label: 'All mindfulness exercises & guided meditations' },
      wellnessTracking: { enabled: true, label: 'Advanced wellness tracking & analytics' },
      wassupChatsLimited: { enabled: true, limited: true, label: 'Wassup Chats (limited access) – AI wellness agent conversations', highlight: true },
      wellnessInsights: { enabled: true, label: 'Regular wellness insights, routines & habit tools', highlight: true },
      habitTracker: { enabled: true, label: 'Habit tracker with AI insights' },
      mealPlanner: { enabled: true, label: 'Meal planner & recipe search' },
      visionBoard: { enabled: true, label: 'Vision board with goal tracking' },
      allJournals: { enabled: true, label: 'All guided journals (Gratitude, Heart Shift, etc.)' },
      voiceJournaling: { enabled: true, label: 'Voice journaling' },
      familyUnlimited: { enabled: true, label: 'Unlimited family members' },
      familyCalendar: { enabled: true, label: 'Shared family calendar' },
      choreScheduler: { enabled: true, label: 'Chore scheduler' },
      lifeTemplates: { enabled: true, label: 'Life templates (full customization)' },
      customThemes: { enabled: true, label: 'Custom therapeutic themes' },
      adFree: { enabled: true, label: 'Ad-free experience' },
      booksJournals: { enabled: false, separatePurchase: true, label: 'Books & Journals (Separate purchase)' },
      storyHubFull: { enabled: false, label: 'Story Hub (Read only - sharing requires Executive)' },
      premiumAI: { enabled: false, label: 'Premium AI Features (Executive only)' },
      wassupUnlimited: { enabled: false, label: 'Unlimited Wassup Chats (Executive only)' },
      priorityAccess: { enabled: false, label: 'Priority beta access (Executive only)' },
      executiveBadge: { enabled: false, label: 'Executive Partner badge (Executive only)' }
    }
  },
  
  EXECUTIVE: {
    id: 'executive',
    name: 'Dobry Executive',
    icon: Crown,
    color: 'from-amber-500 via-orange-500 to-red-500',
    price: { monthly: 55, yearly: 499 },
    tagline: '', // Tagline removed as per the change request
    description: 'Complete access to the DobryLife ecosystem with premium features, exclusive content, and community connections.',
    features: {
      // Everything in DobryPro
      everythingInPro: { enabled: true, label: 'Everything in DobryPro', highlight: true },
      
      // 📚 Books & Journals - FREE
      booksJournalsFree: { enabled: true, included: true, label: 'Free access to Books & Journals (entire digital DobryLife collection)', highlight: true },
      infinityJournal: { enabled: true, included: true, label: '✨ Infinity Journal - Ruby\'s Life Story ($24 value)' },
      thingsTheyTook: { enabled: true, included: true, label: '✨ The Things They Took ($14.99 value)' },
      futureBooks: { enabled: true, included: true, label: '✨ All future books included at release' },
      
      // 🕊️ Story Hub - Full Access
      storyHubFull: { enabled: true, label: 'Full Story Hub access – share, read & preserve personal/family stories', highlight: true },
      storySubmission: { enabled: true, label: 'Submit and publish your own stories' },
      storyPreservation: { enabled: true, label: 'Private story vault with AI preservation' },
      
      // 🤖 Premium AI Features
      premiumAI: { enabled: true, label: 'Premium AI Features – customized emotional companions & productivity assistants', highlight: true },
      aiVoiceCloning: { enabled: true, label: 'AI voice cloning (unlimited)' },
      customPersonas: { enabled: true, label: 'Custom AI personas tailored to your needs' },
      advancedAI: { enabled: true, label: 'Advanced AI training & personalization' },
      
      // 💬 Wassup Chats - Unlimited
      wassupUnlimited: { enabled: true, label: 'Wassup Chat with AI Agents – unlimited conversations for coaching, journaling & organization', highlight: true },
      
      // 💡 Priority Access
      priorityAccess: { enabled: true, label: 'Priority access to new releases, beta programs & AI training feedback', highlight: true },
      earlyFeatures: { enabled: true, label: 'Early access to new features before public release' },
      betaTesting: { enabled: true, label: 'Exclusive beta testing opportunities' },
      aiTrainingFeedback: { enabled: true, label: 'Participate in AI training & influence development' },
      
      // 🪶 Executive Recognition
      executiveBadge: { enabled: true, label: '"Executive Partner" digital badge & premium member recognition', highlight: true },
      
      // 💫 Future Expansion
      wellnessRetreats: { enabled: true, label: 'Early invitations to Future Wellness Retreats', highlight: true },
      foundationEvents: { enabled: true, label: 'Foundation Events access' },
      impactPartnerGatherings: { enabled: true, label: 'Impact Partner Gatherings – connect with families, healers & innovators' },
      
      // VIP Services
      dedicatedSupport: { enabled: true, label: 'Dedicated account manager' },
      whiteGloveOnboarding: { enabled: true, label: '1-on-1 white-glove onboarding' },
      prioritySupport: { enabled: true, label: '24/7 priority support' },
      
      // Advanced Features
      chronicIllnessHub: { enabled: true, label: 'Chronic Illness Hub (full suite)' },
      hipaaCompliant: { enabled: true, label: 'HIPAA-compliant features' },
      apiAccess: { enabled: true, label: 'API access for custom integrations' },
      advancedAnalytics: { enabled: true, label: 'Deep analytics & insights dashboard' }
    }
  }
};

export function hasFeatureAccess(user, featureKey) {
  if (!user) {
    return SUBSCRIPTION_PLANS.FREE.features[featureKey]?.enabled || false;
  }
  
  const planType = user.plan_type || 'free';
  let currentPlan;
  
  if (planType === 'free') {
    currentPlan = SUBSCRIPTION_PLANS.FREE;
  } else if (planType === 'pro_monthly' || planType === 'pro_yearly') {
    currentPlan = SUBSCRIPTION_PLANS.PRO;
  } else if (planType === 'executive_monthly' || planType === 'executive_yearly') {
    currentPlan = SUBSCRIPTION_PLANS.EXECUTIVE;
  } else if (planType === 'journal') {
    const planWithBook = { ...SUBSCRIPTION_PLANS.FREE };
    planWithBook.features.infinityJournal = { enabled: true, label: 'Infinity Journal Book' };
    currentPlan = planWithBook;
  } else if (planType === 'things_they_took') {
    const planWithBook = { ...SUBSCRIPTION_PLANS.FREE };
    planWithBook.features.thingsTheyTook = { enabled: true, label: 'The Things They Took' };
    currentPlan = planWithBook;
  } else {
    currentPlan = SUBSCRIPTION_PLANS.FREE;
  }
  
  const feature = currentPlan.features[featureKey];
  return feature?.enabled || false;
}

export function getUserPlan(user) {
  if (!user) return SUBSCRIPTION_PLANS.FREE;
  
  const planType = user.plan_type || 'free';
  
  if (planType === 'pro_monthly' || planType === 'pro_yearly') {
    return SUBSCRIPTION_PLANS.PRO;
  } else if (planType === 'executive_monthly' || planType === 'executive_yearly') {
    return SUBSCRIPTION_PLANS.EXECUTIVE;
  }
  
  return SUBSCRIPTION_PLANS.FREE;
}

export default function SubscriptionPlansComparison() {
  const plans = [SUBSCRIPTION_PLANS.PRO, SUBSCRIPTION_PLANS.EXECUTIVE];
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
          💎 DobryLife Membership Tiers
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          DobryLife is more than a platform — it's a personalized ecosystem for healing, connection, and mindful living. Each membership tier supports different levels of engagement with intelligent tools, guided wellness experiences, and AI-powered companions.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const allFeatures = Object.entries(plan.features).filter(([_, feature]) => !feature.hidden);
          const highlightedFeatures = allFeatures.filter(([_, feature]) => feature.highlight);
          const otherFeatures = allFeatures.filter(([_, feature]) => !feature.highlight);
          
          return (
            <div 
              key={plan.id}
              className={`relative rounded-3xl border-2 p-8 ${
                plan.popular ? 'border-blue-500 shadow-2xl' : 'border-orange-400 shadow-xl'
              } bg-white`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${plan.color} mb-4 shadow-lg`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
                {plan.tagline && <p className="text-gray-600 text-sm mb-6 italic">{plan.tagline}</p>}
                
                <div className="text-5xl font-bold mb-2">
                  ${plan.price.monthly}
                  <span className="text-xl text-gray-600">/mo</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  or ${plan.price.yearly}/year <span className="text-green-600 font-semibold">(save ${(plan.price.monthly * 12) - plan.price.yearly})</span>
                </p>
                
                <p className="text-sm text-gray-700 leading-relaxed">{plan.description}</p>
              </div>
              
              <div className="space-y-3 mb-8">
                <p className="font-semibold text-lg mb-4">Includes:</p>
                
                {highlightedFeatures.map(([key, feature]) => (
                  <div key={key} className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800 font-medium">
                      {feature.label}
                      {feature.included && ' ✨'}
                      {feature.limited && ' (limited)'}
                    </span>
                  </div>
                ))}
                
                {otherFeatures.slice(0, 8).map(([key, feature]) => (
                  <div key={key} className="flex items-start gap-3">
                    {feature.enabled ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.label}
                      {feature.included && ' ✨'}
                      {feature.separatePurchase && ' (separate purchase)'}
                    </span>
                  </div>
                ))}
                
                {otherFeatures.length > 8 && (
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    + {otherFeatures.length - 8} more features
                  </p>
                )}
              </div>
              
              <button 
                className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                }`}
              >
                Upgrade to {plan.name}
              </button>
              
              {plan.id === 'executive' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong className="text-orange-700">💫 Future Expansion:</strong> Executive members receive early invitations to Wellness Retreats, Foundation Events, and Impact Partner Gatherings — connecting our growing community of families, healers, and innovators.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
        <div className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6 max-w-2xl">
          <h4 className="font-semibold text-lg mb-3">🆓 Free Tier Available</h4>
          <p className="text-sm text-gray-700 mb-4">
            Explore DobryLife with limited access to basic features including Dashboard, Our Story, Basic Grief Coach, Gratitude Journals, Kids Homework Helper, and Resources.
          </p>
          <button className="bg-white text-gray-700 px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all">
            Start Free
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
        <p>✨ Included in plan - no additional purchase required</p>
        <p>🔒 All plans include bank-level encryption and data privacy</p>
        <p>💳 30-day money-back guarantee • Cancel anytime</p>
      </div>
    </div>
  );
}
