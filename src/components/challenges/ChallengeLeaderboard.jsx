import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trophy, 
  Medal,
  Award,
  X,
  Crown,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChallengeLeaderboard({ challenge, onClose }) {
  const { data: participants = [] } = useQuery({
    queryKey: ['challenge-participants', challenge.id],
    queryFn: () => base44.entities.ChallengeParticipant.filter({
      challenge_id: challenge.id
    }, '-completion_percentage')
  });

  const topParticipants = participants.slice(0, 10);

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
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          <Card className="bg-white border-2 border-purple-300 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Challenge Leaderboard
                </CardTitle>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-3">
                {topParticipants.map((participant, idx) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      idx === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' :
                      idx === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400' :
                      idx === 2 ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      {idx === 0 && <Crown className="w-8 h-8 text-yellow-600" />}
                      {idx === 1 && <Medal className="w-8 h-8 text-gray-600" />}
                      {idx === 2 && <Award className="w-8 h-8 text-orange-600" />}
                      {idx > 2 && (
                        <span className="text-2xl font-bold text-gray-600">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Participant Info */}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">
                        {participant.display_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {participant.completed_days?.length || 0} days completed
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {participant.completion_percentage || 0}%
                      </p>
                      {participant.support_messages_sent > 0 && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">
                            {participant.support_messages_sent}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {participants.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No participants yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}