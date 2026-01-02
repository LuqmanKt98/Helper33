import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  X, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { awardPoints } from '@/functions/awardPoints';
import PointsNotification from '@/components/gamification/PointsNotification';

const moodOptions = ['😊', '😌', '😐', '😔', '😰'];

export default function ChallengeDailyCheckIn({ 
  challenge, 
  participation, 
  onClose, 
  onComplete 
}) {
  const [note, setNote] = useState('');
  const [mood, setMood] = useState('😊');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsNotification, setPointsNotification] = useState(null);

  const queryClient = useQueryClient();

  const currentDay = participation.current_day || 1;
  const todayAction = challenge.daily_actions?.find(a => a.day === currentDay);

  const completeCheckInMutation = useMutation({
    mutationFn: async () => {
      const completedDays = [...(participation.completed_days || []), currentDay];
      const checkIns = [
        ...(participation.check_ins || []),
        {
          day: currentDay,
          completed: true,
          note: note,
          mood: mood,
          timestamp: new Date().toISOString()
        }
      ];

      const newProgress = Math.round((completedDays.length / challenge.duration_days) * 100);

      const updatedData = {
        current_day: currentDay + 1,
        completed_days: completedDays,
        check_ins: checkIns,
        completion_percentage: newProgress,
        status: newProgress === 100 ? 'completed' : 'active'
      };

      const updated = await base44.entities.ChallengeParticipant.update(
        participation.id,
        updatedData
      );

      // Award points for challenge check-in
      try {
        const pointsResult = await awardPoints({
          activity_type: 'challenge_check_in',
          activity_data: { 
            challenge_id: challenge.id,
            day: currentDay,
            completed: newProgress === 100,
            completion_percentage: newProgress
          }
        });

        if (pointsResult.data.success) {
          setPointsNotification(pointsResult.data);
          queryClient.invalidateQueries({ queryKey: ['user'] });
        }
      } catch (error) {
        console.error('Error awarding points:', error);
      }

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-challenge-participations']);
      toast.success('Daily challenge completed! 🎉');
      if (onComplete) onComplete();
      
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error) => {
      console.error('Failed to complete check-in:', error);
      toast.error('Failed to save check-in');
    }
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await completeCheckInMutation.mutateAsync();
    setIsSubmitting(false);
  };

  const completedDaysCount = (participation.completed_days || []).length;
  const totalDays = challenge.duration_days;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          {/* Points Notification */}
          {pointsNotification && (
            <PointsNotification
              points={pointsNotification.points_earned}
              breakdown={pointsNotification.breakdown}
              leveledUp={pointsNotification.leveled_up}
              newLevel={pointsNotification.new_level}
              achievements={pointsNotification.achievements_earned}
              onClose={() => setPointsNotification(null)}
            />
          )}

          <Card className="bg-white border-2 border-purple-300 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Day {currentDay} Check-In
                </CardTitle>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Today's Action */}
              {todayAction && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-2">Today's Goal:</h3>
                  <p className="text-gray-800 font-semibold mb-1">{todayAction.action}</p>
                  {todayAction.description && (
                    <p className="text-sm text-gray-600">{todayAction.description}</p>
                  )}
                </div>
              )}

              {/* Mood Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  How are you feeling?
                </label>
                <div className="flex gap-3 justify-center">
                  {moodOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setMood(emoji)}
                      className={`text-4xl p-3 rounded-xl transition-all ${
                        mood === emoji
                          ? 'bg-purple-100 scale-110 shadow-lg'
                          : 'hover:bg-gray-100 hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Reflection Notes (optional)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How did today go? Any insights or challenges?"
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-6 text-lg gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Day {currentDay}
                  </>
                )}
              </Button>

              {/* Progress Info */}
              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                <span>{completedDaysCount} days completed</span>
                <span>{totalDays - completedDaysCount} to go</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}