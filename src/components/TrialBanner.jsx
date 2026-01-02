import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Gift, Clock, X, Sparkles, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 3);
      
      await base44.auth.updateMe({
        subscription_status: 'trial',
        trial_start_date: now,
        trial_end_date: trialEnd.toISOString(),
        trial_used: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success('🎉 Your 3-day trial has started! Enjoy all features!');
    }
  });

  // Don't show on book pages - they have their own purchase flow
  const currentPath = window.location.pathname;
  const isBookPage = currentPath.includes('Book') && !currentPath.includes('Journal');
  if (isBookPage) return null;

  if (!user) return null;
  if (user.role === 'admin') return null;
  if (dismissed) return null;

  // Don't show if user already has a paid plan
  if (user.subscription_plan === 'pro' || user.subscription_plan === 'executive' || user.subscription_plan === 'waitlist') {
    return null;
  }

  // Check if trial is active
  const isInTrial = user.subscription_status === 'trial' && user.trial_start_date;
  const trialEndDate = user.trial_end_date ? new Date(user.trial_end_date) : null;
  const now = new Date();
  const trialEnded = trialEndDate && now > trialEndDate;
  
  // Calculate days left
  const daysLeft = trialEndDate && !trialEnded 
    ? Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24))
    : 0;

  // Show trial start banner if user hasn't used trial
  if (!user.trial_used && !isInTrial) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-lg relative"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden sm:block">
                  <Gift className="w-8 h-8 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg mb-1">🎁 Start Your FREE 3-Day Trial!</p>
                  <p className="text-sm text-white/90">
                    Get instant access to ALL features - AI coaches, wellness tools, family hub & more. No credit card required!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => startTrialMutation.mutate()}
                  disabled={startTrialMutation.isLoading}
                  className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg whitespace-nowrap"
                >
                  {startTrialMutation.isLoading ? (
                    <>Starting...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Trial
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDismissed(true)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show trial countdown if in active trial
  if (isInTrial && !trialEnded) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg relative"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden sm:block">
                  <Clock className="w-8 h-8 flex-shrink-0 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg mb-1">⏰ Trial Active: {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left</p>
                  <p className="text-sm text-white/90">
                    Enjoying Helper33? Join the waitlist for just $9.99 to keep access after your trial ends!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={createPageUrl('Upgrade')}>
                  <Button className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg whitespace-nowrap">
                    <Rocket className="w-4 h-4 mr-2" />
                    Join Waitlist
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDismissed(true)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show trial ended banner
  if (trialEnded && user.subscription_plan === 'free') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg relative"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="hidden sm:block">
                  <Rocket className="w-8 h-8 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg mb-1">🚀 Your Trial Has Ended</p>
                  <p className="text-sm text-white/90">
                    Continue your wellness journey! Join the waitlist for just $9.99 (one-time) or upgrade to a full plan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={createPageUrl('Upgrade')}>
                  <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg whitespace-nowrap">
                    <Rocket className="w-4 h-4 mr-2" />
                    View Plans
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDismissed(true)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}