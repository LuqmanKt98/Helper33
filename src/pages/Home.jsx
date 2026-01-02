import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Heart, Calendar, Brain, BookOpen, Users, Sparkles, ArrowRight, Shield, Zap, MessageSquare, Activity, BookHeart, PenTool,
  Star, Gift, Clock, Palette, Paintbrush, Download, Printer
} from 'lucide-react';
import SEO from '@/components/SEO';
import GameOnboarding from '@/components/onboarding/GameOnboarding';
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer';
import NewUserWelcomeModal from '@/components/NewUserWelcomeModal';
import { toast } from 'sonner';

// Floating snowflakes animation component
const FloatingSnowflake = ({ delay = 0, duration = 20, startX = 0 }) => {
  const snowEmojis = ['❄️', '❅', '❆', '✨'];
  const randomSnow = snowEmojis[Math.floor(Math.random() * snowEmojis.length)];
  
  return (
    <motion.div
      initial={{ x: startX, y: -100, rotate: 0, opacity: 0 }}
      animate={{
        x: [startX, startX + Math.random() * 100 - 50, startX + Math.random() * 150 - 75],
        y: ['0vh', '50vh', '100vh'],
        rotate: [0, 360, 720],
        opacity: [0, 0.9, 0.7, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute pointer-events-none text-3xl"
      style={{ left: `${Math.random() * 100}%` }}
    >
      {randomSnow}
    </motion.div>
  );
};

// Floating ornaments
const FloatingOrnament = ({ delay = 0 }) => {
  const ornaments = ['🎄', '🎁', '🔔', '⭐'];
  const randomOrnament = ornaments[Math.floor(Math.random() * ornaments.length)];
  return (
    <motion.div
      initial={{ y: '100vh', x: Math.random() * 100 + 'vw', rotate: 0, scale: 0 }}
      animate={{
        y: '-10vh',
        x: [null, `${Math.random() * 100}vw`],
        rotate: [0, 360],
        scale: [0, 1, 1, 0]
      }}
      transition={{
        duration: 25 + Math.random() * 10,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute pointer-events-none text-5xl"
    >
      {randomOrnament}
    </motion.div>
  );
};

// Floating sparkles/stars
const FloatingSparkle = ({ delay = 0 }) => {
  const sparkles = ['✨', '⭐', '🌟'];
  const randomSparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
  return (
    <motion.div
      initial={{ 
        x: Math.random() * 100 + 'vw', 
        y: Math.random() * 100 + 'vh',
        scale: 0,
        opacity: 0
      }}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        y: [null, `${Math.random() * 100}vh`]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute pointer-events-none text-2xl"
    >
      {randomSparkle}
    </motion.div>
  );
};

// Floating Santa/Reindeer
const FloatingSanta = ({ delay = 0 }) => {
  const characters = ['🎅', '🦌', '🛷'];
  const randomChar = characters[Math.floor(Math.random() * characters.length)];
  return (
    <motion.div
      initial={{ x: '-10vw', y: Math.random() * 40 + 'vh', scale: 1 }}
      animate={{
        x: '110vw',
        y: [null, `${Math.random() * 40}vh`, `${Math.random() * 40}vh`],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 40 + Math.random() * 10,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute pointer-events-none text-4xl"
    >
      {randomChar}
    </motion.div>
  );
};

// Floating candy canes
const FloatingCandyCane = ({ delay = 0 }) => {
  const candies = ['🍬', '🍭', '🎀'];
  const randomCandy = candies[Math.floor(Math.random() * candies.length)];
  return (
    <motion.div
      initial={{ x: Math.random() * 100 + 'vw', y: -50, rotate: 0 }}
      animate={{
        y: '105vh',
        x: [null, `${Math.random() * 100}vw`],
        rotate: [0, 360]
      }}
      transition={{
        duration: 18 + Math.random() * 5,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute pointer-events-none text-3xl"
    >
      {randomCandy}
    </motion.div>
  );
};

export default function Home() {
  const [showWizard, setShowWizard] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: hasCompleted, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: async () => {
      const responses = await base44.entities.OnboardingResponse.list('-created_date', 1);
      return responses.length > 0;
    },
    enabled: !!user,
    retry: false
  });

  // Handle payment success/cancel from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentCancelled = urlParams.get('payment_cancelled');
    const tier = urlParams.get('tier');
    const type = urlParams.get('type');

    if (paymentSuccess === 'true') {
      // Refetch user to get updated subscription status
      setTimeout(() => {
        refetchUser();
        queryClient.invalidateQueries(['currentUser']);
      }, 1000); // Small delay to allow webhook to process
      
      const tierNames = { basic: 'Basic', pro: 'Pro', executive: 'Executive' };
      if (type === 'subscription' && tier) {
        toast.success(`🎉 Welcome to Helper33 ${tierNames[tier] || tier}!`, {
          duration: 8000,
          description: 'Your subscription is now active. Explore all your premium features from the Dashboard!'
        });
      } else if (type === 'book' || type === 'one_time') {
        toast.success('🎉 Purchase successful!', {
          duration: 6000,
          description: 'Thank you! You now have full access to your purchase.'
        });
      } else {
        toast.success('🎉 Payment successful! Thank you for your purchase.', {
          duration: 5000
        });
      }
      
      // Clean URL after showing toast
      setTimeout(() => {
        window.history.replaceState({}, '', createPageUrl('Home'));
      }, 100);
    } else if (paymentCancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime from the Shop.');
      window.history.replaceState({}, '', createPageUrl('Home'));
    }
  }, [refetchUser, queryClient]);

  useEffect(() => {
    if (user && !onboardingLoading && hasCompleted === false) {
      const timer = setTimeout(() => setShowWizard(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user, hasCompleted, onboardingLoading]);

  const features = [
    { icon: Heart, title: 'AI Wellness Companion', description: '13+ AI agents for grief support and wellness', page: 'GriefCoach', gradient: 'from-red-600 to-pink-700' },
    { icon: Calendar, title: 'Smart Life Organizer', description: 'AI task management and family coordination', page: 'Organizer', gradient: 'from-green-600 to-emerald-700' },
    { icon: Activity, title: 'Wellness & Health Hub', description: 'Mood, sleep, cycle, pregnancy tracking', page: 'Wellness', gradient: 'from-red-600 to-rose-700' },
    { icon: BookOpen, title: 'Creative Learning', description: 'Kids games, homework help, AI tutoring', page: 'KidsCreativeStudio', gradient: 'from-green-600 to-teal-700' },
    { icon: Brain, title: 'Mindfulness & Focus', description: 'Breathing, meditation, soundscapes', page: 'MindfulnessHub', gradient: 'from-blue-600 to-indigo-700' },
    { icon: Users, title: 'Family Ecosystem', description: 'Multi-generational schedules and memories', page: 'Family', gradient: 'from-red-700 to-rose-800' },
    { icon: Sparkles, title: 'AI Consultants', description: 'Find verified AI and business consultants', page: 'FindConsultants', gradient: 'from-purple-600 to-indigo-700' },
    { icon: MessageSquare, title: 'Community', description: 'Connect, support circles, crisis resources', page: 'Community', gradient: 'from-green-600 to-emerald-700' }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Helper33",
    "description": "Complete family AI ecosystem with 33+ tools, 13+ agents, 700+ AI controls",
    "applicationCategory": "HealthApplication",
    "isAccessibleForFree": true
  };

  if (showWizard && user) {
    return <GameOnboarding onComplete={() => setShowWizard(false)} />;
  }

  return (
    <>
      <SEO 
        title="Helper33 - All-in-One Family AI | Wellness, Student, Cooking, Kids & Business AI"
        description="Complete family AI ecosystem with 33+ AI tools. Mental health support, homework help, meal planning, safe learning games, and productivity tools."
        keywords="family AI, wellness AI, student AI, cooking AI, kids AI, business AI, AI mental health, AI homework helper, AI meal planner"
        structuredData={structuredData}
      />

      <NewUserWelcomeModal user={user} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden relative">
        {/* Christmas animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Many floating snowflakes */}
          {[...Array(25)].map((_, i) => (
            <FloatingSnowflake key={`snow-${i}`} delay={i * 1.2} duration={15 + i} startX={i * 40} />
          ))}
          
          {/* Floating ornaments */}
          {[...Array(6)].map((_, i) => (
            <FloatingOrnament key={`ornament-${i}`} delay={i * 4} />
          ))}
          
          {/* Floating sparkles */}
          {[...Array(15)].map((_, i) => (
            <FloatingSparkle key={`sparkle-${i}`} delay={i * 0.8} />
          ))}
          
          {/* Floating Santa/Reindeer */}
          {[...Array(3)].map((_, i) => (
            <FloatingSanta key={`santa-${i}`} delay={i * 15} />
          ))}
          
          {/* Floating candy canes */}
          {[...Array(8)].map((_, i) => (
            <FloatingCandyCane key={`candy-${i}`} delay={i * 3} />
          ))}
        </div>

        {/* Christmas glow effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-20 -left-20 w-[500px] h-[500px] bg-red-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, -50, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, delay: 1 }}
            className="absolute top-40 -right-20 w-[500px] h-[500px] bg-green-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.25, 0.45, 0.25],
              x: [0, 30, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 14, repeat: Infinity, delay: 2 }}
            className="absolute bottom-20 left-1/3 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"
          />
        </div>

        {/* Hero */}
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              {/* Logo with gentle pulse */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 mx-auto rounded-full shadow-2xl overflow-hidden mb-6 border-4 border-amber-300"
              >
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png" 
                  alt="Helper33" 
                  className="w-full h-full" 
                />
              </motion.div>

              {/* Christmas greeting */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <Badge className="bg-gradient-to-r from-red-600 to-green-600 text-white px-6 py-2 text-lg mb-4 shadow-lg">
                  🎄 Wishing You Joy & Wellness This Holiday Season 🎁
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent"
              >
                All-in-One AI Hub
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-2xl md:text-3xl text-gray-800 mb-4 font-semibold"
              >
                33+ AI Tools • 13+ Agents • 700+ Controls
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto leading-relaxed"
              >
                Your complete family wellness companion for life's journey 🎄✨
              </motion.p>



              {/* CTA Buttons with warm animations */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                {user ? (
                  <>
                    <Link to={createPageUrl('Dashboard')}>
                      <motion.div 
                        whileHover={{ scale: 1.08, y: -3 }} 
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        <motion.div
                          animate={{ 
                            boxShadow: [
                              '0 0 0 0 rgba(251, 191, 36, 0)',
                              '0 0 0 15px rgba(251, 191, 36, 0)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Button size="lg" className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white px-10 py-7 text-lg shadow-2xl">
                            Continue Your Journey
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </motion.div>
                    </Link>
                    {!hasCompleted && (
                      <motion.div 
                        whileHover={{ scale: 1.08, y: -3 }}
                        animate={{ 
                          boxShadow: [
                            '0 0 0 0 rgba(34, 197, 94, 0)',
                            '0 0 0 20px rgba(34, 197, 94, 0)'
                          ]
                        }} 
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Button 
                          onClick={() => setShowWizard(true)} 
                          size="lg" 
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-10 py-7 text-lg shadow-2xl"
                        >
                          ✨ Start Adventure Quiz! 🎁
                        </Button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <>
                    <motion.div 
                      whileHover={{ scale: 1.08, y: -3 }} 
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(251, 191, 36, 0.4)',
                          '0 0 0 20px rgba(251, 191, 36, 0)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Button 
                        onClick={() => base44.auth.redirectToLogin()} 
                        size="lg" 
                        className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 px-12 py-8 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all"
                      >
                        <Sparkles className="mr-2 w-6 h-6" />
                        Create Free Account
                        <ArrowRight className="ml-2 w-6 h-6" />
                      </Button>
                    </motion.div>
                    <Link to={createPageUrl('About')}>
                      <motion.div whileHover={{ scale: 1.05, y: -3 }}>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="border-3 border-amber-500 text-amber-700 hover:bg-amber-50 px-10 py-8 text-lg shadow-lg"
                        >
                          Learn More
                        </Button>
                      </motion.div>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Badges with gentle bounce */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {[
                  { icon: Sparkles, label: '33+ Tools', color: 'from-red-600 to-pink-600' },
                  { icon: Brain, label: '13+ Agents', color: 'from-green-600 to-emerald-600' },
                  { icon: Zap, label: '700+ Controls', color: 'from-red-600 to-orange-600' },
                  { icon: Shield, label: 'Secure', color: 'from-blue-600 to-indigo-600' }
                ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: [0, -5, 5, 0],
                    y: -5
                  }}
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg border-2 border-red-200"
                >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-800">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Book Shop Section - Updated with 3 products */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 py-16 relative z-10"
        >
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent"
            >
              📚 Books & Journals by Ruby Dobry
            </motion.h2>
            <p className="text-xl text-gray-600 mb-4">
              Therapeutic stories and journals for healing and personal growth
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 text-lg shadow-lg">
                ✨ Free During Pre-Launch
              </Badge>
              {!user && (
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 text-lg shadow-lg animate-pulse">
                  🔐 Account Required
                </Badge>
              )}
            </div>
          </div>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-3 border-blue-400 shadow-xl max-w-3xl mx-auto">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-700" />
                    <h3 className="text-xl font-bold text-blue-900">Account Required to Read & Journal</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Create your free account to access all books, journals, and AI tools
                  </p>
                  <Button
                    onClick={() => base44.auth.redirectToLogin()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-base"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Sign Up Free - Start Reading
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Infinity Book (Grief Story) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-3 border-green-300 shadow-2xl h-full hover:shadow-3xl transition-all">
                <CardContent className="p-8">
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/86d7edeb3_Screenshot_17-11-2025_31119_appbase44com.jpg"
                      alt="Infinity - Holding On When Everything Changes"
                      className="w-full h-64 object-cover"
                      style={{ objectPosition: 'left center' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookHeart className="w-6 h-6 text-green-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                      Infinity
                    </h3>
                  </div>
                  <p className="text-sm text-green-600 font-semibold mb-2">Holding On When Everything Changes</p>
                  <p className="text-gray-600 mb-2 text-sm italic">By Ruby Dobry</p>
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                    A profound story of love, loss, and the eternal connections that bind us. Ruby's deeply personal journey through grief. ✨
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to={createPageUrl('InfinityBook')}>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl py-6 text-base"
                      >
                        <BookHeart className="w-5 h-5 mr-2" />
                        Read Book - Try Free
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Things They Took */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-3 border-purple-300 shadow-2xl h-full hover:shadow-3xl transition-all">
                <CardContent className="p-8">
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/86d7edeb3_Screenshot_17-11-2025_31119_appbase44com.jpg"
                      alt="The Things They Took: The Love That Stayed"
                      className="w-full h-64 object-cover"
                      style={{ objectPosition: 'right center' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                      The Things They Took
                    </h3>
                  </div>
                  <p className="text-sm text-purple-600 font-semibold mb-2">The Love That Stayed</p>
                  <p className="text-gray-600 mb-2 text-sm italic">By Ruby Dobry</p>
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                    A poignant exploration of what remains when everything is taken—the enduring power of love and memory. 💙
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to={createPageUrl('ThingsTheyTookBook')}>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl py-6 text-base"
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        Read Book - Try Free
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Infinity Journal (AI-Powered) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-3 border-blue-300 shadow-2xl h-full hover:shadow-3xl transition-all">
                <CardContent className="p-8">
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 p-6 flex items-center justify-center">
                    <PenTool className="w-32 h-32 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <PenTool className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                      Infinity Journal
                    </h3>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 text-xs mb-3">
                    AI-Powered Journaling
                  </Badge>
                  <p className="text-gray-600 mb-2 text-sm italic">By Ruby Dobry</p>
                  <p className="text-gray-700 mb-6 leading-relaxed text-sm">
                    Interactive AI-powered journal with therapeutic prompts for deep self-reflection, healing, and growth. 📝
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to={createPageUrl('InfinityJournal')}>
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl py-6 text-base"
                      >
                        <PenTool className="w-5 h-5 mr-2" />
                        Start Journaling - Try Free
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* My Mindful Journey Coloring Book Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-6 py-16 relative z-10"
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
                <Badge className="w-fit mb-4 bg-teal-100 text-teal-700">Featured Creative Tool</Badge>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  My Mindful Journey
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  A beautiful mindfulness coloring book featuring 20+ intricate mandala designs with inspiring quotes. 
                  <span className="font-semibold text-teal-700"> Color in-app or print at home!</span>
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
                    <Link to={createPageUrl('WellnessShop')}>
                      <Button className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                        <Paintbrush className="w-5 h-5 mr-2" />
                        Color in App
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      onClick={() => window.open("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/e47cd9574_MindfulnessColoringQuoteRemindersBook.pdf", '_blank')}
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

        {/* Trust Signals & Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-6 py-12 relative z-10"
        >
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent"
            >
              Why Families Love Helper33
            </motion.h2>
            <p className="text-gray-600 text-lg">Join thousands who've already started their journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 h-full shadow-lg hover:shadow-xl transition-all">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">100% Privacy First</h3>
                  <p className="text-gray-600 text-sm">
                    Your data is encrypted and never sold. You're in complete control of your information.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-200 h-full shadow-lg hover:shadow-xl transition-all">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <Gift className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Free to Start</h3>
                  <p className="text-gray-600 text-sm">
                    No credit card required. Create your account and explore all features completely free!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 h-full shadow-lg hover:shadow-xl transition-all">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center"
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Instant Access</h3>
                  <p className="text-gray-600 text-sm">
                    Sign up in 30 seconds and start using AI tools immediately. No setup, no hassle.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4 leading-relaxed">
                    "Helper33 has transformed how our family manages daily life. The AI wellness tools helped me through a difficult time, and the kids love the learning games!"
                  </p>
                  <p className="text-sm font-semibold text-purple-700">— Sarah M., Mother of 3</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4 leading-relaxed">
                    "The AI grief support and journaling tools gave me a safe space to process my emotions. This platform is a gift to anyone navigating life's challenges."
                  </p>
                  <p className="text-sm font-semibold text-blue-700">— Michael T., Business Professional</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Holiday Message */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6 py-12 relative z-10"
        >
          <Card className="bg-gradient-to-r from-red-100 via-green-100 to-red-100 border-3 border-red-300 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎄
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-red-900">
                Merry Christmas & Happy Holidays!
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                This holiday season, we're here to support your family's wellness journey with warmth and joy. 
                May your days be filled with peace, love, and meaningful connections. 🎁✨
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <MedicalDisclaimer variant="prominent" page="general" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 mt-12 bg-gradient-to-r from-red-700 to-green-700 bg-clip-text text-transparent">
              Complete AI Ecosystem
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Everything your family needs, all in one place 🎄
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ 
                  y: -12,
                  transition: { duration: 0.3 }
                }}
              >
                <Link to={createPageUrl(f.page)}>
                  <Card className="h-full hover:shadow-2xl border-2 border-red-200 hover:border-green-400 bg-white/90 backdrop-blur-sm transition-all duration-300">
                    <CardHeader>
                      <motion.div 
                        whileHover={{ 
                          rotate: 360,
                          scale: 1.1
                        }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-xl`}
                      >
                        <f.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl text-gray-800">{f.title}</CardTitle>
                      <CardDescription className="text-gray-600">{f.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <motion.div whileHover={{ x: 5 }}>
                        <Button variant="ghost" className="w-full text-red-700 hover:bg-red-50">
                          Explore
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA with Thanksgiving theme */}
        <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-red-700 via-green-700 to-red-700 text-white border-0 shadow-2xl overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />
              
              <CardContent className="p-12 text-center relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-6xl mb-6"
                >
                  🎅
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 drop-shadow-lg">
                  Most Comprehensive AI Platform
                </h2>
                <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of families creating wellness, growth, and joy together
                </p>
                
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  {[
                    { num: '33+', label: 'AI Tools', icon: '🎁' },
                    { num: '13+', label: 'AI Agents', icon: '🎄' },
                    { num: '700+', label: 'Controls', icon: '⭐' },
                    { num: '24/7', label: 'Support', icon: '❤️' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ 
                        scale: 1.1,
                        y: -5
                      }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20"
                    >
                      <div className="text-4xl mb-2">{stat.icon}</div>
                      <div className="text-5xl font-bold mb-2">{stat.num}</div>
                      <div className="text-amber-100">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <Link to={createPageUrl('Dashboard')}>
                      <motion.div whileHover={{ scale: 1.08, y: -3 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="lg" 
                          className="bg-white text-orange-700 hover:bg-amber-50 px-12 py-7 text-lg shadow-2xl"
                        >
                          Go to Dashboard
                          <Sparkles className="ml-2 w-5 h-5" />
                        </Button>
                      </motion.div>
                    </Link>
                  ) : (
                    <>
                      <motion.div 
                        whileHover={{ scale: 1.08, y: -3 }} 
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          boxShadow: [
                            '0 0 0 0 rgba(255, 255, 255, 0.4)',
                            '0 0 0 20px rgba(255, 255, 255, 0)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Button 
                          onClick={() => base44.auth.redirectToLogin()} 
                          size="lg" 
                          className="bg-white text-orange-700 hover:bg-amber-50 px-12 py-8 text-xl font-bold shadow-2xl"
                        >
                          <Gift className="mr-2 w-6 h-6" />
                          Join Free Now
                          <Sparkles className="ml-2 w-6 h-6" />
                        </Button>
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white text-sm mt-2"
                      >
                        ✓ No credit card required • ✓ 30-second setup • ✓ Cancel anytime
                      </motion.p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </>
  );
}