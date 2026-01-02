
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Brain,
  Sparkles,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  Lightbulb,
  Baby,
  BookOpen,
  Palette,
  Users,
  Plus,
  X,
  BarChart3,
  Trophy,
  Flame,
  Repeat,
  Edit,
  Trash2,
  MessageCircle,
  User,
  Check,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import CommunicationLog from '../components/family/CommunicationLog';
import GuardianCollaboration from '../components/family/GuardianCollaboration';

// Sub-components
function SubGoalManager({ subGoals = [], onUpdate }) {
  const [localSubGoals, setLocalSubGoals] = useState(subGoals);
  const [newSubGoal, setNewSubGoal] = useState({ description: '', target_value: 0 });

  const handleAddSubGoal = () => {
    if (!newSubGoal.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const updated = [
      ...localSubGoals,
      {
        sub_goal_id: `sub-${Date.now()}`,
        description: newSubGoal.description,
        target_value: newSubGoal.target_value || 10,
        current_value: 0,
        completed: false
      }
    ];
    setLocalSubGoals(updated);
    onUpdate(updated);
    setNewSubGoal({ description: '', target_value: 0 });
    toast.success('Sub-goal added!');
  };

  const handleToggleSubGoal = (subGoalId) => {
    const updated = localSubGoals.map(sg =>
      sg.sub_goal_id === subGoalId
        ? { ...sg, completed: !sg.completed, completed_date: !sg.completed ? new Date().toISOString().split('T')[0] : null }
        : sg
    );
    setLocalSubGoals(updated);
    onUpdate(updated);
  };

  const handleDeleteSubGoal = (subGoalId) => {
    const updated = localSubGoals.filter(sg => sg.sub_goal_id !== subGoalId);
    setLocalSubGoals(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-semibold text-purple-800">Break Down Into Steps:</Label>
      </div>

      {localSubGoals.map((subGoal) => (
        <div key={subGoal.sub_goal_id} className="flex items-center gap-2 bg-white p-2 rounded-lg">
          <Checkbox
            checked={subGoal.completed}
            onCheckedChange={() => handleToggleSubGoal(subGoal.sub_goal_id)}
          />
          <span className={`flex-1 text-sm ${subGoal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {subGoal.description}
          </span>
          {subGoal.target_value > 0 && (
            <span className="text-xs text-gray-600">
              {subGoal.current_value || 0}/{subGoal.target_value}
            </span>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDeleteSubGoal(subGoal.sub_goal_id)}
            className="h-6 w-6"
          >
            <X className="w-3 h-3 text-red-500" />
          </Button>
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          placeholder="Add a step..."
          value={newSubGoal.description}
          onChange={(e) => setNewSubGoal({ ...newSubGoal, description: e.target.value })}
          className="flex-1"
        />
        <Button onClick={handleAddSubGoal} size="sm" className="bg-purple-500">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function GoalStreakDisplay({ currentStreak, longestStreak }) {
  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg">
      <div className="text-center">
        <div className="flex items-center gap-1 text-orange-600 font-bold text-xl">
          <Flame className="w-5 h-5" />
          {currentStreak}
        </div>
        <div className="text-xs text-gray-600">Current Streak</div>
      </div>
      <div className="text-center">
        <div className="flex items-center gap-1 text-red-600 font-bold text-xl">
          <Trophy className="w-5 h-5" />
          {longestStreak}
        </div>
        <div className="text-xs text-gray-600">Best Streak</div>
      </div>
    </div>
  );
}

function GoalModal({ isOpen, onClose, onSave, childName, editingGoal }) {
  const [goalData, setGoalData] = useState({
    goal_type: 'skill_mastery',
    target_module: 'math',
    description: '',
    target_date: '',
    is_recurring: false,
    recurring_type: 'weekly',
    recurring_target_count: 3,
    sub_goals: []
  });

  useEffect(() => {
    if (editingGoal) {
      setGoalData(editingGoal);
    } else {
      setGoalData({
        goal_type: 'skill_mastery',
        target_module: 'math',
        description: '',
        target_date: '',
        is_recurring: false,
        recurring_type: 'weekly',
        recurring_target_count: 3,
        sub_goals: []
      });
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!goalData.description.trim()) {
      toast.error('Please enter a goal description');
      return;
    }
    if (!goalData.target_date && !goalData.is_recurring) {
      toast.error('Please select a target date');
      return;
    }
    onSave(goalData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                {editingGoal ? 'Edit Goal' : `Set Learning Goal for ${childName}`}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Goal Type</Label>
                  <Select value={goalData.goal_type} onValueChange={(val) => setGoalData({ ...goalData, goal_type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skill_mastery">📚 Skill Mastery</SelectItem>
                      <SelectItem value="practice_frequency">🔄 Practice Frequency</SelectItem>
                      <SelectItem value="creativity">🎨 Creativity</SelectItem>
                      <SelectItem value="emotional_growth">💖 Emotional Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Learning Module</Label>
                  <Select value={goalData.target_module} onValueChange={(val) => setGoalData({ ...goalData, target_module: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">🔢 Math</SelectItem>
                      <SelectItem value="letters">🔤 Letters</SelectItem>
                      <SelectItem value="shapes">🔷 Shapes</SelectItem>
                      <SelectItem value="creative_writing">✍️ Creative Writing</SelectItem>
                      <SelectItem value="coloring">🎨 Coloring</SelectItem>
                      <SelectItem value="journal">📔 Journal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>What do you want {childName} to achieve?</Label>
                <Textarea
                  value={goalData.description}
                  onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                  placeholder="E.g., Master addition up to 20, Practice writing 3 times per week..."
                  className="h-24"
                />
              </div>

              <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
                <Checkbox
                  id="recurring"
                  checked={goalData.is_recurring}
                  onCheckedChange={(checked) => setGoalData({ ...goalData, is_recurring: checked })}
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  This is a recurring goal (e.g., practice 3 times per week)
                </Label>
              </div>

              {goalData.is_recurring ? (
                <div className="grid md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg">
                  <div>
                    <Label>Frequency</Label>
                    <Select value={goalData.recurring_type} onValueChange={(val) => setGoalData({ ...goalData, recurring_type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Count</Label>
                    <Input
                      type="number"
                      value={goalData.recurring_target_count}
                      onChange={(e) => setGoalData({ ...goalData, recurring_target_count: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Times per {goalData.recurring_type === 'daily' ? 'day' : goalData.recurring_type === 'weekly' ? 'week' : 'month'}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={goalData.target_date}
                    onChange={(e) => setGoalData({ ...goalData, target_date: e.target.value })}
                  />
                </div>
              )}

              <SubGoalManager
                subGoals={goalData.sub_goals || []}
                onUpdate={(updated) => setGoalData({ ...goalData, sub_goals: updated })}
              />

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingGoal ? 'Update Goal' : 'Set Goal'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GoalSuggestionsPanel({ childProgress, onSelectSuggestion }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const context = `
Child: ${childProgress.child_name}, Age: ${childProgress.child_age}
Strengths: ${childProgress.strengths?.join(', ') || 'None identified'}
Focus Areas: ${childProgress.focus_areas?.join(', ') || 'None set'}
Current Goals: ${childProgress.learning_goals?.filter(g => g.status === 'active').map(g => g.description).join(', ') || 'None'}
Module Progress: ${JSON.stringify(childProgress.module_progress || {})}
`;

      const prompt = `Based on this child's progress, suggest 3 personalized learning goals that:
1. Build on their strengths
2. Address their focus areas
3. Are age-appropriate and achievable
4. Include specific, measurable targets

Return JSON array of suggestions.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\n${prompt}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  goal_type: { type: "string" },
                  target_module: { type: "string" },
                  description: { type: "string" },
                  rationale: { type: "string" },
                  expected_timeline_days: { type: "number" },
                  is_recurring: { type: "boolean" },
                  recurring_type: { type: "string" },
                  recurring_target_count: { type: "number" },
                  suggested_sub_goals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        target_value: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Goal Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Get personalized goal suggestions based on {childProgress.child_name}'s progress
            </p>
            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {suggestions.map((suggestion, idx) => (
              <Card key={idx} className="bg-white border-purple-200 hover:border-purple-400 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-purple-500 text-white capitalize">
                        {suggestion.target_module}
                      </Badge>
                      <h4 className="font-semibold text-gray-800 mb-1">{suggestion.description}</h4>
                      <p className="text-xs text-gray-600 mb-2">{suggestion.rationale}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {suggestion.expected_timeline_days} days
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectSuggestion(suggestion)}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add This Goal
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={generateSuggestions}
              disabled={isLoading}
              className="w-full border-purple-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Suggestions
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RecurringGoalTracker({ goal, onUpdate }) {
  const today = new Date().toISOString().split('T')[0];
  const completions = goal.recurring_completions || [];
  
  const getRecentDates = () => {
    const dates = [];
    const now = new Date();
    const count = goal.recurring_type === 'daily' ? 7 : goal.recurring_type === 'weekly' ? 4 : 30;
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const toggleCompletion = (date) => {
    const existing = completions.find(c => c.date === date);
    let updatedCompletions;

    if (existing) {
      updatedCompletions = completions.map(c =>
        c.date === date ? { ...c, completed: !c.completed } : c
      );
    } else {
      updatedCompletions = [...completions, { date, completed: true }];
    }

    const updatedGoal = { ...goal, recurring_completions: updatedCompletions };
    onUpdate(updatedGoal);
  };

  const recentDates = getRecentDates();

  return (
    <div className="bg-orange-50 rounded-lg p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">
          Track Progress: {goal.recurring_target_count} times per {goal.recurring_type?.replace('ly', '')}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {recentDates.map((date) => {
          const completion = completions.find(c => c.date === date);
          const isCompleted = completion?.completed;
          const isToday = date === today;

          return (
            <button
              key={date}
              onClick={() => toggleCompletion(date)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-xs font-semibold
                transition-all hover:scale-110
                ${isCompleted ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}
                ${isToday ? 'ring-2 ring-purple-500' : ''}
              `}
              title={date}
            >
              {isCompleted ? <Check className="w-3 h-3" /> : new Date(date).getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProgressChart({ moduleProgress }) {
  if (!moduleProgress || typeof moduleProgress !== 'object') {
    return (
      <div className="text-center py-6 text-gray-500">
        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">No module progress data yet. Start learning to see progress!</p>
      </div>
    );
  }

  const modules = Object.entries(moduleProgress)
    .filter(([, data]) => data && typeof data === 'object')
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      progress: (data?.level || data?.problems_solved || data?.pages_completed || data?.letters_mastered?.length || data?.shapes_identified?.length || 0)
    }))
    .filter(m => m.progress > 0);

  if (modules.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Brain className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">Start learning activities to track progress!</p>
      </div>
    );
  }

  const maxProgress = Math.max(...modules.map(m => m.progress), 10);

  return (
    <div className="space-y-2">
      {modules.map((module, idx) => (
        <div key={idx}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">{module.name}</span>
            <span className="text-purple-600 font-bold">{module.progress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(module.progress / maxProgress) * 100}%` }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleCard({ title, icon: Icon, data, color }) {
  // Safeguard against null/undefined data
  if (!data || typeof data !== 'object') {
    return (
      <Card className={`bg-gradient-to-br ${color} border-2 hover:shadow-lg transition-all`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
              <Badge className="bg-white/80 text-gray-700">
                Getting Started
              </Badge>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <p className="text-sm text-gray-600">No activity yet in this module.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${color} border-2 hover:shadow-lg transition-all`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
            <Badge className="bg-white/80 text-gray-700">
              Level {data?.level || 1}
            </Badge>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          {(data?.problems_solved || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Problems Solved:</span>
              <span className="font-bold text-gray-800">{data.problems_solved}</span>
            </div>
          )}
          {(data?.accuracy_rate || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Accuracy:</span>
              <span className="font-bold text-green-600">{data.accuracy_rate}%</span>
            </div>
          )}
          {data?.letters_mastered?.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Letters Mastered:</span>
              <span className="font-bold text-gray-800">{data.letters_mastered.length}</span>
            </div>
          )}
          {data?.shapes_identified?.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Shapes Known:</span>
              <span className="font-bold text-gray-800">{data.shapes_identified.length}</span>
            </div>
          )}
          {(data?.pages_completed || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Pages Done:</span>
              <span className="font-bold text-gray-800">{data.pages_completed}</span>
            </div>
          )}
          {data?.concepts_mastered?.length > 0 && (
            <div>
              <span className="text-gray-700">Mastered:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.concepts_mastered.slice(0, 3).map((concept, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ChildProfileEditor({ childProgress, onUpdate, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    child_name: childProgress.child_name || '',
    child_age: childProgress.child_age || 0,
    interests: childProgress.interests || [],
    strengths: childProgress.strengths || [],
    focus_areas: childProgress.focus_areas || []
  });
  const [newInterest, setNewInterest] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newFocusArea, setNewFocusArea] = useState('');

  const handleSave = () => {
    onUpdate(profileData);
    setIsEditing(false);
    toast.success('Profile updated!');
  };

  const addItem = (field, value, setValue) => {
    if (!value.trim()) return;
    setProfileData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
    setValue('');
  };

  const removeItem = (field, index) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="bg-white shadow-md border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <User className="w-5 h-5 text-purple-600" />
            Child Profile
          </CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="bg-purple-500">
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700 font-semibold">Child's Name</Label>
            {isEditing ? (
              <Input
                value={profileData.child_name}
                onChange={(e) => setProfileData({ ...profileData, child_name: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-2xl font-bold text-purple-800 mt-1">{profileData.child_name}</p>
            )}
          </div>
          <div>
            <Label className="text-gray-700 font-semibold">Age</Label>
            {isEditing ? (
              <Input
                type="number"
                value={profileData.child_age}
                onChange={(e) => setProfileData({ ...profileData, child_age: parseInt(e.target.value) || 0 })}
                className="mt-1"
                min="2"
                max="12"
              />
            ) : (
              <p className="text-2xl font-bold text-blue-600 mt-1">{profileData.child_age} years old</p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-gray-700 font-semibold">Interests & Hobbies</Label>
            {isEditing && (
              <div className="flex gap-2 flex-1 max-w-xs">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add interest..."
                  className="text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem('interests', newInterest, setNewInterest);
                    }
                  }}
                />
                <Button onClick={() => addItem('interests', newInterest, setNewInterest)} size="sm" className="bg-purple-500">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.interests?.length > 0 ? (
              profileData.interests.map((interest, idx) => (
                <Badge key={idx} className="bg-pink-100 text-pink-800 border-pink-300">
                  {interest}
                  {isEditing && (
                    <button onClick={() => removeItem('interests', idx)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No interests added yet</p>
            )}
          </div>
        </div>

        {/* Strengths */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-gray-700 font-semibold">Strengths</Label>
            {isEditing && (
              <div className="flex gap-2 flex-1 max-w-xs">
                <Input
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  placeholder="Add strength..."
                  className="text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem('strengths', newStrength, setNewStrength);
                    }
                  }}
                />
                <Button onClick={() => addItem('strengths', newStrength, setNewStrength)} size="sm" className="bg-green-500">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.strengths?.length > 0 ? (
              profileData.strengths.map((strength, idx) => (
                <Badge key={idx} className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Star className="w-3 h-3 mr-1" />
                  {strength}
                  {isEditing && (
                    <button onClick={() => removeItem('strengths', idx)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No strengths identified yet</p>
            )}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-gray-700 font-semibold">Focus Areas (What to Work On)</Label>
            {isEditing && (
              <div className="flex gap-2 flex-1 max-w-xs">
                <Input
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  placeholder="Add focus area..."
                  className="text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addItem('focus_areas', newFocusArea, setNewFocusArea);
                    }
                  }}
                />
                <Button onClick={() => addItem('focus_areas', newFocusArea, setNewFocusArea)} size="sm" className="bg-purple-500">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.focus_areas?.length > 0 ? (
              profileData.focus_areas.map((area, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-800 border-purple-300">
                  <Target className="w-3 h-3 mr-1" />
                  {area}
                  {isEditing && (
                    <button onClick={() => removeItem('focus_areas', idx)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No focus areas set yet</p>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{childProgress.overall_progress_score || 0}%</div>
            <div className="text-xs text-gray-600">Overall Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{childProgress.achievements?.length || 0}</div>
            <div className="text-xs text-gray-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{childProgress.learning_goals?.filter(g => g.status === 'active').length || 0}</div>
            <div className="text-xs text-gray-600">Active Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{childProgress.weekly_summary?.activities_completed || 0}</div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ParentDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // Changed initial tab to 'profile'

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: childrenProgress = [], isLoading } = useQuery({
    queryKey: ['childProgress'],
    queryFn: () => base44.entities.ChildProgress.list(),
    enabled: !!user
  });

  const { data: kidsJournalEntries = [] } = useQuery({
    queryKey: ['kidsJournalEntries'],
    queryFn: () => base44.entities.KidsJournalEntry.list('-created_date', 20),
    enabled: !!user
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChildProgress.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['childProgress']);
      toast.success('Progress updated!');
    },
    onError: (error) => {
      console.error("Error updating child progress:", error);
      toast.error('Failed to update progress.');
    }
  });

  const child = selectedChild || childrenProgress[0];

  // Check guardian permissions
  const currentGuardian = child?.guardians?.find(g => g.guardian_email === user?.email);
  const canEditGoals = currentGuardian?.permissions?.can_edit_goals || currentGuardian?.role === 'primary';
  const canAddCommunication = currentGuardian?.permissions?.can_add_communication || currentGuardian?.role === 'primary';
  const canViewPrivateNotes = currentGuardian?.permissions?.can_view_private_notes || currentGuardian?.role === 'primary';
  const canManageGuardians = currentGuardian?.permissions?.can_manage_guardians || currentGuardian?.role === 'primary';

  const handleSetGoal = (goalData) => {
    if (!child) return;
    
    if (!canEditGoals) {
      toast.error('You do not have permission to set goals');
      return;
    }

    const isEditing = !!editingGoal;
    let updatedGoals;

    if (isEditing) {
      updatedGoals = (child.learning_goals || []).map(g =>
        g.goal_id === editingGoal.goal_id ? { 
          ...goalData, 
          goal_id: editingGoal.goal_id,
          set_by_email: user?.email
        } : g
      );
    } else {
      const newGoal = {
        ...goalData,
        goal_id: `goal-${Date.now()}`,
        progress_percentage: 0,
        status: 'active',
        set_by: user?.full_name || 'Guardian',
        set_by_email: user?.email,
        endorsed_by: [],
        current_streak: 0,
        longest_streak: 0,
        recurring_completions: []
      };
      updatedGoals = [...(child.learning_goals || []), newGoal];
    }

    updateProgressMutation.mutate({
      id: child.id,
      data: { learning_goals: updatedGoals }
    });

    setShowGoalModal(false);
    setEditingGoal(null);
    toast.success(isEditing ? 'Goal updated!' : 'Learning goal set!');
  };

  const handleEndorseGoal = (goalId) => {
    if (!canEditGoals) {
      toast.error('You do not have permission to endorse goals');
      return;
    }

    const updatedGoals = (child.learning_goals || []).map(g => {
      if (g.goal_id === goalId) {
        const alreadyEndorsed = g.endorsed_by?.some(e => e.guardian_email === user?.email);
        
        if (alreadyEndorsed) {
          return {
            ...g,
            endorsed_by: g.endorsed_by.filter(e => e.guardian_email !== user?.email)
          };
        } else {
          return {
            ...g,
            endorsed_by: [
              ...(g.endorsed_by || []),
              {
                guardian_email: user?.email,
                guardian_name: user?.full_name,
                endorsed_at: new Date().toISOString(),
                note: ''
              }
            ]
          };
        }
      }
      return g;
    });

    updateProgressMutation.mutate({
      id: child.id,
      data: { learning_goals: updatedGoals }
    });
    
    toast.success('Goal endorsed!');
  };

  const handleSelectSuggestion = (suggestion) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + suggestion.expected_timeline_days);

    const newGoal = {
      goal_type: suggestion.goal_type,
      target_module: suggestion.target_module,
      description: suggestion.description,
      target_date: targetDate.toISOString().split('T')[0],
      is_recurring: suggestion.is_recurring || false,
      recurring_type: suggestion.recurring_type || 'weekly',
      recurring_target_count: suggestion.recurring_target_count || 3,
      sub_goals: suggestion.suggested_sub_goals || []
    };

    handleSetGoal(newGoal);
    toast.success('Goal added from suggestion!');
  };

  const handleUpdateGoal = (updatedGoal) => {
    const updatedGoals = (child.learning_goals || []).map(g =>
      g.goal_id === updatedGoal.goal_id ? updatedGoal : g
    );

    updateProgressMutation.mutate({
      id: child.id,
      data: { learning_goals: updatedGoals }
    });
  };

  const handleDeleteGoal = (goalId) => {
    const goal = (child.learning_goals || []).find(g => g.goal_id === goalId);
    
    if (!canEditGoals || (goal.set_by_email !== user?.email && currentGuardian?.role !== 'primary')) {
      toast.error('You can only delete goals you created');
      return;
    }

    const updatedGoals = (child.learning_goals || []).filter(g => g.goal_id !== goalId);
    
    updateProgressMutation.mutate({
      id: child.id,
      data: { learning_goals: updatedGoals }
    });
    
    toast.success('Goal removed');
  };

  const handleToggleFocusArea = (area) => {
    if (!child || !canEditGoals) {
      toast.error('You do not have permission to edit focus areas');
      return;
    }

    const currentFocus = child.focus_areas || [];
    const updatedFocus = currentFocus.includes(area)
      ? currentFocus.filter(a => a !== area)
      : [...currentFocus, area];

    updateProgressMutation.mutate({
      id: child.id,
      data: { focus_areas: updatedFocus }
    });
  };

  const handleUpdateProfile = (profileData) => {
    updateProgressMutation.mutate({
      id: child.id,
      data: profileData
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 sm:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        .font-parent { 
          font-family: 'Quicksand', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
      `}</style>

      <div className="max-w-7xl mx-auto font-parent">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Parent Dashboard
          </h1>
          <p className="text-gray-600">Track and support your child's learning journey</p>
        </motion.div>

        {childrenProgress.length > 1 && (
          <Card className="mb-6 bg-white shadow-md border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                {childrenProgress.map((childData) => (
                  <Button
                    key={childData.id}
                    variant={child?.id === childData.id ? "default" : "outline"}
                    onClick={() => setSelectedChild(childData)}
                    className={child?.id === childData.id ? "bg-purple-600" : ""}
                  >
                    {childData.child_name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {child ? (
          <>
            {/* Guardian Team Banner */}
            {child.guardians?.length > 1 && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {child.guardians.length} Guardians Collaborating
                        </p>
                        <p className="text-xs text-gray-600">
                          {child.guardians.filter(g => g.invitation_status === 'accepted').length} active • {' '}
                          {child.guardians.filter(g => g.invitation_status === 'pending').length} pending
                        </p>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {child.guardians.slice(0, 4).map((guardian, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white shadow"
                          title={guardian.guardian_name}
                        >
                          {guardian.guardian_name.charAt(0)}
                        </div>
                      ))}
                      {child.guardians.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold border-2 border-white">
                          +{child.guardians.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-6 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
                <TabsTrigger value="profile" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="modules" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Brain className="w-4 h-4 mr-2" />
                  Modules
                </TabsTrigger>
                <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Target className="w-4 h-4 mr-2" />
                  Goals
                </TabsTrigger>
                <TabsTrigger value="communication" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Communication
                  {child.communication_log?.filter(e => e.action_required && !e.action_completed).length > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white px-1.5 py-0.5 text-xs">
                      {child.communication_log.filter(e => e.action_required && !e.action_completed).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="guardians" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Guardians
                  {child.guardians?.filter(g => g.invitation_status === 'pending').length > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white px-1.5 py-0.5 text-xs">
                      {child.guardians.filter(g => g.invitation_status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <ChildProfileEditor
                  childProgress={child}
                  onUpdate={handleUpdateProfile}
                  currentUser={user}
                />

                {/* Recent Activity */}
                <Card className="bg-white shadow-md border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {child.weekly_summary ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <span className="text-sm text-gray-700">Total Time This Week</span>
                          <span className="font-bold text-purple-600">{child.weekly_summary.total_time_minutes || 0} min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-gray-700">Activities Completed</span>
                          <span className="font-bold text-blue-600">{child.weekly_summary.activities_completed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-gray-700">Points Earned</span>
                          <span className="font-bold text-green-600">{child.weekly_summary.points_earned || 0}</span>
                        </div>
                        {child.weekly_summary.favorite_activity && (
                          <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                            <span className="text-sm text-gray-700">Favorite Activity</span>
                            <span className="font-bold text-pink-600">{child.weekly_summary.favorite_activity}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No activity this week yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white shadow-md border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Progress Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart moduleProgress={child.module_progress} />
                  </CardContent>
                </Card>

                {child.achievements?.length > 0 && (
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-3">
                        {child.achievements.slice(0, 6).map((achievement, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-3 border-2 border-yellow-200"
                          >
                            <Trophy className="w-6 h-6 text-yellow-600 mb-2" />
                            <h4 className="font-semibold text-gray-800 text-sm mb-1">
                              {achievement.achievement_name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {new Date(achievement.earned_date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="modules" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {child.module_progress?.math && typeof child.module_progress.math === 'object' && (
                    <ModuleCard
                      title="Math"
                      icon={Calculator}
                      data={child.module_progress.math}
                      color="from-blue-50 to-cyan-50"
                    />
                  )}
                  {child.module_progress?.letters && typeof child.module_progress.letters === 'object' && (
                    <ModuleCard
                      title="Letters"
                      icon={BookOpen}
                      data={child.module_progress.letters}
                      color="from-green-50 to-emerald-50"
                    />
                  )}
                  {child.module_progress?.shapes && typeof child.module_progress.shapes === 'object' && (
                    <ModuleCard
                      title="Shapes"
                      icon={Star}
                      data={child.module_progress.shapes}
                      color="from-purple-50 to-pink-50"
                    />
                  )}
                  {child.module_progress?.creative_writing && typeof child.module_progress.creative_writing === 'object' && (
                    <ModuleCard
                      title="Creative Writing"
                      icon={Palette}
                      data={child.module_progress.creative_writing}
                      color="from-orange-50 to-red-50"
                    />
                  )}
                  {child.module_progress?.coloring && typeof child.module_progress.coloring === 'object' && (
                    <ModuleCard
                      title="Coloring"
                      icon={Palette}
                      data={child.module_progress.coloring}
                      color="from-pink-50 to-rose-50"
                    />
                  )}
                  {child.module_progress?.journal && typeof child.module_progress.journal === 'object' && (
                    <ModuleCard
                      title="Journal"
                      icon={BookOpen}
                      data={child.module_progress.journal}
                      color="from-yellow-50 to-amber-50"
                    />
                  )}
                </div>
                
                {(!child.module_progress || Object.keys(child.module_progress).length === 0) && (
                  <Card className="p-8 text-center bg-white/80">
                    <Brain className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-gray-600">No module progress yet. Activities will appear here as {child.child_name} learns!</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Target className="w-6 h-6 text-purple-600" />
                        Learning Goals
                      </h2>
                      {canEditGoals && (
                        <Button
                          onClick={() => {
                            setEditingGoal(null);
                            setShowGoalModal(true);
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Goal
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {child.learning_goals?.filter(g => g.status === 'active').map((goal, idx) => (
                        <motion.div
                          key={goal.goal_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge className="bg-purple-500 text-white capitalize">{goal.target_module}</Badge>
                                    <Badge variant="outline" className="capitalize">{goal.goal_type?.replace(/_/g, ' ')}</Badge>
                                    {goal.is_recurring && (
                                      <Badge className="bg-orange-500 text-white">
                                        <Repeat className="w-3 h-3 mr-1" />
                                        Recurring
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-800 mb-1">{goal.description}</h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-3 h-3" />
                                    <span>Set by {goal.set_by}</span>
                                  </div>
                                  
                                  {goal.endorsed_by?.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <Badge variant="outline" className="border-green-300 text-green-700">
                                        <Check className="w-3 h-3 mr-1" />
                                        {goal.endorsed_by.length} Guardian{goal.endorsed_by.length > 1 ? 's' : ''} Agreed
                                      </Badge>
                                      <div className="flex -space-x-1">
                                        {goal.endorsed_by.map((endorsement, eIdx) => (
                                          <div
                                            key={eIdx}
                                            className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                                            title={`${endorsement.guardian_name} endorsed this`}
                                          >
                                            {endorsement.guardian_name.charAt(0)}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  {canEditGoals && (
                                    <>
                                      {goal.set_by_email === user?.email ? (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingGoal(goal);
                                            setShowGoalModal(true);
                                          }}
                                        >
                                          <Edit className="w-4 h-4 text-gray-600" />
                                        </Button>
                                      ) : (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleEndorseGoal(goal.goal_id)}
                                          className={goal.endorsed_by?.some(e => e.guardian_email === user?.email) ? 'text-green-600' : 'text-gray-400'}
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                  {(canEditGoals && goal.set_by_email === user?.email) && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleDeleteGoal(goal.goal_id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              {goal.is_recurring ? (
                                <RecurringGoalTracker goal={goal} onUpdate={handleUpdateGoal} />
                              ) : (
                                <>
                                  <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="text-gray-700">Progress</span>
                                      <span className="text-purple-600 font-bold">{goal.progress_percentage || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                      <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                                        style={{ width: `${goal.progress_percentage || 0}%` }}
                                      />
                                    </div>
                                  </div>

                                  {goal.target_date && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </>
                              )}

                              {goal.current_streak > 0 && (
                                <GoalStreakDisplay
                                  currentStreak={goal.current_streak}
                                  longestStreak={goal.longest_streak || 0}
                                />
                              )}

                              {goal.sub_goals?.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm font-semibold text-gray-700 mb-2">Steps:</p>
                                  <div className="space-y-1">
                                    {goal.sub_goals.map((subGoal, sgIdx) => (
                                      <div key={sgIdx} className="flex items-center gap-2 text-sm">
                                        {subGoal.completed ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                        )}
                                        <span className={subGoal.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                                          {subGoal.description}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      {(!child.learning_goals || child.learning_goals.filter(g => g.status === 'active').length === 0) && (
                        <Card className="p-8 text-center bg-white/80">
                          <Target className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">No active goals yet. Create one to guide learning!</p>
                          {canEditGoals && (
                            <Button
                              onClick={() => setShowGoalModal(true)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create First Goal
                            </Button>
                          )}
                        </Card>
                      )}
                    </div>
                  </div>

                  {canEditGoals && (
                    <GoalSuggestionsPanel
                      childProgress={child}
                      onSelectSuggestion={handleSelectSuggestion}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="communication" className="space-y-6">
                <CommunicationLog
                  childProgress={child}
                  onUpdateProgress={(data) => {
                    updateProgressMutation.mutate({
                      id: child.id,
                      data
                    });
                  }}
                  currentUser={user}
                  currentGuardian={currentGuardian}
                />
              </TabsContent>

              <TabsContent value="guardians" className="space-y-6">
                <GuardianCollaboration
                  childProgress={child}
                  onUpdateProgress={(data) => {
                    updateProgressMutation.mutate({
                      id: child.id,
                      data
                    });
                  }}
                  currentUserEmail={user?.email}
                />
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Coming soon: Personalized insights about your child's learning patterns and recommendations...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="p-12 text-center bg-white shadow-lg border border-gray-200">
            <Baby className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Children Added Yet</h3>
            <p className="text-gray-600 mb-6">
              Start tracking your child's learning journey by adding their profile in Kids Studio
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Child Profile
            </Button>
          </Card>
        )}

        <GoalModal
          isOpen={showGoalModal}
          onClose={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
          onSave={handleSetGoal}
          childName={child?.child_name || 'your child'}
          editingGoal={editingGoal}
        />
      </div>
    </div>
  );
}
