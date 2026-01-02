
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Trophy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PointsNotification({ 
  points, 
  breakdown, 
  leveledUp, 
  newLevel,
  achievements,
  perfectDay,
  activityType, // New prop
  onClose,
  onShare
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  // Activity type friendly names
  const activityNames = {
    'event_rsvp': 'Event RSVP',
    'event_attendance': 'Event Attendance',
    'event_chat_message': 'Event Chat',
    'event_full_participation': 'Full Event Participation',
    'mood_check_in': 'Mood Check-In',
    'journal_entry': 'Journal Entry',
    'wellness_log': 'Wellness Log',
    'mindfulness_session': 'Mindfulness Session',
    'challenge_check_in': 'Challenge Check-In'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-20 right-6 z-50 max-w-sm"
      >
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-2xl">
          {leveledUp ? (
            <>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
                className="w-16 h-16 mx-auto mb-3 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-center mb-2">
                Level Up! 🎉
              </h3>
              <p className="text-center text-purple-100 mb-3">
                You've reached Level {newLevel}!
              </p>
              <div className="text-center text-3xl font-bold mb-4">
                +{points} Points
              </div>
              {onShare && (
                <Button
                  onClick={() => {
                    setIsVisible(false);
                    onShare({
                      type: 'level_up',
                      level: newLevel,
                      totalPoints: points,
                      icon: '👑'
                    });
                  }}
                  variant="secondary"
                  className="w-full gap-2"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share Achievement
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">
                    {activityNames[activityType] || 'Points Earned!'}
                  </span>
                </div>
                {perfectDay && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    ⭐
                  </motion.div>
                )}
              </div>

              <div className="text-4xl font-bold mb-3 text-center">
                +{points}
              </div>

              {breakdown && (
                <div className="space-y-1 text-sm text-purple-100 mb-4">
                  {breakdown.base_points > 0 && (
                    <div className="flex justify-between">
                      <span>Activity</span>
                      <span>+{breakdown.base_points}</span>
                    </div>
                  )}
                  {breakdown.first_rsvp_bonus > 0 && (
                    <div className="flex justify-between">
                      <span>🎫 First RSVP Bonus</span>
                      <span>+{breakdown.first_rsvp_bonus}</span>
                    </div>
                  )}
                  {breakdown.early_bird_bonus > 0 && (
                    <div className="flex justify-between">
                      <span>🐦 Early Bird Bonus</span>
                      <span>+{breakdown.early_bird_bonus}</span>
                    </div>
                  )}
                  {breakdown.first_event_bonus > 0 && (
                    <div className="flex justify-between">
                      <span>🌟 First Event Bonus</span>
                      <span>+{breakdown.first_event_bonus}</span>
                    </div>
                  )}
                  {breakdown.event_milestone_bonus > 0 && (
                    <div className="flex justify-between">
                      <span>🏆 Event Milestone</span>
                      <span>+{breakdown.event_milestone_bonus}</span>
                    </div>
                  )}
                  {breakdown.active_participant_bonus > 0 && (
                    <div className="flex justify-between">
                      <span>💬 Active Participant</span>
                      <span>+{breakdown.active_participant_bonus}</span>
                    </div>
                  )}
                  {breakdown.engagement_bonus > 0 && (
                    <div className="flex justify-between">
                      <span>🗣️ Engagement Bonus</span>
                      <span>+{breakdown.engagement_bonus}</span>
                    </div>
                  )}
                  {breakdown.full_participation_bonus > 0 && (
                    <div className="flex justify-between">
                      <span>⭐ Full Participation</span>
                      <span>+{breakdown.full_participation_bonus}</span>
                    </div>
                  )}
                  {breakdown.bonus_points > 0 && (
                    <div className="flex justify-between">
                      <span>Perfect Day Bonus</span>
                      <span>+{breakdown.bonus_points}</span>
                    </div>
                  )}
                  {breakdown.streak_bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Streak Bonus
                      </span>
                      <span>+{breakdown.streak_bonus}</span>
                    </div>
                  )}
                </div>
              )}

              {achievements && achievements.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20 mb-4">
                  <p className="text-sm font-semibold mb-2">New Achievement!</p>
                  {achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span>{ach.achievement_icon}</span>
                      <span>{ach.achievement_title}</span>
                    </div>
                  ))}
                </div>
              )}

              {perfectDay && onShare && (
                <Button
                  onClick={() => {
                    setIsVisible(false);
                    onShare({
                      type: 'milestone',
                      title: 'Perfect Day Achieved',
                      days: 1,
                      icon: '⭐'
                    });
                  }}
                  variant="secondary"
                  className="w-full gap-2"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share Perfect Day
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
