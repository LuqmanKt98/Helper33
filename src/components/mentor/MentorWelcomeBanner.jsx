import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { User, MentorProfile } from '@/entities/all';
import { createPageUrl } from '@/utils';

// This is a smaller banner that can be shown at the top of pages for new mentors
export default function MentorWelcomeBanner() {
  const [show, setShow] = useState(false);
  const [mentorProfile, setMentorProfile] = useState(null);

  useEffect(() => {
    checkIfNewMentor();
  }, []);

  const checkIfNewMentor = async () => {
    try {
      const userData = await User.me();
      const profiles = await MentorProfile.filter({ created_by: userData.email });
      
      if (profiles.length > 0) {
        const profile = profiles[0];
        setMentorProfile(profile);
        
        // Show banner if profile is not fully set up
        const isIncomplete = !profile.bio || !profile.profile_picture_url || 
                            profile.verification_status === 'pending';
        
        // Check if user has dismissed the banner (could store in user preferences)
        const hasSeenBanner = localStorage.getItem('mentor_welcome_banner_dismissed');
        
        if (isIncomplete && !hasSeenBanner) {
          setShow(true);
        }
      }
    } catch (error) {
      console.error("Error checking mentor status:", error);
    }
  };

  const dismissBanner = () => {
    localStorage.setItem('mentor_welcome_banner_dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">
                  Welcome to DobryLife Mentorship! 🎉
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Complete your profile setup to start connecting with families and making an impact.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.location.href = createPageUrl('MentorWelcome')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissBanner}
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
              <button
                onClick={dismissBanner}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}