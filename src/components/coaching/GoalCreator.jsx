import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Target,
  Plus,
  X,
  Sparkles,
  Loader2,
  CheckCircle,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = {
  grief_coach: [
    { value: 'emotional_healing', label: 'Emotional Healing' },
    { value: 'grief_processing', label: 'Grief Processing' },
    { value: 'daily_functioning', label: 'Daily Functioning' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'self_care', label: 'Self Care' }
  ],
  life_coach: [
    { value: 'personal_growth', label: 'Personal Growth' },
    { value: 'work_life', label: 'Work & Career' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'habit_building', label: 'Habit Building' },
    { value: 'life_transitions', label: 'Life Transitions' },
    { value: 'self_care', label: 'Self Care' }
  ]
};

export default function GoalCreator({ coachType, onCancel, onSuccess }) {
  const [goalData, setGoalData] = useState({
    coach_type: coachType,
    goal_title: '',
    goal_description: '',
    category: '',
    target_date: '',
    has_human_coach: false,
    self_checkin_frequency: 'weekly',
    checkin_reminder_enabled: true,
    milestones: []
  });
  const [newMilestone, setNewMilestone] = useState({ title: '', target_date: '' });
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);

  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: async (data) => {
      // Calculate first check-in date if no human coach
      if (!data.has_human_coach && data.checkin_reminder_enabled) {
        const nextDate = new Date();
        switch (data.self_checkin_frequency) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'every_other_day':
            nextDate.setDate(nextDate.getDate() + 2);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDate.setDate(nextDate.getDate() + 14);
            break;
        }
        data.next_checkin_date = nextDate.toISOString().split('T')[0];
      }
      
      return await base44.entities.CoachingGoal.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingGoals']);
      toast.success('Goal created! 🎯');
      if (onSuccess) onSuccess();
    }
  });

  const handleAddMilestone = () => {
    if (!newMilestone.title) return;
    
    setGoalData({
      ...goalData,
      milestones: [
        ...goalData.milestones,
        { ...newMilestone, completed: false }
      ]
    });
    setNewMilestone({ title: '', target_date: '' });
  };

  const handleRemoveMilestone = (index) => {
    setGoalData({
      ...goalData,
      milestones: goalData.milestones.filter((_, i) => i !== index)
    });
  };

  const generateAIMilestones = async () => {
    if (!goalData.goal_title || !goalData.goal_description) {
      toast.error('Please add a title and description first');
      return;
    }

    setIsGeneratingMilestones(true);

    try {
      const prompt = `Create 3-5 realistic milestones for this ${coachType.replace('_', ' ')} goal:

Goal: ${goalData.goal_title}
Description: ${goalData.goal_description}
Category: ${goalData.category}

Return JSON array of milestones:
[
  {
    "title": "Clear, specific milestone",
    "description": "Brief description"
  }
]

Make milestones:
- Specific and measurable
- Progressively more advanced
- Compassionate and realistic
- Supportive of healing/growth`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result?.milestones) {
        setGoalData({
          ...goalData,
          milestones: result.milestones.map(m => ({
            title: m.title,
            description: m.description,
            completed: false
          }))
        });
        toast.success('Milestones generated! ✨');
      }

    } catch (error) {
      console.error('Milestone generation error:', error);
      toast.error('Failed to generate milestones');
    } finally {
      setIsGeneratingMilestones(false);
    }
  };

  const handleSubmit = () => {
    if (!goalData.goal_title || !goalData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    createGoalMutation.mutate(goalData);
  };

  const categories = CATEGORIES[coachType] || CATEGORIES.life_coach;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            Create New Goal
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <Label>Goal Title *</Label>
            <Input
              value={goalData.goal_title}
              onChange={(e) => setGoalData({ ...goalData, goal_title: e.target.value })}
              placeholder="e.g., Process my grief in healthy ways"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Category *</Label>
            <Select
              value={goalData.category}
              onValueChange={(value) => setGoalData({ ...goalData, category: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={goalData.goal_description}
              onChange={(e) => setGoalData({ ...goalData, goal_description: e.target.value })}
              placeholder="What do you hope to achieve?"
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Target Date</Label>
            <Input
              type="date"
              value={goalData.target_date}
              onChange={(e) => setGoalData({ ...goalData, target_date: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Human Coach Selection */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold">
                      Working with a Human Coach?
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    If not, we'll send automated check-in reminders with personalized tasks
                  </p>
                </div>
                <Switch
                  checked={goalData.has_human_coach}
                  onCheckedChange={(checked) => setGoalData({ ...goalData, has_human_coach: checked })}
                />
              </div>

              {!goalData.has_human_coach && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-blue-200 space-y-3"
                >
                  <div>
                    <Label>Check-in Frequency</Label>
                    <Select
                      value={goalData.self_checkin_frequency}
                      onValueChange={(value) => setGoalData({ ...goalData, self_checkin_frequency: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Check-ins</SelectItem>
                        <SelectItem value="every_other_day">Every Other Day</SelectItem>
                        <SelectItem value="weekly">Weekly Check-ins</SelectItem>
                        <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      We'll remind you and help you get your next action step
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div>
                      <Label>Enable Email Reminders</Label>
                      <p className="text-xs text-gray-500">Get reminded to check in</p>
                    </div>
                    <Switch
                      checked={goalData.checkin_reminder_enabled}
                      onCheckedChange={(checked) => setGoalData({ ...goalData, checkin_reminder_enabled: checked })}
                    />
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-sm text-purple-900">
                      <strong>💜 How it works:</strong> Each check-in, you'll reflect on your progress, 
                      celebrate wins, and receive a personalized task to keep moving forward until you reach your goal.
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Milestones (Optional)</Label>
              <Button
                onClick={generateAIMilestones}
                disabled={isGeneratingMilestones || !goalData.goal_description}
                variant="outline"
                size="sm"
              >
                {isGeneratingMilestones ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2 mb-3">
              {goalData.milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                    {milestone.description && (
                      <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleRemoveMilestone(idx)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                placeholder="Add a milestone..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
              />
              <Button onClick={handleAddMilestone} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createGoalMutation.isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {createGoalMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </>
              )}
            </Button>

            {onCancel && (
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Label({ children, className = '' }) {
  return <label className={`text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}