import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Wind,
  Sparkles,
  RefreshCw,
  Loader2,
  Sun,
  Mic,
  X,
  Check,
  ListTodo,
  FileText,
  Plus,
  MessageSquare,
  Shield,
  Info,
  Star,
  Save,
  FolderOpen,
  Trash2,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import OnboardingQuiz from '@/components/gentle_flow/OnboardingQuiz';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeatureGate } from '@/components/PlanChecker';

const colorTags = [
  { value: 'default', color: 'bg-gray-200 hover:bg-gray-300' },
  { value: 'pink', color: 'bg-pink-200 hover:bg-pink-300' },
  { value: 'amber', color: 'bg-amber-200 hover:bg-amber-300' },
  { value: 'yellow', color: 'bg-yellow-200 hover:bg-yellow-300' },
  { value: 'green', color: 'bg-green-200 hover:bg-green-300' },
  { value: 'blue', color: 'bg-blue-200 hover:bg-blue-300' },
  { value: 'purple', color: 'bg-purple-200 hover:bg-purple-300' }
];

export default function GentleFlowPlanner() {
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch wellness data
  const { data: todayWellness } = useQuery({
    queryKey: ['todayWellness'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const entries = await base44.entities.WellnessEntry.filter({ date: today });
      return entries[0] || null;
    },
    enabled: !!user,
  });

  // Local state
  const [currentView, setCurrentView] = useState('input'); // 'input', 'proposal', 'planner'
  const [showQuiz, setShowQuiz] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [refineInput, setRefineInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [selectedTag, setSelectedTag] = useState('default');
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [showAccountNotice, setShowAccountNotice] = useState(false); // Added state for account notice
  const [isRecording, setIsRecording] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestionInput, setAiSuggestionInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showCustomActivityModal, setShowCustomActivityModal] = useState(false);
  const [customActivity, setCustomActivity] = useState({ title: '', duration: '30 mins', description: '' });

  // Voice recognition
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Check if user is guest
  const isGuest = !user;

  // User settings
  const settings = user?.gentle_flow_settings || {};

  // Fetch saved plans
  const { data: savedPlans = [] } = useQuery({
    queryKey: ['saved-gentle-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return user.saved_gentle_plans || [];
    },
    enabled: !!user
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Check if user needs quiz, welcome tour, or account notice
  useEffect(() => {
    if (!isLoadingUser) {
      if (!user) {
        // Guest user - show account notice
        setShowAccountNotice(true);
        // Reset states for guest mode to ensure a clean slate
        setCurrentView('input');
        setShowQuiz(false);
        setShowWelcomeTour(false);
        setProposal(null);
        setCurrentPlan(null);
        setTodos([]);
        setNotes('');
      } else {
        setShowAccountNotice(false); // Hide notice for logged-in users

        const hasCompletedQuiz = settings.quiz && Object.keys(settings.quiz).length > 0;
        const isFirstRun = settings.firstRun !== false;
        const hasSeenTour = settings.hasSeenTour || false;

        if (isFirstRun || !hasCompletedQuiz) {
          setShowQuiz(true);
          // If quiz is shown, do not proceed to show welcome tour immediately.
          // The quiz's onComplete handler will check for tour visibility.
          return;
        }

        // If quiz is done and there's a current plan, load it.
        if (settings.currentPlan) {
          setCurrentPlan(settings.currentPlan);
          setTodos(settings.currentPlan.todos || []);
          setNotes(settings.currentPlan.notes || '');
          setCurrentView('planner');
          return; // Don't show welcome tour if we're going straight to planner.
        }

        // If quiz is done, no plan loaded, and tour not seen, show welcome tour.
        if (!hasSeenTour && currentView === 'input') {
          // Use a timeout to ensure other UI elements have settled
          setTimeout(() => {
            setShowWelcomeTour(true);
          }, 500);
        }
      }
    }
  }, [user, isLoadingUser, settings, currentView]);

  // Handle welcome tour completion
  const completeWelcomeTour = async () => {
    setShowWelcomeTour(false);
    if (!isGuest) { // Only update settings if user is logged in
      await updateUserMutation.mutateAsync({
        gentle_flow_settings: {
          ...settings,
          hasSeenTour: true
        }
      });
    }
  };

  // Handle account notice close
  const closeAccountNotice = () => {
    setShowAccountNotice(false);
  };

  // Redirect to login
  const handleSignUp = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  // Detect if mobile
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        finalTranscriptRef.current = finalTranscript;
        if (currentView === 'input') {
          setUserInput(finalTranscript + interimTranscript);
        } else if (currentView === 'planner') {
          setAiSuggestionInput(finalTranscript + interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setIsRecording(false);
        if (event.error !== 'no-speech') {
          toast.error('Voice input error. Please try typing.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [currentView]);

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      if (currentView === 'input') {
        finalTranscriptRef.current = userInput;
      } else if (currentView === 'planner') {
        finalTranscriptRef.current = aiSuggestionInput;
      }
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success('🎤 Listening...');
      } catch (error) {
        toast.error('Could not start voice input');
      }
    }
  };

  // Generate plan
  const generatePlan = async (input = userInput) => {
    if (!input.trim()) {
      toast.error('Please tell me what you need to do today');
      return;
    }

    setIsGenerating(true);
    try {
      // Use mock settings for guests if actual settings are not available
      const currentMood = todayWellness?.mood_rating || 5;
      const currentEnergy = todayWellness?.energy_level || 5;

      const quizData = isGuest ? {} : settings.quiz || {}; // Use empty object for guest
      const shiftDescriptions = {
        'regular_8': 'standard 8-hour shift',
        'extended_10': '10-hour shift',
        'long_12': '12-hour shift (6am-6pm or similar)',
        'night_shift': 'night shift',
        'rotating': 'rotating shifts',
        'split_shift': 'split shift',
        'on_call': 'on-call schedule'
      };

      const shiftInfo = quizData.shiftType ? shiftDescriptions[quizData.shiftType] : 'flexible schedule';

      // Get user's recent activity patterns if available
      const recentActivities = settings.recentActivities || [];
      const preferredActivities = settings.preferredActivities || [];

      const prompt = `You are a compassionate AI planner specialized in neurodivergent-friendly productivity.

**USER SAID:** "${input}"

**CONTEXT:**
- Work: ${quizData.workStyle === 'anchor' ? shiftInfo : 'Flexible/Creative'}
- Energy: ${currentEnergy}/10
- Mood: ${currentMood}/10
- Challenges: ${(quizData.challenge || []).join(', ') || 'None specified'}
${recentActivities.length > 0 ? `- Recent activities: ${recentActivities.slice(0, 5).join(', ')}` : ''}
${preferredActivities.length > 0 ? `- User prefers: ${preferredActivities.join(', ')}` : ''}

**CREATE A GENTLE FLOW:**

1. **inspiration_quote**: A calming, encouraging quote for today (1 sentence)

2. **micro_rituals**: 2-3 tiny 3-5 minute rituals to ground them (e.g., "Morning Mindfulness", "Gentle Stretch Break")
   Format: [{ "title": "...", "description": "..." }]

3. **flow_blocks**: 4-6 time blocks for their day, matching their energy
   Each block:
   {
     "title": "Descriptive name",
     "duration": "X hour" or "X mins",
     "description": "What to do in simple terms",
     "selected": true (for required tasks) or false (for optional)
   }

**RULES:**
- If tired → shorter blocks, more rest
- Break tasks into 30-60 min chunks max
- First block should be EASY
- Include breaks between blocks
- Use gentle, supportive language
- No "should" or "must" - use "could try" or "option to"

Return ONLY valid JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            inspiration_quote: { type: "string" },
            micro_rituals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            flow_blocks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  duration: { type: "string" },
                  description: { type: "string" },
                  selected: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      setProposal(response);
      setCurrentView('proposal');
      toast.success('✨ Your gentle flow is ready!');
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle accepting the proposal
  const acceptProposal = async () => {
    const selectedBlocks = proposal.flow_blocks.filter(block => block.selected);
    const planData = {
      ...proposal,
      flow_blocks: selectedBlocks,
      todos: [],
      notes: '',
      createdAt: new Date().toISOString()
    };

    if (!isGuest) { // Only update user settings if logged in
      await updateUserMutation.mutateAsync({
        gentle_flow_settings: {
          ...settings,
          currentPlan: planData,
          lastPlanDate: new Date().toISOString()
        }
      });
    }


    setCurrentPlan(planData);
    setCurrentView('planner');
    toast.success('🎉 Plan activated!');
  };

  // Handle rejecting the proposal
  const rejectProposal = () => {
    setProposal(null);
    setCurrentView('input');
  };

  // Toggle block selection in proposal
  const toggleBlockSelection = (index) => {
    setProposal(prev => ({
      ...prev,
      flow_blocks: prev.flow_blocks.map((block, i) =>
        i === index ? { ...block, selected: !block.selected } : block
      )
    }));
  };

  // Toggle block completion in planner
  const toggleBlockCompletion = (index) => {
    setCurrentPlan(prev => {
      const newPlan = {
        ...prev,
        flow_blocks: prev.flow_blocks.map((block, i) =>
          i === index ? { ...block, completed: !block.completed } : block
        )
      };
      if (!isGuest) { // Only update user settings if logged in
        updateUserMutation.mutate({
          gentle_flow_settings: { ...settings, currentPlan: newPlan }
        });
      }
      return newPlan;
    });
  };

  // Add todo
  const addTodo = () => {
    if (!newTodo.trim()) return;
    const newTodos = [...todos, { text: newTodo, completed: false, color: selectedTag }];
    setTodos(newTodos);
    setNewTodo('');
    if (!isGuest) { // Only update user settings if logged in
      updateUserMutation.mutate({
        gentle_flow_settings: {
          ...settings,
          currentPlan: { ...currentPlan, todos: newTodos }
        }
      });
    }
  };

  // Toggle todo completion
  const toggleTodo = (index) => {
    const newTodos = todos.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(newTodos);
    if (!isGuest) { // Only update user settings if logged in
      updateUserMutation.mutate({
        gentle_flow_settings: {
          ...settings,
          currentPlan: { ...currentPlan, todos: newTodos }
        }
      });
    }
  };

  // Save notes
  const saveNotes = (value) => {
    setNotes(value);
    if (!isGuest) { // Only update user settings if logged in
      updateUserMutation.mutate({
        gentle_flow_settings: {
          ...settings,
          currentPlan: { ...currentPlan, notes: value }
        }
      });
    }
  };

  // Refine plan
  const refinePlan = () => {
    if (refineInput.trim()) {
      generatePlan(refineInput);
      setRefineInput('');
    }
  };

  // Save plan as favorite
  const savePlanAsFavorite = useMutation({
    mutationFn: async (name) => {
      const savedPlan = {
        id: Date.now().toString(),
        name,
        plan: currentPlan,
        userInput: userInput || 'Saved plan',
        createdAt: new Date().toISOString()
      };
      
      const updatedPlans = [...(user.saved_gentle_plans || []), savedPlan];
      await base44.auth.updateMe({ saved_gentle_plans: updatedPlans });
      return updatedPlans;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-gentle-plans']);
      toast.success('⭐ Plan saved to favorites!');
      setShowSaveModal(false);
      setPlanName('');
    }
  });

  // Load favorite plan
  const loadFavoritePlan = (savedPlan) => {
    setCurrentPlan(savedPlan.plan);
    setTodos(savedPlan.plan.todos || []);
    setNotes(savedPlan.plan.notes || '');
    setCurrentView('planner');
    setShowLoadModal(false);
    toast.success(`✨ Loaded "${savedPlan.name}"`);
  };

  // Delete favorite plan
  const deleteFavoritePlan = useMutation({
    mutationFn: async (planId) => {
      const updatedPlans = (user.saved_gentle_plans || []).filter(p => p.id !== planId);
      await base44.auth.updateMe({ saved_gentle_plans: updatedPlans });
      return updatedPlans;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-gentle-plans']);
      toast.success('Plan removed from favorites');
    }
  });

  // Get AI suggestions for additional activities
  const getAISuggestions = async () => {
    if (!aiSuggestionInput.trim()) {
      toast.error('Please describe what else you need to do');
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const currentMood = todayWellness?.mood_rating || 5;
      const currentEnergy = todayWellness?.energy_level || 5;
      const completedBlocks = currentPlan.flow_blocks.filter(b => b.completed).length;
      const totalBlocks = currentPlan.flow_blocks.length;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a compassionate AI planner. The user already has a plan for today but needs to add more activities.

**THEIR REQUEST:** "${aiSuggestionInput}"

**CURRENT CONTEXT:**
- Energy: ${currentEnergy}/10
- Mood: ${currentMood}/10
- Progress: ${completedBlocks}/${totalBlocks} blocks completed
- Existing activities: ${currentPlan.flow_blocks.map(b => b.title).join(', ')}

**CREATE 3-5 GENTLE SUGGESTIONS** that:
1. Match their current energy and mood
2. Don't overlap with existing activities
3. Are SPECIFIC to their request (not generic/placeholder tasks)
4. Can fit into their day naturally
5. Are broken into manageable chunks
6. Focus on REAL activities they mentioned, not example/template tasks

CRITICAL RULES:
- Do NOT suggest generic tasks like "Morning routine", "Evening wind-down", "Check emails", "Make breakfast"
- Do NOT include placeholder or template activities
- ONLY suggest SPECIFIC activities the user explicitly mentioned
- If they said "call dentist" → suggest that specific task
- If they said "prep for meeting" → suggest that specific task
- Break down THEIR activities into gentle steps, don't add unrelated ones

Each suggestion should have:
- title: Clear, supportive name (SPECIFIC to their needs)
- duration: Realistic time estimate
- description: What to do in simple, gentle terms
- priority: "suggested" or "optional"

Return ONLY valid JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  duration: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            encouragement: { type: "string" }
          }
        }
      });

      setAiSuggestions(response);
      toast.success('✨ AI suggestions ready!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Accept AI suggestion
  const acceptAISuggestion = (suggestion) => {
    const newBlock = {
      ...suggestion,
      selected: true,
      completed: false
    };

    setCurrentPlan(prev => {
      const newPlan = {
        ...prev,
        flow_blocks: [...prev.flow_blocks, newBlock]
      };
      if (!isGuest) {
        updateUserMutation.mutate({
          gentle_flow_settings: { ...settings, currentPlan: newPlan }
        });
      }
      return newPlan;
    });

    // Remove from suggestions
    setAiSuggestions(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.title !== suggestion.title)
    }));

    toast.success('Added to your plan!');
  };

  // Decline AI suggestion
  const declineAISuggestion = (suggestion) => {
    setAiSuggestions(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.title !== suggestion.title)
    }));
    toast.success('Suggestion dismissed');
  };

  // Add custom activity to plan
  const addCustomActivity = (activityData) => {
    const newBlock = {
      title: activityData.title,
      duration: activityData.duration || '30 mins',
      description: activityData.description || '',
      selected: true,
      completed: false,
      priority: 'custom'
    };

    setCurrentPlan(prev => {
      const newPlan = {
        ...prev,
        flow_blocks: [...prev.flow_blocks, newBlock]
      };
      if (!isGuest) {
        updateUserMutation.mutate({
          gentle_flow_settings: { ...settings, currentPlan: newPlan }
        });
      }
      return newPlan;
    });

    toast.success('Activity added!');
  };

  // Reset everything
  const handleReset = async () => {
    if (!isGuest) { // Only update user settings if logged in
      await updateUserMutation.mutateAsync({
        gentle_flow_settings: {
          firstRun: true,
          quiz: {},
          currentPlan: null,
          hasSeenTour: false // Reset tour status
        }
      });
    }
    setCurrentView('input');
    setProposal(null);
    setCurrentPlan(null);
    setUserInput('');
    setShowQuiz(true);
    toast.success('Reset complete!');
  };

  // Loading
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7AAE9E]" />
      </div>
    );
  }

  return (
    <FeatureGate
      featureKey="gentle_flow_planner"
      featureName="Gentle Flow Planner"
      featureDescription="Neuro-inclusive daily planning designed for flexibility, compassion, and sustainable routines."
    >
      <div className="min-h-screen bg-[#F7F6F3]">
        {/* Account Required Notice for Guests */}
        <AnimatePresence>
          {showAccountNotice && isGuest && (
            <Dialog open={showAccountNotice} onOpenChange={setShowAccountNotice}>
              <DialogContent className="sm:max-w-lg bg-white border-0 shadow-2xl">
                <DialogHeader>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-center text-[#2E2E2E]">
                    Welcome to Gentle Flow Planner! 🌿
                  </DialogTitle>
                  <DialogDescription className="text-center space-y-4 pt-4">
                    <p className="text-base text-gray-700">
                      You can explore this feature as a guest, but to fully personalize your experience and protect your data, you'll need a free account.
                    </p>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 space-y-3 text-left">
                      <h3 className="font-semibold text-[#2E2E2E] flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Why create an account?
                      </h3>

                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Save your plans</strong> and access them anytime</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Chat with Grief Coach</strong> and other AI companions</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Track your wellness</strong> and habits over time</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Connect with family</strong> and share schedules</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Your data is encrypted</strong> and protected</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-left">
                          <strong>Guest Mode:</strong> You can try the planner now, but your plan won't be saved when you leave. Sign up anytime to keep your progress!
                        </p>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    onClick={handleSignUp}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-base font-semibold"
                  >
                    Create Free Account
                  </Button>
                  <Button
                    onClick={closeAccountNotice}
                    variant="outline"
                    className="w-full h-12"
                  >
                    Continue as Guest
                  </Button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-2">
                  Already have an account? <button onClick={handleSignUp} className="text-purple-600 hover:underline font-medium">Sign in</button>
                </p>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Welcome Tour Popup (for logged-in users) */}
        <AnimatePresence>
          {showWelcomeTour && currentView === 'input' && !isGuest && (
            <Dialog open={showWelcomeTour} onOpenChange={setShowWelcomeTour}>
              <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
                <DialogHeader>
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="w-16 h-16 bg-gradient-to-br from-[#7AAE9E] to-[#A6C48A] rounded-full flex items-center justify-center"
                    >
                      <Wind className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-center text-[#2E2E2E]">
                    Welcome to Gentle Flow Planner! 🌿
                  </DialogTitle>
                  <DialogDescription className="text-center space-y-4 pt-4">
                    <p className="text-base text-gray-700">
                      I'm here to help you plan your day in a way that actually works for your brain.
                    </p>

                    <div className="bg-gradient-to-r from-[#7AAE9E]/10 to-[#A6C48A]/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#7AAE9E]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-[#7AAE9E]" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-[#2E2E2E] mb-1">Step 1: Tell me what you need to do</p>
                          <p className="text-sm text-gray-600">
                            Use the chat box below to share what's on your plate today. Be honest about how you're feeling!
                          </p>
                        </div>
                      </div>

                      {isMobile && (
                        <div className="flex items-start gap-3 pt-2 border-t border-[#7AAE9E]/20">
                          <div className="w-8 h-8 bg-[#B9A7D1]/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mic className="w-4 h-4 text-[#B9A7D1]" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-[#2E2E2E] mb-1">💡 Mobile Tip: Use your voice!</p>
                            <p className="text-sm text-gray-600">
                              Tap the <strong className="text-[#B9A7D1]">microphone icon</strong> to speak instead of typing. It's faster and easier!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 pt-2 border-t border-[#7AAE9E]/20">
                        <div className="w-8 h-8 bg-[#A6C48A]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-[#A6C48A]" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-[#2E2E2E] mb-1">Step 2: Get your gentle flow</p>
                          <p className="text-sm text-gray-600">
                            I'll break everything down into tiny, manageable steps that won't overwhelm you.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F0E8F5] rounded-lg p-3 text-sm text-gray-700">
                      <strong className="text-[#2E2E2E]">Example:</strong> "I need to do laundry and make dinner but I'm exhausted"
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    onClick={completeWelcomeTour}
                    className="w-full bg-gradient-to-r from-[#7AAE9E] to-[#A6C48A] hover:from-[#7AAE9E]/90 hover:to-[#A6C48A]/90 text-white h-12 text-base font-semibold"
                  >
                    Got it! Let's start
                  </Button>
                  <button
                    onClick={completeWelcomeTour}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Skip tour
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Onboarding Quiz Modal */}
        <AnimatePresence>
          {showQuiz && (
            <OnboardingQuiz
              onComplete={async (answers) => {
                if (!isGuest) { // Only update user settings if logged in
                  await updateUserMutation.mutateAsync({
                    gentle_flow_settings: {
                      ...settings,
                      firstRun: false,
                      quiz: answers
                    }
                  });
                }
                setShowQuiz(false);
                toast.success('✨ Personalized!');

                // Show welcome tour after quiz if not seen and user is not a guest
                if (!isGuest && !settings.hasSeenTour) {
                  setTimeout(() => {
                    setShowWelcomeTour(true);
                  }, 300);
                }
              }}
            />
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* INPUT VIEW */}
          {currentView === 'input' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#7AAE9E]/20 rounded-full flex items-center justify-center">
                  <Wind className="w-8 h-8 text-[#7AAE9E]" />
                </div>
                <h1 className="text-4xl font-bold text-[#2E2E2E]">Plan your day, your way</h1>
                <p className="text-lg text-gray-600">Structure that supports — never suffocates.</p>
              </div>

              {/* Input Section */}
              <div className="text-center space-y-6">
                <h2 className="text-xl font-semibold text-[#2E2E2E]">Ready to plan your day?</h2>
                <p className="text-gray-600">Tell the AI what you need to focus on today to generate a new gentle flow.</p>

                <div className="max-w-2xl mx-auto">
                  {/* Visual indicator for new users */}
                  {!settings.hasSeenTour && !isGuest && ( // Only show for logged-in, new users
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 flex items-center justify-center gap-2 text-sm text-[#7AAE9E] font-medium"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        👇
                      </motion.div>
                      <span>Start here - tell me what you need to do</span>
                    </motion.div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="e.g., 'I need a slow start today...'"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && generatePlan()}
                        className="h-12 pr-12 text-base"
                        disabled={isGenerating}
                      />
                      <button
                        onClick={toggleVoiceInput}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'} hover:text-gray-600 transition-colors`}
                        title={isMobile ? "Tap to use voice input" : "Click to use voice input"}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                    <Button
                      onClick={() => generatePlan()}
                      disabled={isGenerating || !userInput.trim()}
                      className="h-12 px-6 bg-[#B9A7D1] hover:bg-[#A895C1] text-white"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Create Plan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isGuest && ( // Only show for logged-in users
                <div className="flex justify-center gap-3 pt-8">
                  <Button
                    onClick={() => setShowLoadModal(true)}
                    variant="outline"
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Load Saved Plan
                  </Button>
                  <button
                    onClick={handleReset}
                    className="text-sm text-[#7AAE9E] hover:text-[#6A9D8E] flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Personalization
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* PROPOSAL VIEW */}
          {currentView === 'proposal' && proposal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4 mb-8">
                <h1 className="text-3xl font-bold text-[#2E2E2E]">Here's a gentle plan for you...</h1>
                <p className="text-gray-600">Does this feel right for today?</p>
              </div>

              {/* Inspiration Quote */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-lg text-gray-700 italic text-center">"{proposal.inspiration_quote}"</p>
              </div>

              {/* Micro-Rituals */}
              {proposal.micro_rituals && proposal.micro_rituals.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[#2E2E2E] flex items-center gap-2">
                    <Sun className="w-5 h-5 text-[#7AAE9E]" />
                    Micro-Rituals
                  </h3>
                  {proposal.micro_rituals.map((ritual, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <h4 className="font-semibold text-[#2E2E2E] mb-1">{ritual.title}</h4>
                      <p className="text-sm text-gray-600">{ritual.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Proposed Flow */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#2E2E2E] flex items-center gap-2">
                  <Wind className="w-5 h-5 text-[#7AAE9E]" />
                  Proposed Flow
                </h3>
                {proposal.flow_blocks.map((block, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleBlockSelection(index)}
                    className={`bg-white rounded-xl p-4 shadow-sm border-2 cursor-pointer transition-all ${
                      block.selected ? 'border-[#7AAE9E]' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        block.selected ? 'bg-[#7AAE9E] border-[#7AAE9E]' : 'border-gray-300'
                      }`}>
                        {block.selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-[#2E2E2E]">{block.title}</h4>
                          <span className="text-sm text-gray-500">{block.duration}</span>
                        </div>
                        <p className="text-sm text-gray-600">{block.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={rejectProposal}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={acceptProposal}
                  className="gap-2 bg-[#7AAE9E] hover:bg-[#6A9D8E] text-white"
                >
                  <Check className="w-4 h-4" />
                  Looks Good!
                </Button>
              </div>

              {/* Reset */}
              {!isGuest && ( // Only show reset for logged-in users
                <div className="text-center pt-4">
                  <button
                    onClick={handleReset}
                    className="text-sm text-[#7AAE9E] hover:text-[#6A9D8E] flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Personalization
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* PLANNER VIEW */}
          {currentView === 'planner' && currentPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Quote */}
              {currentPlan.inspiration_quote && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-base text-gray-700 italic text-center">"{currentPlan.inspiration_quote}"</p>
                </div>
              )}

              {/* Micro-Rituals */}
              {currentPlan.micro_rituals && currentPlan.micro_rituals.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[#2E2E2E] flex items-center gap-2">
                    <Sun className="w-5 h-5 text-[#7AAE9E]" />
                    Micro-Rituals
                  </h3>
                  {currentPlan.micro_rituals.map((ritual, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <h4 className="font-semibold text-[#2E2E2E] mb-1">{ritual.title}</h4>
                      <p className="text-sm text-gray-600">{ritual.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Today's Gentle Flow */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#2E2E2E] flex items-center gap-2">
                    <Wind className="w-5 h-5 text-[#7AAE9E]" />
                    Today's Gentle Flow
                  </h3>
                  {!isGuest && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowLoadModal(true)}
                        variant="outline"
                        size="sm"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <FolderOpen className="w-4 h-4 mr-1" />
                        Load
                      </Button>
                      <Button
                        onClick={() => setShowSaveModal(true)}
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                {/* AI Suggestions Input */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Need to add more to your day?
                  </h4>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="e.g., 'I also need to call the dentist and prep for tomorrow's meeting'..."
                        value={aiSuggestionInput}
                        onChange={(e) => setAiSuggestionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && getAISuggestions()}
                        className="h-10 pr-10 bg-white"
                      />
                      <button
                        onClick={toggleVoiceInput}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      onClick={getAISuggestions}
                      disabled={!aiSuggestionInput.trim() || isGeneratingSuggestions}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {isGeneratingSuggestions ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Get Ideas
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowCustomActivityModal(true)}
                      size="sm"
                      variant="outline"
                      className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Manually
                    </Button>
                  </div>
                </div>

                {/* AI Suggestions Display */}
                <AnimatePresence>
                  {aiSuggestions && aiSuggestions.suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          AI Suggestions
                        </h4>
                        <button
                          onClick={() => setAiSuggestions(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {aiSuggestions.encouragement && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-sm text-blue-800">💙 {aiSuggestions.encouragement}</p>
                        </div>
                      )}

                      {aiSuggestions.suggestions.map((suggestion, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white rounded-xl p-4 shadow-sm border-2 border-purple-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h5 className="font-semibold text-gray-900">{suggestion.title}</h5>
                                <Badge className={`text-xs ${
                                  suggestion.priority === 'suggested' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {suggestion.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">{suggestion.duration}</span>
                              </div>
                              <p className="text-sm text-gray-600">{suggestion.description}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                onClick={() => acceptAISuggestion(suggestion)}
                                size="sm"
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => declineAISuggestion(suggestion)}
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowCustomActivityModal(true)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Custom Activity
                        </Button>
                        <Button
                          onClick={() => {
                            setAiSuggestionInput('');
                            getAISuggestions();
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          More Ideas
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Flow Blocks */}
                {currentPlan.flow_blocks.map((block, index) => (
                  <div
                    key={index}
                    onClick={() => toggleBlockCompletion(index)}
                    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer transition-all ${
                      block.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={block.completed}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold text-[#2E2E2E] ${block.completed ? 'line-through' : ''}`}>
                            {block.title}
                          </h4>
                          <span className="text-sm text-gray-500">{block.duration}</span>
                        </div>
                        <p className={`text-sm text-gray-600 ${block.completed ? 'line-through' : ''}`}>
                          {block.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* To-Do List & Scratch Pad */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* To-Do List */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-[#2E2E2E] flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-[#7AAE9E]" />
                    To-Do List
                  </h3>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a to-do item..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                        className="h-9 text-sm"
                      />
                      <Button
                        onClick={addTodo}
                        size="sm"
                        className="bg-[#7AAE9E] hover:bg-[#6A9D8E] text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Color Tags */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Tag:</span>
                      <div className="flex gap-1.5">
                        {colorTags.map(tag => (
                          <button
                            key={tag.value}
                            onClick={() => setSelectedTag(tag.value)}
                            className={`w-6 h-6 rounded-full ${tag.color} ${
                              selectedTag === tag.value ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Todo Items */}
                    {todos.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No pending to-do items. Add one!</p>
                    ) : (
                      <div className="space-y-2">
                        {todos.map((todo, index) => (
                          <div
                            key={index}
                            onClick={() => toggleTodo(index)}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <Checkbox checked={todo.completed} />
                            <div className={`w-3 h-3 rounded-full ${colorTags.find(t => t.value === todo.color)?.color || 'bg-gray-200'}`} />
                            <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {todo.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scratch Pad */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-[#2E2E2E] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#7AAE9E]" />
                    Scratch Pad
                  </h3>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <Textarea
                      placeholder="Jot down a quick note..."
                      value={notes}
                      onChange={(e) => saveNotes(e.target.value)}
                      className="min-h-[200px] text-sm resize-none border-0 focus:ring-0 p-0"
                    />
                    {!notes && (
                      <p className="text-sm text-gray-400 text-center mt-8">A place for your thoughts.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset */}
              {!isGuest && ( // Only show reset for logged-in users
                <div className="text-center pt-4">
                  <button
                    onClick={handleReset}
                    className="text-sm text-[#7AAE9E] hover:text-[#6A9D8E] flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Personalization
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Save Plan Modal */}
        <AnimatePresence>
          {showSaveModal && !isGuest && (
            <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Save This Plan
                  </DialogTitle>
                  <DialogDescription>
                    Give this plan a name so you can reuse it later
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="e.g., 'Gentle Monday', 'Low Energy Day'..."
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => savePlanAsFavorite.mutate(planName)}
                      disabled={!planName.trim() || savePlanAsFavorite.isPending}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      {savePlanAsFavorite.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Save Plan</>
                      )}
                    </Button>
                    <Button onClick={() => setShowSaveModal(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Add Custom Activity Modal */}
        <AnimatePresence>
          {showCustomActivityModal && (
            <Dialog open={showCustomActivityModal} onOpenChange={setShowCustomActivityModal}>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-500" />
                    Add Custom Activity
                  </DialogTitle>
                  <DialogDescription>
                    Manually add any activity to your gentle flow
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Activity name
                    </label>
                    <Input
                      placeholder="e.g., Call the doctor"
                      value={customActivity.title}
                      onChange={(e) => setCustomActivity({ ...customActivity, title: e.target.value })}
                      className="border-2 border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      How long will it take?
                    </label>
                    <Input
                      placeholder="e.g., 15 mins, 1 hour"
                      value={customActivity.duration}
                      onChange={(e) => setCustomActivity({ ...customActivity, duration: e.target.value })}
                      className="border-2 border-blue-200 focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Any details or reminders..."
                      value={customActivity.description}
                      onChange={(e) => setCustomActivity({ ...customActivity, description: e.target.value })}
                      className="border-2 border-blue-200 focus:border-blue-400 min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (!customActivity.title.trim()) {
                          toast.error('Please enter an activity name');
                          return;
                        }
                        addCustomActivity(customActivity);
                        setCustomActivity({ title: '', duration: '30 mins', description: '' });
                        setShowCustomActivityModal(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                    <Button onClick={() => setShowCustomActivityModal(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Load Plan Modal */}
        <AnimatePresence>
          {showLoadModal && !isGuest && (
            <Dialog open={showLoadModal} onOpenChange={setShowLoadModal}>
              <DialogContent className="sm:max-w-2xl bg-white max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-purple-500" />
                    Load a Saved Plan
                  </DialogTitle>
                  <DialogDescription>
                    Choose from your favorite plans to reuse
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 pt-4">
                  {savedPlans.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No saved plans yet</p>
                      <p className="text-sm text-gray-400 mt-2">Create a plan and save it to reuse later</p>
                    </div>
                  ) : (
                    savedPlans.map((savedPlan, idx) => (
                      <motion.div
                        key={savedPlan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="border-2 border-purple-200 hover:shadow-lg transition-all">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">{savedPlan.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Created {new Date(savedPlan.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className="bg-purple-100 text-purple-700">
                                {savedPlan.plan.flow_blocks?.length || 0} blocks
                              </Badge>
                            </div>

                            {savedPlan.plan.inspiration_quote && (
                              <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 italic">"{savedPlan.plan.inspiration_quote}"</p>
                              </div>
                            )}

                            <div className="space-y-1 mb-4">
                              {savedPlan.plan.flow_blocks?.slice(0, 3).map((block, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                  <span>{block.title}</span>
                                  <span className="text-xs text-gray-400">{block.duration}</span>
                                </div>
                              ))}
                              {(savedPlan.plan.flow_blocks?.length || 0) > 3 && (
                                <p className="text-xs text-gray-400 ml-3.5">+{savedPlan.plan.flow_blocks.length - 3} more blocks</p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => loadFavoritePlan(savedPlan)}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Use This Plan
                              </Button>
                              <Button
                                onClick={() => deleteFavoritePlan.mutate(savedPlan.id)}
                                variant="outline"
                                size="icon"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </FeatureGate>
  );
}