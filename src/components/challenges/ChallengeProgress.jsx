import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Flame,
  Award,
  Share2,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays } from 'date-fns';
import ChallengeDailyCheckIn from './ChallengeDailyCheckIn';
import ChallengeLeaderboard from './ChallengeLeaderboard';
import SocialShareModal from '@/components/social/SocialShareModal';

export default function ChallengeProgress({ 
  challenge, 
  participation, 
  onUpdate,
  delay = 0 
}) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const completedDays = participation.completed_days || [];
  const currentDay = participation.current_day || 1;
  const completionPercentage = Math.round((completedDays.length / challenge.duration_days) * 100);
  const daysRemaining = differenceInDays(parseISO(challenge.end_date), new Date());

  const todayCheckIn = participation.check_ins?.find(c => 
    c.timestamp && format(new Date(c.timestamp), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const handleShare = () => {
    setShareModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-300 shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{challenge.title}</CardTitle>
              <p className="text-sm text-gray-600">{challenge.description}</p>
            </div>
            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
              <span className="text-lg font-bold text-purple-600">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-4" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Day {currentDay} of {challenge.duration_days}</span>
              <span>{daysRemaining} days remaining</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-600">{completedDays.length}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-orange-600">{currentDay}</p>
              <p className="text-xs text-gray-600">Current Day</p>
            </div>

            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-purple-600">
                {challenge.rewards?.points || 0}
              </p>
              <p className="text-xs text-gray-600">Points</p>
            </div>
          </div>

          {/* Today's Check-in */}
          {!todayCheckIn && daysRemaining > 0 && (
            <Button
              onClick={() => setShowCheckIn(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Today's Challenge
            </Button>
          )}

          {todayCheckIn && (
            <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-900">Today's Challenge Complete! 🎉</p>
                    <p className="text-sm text-green-700">Great work! Come back tomorrow.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowLeaderboard(true)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Users className="w-4 h-4" />
              Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Check-in Modal */}
      {showCheckIn && (
        <ChallengeDailyCheckIn
          challenge={challenge}
          participation={participation}
          onClose={() => setShowCheckIn(false)}
          onComplete={onUpdate}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <ChallengeLeaderboard
          challenge={challenge}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareType="milestone"
        shareData={{
          title: `${challenge.title} - ${completionPercentage}% Complete`,
          days: completedDays.length,
          icon: '🏆'
        }}
      />
    </motion.div>
  );
}