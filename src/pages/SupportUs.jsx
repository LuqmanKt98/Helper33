import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Sparkles, Shield, Zap, Gift, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DonateCard } from '@/components/DonateButton';
import SEO from '@/components/SEO';

export default function SupportUs() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    retry: false
  });

  const impactAreas = [
    {
      icon: Heart,
      title: '24/7 AI Support',
      description: 'Keep grief coaches and wellness tools available anytime',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Free Access',
      description: 'Ensure free access of basic features to everyone who needs it',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Sparkles,
      title: 'New Features',
      description: 'Develop innovative wellness tools and AI companions',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Community Growth',
      description: 'Build supportive community features and connections',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Maintain fast, reliable, and secure infrastructure',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: Gift,
      title: 'Special Programs',
      description: 'Create crisis resources and specialized support tools',
      gradient: 'from-red-500 to-rose-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Support Helper33 - Back Our Mission | Family AI Platform"
        description="Support Helper33's mission to make AI accessible for mental health, family wellness, and everyday life. Help us build 33+ AI tools and 13+ agents for families worldwide. Every contribution makes therapeutic AI possible."
        keywords="support Helper33, back Helper33, AI wellness campaign, family AI fundraising, support mental health AI, donate to Helper33, therapeutic AI development fund, family wellness support, AI tools campaign"
      />

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Heart className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Support Our Mission
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Help us keep Helper33 free and accessible to everyone seeking mental wellness support.
              Every donation directly supports our development and community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {impactAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${area.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl mb-2 font-semibold text-gray-900">{area.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {area.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <DonateCard />
          </motion.div>

          <Card className="bg-white/80 backdrop-blur-sm mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Your Support Matters</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">100% Goes to Development</h4>
                    <p className="text-sm text-gray-600">Every dollar directly funds feature development and infrastructure</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Free for Everyone</h4>
                    <p className="text-sm text-gray-600">Donations help us keep the core platform free forever</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Faster Innovation</h4>
                    <p className="text-sm text-gray-600">Your support accelerates new AI features and wellness tools</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Community Impact</h4>
                    <p className="text-sm text-gray-600">Help thousands access mental wellness support they couldn't afford</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Ways to Support</h2>
              <p className="text-gray-600 text-sm mb-6">Can't donate right now? Here are other ways to help!</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Share with Others</h4>
                    <p className="text-sm text-gray-600">Spread the word about Helper33 to friends and family who might benefit</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Provide Feedback</h4>
                    <p className="text-sm text-gray-600">Help us improve by sharing your experience and suggestions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <Gift className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900">Follow on Social Media</h4>
                    <p className="text-sm text-gray-600">Stay connected and help us grow our community</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2 text-amber-900">
                    <Shield className="w-5 h-5" />
                    <span className="font-bold">🛡️ Admin Access - Support Page Visible</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}