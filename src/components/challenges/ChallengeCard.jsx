import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Trophy, 
  Sparkles,
  Clock,
  Award,
  Droplets,
  Wind,
  Heart,
  Brain,
  Moon,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays, parseISO } from 'date-fns';

const challengeIcons = {
  habit_building: Zap,
  wellness: Heart,
  meditation: Brain,
  journaling: Sparkles,
  goal_achievement: Trophy,
  mindfulness: Wind,
  gratitude: Heart,
  hydration: Droplets,
  sleep: Moon
};

export default function ChallengeCard({ 
  challenge, 
  onJoin, 
  onView, 
  isJoined = false,
  isUpcoming = false,
  delay = 0 
}) {
  const Icon = challengeIcons[challenge.challenge_type] || Trophy;
  
  const daysUntilStart = isUpcoming 
    ? differenceInDays(parseISO(challenge.start_date), new Date())
    : 0;

  const daysRemaining = differenceInDays(parseISO(challenge.end_date), new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`bg-white/80 backdrop-blur-sm border-2 ${
        isJoined ? 'border-green-400' : 'border-purple-200'
      } hover:shadow-xl transition-all overflow-hidden`}>
        {/* Challenge Image/Icon */}
        <div className={`h-32 bg-gradient-to-br ${
          challenge.category === 'wellness' ? 'from-pink-400 to-rose-500' :
          challenge.category === 'mindfulness' ? 'from-purple-400 to-indigo-500' :
          challenge.category === 'grief_support' ? 'from-blue-400 to-cyan-500' :
          'from-green-400 to-emerald-500'
        } flex items-center justify-center relative overflow-hidden`}>
          {challenge.image_url ? (
            <img 
              src={challenge.image_url} 
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Icon className="w-16 h-16 text-white" />
            </motion.div>
          )}
          
          {/* Status Badge */}
          {isJoined && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500">Joined</Badge>
            </div>
          )}
          
          {isUpcoming && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-500">
                <Clock className="w-3 h-3 mr-1" />
                {daysUntilStart}d
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {challenge.description}
            </p>
          </div>

          {/* Challenge Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>{challenge.duration_days} days</span>
              {!isUpcoming && daysRemaining > 0 && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {daysRemaining} days left
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{challenge.participant_count || 0} participants</span>
            </div>

            {challenge.rewards && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-purple-600">
                  {challenge.rewards.points} points + {challenge.rewards.badge_name} badge
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isJoined && !isUpcoming && (
              <Button 
                onClick={onJoin}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Join Challenge
              </Button>
            )}
            
            {isJoined && (
              <Button 
                onClick={onView}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                View Progress
              </Button>
            )}

            {isUpcoming && (
              <Button 
                variant="outline"
                className="flex-1"
                disabled
              >
                Starts {format(parseISO(challenge.start_date), 'MMM d')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}