import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ArrowRight, ArrowLeft, CheckCircle, Sparkles,
  User, Bell, Star, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const steps = [
  { id: 1, title: 'Welcome', icon: Heart },
  { id: 2, title: 'About You', icon: User },
  { id: 3, title: 'Your Needs', icon: Sparkles },
  { id: 4, title: 'Preferences', icon: Bell },
  { id: 5, title: 'Complete', icon: CheckCircle }
];

export default function ClientOnboarding({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    preferred_name: user?.preferred_name || '',
    phone_number: user?.phone_number || '',
    bio: user?.bio || '',
    timezone: user?.timezone || 'America/New_York',
    
    // Needs & Preferences
    primary_concerns: [],
    preferred_treatment_approach: [],
    age_group: '',
    session_preference: '',
    budget_per_session: '',
    has_insurance: false,
    insurance_provider: '',
    preferred_language: 'English',
    availability_preference: '',
    
    // Communication Preferences
    communication_method: 'email', // email, sms, both
    email_notifications: true,
    sms_notifications: false
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Update user profile
      await base44.auth.updateMe({
        preferred_name: formData.preferred_name,
        phone_number: formData.phone_number,
        bio: formData.bio,
        timezone: formData.timezone,
        preferred_language: formData.preferred_language,
        notification_preferences: {
          communication_method: formData.communication_method,
          email_notifications: formData.email_notifications,
          sms_notifications: formData.sms_notifications,
          email_appointment_confirmed: true,
          email_appointment_reminder: true,
          email_new_message: true,
          email_review_response: true
        },
        onboarding_completed: true
      });

      // Create match survey
      await base44.entities.PractitionerMatchSurvey.create({
        primary_concerns: formData.primary_concerns,
        preferred_treatment_approach: formData.preferred_treatment_approach,
        age_group: formData.age_group,
        session_preference: formData.session_preference,
        budget_per_session: parseFloat(formData.budget_per_session) || 0,
        has_insurance: formData.has_insurance,
        insurance_provider: formData.insurance_provider,
        preferred_language: formData.preferred_language,
        availability_preference: formData.availability_preference
      });

      queryClient.invalidateQueries(['currentUser']);
      toast.success('Welcome to Helper33! 🎉');
      
      if (onComplete) {
        onComplete();
      } else {
        navigate(createPageUrl('FindPractitioners'));
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const toggleArrayItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      rotate: isActive ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      isActive ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      'bg-gray-300'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className={`text-xs mt-2 font-semibold ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </motion.div>
                  {idx < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <WelcomeStep />}
            {currentStep === 2 && <PersonalInfoStep formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <NeedsStep formData={formData} setFormData={setFormData} toggleArrayItem={toggleArrayItem} />}
            {currentStep === 4 && <PreferencesStep formData={formData} setFormData={setFormData} />}
            {currentStep === 5 && <CompleteStep formData={formData} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            className="border-2 border-purple-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
      <CardContent className="p-8 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Wellness Journey! 🌸</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          We're here to help you find the perfect practitioner match. This quick setup will take just a few minutes 
          and will help us understand your needs and preferences better.
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <FeatureCard icon={User} title="Personalized" description="Tailored to your needs" />
          <FeatureCard icon={Star} title="Verified" description="Licensed professionals" />
          <FeatureCard icon={MessageSquare} title="Supportive" description="Direct communication" />
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
    >
      <Icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
      <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </motion.div>
  );
}

function PersonalInfoStep({ formData, setFormData }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-6 h-6 text-purple-600" />
          Tell Us About Yourself
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Preferred Name</label>
          <Input
            value={formData.preferred_name}
            onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
            placeholder="What should we call you?"
            className="border-2 border-purple-300"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone Number</label>
          <Input
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            placeholder="(555) 123-4567"
            className="border-2 border-purple-300"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">About You (Optional)</label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Share a bit about yourself..."
            rows={4}
            className="border-2 border-purple-300"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Timezone</label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

function NeedsStep({ formData, setFormData, toggleArrayItem }) {
  const concerns = [
    'Anxiety', 'Depression', 'Stress Management', 'Trauma', 'Grief',
    'Relationship Issues', 'Family Therapy', 'Life Transitions', 'Self-Esteem'
  ];

  const approaches = [
    'Cognitive Behavioral Therapy (CBT)', 'EMDR', 'Mindfulness-Based',
    'Psychodynamic', 'Solution-Focused', 'Humanistic'
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          What Brings You Here?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Primary Concerns (Select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {concerns.map(concern => (
              <motion.button
                key={concern}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({
                  ...formData,
                  primary_concerns: toggleArrayItem(formData.primary_concerns, concern)
                })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.primary_concerns.includes(concern)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {concern}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Preferred Treatment Approach (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {approaches.map(approach => (
              <motion.button
                key={approach}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({
                  ...formData,
                  preferred_treatment_approach: toggleArrayItem(formData.preferred_treatment_approach, approach)
                })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.preferred_treatment_approach.includes(approach)
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {approach}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Age Group</label>
            <select
              value={formData.age_group}
              onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg"
            >
              <option value="">Select...</option>
              <option value="child">Child (0-12)</option>
              <option value="teen">Teen (13-17)</option>
              <option value="adult">Adult (18-64)</option>
              <option value="senior">Senior (65+)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Session Preference</label>
            <select
              value={formData.session_preference}
              onChange={(e) => setFormData({ ...formData, session_preference: e.target.value })}
              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg"
            >
              <option value="">Select...</option>
              <option value="telehealth">Telehealth Only</option>
              <option value="in_person">In-Person Only</option>
              <option value="both">Either/Both</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Budget per Session</label>
          <Input
            type="number"
            value={formData.budget_per_session}
            onChange={(e) => setFormData({ ...formData, budget_per_session: e.target.value })}
            placeholder="Enter amount"
            className="border-2 border-purple-300"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.has_insurance}
              onChange={(e) => setFormData({ ...formData, has_insurance: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-gray-700">I have insurance</span>
          </label>
          {formData.has_insurance && (
            <Input
              value={formData.insurance_provider}
              onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
              placeholder="Insurance provider name"
              className="border-2 border-purple-300 mt-2"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PreferencesStep({ formData, setFormData }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-purple-600" />
          Communication Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">How would you like to be notified?</label>
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, communication_method: 'email', email_notifications: true, sms_notifications: false })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                formData.communication_method === 'email'
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md'
                  : 'border-purple-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.communication_method === 'email' ? 'bg-purple-500' : 'bg-purple-200'
                }`}>
                  <MessageSquare className={`w-5 h-5 ${formData.communication_method === 'email' ? 'text-white' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Email Only</p>
                  <p className="text-xs text-gray-600">Receive notifications via email</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, communication_method: 'sms', email_notifications: false, sms_notifications: true })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                formData.communication_method === 'sms'
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md'
                  : 'border-purple-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.communication_method === 'sms' ? 'bg-blue-500' : 'bg-blue-200'
                }`}>
                  <MessageSquare className={`w-5 h-5 ${formData.communication_method === 'sms' ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">SMS/Text Only</p>
                  <p className="text-xs text-gray-600">Receive notifications via text message</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, communication_method: 'both', email_notifications: true, sms_notifications: true })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                formData.communication_method === 'both'
                  ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md'
                  : 'border-purple-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.communication_method === 'both' ? 'bg-green-500' : 'bg-green-200'
                }`}>
                  <Bell className={`w-5 h-5 ${formData.communication_method === 'both' ? 'text-white' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Both Email & SMS</p>
                  <p className="text-xs text-gray-600">Receive notifications via both channels</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Preferred Language</label>
          <select
            value={formData.preferred_language}
            onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Availability Preference</label>
          <Input
            value={formData.availability_preference}
            onChange={(e) => setFormData({ ...formData, availability_preference: e.target.value })}
            placeholder="e.g., Evenings and weekends"
            className="border-2 border-purple-300"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CompleteStep({ formData }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
      <CardContent className="p-8 text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">You're All Set! 🎉</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Thank you for completing your profile. We'll now help you find the perfect practitioner match based on your preferences.
        </p>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="font-bold text-gray-800 mb-3">What's Next?</h3>
          <ul className="text-left text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Browse verified practitioners matched to your needs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Book appointments directly through the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Communicate safely about scheduling</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Share your experience with reviews</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}