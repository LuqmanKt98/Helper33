
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, RecurringTaskCompletion } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Calendar, Sparkles, Wind, Loader2, List, Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationProvider, useNotifications } from "@/components/SoundManager";
import { useActivityTracker } from "@/components/ActivityTracker";
import NotificationDisabledBanner from '@/components/common/NotificationDisabledBanner';
import GuestPrompt from '@/components/common/GuestPrompt'; // Added import
import { FeatureGate, useFeatureAccess } from '@/components/PlanChecker'; // Added import
import SEO from '@/components/SEO'; // Added import

// Import components
import TaskItem from "../components/organizer/TaskItem";
import TaskEditModal from "../components/organizer/TaskEditModal";
import AiSuggestionsModal from "../components/organizer/AiSuggestionsModal";
import CalendarView from "../components/organizer/CalendarView";
import TaskForm from "../components/organizer/TaskForm";
import TaskGamification from "../components/TaskGamification";
import HabitTracker from "../components/organizer/HabitTracker";
import DigitalCloset from "../components/organizer/DigitalCloset";
import MindfulMoment from "../components/organizer/MindfulMoment";

function OrganizerContent() {
  const { playSound } = useNotifications();
  const { trackActivity } = useActivityTracker();
  const queryClient = useQueryClient();

  // State Management
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "", description: "", priority: "medium", category: "daily_living",
    due_date: "", due_time: "", recurring: "none", color_tag: "default"
  });
  const [filter, setFilter] = useState("today"); // Changed from "pending" to "today"
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewingSpecificDate, setViewingSpecificDate] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showMindfulMoment, setShowMindfulMoment] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false); // Added state

  // Data Fetching
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => Task.list('-created_date'),
  });

  const { data: recurringCompletions = [], isLoading: isLoadingCompletions } = useQuery({
    queryKey: ['recurringCompletions'],
    queryFn: () => RecurringTaskCompletion.list(),
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => {
      // Check if user is logged in
      if (!user) {
        setShowGuestPrompt(true);
        throw new Error('Guest user');
      }
      return Task.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
      resetNewTaskState();
      playSound('success');
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      playSound('error');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => { // Changed updates to data to match existing code
      // Check if user is logged in
      if (!user) {
        setShowGuestPrompt(true);
        throw new Error('Guest user');
      }
      return Task.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowEditModal(false);
      setEditingTask(null);
      playSound('success');
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      playSound('error');
    },
  });

  const createRecurringCompletionMutation = useMutation({
    mutationFn: (data) => RecurringTaskCompletion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringCompletions'] });
      playSound('complete');
    },
  });

  const deleteRecurringCompletionMutation = useMutation({
    mutationFn: (id) => RecurringTaskCompletion.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurringCompletions'] }),
  });

  const deleteTaskMutation = useMutation({ // Added deleteTaskMutation
    mutationFn: (id) => {
      // Check if user is logged in
      if (!user) {
        setShowGuestPrompt(true);
        throw new Error('Guest user');
      }
      return Task.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      playSound('success');
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      playSound('error');
    },
  });

  useEffect(() => {
    // This useEffect hook is no longer needed since the 'closet' tab will always be present
    // and access controlled by FeatureGate in the parent Organizer component.
    // if (activeTab === 'closet' && user?.role !== 'admin') {
    //   setActiveTab('tasks');
    // }
  }, [activeTab, user]);

  const isLoading = isLoadingUser || isLoadingTasks || isLoadingCompletions;

  const formatDateForInput = (date) => date.toISOString().split('T')[0];

  const resetNewTaskState = () => {
    const defaultDate = viewingSpecificDate ? formatDateForInput(selectedDate) : "";
    setNewTask({
      title: "", description: "", priority: "medium", category: "daily_living",
      due_date: defaultDate, due_time: "", recurring: "none", color_tag: "default"
    });
  };

  const handleSaveTask = (taskData) => {
    const dataToSave = { ...taskData, estimated_duration: taskData.estimated_duration ? parseInt(taskData.estimated_duration) : null };
    createTaskMutation.mutate(dataToSave);
    trackActivity('task_created', taskData.category || 'daily_living', {
      activityData: { task_title: taskData.title, priority: taskData.priority },
      relatedEntityType: 'Task'
    });
  };

  const updateTaskStatus = async (taskId, newStatus, instanceDate = null) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.recurring && task.recurring !== 'none' && instanceDate) {
      if (newStatus === 'completed') {
        createRecurringCompletionMutation.mutate({ task_id: taskId, completion_date: instanceDate });
      } else {
        const completion = recurringCompletions.find(c => c.task_id === taskId && c.completion_date === instanceDate);
        if (completion) {
          deleteRecurringCompletionMutation.mutate(completion.id);
        }
      }
    } else {
      updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
    }

    if (newStatus === 'completed') {
      const encouragements = [
        "✨ Beautiful! You're doing amazing!",
        "🌟 Well done! Keep this gentle momentum!",
        "💚 Wonderful progress! Be proud of yourself!",
        "🌸 You're creating positive change!",
        "🦋 Every small step matters!"
      ];
      setTimeout(() => {
        playSound('success');
      }, 100);
    }
  };

  const handleEditTask = (task) => {
    const taskToEdit = task.isRecurringInstance ? tasks.find(t => t.id === task.originalTaskId) : task;

    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setShowEditModal(true);
    } else {
      console.error("Could not find the original task to edit.");
      playSound('error');
      alert("Error: Could not open the task for editing.");
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

  const generateAITasks = async () => {
    if (!user) {
      setShowGuestPrompt(true);
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = "As a compassionate AI organizer for someone who may be dealing with grief or overwhelm, suggest 5 gentle, manageable daily tasks for self-care, structure, and healing. Return a JSON array of tasks with these fields: title, description, priority (low/medium/high), category (self_care/family/work/health/grief_support/daily_living/other).";
      const response = await InvokeLLM({
        prompt,
        response_json_schema: { type: "object", properties: { tasks: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, priority: { type: "string" }, category: { type: "string" } } } } } }
      });

      if (response && Array.isArray(response.tasks)) {
        const suggestionsWithDefaults = response.tasks.map((t, index) => ({
          id: `ai-${index}-${Date.now()}`,
          ...t,
          color_tag: 'default',
          due_date: '',
          due_time: '',
          estimated_duration: '',
        }));
        setAiSuggestions(suggestionsWithDefaults);
        setShowSuggestionsModal(true);
        playSound('success');
      } else {
        console.error("AI response did not contain a valid 'tasks' array:", response);
        playSound('error');
        alert("Sorry, the AI couldn't generate suggestions at this moment. Please try again in a few seconds.");
      }
    } catch (error) {
      console.error("Error generating AI tasks:", error);
      playSound('error');
      alert("An unexpected error occurred while generating AI suggestions. Please try again.");
    }
    setIsGenerating(false);
  };

  const acceptSelectedSuggestions = (tasksToCreate) => {
    if (tasksToCreate.length === 0) return;
    if (!user) { // Added user check here too for AI suggestions
      setShowGuestPrompt(true);
      return;
    }

    tasksToCreate.forEach(taskData => {
        const dataToSave = { ...taskData, ai_generated: true, estimated_duration: taskData.estimated_duration ? parseInt(taskData.estimated_duration) : null };
        createTaskMutation.mutate(dataToSave);
        trackActivity('task_created_ai', taskData.category || 'daily_living', {
            activityData: { task_title: taskData.title, priority: taskData.priority, ai_generated: true },
            relatedEntityType: 'Task'
        });
    });

    setShowSuggestionsModal(false);
    setAiSuggestions([]);
    playSound('complete');
  };

  const generateRecurringInstances = useMemo(() => {
    return (task, viewStart, viewEnd) => {
      if (!task.recurring || task.recurring === 'none') return [];
      const instances = [];
      let current = new Date(task.recurring_start_date || task.due_date || task.created_date);
      current.setHours(0,0,0,0);
      const end = task.recurring_end_date ? new Date(task.recurring_end_date) : null;
      if(end) end.setHours(23,59,59,999);

      while (current <= viewEnd && (!end || current <= end)) {
        if (current >= viewStart) {
          const dateStr = formatDateForInput(current);
          const isCompleted = recurringCompletions.some(c => c.task_id === task.id && c.completion_date === dateStr);
          instances.push({
            ...task,
            due_date: dateStr,
            isRecurringInstance: true,
            originalTaskId: task.id,
            status: isCompleted ? 'completed' : 'pending'
          });
        }
        if (task.recurring === 'daily') current.setDate(current.getDate() + 1);
        else if (task.recurring === 'weekly') current.setDate(current.getDate() + 7);
        else if (task.recurring === 'monthly') current.setMonth(current.getMonth() + 1);
        else break;
      }
      return instances;
    };
  }, [recurringCompletions]);

  const recurringInstances = useMemo(() => {
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    return tasks.flatMap(task => generateRecurringInstances(task, startOfMonth, endOfMonth));
  }, [tasks, selectedDate, generateRecurringInstances]);

  const filteredTasks = useMemo(() => {
    const allRelevantTasks = [...tasks.filter(t => !t.recurring || t.recurring === 'none'), ...recurringInstances];
    let dailyTasks;

    if (viewingSpecificDate && viewMode === "list") {
        dailyTasks = allRelevantTasks.filter(task => task.due_date === formatDateForInput(selectedDate));
    } else {
        switch (filter) {
            case "all":
                dailyTasks = allRelevantTasks;
                break;
            case "completed":
                dailyTasks = allRelevantTasks.filter(task => task.status === "completed");
                break;
            case "today":
                dailyTasks = allRelevantTasks.filter(task => task.due_date === formatDateForInput(new Date()) && task.status !== "completed");
                break;
            case "pending":
            default:
                dailyTasks = allRelevantTasks.filter(task => task.status === "pending");
                break;
        }
    }

    const uniqueTasks = new Map();
    dailyTasks.forEach(task => {
        const key = task.isRecurringInstance ? `${task.originalTaskId}-${task.due_date}` : task.id;
        if (!uniqueTasks.has(key)) {
            uniqueTasks.set(key, task);
        }
    });

    return Array.from(uniqueTasks.values());
  }, [tasks, recurringInstances, viewingSpecificDate, selectedDate, filter, viewMode]);

  const taskCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = formatDateForInput(today);
    const futureLimit = new Date();
    futureLimit.setFullYear(today.getFullYear() + 1);

    const nonRecurringTasks = tasks.filter(t => !t.recurring || t.recurring === 'none');

    const allRecurringInstances = tasks.flatMap(task =>
        generateRecurringInstances(task, new Date(2020, 0, 1), futureLimit)
    );

    const allTasksForCount = [...nonRecurringTasks, ...allRecurringInstances];
    const uniqueTasksForCount = new Map();
    allTasksForCount.forEach(task => {
        const key = task.isRecurringInstance ? `${task.originalTaskId}-${task.due_date}` : task.id;
        if (!uniqueTasksForCount.has(key)) {
            uniqueTasksForCount.set(key, task);
        }
    });
    const uniqueTasksArray = Array.from(uniqueTasksForCount.values());

    return {
        pending: uniqueTasksArray.filter(t => t.status === 'pending').length,
        dueToday: uniqueTasksArray.filter(t => t.due_date === todayStr && t.status !== 'completed').length,
        all: uniqueTasksArray.length,
        completed: uniqueTasksArray.filter(t => t.status === 'completed').length,
    };
}, [tasks, generateRecurringInstances, recurringCompletions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const organizerTabs = useMemo(() => {
    return [
      { id: "tasks", label: "Tasks", icon: Calendar },
      { id: "habits", label: "Habits", icon: Sparkles },
      { id: "closet", label: "Closet", icon: Wind }
    ];
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Guest Prompt Modal */}
      {showGuestPrompt && (
        <GuestPrompt 
          action="create and manage tasks"
          onCancel={() => setShowGuestPrompt(false)}
        />
      )}

      {/* Nature Landscape Background */}
      <div className="fixed inset-0 z-0">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-blue-100 to-emerald-50"></div>

        {/* Floating Clouds */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-20 right-20 w-40 h-20 bg-white/30 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-40 left-1/3 w-36 h-18 bg-white/35 rounded-full blur-xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        {/* Mountain Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 300" className="w-full h-auto">
            <path d="M0,300 L0,150 L200,80 L400,140 L600,60 L800,120 L1000,90 L1200,150 L1200,300 Z"
              fill="rgba(52, 211, 153, 0.2)" />
            <path d="M0,300 L0,180 L300,120 L500,160 L700,100 L900,140 L1200,180 L1200,300 Z"
              fill="rgba(16, 185, 129, 0.3)" />
            <path d="M0,300 L0,220 L400,180 L600,200 L800,170 L1200,220 L1200,300 Z"
              fill="rgba(5, 150, 105, 0.4)" />
          </svg>
        </div>

        {/* Floating Leaves */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, -15, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          >
            <Leaf className="w-4 h-4 text-emerald-400/40" />
          </motion.div>
        ))}

        {/* Butterflies */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`butterfly-${i}`}
            className="absolute text-2xl"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -50, -100, 0],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2
            }}
          >
            🦋
          </motion.div>
        ))}

        {/* Sun/Moon Glow */}
        <motion.div
          className="absolute top-20 right-20 w-24 h-24 bg-yellow-200/50 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content Overlay with Glass Effect */}
      <div className="relative z-10 p-3 sm:p-4">
        <div className="max-w-6xl mx-auto">
          {/* Compact Header with Glass Effect */}
          <motion.header
            className="mb-4 bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.preferred_name || user?.full_name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-xs text-emerald-700/80 flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Take one gentle step at a time
                </p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </motion.div>
            </div>
          </motion.header>

          {/* Notification Disabled Warning */}
          <NotificationDisabledBanner compact />

          {/* Compact Tabs with Glass Effect */}
          <div className="flex justify-center mb-4">
            <div className="flex bg-white/50 backdrop-blur-lg rounded-full p-0.5 shadow-lg border border-white/60">
              {organizerTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-1.5 rounded-full font-medium text-xs sm:text-sm transition-colors ${
                    activeTab === tab.id ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-full shadow-md z-[-1]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "tasks" && (
            <div>
              {/* Compact View Toggle */}
              <div className="flex justify-center mb-4">
                <div className="flex bg-white/50 backdrop-blur-lg rounded-lg p-0.5 shadow-md border border-white/60">
                  {[{ id: "list", label: "List", icon: List }, { id: "calendar", label: "Calendar", icon: Calendar }].map(view => (
                      <button
                        key={view.id}
                        onClick={() => { setViewMode(view.id); setViewingSpecificDate(false); if(view.id === 'list') setFilter("today"); }}
                        className={`relative px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          viewMode === view.id ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
                        }`}
                      >
                        <view.icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{view.label}</span>
                        {viewMode === view.id && (
                          <motion.div
                            layoutId="activeView"
                            className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-md shadow-sm z-[-1]"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                  ))}
                </div>
              </div>

              {viewMode === "calendar" ? (
                <CalendarView
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  tasks={tasks}
                  recurringInstances={recurringInstances}
                  onEditTask={handleEditTask}
                  onDateClick={(date) => {
                    setSelectedDate(date);
                    setViewMode("list");
                    setViewingSpecificDate(true);
                    setFilter("all");
                    resetNewTaskState();
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Sidebar - Made wider */}
                  <div className="lg:col-span-1 space-y-3">
                    <AnimatePresence>
                      {showForm && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-white/40 backdrop-blur-md rounded-lg shadow-lg border border-white/50"
                        >
                          <TaskForm
                            initialData={newTask}
                            onSave={handleSaveTask}
                            onCancel={() => { setShowForm(false); resetNewTaskState(); }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!showForm && (
                      <div className="space-y-2">
                        <Button
                          onClick={() => { resetNewTaskState(); setShowForm(true); }}
                          size="sm"
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg text-sm py-3 border-0"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {viewingSpecificDate ? 'Add Task' : 'New Task'}
                        </Button>
                        <Button
                          onClick={generateAITasks}
                          disabled={isGenerating}
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/60 backdrop-blur-sm text-sm py-3 border-white/60 hover:bg-white/80"
                        >
                          {isGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Thinking...</>
                          ) : (
                            <><Sparkles className="w-4 h-4 mr-2" />AI Suggest</>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowMindfulMoment(true)}
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/60 backdrop-blur-sm text-sm py-3 border-white/60 hover:bg-white/80"
                        >
                          <Wind className="w-4 h-4 mr-2" />
                          Breathe
                        </Button>
                        
                        {/* WhatsApp Button - Official Brand Styling */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <a
                            href={base44.agents.getWhatsAppConnectURL('organizer')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button
                              size="lg"
                              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold py-4 shadow-xl hover:shadow-2xl transition-all border-0"
                              style={{
                                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                              }}
                            >
                              <svg 
                                className="w-6 h-6 mr-2" 
                                viewBox="0 0 24 24" 
                                fill="currentColor"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              <span>WhatsApp Helper</span>
                            </Button>
                          </a>
                        </motion.div>
                      </div>
                    )}

                    {/* Compact View Filter */}
                    <Card className="bg-white/50 backdrop-blur-lg border border-white/60 shadow-lg">
                      <CardHeader className="pb-2 px-3 pt-3">
                        <CardTitle className="text-sm text-emerald-800">View</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1 p-3 pt-0">
                        {[
                          { value: "pending", label: "To Do", count: taskCounts.pending },
                          { value: "today", label: "Today", count: taskCounts.dueToday },
                          { value: "completed", label: "Done", count: taskCounts.completed },
                          { value: "all", label: "All", count: taskCounts.all }
                        ].map(({ value, label, count }) => (
                          <Button
                            key={value}
                            variant={filter === value && !viewingSpecificDate ? "secondary" : "ghost"}
                            onClick={() => { setFilter(value); setViewingSpecificDate(false); }}
                            className="w-full justify-start text-sm py-2 h-auto hover:bg-white/60"
                            disabled={viewingSpecificDate && value !== "all"}
                          >
                            {label}
                            <Badge variant="outline" className="ml-auto text-xs px-2 py-0.5 border-emerald-300">{count}</Badge>
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Content with Glass Effect */}
                  <div className="lg:col-span-2 space-y-3">
                    <TaskGamification user={user} tasks={tasks} recurringCompletions={recurringCompletions} />

                    <div className="space-y-2">
                      <AnimatePresence>
                        {filteredTasks.map((task) => (
                          <motion.div
                            key={task.isRecurringInstance ? `recurring-${task.originalTaskId}-${task.due_date}` : task.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <TaskItem
                              task={task}
                              onStatusChange={updateTaskStatus}
                              onEdit={handleEditTask}
                              onDelete={deleteTaskMutation.mutate} // Pass delete mutation
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {filteredTasks.length === 0 && !isLoading && (
                        <Card className="bg-white/50 backdrop-blur-lg border border-white/60 shadow-lg">
                          <CardContent className="text-center py-8">
                            <Calendar className="w-12 h-12 text-emerald-300 mx-auto mb-2" />
                            <p className="text-sm text-emerald-700">
                              {filter === 'completed' ? 'No completed tasks yet' : 'All caught up! 🌸'}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "habits" && <HabitTracker />}
          {activeTab === "closet" && <DigitalCloset />}
        </div>
      </div>

      <TaskEditModal
        task={editingTask}
        isOpen={showEditModal}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['recurringCompletions'] });
        }}
        onClose={handleCloseEditModal}
        user={user}
      />

      <AiSuggestionsModal
        isOpen={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        aiSuggestions={aiSuggestions}
        setAiSuggestions={setAiSuggestions}
        onAccept={acceptSelectedSuggestions}
      />

      <MindfulMoment
        isOpen={showMindfulMoment}
        onClose={() => setShowMindfulMoment(false)}
      />
    </div>
  );
}

export default function OrganizerPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { hasAccess: hasFullPlannersAccess } = useFeatureAccess('full_planners');
  const { hasAccess: hasLimitedPlannersAccess } = useFeatureAccess('limited_planners');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Helper33 AI Home & Task Organizer",
    "description": "AI-powered home management, task organization, and smart scheduling. Automate your daily tasks and manage your home with intelligent AI assistance.",
    "applicationCategory": "ProductivityApplication",
    "featureList": [
      "AI Task Management",
      "Smart Home Organization",
      "Family Calendar Sync",
      "Automated Reminders",
      "Habit Tracking",
      "AI Schedule Optimization"
    ]
  };

  // Admin gets full access without subscription check
  if (user?.role === 'admin') {
    return (
      <>
        <SEO 
          title="AI Home Organizer & Task Manager - Smart Home Management | Helper33"
          description="AI-powered home organization and task management. Automate chores, organize family schedules, track habits, and manage your home with intelligent AI assistance. Smart task planning and reminders."
          keywords="AI home organizer, AI task manager, smart home management, AI calendar, family organizer AI, AI chore scheduler, task automation, AI home assistant, smart scheduling, AI productivity, home management AI, AI to-do list"
          structuredData={structuredData}
        />
        <NotificationProvider>
          <OrganizerContent />
        </NotificationProvider>
      </>
    );
  }

  // Free users get basic task list only
  // Pro users get limited organizer features
  // Executive users get full Life Organizer
  
  if (!hasLimitedPlannersAccess) {
    return (
      <>
        <SEO 
          title="AI Home Organizer & Task Manager - Smart Home Management | Helper33"
          description="AI-powered home organization and task management. Automate chores, organize family schedules, track habits, and manage your home with intelligent AI assistance. Smart task planning and reminders."
          keywords="AI home organizer, AI task manager, smart home management, AI calendar, family organizer AI, AI chore scheduler, task automation, AI home assistant, smart scheduling, AI productivity, home management AI, AI to-do list"
          structuredData={structuredData}
        />
        <FeatureGate
          featureKey="limited_planners"
          featureName="Life Organizer"
          featureDescription="Organize your daily life with AI-powered task management, calendar views, and wellness integration. Upgrade to unlock full access."
        />
      </>
    );
  }

  // Pro and Executive users see the full content wrapped in NotificationProvider
  return (
    <>
      <SEO 
        title="AI Home Organizer & Task Manager - Smart Home Management | Helper33"
        description="AI-powered home organization and task management. Automate chores, organize family schedules, track habits, and manage your home with intelligent AI assistance. Smart task planning and reminders."
        keywords="AI home organizer, AI task manager, smart home management, AI calendar, family organizer AI, AI chore scheduler, task automation, AI home assistant, smart scheduling, AI productivity, home management AI, AI to-do list"
        structuredData={structuredData}
      />
      <NotificationProvider>
        {hasFullPlannersAccess ? (
          <OrganizerContent />
        ) : (
          <>
            <OrganizerContent />
            <FeatureGate
              featureKey="full_planners"
              featureName="Digital Closet"
              featureDescription="Expand your organization to include your digital wardrobe and style management with the Digital Closet. Upgrade for full access."
            />
          </>
        )}
      </NotificationProvider>
    </>
  );
}
