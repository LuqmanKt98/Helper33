import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Heart,
  CheckCircle,
  Users,
  Sparkles,
  Award,
  Shield,
  ArrowRight,
  Target
} from 'lucide-react';
import { User } from '@/entities/User';
import { MentorProfile } from '@/entities/all';
import { createPageUrl } from '@/utils';

const steps = [
  {
    id: 'profile',
    title: 'Set Up Your Profile',
    description: 'Add a short bio, upload your photo, and share what inspires your work with children and families.',
    icon: GraduationCap,
    color: 'from-indigo-500 to-purple-500',
    actionText: 'Complete Profile',
    actionLink: 'MentorOnboarding'
  },
  {
    id: 'verify',
    title: 'Verify Your Credentials',
    description: 'Upload your license, certification, or professional ID for a Verified Mentor badge. This helps families know they\'re connecting with a trusted professional.',
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    actionText: 'Upload Credentials',
    actionLink: 'MentorOnboarding'
  },
  {
    id: 'connect',
    title: 'Connect With Families',
    description: 'You\'ll see pending invitations or linked families in your Mentor Dashboard. Review profiles, accept connections, and start sharing encouragement!',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    actionText: 'View Dashboard',
    actionLink: 'MentorDashboard'
  },
  {
    id: 'engage',
    title: 'Engage with Purpose',
    description: 'View student progress and projects. Leave kind feedback and gentle guidance. Share worksheets, creative activities, or reflective exercises.',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    actionText: 'Start Supporting',
    actionLink: 'MentorDashboard'
  }
];

export default function MentorWelcome() {
  const [user, setUser] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    loadMentorData();
  }, []);

  const loadMentorData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const profiles = await MentorProfile.filter({ created_by: userData.email });
      if (profiles.length > 0) {
        const profile = profiles[0];
        setMentorProfile(profile);

        // Check which steps are completed
        const completed = {
          profile: profile.bio && profile.profile_picture_url,
          verify: profile.verification_status === 'verified' || profile.credentials?.length > 0,
          connect: profile.connected_families?.length > 0,
          engage: profile.connected_families?.length > 0
        };
        setCompletedSteps(completed);
      }
    } catch (error) {
      console.error("Error loading mentor data:", error);
    }
  };

  const dismissWelcome = async () => {
    setShowWelcome(false);
    // Could save to user preferences that they've seen the welcome
  };

  if (!showWelcome || !user) return null;

  const mentorName = mentorProfile?.full_name || user.full_name || 'Mentor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Welcome Header */}
        <Card className="mb-6 border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Welcome to DobryLife Mentorship
            </CardTitle>
            <p className="text-xl text-gray-700">
              Hi <span className="font-semibold text-indigo-600">{mentorName}</span>!
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Welcome to <strong>DobryLife</strong> — we're so happy you've joined our mission to bring 
              compassionate learning, creativity, and connection to families everywhere. 🌿
            </p>
            
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <h3 className="font-semibold text-indigo-900 mb-2 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Your Impact Matters
              </h3>
              <p className="text-sm text-indigo-700 leading-relaxed">
                Every word of encouragement, every bit of feedback, and every shared resource helps a child grow — 
                and strengthens a family's story of healing and hope.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              Here's How to Get Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden ${completedSteps[step.id] ? 'border-green-500 bg-green-50/50' : 'border-gray-200'}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${step.color}`} />
                    <CardContent className="pt-6 pl-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                            <h4 className="font-bold text-gray-900">{step.title}</h4>
                            {completedSteps[step.id] && (
                              <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {step.description}
                          </p>
                          {!completedSteps[step.id] && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => window.location.href = createPageUrl(step.actionLink)}
                            >
                              {step.actionText}
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compassion Code */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              DobryLife Compassion & Clarity Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              All interactions are guided by our commitment to compassionate, supportive communication:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                <div className="text-3xl mb-2">🌸</div>
                <p className="font-semibold text-purple-900">Be Kind</p>
                <p className="text-sm text-gray-600 mt-1">Lead with empathy and warmth</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                <div className="text-3xl mb-2">🌱</div>
                <p className="font-semibold text-purple-900">Be Supportive</p>
                <p className="text-sm text-gray-600 mt-1">Celebrate growth and effort</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200 text-center">
                <div className="text-3xl mb-2">💬</div>
                <p className="font-semibold text-purple-900">Be Clear</p>
                <p className="text-sm text-gray-600 mt-1">Provide helpful, actionable guidance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => window.location.href = createPageUrl('MentorDashboard')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            Go to Mentor Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={dismissWelcome}
          >
            I'll Explore Later
          </Button>
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 text-sm">
            Thank you for bringing your heart and expertise to the DobryLife community. 💚
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}