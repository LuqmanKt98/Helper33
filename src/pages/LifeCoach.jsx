
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { User, JournalEntry, Task } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Send,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Brain,
  Mic,
  StopCircle,
  Volume2,
  Users,
  Briefcase,
  DollarSign,
  Dumbbell,
  BookOpen,
  Coffee,
  MoreHorizontal,
  MessageSquare,
  LifeBuoy,
  Award,
  Trophy,
  Flame,
  Zap,
  Crown,
  Rocket,
  Settings,
  Heart,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDisabledBanner from '@/components/common/NotificationDisabledBanner';
import { FeatureGate } from '@/components/PlanChecker';
import GoalsManager from '@/components/coaching/GoalsManager';
import SEO from '@/components/SEO';
import MeditationScriptGenerator from '@/components/coaching/MeditationScriptGenerator';
import JournalPromptGenerator from '@/components/coaching/JournalPromptGenerator';
import ThoughtReframingTool from '@/components/coaching/ThoughtReframingTool';
import SavedInteractions from '@/components/coaching/SavedInteractions';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
}

const playSound = (type) => {
  if (!window.Audio) return;
  let audio;
  if (type === 'success') {
    audio = new Audio('/sounds/success_ding.mp3');
  } else if (type === 'error') {
    audio = new Audio('/sounds/error_buzz.mp3');
  } else if (type === 'level_up') {
    audio = new Audio('/sounds/level_up.mp3');
  } else if (type === 'achievement') {
    audio = new Audio('/sounds/achievement_unlocked.mp3');
  }
  if (audio) {
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Sound play failed:", e));
  }
};

const achievements = [
  { id: 'first_chat', title: 'First Steps', description: 'Had your first coaching conversation', icon: Sparkles, points: 50 },
  { id: 'streak_3', title: 'Getting Consistent', description: '3-day coaching streak', icon: Flame, points: 100 },
  { id: 'streak_7', title: 'Week Warrior', description: '7-day coaching streak', icon: Award, points: 200 },
  { id: 'task_creator', title: 'Action Taker', description: 'Accepted 5 coach suggestions', icon: CheckCircle, points: 150 },
  { id: 'category_explorer', title: 'Well-Rounded', description: 'Explored 4+ life categories', icon: Crown, points: 300 },
  { id: 'voice_user', title: 'Voice Champion', description: 'Used voice input 10 times', icon: Mic, points: 100 }
];

const levelTitles = [
  "Seeker", "Explorer", "Learner", "Achiever", "Champion",
  "Master", "Legend", "Guru", "Sage", "Life Coach Pro"
];

export default function LifeCoach() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingEntryId, setSpeakingEntryId] = useState(null);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [coachedTasks, setCoachedTasks] = useState([]);

  const [playerStats, setPlayerStats] = useState({
    level: 1,
    xp: 0,
    totalPoints: 0,
    streak: 0,
    conversationCount: 0,
    tasksAccepted: 0,
    categoriesExplored: [],
    unlockedAchievements: [],
    voiceUsageCount: 0
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);

  const [appSettings, setAppSettings] = useState({
    gamification_enabled: true,
    theme: 'default',
    notification_preference: 'all'
  });

  const [coachingSettings, setCoachingSettings] = useState({
    preferred_coaching_style: 'gentle'
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lifeGoals, setLifeGoals] = useState(["", "", ""]);
  const [currentChallenges, setCurrentChallenges] = useState(["", "", ""]);
  const [preferredStyle, setPreferredStyle] = useState("gentle");

  const [lastCheckIns, setLastCheckIns] = useState({});
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const [activeTab, setActiveTab] = useState('chat'); // New state for active tab

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const coachingCategories = useMemo(() => [
    {
      id: 'relationships',
      label: 'Relationships',
      icon: Users,
      description: 'Dating, marriage, family, friendships',
      color: 'from-pink-500 to-rose-500',
      xpBonus: 10
    },
    {
      id: 'lifestyle',
      label: 'Lifestyle & Habits',
      icon: Coffee,
      description: 'Daily routines, habits, work-life balance',
      color: 'from-amber-500 to-orange-500',
      xpBonus: 15
    },
    {
      id: 'career',
      label: 'Career & Work',
      icon: Briefcase,
      description: 'Job changes, promotions, workplace issues',
      color: 'from-blue-500 to-indigo-500',
      xpBonus: 20
    },
    {
      id: 'personal_growth',
      label: 'Personal Growth',
      icon: TrendingUp,
      description: 'Self-improvement, confidence, mindset',
      color: 'from-green-500 to-emerald-500',
      xpBonus: 25
    },
    {
      id: 'health',
      label: 'Health & Wellness',
      icon: Dumbbell,
      description: 'Fitness goals, mental health, self-care',
      color: 'from-teal-500 to-cyan-500',
      xpBonus: 20
    },
    {
      id: 'addiction_recovery',
      label: 'Addiction & Recovery',
      icon: LifeBuoy,
      description: 'Support for sobriety, habits, and recovery paths',
      color: 'from-sky-500 to-blue-500',
      xpBonus: 30
    },
    {
      id: 'finances',
      label: 'Money & Finances',
      icon: DollarSign,
      description: 'Budgeting, saving, financial planning',
      color: 'from-emerald-500 to-green-500',
      xpBonus: 25
    },
    {
      id: 'learning',
      label: 'Learning & Skills',
      icon: BookOpen,
      description: 'Education, new skills, personal interests',
      color: 'from-purple-500 to-violet-500',
      xpBonus: 20
    },
    {
      id: 'other',
      label: 'Something Else',
      icon: MoreHorizontal,
      description: 'Other life areas or general guidance',
      color: 'from-gray-500 to-slate-500',
      xpBonus: 15
    }
  ], []);

  const getXPForNextLevel = (level) => level * 100;

  const awardXP = useCallback(async (amount, reason = "") => {
    if (!appSettings.gamification_enabled) return;
    setPlayerStats(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        setShowLevelUp(true);
        playSound('level_up');
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      const updatedStats = {
        ...prev,
        xp: newXP,
        level: newLevel,
        totalPoints: prev.totalPoints + amount
      };

      User.updateMyUserData({ coaching_stats: updatedStats })
        .catch(err => console.error("Failed to update user coaching stats:", err));

      return updatedStats;
    });
  }, [setPlayerStats, appSettings.gamification_enabled]);

  const checkAchievements = useCallback(async (stats) => {
    if (!appSettings.gamification_enabled) return;
    let newUnlockedAchievements = [];
    let xpFromAchievements = 0;

    for (const achievement of achievements) {
      if (stats.unlockedAchievements.includes(achievement.id)) continue;

      let unlocked = false;
      switch (achievement.id) {
        case 'first_chat':
          unlocked = stats.conversationCount >= 1;
          break;
        case 'streak_3':
          unlocked = stats.streak >= 3;
          break;
        case 'streak_7':
          unlocked = stats.streak >= 7;
          break;
        case 'task_creator':
          unlocked = stats.tasksAccepted >= 5;
          break;
        case 'category_explorer':
          unlocked = stats.categoriesExplored.length >= 4;
          break;
        case 'voice_user':
          unlocked = stats.voiceUsageCount >= 10;
          break;
        default:
          break;
      }

      if (unlocked) {
        newUnlockedAchievements.push(achievement);
        xpFromAchievements += achievement.points;
      }
    }

    if (newUnlockedAchievements.length > 0) {
      setPlayerStats(prev => {
        const updatedAchievements = [...prev.unlockedAchievements, ...newUnlockedAchievements.map(a => a.id)];

        User.updateMyUserData({ coaching_stats: { ...prev, unlockedAchievements: updatedAchievements } })
            .catch(err => console.error("Failed to update user achievements:", err));

        return {
          ...prev,
          unlockedAchievements: updatedAchievements
        };
      });

      for (let i = 0; i < newUnlockedAchievements.length; i++) {
        setTimeout(() => {
          setShowAchievement(newUnlockedAchievements[i]);
          playSound('achievement');
          setTimeout(() => setShowAchievement(null), 4000);
        }, i * 4500);
      }

      if (xpFromAchievements > 0) {
        awardXP(xpFromAchievements, `Unlocked achievements`);
      }
    }
  }, [awardXP, setPlayerStats, appSettings.gamification_enabled]);

  const loadCoachedTasks = useCallback(async () => {
    try {
      const tasks = await Task.list();
      const filteredTasks = tasks.filter(task =>
        task.tags &&
        task.tags.includes('life-coach-goal') &&
        task.status !== 'completed'
      );
      setCoachedTasks(filteredTasks);
    } catch (error) {
      console.error("Error loading coached tasks:", error);
      if (!error.message?.includes('429') && !error.message?.includes('rate limit')) {
        // Handle non-rate-limit errors
      }
    }
  }, []);

  const checkIfNeedsCheckIn = useCallback((categoryId) => {
    if (!lastCheckIns[categoryId]) return true;
    
    const lastCheckIn = new Date(lastCheckIns[categoryId]);
    const daysSinceCheckIn = Math.floor((new Date() - lastCheckIn) / (1000 * 60 * 60 * 24));
    
    return daysSinceCheckIn >= 3;
  }, [lastCheckIns]);

  const getDaysSinceCheckIn = useCallback((categoryId) => {
    if (!lastCheckIns[categoryId]) return null;
    
    const lastCheckIn = new Date(lastCheckIns[categoryId]);
    return Math.floor((new Date() - lastCheckIn) / (1000 * 60 * 60 * 24));
  }, [lastCheckIns]);

  const loadData = useCallback(async () => {
    try {
      const [userData, entries] = await Promise.all([
        User.me(),
        JournalEntry.filter({agent_type: 'life_coach'}, '-created_date', 20)
      ]);

      setUser(userData);
      
      const checkInDates = {};
      entries.forEach(entry => {
        const categoryTag = entry.tags?.find(tag => coachingCategories.some(cat => cat.id === tag));
        if (categoryTag) {
          if (!checkInDates[categoryTag] || new Date(entry.created_date) > new Date(checkInDates[categoryTag])) {
            checkInDates[categoryTag] = entry.created_date;
          }
        }
      });
      setLastCheckIns(checkInDates);
      
      const transformedMessages = entries.flatMap(entry => {
        if (entry.content && entry.ai_response) {
          const categoryTag = entry.tags?.find(tag => coachingCategories.some(cat => cat.id === tag));
          return [
            {
              id: `${entry.id}-user`,
              type: 'user',
              content: entry.content,
              timestamp: entry.created_date,
              category: categoryTag
            },
            {
              id: `${entry.id}-ai`,
              type: 'ai',
              content: entry.ai_response,
              timestamp: entry.created_date,
              category: categoryTag,
              conversationDepth: entries.filter(e => e.tags?.includes(categoryTag)).length
            }
          ];
        }
        return [];
      }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setMessages(transformedMessages);
      
      setIsSetupComplete(userData.life_coach_setup_completed || false);
      
      if (userData.app_settings) {
        setAppSettings(prev => ({ ...prev, ...userData.app_settings }));
      }

      if (userData.preferred_coaching_style) {
         setCoachingSettings(prev => ({ ...prev, preferred_coaching_style: userData.preferred_coaching_style }));
         setPreferredStyle(userData.preferred_coaching_style);
      }
      
      if (userData.coaching_reminders_enabled !== undefined) {
        setRemindersEnabled(userData.coaching_reminders_enabled);
      }

      const initialStats = userData.coaching_stats || {
        level: 1,
        xp: 0,
        totalPoints: 0,
        streak: 0,
        conversationCount: 0,
        tasksAccepted: 0,
        categoriesExplored: [],
        unlockedAchievements: [],
        voiceUsageCount: 0
      };

      const conversationCount = entries.length;
      const categoriesExplored = Array.from(new Set(
        entries.flatMap(entry => entry.tags?.filter(tag => coachingCategories.some(cat => cat.id === tag)))
      )).filter(Boolean);

      const finalStats = {
        ...initialStats,
        conversationCount: conversationCount,
        categoriesExplored: categoriesExplored
      };

      setPlayerStats(finalStats);
      await checkAchievements(finalStats);

      if (userData.life_goals) {
        setLifeGoals(userData.life_goals || ["", "", ""]);
        setCurrentChallenges(userData.current_challenges || ["", "", ""]);
      } else {
        setShowSetup(true);
      }
    } catch (error) {
      console.log("Error loading life coach data", error);
      if (!error.message?.includes('429') && !error.message?.includes('rate limit')) {
        // Handle non-rate-limit errors
      }
    }
  }, [coachingCategories, checkAchievements]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
      loadCoachedTasks();
    }, 100);

    if (recognition) {
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        setCurrentInput(prev => prev + finalTranscript);
      };
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);
    }

    return () => {
      clearTimeout(timeoutId);
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (error) {
          console.log("Speech synthesis cleanup error:", error);
        }
      }
      if (recognition) {
        recognition.stop();
        // Eradicate the Application Crash at Its True Source
        // Clear event handlers on unmount to prevent state updates on an unmounted component.
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
      }
    };
  }, [loadData, loadCoachedTasks]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (options = {}) => {
    const { messageContent = currentInput, messageCategory = selectedCategory, isTaskCheckIn = false, taskId = null } = options;

    if (!messageContent.trim() || !messageCategory) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      category: messageCategory
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    try {
      const currentPreferredStyle = coachingSettings.preferred_coaching_style;
      const categoryContext = coachingCategories.find(c => c.id === messageCategory);
      
      const userGoalsContext = user?.life_goals?.length > 0
        ? `Goals: ${user.life_goals.join(', ')}`
        : '';
      const challengesContext = user?.current_challenges?.length > 0
        ? `Challenges: ${user.current_challenges.join(', ')}`
        : '';

      const categoryMessages = messages.filter(msg => msg.category === messageCategory);
      const conversationDepth = categoryMessages.length; // Number of messages in this category *before* current user message
      const isInitialSession = conversationDepth < 4; // First 4 exchanges (user msg + AI response = 1 exchange)

      const recentConversation = categoryMessages.slice(-6).map(m =>
        `${m.type === 'user' ? 'Client' : 'Coach'}: ${m.content}`
      ).join('\n');

      const messageAnalysis = await InvokeLLM({
        prompt: `Quick coaching analysis - respond with valid JSON:
- What they need (guidance, strategy, accountability, motivation, celebration)
- Their state (stuck, progressing, unclear, motivated, reflecting)
- Response type needed (teach framework, provide strategy, ask insight question, suggest tasks, wrap up)
- Is this a check-in? ${isTaskCheckIn}

Client said: "${messageContent}"
Context: ${recentConversation}

Return JSON: {"need": "string", "state": "string", "response_type": "string", "suggest_wrapping": boolean}`,
        response_json_schema: {
          type: "object",
          properties: {
            need: { type: "string" },
            state: { type: "string" },
            response_type: { type: "string" },
            suggest_wrapping: { type: "boolean" }
          },
          required: ["need", "state", "response_type", "suggest_wrapping"]
        }
      });
      
      // Determine if the AI *should* be prompted to suggest tasks THIS turn.
      // This helps guide the LLM's response structure.
      const shouldAIPromptForTasks = (
        messageAnalysis.response_type === 'suggest tasks' || // AI analysis suggests tasks
        messageContent.toLowerCase().includes('action steps') ||
        messageContent.toLowerCase().includes('tasks') ||
        (isInitialSession && conversationDepth === 3) || // After 3 user turns in initial session (making 4 exchanges)
        (conversationDepth >= 4 && messageAnalysis.suggest_wrapping) // In ongoing session and AI thinks it's time to wrap up
      );

      const coachResponse = await InvokeLLM({
        prompt: `You are an experienced life coach providing guidance and strategy.

CLIENT:
${userGoalsContext ? `CLIENT PROFILE:\n${userGoalsContext}\n${challengesContext}\n` : ''}
Coaching style: ${currentPreferredStyle}
Current Focus Area: ${categoryContext?.label} - ${categoryContext?.description}

CONVERSATION CONTEXT:
- Session Type: ${isTaskCheckIn ? 'Task Check-In (Follow-up)' : isInitialSession ? 'Initial Coaching Session' : 'Ongoing Session'}
- Conversation Turns: ${conversationDepth} (this is the number of messages in this category BEFORE the current user message)
- Is Task Check-in: ${isTaskCheckIn}

ANALYSIS OF CLIENT'S LAST MESSAGE:
- They need: ${messageAnalysis.need}
- Current state: ${messageAnalysis.state}
- Best response: ${messageAnalysis.response_type}
- Should wrap up: ${messageAnalysis.suggest_wrapping}

CONVERSATION HISTORY:
${recentConversation}

CLIENT JUST SAID: "${messageContent}"

YOUR APPROACH BASED ON SESSION TYPE:

${isTaskCheckIn ? `
TASK CHECK-IN (Follow-up):
1. Acknowledge their check-in warmly.
2. Ask ONE focused question about their progress or challenges.
3. Provide brief encouragement or one key insight (60-100 words total).
4. Suggest they mark this task complete if they've made good progress.
5. End naturally - don't ask more questions unless they share a struggle.

Example Check-in Response:
"Great job checking in! It sounds like [reflection on their progress]. [One insight or tip]. 

If you've made good progress, go ahead and mark this task complete. If you're facing specific challenges, I'm here - just share what's blocking you."
` : shouldAIPromptForTasks ? `
TIME TO CREATE ACTION TASKS:
1. Provide 2-3 sentences of encouragement about the conversation.
2. Then list 3 specific, actionable tasks based on what was discussed.
3. Each task should be concrete with a clear outcome.
4. Format tasks EXACTLY like this:

"Based on our conversation, here are your action steps:
1. [Specific task with clear outcome, e.g., "Research 3 online courses on X skill"]
2. [Specific task with clear outcome, e.g., "Schedule a 15-minute daily meditation"]
3. [Specific task with clear outcome, e.g., "Draft a new resume section for Y experience"]

I'll create these as check-in tasks so you can track your progress. Sound good?"

Example:
"You've done great work exploring this today. Let's turn these insights into action.

Based on our conversation, here are your action steps:
1. Schedule 15 minutes each morning to plan your day and set your top 3 priorities
2. Create a 'brain dump' document for all the tasks swirling in your mind - get them out of your head
3. Set a daily phone alarm at 9 PM to prepare tomorrow's outfit and pack lunches

I'll create these as check-in tasks so you can track progress and we can follow up."
` : isInitialSession ? `
INITIAL SESSION (First few exchanges, typically 1-3 user turns within this category, conversationDepth < 3):
1. Lead with GUIDANCE, teaching, or frameworks (120-150 words).
2. Provide concrete strategies and actionable advice.
3. Ask questions ONLY when they unlock insight (20-30% of responses).
4. After 3 user turns (conversationDepth=3 for user message, next AI message will use 'TIME TO CREATE ACTION TASKS'), offer to create action tasks related to the discussion. This is handled by 'shouldAIPromptForTasks' in the next turn if appropriate.
` : `
ONGOING SESSION (After initial coaching, conversationDepth >= 4 and not explicitly prompting for tasks):
1. Provide focused guidance (80-120 words).
2. If analysis.suggest_wrapping is true, gracefully offer to wrap up with tasks or allow them to continue: "We've covered a lot. Would you like me to suggest some action steps to work on, or is there something else on your mind?" (The "action steps" part will be handled by 'shouldAIPromptForTasks' for the next turn, otherwise, provide guidance).
3. If not suggesting tasks or wrapping up, provide one more round of focused guidance.
`}

STYLE ADAPTATION:
${currentPreferredStyle === 'gentle' ? 'Be warm and encouraging while providing clear guidance' : ''}
${currentPreferredStyle === 'direct' ? 'Be straightforward and candid with clear direction' : ''}
${currentPreferredStyle === 'motivational' ? 'Be energizing and inspiring while giving concrete steps' : ''}
${currentPreferredStyle === 'analytical' ? 'Be structured and systematic with frameworks' : ''}

CONVERSATION MANAGEMENT RULES:
- For task check-ins: Keep response brief (60-100 words), ONE question max.
- If client has clarity and it's time for action: Offer to wrap up with tasks.
- Let client drive deeper exploration, don't force it.
- Natural endings are good - productivity over endless conversation.

RULES:
- NEVER claim to be the actual deceased person
- NEVER make up memories or experiences not shared by the user
- NEVER minimize their pain or rush their process
- NEVER diagnose mental health conditions
- IF crisis signs appear: "I'm concerned about what you're sharing. Please reach out to a crisis line (988) or trusted person immediately. You deserve immediate support."

Your response:`
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: coachResponse,
        timestamp: new Date().toISOString(),
        category: messageCategory,
        analysis: messageAnalysis,
        conversationDepth: conversationDepth + 1 // Reflects the depth after this AI response
      };

      setMessages(prev => [...prev, aiMessage]);

      await JournalEntry.create({
        content: userMessage.content,
        agent_type: 'life_coach',
        ai_response: aiMessage.content,
        tags: ['coaching', 'growth', messageCategory]
      });

      setLastCheckIns(prev => ({ ...prev, [messageCategory]: new Date().toISOString() }));

      // Parse tasks from response if suggested (regardless of shouldAIPromptForTasks, for robustness)
      const taskPattern = /\d+\.\s+([^\n]+)/g; // Matches "1. Task title"
      const taskMatches = aiMessage.content.match(taskPattern);

      if (taskMatches && taskMatches.length > 0) {
        const parsedTasks = taskMatches.map(match => {
          const taskText = match.replace(/^\d+\.\s+/, '').trim();
          return {
            title: taskText.length > 60 ? taskText.substring(0, 60) + '...' : taskText,
            description: taskText,
            category: messageCategory,
            priority: 'medium',
            tags: ['life-coach-goal'],
            estimated_duration: 30
          };
        });
        setSuggestedTasks(parsedTasks);
      }

      // If this is a task check-in, mark the task as completed
      if (isTaskCheckIn && taskId) {
        try {
          await Task.update(taskId, { status: 'completed' });
          await loadCoachedTasks(); // Reload tasks to remove completed one
        } catch (error) {
          console.error("Error completing task:", error);
        }
      }

      if (appSettings.gamification_enabled) {
          const categoryInfo = coachingCategories.find(c => c.id === messageCategory);
          const xpGained = 20 + (categoryInfo?.xpBonus || 0);

          setPlayerStats(prev => {
            const newStats = {
              ...prev,
              conversationCount: prev.conversationCount + 1,
              categoriesExplored: prev.categoriesExplored.includes(messageCategory)
                ? prev.categoriesExplored
                : [...prev.categoriesExplored, messageCategory]
            };
            User.updateMyUserData({ coaching_stats: newStats })
              .catch(err => console.error("Failed to update user coaching stats on conversation:", err));
            checkAchievements(newStats);
            return newStats;
          });
          await awardXP(xpGained, `Coaching session in ${categoryInfo?.label}`);
      }

      playSound('success');

    } catch (error) {
      console.error("Error getting coach response:", error);
      playSound('error');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having a moment of connection trouble. Let's pause and try that again - what you're sharing is important.",
        timestamp: new Date().toISOString(),
        category: messageCategory
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [
    currentInput, selectedCategory, user, coachingSettings.preferred_coaching_style,
    coachingCategories, messages, appSettings.gamification_enabled, awardXP, checkAchievements, loadCoachedTasks
  ]);

  const handleSetupComplete = useCallback(async () => {
    if (!lifeGoals.some(goal => goal.trim())) return;

    setIsProcessing(true);
    try {
      await User.updateMyUserData({
        life_coach_setup_completed: true,
        life_goals: lifeGoals.filter(goal => goal.trim()),
        current_challenges: currentChallenges.filter(challenge => challenge.trim()),
        preferred_coaching_style: preferredStyle
      });

      setCoachingSettings(prev => ({...prev, preferred_coaching_style: preferredStyle}));
      setIsSetupComplete(true);
      setShowSetup(false);

      await sendMessage({
        messageContent: "I just set up my life coach and I'm ready to work on my goals and overcome my challenges.",
        messageCategory: "personal_growth"
      });
    } catch (error) {
      console.error("Error completing life coach setup", error);
    }
    setIsProcessing(false);
  }, [lifeGoals, currentChallenges, preferredStyle, sendMessage]);

  const handleAddTask = useCallback(async (suggestedTask) => {
      try {
        await Task.create({
            title: suggestedTask.title,
            description: suggestedTask.description,
            priority: suggestedTask.priority,
            category: suggestedTask.category,
            estimated_duration: suggestedTask.estimated_duration,
            reminder_enabled: true,
            tags: ['life-coach-goal'],
            status: 'pending',
            ai_generated: true,
        });
        setSuggestedTasks(prev => prev.filter(t => t.title !== suggestedTask.title));
        loadCoachedTasks();

        if (appSettings.gamification_enabled) {
            setPlayerStats(prev => {
              const newStats = {
                ...prev,
                tasksAccepted: prev.tasksAccepted + 1
              };
              User.updateMyUserData({ coaching_stats: newStats })
                .catch(err => console.error("Failed to update user coaching stats on task add:", err));
              checkAchievements(newStats);
              return newStats;
            });
            await awardXP(15, "Accepted coach suggestion");
        }
      } catch(error) {
          console.error("Error adding task:", error);
      }
  }, [loadCoachedTasks, checkAchievements, awardXP, appSettings.gamification_enabled]);

  const handleRejectTask = useCallback((suggestedTask) => {
    setSuggestedTasks(prev => prev.filter(t => t.title !== suggestedTask.title));
  }, []);

  const handleRecording = useCallback(() => {
    if (!recognition) return alert("Speech recognition not supported.");
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      if (appSettings.gamification_enabled) {
          setPlayerStats(prev => {
            const newStats = {
              ...prev,
              voiceUsageCount: prev.voiceUsageCount + 1
            };
            User.updateMyUserData({ coaching_stats: newStats })
              .catch(err => console.error("Failed to update user coaching stats on voice use:", err));
            checkAchievements(newStats);
            return newStats;
          });
      }
    }
    setIsRecording(!isRecording);
  }, [isRecording, checkAchievements, appSettings.gamification_enabled]);

  const speakText = useCallback((text, entryId) => {
    if (!window.speechSynthesis) {
      console.log("Speech synthesis not supported in this browser");
      return;
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log("No text to speak");
      return;
    }

    try {
      if (speakingEntryId === entryId) {
        window.speechSynthesis.cancel();
        setSpeakingEntryId(null);
        return;
      }

      window.speechSynthesis.cancel();

      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text.trim());

          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;

          utterance.onstart = () => {
            setSpeakingEntryId(entryId);
          };

          utterance.onend = () => {
            setSpeakingEntryId(null);
          };

          utterance.onerror = (event) => {
            console.log("Speech synthesis error (handled):", event.error);
            setSpeakingEntryId(null);
          };

          if (window.speechSynthesis && !window.speechSynthesis.speaking) {
            window.speechSynthesis.speak(utterance);
          }
        } catch (innerError) {
          console.log("Error creating speech utterance:", innerError);
          setSpeakingEntryId(null);
        }
      }, 100);

    } catch (error) {
      console.log("Speech synthesis error:", error);
      setSpeakingEntryId(null);
    }
  }, [speakingEntryId]);

  const handleCheckIn = useCallback(async (task) => {
      setSelectedCategory(task.category);
      
      // Auto-send check-in message
      await sendMessage({
        messageContent: `Checking in on my goal: "${task.title}". I'm reflecting on my progress and any challenges I've faced.`,
        messageCategory: task.category,
        isTaskCheckIn: true,
        taskId: task.id
      });
  }, [sendMessage]);

  const handleSaveSettings = async () => {
    try {
      await User.updateMyUserData({
        app_settings: appSettings,
        preferred_coaching_style: coachingSettings.preferred_coaching_style,
        coaching_reminders_enabled: remindersEnabled
      });
      setShowSettingsModal(false);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (showSetup) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Set Up Your AI Life Coach
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Get personalized guidance for your life goals and challenges
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">What are your main life goals?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  These could be career, personal, health, relationship, or financial goals
                </p>
                <div className="space-y-2">
                  {lifeGoals.map((goal, index) => (
                    <Input
                      key={index}
                      placeholder={`Goal #${index + 1}...`}
                      value={goal}
                      onChange={(e) => {
                        const newGoals = [...lifeGoals];
                        newGoals[index] = e.target.value;
                        setLifeGoals(newGoals);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">What challenges are you facing?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  What obstacles or difficulties would you like help overcoming?
                </p>
                <div className="space-y-2">
                  {currentChallenges.map((challenge, index) => (
                    <Input
                      key={index}
                      placeholder={`Challenge #${index + 1}...`}
                      value={challenge}
                      onChange={(e) => {
                        const newChallenges = [...currentChallenges];
                        newChallenges[index] = e.target.value;
                        setCurrentChallenges(newChallenges);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How would you like to be coached?</h3>
                <Select value={preferredStyle} onValueChange={setPreferredStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your preferred coaching style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle">Gentle & Supportive - Encouraging and patient approach</SelectItem>
                    <SelectItem value="direct">Direct & Straightforward - Clear, no-nonsense advice</SelectItem>
                    <SelectItem value="motivational">Motivational & Energetic - Inspiring and uplifting</SelectItem>
                    <SelectItem value="analytical">Analytical & Logical - Data-driven and systematic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSetupComplete}
                disabled={!lifeGoals.some(goal => goal.trim()) || isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your coach...
                  </div>
                ) : (
                  "Start My Life Coaching"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate
      featureKey="life_coaches"
      featureName="Life Coach"
      featureDescription="Get personalized AI guidance for goal-setting, planning, and personal growth on your journey."
    >
      <SEO 
        title="AI Life Coach - Helper33 | Personal Growth & Goal Achievement"
        description="Get personalized AI life coaching for goal setting, personal development, and life transitions. Track progress, build habits, and achieve your dreams with compassionate AI guidance."
        keywords="life coach, AI coaching, personal growth, goal setting, life transitions, personal development, motivation, achievement, life guidance, career coaching, self-improvement, success coach"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 theme-${appSettings.theme} flex flex-col">
         <style>{`
          :root {
            --theme-primary-fg: 22 163 74;
            --theme-primary-bg: 240 253 244;
            --theme-gradient-from: #22c55e;
            --theme-gradient-to: #10b981;
            --theme-gradient-text-color: #fff;
          }
          .theme-default { }
          .theme-serene_blue {
            --theme-primary-fg: 59 130 246;
            --theme-primary-bg: 239 246 255;
            --theme-gradient-from: #3b82f6;
            --theme-gradient-to: #60a5fa;
            --theme-gradient-text-color: #fff;
          }
          .theme-warm_sunset {
            --theme-primary-fg: 249 115 22;
            --theme-primary-bg: 255 251 235;
            --theme-gradient-from: #f97316;
            --theme-gradient-to: #fbbf24;
            --theme-gradient-text-color: #fff;
          }
          .theme-forest_green {
            --theme-primary-fg: 22 101 52;
            --theme-primary-bg: 240 253 244;
            --theme-gradient-from: #16a34a;
            --theme-gradient-to: #15803d;
            --theme-gradient-text-color: #fff;
          }
          .theme-royal_purple {
            --theme-primary-fg: 126 34 206;
            --theme-primary-bg: 250 245 255;
            --theme-gradient-from: #a855f7;
            --theme-gradient-to: #c084fc;
            --theme-gradient-text-color: #fff;
          }
          .theme-text-primary { color: rgb(var(--theme-primary-fg)); }
          .theme-bg-primary { background-color: rgb(var(--theme-primary-fg)); }
          .theme-border-primary { border-color: rgb(var(--theme-primary-fg)); }
          .theme-gradient { 
            background-image: linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to)); 
            color: var(--theme-gradient-text-color);
          }
        `}</style>
        
        <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personalize Your Coach</DialogTitle>
              <DialogDescription>
                Adjust your coaching experience to fit your preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label>Enable Game Features</Label>
                  <p className="text-xs text-muted-foreground">
                    Turn on/off levels, XP, and achievements.
                  </p>
                </div>
                <Switch
                  checked={appSettings.gamification_enabled}
                  onCheckedChange={(checked) => setAppSettings(prev => ({...prev, gamification_enabled: checked}))}
                />
              </div>

              <div className="space-y-2">
                <Label>Color Theme</Label>
                <Select value={appSettings.theme} onValueChange={(value) => setAppSettings(prev => ({...prev, theme: value}))}>
                  <SelectTrigger><SelectValue placeholder="Select a theme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Green</SelectItem>
                    <SelectItem value="serene_blue">Serene Blue</SelectItem>
                    <SelectItem value="warm_sunset">Warm Sunset</SelectItem>
                    <SelectItem value="forest_green">Forest Green</SelectItem>
                    <SelectItem value="royal_purple">Royal Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coaching Style</Label>
                <Select value={coachingSettings.preferred_coaching_style} onValueChange={(value) => setCoachingSettings(prev => ({...prev, preferred_coaching_style: value}))}>
                  <SelectTrigger><SelectValue placeholder="Select coaching style" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="gentle">Gentle & Supportive</SelectItem>
                      <SelectItem value="direct">Direct & Straightforward</SelectItem>
                      <SelectItem value="motivational">Motivational & Energetic</SelectItem>
                      <SelectItem value="analytical">Analytical & Logical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Notification Preference</Label>
                <Select value={appSettings.notification_preference} onValueChange={(value) => setAppSettings(prev => ({...prev, notification_preference: value}))}>
                  <SelectTrigger><SelectValue placeholder="Select notification preference" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="minimal">Key Updates Only</SelectItem>
                      <SelectItem value="none">No Notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-blue-50 border-blue-200">
                <div className="space-y-0.5">
                  <Label htmlFor="reminders-switch" className="text-blue-900 font-semibold">Check-in Reminders</Label>
                  <p className="text-xs text-blue-700">
                    Get notified when it's time to check in on your growth areas (every 3 days).
                  </p>
                </div>
                <Switch
                  id="reminders-switch"
                  checked={remindersEnabled}
                  onCheckedChange={setRemindersEnabled}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsModal(false)}>Cancel</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {appSettings.gamification_enabled && (
          <AnimatePresence>
            {showLevelUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className="theme-gradient text-white rounded-3xl p-8 text-center shadow-2xl">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2 }}
                  >
                    <Rocket className="w-16 h-16 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-2">LEVEL UP!</h3>
                  <p className="text-xl">You're now Level {playerStats.level}!</p>
                  <p className="text-lg opacity-90">{levelTitles[Math.min(playerStats.level - 1, levelTitles.length - 1)]}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {appSettings.gamification_enabled && (
            <AnimatePresence>
                {showAchievement && (
                    <motion.div
                      initial={{ opacity: 0, x: 300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 300 }}
                      className="fixed top-4 right-4 z-50"
                    >
                      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 shadow-2xl">
                        <div className="flex items-center gap-3">
                          <showAchievement.icon className="w-8 h-8" />
                          <div>
                            <div className="font-bold">Achievement Unlocked!</div>
                            <div className="text-sm">{showAchievement.title}</div>
                            <div className="text-xs opacity-90">+{showAchievement.points} XP</div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        )}

        <header className="py-4 px-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">AI Life Coach</h1>
          <p className="text-gray-600">Your partner in personal growth and transformation</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto px-4 pb-4 flex-1 overflow-auto">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-1.5 mb-6">
            <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-lg transition-all">
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white rounded-lg transition-all">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            {/* Mobile Microphone Reminder */}
            {isMobile && !selectedCategory && activeTab === 'chat' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-3"
              >
                <Alert className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300">
                  <Mic className="h-5 w-5 text-indigo-600 animate-pulse" />
                  <AlertDescription className="text-sm text-indigo-900 font-semibold">
                    💬 <strong>Tap the microphone icon</strong> to speak with your life coach using voice
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <NotificationDisabledBanner compact />

            <div className="text-center mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10"></div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-blue-100">
                  <Target className="w-4 h-4 theme-text-primary" />
                  <span className="text-sm font-medium theme-text-primary">AI Life Coach</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSettingsModal(true)}>
                    <Settings className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Your Personal Life Coaching Adventure
              </h1>
              <p className="text-gray-600 mb-6">
                {appSettings.gamification_enabled
                  ? "Level up your life with personalized guidance and earn XP for growth!"
                  : "Get personalized guidance for your life's journey."}
              </p>

              {appSettings.gamification_enabled && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-4 gap-4 mb-8"
                >
                  <Card className="theme-gradient text-white">
                    <CardContent className="p-4 text-center">
                      <Crown className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{playerStats.level}</div>
                      <div className="text-sm opacity-90">{levelTitles[Math.min(playerStats.level - 1, levelTitles.length - 1)]}</div>
                    </CardContent>
                  </Card>

                  <Card className="theme-gradient text-white">
                    <CardContent className="p-4 text-center">
                      <Zap className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{playerStats.xp}</div>
                      <div className="text-sm opacity-90">Total XP</div>
                    </CardContent>
                  </Card>

                  <Card className="theme-gradient text-white">
                    <CardContent className="p-4 text-center">
                      <Flame className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{playerStats.streak}</div>
                      <div className="text-sm opacity-90">Day Streak</div>
                    </CardContent>
                  </Card>

                  <Card className="theme-gradient text-white">
                    <CardContent className="p-4 text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{playerStats.unlockedAchievements.length}</div>
                      <div className="text-sm opacity-90">Achievements</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {appSettings.gamification_enabled && (
                <Card className="bg-white/80 backdrop-blur-sm mb-8">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress to Level {playerStats.level + 1}</span>
                      <span className="text-sm text-gray-600">
                        {playerStats.xp % 100}/{getXPForNextLevel(playerStats.level)}
                      </span>
                    </div>
                    <Progress
                      value={(playerStats.xp % 100) / getXPForNextLevel(playerStats.level) * 100}
                      className="h-3"
                      indicatorClassName="theme-bg-primary"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
            
            {!selectedCategory ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  {appSettings.gamification_enabled ? "Choose Your Growth Quest! 🎮" : "Choose Your Focus Area"}
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  💡 Categories with a pulse need your attention - check in every 3 days to stay on track!
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {coachingCategories.map((category) => {
                    const checkInNeeded = checkIfNeedsCheckIn(category.id);
                    const daysSince = getDaysSinceCheckIn(category.id);
                    const isExplored = playerStats.categoriesExplored.includes(category.id);
                    
                    return (
                      <motion.div
                        key={category.id}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        {checkInNeeded && isExplored && (
                          <motion.div
                            className="absolute -top-2 -right-2 z-10"
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                              Check-in Due!
                            </Badge>
                          </motion.div>
                        )}
                        
                        <Card
                          className={`bg-white/60 backdrop-blur-sm border-0 hover:bg-white/80 transition-all cursor-pointer shadow-lg hover:shadow-xl ${checkInNeeded && isExplored ? 'ring-2 ring-red-400 animate-pulse' : ''}`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <CardContent className="p-6 text-center relative overflow-hidden">
                            {appSettings.gamification_enabled && (
                              <Badge className="absolute top-2 right-2 theme-bg-primary text-white">
                                +{category.xpBonus} XP
                              </Badge>
                            )}

                            <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                              <category.icon className="w-6 h-6 text-white" />
                            </div>
                            
                            <h3 className="font-semibold text-gray-800 text-sm mb-2">{category.label}</h3>
                            <p className="text-xs text-gray-600 mb-3">{category.description}</p>

                            <div className="flex flex-col gap-1">
                              {isExplored ? (
                                <>
                                  {checkInNeeded ? (
                                    <div className="flex items-center justify-center gap-1 text-xs text-red-600 font-semibold">
                                      <Heart className="w-3 h-3 animate-pulse" fill="currentColor" />
                                      {daysSince !== null ? `${daysSince} days ago` : 'Time to check in!'}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                                      <CheckCircle className="w-3 h-3" />
                                      {daysSince !== null ? `Checked in ${daysSince} day${daysSince !== 1 ? 's' : ''} ago` : 'Up to date'}
                                    </div>
                                  )}
                                </>
                              ) : (
                                appSettings.gamification_enabled && (
                                  <div className="flex items-center justify-center gap-1 text-xs theme-text-primary">
                                    <Sparkles className="w-3 h-3" />
                                    New Quest
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-500" />
                            {coachingCategories.find(c => c.id === selectedCategory)?.label} Coaching
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedCategory(null);
                                setSuggestedTasks([]);
                            }}
                          >
                            Change Area
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                          {messages.length > 0 ? (
                            messages.filter(msg => msg.category === selectedCategory).map((message, index, array) => {
                              const isLastMessage = index === array.length - 1;
                              const showContinuePrompt = isLastMessage && message.type === 'ai' && message.conversationDepth >= 4;
                              
                              return (
                                <React.Fragment key={message.id}>
                                  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                                    {/* Coach Avatar */}
                                    {message.type === 'ai' && (
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                          <Brain className="w-6 h-6 text-white" />
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                                      message.type === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                                        : 'bg-white text-gray-800 border border-gray-100'
                                    }`}>
                                      {message.type === 'ai' && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                          <Sparkles className="w-4 h-4 text-blue-500" />
                                          <span className="text-xs font-semibold text-blue-600">Your Life Coach</span>
                                        </div>
                                      )}
                                      
                                      <div className="whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                      </div>
                                      
                                      {message.type === 'ai' && (
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                          <div className="text-xs text-gray-500">
                                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => speakText(message.content, message.id)}
                                            className="text-gray-500 hover:text-gray-700 h-7 px-2"
                                          >
                                            {speakingEntryId === message.id ? (
                                              <StopCircle className="w-4 h-4" />
                                            ) : (
                                              <Volume2 className="w-4 h-4" />
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                      
                                      {message.type === 'user' && (
                                        <div className="text-xs mt-2 text-blue-100">
                                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* User Avatar */}
                                    {message.type === 'user' && (
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg text-white font-bold text-sm">
                                          {user?.full_name?.charAt(0) || 'U'}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Continue Conversation Prompt */}
                                  {showContinuePrompt && !isTyping && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex justify-center"
                                    >
                                      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                                        <CardContent className="p-4 text-center">
                                          <p className="text-sm text-gray-700 mb-3">
                                            We've covered a lot. What would you like to do?
                                          </p>
                                          <div className="flex gap-2 justify-center">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => setCurrentInput("I'd like to continue exploring this topic...")}
                                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                            >
                                              <MessageSquare className="w-4 h-4 mr-2" />
                                              Continue Talking
                                            </Button>
                                            <Button
                                              size="sm"
                                              onClick={() => setCurrentInput("Can you suggest some action tasks based on what we discussed?")}
                                              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                            >
                                              <CheckCircle className="w-4 h-4 mr-2" />
                                              Get Action Tasks
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  )}
                                </React.Fragment>
                              );
                            })
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl">
                                <Brain className="w-12 h-12 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Life Coach is Ready</h3>
                              <p className="text-gray-600">Share what's on your mind and let's work through it together.</p>
                            </div>
                          )}
                          {isTyping && (
                            <div className="flex justify-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse">
                                  <Brain className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="max-w-[70%] p-4 rounded-2xl bg-white text-gray-800 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                  <span className="text-sm text-gray-600">Coach is thinking...</span>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </CardContent>
                    </Card>

                    {suggestedTasks.length > 0 && (
                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    Coach's Action Tasks for You
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-2">
                                    Review and approve the tasks you want to work on. You'll get check-in reminders to track your progress.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {suggestedTasks.map((task, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 bg-white rounded-lg shadow-sm border border-blue-100"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
                                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Badge variant="outline" className="text-xs capitalize">
                                                        {task.priority} priority
                                                    </Badge>
                                                    {task.estimated_duration && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {task.estimated_duration} min
                                                        </Badge>
                                                    )}
                                                    <Badge className="text-xs bg-blue-100 text-blue-700">
                                                        {coachingCategories.find(c => c.id === task.category)?.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRejectTask(task)}
                                                    className="text-gray-600 border-gray-300 hover:bg-gray-100"
                                                >
                                                    Skip
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddTask(task)}
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                  </div>

                  {/* Sidebar with Active Coached Tasks */}
                  <div className="space-y-8">
                    {coachedTasks.length > 0 && (
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-green-600" />
                                    Active Goals
                                </CardTitle>
                                <p className="text-xs text-gray-500 mt-1">
                                    Check in with your coach on your progress
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {coachedTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
                                    >
                                        <div className="flex items-start gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm text-gray-800 leading-tight">{task.title}</h4>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {task.priority}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCheckIn(task)}
                                                className="text-xs h-7 px-2 bg-white hover:bg-green-50 border-green-300"
                                            >
                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                Check In
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Tips Card */}
                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-1">Pro Tip</h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Check in with your coach every 3 days on your growth areas to maintain momentum and get personalized guidance.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl min-h-[calc(100vh-220px)] space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Transformation Tools</h2>
                <p className="text-gray-600">AI-powered tools for personal growth and clarity</p>
              </div>

              <MeditationScriptGenerator 
                coachType="life_coach"
                userMood={user?.app_settings?.last_mood}
                onSave={() => setActiveTab('favorites')}
              />

              <JournalPromptGenerator 
                coachType="life_coach"
                userMood={user?.app_settings?.last_mood}
                recentEntries={[]}
                onSave={() => setActiveTab('favorites')}
              />

              <ThoughtReframingTool 
                coachType="life_coach"
                userMood={user?.app_settings?.last_mood}
                onSave={() => setActiveTab('favorites')}
              />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl min-h-[calc(100vh-220px)]">
              <GoalsManager coachType="life_coach" />
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl min-h-[calc(100vh-220px)]">
              <SavedInteractions coachType="life_coach" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-lg p-3 md:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-2">
              <Label htmlFor="currentInput" className="sr-only">
                Your message
              </Label>
              <Textarea
                id="currentInput"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={selectedCategory ? `Share your thoughts about ${coachingCategories.find(c => c.id === selectedCategory)?.label.toLowerCase()}...` : "What's on your mind today?"}
                className="flex-1 bg-transparent border-none resize-none focus-visible:ring-0 text-gray-800 placeholder:text-gray-500 h-auto py-2"
                rows={1}
                disabled={isTyping || isRecording || activeTab !== 'chat'} // Disable if not on chat tab
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRecording}
                className={`rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'hover:bg-gray-200'} ${isMobile ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}
                disabled={isTyping || activeTab !== 'chat'} // Disable if not on chat tab
                title={isRecording ? "Stop recording" : "Tap to speak"}
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => sendMessage()}
                disabled={!currentInput.trim() || isTyping || !selectedCategory || activeTab !== 'chat'} // Disable if not on chat tab
                size="icon"
                className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50"
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            
            {/* Mobile Voice Tip */}
            {isMobile && !isRecording && activeTab === 'chat' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-indigo-600 mt-2 font-medium"
              >
                👆 Tap the highlighted microphone to speak
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
