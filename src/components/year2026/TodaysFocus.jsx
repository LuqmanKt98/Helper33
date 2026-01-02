import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Target, Calendar, CheckCircle, Circle, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function TodaysFocus({ goals, todayCheckIn, onComplete }) {
  const [completedItems, setCompletedItems] = useState(new Set());

  // Calculate week and day numbers based on Nov 1, 2025 start
  const today = new Date();
  const journeyStart = new Date(2025, 10, 1); // November 1, 2025
  const diffTime = today.getTime() - journeyStart.getTime();
  const dayOfJourney = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const weekNumber = Math.ceil(dayOfJourney / 7);
  
  // Calculate which month of the plan we're in (Nov 2025 = -1, Dec 2025 = 0, Jan 2026 = 1, etc.)
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  let planMonthNumber;
  
  if (currentYear === 2025 && currentMonth === 10) {
    planMonthNumber = -1; // November 2025
  } else if (currentYear === 2025 && currentMonth === 11) {
    planMonthNumber = 0; // December 2025
  } else {
    planMonthNumber = (currentYear - 2026) * 12 + currentMonth + 1; // 2026 months (1-12)
  }

  const totalDaysInJourney = 427; // Nov 2025 (30) + Dec 2025 (31) + 2026 (366)
  const totalWeeksInJourney = 62; // Approximately 427 / 7

  // Aggregate weekly milestones and monthly missions
  const currentWeekMilestones = goals
    .filter(g => g.weekly_milestones?.length > 0)
    .map(g => ({
      goal: g,
      milestone: g.weekly_milestones.find(m => m.week === weekNumber)
    }))
    .filter(item => item.milestone && !item.milestone.achieved);

  const currentMonthMissions = goals
    .filter(g => g.monthly_missions?.length > 0)
    .map(g => ({
      goal: g,
      mission: g.monthly_missions.find(m => m.month === planMonthNumber)
    }))
    .filter(item => item.mission && !item.mission.completed);

  const todayMicroTasks = goals.flatMap(goal => 
    (goal.daily_micro_tasks || []).slice(0, 3).map((task, idx) => ({
      ...task,
      goalId: goal.id,
      goalTitle: goal.goal_title,
      key: `${goal.id}-${idx}`
    }))
  );

  const handleToggle = (key, type, goalId, itemIndex) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(key)) {
      newCompleted.delete(key);
    } else {
      newCompleted.add(key);
      toast.success('Great progress! +15 XP', { duration: 2000 });
      
      if (onComplete) {
        onComplete(goalId, type, itemIndex);
      }
    }
    setCompletedItems(newCompleted);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-none shadow-2xl text-white overflow-hidden relative">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Target className="w-8 h-8" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Today's Focus</h2>
              <p className="text-white/90 text-sm">
                Week {weekNumber} of {totalWeeksInJourney} • Day {dayOfJourney} of {totalDaysInJourney}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Missions */}
      {currentMonthMissions.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              This Month's Missions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentMonthMissions.map(({ goal, mission }, idx) => {
              const key = `mission-${goal.id}-${planMonthNumber}`;
              const isCompleted = completedItems.has(key);
              
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleToggle(key, 'monthly', goal.id, planMonthNumber)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                      : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{goal.goal_title}</Badge>
                      </div>
                      <p className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {mission.mission_title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{mission.mission_description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Current Week Milestones */}
      {currentWeekMilestones.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              This Week's Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentWeekMilestones.map(({ goal, milestone }, idx) => {
              const key = `milestone-${goal.id}-${weekNumber}`;
              const isCompleted = completedItems.has(key);
              
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleToggle(key, 'weekly', goal.id, weekNumber)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                      : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{goal.goal_title}</Badge>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Week {weekNumber}</Badge>
                      </div>
                      <p className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {milestone.milestone}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick Daily Actions */}
      {todayMicroTasks.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              Today's Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayMicroTasks.slice(0, 3).map((task, idx) => {
              const isCompleted = completedItems.has(task.key);
              
              return (
                <motion.button
                  key={task.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleToggle(task.key, 'daily', task.goalId, idx)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                      : 'bg-white border-orange-200 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    )}
                    <p className={`text-sm font-medium flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.task}
                    </p>
                    <span className="text-xs text-gray-500">{task.time_minutes}m</span>
                  </div>
                </motion.button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {currentMonthMissions.length === 0 && currentWeekMilestones.length === 0 && todayMicroTasks.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-600">Complete the survey to get your daily focus!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}