import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Heart,
  Calendar,
  BookOpen,
  Users,
  Target,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Gift,
  Leaf,
  MessageCircle,
  Brain,
  Smile
} from 'lucide-react';
import { toast } from 'sonner';
import { startTrial } from './PlanChecker';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to DobryLife',
    subtitle: 'Your compassionate companion for mental wellness',
    icon: Leaf,
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'ai_assistant',
    title: 'Meet Your AI Assistant',
    subtitle: 'Get personalized guidance 24/7',
    icon: Sparkles,
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    id: 'goals',
    title: 'Set Your Intentions',
    subtitle: 'What brings you to DobryLife?',
    icon: Target,
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'features',
    title: 'Explore Key Features',
    subtitle: 'Tools designed for your wellbeing',
    icon: Heart,
    gradient: 'from-rose-400 to-pink-500'
  },
  {
    id: 'plans',
    title: 'Choose Your Journey',
    subtitle: 'Free forever, or unlock more',
    icon: Gift,
    gradient: 'from-amber-400 to-orange-500'
  }
];

const GOAL_OPTIONS = [
  { id: 'grief', label: 'Navigate grief & loss', icon: Heart },
  { id: 'wellness', label: 'Improve mental wellness', icon: Smile },
  { id: 'organization', label: 'Get organized', icon: Calendar },
  { id: 'journaling', label: 'Start journaling', icon: BookOpen },
  { id: 'family', label: 'Support my family', icon: Users },
  { id: 'growth', label: 'Personal growth', icon: Target }
];

const KEY_FEATURES = [
  { name: 'Life Organizer', icon: Calendar, description: 'Gentle task management' },
  { name: 'Journal Studio', icon: BookOpen, description: 'Reflect & write' },
  { name: 'Wellness Hub', icon: Heart, description: 'Track your wellbeing' },
  { name: 'Mindfulness', icon: Leaf, description: 'Breathing & calm' },
  { name: 'Family Hub', icon: Users, description: 'Coordinate with loved ones' },
  { name: 'AI Coaches', icon: Brain, description: 'Personalized guidance' }
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [userChallenges, setUserChallenges] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (user && !user.onboarding_completed) {
      const hasSeenOnboarding = localStorage.getItem('dobrylife_onboarding_shown');
      
      if (!hasSeenOnboarding) {
        setTimeout(() => {
          setIsOpen(true);
        }, 1500);
      }
    }
  }, [user]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleDismiss = async () => {
    localStorage.setItem('dobrylife_onboarding_shown', 'true');
    setIsOpen(false);
  };

  const handleComplete = async (withTrial = false, trialLevel = 'pro') => {
    setIsCompleting(true);
    
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        life_goals: selectedGoals,
        current_challenges: userChallenges ? [userChallenges] : []
      });

      if (withTrial && user) {
        await startTrial(user, trialLevel);
        toast.success(`🎉 ${trialLevel === 'executive' ? 'Executive' : 'Pro'} trial activated!`);
      }

      localStorage.setItem('dobrylife_onboarding_shown', 'true');
      await queryClient.invalidateQueries(['user']);
      
      toast.success('Welcome to DobryLife! 🌸');
      setIsOpen(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 shadow-2xl" hideClose>
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100 z-50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            transition={{ duration: 0.3 }}
          />
        </div>

        <button
          onClick={handleDismiss}
          className="absolute right-4 top-6 z-50 rounded-full p-2 hover:bg-black/10 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[500px] flex flex-col"
          >
            <div className={`bg-gradient-to-br ${currentStepData.gradient} text-white p-8 text-center pt-12`}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl mb-4"
              >
                <currentStepData.icon className="w-10 h-10" />
              </motion.div>

              <h2 className="text-3xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-white/90">{currentStepData.subtitle}</p>
            </div>

            <div className="flex-1 p-8 overflow-y-auto max-h-[400px]">
              {currentStepData.id === 'welcome' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="max-w-xl mx-auto">
                    <p className="text-lg text-gray-700 mb-6">
                      Hi <span className="font-bold text-purple-600">{user.full_name}</span>! 👋
                    </p>
                    <p className="text-gray-600 mb-8">
                      DobryLife is here to support your mental wellness journey with compassionate AI tools, 
                      mindful practices, and organizational support designed to help you thrive.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                        <Heart className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 mb-1">Compassionate</h4>
                        <p className="text-xs text-gray-600">Built with empathy</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                        <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 mb-1">AI-Powered</h4>
                        <p className="text-xs text-gray-600">Personalized support</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                        <Leaf className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 mb-1">Holistic</h4>
                        <p className="text-xs text-gray-600">Mind, body, spirit</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500">
                      Let's take 2 minutes to personalize your experience
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStepData.id === 'ai_assistant' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Your AI Companion</h3>
                        <p className="text-gray-600">
                          I'm always here in the bottom right corner to help you navigate, answer questions, and provide support.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/60 rounded-lg p-4">
                        <p className="text-sm font-semibold text-purple-700 mb-2">Try asking me:</p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            "Show me my planner"
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            "Create a task: Buy groceries"
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            "Take me to my journal"
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-5 h-5 text-cyan-600" />
                          <p className="font-semibold text-cyan-900">Available in 30+ Languages</p>
                        </div>
                        <p className="text-sm text-gray-700">
                          Communicate in your preferred language!
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStepData.id === 'goals' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <p className="text-gray-700 text-lg mb-2">What brings you here today?</p>
                    <p className="text-sm text-gray-500">Select all that apply</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {GOAL_OPTIONS.map((goal) => {
                      const isSelected = selectedGoals.includes(goal.id);
                      return (
                        <motion.button
                          key={goal.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleGoal(goal.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <goal.icon className="w-5 h-5" />
                            </div>
                            <span className={`font-semibold ${
                              isSelected ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {goal.label}
                            </span>
                            {isSelected && (
                              <Check className="w-5 h-5 text-purple-500 ml-auto" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Any specific challenges? (Optional)
                    </label>
                    <Textarea
                      value={userChallenges}
                      onChange={(e) => setUserChallenges(e.target.value)}
                      placeholder="Tell us what you're working through..."
                      rows={4}
                      className="bg-white/60"
                    />
                  </div>
                </motion.div>
              )}

              {currentStepData.id === 'features' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <p className="text-gray-700 text-lg">
                      Discover tools designed for your wellbeing
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {KEY_FEATURES.map((feature, idx) => (
                      <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{feature.name}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="w-6 h-6 text-emerald-600" />
                      <h4 className="font-bold text-emerald-900">Always Free</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Gratitude Journals
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Kids Homework Helper
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Mental Health Support
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {currentStepData.id === 'plans' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <p className="text-gray-700 text-lg mb-2">
                      Start with what works for you
                    </p>
                    <p className="text-sm text-gray-500">
                      Upgrade or cancel anytime
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                      <Badge className="mb-3 bg-emerald-100 text-emerald-700">
                        Always Free
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-4">$0</p>
                      
                      <ul className="space-y-2 text-sm text-gray-600 mb-6">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>Gratitude journals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>Kids homework AI</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>Mental health support</span>
                        </li>
                      </ul>

                      <Button
                        onClick={() => handleComplete(false)}
                        disabled={isCompleting}
                        variant="outline"
                        className="w-full"
                      >
                        Start Free
                      </Button>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                          <Gift className="w-3 h-3 mr-1" />
                          Try Free 3 Days
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">Pro</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-1">$14</p>
                      <p className="text-xs text-gray-600 mb-4">per month</p>
                      
                      <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span>All Free features +</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span>Life Coaches & SoulLink</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span>Wellness & Kids Studio</span>
                        </li>
                      </ul>

                      <Button
                        onClick={() => handleComplete(true, 'pro')}
                        disabled={isCompleting}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        Start Pro Trial
                      </Button>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                          <Gift className="w-3 h-3 mr-1" />
                          Try Free 3 Days
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">Executive</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-1">$55</p>
                      <p className="text-xs text-gray-600 mb-4">per month</p>
                      
                      <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span>All Pro features +</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span>Memory Vault</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span>Full Life Organizer</span>
                        </li>
                      </ul>

                      <Button
                        onClick={() => handleComplete(true, 'executive')}
                        disabled={isCompleting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Start Executive Trial
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-blue-900">
                      <strong>📚 Note:</strong> Books require separate purchase
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => handleComplete(false)}
                      disabled={isCompleting}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Stay on Free plan
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex gap-1">
                {ONBOARDING_STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStep 
                        ? 'bg-purple-600 w-6' 
                        : idx < currentStep 
                        ? 'bg-purple-400' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {!isFirstStep && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}

                {!isLastStep && (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}