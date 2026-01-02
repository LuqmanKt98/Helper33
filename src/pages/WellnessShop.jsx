import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Download,
  Printer,
  Heart,
  Star,
  Crown,
  Gift,
  Palette,
  BookOpen,
  Brain,
  Leaf,
  Music,
  Check,
  ArrowRight,
  ShoppingCart,
  Paintbrush
} from 'lucide-react';
import SEO from '@/components/SEO';
import InteractiveColoringBook from '@/components/coloring/InteractiveColoringBook';

// Floating elements
const FloatingElement = ({ emoji, delay = 0, duration = 15 }) => (
  <motion.div
    initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 0, rotate: 0 }}
    animate={{
      y: '-10vh',
      opacity: [0, 1, 1, 0],
      rotate: 360
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
    className="absolute pointer-events-none text-3xl"
  >
    {emoji}
  </motion.div>
);

// Product Card Component
const ProductCard = ({ product, user, onPurchase, featured = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      {featured && (
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-4 -right-4 z-10"
        >
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm shadow-lg">
            ⭐ Featured
          </Badge>
        </motion.div>
      )}
      
      <Card className={`h-full overflow-hidden border-3 ${featured ? 'border-amber-400' : 'border-purple-200'} bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all`}>
        {/* Image/Preview */}
        <div className={`relative h-56 bg-gradient-to-br ${product.gradient} overflow-hidden`}>
          <motion.div
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <product.icon className="w-24 h-24 text-white/80" />
            )}
          </motion.div>
          
          {/* Sparkle overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/20"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="absolute text-2xl"
                    style={{ left: `${20 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
                  >
                    ✨
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {product.badge && (
            <Badge className={`absolute top-3 left-3 ${product.badgeColor} text-white`}>
              {product.badge}
            </Badge>
          )}
        </div>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
          
          {/* Features */}
          <div className="space-y-2 mb-4">
            {product.features?.slice(0, 3).map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </motion.div>
            ))}
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-4">
            <div>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through mr-2">${product.originalPrice}</span>
              )}
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {product.price === 0 ? 'FREE' : `$${product.price}`}
              </span>
              {product.priceType === 'subscription' && <span className="text-sm text-gray-500">/mo</span>}
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onPurchase(product)}
                className={`${product.buttonGradient || 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}
              >
                {product.buttonIcon || <ShoppingCart className="w-4 h-4 mr-2" />}
                {product.buttonText || 'Get Now'}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Subscription Plan Card
const SubscriptionCard = ({ plan, isPopular, user, onSubscribe }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="relative"
  >
    {isPopular && (
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
      >
        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 text-sm shadow-lg">
          🌟 Most Popular
        </Badge>
      </motion.div>
    )}
    
    <Card className={`h-full overflow-hidden ${isPopular ? 'border-4 border-purple-400 shadow-2xl' : 'border-2 border-gray-200'} bg-white/95 backdrop-blur-sm`}>
      <div className={`p-6 ${isPopular ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-xl ${isPopular ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'} flex items-center justify-center shadow-lg`}>
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
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={`w-5 h-5 rounded-full ${feature.included ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className={`w-3 h-3 ${feature.included ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                {feature.text}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => onSubscribe(plan)}
            className={`w-full py-6 text-lg ${isPopular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gray-800 hover:bg-gray-900'}`}
          >
            {plan.buttonText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function WellnessShop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showColoringBook, setShowColoringBook] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const coloringBookUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/e47cd9574_MindfulnessColoringQuoteRemindersBook.pdf";

  const products = [
    {
      id: 'mindful-coloring',
      name: 'My Mindful Journey',
      description: 'Beautiful mindfulness coloring book with inspiring quotes. Print at home and color your way to calm!',
      price: 0,
      priceType: 'one-time',
      gradient: 'from-teal-500 to-cyan-600',
      icon: Palette,
      imageUrl: null,
      badge: '🎨 Printable',
      badgeColor: 'bg-green-500',
      buttonText: 'Download & Print',
      buttonIcon: <Printer className="w-4 h-4 mr-2" />,
      buttonGradient: 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700',
      features: [
        '20+ Mandala coloring pages',
        'Inspiring mindfulness quotes',
        'Print unlimited times',
        'Therapeutic stress relief'
      ],
      category: 'printables',
      downloadUrl: coloringBookUrl
    },
    {
      id: 'infinity-journal',
      name: 'Infinity Journal',
      description: 'AI-powered digital journaling with therapeutic prompts for healing and self-discovery.',
      price: 24,
      originalPrice: 39,
      priceType: 'one-time',
      gradient: 'from-blue-500 to-indigo-600',
      icon: BookOpen,
      badge: '✨ Best Seller',
      badgeColor: 'bg-purple-500',
      buttonText: 'Get Journal',
      features: [
        'AI-guided prompts',
        'Voice journaling',
        'Progress tracking',
        'Lifetime access'
      ],
      category: 'digital',
      stripePrice: 'price_1SGaoyKqfxTwHJZ0VfF2nsz4'
    },
    {
      id: 'things-they-took',
      name: 'Things They Took',
      description: 'A profound book about love, loss, and the enduring power of memory. By Ruby Dobry.',
      price: 14.99,
      priceType: 'one-time',
      gradient: 'from-purple-500 to-pink-600',
      icon: Heart,
      badge: '📖 New',
      badgeColor: 'bg-pink-500',
      buttonText: 'Read Now',
      features: [
        'Touching grief narrative',
        'Healing insights',
        'Digital format',
        'Read on any device'
      ],
      category: 'books',
      stripePrice: 'price_1SLyMbKqfxTwHJZ0uHBkCbqT'
    },
    {
      id: 'meditation-sounds',
      name: 'Peaceful Soundscapes',
      description: 'Curated ambient sounds for meditation, sleep, and focus. Nature, rain, and more.',
      price: 0,
      priceType: 'subscription',
      gradient: 'from-indigo-500 to-purple-600',
      icon: Music,
      badge: '🎵 Included',
      badgeColor: 'bg-indigo-500',
      buttonText: 'Listen Free',
      features: [
        '50+ soundscapes',
        'Sleep timer',
        'Mix your own',
        'Offline access'
      ],
      category: 'audio'
    },
    {
      id: 'breathing-exercises',
      name: 'Breathing Exercises',
      description: 'Guided breathing techniques for anxiety relief, focus, and relaxation.',
      price: 0,
      priceType: 'subscription',
      gradient: 'from-green-500 to-emerald-600',
      icon: Leaf,
      badge: '🧘 Free',
      badgeColor: 'bg-green-500',
      buttonText: 'Start Breathing',
      features: [
        '4-7-8 technique',
        'Box breathing',
        'Visual guides',
        'Custom sessions'
      ],
      category: 'exercises'
    },
    {
      id: 'mindful-games',
      name: 'Mindful Games Pack',
      description: 'Therapeutic games designed to reduce stress and improve focus.',
      price: 0,
      priceType: 'subscription',
      gradient: 'from-amber-500 to-orange-600',
      icon: Brain,
      badge: '🎮 Fun',
      badgeColor: 'bg-amber-500',
      buttonText: 'Play Now',
      features: [
        'Memory games',
        'Color matching',
        'Breathing bubbles',
        'Progress tracking'
      ],
      category: 'games'
    }
  ];

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      tagline: 'Get started',
      price: 0,
      period: 'forever',
      icon: Gift,
      buttonText: 'Current Plan',
      features: [
        { text: 'Mindfulness coloring book', included: true },
        { text: 'Basic breathing exercises', included: true },
        { text: '3 soundscapes', included: true },
        { text: 'Limited journal entries', included: true },
        { text: 'AI wellness companion', included: false },
        { text: 'Premium books', included: false },
        { text: 'Unlimited downloads', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Most features',
      price: 14,
      period: 'month',
      savings: 'Save 20%',
      icon: Star,
      buttonText: 'Upgrade to Pro',
      stripePrice: 'price_1SGbCkKqfxTwHJZ0IOMbI2RN',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited journal entries', included: true },
        { text: '50+ soundscapes', included: true },
        { text: 'AI wellness companion', included: true },
        { text: 'All mindful games', included: true },
        { text: 'Priority support', included: true },
        { text: 'Premium book access', included: false }
      ]
    },
    {
      id: 'executive',
      name: 'Executive',
      tagline: 'Full wellness suite',
      price: 29,
      period: 'month',
      savings: 'Best Value',
      icon: Crown,
      buttonText: 'Go Executive',
      stripePrice: 'price_1SGctVKqfxTwHJZ0IpFLOWRW',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'All premium books', included: true },
        { text: 'Family sharing (5 users)', included: true },
        { text: 'AI grief coach', included: true },
        { text: 'Exclusive content', included: true },
        { text: 'Personal AI assistant', included: true },
        { text: '24/7 VIP support', included: true }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Tools', icon: Sparkles },
    { id: 'printables', label: 'Printables', icon: Printer },
    { id: 'digital', label: 'Digital', icon: BookOpen },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'games', label: 'Games', icon: Brain }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handlePurchase = async (product) => {
    if (product.downloadUrl) {
      // Free download
      window.open(product.downloadUrl, '_blank');
      return;
    }
    
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    // Navigate to relevant page or checkout
    if (product.id === 'infinity-journal') {
      window.location.href = createPageUrl('InfinityJournal');
    } else if (product.id === 'things-they-took') {
      window.location.href = createPageUrl('ThingsTheyTookBook');
    } else if (product.id === 'meditation-sounds') {
      window.location.href = createPageUrl('MindfulnessHub');
    } else if (product.id === 'breathing-exercises') {
      window.location.href = createPageUrl('MindfulExercises');
    } else if (product.id === 'mindful-games') {
      window.location.href = createPageUrl('MindfulGames');
    }
  };

  const handleSubscribe = (plan) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    
    if (plan.id === 'free') return;
    
    // Navigate to upgrade page
    window.location.href = createPageUrl('Upgrade');
  };

  return (
    <>
      <SEO 
        title="Wellness Shop - Therapeutic Tools & Resources | Helper33"
        description="Shop mindfulness coloring books, meditation tools, and wellness subscriptions. Download free printables and access premium therapeutic resources."
      />

      {/* Interactive Coloring Book Modal */}
      <AnimatePresence>
        {showColoringBook && (
          <InteractiveColoringBook onClose={() => setShowColoringBook(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {['🌸', '✨', '💜', '🧘', '🌿', '💫', '🎨', '📖'].map((emoji, i) => (
            <FloatingElement key={i} emoji={emoji} delay={i * 2} duration={20 + i * 2} />
          ))}
          
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 -left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-20 -right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Wellness Shop
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Discover therapeutic tools, printable coloring books, and premium wellness resources to nurture your mind and soul ✨
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: Palette, label: 'Free Printables', value: '20+' },
                { icon: BookOpen, label: 'Digital Tools', value: '50+' },
                { icon: Heart, label: 'Happy Users', value: '10K+' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-purple-200"
                >
                  <stat.icon className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Featured: Mindfulness Coloring Book */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <Card className="overflow-hidden border-4 border-teal-400 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative h-80 md:h-auto bg-gradient-to-br from-teal-500 to-cyan-600 overflow-hidden">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-64 h-64 rounded-full border-4 border-white/30 flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border-4 border-white/40 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-4 border-white/50 flex items-center justify-center">
                          <Palette className="w-16 h-16 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Floating elements */}
                  {['🎨', '✨', '🌸', '💜', '🧘'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -20, 0],
                        x: [0, 10, 0],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                      className="absolute text-3xl"
                      style={{
                        left: `${15 + i * 18}%`,
                        top: `${20 + (i % 3) * 25}%`
                      }}
                    >
                      {emoji}
                    </motion.div>
                  ))}

                  <Badge className="absolute top-4 left-4 bg-white text-teal-700 text-lg px-4 py-2">
                    🎨 Digital Coloring
                  </Badge>
                </div>

                {/* Content Side */}
                <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-teal-100 text-teal-700">Featured Download</Badge>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    My Mindful Journey
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    A beautiful mindfulness coloring book featuring 20+ intricate mandala designs with inspiring quotes. 
                    <span className="font-semibold text-teal-700"> Print at home and color your way to calm!</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { icon: Palette, text: '20+ Coloring Pages' },
                      { icon: Sparkles, text: 'Inspiring Quotes' },
                      { icon: Printer, text: 'Print Unlimited' },
                      { icon: Heart, text: 'Stress Relief' }
                    ].map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                          <feature.icon className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        onClick={() => setShowColoringBook(true)}
                        className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                      >
                        <Paintbrush className="w-5 h-5 mr-2" />
                        Color in App
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                      <Button
                        onClick={() => window.open(coloringBookUrl, '_blank')}
                        className="w-full py-6 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.section>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-purple-50 border-2 border-purple-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              Wellness Tools & Resources
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  user={user}
                  onPurchase={handlePurchase}
                  featured={product.id === 'mindful-coloring'}
                />
              ))}
            </div>
          </section>

          {/* Subscription Plans */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2">
                <Crown className="w-4 h-4 mr-2 inline" />
                Unlock Everything
              </Badge>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                Choose Your Wellness Plan
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get unlimited access to all tools, resources, and premium content with our subscription plans
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {subscriptionPlans.map((plan, idx) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  isPopular={plan.id === 'pro'}
                  user={user}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full"
                />
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-6"
                >
                  🌟
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start Your Wellness Journey Today
                </h2>
                <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg">
                  Join thousands of people using Helper33 to find peace, healing, and personal growth
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => window.open(coloringBookUrl, '_blank')}
                      className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-6 text-lg shadow-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Get Free Coloring Book
                    </Button>
                  </motion.div>
                  
                  <Link to={createPageUrl('Upgrade')}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                      >
                        <Crown className="w-5 h-5 mr-2" />
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