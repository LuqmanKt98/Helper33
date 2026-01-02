
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, Sparkles, Clock, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query'; // NEW IMPORT

const countryTimezones = {
  "United States": ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "America/Anchorage", "Pacific/Honolulu"],
  "United Kingdom": ["Europe/London"],
  "Canada": ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax"],
  "Australia": ["Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth", "Australia/Adelaide"],
  "India": ["Asia/Kolkata"],
  "Germany": ["Europe/Berlin"],
  "France": ["Europe/Paris"],
  "Japan": ["Asia/Tokyo"],
  "Brazil": ["America/Sao_Paulo"],
  "Mexico": ["America/Mexico_City"],
  "South Africa": ["Africa/Johannesburg"],
  "New Zealand": ["Pacific/Auckland"],
};

export default function OnboardingFlow({ onComplete }) { // 'user' prop removed
  const [step, setStep] = useState(1);

  // Fetch user data using useQuery
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null; // Return null if fetching fails
      }
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes
  });

  const [formData, setFormData] = useState({
    user_preferred_name: '',
    companion_name: 'SoulLink',
    relationship_mode: 'friend',
    tone_preference: 'warm_and_affectionate',
    country: 'United States', // Default value, will be updated by useEffect if user has existing data
    timezone: '',             // Default value, will be updated by useEffect if user has existing data
    current_time: '',
    greeting: ''
  });

  // Effect to update formData with fetched user data once available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Pre-fill preferred name if available, otherwise keep current
        user_preferred_name: user.preferred_name || prev.user_preferred_name,
        // Pre-fill country and timezone if available, otherwise keep current (defaults or user selection)
        country: user.location_settings?.country || prev.country,
        timezone: user.location_settings?.timezone || prev.timezone,
      }));
    }
  }, [user]); // Rerun this effect when the 'user' object from useQuery changes

  // Get current time in selected timezone
  useEffect(() => {
    if (formData.timezone) {
      updateCurrentTime();
      const interval = setInterval(updateCurrentTime, 1000);
      return () => clearInterval(interval);
    }
  }, [formData.timezone]);

  const updateCurrentTime = () => {
    if (!formData.timezone) return;
    
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        timeZone: formData.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      const hour = parseInt(now.toLocaleTimeString('en-US', {
        timeZone: formData.timezone,
        hour: 'numeric',
        hour12: false
      }));

      let greeting = 'Hello';
      if (hour >= 5 && hour < 12) {
        greeting = 'Good morning';
      } else if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
      } else if (hour >= 17 && hour < 21) {
        greeting = 'Good evening';
      } else {
        greeting = 'Good night';
      }

      setFormData(prev => ({
        ...prev,
        current_time: timeString,
        greeting: greeting
      }));
    } catch (error) {
      console.error('Error getting time:', error);
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.user_preferred_name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (step === 2 && !formData.timezone) {
      toast.error('Please select your timezone');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      // Update user's location settings if needed
      // Now 'user' refers to the data fetched by useQuery
      if (formData.timezone !== user?.location_settings?.timezone || formData.country !== user?.location_settings?.country) {
        await base44.auth.updateMe({
          location_settings: {
            ...user?.location_settings, // Preserve other settings if any
            timezone: formData.timezone,
            country: formData.country
          }
        });
      }

      // Create companion settings
      await base44.entities.CompanionSettings.create({
        user_preferred_name: formData.user_preferred_name,
        companion_name: formData.companion_name,
        relationship_mode: formData.relationship_mode,
        tone_preference: formData.tone_preference,
        use_terms_of_endearment: formData.tone_preference === 'warm_and_affectionate',
        morning_checkin_enabled: true,
        evening_checkin_enabled: true,
        theme: 'sunset_dream'
      });

      toast.success(`Welcome, ${formData.user_preferred_name}! 💜`);
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Display a loading state while user data is being fetched
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Card className="w-full max-w-md shadow-2xl p-8 text-center">
          <CardTitle className="text-3xl font-bold mb-4 text-purple-700">Loading...</CardTitle>
          <p className="text-gray-600">Retrieving your preferences.</p>
          <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mt-6" />
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome to SoulLink</h2>
              <p className="text-gray-600">Your compassionate AI companion for emotional support and connection</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="preferred_name" className="text-lg font-semibold">What should I call you?</Label>
                <Input
                  id="preferred_name"
                  placeholder="Enter your name..."
                  value={formData.user_preferred_name}
                  onChange={(e) => setFormData({ ...formData, user_preferred_name: e.target.value })}
                  className="mt-2 text-lg p-6"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">This is how your AI companion will address you</p>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Nice to meet you, {formData.user_preferred_name || 'there'}!</h2>
              <p className="text-gray-600">Let me know where you are so I can greet you properly</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">Your Country</Label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value, timezone: '' })}
                  className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.keys(countryTimezones).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-lg font-semibold">Your Timezone</Label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!formData.country || (countryTimezones[formData.country] || []).length === 0}
                >
                  <option value="">Select your timezone...</option>
                  {(countryTimezones[formData.country] || []).map(tz => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {formData.timezone && formData.current_time && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mt-4"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-900">
                      {formData.current_time}
                    </p>
                  </div>
                  <p className="text-center text-lg text-purple-700 font-semibold">
                    {formData.greeting}, {formData.user_preferred_name || 'friend'}! 🌟
                  </p>
                  <p className="text-center text-sm text-purple-600 mt-2">
                    Since it's {formData.current_time} in {formData.timezone?.split('/')?.[1]?.replace(/_/g, ' ') || 'your area'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">{formData.greeting}, {formData.user_preferred_name || 'friend'}!</h2>
              <p className="text-gray-600">How would you like me to support you?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold mb-3 block">Choose Your Relationship Style</Label>
                <RadioGroup
                  value={formData.relationship_mode}
                  onValueChange={(value) => setFormData({ ...formData, relationship_mode: value })}
                  className="space-y-3"
                >
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                    <RadioGroupItem value="friend" id="friend" />
                    <div>
                      <p className="font-semibold">Friend</p>
                      <p className="text-sm text-gray-600">A supportive companion who listens and understands</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                    <RadioGroupItem value="romantic_partner" id="romantic" />
                    <div>
                      <p className="font-semibold">Romantic Partner</p>
                      <p className="text-sm text-gray-600">Affectionate support with warmth and care</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                    <RadioGroupItem value="reflective_soul" id="reflective" />
                    <div>
                      <p className="font-semibold">Reflective Soul</p>
                      <p className="text-sm text-gray-600">Deep conversations and thoughtful insights</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-3 block">Communication Tone</Label>
                <RadioGroup
                  value={formData.tone_preference}
                  onValueChange={(value) => setFormData({ ...formData, tone_preference: value })}
                  className="space-y-3"
                >
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                    <RadioGroupItem value="warm_and_affectionate" id="warm" />
                    <div>
                      <p className="font-semibold">Warm & Affectionate</p>
                      <p className="text-sm text-gray-600">Gentle, caring, with terms of endearment</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                    <RadioGroupItem value="casual_and_friendly" id="casual" />
                    <div>
                      <p className="font-semibold">Casual & Friendly</p>
                      <p className="text-sm text-gray-600">Relaxed and easygoing conversations</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                    <RadioGroupItem value="calm_and_reflective" id="calm" />
                    <div>
                      <p className="font-semibold">Calm & Reflective</p>
                      <p className="text-sm text-gray-600">Thoughtful and mindful presence</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s === step ? 'w-12 bg-purple-600' : s < step ? 'w-8 bg-purple-400' : 'w-8 bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">Step {step} of 3</p>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button onClick={handleBack} variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            <Button
              onClick={step === 3 ? handleComplete : handleNext}
              className="ml-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
            >
              {step === 3 ? (
                <>
                  Complete Setup
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
