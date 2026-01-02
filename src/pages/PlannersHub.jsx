
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  UtensilsCrossed,
  Wind,
  ArrowRight,
  LayoutGrid,
  Heart,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SEO from '@/components/SEO';

const planners = [
  {
    title: 'Life Organizer',
    description: 'Comprehensive task management with calendar views, recurring tasks, habit tracking, and AI-powered suggestions.',
    icon: CheckSquare,
    url: createPageUrl('Organizer'),
    color: 'from-emerald-500 to-teal-500',
    features: ['Tasks & To-Dos', 'Calendar View', 'Habit Tracker', 'AI Suggestions', 'Color Coding', 'Recurring Tasks'],
    badge: 'Most Powerful',
    badgeColor: 'bg-emerald-500'
  },
  {
    title: 'Gentle Flow Planner',
    description: 'A therapeutic daily planner designed for those dealing with grief or overwhelm. Plan based on your energy.',
    icon: Wind,
    url: createPageUrl('GentleFlowPlanner'),
    color: 'from-purple-500 to-pink-500',
    features: ['Energy-Based Planning', 'Free-Form Notes', 'Flexible To-Dos', 'No Pressure Approach', 'Daily Reflections'],
    badge: 'Most Gentle',
    badgeColor: 'bg-purple-500'
  },
  {
    title: 'Meal Planner',
    description: 'Plan nutritious meals that support your wellness journey with recipe search and automated grocery lists.',
    icon: UtensilsCrossed,
    url: createPageUrl('MealPlanner'),
    color: 'from-orange-500 to-red-500',
    features: ['Recipe Search', 'Weekly Meal Plan', 'Grocery Lists', 'Dietary Filters', 'Save Favorites'],
    badge: 'Wellness Focus',
    badgeColor: 'bg-orange-500'
  },
];

export default function PlannersHub() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  return (
    <>
      <SEO
        title="Planners Hub - DobryLife | Gentle Flow & Vision Board Planning"
        description="Access therapeutic planning tools including Gentle Flow Planner and Vision Board. Plan your day with compassion and visualize your goals and dreams."
        keywords="daily planner, vision board, goal visualization, gentle planning, therapeutic planner, visual goal setting, life planning tools"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-lg rounded-full border-2 border-purple-200 mb-6 shadow-xl">
              <LayoutGrid className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Planners Hub
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-4">
              Your Planning Toolkit
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect planner for your needs. Each designed with care to support different aspects of your life.
            </p>
          </motion.header>

          {/* Planners Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {planners.map((planner, index) => {
              const Icon = planner.icon;

              return (
                <motion.div
                  key={planner.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col h-full overflow-hidden">
                    {/* Top Gradient Bar */}
                    <div className={`h-2 bg-gradient-to-r ${planner.color}`} />

                    <CardHeader className="relative pb-4">
                      {/* Badge */}
                      <Badge className={`absolute top-4 right-4 ${planner.badgeColor} text-white border-0 shadow-lg`}>
                        {planner.badge}
                      </Badge>

                      {/* Icon */}
                      <div className={`w-20 h-20 bg-gradient-to-br ${planner.color} rounded-3xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>

                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {planner.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-grow space-y-4">
                      <CardDescription className="text-gray-600 text-base leading-relaxed">
                        {planner.description}
                      </CardDescription>

                      {/* Features List */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Key Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {planner.features.map((feature, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-white/60 text-gray-700 border-gray-300 text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <Link to={planner.url}>
                        <Button
                          className={`w-full bg-gradient-to-r ${planner.color} hover:opacity-90 text-white font-bold text-lg py-6 shadow-lg group`}
                        >
                          Open {planner.title}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Comparison Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-purple-100"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-purple-600" />
              Which Planner is Right for You?
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                <CheckSquare className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Life Organizer</h3>
                <p className="text-sm text-gray-600">
                  <strong>Best for:</strong> Managing multiple tasks, building habits, and staying organized with structure.
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <Wind className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Gentle Flow</h3>
                <p className="text-sm text-gray-600">
                  <strong>Best for:</strong> Low-energy days, grief support, and gentle self-care without pressure.
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
                <UtensilsCrossed className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Meal Planner</h3>
                <p className="text-sm text-gray-600">
                  <strong>Best for:</strong> Planning nutritious meals and simplifying grocery shopping.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-purple-200">
              <Heart className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-gray-700 text-lg">
                <strong>💡 Pro Tip:</strong> You can use all three planners together! They each serve different purposes and work beautifully in harmony.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
