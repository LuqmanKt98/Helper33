
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Leaf,
  MessageCircle,
  Gift,
  Star,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const USER_TYPES = [
  { value: 'parent', label: 'Parent', emoji: '👨‍👩‍👧' },
  { value: 'student', label: 'Student', emoji: '🎓' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'caregiver', label: 'Caregiver', emoji: '🤗' },
  { value: 'other', label: 'Other', emoji: '✨' }
];

const MAIN_GOALS = [
  { value: 'stress_relief_mindfulness', label: 'Stress relief / mindfulness' },
  { value: 'organization_productivity', label: 'Organization & productivity' },
  { value: 'emotional_support_grief', label: 'Emotional support / grief recovery' },
  { value: 'parenting_tools', label: 'Parenting tools' },
  { value: 'journaling_reflection', label: 'Journaling & self-reflection' },
  { value: 'fitness_meal_planning', label: 'Fitness / meal planning' },
  { value: 'other', label: 'Other' }
];

const FEATURES = [
  { value: 'ai_grief_coach', label: 'AI Grief Coach / Emotional Companion', icon: Heart },
  { value: 'daily_planner', label: 'Daily Planner & Organizer', icon: CheckCircle2 },
  { value: 'journaling_tools', label: 'Journaling tools (Gratitude, HeartShift, Infinity)', icon: Sparkles },
  { value: 'family_kids_hub', label: 'Family / Kids Hub', icon: Heart },
  { value: 'meal_planner_wellness', label: 'Meal Planner & Wellness Tracker', icon: Heart },
  { value: 'ai_life_coach', label: 'AI Life Coach & Goal Setting', icon: Star },
  { value: 'social_community', label: 'Social & Community Platform', icon: MessageCircle },
  { value: 'meditation_mindfulness', label: 'Meditation / Mindfulness games', icon: Leaf },
  { value: 'ai_personal_assistant', label: 'AI Personal Assistant', icon: Sparkles }
];

const PRICE_RANGES = [
  { value: '4.99-6.99', label: '$4.99 – $6.99' },
  { value: '7.99-9.99', label: '$7.99 – $9.99' },
  { value: '10-14.99', label: '$10 – $14.99' },
  { value: '15-19.99', label: '$15 – $19.99' },
  { value: 'lifetime_access', label: 'One-time lifetime access option' }
];

const SUBSCRIPTION_MOTIVATORS = [
  { value: 'family_access', label: 'Access for whole family' },
  { value: 'ai_companions_mood_tracking', label: 'AI chat companions and mood tracking' },
  { value: 'discounts_books_merch', label: 'Discounts on books, merch, or wellness tools' },
  { value: 'free_trial_first', label: 'Free trial access first' }
];

const BETA_OPTIONS = [
  { value: 'yes', label: 'Yes, I\'d love to!', emoji: '🎉' },
  { value: 'maybe', label: 'Maybe', emoji: '🤔' },
  { value: 'not_now', label: 'Not right now', emoji: '⏰' }
];

export default function FeedbackSurvey() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: existingFeedback } = useQuery({
    queryKey: ['userFeedback'],
    queryFn: async () => {
      const feedback = await base44.entities.UserFeedbackSurvey.list('-created_date', 1);
      return feedback[0];
    },
    enabled: !!user
  });

  const [formData, setFormData] = useState({
    user_description: [],
    user_description_other: '',
    main_goals: [],
    main_goals_other: '',
    most_valuable_features: [],
    daily_use_feature: '',
    missing_feature_wish: '',
    preferred_price_range: '',
    subscription_motivators: [],
    recommendation_score: 7,
    what_makes_favorite: '',
    beta_interest: '',
    additional_comments: '',
    contact_for_followup: true
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: (data) => base44.entities.UserFeedbackSurvey.create(data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success('Thank you for your valuable feedback! 💚');

      // Track with analytics if available
      if (window.gtag) {
        window.gtag('event', 'feedback_submitted', {
          recommendation_score: formData.recommendation_score
        });
      }
    },
    onError: (error) => {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  });

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (formData.user_description.length === 0) {
      toast.error('Please select at least one user type');
      setCurrentStep(1);
      return;
    }
    if (formData.main_goals.length === 0) {
      toast.error('Please select at least one main goal');
      setCurrentStep(1);
      return;
    }
    if (formData.most_valuable_features.length === 0) {
      toast.error('Please select at least one valuable feature');
      setCurrentStep(2);
      return;
    }

    submitFeedbackMutation.mutate(formData);
  };

  const totalSteps = 4;

  if (isSubmitted) {
    return (
      <>
        <SEO
          title="Feedback Submitted - DobryLife"
          description="Thank you for your valuable feedback! Your input helps us improve DobryLife."
          keywords="feedback submitted, thank you, DobryLife improvement"
        />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <Card className="bg-white/90 backdrop-blur-lg border-2 border-green-300 shadow-2xl">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Thank You! 💚
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Your feedback helps us build a more compassionate and healing platform for everyone.
                </p>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 mb-6">
                  <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-gray-700 leading-relaxed">
                    As a thank you, you'll be among the first to know about new features,
                    early access opportunities, and special supporter benefits.
                  </p>
                </div>

                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  if (existingFeedback && !isSubmitted) {
    return (
      <>
        <SEO
          title="Feedback Already Submitted - DobryLife"
          description="You've already shared feedback with DobryLife. Thank you for your contribution!"
          keywords="feedback submitted, DobryLife, user feedback, already responded"
        />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 flex items-center justify-center">
          <Card className="max-w-2xl bg-white/90 backdrop-blur-lg border-2 border-purple-200 shadow-2xl">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                You've Already Shared Feedback
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for helping us improve DobryLife! Your response was submitted on{' '}
                {new Date(existingFeedback.created_date).toLocaleDateString()}.
              </p>
              <p className="text-sm text-gray-500">
                We'll reach out if we have follow-up questions. You can submit new feedback anytime from your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Share Feedback - DobryLife | Help Us Improve"
        description="Share your feedback and help us build a better wellness platform. Your input shapes the future of DobryLife and helps us serve you better."
        keywords="user feedback, product feedback, wellness app feedback, user survey, product improvement, customer feedback"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-lg rounded-full border-2 border-purple-200 mb-6 shadow-xl">
              <Leaf className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DobryLife Feedback
              </span>
            </div>

            <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
              Help Us Build Better
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your insights shape the future of DobryLife. Share your experience and help us create a more healing platform.
            </p>

            {/* Progress Bar */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm font-medium text-purple-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: About You */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-white/90 backdrop-blur-lg border-2 border-purple-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Heart className="w-6 h-6 text-purple-600" />
                        💫 About You
                      </CardTitle>
                      <CardDescription>Help us understand who you are and what you need</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* User Description */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">How would you best describe yourself? (Select all that apply)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {USER_TYPES.map(type => (
                            <Button
                              key={type.value}
                              type="button"
                              variant={formData.user_description.includes(type.value) ? 'default' : 'outline'}
                              className={`h-auto py-4 flex flex-col items-center gap-2 ${
                                formData.user_description.includes(type.value) ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
                              }`}
                              onClick={() => handleArrayToggle('user_description', type.value)}
                            >
                              <span className="text-2xl">{type.emoji}</span>
                              <span className="text-sm">{type.label}</span>
                            </Button>
                          ))}
                        </div>
                        {formData.user_description.includes('other') && (
                          <Input
                            className="mt-3"
                            placeholder="Please specify..."
                            value={formData.user_description_other}
                            onChange={(e) => setFormData({ ...formData, user_description_other: e.target.value })}
                          />
                        )}
                      </div>

                      {/* Main Goals */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">What are your main goals when using a wellness app? (Select all that apply)</Label>
                        <div className="space-y-2">
                          {MAIN_GOALS.map(goal => (
                            <div key={goal.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                              <Checkbox
                                id={goal.value}
                                checked={formData.main_goals.includes(goal.value)}
                                onCheckedChange={() => handleArrayToggle('main_goals', goal.value)}
                              />
                              <Label htmlFor={goal.value} className="flex-1 cursor-pointer">
                                {goal.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {formData.main_goals.includes('other') && (
                          <Input
                            className="mt-3"
                            placeholder="Please specify your goal..."
                            value={formData.main_goals_other}
                            onChange={(e) => setFormData({ ...formData, main_goals_other: e.target.value })}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: App Experience */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-white/90 backdrop-blur-lg border-2 border-purple-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        💻 App Experience
                      </CardTitle>
                      <CardDescription>Tell us about the features that matter most to you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Most Valuable Features */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Which features are most valuable to you? (Select up to 3)
                        </Label>
                        <div className="grid gap-3">
                          {FEATURES.map(feature => {
                            const Icon = feature.icon;
                            const isSelected = formData.most_valuable_features.includes(feature.value);
                            const isDisabled = !isSelected && formData.most_valuable_features.length >= 3;

                            return (
                              <Button
                                key={feature.value}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                className={`h-auto py-3 justify-start ${
                                  isSelected ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
                                } ${isDisabled ? 'opacity-50' : ''}`}
                                onClick={() => !isDisabled && handleArrayToggle('most_valuable_features', feature.value)}
                                disabled={isDisabled}
                              >
                                <Icon className="w-5 h-5 mr-3" />
                                <span className="text-left">{feature.label}</span>
                                {isSelected && <CheckCircle2 className="w-5 h-5 ml-auto" />}
                              </Button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {formData.most_valuable_features.length}/3 selected
                        </p>
                      </div>

                      {/* Daily Use Feature */}
                      <div>
                        <Label className="text-base font-semibold mb-2 block">Which feature would you use daily?</Label>
                        <Input
                          value={formData.daily_use_feature}
                          onChange={(e) => setFormData({ ...formData, daily_use_feature: e.target.value })}
                          placeholder="e.g., Daily planner, Mood tracker, Journaling..."
                        />
                      </div>

                      {/* Missing Feature */}
                      <div>
                        <Label className="text-base font-semibold mb-2 block">
                          What is one feature you wish wellness apps had that you haven't seen yet?
                        </Label>
                        <Textarea
                          value={formData.missing_feature_wish}
                          onChange={(e) => setFormData({ ...formData, missing_feature_wish: e.target.value })}
                          placeholder="Share your innovative ideas..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-white/90 backdrop-blur-lg border-2 border-purple-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Gift className="w-6 h-6 text-purple-600" />
                        💰 Pricing & Subscriptions
                      </CardTitle>
                      <CardDescription>Help us create fair and accessible pricing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Price Range */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          What price range feels fair for premium access (monthly)?
                        </Label>
                        <div className="space-y-2">
                          {PRICE_RANGES.map(range => (
                            <Button
                              key={range.value}
                              type="button"
                              variant={formData.preferred_price_range === range.value ? 'default' : 'outline'}
                              className={`w-full justify-start ${
                                formData.preferred_price_range === range.value ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
                              }`}
                              onClick={() => setFormData({ ...formData, preferred_price_range: range.value })}
                            >
                              {range.label}
                              {formData.preferred_price_range === range.value && (
                                <CheckCircle2 className="w-5 h-5 ml-auto" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Subscription Motivators */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Would you be more likely to subscribe if: (Select all that apply)
                        </Label>
                        <div className="space-y-2">
                          {SUBSCRIPTION_MOTIVATORS.map(motivator => (
                            <div key={motivator.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                              <Checkbox
                                id={motivator.value}
                                checked={formData.subscription_motivators.includes(motivator.value)}
                                onCheckedChange={() => handleArrayToggle('subscription_motivators', motivator.value)}
                              />
                              <Label htmlFor={motivator.value} className="flex-1 cursor-pointer">
                                {motivator.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Final Thoughts */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-white/90 backdrop-blur-lg border-2 border-purple-200 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-purple-600" />
                        💡 Improvement & Community
                      </CardTitle>
                      <CardDescription>Help us understand your experience and vision</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Recommendation Score */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          How likely are you to recommend DobryLife to a friend?
                        </Label>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-4xl font-bold text-purple-600">{formData.recommendation_score}</span>
                          <span className="text-gray-500">/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.recommendation_score}
                          onChange={(e) => setFormData({ ...formData, recommendation_score: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Not likely</span>
                          <span>Very likely</span>
                        </div>
                      </div>

                      {/* What Makes Favorite */}
                      <div>
                        <Label className="text-base font-semibold mb-2 block">
                          What would make DobryLife your favorite wellness app?
                        </Label>
                        <Textarea
                          value={formData.what_makes_favorite}
                          onChange={(e) => setFormData({ ...formData, what_makes_favorite: e.target.value })}
                          placeholder="Share your thoughts and vision..."
                          rows={4}
                        />
                      </div>

                      {/* Beta Interest */}
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Would you be interested in joining our Beta User or Donor Program?
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          {BETA_OPTIONS.map(option => (
                            <Button
                              key={option.value}
                              type="button"
                              variant={formData.beta_interest === option.value ? 'default' : 'outline'}
                              className={`h-auto py-4 flex flex-col items-center gap-2 ${
                                formData.beta_interest === option.value ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''
                              }`}
                              onClick={() => setFormData({ ...formData, beta_interest: option.value })}
                            >
                              <span className="text-2xl">{option.emoji}</span>
                              <span className="text-sm text-center">{option.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Additional Comments */}
                      <div>
                        <Label className="text-base font-semibold mb-2 block">
                          Any additional comments or suggestions?
                        </Label>
                        <Textarea
                          value={formData.additional_comments}
                          onChange={(e) => setFormData({ ...formData, additional_comments: e.target.value })}
                          placeholder="We're listening... Share anything else on your mind!"
                          rows={4}
                        />
                      </div>

                      {/* Contact Permission */}
                      <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <Checkbox
                          id="contact"
                          checked={formData.contact_for_followup}
                          onCheckedChange={(checked) => setFormData({ ...formData, contact_for_followup: checked })}
                        />
                        <Label htmlFor="contact" className="flex-1 cursor-pointer text-sm">
                          I'm open to being contacted about my feedback or early access opportunities
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitFeedbackMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8"
                >
                  {submitFeedbackMutation.isPending ? (
                    'Submitting...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Your responses are confidential and help us create a better experience for everyone 💚
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
