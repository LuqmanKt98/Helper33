
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Added Tabs imports
import {
  CheckCircle,
  Heart,
  AlertCircle,
  Sparkles,
  Loader2,
  Target,
  ArrowRight,
  Plus,
  Clock // Added Clock icon
} from 'lucide-react';
import { toast } from 'sonner';

import EnhancedAICoach from './EnhancedAICoach';
import TaskList from './TaskList'; // Added TaskList import
import { trackCoachingInteraction } from '@/functions/trackCoachingInteraction'; // Added trackCoachingInteraction import

export default function SelfCheckIn({ goal, onComplete = () => {} }) { // Modified onComplete to take no arguments as per outline's handleSubmit
  const [step, setStep] = useState(1);
  const [checkInData, setCheckInData] = useState({
    mood_rating: 5,
    confidence_level: 5,
    wins: [],
    challenges: [],
    reflection: '',
    new_win: '',
    new_challenge: ''
  });
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [suggestedTask, setSuggestedTask] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false); // Added showAIInsights state
  const [isSaving, setIsSaving] = useState(false); // Added isSaving state
  const [currentTab, setCurrentTab] = useState('check-in'); // Added currentTab state for Tabs

  const queryClient = useQueryClient();

  const saveProgressMutation = useMutation({
    mutationFn: (progressData) => base44.entities.CoachingProgress.create(progressData),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingProgress']);
      queryClient.invalidateQueries(['coachingGoals']);
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }) => base44.entities.CoachingGoal.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingGoals']);
    }
  });

  const handleAddWin = () => {
    if (checkInData.new_win.trim()) {
      setCheckInData({
        ...checkInData,
        wins: [...checkInData.wins, checkInData.new_win.trim()],
        new_win: ''
      });
    }
  };

  const handleAddChallenge = () => {
    if (checkInData.new_challenge.trim()) {
      setCheckInData({
        ...checkInData,
        challenges: [...checkInData.challenges, checkInData.new_challenge.trim()],
        new_challenge: ''
      });
    }
  };

  const generateTask = async () => {
    setIsGeneratingTask(true);

    try {
      // Get AI insights first to inform task generation
      const checkInCount = goal.reflection_notes?.length || 0;
      const completedTasks = (goal.suggested_tasks || []).filter(t => t.completed).length;
      const totalTasks = (goal.suggested_tasks || []).length;
      
      // Determine difficulty based on progress
      const progressRate = goal.progress_percentage / Math.max(1, checkInCount);
      const taskSuccessRate = totalTasks > 0 ? completedTasks / totalTasks : 0.5; // Default to 0.5 if no tasks
      
      let adaptiveDifficulty = 'medium';
      if (checkInData.mood_rating <= 4 || checkInData.confidence_level <= 4) {
        adaptiveDifficulty = 'easy';
      } else if (checkInData.mood_rating >= 8 && checkInData.confidence_level >= 7 && taskSuccessRate > 0.7) {
        adaptiveDifficulty = 'challenging';
      }

      const prompt = `You are an advanced AI ${goal.coach_type.replace('_', ' ')} providing adaptive, personalized coaching.

GOAL CONTEXT:
- Title: ${goal.goal_title}
- Category: ${goal.category}
- Progress: ${goal.progress_percentage}%
- Check-ins completed: ${checkInCount}
- Task success rate: ${(taskSuccessRate * 100).toFixed(0)}%

CURRENT CHECK-IN:
- Mood: ${checkInData.mood_rating}/10
- Confidence: ${checkInData.confidence_level}/10
- Wins: ${checkInData.wins.join(', ') || 'None shared'}
- Challenges: ${checkInData.challenges.join(', ') || 'None shared'}
- Reflection: ${checkInData.reflection || 'None'}

ADAPTIVE PARAMETERS:
- Target Difficulty: ${adaptiveDifficulty}
- Progress Rate: ${progressRate.toFixed(1)}% per check-in
- User State: ${checkInData.mood_rating >= 7 ? 'Strong' : checkInData.mood_rating >= 5 ? 'Steady' : 'Struggling'}

CREATE ONE TASK THAT:
1. Matches their current ${adaptiveDifficulty} difficulty level
2. Builds on their wins or addresses challenges compassionately
3. Fits their emotional state (${checkInData.mood_rating >= 7 ? 'ready to stretch' : checkInData.mood_rating >= 5 ? 'steady progress' : 'needs gentleness'})
4. Is specific, measurable, and achievable
5. Directly advances their goal

${adaptiveDifficulty === 'easy' ? 'Make it very achievable and supportive - they need a win right now.' : ''}
${adaptiveDifficulty === 'challenging' ? 'They\'re ready to stretch - make it meaningful but achievable.' : ''}

COACHING STYLE:
${goal.coach_type === 'grief_coach' ? 'Be tender, patient, and honoring of their grief journey. No rushing.' : ''}
${goal.coach_type === 'life_coach' ? 'Be empowering, strategic, and growth-oriented while compassionate.' : ''}

Return JSON:
{
  "task_title": "Clear, specific, actionable task title",
  "task_description": "Detailed 2-3 sentences on what to do",
  "estimated_duration": "e.g., '15 minutes', '30 minutes', '1 hour'",
  "difficulty": "${adaptiveDifficulty}",
  "why_this_helps": "One compelling sentence on how this specific task moves them toward their goal",
  "success_criteria": "How they'll know they completed it successfully",
  "encouragement": "A warm, personal message of encouragement (1-2 sentences)"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            task_title: { type: "string" },
            task_description: { type: "string" },
            estimated_duration: { type: "string" },
            difficulty: { type: "string" },
            why_this_helps: { type: "string" },
            success_criteria: { type: "string" },
            encouragement: { type: "string" }
          }
        }
      });

      setSuggestedTask(result);
      setStep(4);

    } catch (error) {
      console.error('Task generation error:', error);
      toast.error('Failed to generate task');
    } finally {
      setIsGeneratingTask(false);
    }
  };

  const generatePersonalizedInsights = async () => {
    // This will be called by EnhancedAICoach component
  };

  // This is the new handleSubmit function based on the outline, modified to accept task data
  // and integrate existing saving/updating logic.
  const handleSubmit = async (taskAccepted = false, taskData = null) => {
    if (!checkInData.mood_rating || !checkInData.confidence_level) {
      toast.error('Please complete mood and confidence ratings');
      return;
    }

    setIsSaving(true);

    try {
      // Track active time for learning (from outline)
      await trackCoachingInteraction({
        interaction_type: 'active_time_logged', // As specified in the outline
        data: { timestamp: new Date().toISOString() }
      });

      // Save progress entry (existing logic)
      await saveProgressMutation.mutateAsync({
        goal_id: goal.id,
        progress_date: new Date().toISOString().split('T')[0],
        progress_type: 'check_in',
        description: checkInData.reflection || (taskAccepted ? 'Self check-in completed with task' : 'Self check-in completed'),
        mood_rating: checkInData.mood_rating,
        confidence_level: checkInData.confidence_level,
        challenges_faced: checkInData.challenges,
        wins_celebrated: checkInData.wins
      });

      // Calculate next check-in date (existing logic)
      const nextDate = new Date();
      switch (goal.self_checkin_frequency) {
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

      const updates = {
        last_checkin_date: new Date().toISOString().split('T')[0],
        next_checkin_date: nextDate.toISOString().split('T')[0]
      };

      // If a task was accepted, add it to the updates
      if (taskAccepted && taskData) {
        const updatedTasks = [
          ...(goal.suggested_tasks || []),
          {
            task_title: taskData.task_title,
            task_description: taskData.task_description,
            created_at: new Date().toISOString(),
            accepted: true,
            completed: false,
            estimated_duration: taskData.estimated_duration,
            difficulty: taskData.difficulty,
            success_criteria: taskData.success_criteria,
            why_this_helps: taskData.why_this_helps
          }
        ];
        updates.suggested_tasks = updatedTasks;
      }

      await updateGoalMutation.mutateAsync({
        id: goal.id,
        updates: updates
      });

      toast.success(taskAccepted ? 'Check-in complete! Task added to your goals 🎯' : 'Check-in saved! 🌟'); // Combined success messages
      onComplete(); // As per outline's handleSubmit, now without arguments

    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to save check-in');
    } finally {
      setIsSaving(false);
    }
  };

  // Refactored handleAcceptTask to use the new handleSubmit
  const handleAcceptTask = async () => {
    if (!suggestedTask) return;
    await handleSubmit(true, suggestedTask);
  };

  // Refactored handleSkipTask to use the new handleSubmit
  const handleSkipTask = async () => {
    await handleSubmit(false, null);
  };

  return (
    <div className="max-w-4xl mx-auto"> {/* Changed max-w-2xl to max-w-4xl */}
      {/* Show AI Insights before check-in - now guarded by currentTab */}
      {step === 1 && currentTab === 'check-in' && (
        <EnhancedAICoach goal={goal} userHistory={goal.reflection_notes || []} />
      )}

      <Card className="shadow-2xl"> {/* Changed shadow-xl to shadow-2xl */}
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"> {/* Changed purple-500/pink-500 to 600 */}
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Self Check-In: {goal.goal_title}
          </CardTitle>
          <p className="text-sm text-purple-100 mt-1">
            Step {step} of 4 • Take your time
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}> {/* Added Tabs wrapper */}
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="check-in">Check-in</TabsTrigger>
              <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="check-in" className="space-y-6"> {/* Wrapped existing check-in content */}
              <AnimatePresence mode="wait">
                {/* Step 1: Mood & Confidence */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">
                        How are you feeling today?
                      </Label>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Mood</span>
                            <Badge className="bg-purple-100 text-purple-700">
                              {checkInData.mood_rating}/10
                            </Badge>
                          </div>
                          <Slider
                            value={[checkInData.mood_rating]}
                            onValueChange={([value]) => setCheckInData({ ...checkInData, mood_rating: value })}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Struggling</span>
                            <span>Great</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Confidence in reaching your goal</span>
                            <Badge className="bg-blue-100 text-blue-700">
                              {checkInData.confidence_level}/10
                            </Badge>
                          </div>
                          <Slider
                            value={[checkInData.confidence_level]}
                            onValueChange={([value]) => setCheckInData({ ...checkInData, confidence_level: value })}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Not confident</span>
                            <span>Very confident</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Wins */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <Label className="text-lg font-semibold">
                        What wins have you experienced?
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Even small victories count! 🌟
                      </p>
                    </div>

                    <div className="space-y-2">
                      {checkInData.wins.map((win, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{win}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={checkInData.new_win}
                        onChange={(e) => setCheckInData({ ...checkInData, new_win: e.target.value })}
                        placeholder="Add a win..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddWin()}
                      />
                      <Button onClick={handleAddWin} size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {checkInData.wins.length === 0 && (
                      <p className="text-sm text-gray-500 text-center italic">
                        It's okay if you can't think of any right now
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Challenges & Reflection */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="text-center mb-4">
                        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                        <Label className="text-lg font-semibold">
                          What challenges have you faced?
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Naming challenges helps us support you better
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        {checkInData.challenges.map((challenge, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                            <span className="text-sm text-gray-800">{challenge}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mb-6">
                        <Input
                          value={checkInData.new_challenge}
                          onChange={(e) => setCheckInData({ ...checkInData, new_challenge: e.target.value })}
                          placeholder="Add a challenge..."
                          onKeyPress={(e) => e.key === 'Enter' && handleAddChallenge()}
                        />
                        <Button onClick={handleAddChallenge} size="icon">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-lg font-semibold mb-2 block">
                        Any other reflections?
                      </Label>
                      <Textarea
                        value={checkInData.reflection}
                        onChange={(e) => setCheckInData({ ...checkInData, reflection: e.target.value })}
                        placeholder="Share any thoughts, feelings, or insights..."
                        rows={4}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Enhanced Task Suggestion */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {!suggestedTask ? (
                      <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Crafting Your Perfect Next Step...
                        </h3>
                        <p className="text-gray-600">
                          Analyzing your progress to create a task that's just right for where you are now
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-6">
                          <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                          <h3 className="text-xl font-bold text-gray-900">
                            Your Personalized Next Action
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Designed specifically for your journey right now
                          </p>
                        </div>

                        {/* Encouragement Message */}
                        {suggestedTask.encouragement && (
                          <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Heart className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" fill="currentColor" />
                                <p className="text-gray-800 leading-relaxed">
                                  {suggestedTask.encouragement}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Task Card */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">
                                  {suggestedTask.task_title}
                                </h4>
                                <p className="text-gray-700 leading-relaxed mb-3">
                                  {suggestedTask.task_description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {suggestedTask.estimated_duration}
                                  </Badge>
                                  <Badge className={
                                    suggestedTask.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    suggestedTask.difficulty === 'challenging' ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'
                                  }>
                                    {suggestedTask.difficulty}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="bg-purple-100 rounded-lg p-4 border border-purple-200">
                                <p className="text-sm text-purple-900 font-semibold mb-1">
                                  💜 Why this helps:
                                </p>
                                <p className="text-sm text-gray-700">
                                  {suggestedTask.why_this_helps}
                                </p>
                              </div>

                              {suggestedTask.success_criteria && (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                  <p className="text-sm text-green-900 font-semibold mb-1">
                                    ✅ How you'll know you succeeded:
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    {suggestedTask.success_criteria}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleAcceptTask}
                            disabled={isSaving} // Changed from saveProgressMutation.isLoading to isSaving
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base"
                          >
                            {isSaving ? ( // Changed from saveProgressMutation.isLoading to isSaving
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Accept & Add to My Goals
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={handleSkipTask}
                            variant="outline"
                            disabled={isSaving} // Changed from saveProgressMutation.isLoading to isSaving
                          >
                            Skip
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {currentTab === 'check-in' && ( // Only show navigation on check-in tab
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    variant="outline"
                    disabled={step === 1 || step === 4}
                  >
                    Back
                  </Button>

                  {step < 3 && (
                    <Button
                      onClick={() => setStep(step + 1)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}

                  {step === 3 && (
                    <Button
                      onClick={generateTask}
                      disabled={isGeneratingTask}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGeneratingTask ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Get My Next Task
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4"> {/* Added new Tasks tab content */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                <p className="text-sm text-blue-900">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  These tasks are personalized based on your profile, preferences, and current progress
                </p>
              </div>
              <TaskList goal={goal} onTaskUpdate={() => queryClient.invalidateQueries(['coachingGoals'])} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className = '' }) {
  return <label className={`text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}

function Input({ className = '', ...props }) {
  return <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />;
}
