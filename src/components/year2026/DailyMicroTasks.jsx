import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, Zap, Sparkles, Heart, Users, Home, Brain, Settings, Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const CATEGORY_ICONS = {
  wellness: Heart,
  home: Home,
  personal_growth: Brain,
  family: Users,
  default: Sparkles
};

const PRIORITY_COLORS = {
  must_do: 'from-red-500 to-rose-600',
  important: 'from-orange-400 to-amber-500',
  optional: 'from-blue-400 to-cyan-500'
};

const PRIORITY_LABELS = {
  must_do: 'Must Do',
  important: 'Important',
  optional: 'Optional'
};

export default function DailyMicroTasks({ goals, onTaskComplete }) {
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [taskPriorities, setTaskPriorities] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [dailyCapacity, setDailyCapacity] = useState(6);
  const [minimumRequired, setMinimumRequired] = useState(3);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData.year_2026_daily_capacity) {
        setDailyCapacity(userData.year_2026_daily_capacity);
      }
      if (userData.year_2026_minimum_required) {
        setMinimumRequired(userData.year_2026_minimum_required);
      }
      if (userData.year_2026_task_priorities) {
        setTaskPriorities(userData.year_2026_task_priorities);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveUserSettings = async () => {
    try {
      await base44.auth.updateMe({
        year_2026_daily_capacity: dailyCapacity,
        year_2026_minimum_required: minimumRequired,
        year_2026_task_priorities: taskPriorities
      });
      toast.success('Settings saved! ✨');
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const allMicroTasks = goals.flatMap(goal => 
    (goal.daily_micro_tasks || []).map((task, idx) => ({
      ...task,
      goalId: goal.id,
      goalTitle: goal.goal_title,
      goalColor: getCategoryColor(goal.category),
      taskKey: `${goal.id}-${idx}`,
      priority: taskPriorities[`${goal.id}-${idx}`] || 'important'
    }))
  );

  const sortedTasks = [...allMicroTasks].sort((a, b) => {
    const priorityOrder = { must_do: 0, important: 1, optional: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const limitedTasks = sortedTasks.slice(0, dailyCapacity);
  const mustDoTasks = limitedTasks.filter(t => t.priority === 'must_do');
  const completedMustDo = mustDoTasks.filter(t => completedTasks.has(t.taskKey)).length;
  const minimumMet = completedTasks.size >= minimumRequired;
  const mustDoMet = completedMustDo === mustDoTasks.length;
  const canCheckOff = minimumMet && mustDoMet;

  const handleToggleTask = (taskKey) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskKey)) {
      newCompleted.delete(taskKey);
    } else {
      const task = limitedTasks.find(t => t.taskKey === taskKey);
      const baseXP = task.priority === 'must_do' ? 15 : task.priority === 'important' ? 10 : 5;
      const bonusXP = completedTasks.size >= minimumRequired ? 5 : 0;
      
      newCompleted.add(taskKey);
      toast.success(`+${baseXP + bonusXP} XP! ${bonusXP > 0 ? '🎉 Bonus!' : ''}`, { duration: 2000 });
      if (onTaskComplete) onTaskComplete(taskKey);
    }
    setCompletedTasks(newCompleted);
  };

  const setPriority = (taskKey, priority) => {
    setTaskPriorities(prev => ({ ...prev, [taskKey]: priority }));
  };

  const completionPercentage = limitedTasks.length > 0 
    ? (completedTasks.size / limitedTasks.length) * 100 
    : 0;

  const totalPossibleXP = limitedTasks.reduce((sum, t) => {
    const baseXP = t.priority === 'must_do' ? 15 : t.priority === 'important' ? 10 : 5;
    return sum + baseXP;
  }, 0);

  const earnedXP = limitedTasks
    .filter(t => completedTasks.has(t.taskKey))
    .reduce((sum, t) => {
      const baseXP = t.priority === 'must_do' ? 15 : t.priority === 'important' ? 10 : 5;
      return sum + baseXP;
    }, 0);

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-purple-600" />
              </motion.div>
              Today's Micro-Tasks
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {completedTasks.size}/{limitedTasks.length}
                </div>
                <div className="text-xs text-gray-500">completed</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="border-purple-300 hover:bg-purple-50"
              >
                <Settings className="w-4 h-4 text-purple-600" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Daily Progress</span>
              <span className="font-bold text-purple-600">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded-lg border-2 ${minimumMet ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center gap-1 mb-1">
                  {minimumMet ? <CheckCircle className="w-3 h-3 text-green-600" /> : <AlertCircle className="w-3 h-3 text-red-600" />}
                  <span className={`font-semibold ${minimumMet ? 'text-green-900' : 'text-red-900'}`}>Minimum Goal</span>
                </div>
                <div className="text-gray-700">{completedTasks.size}/{minimumRequired} required</div>
              </div>

              {mustDoTasks.length > 0 && (
                <div className={`p-2 rounded-lg border-2 ${mustDoMet ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    {mustDoMet ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Star className="w-3 h-3 text-orange-600" />}
                    <span className={`font-semibold ${mustDoMet ? 'text-green-900' : 'text-orange-900'}`}>Must-Do</span>
                  </div>
                  <div className="text-gray-700">{completedMustDo}/{mustDoTasks.length} completed</div>
                </div>
              )}
            </div>

            {canCheckOff ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300 text-center"
              >
                <div className="text-2xl mb-1">✅</div>
                <p className="font-bold text-green-900 text-sm">Ready to Check Off Day!</p>
                <p className="text-xs text-green-700">You've met all requirements (+{earnedXP} XP earned)</p>
              </motion.div>
            ) : (
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 text-center">
                  Complete {minimumRequired} tasks including all Must-Do items to check off your day
                </p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {limitedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-300" />
              <p className="text-sm">Complete the survey to get your daily micro-tasks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {limitedTasks.map((task, idx) => {
                const isCompleted = completedTasks.has(task.taskKey);
                const Icon = CATEGORY_ICONS[task.category] || CATEGORY_ICONS.default;
                const priorityColor = PRIORITY_COLORS[task.priority];

                return (
                  <motion.div
                    key={task.taskKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                          : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(task.taskKey)}
                          className="flex-shrink-0"
                        >
                          <motion.div
                            animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-purple-400" />
                            )}
                          </motion.div>
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${task.goalColor} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <Badge variant="outline" className="text-xs">{task.goalTitle}</Badge>
                            <Badge className={`bg-gradient-to-r ${priorityColor} text-white text-xs`}>
                              {PRIORITY_LABELS[task.priority]}
                            </Badge>
                          </div>
                          
                          <p className={`text-sm font-medium mb-2 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.task}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{task.time_minutes} min</span>
                              <span className="text-purple-600 font-semibold">• {task.category}</span>
                            </div>
                            
                            <div className="flex gap-1">
                              {['must_do', 'important', 'optional'].map(priority => (
                                <button
                                  key={priority}
                                  onClick={() => setPriority(task.taskKey, priority)}
                                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                                    task.priority === priority
                                      ? `bg-gradient-to-r ${PRIORITY_COLORS[priority]} border-white`
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                  title={PRIORITY_LABELS[priority]}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {completedTasks.size === limitedTasks.length && limitedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl text-center border-2 border-green-300"
            >
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-green-900">All tasks completed!</p>
              <p className="text-sm text-green-700">+50 Bonus XP for completing everything!</p>
              <p className="text-xs text-green-600 mt-1">Total XP earned today: {earnedXP + 50}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Daily Task Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label className="mb-3 block font-semibold text-gray-800">Daily Task Capacity</Label>
              <p className="text-sm text-gray-600 mb-3">How many tasks can you realistically complete per day?</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {dailyCapacity}
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-3 block font-semibold text-gray-800">Minimum Required to Check Off Day</Label>
              <p className="text-sm text-gray-600 mb-3">Minimum tasks needed to mark your day as complete</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max={dailyCapacity}
                  value={minimumRequired}
                  onChange={(e) => setMinimumRequired(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {minimumRequired}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Priority Color Guide
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-rose-600"></div>
                  <span className="font-medium">Must Do</span>
                  <span className="text-gray-600">- Required for check-off (15 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
                  <span className="font-medium">Important</span>
                  <span className="text-gray-600">- High priority (10 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                  <span className="font-medium">Optional</span>
                  <span className="text-gray-600">- Bonus tasks (5 XP)</span>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                💡 Tasks beyond minimum earn bonus XP! All Must-Do tasks must be completed to check off your day.
              </p>
            </div>

            <Button
              onClick={saveUserSettings}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getCategoryColor(category) {
  const colors = {
    health: 'from-red-400 to-pink-500',
    fitness: 'from-orange-400 to-red-500',
    wellness: 'from-purple-400 to-pink-500',
    family: 'from-blue-400 to-cyan-500',
    career: 'from-indigo-400 to-purple-500',
    learning: 'from-green-400 to-emerald-500',
    relationships: 'from-rose-400 to-pink-500',
    finance: 'from-yellow-400 to-orange-500',
    creativity: 'from-pink-400 to-rose-500',
    spirituality: 'from-purple-400 to-indigo-500',
    personal_growth: 'from-purple-400 to-indigo-500',
    home_management: 'from-green-400 to-teal-500'
  };
  return colors[category] || 'from-gray-400 to-gray-500';
}