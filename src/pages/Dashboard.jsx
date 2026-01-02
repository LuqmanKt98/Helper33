import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils/index";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  Calendar,
  Activity,
  Users,
  Sparkles,
  Target,
  BrainCircuit,
  UtensilsCrossed,
  Baby,
  Briefcase,
  BookHeart,
  CheckSquare,
  PenTool,
  Palette,
  Trophy,
  MessageCircle,
  Crown,
  Shield,
  Search,
  ArrowRight,
  Zap,
  Layout,
  GraduationCap,
  Flame,
  TrendingUp,
  Smile,
  BarChart3,
  Star,
  Grid3x3,
  List,
  ChevronDown,
  Lock,
  HeartHandshake,
  ShoppingBag,
  Laptop,
  Compass,
  Coffee,
  Gamepad2,
  Languages,
  CreditCard,
  Settings,
  X,
  Check
} from "lucide-react";
import SEO from '@/components/SEO';
import { useTranslation } from '@/components/Translations';
import { toast } from 'sonner';

// Subscription Tier Configuration
const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    features: new Set([
      'Home', 'Dashboard', 'About', 'Blog', 'Account', 'Profile', 'Security',
      'IntegrationsHub', 'Messages', 'Notifications', 'CrisisHub',
      'GriefCoach', 'Community', 'CommunityHub', 'SocialFeed', 'Events',
      'Challenges', 'HeartfulHolidays', 'FeedbackSurvey', 'SupportUs',
      'PrivacyPolicy', 'TermsOfService', 'LegalDisclaimer', 'ExportData',
      'CommunityForum', 'Discover'
    ])
  },
  basic: {
    name: 'Basic',
    color: 'from-blue-500 to-cyan-500',
    features: new Set([
      'LifeCoach', 'MindfulnessHub', 'Organizer', 'JournalStudio',
      'VisionBoard', 'MemoryVault', 'PlannersHub', 'Year2026Hub',
      'GentleFlowPlanner', 'ScheduleTemplates', 'LifeTemplates',
      'HeartShiftJournal', 'GratitudeJournal', 'JournalHistory',
      'MindfulTools', 'MindfulGames', 'SafePlace', 'MindfulExercises',
      'ExercisePlayer', 'InfinityJournal', 'CoachingMatcher',
      'CoachingProgress', 'WellnessPlans', 'InfinityBook'
    ])
  },
  pro: {
    name: 'Pro',
    color: 'from-purple-500 to-pink-500',
    features: new Set([
      'Wellness', 'WellnessTools', 'Family', 'FamilyAccess', 'MealPlanner',
      'WomensHealthHub', 'HomeworkHub', 'KidsCreativeStudio', 'ParentDashboard',
      'KnowledgeQuest', 'StoryHub', 'BookStudio', 'AppSearch',
      'JigsawPuzzle', 'SoulLink', 'GamificationDashboard', 'BeyondRoutines',
      'TeaIsLife', 'TranslatorHub', 'BuddySystem', 'SupportCircles',
      'SubscriptionTracker'
    ])
  },
  executive: {
    name: 'Executive',
    color: 'from-orange-500 to-red-500',
    features: new Set([
      'FindPractitioners', 'PractitionerDetail', 'BecomePractitioner',
      'PractitionerDashboard', 'ClientPortal', 'CareHub', 'FindCare',
      'BecomeACaregiver', 'CaregiverDashboard', 'PostJob', 'MyApplications',
      'SocialMediaManager', 'Workspace', 'Marketplace', 'SellerDashboard',
      'SellerProfile', 'FindConsultants', 'BrowseClientRequests',
      'ConsultantDashboard', 'BecomeAConsultant', 'ConsultantProfile',
      'AccountManager', 'AppointmentScheduler', 'CoachDashboard',
      'MentorDashboard', 'MentorWelcome', 'PostConsultationRequest',
      'MyConsultationRequests'
    ])
  }
};

// Organized feature categories with ALL features
const FEATURE_CATEGORIES = {
  wellness: {
    title: "Wellness & Mental Health",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    bgColor: "from-rose-50 to-pink-50",
    description: "Track your mental health, mood, and wellness journey with AI-powered support",
    features: [
      { title: "Grief Coach", pageName: "GriefCoach", icon: Heart, description: "AI grief & loss support", longDescription: "Compassionate AI support for processing grief, preserving memories, and healing", color: "from-pink-400 to-rose-400", tier: 'free' },
      { title: "Life Coach", pageName: "LifeCoach", icon: Target, description: "AI life coaching & goals", longDescription: "Set and achieve life goals with personalized AI coaching and motivation", color: "from-purple-400 to-pink-400", tier: 'basic' },
      { title: "Daily Wellness", pageName: "Wellness", icon: Activity, description: "Track mood, sleep & health", longDescription: "Monitor daily wellness with mood tracking, sleep patterns, water intake, and exercise", color: "from-rose-400 to-pink-400", tier: 'pro' },
      { title: "Mindfulness Hub", pageName: "MindfulnessHub", icon: BrainCircuit, description: "Meditation & mindfulness", longDescription: "Practice mindfulness with guided meditations, breathing exercises, and calming activities", color: "from-indigo-400 to-purple-400", tier: 'basic' },
      { title: "Crisis Support", pageName: "CrisisHub", icon: Heart, description: "24/7 crisis resources", longDescription: "Immediate access to crisis resources, emergency contacts, and support networks", color: "from-red-400 to-rose-400", tier: 'free' },
      { title: "Safe Place", pageName: "SafePlace", icon: Heart, description: "Calming sanctuary", longDescription: "Retreat to a peaceful virtual environment for relaxation and stress relief", color: "from-blue-400 to-indigo-400", tier: 'basic' },
      { title: "Mindful Games", pageName: "MindfulGames", icon: Gamepad2, description: "Therapeutic games", longDescription: "Relaxing games for stress relief and mindfulness practice", color: "from-teal-400 to-cyan-400", tier: 'basic' },
      { title: "SoulLink", pageName: "SoulLink", icon: Heart, description: "AI companion & support", longDescription: "Your personal AI companion for daily support and conversations", color: "from-purple-400 to-pink-400", tier: 'pro' },
      { title: "Wellness Plans", pageName: "WellnessPlans", icon: Target, description: "Personalized wellness plans", longDescription: "AI-generated wellness plans tailored to your goals and needs", color: "from-blue-400 to-purple-400", tier: 'basic' },
      { title: "Spiritual Hub", pageName: "SpiritualHub", icon: BookHeart, description: "Spiritual literature & growth", longDescription: "Explore spiritual books, set reading goals, and get AI-powered book recommendations", color: "from-violet-400 to-purple-400", tier: 'basic' },
      { title: "Wellness Shop", pageName: "WellnessShop", icon: ShoppingBag, description: "Wellness tools & printables", longDescription: "Shop coloring books, journals, meditation tools, and premium wellness resources", color: "from-teal-400 to-cyan-400", tier: 'free' }
    ]
  },
  family: {
    title: "Family & Home",
    icon: Users,
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-50 to-purple-50",
    description: "Organize family life, manage schedules, and keep everyone connected",
    features: [
      { title: "Life Organizer", pageName: "Organizer", icon: CheckSquare, description: "Tasks & habits", longDescription: "Manage tasks, build habits, and organize your daily life efficiently", color: "from-emerald-400 to-teal-400", tier: 'basic' },
      { title: "Family Hub", pageName: "Family", icon: Users, description: "Family calendar & tasks", longDescription: "Central hub for family schedules, shared tasks, and event coordination", color: "from-violet-400 to-purple-400", tier: 'pro' },
      { title: "Meal Planner", pageName: "MealPlanner", icon: UtensilsCrossed, description: "AI meal planning", longDescription: "Plan weekly meals, generate shopping lists, and discover recipes with AI", color: "from-orange-400 to-amber-400", tier: 'pro' },
      { title: "Women's Health", pageName: "WomensHealthHub", icon: Heart, description: "Women's wellness", longDescription: "Track menstrual cycles, fertility, pregnancy, and women's health milestones", color: "from-pink-400 to-rose-400", tier: 'pro' },
      { title: "Year 2026 Planner", pageName: "Year2026Hub", icon: Target, description: "Year planning & goals", longDescription: "Plan your entire 2026 with goal setting, tracking, and AI guidance", color: "from-purple-400 to-indigo-400", tier: 'basic' },
      { title: "Gentle Flow Planner", pageName: "GentleFlowPlanner", icon: Calendar, description: "Gentle daily planning", longDescription: "Stress-free daily planning with a gentle, therapeutic approach", color: "from-blue-400 to-cyan-400", tier: 'basic' }
    ]
  },
  learning: {
    title: "Learning & Growth",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    description: "Educational tools and AI tutoring for learners of all ages",
    features: [
      { title: "Homework Hub", pageName: "HomeworkHub", icon: GraduationCap, description: "AI homework help", longDescription: "Get step-by-step homework help, explanations, and study support from AI", color: "from-blue-400 to-cyan-400", tier: 'pro' },
      { title: "Kids Studio", pageName: "KidsCreativeStudio", icon: Baby, description: "Safe learning games", longDescription: "Age-appropriate games, creative tools, and educational content for children", color: "from-green-400 to-emerald-400", tier: 'pro' },
      { title: "Knowledge Quest", pageName: "KnowledgeQuest", icon: Trophy, description: "Educational gaming", longDescription: "Learn through interactive games, quizzes, and engaging educational challenges", color: "from-cyan-400 to-blue-400", tier: 'pro' },
      { title: "Parent Dashboard", pageName: "ParentDashboard", icon: Users, description: "Track kids progress", longDescription: "Monitor your children's learning progress and activities", color: "from-purple-400 to-pink-400", tier: 'pro' }
    ]
  },
  creative: {
    title: "Creative & Journaling",
    icon: PenTool,
    color: "from-purple-500 to-indigo-500",
    bgColor: "from-purple-50 to-indigo-50",
    description: "Express yourself through journaling, memories, and creative tools",
    features: [
      { title: "Journal Studio", pageName: "JournalStudio", icon: PenTool, description: "AI-powered journaling", longDescription: "Daily journaling with AI prompts, mood tracking, and reflection guidance", color: "from-purple-400 to-indigo-400", tier: 'basic' },
      { title: "Memory Vault", pageName: "MemoryVault", icon: BookHeart, description: "Store precious memories", longDescription: "Preserve photos, stories, and special moments in your digital memory vault", color: "from-pink-400 to-purple-400", tier: 'basic' },
      { title: "Vision Board", pageName: "VisionBoard", icon: Palette, description: "Visualize your goals", longDescription: "Create visual representations of your dreams and goals for manifestation", color: "from-indigo-400 to-blue-400", tier: 'basic' },
      { title: "Book Studio", pageName: "BookStudio", icon: BookHeart, description: "Therapeutic books", longDescription: "Access Ruby's therapeutic books designed for healing and personal growth", color: "from-violet-400 to-purple-400", tier: 'executive' },
      { title: "Infinity Journal", pageName: "InfinityJournal", icon: PenTool, description: "Premium journaling", longDescription: "Advanced AI-powered journaling with deep insights and analysis", color: "from-purple-400 to-pink-400", tier: 'basic' },
      { title: "HeartShift Journal", pageName: "HeartShiftJournal", icon: Heart, description: "Emotional healing journal", longDescription: "Journal focused on emotional transformation and heart-centered healing", color: "from-rose-400 to-pink-400", tier: 'basic' },
      { title: "Gratitude Journal", pageName: "GratitudeJournal", icon: Heart, description: "Daily gratitude practice", longDescription: "Build gratitude habits with daily prompts and reflection", color: "from-amber-400 to-orange-400", tier: 'basic' },
      { title: "Story Hub", pageName: "StoryHub", icon: BookHeart, description: "Share your stories", longDescription: "Create and share personal stories and experiences", color: "from-indigo-400 to-purple-400", tier: 'pro' }
    ]
  },
  social: {
    title: "Community & Social",
    icon: MessageCircle,
    color: "from-indigo-500 to-blue-500",
    bgColor: "from-indigo-50 to-blue-50",
    description: "Connect with others, join challenges, and build supportive communities",
    features: [
      { title: "Social Feed", pageName: "SocialFeed", icon: MessageCircle, description: "Connect with community", longDescription: "Share updates, support others, and engage with the Helper33 community", color: "from-blue-400 to-indigo-400", tier: 'free' },
      { title: "Community Hub", pageName: "Community", icon: Users, description: "Support circles", longDescription: "Join support groups, find accountability partners, and build connections", color: "from-indigo-400 to-purple-400", tier: 'free' },
      { title: "Challenges", pageName: "Challenges", icon: Trophy, description: "Wellness challenges", longDescription: "Participate in group challenges for wellness, habits, and personal growth", color: "from-purple-400 to-pink-400", tier: 'free' },
      { title: "Events", pageName: "Events", icon: Calendar, description: "Community events", longDescription: "Join live events, workshops, and community gatherings", color: "from-cyan-400 to-blue-400", tier: 'free' },
      { title: "Community Forum", pageName: "CommunityForum", icon: MessageCircle, description: "Discussion forums", longDescription: "Engage in meaningful discussions with the community", color: "from-blue-400 to-indigo-400", tier: 'free' },
      { title: "Discover", pageName: "Discover", icon: Compass, description: "Explore content", longDescription: "Discover inspiring content, news, and community highlights", color: "from-teal-400 to-cyan-400", tier: 'free' }
    ]
  },
  providers: {
    title: "Healthcare & Services",
    icon: Shield,
    color: "from-teal-500 to-cyan-500",
    bgColor: "from-teal-50 to-cyan-50",
    description: "Connect with healthcare providers and professional caregiving services",
    features: [
      { title: "Find Practitioners", pageName: "FindPractitioners", icon: HeartHandshake, description: "Licensed therapists", longDescription: "Search and connect with licensed therapists, counselors, and mental health professionals", color: "from-teal-400 to-cyan-400", tier: 'executive' },
      { title: "Practitioner Portal", pageName: "PractitionerDashboard", icon: Shield, description: "Provider dashboard", longDescription: "Manage your practice, appointments, and client communications", color: "from-cyan-400 to-blue-400", tier: 'executive' },
      { title: "Client Portal", pageName: "ClientPortal", icon: Calendar, description: "Manage appointments", longDescription: "Book appointments, message providers, and track your healthcare journey", color: "from-indigo-400 to-purple-400", tier: 'executive' },
      { title: "Care Hub", pageName: "CareHub", icon: HeartHandshake, description: "Find caregivers", longDescription: "Connect with professional caregivers for home care, childcare, and elder care", color: "from-blue-400 to-indigo-400", tier: 'executive' },
      { title: "Become Practitioner", pageName: "BecomePractitioner", icon: Shield, description: "Join as provider", longDescription: "Apply to become a listed mental health practitioner on Helper33", color: "from-purple-400 to-pink-400", tier: 'executive' },
      { title: "Become Caregiver", pageName: "BecomeACaregiver", icon: HeartHandshake, description: "Join as caregiver", longDescription: "Apply to offer professional caregiving services", color: "from-teal-400 to-blue-400", tier: 'executive' }
    ]
  },
  business: {
    title: "Business & Professional",
    icon: Briefcase,
    color: "from-orange-500 to-amber-500",
    bgColor: "from-orange-50 to-amber-50",
    description: "Professional tools for content creation, consulting, and business growth",
    features: [
      { title: "Social Media Manager", pageName: "SocialMediaManager", icon: Sparkles, description: "AI content creation", longDescription: "Create, schedule, and manage social media content with AI assistance", color: "from-orange-400 to-amber-400", tier: 'executive' },
      { title: "Workspace", pageName: "Workspace", icon: Laptop, description: "Document management", longDescription: "Organize documents, scan files, and manage your digital workspace", color: "from-amber-400 to-yellow-400", tier: 'executive' },
      { title: "Marketplace", pageName: "Marketplace", icon: ShoppingBag, description: "Buy & sell services", longDescription: "Offer services, sell courses, or purchase from other creators", color: "from-yellow-400 to-orange-400", tier: 'executive' },
      { title: "Find Consultants", pageName: "FindConsultants", icon: Users, description: "Expert consultations", longDescription: "Connect with expert consultants for professional guidance and support", color: "from-orange-400 to-red-400", tier: 'executive' },
      { title: "Seller Dashboard", pageName: "SellerDashboard", icon: ShoppingBag, description: "Manage your store", longDescription: "Manage products, orders, and sales on the marketplace", color: "from-amber-400 to-orange-400", tier: 'executive' },
      { title: "Consultant Dashboard", pageName: "ConsultantDashboard", icon: Briefcase, description: "Consultant portal", longDescription: "Manage client requests, projects, and consultations", color: "from-blue-400 to-indigo-400", tier: 'executive' },
      { title: "Post Job", pageName: "PostJob", icon: Briefcase, description: "Post job openings", longDescription: "Create job postings for caregivers and service providers", color: "from-teal-400 to-cyan-400", tier: 'executive' }
    ]
  },
  planning: {
    title: "Planning & Organization",
    icon: Calendar,
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50",
    description: "Advanced planning tools and organizational systems",
    features: [
      { title: "Schedule Templates", pageName: "ScheduleTemplates", icon: Calendar, description: "Ready-made schedules", longDescription: "Pre-built schedule templates for different lifestyles and needs", color: "from-emerald-400 to-teal-400", tier: 'basic' },
      { title: "Life Templates", pageName: "LifeTemplates", icon: Layout, description: "Life planning templates", longDescription: "Templates for life planning, goal setting, and organization", color: "from-teal-400 to-cyan-400", tier: 'basic' },
      { title: "Planners Hub", pageName: "PlannersHub", icon: Calendar, description: "All planning tools", longDescription: "Access all your planning and organizational tools in one place", color: "from-blue-400 to-indigo-400", tier: 'basic' },
      { title: "Beyond Routines", pageName: "BeyondRoutines", icon: Sparkles, description: "Advanced routines", longDescription: "Build sophisticated routines and systems for success", color: "from-purple-400 to-pink-400", tier: 'pro' },
      { title: "Subscription Tracker", pageName: "SubscriptionTracker", icon: CreditCard, description: "Track expenses & subs", longDescription: "Manage subscriptions, track expenses, connect bank accounts, and monitor your budget", color: "from-green-400 to-emerald-400", tier: 'pro' }
    ]
  },
  tools: {
    title: "Specialty Tools",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    bgColor: "from-cyan-50 to-blue-50",
    description: "Specialized tools for unique needs and experiences",
    features: [
      { title: "Translator Hub", pageName: "TranslatorHub", icon: Languages, description: "Multi-language translation", longDescription: "Real-time translation and language learning tools", color: "from-cyan-400 to-blue-400", tier: 'pro' },
      { title: "Tea Is Life", pageName: "TeaIsLife", icon: Coffee, description: "Tea wellness guide", longDescription: "Explore tea culture, health benefits, and mindful tea practices", color: "from-green-400 to-emerald-400", tier: 'pro' },
      { title: "Jigsaw Puzzle", pageName: "JigsawPuzzle", icon: Gamepad2, description: "Relaxing puzzles", longDescription: "Therapeutic jigsaw puzzles for mindfulness and relaxation", color: "from-purple-400 to-pink-400", tier: 'pro' },
      { title: "App Search", pageName: "AppSearch", icon: Search, description: "Find any feature", longDescription: "Powerful search to find any tool or feature across Helper33", color: "from-blue-400 to-indigo-400", tier: 'pro' }
    ]
  },
  coaching: {
    title: "Coaching & Mentorship",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50",
    description: "Professional coaching and mentorship programs",
    features: [
      { title: "Coaching Matcher", pageName: "CoachingMatcher", icon: Target, description: "Find your coach", longDescription: "Match with the perfect coach based on your goals and preferences", color: "from-amber-400 to-orange-400", tier: 'basic' },
      { title: "Coaching Progress", pageName: "CoachingProgress", icon: TrendingUp, description: "Track coaching journey", longDescription: "Monitor your progress and achievements with your coach", color: "from-orange-400 to-red-400", tier: 'basic' },
      { title: "Coach Dashboard", pageName: "CoachDashboard", icon: Target, description: "Coach management", longDescription: "Manage clients, sessions, and coaching programs", color: "from-purple-400 to-pink-400", tier: 'executive' },
      { title: "Mentor Dashboard", pageName: "MentorDashboard", icon: Users, description: "Mentorship portal", longDescription: "Guide and support mentees in their personal growth journey", color: "from-blue-400 to-indigo-400", tier: 'executive' }
    ]
  }
};

const QUICK_ACTIONS = [
  { title: "Log Wellness", icon: Heart, pageName: "Wellness", color: "from-rose-500 to-pink-500" },
  { title: "Add Task", icon: CheckSquare, pageName: "Organizer", color: "from-emerald-500 to-teal-500" },
  { title: "Write Journal", icon: PenTool, pageName: "JournalStudio", color: "from-purple-500 to-indigo-500" },
  { title: "Family Calendar", icon: Calendar, pageName: "Family", color: "from-violet-500 to-purple-500" }
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('dashboardViewMode') || 'grouped';
  });
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [showCurateModal, setShowCurateModal] = useState(false);
  const [tempCuratedTools, setTempCuratedTools] = useState([]);
  const [curateSearchQuery, setCurateSearchQuery] = useState('');
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser", authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser
  });

  const { t, isRTL } = useTranslation(user);

  useEffect(() => {
    localStorage.setItem('dashboardViewMode', viewMode);
  }, [viewMode]);

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['dashboardProgress', user?.email],
    queryFn: async () => {
      if (!user) return null;

      const [
        { data: tasks },
        { data: wellnessEntries },
        { data: journalEntries },
        { data: habits },
        { data: challenges },
        { data: familyEvents },
        { data: kidsProgress },
        { data: completedHabits }
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('wellness_entries').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('habit_trackers').select('*').eq('user_id', user.id),
        supabase.from('challenge_participants').select('*').eq('participant_email', user.email),
        supabase.from('family_events').select('*').eq('user_id', user.id),
        supabase.from('kids_journal_entries').select('*').eq('user_id', user.id),
        supabase.from('habit_completions').select('*').eq('user_id', user.id)
      ]);

      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);

      return {
        tasks: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending').length,
          today: tasks.filter(t => t.due_date === today).length,
          overdue: tasks.filter(t => {
            if (!t.due_date) return false;
            return new Date(t.due_date) < new Date() && t.status !== 'completed';
          }).length
        },
        wellness: {
          total: wellnessEntries.length,
          thisWeek: wellnessEntries.filter(w => new Date(w.date) >= thisWeek).length,
          avgMood: wellnessEntries.length > 0
            ? (wellnessEntries.reduce((sum, w) => sum + (w.mood_rating || 0), 0) / wellnessEntries.length).toFixed(1)
            : 0,
          lastEntry: wellnessEntries[wellnessEntries.length - 1]
        },
        journal: {
          total: journalEntries.length,
          thisWeek: journalEntries.filter(j => new Date(j.created_date) >= thisWeek).length,
          lastEntry: journalEntries[journalEntries.length - 1]
        },
        habits: {
          total: habits.length,
          active: habits.filter(h => h.is_active).length,
          completedToday: completedHabits.filter(c => c.completion_date === today).length,
          streak: habits.reduce((max, h) => Math.max(max, h.current_streak || 0), 0)
        },
        challenges: {
          active: challenges.filter(c => c.status === 'active').length,
          completed: challenges.filter(c => c.status === 'completed').length,
          total: challenges.length
        },
        family: {
          events: familyEvents.length,
          upcomingEvents: familyEvents.filter(e => new Date(e.start_date) > new Date()).length,
          todayEvents: familyEvents.filter(e => {
            const eventDate = new Date(e.start_date).toISOString().split('T')[0];
            return eventDate === today;
          }).length
        },
        kids: {
          totalEntries: kidsProgress.length,
          thisWeek: kidsProgress.filter(k => new Date(k.created_date) >= thisWeek).length
        }
      };
    },
    enabled: !!user,
    staleTime: 30000
  });

  useEffect(() => {
    const autoStartTrial = async () => {
      if (user && !user.trial_used && !user.trial_start_date && user.subscription_plan === 'free') {
        const now = new Date().toISOString();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 3);

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'trial',
            trial_start_date: now,
            trial_end_date: trialEnd.toISOString(),
            trial_used: true
          })
          .eq('id', user.id);

        queryClient.invalidateQueries(['currentUser']);
        toast.success('🎉 Your 3-day free trial has started! Explore all features!');
      }
    };

    autoStartTrial();
  }, [user, queryClient]);

  const getUserTier = () => {
    if (!user) return 'free';
    if (user.role === 'admin') return 'executive';

    const tier = user.subscription_tier?.toLowerCase() || 'free';
    return tier;
  };

  const isFeatureAvailable = (pageName, featureTier) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const userTier = getUserTier();
    const tierHierarchy = ['free', 'basic', 'pro', 'executive'];
    const userTierIndex = tierHierarchy.indexOf(userTier);
    const featureTierIndex = tierHierarchy.indexOf(featureTier);

    if (userTierIndex >= featureTierIndex) return true;

    for (let i = 0; i <= userTierIndex; i++) {
      const tier = tierHierarchy[i];
      if (SUBSCRIPTION_TIERS[tier]?.features?.has(pageName)) {
        return true;
      }
    }

    return false;
  };

  const getTierBadgeColor = (tier) => {
    const colors = {
      free: 'bg-gray-400',
      basic: 'bg-blue-500',
      pro: 'bg-purple-600',
      executive: 'bg-gradient-to-r from-orange-500 to-red-500'
    };
    return colors[tier] || 'bg-gray-400';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Helper33 Dashboard - Your AI Wellness & Productivity Hub",
    "description": "Personalized AI dashboard for mental health tracking, family management, homework help, meal planning, and wellness monitoring.",
    "applicationCategory": "HealthApplication, ProductivityApplication"
  };

  const getAllFeatures = () => {
    return Object.entries(FEATURE_CATEGORIES).flatMap(([key, category]) =>
      category.features.map(feature => ({
        ...feature,
        categoryKey: key,
        categoryColor: category.color,
        categoryTitle: category.title
      }))
    ).filter(feature =>
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const userTier = getUserTier();

  // Get all available features for curation
  const getAllAvailableFeatures = () => {
    return Object.entries(FEATURE_CATEGORIES).flatMap(([key, category]) =>
      category.features
        .filter(feature => isFeatureAvailable(feature.pageName, feature.tier))
        .map(feature => ({
          ...feature,
          categoryKey: key,
          categoryColor: category.color,
          categoryTitle: category.title
        }))
    );
  };

  // Get curated tools from user settings
  const curatedTools = user?.dashboard_curated_tools || [];

  // Get curated feature objects
  const getCuratedFeatures = () => {
    const allFeatures = getAllAvailableFeatures();
    return curatedTools
      .map(toolName => allFeatures.find(f => f.pageName === toolName))
      .filter(Boolean);
  };

  // Add tool to curated list
  const addToCurated = async (pageName) => {
    if (curatedTools.includes(pageName)) {
      toast.error('Tool already in your list');
      return;
    }

    const updated = [...curatedTools, pageName];
    await supabase.from('profiles').update({ dashboard_curated_tools: updated }).eq('id', user.id);
    queryClient.invalidateQueries(['currentUser']);
    toast.success('✨ Added to your curated tools!');
  };

  // Remove tool from curated list
  const removeFromCurated = async (pageName) => {
    const updated = curatedTools.filter(t => t !== pageName);
    await supabase.from('profiles').update({ dashboard_curated_tools: updated }).eq('id', user.id);
    queryClient.invalidateQueries(['currentUser']);
    toast.success('Removed from curated tools');
  };

  // Open curate modal
  const openCurateModal = () => {
    setTempCuratedTools([...curatedTools]);
    setCurateSearchQuery('');
    setShowCurateModal(true);
  };

  // Save curated selections
  const saveCuratedTools = async () => {
    await supabase.from('profiles').update({ dashboard_curated_tools: tempCuratedTools }).eq('id', user.id);
    queryClient.invalidateQueries(['currentUser']);
    setShowCurateModal(false);
    toast.success('✨ Curated tools updated!');
  };

  const curatedFeatures = getCuratedFeatures();

  return (
    <>
      <SEO
        title="Dashboard - Your AI Command Center | Helper33"
        description="Your personalized AI dashboard: track mental wellness, manage family, access homework help, plan meals, and use 33+ AI tools from one central hub."
        keywords="AI wellness dashboard, mental health tracker, family organizer, AI productivity hub, homework tracking, meal planning dashboard"
        structuredData={structuredData}
      />

      <div className={`min-h-screen p-4 sm:p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-8 sm:p-12 text-white shadow-2xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -360],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90">{getGreeting()}</p>
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    {user?.full_name || user?.preferred_name || 'Welcome'}! 👋
                  </h1>
                </div>
              </motion.div>

              <p className="text-lg opacity-90 max-w-2xl mb-6">
                Your AI-powered command center for wellness, productivity, and family management
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {user?.subscription_tier && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`inline-flex items-center gap-2 ${getTierBadgeColor(userTier)} text-white px-4 py-2 rounded-full shadow-lg`}
                  >
                    <Crown className="w-5 h-5" />
                    <span className="font-bold">{SUBSCRIPTION_TIERS[userTier]?.name} Plan</span>
                  </motion.div>
                )}

                {user?.role === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-bold">Admin Mode</span>
                  </motion.div>
                )}

                {userTier === 'free' && (
                  <Link to={createPageUrl('Upgrade')}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-full shadow-lg font-bold hover:shadow-xl transition-shadow"
                    >
                      <Sparkles className="w-5 h-5" />
                      Upgrade to Unlock More
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* My Curated Tools */}
          {user && curatedFeatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-500" />
                  My Curated Tools
                </h2>
                <Button
                  onClick={openCurateModal}
                  variant="outline"
                  size="sm"
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {curatedFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.pageName}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -8 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group"
                    >
                      <Link to={createPageUrl(feature.pageName)}>
                        <Card className={`h-full bg-gradient-to-br ${feature.color} border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden`}>
                          <CardContent className="p-5 flex flex-col items-center text-center space-y-2 relative">
                            <motion.div
                              className="absolute inset-0 bg-white/20"
                              initial={{ x: '-100%' }}
                              whileHover={{ x: '100%' }}
                              transition={{ duration: 0.5 }}
                            />
                            <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-all relative z-10">
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-bold text-white text-sm relative z-10 leading-tight">
                              {feature.title}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                      <motion.button
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromCurated(feature.pageName);
                        }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  );
                })}

                {/* Add New Tool Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + curatedFeatures.length * 0.05 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={openCurateModal}
                    className="h-full w-full bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 flex flex-col items-center justify-center gap-2 min-h-[140px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Star className="w-7 h-7 text-purple-600" />
                    </div>
                    <p className="font-bold text-purple-600 text-sm">Add Tool</p>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Empty State for Curated Tools */}
          {user && curatedFeatures.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                <CardContent className="p-8 text-center">
                  <Star className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Curate Your Dashboard
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Pin your most-used tools here for quick access. Choose from all available features!
                  </p>
                  <Button
                    onClick={openCurateModal}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Select Tools to Pin
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {QUICK_ACTIONS.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to={createPageUrl(action.pageName)}>
                      <Card className={`h-full bg-gradient-to-br ${action.color} border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group overflow-hidden`}>
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-2 relative">
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-all relative z-10">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-bold text-white text-sm relative z-10">
                            {action.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search features, tools, or pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-2xl border-2 focus:border-purple-500 transition-all"
            />
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="w-6 h-6 text-purple-500" />
              Explore Features
            </h2>

            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-lg border-2 border-purple-200">
              <motion.button
                onClick={() => setViewMode('grouped')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'grouped'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Organized</span>
              </motion.button>
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'grid'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">All Features</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Feature Categories - Grouped View */}
          {viewMode === 'grouped' && (
            <div className="space-y-6">
              {Object.entries(FEATURE_CATEGORIES).map(([key, category], categoryIndex) => {
                const CategoryIcon = category.icon;
                const isExpanded = expandedCategory === key;

                const filteredFeatures = category.features.filter(feature =>
                  feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  feature.description.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (searchQuery && filteredFeatures.length === 0) return null;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + categoryIndex * 0.05 }}
                  >
                    <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all shadow-lg">
                      <motion.div
                        className={`bg-gradient-to-r ${category.bgColor} p-1`}
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 5, repeat: Infinity }}
                      >
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : key)}
                          className="w-full p-6 flex items-center justify-between hover:bg-white/50 transition-all rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <motion.div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-xl`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <CategoryIcon className="w-7 h-7 text-white" />
                            </motion.div>
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{category.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                              <Badge className="bg-purple-100 text-purple-700 border-0">
                                {filteredFeatures.length} tools
                              </Badge>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          </motion.div>
                        </button>
                      </motion.div>

                      <AnimatePresence>
                        {(isExpanded || searchQuery) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-200"
                          >
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {filteredFeatures.map((feature, index) => {
                                const FeatureIcon = feature.icon;
                                const available = isFeatureAvailable(feature.pageName, feature.tier);
                                const isHovered = hoveredFeature === `${key}-${feature.pageName}`;

                                return (
                                  <motion.div
                                    key={feature.pageName}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    onHoverStart={() => setHoveredFeature(`${key}-${feature.pageName}`)}
                                    onHoverEnd={() => setHoveredFeature(null)}
                                  >
                                    <Link to={createPageUrl(feature.pageName)}>
                                      <Card className={`h-full hover:shadow-xl transition-all group overflow-hidden border-2 ${!available ? 'opacity-60 border-gray-200' : 'border-transparent hover:border-purple-300'
                                        }`}>
                                        <CardContent className="p-5 relative">
                                          <motion.div
                                            className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                                            animate={{ opacity: isHovered ? 0.1 : 0 }}
                                          />

                                          <div className="relative z-10">
                                            <motion.div
                                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-xl mb-3`}
                                              whileHover={{ rotate: 360, scale: 1.1 }}
                                              transition={{ duration: 0.5 }}
                                            >
                                              <FeatureIcon className="w-7 h-7 text-white" />
                                            </motion.div>

                                            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
                                              <span>{feature.title}</span>
                                              {!available && (
                                                <>
                                                  <Badge className={`${getTierBadgeColor(feature.tier)} text-white text-xs border-0`}>
                                                    {SUBSCRIPTION_TIERS[feature.tier]?.name}
                                                  </Badge>
                                                  <Lock className="w-3 h-3 text-gray-400" />
                                                </>
                                              )}
                                            </h4>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                              {isHovered ? feature.longDescription : feature.description}
                                            </p>

                                            <div className="flex items-center gap-1 text-purple-600 text-xs font-semibold">
                                              <span>{available ? 'Open Tool' : 'Upgrade to unlock'}</span>
                                              <ArrowRight className="w-3 h-3" />
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Grid View - All Features at Once */}
          {viewMode === 'grid' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {getAllFeatures().map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  const available = isFeatureAvailable(feature.pageName, feature.tier);
                  const isHovered = hoveredFeature === feature.pageName;

                  return (
                    <motion.div
                      key={feature.pageName}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05, y: -8 }}
                      onHoverStart={() => setHoveredFeature(feature.pageName)}
                      onHoverEnd={() => setHoveredFeature(null)}
                    >
                      <Link to={createPageUrl(feature.pageName)}>
                        <Card className={`h-full hover:shadow-2xl transition-all group overflow-hidden border-2 ${!available ? 'opacity-60 border-gray-200' : 'border-transparent hover:border-purple-300'
                          }`}>
                          <CardContent className="p-6 relative">
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10`}
                              animate={{ opacity: isHovered ? 0.1 : 0 }}
                              transition={{ duration: 0.3 }}
                            />

                            <div className="relative z-10">
                              <motion.div
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-xl mb-4`}
                                whileHover={{ rotate: 360, scale: 1.15 }}
                                transition={{ duration: 0.6 }}
                              >
                                <FeatureIcon className="w-8 h-8 text-white" />
                              </motion.div>

                              <div className="mb-2 flex items-center gap-2 flex-wrap">
                                <Badge className="text-xs bg-purple-100 text-purple-700 border-0">
                                  {feature.categoryTitle}
                                </Badge>
                                {!available && (
                                  <Badge className={`${getTierBadgeColor(feature.tier)} text-white text-xs border-0`}>
                                    {SUBSCRIPTION_TIERS[feature.tier]?.name}
                                  </Badge>
                                )}
                              </div>

                              <h4 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                                <span>{feature.title}</span>
                                {!available && <Lock className="w-4 h-4 text-gray-400" />}
                              </h4>

                              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                {isHovered ? feature.longDescription : feature.description}
                              </p>

                              <div className="flex items-center gap-2 text-purple-600 text-sm font-semibold">
                                <span>{available ? 'Open Tool' : 'Upgrade to unlock'}</span>
                                <motion.div
                                  animate={{ x: isHovered ? 5 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </motion.div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Activity Progress Overview */}
          {progressData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Your Progress Overview
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link to={createPageUrl("Organizer")}>
                    <Card className="bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 hover:shadow-xl transition-all cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <CheckSquare className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-emerald-900 mb-1">{progressData.tasks.completed}/{progressData.tasks.total}</p>
                        <p className="text-sm text-emerald-700 font-semibold">Tasks Done</p>
                        {progressData.tasks.today > 0 && <Badge className="mt-2 bg-emerald-600 text-white text-xs">{progressData.tasks.today} due today</Badge>}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link to={createPageUrl("Wellness")}>
                    <Card className="bg-gradient-to-br from-rose-100 to-pink-100 border-2 border-rose-300 hover:shadow-xl transition-all cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Smile className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-rose-900 mb-1">{progressData.wellness.avgMood || '—'}<span className="text-lg">/10</span></p>
                        <p className="text-sm text-rose-700 font-semibold">Avg Mood</p>
                        {progressData.wellness.thisWeek > 0 && <Badge className="mt-2 bg-rose-600 text-white text-xs">{progressData.wellness.thisWeek} entries this week</Badge>}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link to={createPageUrl("Organizer")}>
                    <Card className="bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-300 hover:shadow-xl transition-all cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-orange-900 mb-1">{progressData.habits.streak}</p>
                        <p className="text-sm text-orange-700 font-semibold">Day Streak</p>
                        {progressData.habits.completedToday > 0 && <Badge className="mt-2 bg-orange-600 text-white text-xs">{progressData.habits.completedToday} done today</Badge>}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link to={createPageUrl("Challenges")}>
                    <Card className="bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 hover:shadow-xl transition-all cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Trophy className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-indigo-900 mb-1">{progressData.challenges.active}</p>
                        <p className="text-sm text-indigo-700 font-semibold">Active Challenges</p>
                        {progressData.challenges.completed > 0 && <Badge className="mt-2 bg-indigo-600 text-white text-xs">{progressData.challenges.completed} completed</Badge>}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
              <CardContent className="p-8 text-center">
                <Heart className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-2xl font-bold text-purple-900 mb-2">
                  Need Help or Have Feedback?
                </h3>
                <p className="text-purple-700 mb-6">
                  We're here to support you on your wellness journey
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Link to={createPageUrl("FeedbackSurvey")}>
                      Share Feedback
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-2 border-purple-300 hover:bg-purple-50"
                  >
                    <Link to={createPageUrl("CrisisHub")}>
                      Crisis Support
                    </Link>
                  </Button>
                  {userTier === 'free' && (
                    <Button
                      asChild
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Link to={createPageUrl("Upgrade")}>
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Curate Tools Modal */}
        <AnimatePresence>
          {showCurateModal && (
            <Dialog open={showCurateModal} onOpenChange={setShowCurateModal}>
              <DialogContent className="sm:max-w-3xl bg-white max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <Star className="w-6 h-6 text-amber-500" />
                    Curate Your Dashboard
                  </DialogTitle>
                  <DialogDescription>
                    Select the tools you use most often to pin them at the top of your dashboard
                  </DialogDescription>
                </DialogHeader>

                {/* Search for Tools */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for tools to pin..."
                    value={curateSearchQuery}
                    onChange={(e) => setCurateSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                  {Object.entries(FEATURE_CATEGORIES).map(([key, category]) => {
                    const CategoryIcon = category.icon;
                    const availableFeatures = category.features.filter(f => {
                      const isAvailable = isFeatureAvailable(f.pageName, f.tier);
                      const matchesSearch = !curateSearchQuery ||
                        f.title.toLowerCase().includes(curateSearchQuery.toLowerCase()) ||
                        f.description.toLowerCase().includes(curateSearchQuery.toLowerCase());
                      return isAvailable && matchesSearch;
                    });

                    if (availableFeatures.length === 0) return null;

                    return (
                      <div key={key} className="space-y-3">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                            <CategoryIcon className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-bold text-gray-900">{category.title}</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableFeatures.map(feature => {
                            const FeatureIcon = feature.icon;
                            const isSelected = tempCuratedTools.includes(feature.pageName);

                            return (
                              <motion.button
                                key={feature.pageName}
                                onClick={() => {
                                  if (isSelected) {
                                    setTempCuratedTools(prev => prev.filter(t => t !== feature.pageName));
                                  } else {
                                    setTempCuratedTools(prev => [...prev, feature.pageName]);
                                  }
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${isSelected
                                    ? 'bg-purple-50 border-purple-400 shadow-md'
                                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
                                  }`}
                              >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                                  <FeatureIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-gray-900 text-sm truncate">{feature.title}</h5>
                                  <p className="text-xs text-gray-500 truncate">{feature.description}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'border-gray-300'
                                  }`}>
                                  {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    <strong>{tempCuratedTools.length}</strong> tools selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCurateModal(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveCuratedTools}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Selection
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}