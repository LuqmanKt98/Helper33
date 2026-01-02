import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Heart,
  Users,
  Sparkles,
  TrendingUp,
  Shield,
  Star,
  Zap,
  ArrowRight,
  CheckCircle,
  Gift,
  Rocket,
  Crown,
  Award
} from 'lucide-react';
import SEO from '@/components/SEO';
import { DonateCard } from '@/components/DonateButton';

export default function Campaign() {
  const [selectedTier, setSelectedTier] = useState(null);

  const impactStats = [
    {
      number: "33+",
      label: "AI Tools Built",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "13+",
      label: "AI Agents Created",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "1000+",
      label: "Families Helped",
      icon: Heart,
      color: "from-rose-500 to-red-500"
    },
    {
      number: "24/7",
      label: "Support Available",
      icon: Shield,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const supportTiers = [
    {
      name: "Community Supporter",
      amount: "$5",
      period: "one-time",
      icon: Heart,
      color: "from-rose-400 to-pink-400",
      benefits: [
        "Help keep Helper33 free for families in need",
        "Support ongoing AI development",
        "Contribute to community resources",
        "Supporter badge on profile"
      ]
    },
    {
      name: "Growth Partner",
      amount: "$25",
      period: "one-time",
      icon: TrendingUp,
      color: "from-blue-400 to-cyan-400",
      benefits: [
        "All Community Supporter benefits",
        "Early access to new features",
        "Exclusive updates from founders",
        "Special community recognition"
      ]
    },
    {
      name: "Impact Champion",
      amount: "$50",
      period: "one-time",
      icon: Star,
      color: "from-amber-400 to-orange-400",
      popular: true,
      benefits: [
        "All Growth Partner benefits",
        "1 month Pro membership included",
        "Priority feature requests",
        "Champion badge & special profile theme",
        "Direct message with founders"
      ]
    },
    {
      name: "Vision Builder",
      amount: "$100+",
      period: "one-time",
      icon: Crown,
      color: "from-purple-400 to-indigo-400",
      benefits: [
        "All Impact Champion benefits",
        "3 months Pro membership included",
        "Advisory board consideration",
        "Custom feature development input",
        "Lifetime recognition as founding supporter"
      ]
    }
  ];

  const campaignGoals = [
    {
      title: "Expand AI Capabilities",
      description: "Develop more sophisticated AI agents for mental health, education, and family support",
      progress: 65,
      raised: "$32,500",
      goal: "$50,000",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Mobile App Development",
      description: "Create native iOS and Android apps for better accessibility",
      progress: 40,
      raised: "$20,000",
      goal: "$50,000",
      icon: Zap,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Free Access Fund",
      description: "Provide free Pro access to families facing financial hardship",
      progress: 80,
      raised: "$24,000",
      goal: "$30,000",
      icon: Heart,
      color: "from-rose-500 to-red-500"
    }
  ];

  const whySupport = [
    {
      title: "AI That Heals",
      description: "We're not just building tools - we're creating AI that understands grief, supports families, and helps people heal.",
      icon: Heart,
      color: "text-rose-600"
    },
    {
      title: "Family First",
      description: "Every feature is designed with real families in mind. We listen, adapt, and build what you actually need.",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Always Free Core",
      description: "Our mission is access for all. Core features will always be free - your support helps us keep it that way.",
      icon: Gift,
      color: "text-green-600"
    },
    {
      title: "Transparent Development",
      description: "See exactly where your support goes. We share regular updates on features, improvements, and community impact.",
      icon: CheckCircle,
      color: "text-purple-600"
    }
  ];

  return (
    <>
      <SEO 
        title="Support Helper33 - Back Our Mission | Family AI Campaign"
        description="Support Helper33's mission to make AI accessible for mental health, family wellness, and everyday life. Help us build 33+ AI tools and 13+ agents for families worldwide. Every contribution makes therapeutic AI possible."
        keywords="support Helper33, back Helper33, AI wellness campaign, family AI fundraising, support mental health AI, donate to Helper33, therapeutic AI development fund, family wellness support, AI tools campaign"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 py-20">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [null, Math.random() * 1 + 0.5]
                }}
                transition={{
                  duration: Math.random() * 8 + 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="text-white w-4 h-4" />
              </motion.div>
            ))}
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block mb-6"
              >
                <Rocket className="w-20 h-20 text-white" />
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                Help Us Build the Future of AI Wellness
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                Every contribution helps us create better AI tools for mental health, family support, and everyday life.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl" onClick={() => document.getElementById('donate-section').scrollIntoView({ behavior: 'smooth' })}>
                  <Heart className="w-5 h-5 mr-2" />
                  Support Our Mission
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link to={createPageUrl('OurStory')}>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Learn Our Story
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
          {/* Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Our Impact So Far
              </h2>
              <p className="text-xl text-gray-600">
                Together, we're making AI accessible and healing
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {impactStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className={`bg-gradient-to-br ${stat.color} border-0 shadow-xl hover:shadow-2xl transition-all`}>
                      <CardContent className="p-6 text-center">
                        <Icon className="w-12 h-12 text-white mx-auto mb-4" />
                        <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                        <div className="text-white/90 font-medium">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Campaign Goals */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Current Campaign Goals
              </h2>
              <p className="text-xl text-gray-600">
                Help us reach these milestones
              </p>
            </div>

            <div className="space-y-6">
              {campaignGoals.map((goal, index) => {
                const Icon = goal.icon;
                return (
                  <motion.div
                    key={goal.title}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6 mb-6">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{goal.title}</h3>
                            <p className="text-gray-700">{goal.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{goal.progress}%</div>
                            <div className="text-sm text-gray-600">{goal.raised} / {goal.goal}</div>
                          </div>
                        </div>
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${goal.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${goal.color} rounded-full`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Why Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Why Support Helper33?
              </h2>
              <p className="text-xl text-gray-600">
                Your contribution makes a real difference
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {whySupport.map((reason, index) => {
                const Icon = reason.icon;
                return (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all h-full">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-6 h-6 ${reason.color}`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
                            <p className="text-gray-700 leading-relaxed">{reason.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Support Tiers */}
          <motion.div
            id="donate-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Choose Your Support Level
              </h2>
              <p className="text-xl text-gray-600">
                Every contribution helps us grow and serve more families
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {supportTiers.map((tier, index) => {
                const Icon = tier.icon;
                return (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className={`bg-gradient-to-br ${tier.color} border-0 shadow-xl hover:shadow-2xl transition-all h-full relative ${tier.popular ? 'ring-4 ring-amber-400' : ''}`}>
                      {tier.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                            Most Popular
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <Icon className="w-12 h-12 text-white mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                          <div className="text-4xl font-bold text-white mb-1">{tier.amount}</div>
                          <div className="text-white/80 text-sm">{tier.period}</div>
                        </div>
                        <ul className="space-y-3">
                          {tier.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-white/90 text-sm">
                              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Donate Card */}
            <DonateCard />
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-block mb-6"
                >
                  <Award className="w-16 h-16 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Every Contribution Matters
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Whether it's $5 or $500, your support helps us make AI more accessible, therapeutic, and family-friendly for everyone.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={createPageUrl('Dashboard')}>
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Try Helper33 Free
                    </Button>
                  </Link>
                  <Link to={createPageUrl('About')}>
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                      <Users className="w-5 h-5 mr-2" />
                      Learn More About Us
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}