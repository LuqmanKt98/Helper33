
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  Edit,
  Trash2,
  Award,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { updateHabitStreaks } from '@/functions/updateHabitStreaks';

export default function HabitTracker() {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({
    habit_name: '',
    description: '',
    category: 'self_care',
    frequency: 'daily',
    target_count: 1,
    reward_points: 1
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.HabitTracker.list('-current_streak'),
    enabled: !!user,
  });

  const { data: todayCompletions = [] } = useQuery({
    queryKey: ['todayHabitCompletions'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return base44.entities.HabitCompletion.filter({ completion_date: today });
    },
    enabled: !!user,
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Auto-update streaks on component mount/user login
  useEffect(() => {
    const updateAndInvalidateStreaks = async () => {
      try {
        await updateHabitStreaks({});
        queryClient.invalidateQueries(['habits']);
      } catch (error) {
        console.error('Failed to update streaks:', error);
      }
    };

    if (user) {
      updateAndInvalidateStreaks();
    }
  }, [user, queryClient]);

  const createHabitMutation = useMutation({
    mutationFn: (habitData) => base44.entities.HabitTracker.create(habitData),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      handleCloseForm();
      toast.success('🎯 Habit created!');
    },
    onError: (error) => {
      toast.error(`Error creating habit: ${error.message}`);
    }
  });

  const updateHabitMutation = useMutation({
    mutationFn: (habitData) => base44.entities.HabitTracker.update(editingHabit.id, habitData),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      handleCloseForm();
      toast.success('✏️ Habit updated!');
    },
    onError: (error) => {
      toast.error(`Error updating habit: ${error.message}`);
    }
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (habit) => {
      const today = new Date().toISOString().split('T')[0];

      // Check if already completed today
      const existing = todayCompletions.find(c => c.habit_id === habit.id);
      if (existing) {
        toast.info('Already completed today! 🎉');
        return;
      }

      // Create completion
      await base44.entities.HabitCompletion.create({
        habit_id: habit.id,
        completion_date: today,
        completed_by: user?.preferred_name || user?.full_name || 'User',
        points_earned: habit.reward_points || 1
      });

      // Update streak immediately
      await updateHabitStreaks({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      queryClient.invalidateQueries(['todayHabitCompletions']);
      queryClient.invalidateQueries(['dashboardProgress']); // If you have a dashboard that depends on this
      toast.success('🔥 Habit completed! Streak updated!');
    },
    onError: (error) => {
      toast.error(`Error completing habit: ${error.message}`);
    }
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId) => base44.entities.HabitTracker.delete(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      toast.success('🗑️ Habit deleted!');
    },
    onError: (error) => {
      toast.error(`Error deleting habit: ${error.message}`);
    }
  });

  const isCompletedToday = (habitId) => {
    return todayCompletions.some(c => c.habit_id === habitId);
  };

  const handleEditClick = (habit) => {
    setEditingHabit(habit);
    setNewHabit({
      habit_name: habit.habit_name,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      target_count: habit.target_count,
      reward_points: habit.reward_points
    });
    setShowAddHabit(true);
  };

  const handleSubmit = () => {
    if (!newHabit.habit_name.trim()) {
      toast.error('Habit name cannot be empty.');
      return;
    }
    if (editingHabit) {
      updateHabitMutation.mutate(newHabit);
    } else {
      createHabitMutation.mutate(newHabit);
    }
  };

  const handleCloseForm = () => {
    setShowAddHabit(false);
    setEditingHabit(null);
    setNewHabit({
      habit_name: '',
      description: '',
      category: 'self_care',
      frequency: 'daily',
      target_count: 1,
      reward_points: 1
    });
  };

  const categories = [
    { id: 'health', label: 'Health', icon: '💪', color: 'from-red-500 to-pink-500' },
    { id: 'productivity', label: 'Productivity', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
    { id: 'self_care', label: 'Self Care', icon: '💜', color: 'from-purple-500 to-pink-500' },
    { id: 'learning', label: 'Learning', icon: '📚', color: 'from-green-500 to-emerald-500' },
    { id: 'social', label: 'Social', icon: '👥', color: 'from-orange-500 to-amber-500' },
    { id: 'other', label: 'Other', icon: '✨', color: 'from-indigo-500 to-purple-500' }
  ];

  const activeHabits = habits.filter(h => h.is_active !== false); // Assume is_active true by default or explicitly set
  const maxStreak = Math.max(...habits.map(h => h.longest_streak || 0), 0);
  const totalPoints = habits.reduce((sum, h) => sum + (h.total_completions * h.reward_points), 0);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-3 text-lg text-gray-600">Loading habits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-10 h-10 text-orange-500" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Habit Tracker
            </h2>
            <p className="text-gray-600">Build consistency, track streaks</p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddHabit(true)}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </motion.div>

      {/* Streak Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-300">
          <CardContent className="p-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            </motion.div>
            <p className="text-4xl font-bold text-orange-900 mb-1">{maxStreak}</p>
            <p className="text-sm text-orange-700 font-semibold">Longest Streak 🔥</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-900 mb-1">{activeHabits.length}</p>
            <p className="text-sm text-blue-700 font-semibold">Active Habits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-900 mb-1">{todayCompletions.length}</p>
            <p className="text-sm text-green-700 font-semibold">Done Today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-900 mb-1">
              {totalPoints}
            </p>
            <p className="text-sm text-purple-700 font-semibold">Total Points</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Habits List */}
      <div className="space-y-4">
        {activeHabits.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Habits Yet</h3>
              <p className="text-gray-500 mb-6">Start building consistency by adding your first habit!</p>
              <Button
                onClick={() => setShowAddHabit(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          activeHabits.map((habit, idx) => {
            const completed = isCompletedToday(habit.id);
            const category = categories.find(c => c.id === habit.category) || categories[5]; // Default to 'other'
            
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`border-2 ${
                  completed 
                    ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : 'border-gray-300 bg-white'
                } shadow-lg hover:shadow-xl transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Completion Button */}
                        <motion.button
                          onClick={() => !completed && completeHabitMutation.mutate(habit)}
                          disabled={completed || completeHabitMutation.isPending}
                          whileHover={{ scale: completed ? 1 : 1.1 }}
                          whileTap={{ scale: completed ? 1 : 0.9 }}
                          className={`flex-shrink-0 transition-all ${
                            completed ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          {completed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </motion.div>
                          ) : (
                            <Circle className="w-12 h-12 text-gray-400 hover:text-orange-500 transition-colors" />
                          )}
                        </motion.button>

                        {/* Habit Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-xl font-bold ${completed ? 'text-green-900' : 'text-gray-900'}`}>
                              {habit.habit_name}
                            </h3>
                            <span className="text-2xl">{category.icon}</span>
                          </div>
                          
                          {habit.description && (
                            <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={`bg-gradient-to-r ${category.color} text-white border-0`}>
                              {category.label}
                            </Badge>
                            <Badge variant="outline" className="border-orange-300">
                              {habit.frequency}
                            </Badge>
                            {habit.current_streak > 0 && (
                              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                                <Flame className="w-3 h-3 mr-1" />
                                {habit.current_streak} day streak
                              </Badge>
                            )}
                          </div>

                          {/* Progress Stats */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                              <p className="text-xs text-gray-600">Current</p>
                              <p className="text-lg font-bold text-orange-900 flex items-center gap-1">
                                <Flame className="w-4 h-4" />
                                {habit.current_streak || 0}
                              </p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                              <p className="text-xs text-gray-600">Best</p>
                              <p className="text-lg font-bold text-purple-900 flex items-center gap-1">
                                <Trophy className="w-4 h-4" />
                                {habit.longest_streak || 0}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                              <p className="text-xs text-gray-600">Total</p>
                              <p className="text-lg font-bold text-blue-900 flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                {habit.total_completions || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleEditClick(habit)}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this habit? This cannot be undone.')) {
                              deleteHabitMutation.mutate(habit.id);
                            }
                          }}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit Habit Dialog */}
      <AnimatePresence>
        {(showAddHabit || editingHabit) && (
          <Dialog open={true} onOpenChange={handleCloseForm}>
            <DialogContent className="sm:max-w-xl bg-gradient-to-br from-orange-50 to-red-50">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-orange-600" />
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Habit Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newHabit.habit_name}
                    onChange={(e) => setNewHabit({...newHabit, habit_name: e.target.value})}
                    placeholder="Morning meditation, Drink 8 glasses of water..."
                    className="border-2 border-orange-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                    placeholder="Why this habit matters to you..."
                    className="h-20 border-2 border-orange-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        onClick={() => setNewHabit({...newHabit, category: cat.id})}
                        variant={newHabit.category === cat.id ? 'default' : 'outline'}
                        className={`${
                          newHabit.category === cat.id 
                            ? `bg-gradient-to-r ${cat.color} text-white border-0` 
                            : 'border-2 border-gray-300'
                        } transition-all`}
                        size="sm"
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={newHabit.frequency}
                      onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                      className="w-full p-2 border-2 border-orange-200 rounded-lg"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Points per completion
                    </label>
                    <Input
                      type="number"
                      value={newHabit.reward_points}
                      onChange={(e) => setNewHabit({...newHabit, reward_points: parseInt(e.target.value) || 1})}
                      min="1"
                      className="border-2 border-orange-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCloseForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600"
                    disabled={!newHabit.habit_name.trim() || createHabitMutation.isPending || updateHabitMutation.isPending}
                  >
                    {(createHabitMutation.isPending || updateHabitMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Encouragement Message */}
      {maxStreak >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <div>
              <p className="text-xl font-bold text-yellow-900 mb-1">
                Amazing! {maxStreak} day streak! 🔥
              </p>
              <p className="text-yellow-800">
                You're building incredible consistency! Keep it up!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
