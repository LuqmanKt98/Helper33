import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { createStripeCheckoutSession } from '@/functions/createStripeCheckoutSession';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Download,
  ExternalLink,
  Heart,
  Star,
  Crown,
  Gift,
  BookOpen,
  ShoppingBag,
  Search,
  Zap,
  CheckCircle,
  ArrowRight,
  FileText,
  Palette,
  Music,
  Brain,
  Leaf,
  Church,
  Cross,
  Feather,
  Sun,
  Moon,
  CreditCard
} from 'lucide-react';
import SEO from '@/components/SEO';

// Floating animation
const FloatingElement = ({ emoji, delay = 0 }) => (
  <motion.div
    initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
    animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }}
    transition={{ duration: 20, delay, repeat: Infinity, ease: "linear" }}
    className="absolute pointer-events-none text-2xl"
  >
    {emoji}
  </motion.div>
);

// Product Card Component
const ProductCard = ({ product, onAction }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className={`h-full overflow-hidden border-2 ${product.featured ? 'border-amber-400 shadow-xl' : 'border-purple-200'} bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all`}>
        {product.featured && (
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-3 -right-3 z-10"
          >
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 shadow-lg">
              ⭐ Featured
            </Badge>
          </motion.div>
        )}

        {/* Image/Preview */}
        <div className={`relative h-48 bg-gradient-to-br ${product.gradient} overflow-hidden`}>
          <motion.div
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <product.icon className="w-20 h-20 text-white/80" />
            )}
          </motion.div>

          {product.badge && (
            <Badge className={`absolute top-3 left-3 ${product.badgeColor || 'bg-purple-500'} text-white`}>
              {product.badge}
            </Badge>
          )}

          {product.price === 0 && (
            <Badge className="absolute bottom-3 right-3 bg-green-500 text-white text-lg px-3">
              FREE
            </Badge>
          )}
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h3>
            {product.category && (
              <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                {product.category}
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

          {/* Features */}
          {product.features && (
            <div className="space-y-1.5 mb-4">
              {product.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through mr-2">${product.originalPrice}</span>
              )}
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {product.price === 0 ? 'FREE' : `$${product.price}`}
              </span>
              {product.priceType === 'subscription' && <span className="text-xs text-gray-500">/mo</span>}
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={() => onAction(product)}
                className={product.buttonGradient || 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}
              >
                {product.buttonIcon}
                <span className="ml-1.5">{product.buttonText}</span>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Subscription Plan Card
const SubscriptionPlanCard = ({ plan, onSubscribe }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="relative"
  >
    {plan.popular && (
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
      >
        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 shadow-lg">
          🌟 Most Popular
        </Badge>
      </motion.div>
    )}
    
    <Card className={`h-full ${plan.popular ? 'border-4 border-purple-400 shadow-2xl' : 'border-2 border-gray-200'} bg-white/95`}>
      <div className={`p-6 ${plan.popular ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
            <plan.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-500">{plan.tagline}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${plan.price}
          </span>
          <span className="text-gray-500">/{plan.period}</span>
          {plan.savings && (
            <Badge className="ml-2 bg-green-100 text-green-700">{plan.savings}</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle className={`w-4 h-4 mt-0.5 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
              <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => onSubscribe(plan)}
          disabled={plan.buttonText.includes('Current')}
          className={`w-full py-5 ${plan.buttonText.includes('Current') ? 'bg-gray-400 cursor-not-allowed' : plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gray-800 hover:bg-gray-900'}`}
        >
          {plan.buttonText}
          {!plan.buttonText.includes('Current') && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Shop() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  // Handle payment cancelled from URL params (success handled on Home page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentCancelled = urlParams.get('payment_cancelled');

    if (paymentCancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime.');
      window.history.replaceState({}, '', createPageUrl('Shop'));
    }
  }, []);

  // Subscription Plans with correct Stripe price IDs
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      tagline: 'Essential wellness tools',
      price: 9,
      period: 'month',
      icon: Star,
      gradient: 'from-blue-500 to-cyan-500',
      buttonText: user?.subscription_tier === 'basic' ? 'Current Plan' : 'Get Basic',
      stripePrice: 'price_1SGak0KqfxTwHJZ0VLiu7LzS', // Pro Membership (used for basic)
      features: [
        { text: 'Life Coach AI', included: true },
        { text: 'Journal Studio', included: true },
        { text: 'Vision Board', included: true },
        { text: 'Memory Vault', included: true },
        { text: 'All planning tools', included: true },
        { text: 'Family Hub', included: false },
        { text: 'AI Agents (13+)', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Complete family wellness',
      price: 14,
      period: 'month',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
      savings: 'Best Value',
      buttonText: user?.subscription_tier === 'pro' ? 'Current Plan' : 'Get Pro',
      stripePrice: 'price_1SGbCkKqfxTwHJZ0IOMbI2RN', // DobryLife Pro
      features: [
        { text: 'Everything in Basic', included: true },
        { text: 'Family Hub & Calendar', included: true },
        { text: 'Meal Planner with AI', included: true },
        { text: "Women's Health tracker", included: true },
        { text: 'Homework Hub (AI tutoring)', included: true },
        { text: 'Kids Creative Studio', included: true },
        { text: 'SoulLink companion', included: true }
      ]
    },
    {
      id: 'executive',
      name: 'Executive',
      tagline: 'For professionals & businesses',
      price: 55,
      period: 'month',
      icon: Crown,
      gradient: 'from-orange-500 to-red-500',
      savings: 'Premium',
      buttonText: user?.subscription_tier === 'executive' ? 'Current Plan' : 'Go Executive',
      stripePrice: 'price_1SLxC8KqfxTwHJZ0zehjDYp9', // DobryLife Executive
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Practitioner Dashboard', included: true },
        { text: 'Social Media Manager AI', included: true },
        { text: 'Marketplace access', included: true },
        { text: 'All 13+ AI agents', included: true },
        { text: 'Custom AI training', included: true },
        { text: 'Priority support & API', included: true }
      ]
    }
  ];

  // Books for sale (on platform)
  const platformBooks = [
    {
      id: 'infinity-journal',
      name: 'Infinity Journal',
      description: 'AI-powered 21-day guided journey through grief and healing with therapeutic prompts.',
      price: 24,
      originalPrice: 39,
      gradient: 'from-blue-500 to-indigo-600',
      icon: BookOpen,
      badge: '✨ Best Seller',
      badgeColor: 'bg-purple-500',
      buttonText: 'Get Journal',
      buttonIcon: <BookOpen className="w-4 h-4" />,
      category: 'Digital Book',
      features: ['AI-guided prompts', 'Voice journaling', 'Progress tracking', 'Lifetime access'],
      stripePrice: 'price_1SGaoyKqfxTwHJZ0VfF2nsz4',
      link: 'InfinityJournal'
    },
    {
      id: 'things-they-took',
      name: 'Things They Took',
      description: 'A profound book about love, loss, and the enduring power of memory. By Ruby Dobry.',
      price: 14.99,
      gradient: 'from-purple-500 to-pink-600',
      icon: Heart,
      badge: '📖 New Release',
      badgeColor: 'bg-pink-500',
      buttonText: 'Read Now',
      buttonIcon: <BookOpen className="w-4 h-4" />,
      category: 'Digital Book',
      features: ['Touching grief narrative', 'Healing insights', 'Read on any device'],
      stripePrice: 'price_1SLyMbKqfxTwHJZ0uHBkCbqT',
      link: 'ThingsTheyTookBook'
    },
    {
      id: 'cry-me-a-river',
      name: 'Cry Me A River',
      description: 'Poetry and reflections on grief, healing, and finding light in darkness.',
      price: 12.99,
      gradient: 'from-cyan-500 to-blue-600',
      icon: Feather,
      badge: '🌊 Poetry',
      badgeColor: 'bg-cyan-500',
      buttonText: 'Read Now',
      buttonIcon: <BookOpen className="w-4 h-4" />,
      category: 'Digital Book',
      features: ['Healing poetry', 'Beautiful illustrations', 'Reflection prompts'],
      link: 'CryMeARiverBook'
    },
    {
      id: 'the-voice',
      name: 'The Voice',
      description: 'Finding your inner voice through grief and transformation.',
      price: 11.99,
      gradient: 'from-amber-500 to-orange-600',
      icon: Music,
      badge: '🎭 Memoir',
      badgeColor: 'bg-amber-500',
      buttonText: 'Read Now',
      buttonIcon: <BookOpen className="w-4 h-4" />,
      category: 'Digital Book',
      features: ['Personal journey', 'Self-discovery', 'Healing exercises'],
      link: 'TheVoiceBook'
    }
  ];

  // Spiritual Books (Amazon links)
  const spiritualBooks = [
    {
      id: 'bible-study-journal',
      name: 'Daily Bible Study Journal',
      description: 'A beautiful guided journal for daily scripture study and reflection.',
      price: 14.99,
      gradient: 'from-indigo-500 to-purple-600',
      icon: Cross,
      badge: '✝️ Faith',
      badgeColor: 'bg-indigo-500',
      buttonText: 'View on Amazon',
      buttonIcon: <ExternalLink className="w-4 h-4" />,
      buttonGradient: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
      category: 'Spiritual',
      features: ['365 daily prompts', 'Scripture references', 'Prayer sections'],
      amazonUrl: 'https://www.amazon.com/s?k=bible+study+journal'
    },
    {
      id: 'prayer-journal',
      name: 'Prayer & Gratitude Journal',
      description: 'Document your prayers and cultivate a heart of gratitude.',
      price: 12.99,
      gradient: 'from-rose-500 to-pink-600',
      icon: Church,
      badge: '🙏 Prayer',
      badgeColor: 'bg-rose-500',
      buttonText: 'View on Amazon',
      buttonIcon: <ExternalLink className="w-4 h-4" />,
      buttonGradient: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
      category: 'Spiritual',
      features: ['Prayer tracking', 'Gratitude lists', 'Reflection pages'],
      amazonUrl: 'https://www.amazon.com/s?k=prayer+gratitude+journal'
    },
    {
      id: 'devotional-women',
      name: "Women's Devotional",
      description: 'Daily devotions designed specifically for women seeking spiritual growth.',
      price: 16.99,
      gradient: 'from-purple-500 to-violet-600',
      icon: Sun,
      badge: '👩 Women',
      badgeColor: 'bg-purple-500',
      buttonText: 'View on Amazon',
      buttonIcon: <ExternalLink className="w-4 h-4" />,
      buttonGradient: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
      category: 'Spiritual',
      features: ['Daily readings', 'Guided reflections', 'Community support'],
      amazonUrl: 'https://www.amazon.com/s?k=womens+devotional'
    },
    {
      id: 'meditation-scripture',
      name: 'Scripture Meditation Guide',
      description: 'Learn to meditate on scripture and deepen your spiritual practice.',
      price: 13.99,
      gradient: 'from-teal-500 to-emerald-600',
      icon: Moon,
      badge: '🧘 Meditation',
      badgeColor: 'bg-teal-500',
      buttonText: 'View on Amazon',
      buttonIcon: <ExternalLink className="w-4 h-4" />,
      buttonGradient: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
      category: 'Spiritual',
      features: ['Meditation techniques', 'Scripture verses', 'Daily practice'],
      amazonUrl: 'https://www.amazon.com/s?k=christian+meditation+guide'
    }
  ];

  // Downloadable & Interactive PDFs
  const downloadableItems = [
    {
      id: 'mindful-coloring',
      name: 'Mindfulness Coloring Book',
      description: 'Beautiful mandala designs with inspiring quotes. Print at home and color your way to calm!',
      price: 0,
      gradient: 'from-teal-500 to-cyan-600',
      icon: Palette,
      badge: '🎨 Printable',
      badgeColor: 'bg-green-500',
      buttonText: 'Download Free',
      buttonIcon: <Download className="w-4 h-4" />,
      buttonGradient: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700',
      category: 'Printable',
      featured: true,
      features: ['20+ coloring pages', 'Inspiring quotes', 'Print unlimited'],
      downloadUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/e47cd9574_MindfulnessColoringQuoteRemindersBook.pdf'
    },
    {
      id: 'therapy-worksheets',
      name: 'Therapy Worksheets Bundle',
      description: 'Professional-grade CBT, DBT, and mindfulness worksheets for mental health support.',
      price: 0,
      gradient: 'from-purple-500 to-indigo-600',
      icon: FileText,
      badge: '📋 Interactive',
      badgeColor: 'bg-purple-500',
      buttonText: 'Access Tools',
      buttonIcon: <FileText className="w-4 h-4" />,
      category: 'Worksheets',
      features: ['CBT worksheets', 'DBT skills', 'Fillable PDFs'],
      link: 'TherapyTools'
    },
    {
      id: 'grief-workbook',
      name: 'Grief Processing Workbook',
      description: 'A gentle guide through the grief journey with exercises and reflections.',
      price: 0,
      gradient: 'from-rose-500 to-pink-600',
      icon: Heart,
      badge: '💜 Healing',
      badgeColor: 'bg-rose-500',
      buttonText: 'Download Free',
      buttonIcon: <Download className="w-4 h-4" />,
      buttonGradient: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700',
      category: 'Workbook',
      features: ['Grief exercises', 'Memory preservation', 'Healing prompts'],
      link: 'TherapyTools'
    },
    {
      id: 'wellness-planner',
      name: 'Daily Wellness Planner',
      description: 'Track your mood, habits, and self-care routines with this printable planner.',
      price: 0,
      gradient: 'from-green-500 to-emerald-600',
      icon: Leaf,
      badge: '🌿 Wellness',
      badgeColor: 'bg-green-500',
      buttonText: 'Download Free',
      buttonIcon: <Download className="w-4 h-4" />,
      buttonGradient: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
      category: 'Planner',
      features: ['Mood tracking', 'Habit tracker', 'Self-care checklist'],
      link: 'PlannersHub'
    },
    {
      id: 'kids-journal',
      name: 'Kids Creative Journal',
      description: 'Fun and engaging journal pages designed for children to express themselves.',
      price: 0,
      gradient: 'from-amber-500 to-orange-600',
      icon: Brain,
      badge: '🧒 Kids',
      badgeColor: 'bg-amber-500',
      buttonText: 'Access Tools',
      buttonIcon: <Sparkles className="w-4 h-4" />,
      category: 'Kids',
      features: ['Drawing prompts', 'Emotion cards', 'Fun activities'],
      link: 'KidsCreativeStudio'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Products', icon: ShoppingBag },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'spiritual', label: 'Spiritual', icon: Cross },
    { id: 'downloads', label: 'Downloads', icon: Download }
  ];

  const handleAction = async (product) => {
    if (product.amazonUrl) {
      window.open(product.amazonUrl, '_blank');
      return;
    }
    
    if (product.downloadUrl) {
      window.open(product.downloadUrl, '_blank');
      return;
    }
    
    if (product.link) {
      window.location.href = createPageUrl(product.link);
      return;
    }

    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    // If product has a stripe price, create checkout session
    if (product.stripePrice) {
      setIsCheckingOut(true);
      try {
        const response = await createStripeCheckoutSession({
          priceId: product.stripePrice,
          metadata: {
            product_type: product.category === 'Digital Book' ? 'book' : 'one_time',
            product_id: product.id,
            book_id: product.id,
            user_field_to_update: product.id === 'infinity-journal' ? 'infinity_book_purchased' : 
                                  product.id === 'things-they-took' ? 'things_they_took_purchased' : null
          }
        });
        
        if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          toast.error('Failed to create checkout session');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error('Failed to start checkout. Please try again.');
      } finally {
        setIsCheckingOut(false);
      }
      return;
    }

    // Navigate to upgrade for subscription or checkout for products
    window.location.href = createPageUrl('Upgrade');
  };

  const handleSubscribe = async (plan) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    
    if (plan.id === 'free') {
      toast.info('You are already on the free plan!');
      return;
    }

    if (plan.stripePrice) {
      setIsCheckingOut(true);
      try {
        const response = await createStripeCheckoutSession({
          priceId: plan.stripePrice,
          metadata: {
            product_type: 'subscription',
            tier: plan.id,
            plan_name: plan.name
          }
        });
        
        if (response.data?.url) {
          window.location.href = response.data.url;
        } else {
          toast.error('Failed to create checkout session');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error('Failed to start checkout. Please try again.');
      } finally {
        setIsCheckingOut(false);
      }
    } else {
      window.location.href = createPageUrl('Upgrade');
    }
  };

  // Filter products based on search
  const filterProducts = (products) => {
    if (!searchQuery) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <>
      <SEO 
        title="Shop - Books, Subscriptions & Wellness Tools | Helper33"
        description="Shop therapeutic books, subscription plans, spiritual resources, and free downloadable worksheets at Helper33."
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {['🛒', '📚', '✨', '💜', '🎁', '📖', '🙏', '🎨'].map((emoji, i) => (
            <FloatingElement key={i} emoji={emoji} delay={i * 2.5} />
          ))}
          
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 -left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-20 -right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <ShoppingBag className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Helper33 Shop
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover books, subscriptions, spiritual resources, and free therapeutic tools to support your wellness journey ✨
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 rounded-full border-2 border-purple-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-purple-50 border-2 border-purple-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Subscription Plans Section */}
          {(activeTab === 'all' || activeTab === 'subscriptions') && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-16"
            >
              <div className="text-center mb-8">
                <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5">
                  <Crown className="w-4 h-4 mr-2 inline" />
                  Subscription Plans
                </Badge>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                  Choose Your Wellness Plan
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {subscriptionPlans.map((plan) => (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                    onSubscribe={handleSubscribe}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Books Section */}
          {(activeTab === 'all' || activeTab === 'books') && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-16"
            >
              <div className="text-center mb-8">
                <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5">
                  <BookOpen className="w-4 h-4 mr-2 inline" />
                  Digital Books
                </Badge>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Books & Journals
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filterProducts(platformBooks).map((product) => (
                  <ProductCard key={product.id} product={product} onAction={handleAction} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Spiritual Books Section */}
          {(activeTab === 'all' || activeTab === 'spiritual') && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-16"
            >
              <div className="text-center mb-8">
                <Badge className="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5">
                  <Cross className="w-4 h-4 mr-2 inline" />
                  Spiritual Resources
                </Badge>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Faith & Spiritual Books
                </h2>
                <p className="text-gray-600 mt-2">Available on Amazon - click to view</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filterProducts(spiritualBooks).map((product) => (
                  <ProductCard key={product.id} product={product} onAction={handleAction} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Downloadable Items Section */}
          {(activeTab === 'all' || activeTab === 'downloads') && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-16"
            >
              <div className="text-center mb-8">
                <Badge className="mb-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-1.5">
                  <Download className="w-4 h-4 mr-2 inline" />
                  Free Downloads
                </Badge>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                  Worksheets & Printables
                </h2>
                <p className="text-gray-600 mt-2">Free therapeutic tools and resources</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterProducts(downloadableItems).map((product) => (
                  <ProductCard key={product.id} product={product} onAction={handleAction} />
                ))}
              </div>
            </motion.section>
          )}

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-10 text-center relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-16 -right-16 w-32 h-32 bg-white/10 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/10 rounded-full"
                />
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-5xl mb-4"
                >
                  🎁
                </motion.div>
                
                <h2 className="text-3xl font-bold mb-3">
                  Start Your Free Trial Today
                </h2>
                <p className="text-purple-100 mb-6 max-w-xl mx-auto">
                  Get 3 days of full access to all premium features, books, and tools - no credit card required!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => user ? window.location.href = createPageUrl('Dashboard') : base44.auth.redirectToLogin()}
                      className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-5 text-lg shadow-lg"
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      Start Free Trial
                    </Button>
                  </motion.div>
                  
                  <Link to={createPageUrl('Upgrade')}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="border-2 border-white text-white hover:bg-white/10 px-8 py-5 text-lg"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        View All Plans
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </>
  );
}