
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  Calendar,
  Share2,
  Plus,
  BarChart3,
  ArrowLeft,
  Heart,
  Brain,
  Loader2,
  Sparkles,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

import GoalTracker from '../components/coaching/GoalTracker';
import GoalCreator from '../components/coaching/GoalCreator';
import GuidedSession from '../components/coaching/GuidedSession';
import ProgressDashboard from '../components/coaching/ProgressDashboard';
import ProgressSharing from '../components/coaching/ProgressSharing';
import SelfCheckIn from '../components/coaching/SelfCheckIn';
import EnhancedAICoach from '../components/coaching/EnhancedAICoach';
import UserProfileDashboard from '../components/coaching/UserProfileDashboard'; // New Import

export default function CoachingProgressPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showGoalCreator, setShowGoalCreator] = useState(false);
  const [showGuidedSession, setShowGuidedSession] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedCoachType, setSelectedCoachType] = useState('life_coach');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['coachingGoals', selectedCoachType],
    queryFn: () => base44.entities.CoachingGoal.filter({ coach_type: selectedCoachType })
  });

  const coachTypes = [
    { value: 'grief_coach', label: 'Grief Coach', icon: Heart, gradient: 'from-rose-500 to-pink-500' },
    { value: 'life_coach', label: 'Life Coach', icon: Brain, gradient: 'from-purple-500 to-indigo-500' }
  ];

  const checkInsDueToday = goals.filter(goal =>
    !goal.has_human_coach &&
    goal.next_checkin_date &&
    new Date(goal.next_checkin_date).toDateString() === new Date().toDateString() &&
    goal.status === 'active'
  );

  const activeGoals = goals.filter(goal => goal.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="gap-2 mb-4">
            <Link to={createPageUrl('Dashboard')}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Coaching Progress</h1>
              <p className="text-gray-600">Track your goals, sessions, and growth journey</p>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="gap-2">
                <Link to={createPageUrl('CoachingPreferences')}>
                  <Settings className="w-4 h-4" />
                  Preferences
                </Link>
              </Button>
              
              <Button onClick={() => setShowGuidedSession(true)} variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Start Session
              </Button>
              
              <Button onClick={() => setShowGoalCreator(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </div>
          </div>
        </div>

        {checkInsDueToday.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-2">
                    You have {checkInsDueToday.length} check-in{checkInsDueToday.length > 1 ? 's' : ''} scheduled for today! 🌟
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {checkInsDueToday.map(goal => (
                      <Button
                        key={goal.id}
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowCheckIn(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Check in: {goal.goal_title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile Overview - New! */}
        <div className="mb-8">
          <UserProfileDashboard showFullProfile={false} />
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-purple-100">
            {coachTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedCoachType(type.value)}
                className={`relative px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                  selectedCoachType === type.value ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <type.icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </div>
                {selectedCoachType === type.value && (
                  <motion.div
                    layoutId="activeCoachType"
                    className={`absolute inset-0 bg-gradient-to-r ${type.gradient} rounded-full z-[-1] shadow-md`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showGoalCreator && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGoalCreator(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <GoalCreator coachType={selectedCoachType} onCancel={() => setShowGoalCreator(false)} onSuccess={() => setShowGoalCreator(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGuidedSession && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowGuidedSession(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white rounded-2xl shadow-2xl p-6">
                  <GuidedSession coachType={selectedCoachType} sessionType="guided_reflection" onComplete={() => setShowGuidedSession(false)} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCheckIn && selectedGoal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowCheckIn(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full my-8" onClick={(e) => e.stopPropagation()}>
                <SelfCheckIn goal={selectedGoal} onComplete={() => { setShowCheckIn(false); setSelectedGoal(null); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm p-1 shadow-md">
            <TabsTrigger value="overview" className="gap-2"><BarChart3 className="w-4 h-4" /><span className="hidden md:inline">Overview</span></TabsTrigger>
            <TabsTrigger value="goals" className="gap-2"><Target className="w-4 h-4" /><span className="hidden md:inline">Goals</span></TabsTrigger>
            <TabsTrigger value="ai-support" className="gap-2"><Sparkles className="w-4 h-4" /><span className="hidden md:inline">AI Support</span></TabsTrigger>
            <TabsTrigger value="progress" className="gap-2"><Calendar className="w-4 h-4" /><span className="hidden md:inline">Progress</span></TabsTrigger>
            <TabsTrigger value="sharing" className="gap-2"><Share2 className="w-4 h-4" /><span className="hidden md:inline">Sharing</span></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProgressDashboard coachType={selectedCoachType} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalTracker coachType={selectedCoachType} />
          </TabsContent>

          <TabsContent value="ai-support">
            {activeGoals.length > 0 ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      AI Coaching Support
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Personalized guidance, affirmations, and breakthrough tools
                    </p>
                  </CardHeader>
                </Card>

                <EnhancedAICoach
                  goal={activeGoals[0]}
                  userHistory={activeGoals[0].reflection_notes || []}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Goals Yet</h3>
                  <p className="text-gray-600 mb-6">Create your first goal to access AI coaching support</p>
                  <Button onClick={() => setShowGoalCreator(true)}>Create Goal</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress">
            <SessionHistory coachType={selectedCoachType} />
          </TabsContent>

          <TabsContent value="sharing">
            <ProgressSharing coachType={selectedCoachType} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SessionHistory({ coachType }) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['coachingSessions', coachType],
    queryFn: () => base44.entities.CoachingSession.filter({ coach_type: coachType }, '-created_date')
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-900 mb-2">No sessions yet</h4>
          <p className="text-gray-600">Start a guided session to begin tracking your progress</p>
        </CardContent>
      </Card>
    );
  }

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      struggling: '😔',
      overwhelmed: '😰',
      sad: '😢',
      neutral: '😐',
      hopeful: '🙂',
      calm: '😌',
      good: '😊',
      great: '😄'
    };
    return moodEmojis[mood] || '😐';
  };

  return (
    <div className="space-y-4">
      {sessions.map((session, idx) => (
        <motion.div key={session.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{session.session_title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(session.created_date), 'MMMM d, yyyy')} • {session.duration_minutes} minutes
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {session.mood_before && session.mood_after && (
                    <div className="text-2xl">
                      {getMoodEmoji(session.mood_before)} → {getMoodEmoji(session.mood_after)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            {session.ai_summary && (
              <CardContent>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-2">AI Insights:</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{session.ai_summary}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
