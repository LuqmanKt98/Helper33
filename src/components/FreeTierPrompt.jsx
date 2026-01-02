import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Gift,
  Crown,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { isInActiveTrial, startTrial } from './PlanChecker';

export default function FreeTierPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const inTrial = isInActiveTrial(user);
  const hasUsedTrial = user?.trial_status?.trial_used === true;
  const canStartTrial = !inTrial && !hasUsedTrial;

  React.useEffect(() => {
    if (!user) return;
    
    // Show prompt if:
    // 1. User is on free plan
    // 2. Haven't used trial yet
    // 3. Not currently in trial
    // 4. Haven't seen prompt in last 24 hours
    const lastPromptShown = localStorage.getItem('trial_prompt_last_shown');
    const hoursSinceLastPrompt = lastPromptShown 
      ? (Date.now() - parseInt(lastPromptShown)) / (1000 * 60 * 60)
      : 999;

    if (user.plan_type === 'free' && canStartTrial && hoursSinceLastPrompt > 24) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('trial_prompt_last_shown', Date.now().toString());
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [user, canStartTrial]);

  const handleStartTrial = async (trialLevel = 'pro') => {
    setIsStartingTrial(true);
    
    try {
      const success = await startTrial(user, trialLevel);
      
      if (success) {
        await queryClient.invalidateQueries(['user']);
        toast.success(`🎉 ${trialLevel === 'executive' ? 'Executive' : 'Pro'} trial activated! Enjoy 3 days of premium features.`);
        setIsOpen(false);
        
        // Refresh page to apply new access
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error('Failed to start trial. Please try again.');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast.error('Failed to start trial. Please try again.');
    } finally {
      setIsStartingTrial(false);
    }
  };

  if (!user || !canStartTrial) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 transition-colors z-50"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header with Animation */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-8 text-white text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl mb-4"
          >
            <Gift className="w-12 h-12" />
          </motion.div>

          <DialogTitle className="text-4xl font-bold mb-3">
            🎁 Welcome Gift!
          </DialogTitle>
          <DialogDescription className="text-white/90 text-lg">
            Start your <strong>3-Day Free Trial</strong> — no credit card required
          </DialogDescription>
        </div>

        <div className="p-8 space-y-6">
          {/* Trial Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pro Trial */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 cursor-pointer"
              onClick={() => !isStartingTrial && handleStartTrial('pro')}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Try Pro</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span className="text-gray-700">Life Coaches & AI guidance</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span className="text-gray-700">SoulLink AI companion</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span className="text-gray-700">Wellness Hub & Kids Studio</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span className="text-gray-700">Vision Board & planners</span>
                </div>
              </div>

              <Button
                disabled={isStartingTrial}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                {isStartingTrial ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Start Pro Trial</>
                )}
              </Button>
            </motion.div>

            {/* Executive Trial */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300 cursor-pointer relative"
              onClick={() => !isStartingTrial && handleStartTrial('executive')}
            >
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                  Best Value
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Try Executive</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span className="text-gray-700">Everything in Pro +</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span className="text-gray-700">Memory Vault</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span className="text-gray-700">Full Life Organizer</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                  <span className="text-gray-700">Unlimited AI conversations</span>
                </div>
              </div>

              <Button
                disabled={isStartingTrial}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isStartingTrial ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Start Executive Trial</>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900 text-center">
              <strong>📚 Note:</strong> Books and Story Hub require separate purchase and are not included in trials
            </p>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              ✨ <strong>3 days free</strong> • No credit card required • Cancel anytime
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              I'll decide later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}