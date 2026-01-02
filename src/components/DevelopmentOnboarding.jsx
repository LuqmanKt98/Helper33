
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  Gift, 
  Rocket, 
  DollarSign, 
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function DevelopmentOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    user_type: [],
    primary_interest: '',
    would_pay_monthly: null,
    max_monthly_price: '',
    preferred_model: '',
    most_valuable_features: [],
    missing_features: '',
    would_donate: null,
    waitlist_interest: '',
    additional_feedback: '',
    contact_for_updates: true,
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingResponse } = useQuery({
    queryKey: ['onboardingResponse'],
    queryFn: async () => {
      const responses = await base44.entities.OnboardingResponse.list('-created_date', 1);
      return responses[0] || null;
    },
    enabled: !!user,
  });

  React.useEffect(() => {
    if (user && !existingResponse && !localStorage.getItem('helper33_onboarding_dismissed')) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, existingResponse]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.OnboardingResponse.create({
        ...data,
        completed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingResponse'] });
      toast.success('🎉 Thank you! Your feedback helps us build Helper33 for you!', { duration: 5000 });
      setOpen(false);
    },
  });

  const handleDonate = () => {
    window.open('https://donorbox.org/helper33', '_blank');
    toast.success('Opening donation page... Thank you for your support! 💚');
  };

  const handleSubmit = () => {
    if (!formData.primary_interest) {
      toast.error('Please select your primary interest');
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleDismiss = () => {
    localStorage.setItem('helper33_onboarding_dismissed', 'true');
    setOpen(false);
  };

  const toggleUserType = (type) => {
    setFormData(prev => ({
      ...prev,
      user_type: prev.user_type.includes(type)
        ? prev.user_type.filter(t => t !== type)
        : [...prev.user_type, type]
    }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      most_valuable_features: prev.most_valuable_features.includes(feature)
        ? prev.most_valuable_features.filter(f => f !== feature)
        : prev.most_valuable_features.length < 3
          ? [...prev.most_valuable_features, feature]
          : prev.most_valuable_features
    }));
  };

  const features = [
    'AI Grief Coach',
    'Daily Wellness Tracking',
    'Digital Journal',
    'Life Coach',
    'Family Hub',
    'Mindfulness Hub',
    'Kids Studio',
    'Meal Planner',
    'Task Organizer',
    'Women\'s Health Tracking',
    'Crisis Support',
    'Community Features',
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <DialogTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Helper33! 🦃✨
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {step === 1 && "We're building something special together"}
            {step === 2 && "Help us understand what matters to you"}
            {step === 3 && "Your thoughts on pricing"}
            {step === 4 && "Support our development"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Rocket className="w-8 h-8 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-amber-900 mb-2">🚧 Under Active Development</h3>
                      <p className="text-amber-800 mb-3">
                        Helper33 is currently in <strong>early access</strong>. We're actively building and improving based on your feedback!
                      </p>
                      <div className="space-y-2 text-sm text-amber-800">
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <strong>100% FREE</strong> during development
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          All features unlocked
                        </p>
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          Your feedback shapes our future
                        </p>
                        <p className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          Optional: Support us & join VIP waitlist
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Label className="text-base font-semibold">I'm here as a... (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['parent', 'caregiver', 'wellness_seeker', 'grief_support', 'student', 'professional'].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleUserType(type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.user_type.includes(type)
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-medium capitalize">{type.replace('_', ' ')}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">My primary interest is...</Label>
                <div className="space-y-2">
                  {[
                    { value: 'grief_support', label: '💔 Grief & Loss Support', color: 'rose' },
                    { value: 'wellness_tracking', label: '🌱 Daily Wellness & Mental Health', color: 'green' },
                    { value: 'family_coordination', label: '👨‍👩‍👧‍👦 Family Coordination & Kids', color: 'blue' },
                    { value: 'mindfulness', label: '🧘 Mindfulness & Meditation', color: 'purple' },
                    { value: 'journaling', label: '📔 Journaling & Self-Reflection', color: 'amber' },
                    { value: 'life_coaching', label: '🎯 Life Coaching & Growth', color: 'indigo' },
                    { value: 'all_features', label: '✨ Everything!', color: 'pink' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({ ...prev, primary_interest: option.value }))}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        formData.primary_interest === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50 shadow-md`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select your top 3 most valuable features:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      disabled={!formData.most_valuable_features.includes(feature) && formData.most_valuable_features.length >= 3}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${
                        formData.most_valuable_features.includes(feature)
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 disabled:opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {formData.most_valuable_features.includes(feature) && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                        <span className="font-medium">{feature}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  {formData.most_valuable_features.length}/3 selected
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="missing" className="text-base font-semibold">
                  What features or improvements would you love to see?
                </Label>
                <Textarea
                  id="missing"
                  value={formData.missing_features}
                  onChange={(e) => setFormData(prev => ({ ...prev, missing_features: e.target.value }))}
                  placeholder="e.g., Better mobile app, offline mode, voice journaling, specific integrations..."
                  className="h-32"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">Help Us Price Helper33 Fairly</h3>
                      <p className="text-purple-800 text-sm">
                        We want Helper33 to be accessible while sustainable. Your input helps us find the right balance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Would you pay for a Helper33 subscription?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.would_pay_monthly === true ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, would_pay_monthly: true }))}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={formData.would_pay_monthly === false ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, would_pay_monthly: false }))}
                    className="flex-1"
                  >
                    No, prefer free
                  </Button>
                </div>
              </div>

              {formData.would_pay_monthly === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <Label className="text-base font-semibold">Maximum you'd pay monthly:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1-5', '5-10', '10-15', '15-20', '20+'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setFormData(prev => ({ ...prev, max_monthly_price: range }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.max_monthly_price === range
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <p className="font-bold text-lg">${range}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                <Label className="text-base font-semibold">Which pricing model feels right?</Label>
                <div className="space-y-2">
                  {[
                    { value: 'completely_free', label: '💚 Completely free (ad-supported)', desc: 'Free forever with optional ads' },
                    { value: 'freemium', label: '⚡ Free basics + Premium', desc: 'Core features free, advanced features paid' },
                    { value: 'donation_based', label: '❤️ Pay what you can', desc: 'Choose your own price, including $0' },
                    { value: 'low_cost_subscription', label: '💎 Low-cost subscription', desc: 'Small monthly fee ($5-10) for all features' },
                    { value: 'premium_features', label: '🌟 Premium tiers', desc: 'Different tiers with increasing features' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({ ...prev, preferred_model: option.value }))}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        formData.preferred_model === option.value
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Gift className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-green-900 mb-2">Support Helper33's Journey</h3>
                      <p className="text-green-800 text-sm mb-3">
                        Your donation helps us build therapeutic, accessible wellness tools for everyone. Early supporters get:
                      </p>
                      <ul className="space-y-1 text-sm text-green-800">
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <strong>VIP Waitlist</strong> access to new features
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <strong>Lifetime discount</strong> when we launch
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <strong>Direct influence</strong> on development
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          Our <strong>eternal gratitude</strong> 💚
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Would you consider supporting us?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.would_donate === true ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, would_donate: true }))}
                    className="flex-1"
                  >
                    Yes, I'd love to!
                  </Button>
                  <Button
                    type="button"
                    variant={formData.would_donate === false ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, would_donate: false }))}
                    className="flex-1"
                  >
                    Not right now
                  </Button>
                </div>
              </div>

              {formData.would_donate === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <Button
                    onClick={handleDonate}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-6 text-lg font-bold shadow-lg"
                  >
                    <Gift className="w-6 h-6 mr-3" />
                    Make a Donation
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                  <p className="text-xs text-center text-gray-600">
                    You'll be taken to our secure payment page. Choose any amount that feels right!
                  </p>
                </motion.div>
              )}

              <div className="space-y-3">
                <Label className="text-base font-semibold">Waitlist Interest:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'yes_free', label: 'Yes, keep me updated (free)' },
                    { value: 'yes_paid', label: 'Yes, notify for early bird pricing' },
                    { value: 'maybe', label: 'Maybe later' },
                    { value: 'no', label: 'No thanks' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({ ...prev, waitlist_interest: option.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.waitlist_interest === option.value
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-medium text-sm">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="feedback" className="text-base font-semibold">
                  Any other thoughts? (optional)
                </Label>
                <Textarea
                  id="feedback"
                  value={formData.additional_feedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, additional_feedback: e.target.value }))}
                  placeholder="Share any ideas, concerns, or suggestions..."
                  className="h-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="contact"
                  checked={formData.contact_for_updates}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contact_for_updates: checked }))}
                />
                <Label htmlFor="contact" className="text-sm">
                  Keep me updated on Helper33's development journey
                </Label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-all ${
                  s <= step ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step === 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDismiss}
              >
                Skip for now
              </Button>
            )}
            
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(prev => prev - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                disabled={step === 1 && !formData.primary_interest}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-emerald-500"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Complete & Start Using Helper33!
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
