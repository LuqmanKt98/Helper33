
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Heart,
  Users,
  Clock,
  Baby,
  Stethoscope,
  Sparkles,
  Coffee,
  Mountain,
  Flower,
  Sun,
  Palette,
  Music,
  TreePine,
  Waves,
  Mic,
  StopCircle,
  BrainCircuit,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const scheduleTemplates = [
  // GRIEF & LOSS SUPPORT - 3 OPTIONS
  {
    id: 'grief_gentle',
    title: 'Gentle Healing Journey',
    category: 'Grief & Loss Support',
    description: 'Soft, nurturing routine for early grief with nature-inspired calm',
    icon: Flower,
    color: 'from-rose-400 via-pink-400 to-rose-500',
    bgPattern: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100',
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'nature',
    events: [
      {
        title: "Morning Light & Breath",
        description: "Step outside for 5 minutes of natural light and deep breathing",
        time: "07:30",
        duration: 15,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Grief Journal Time",
        description: "Write or draw whatever comes to mind - no pressure",
        time: "19:00",
        duration: 20,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Weekly Memory Visit",
        description: "Visit a meaningful place or look through photos",
        time: "15:00",
        duration: 90,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Comfort Meal",
        description: "Prepare or order a favorite soothing food",
        time: "18:00",
        duration: 45,
        type: "meal",
        recurring: "weekly"
      },
      {
        title: "Evening Gratitude",
        description: "List three small things that brought comfort today",
        time: "21:00",
        duration: 10,
        type: "activity",
        recurring: "daily"
      }
    ]
  },
  {
    id: 'grief_structured',
    title: 'Structured Support Path',
    category: 'Grief & Loss Support',
    description: 'More organized approach with regular check-ins and activities',
    icon: Mountain,
    color: 'from-blue-400 via-indigo-400 to-blue-500',
    bgPattern: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'nature',
    events: [
      {
        title: "Morning Meditation",
        description: "10-minute guided grief meditation",
        time: "08:00",
        duration: 10,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Professional Support",
        description: "Therapy session or grief counselor meeting",
        time: "14:00",
        duration: 60,
        type: "appointment",
        recurring: "weekly"
      },
      {
        title: "Support Group",
        description: "Connect with others on similar journeys",
        time: "19:00",
        duration: 90,
        type: "meeting",
        recurring: "weekly"
      },
      {
        title: "Memory Project Time",
        description: "Work on photo album, scrapbook, or memory box",
        time: "16:00",
        duration: 60,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Check-in Call",
        description: "Call a supportive friend or family member",
        time: "17:00",
        duration: 30,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Gentle Exercise",
        description: "Walk, yoga, or stretching - movement for healing",
        time: "10:00",
        duration: 30,
        type: "activity",
        recurring: "daily"
      }
    ]
  },
  {
    id: 'grief_creative',
    title: 'Creative Expression Path',
    category: 'Grief & Loss Support',
    description: 'Art, music, and creative activities for emotional processing',
    icon: Palette,
    color: 'from-purple-400 via-violet-400 to-purple-500',
    bgPattern: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
    backgroundImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'artistic',
    events: [
      {
        title: "Morning Pages",
        description: "Stream-of-consciousness writing - 3 pages, no pressure",
        time: "07:00",
        duration: 30,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Creative Time",
        description: "Art, music, poetry, or any creative expression",
        time: "15:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Music Memory Session",
        description: "Listen to meaningful songs, create playlists",
        time: "20:00",
        duration: 45,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Art Therapy Workshop",
        description: "Guided creative session for emotional processing",
        time: "18:00",
        duration: 90,
        type: "appointment",
        recurring: "weekly"
      },
      {
        title: "Letter Writing",
        description: "Write letters to your loved one or journal entries",
        time: "21:30",
        duration: 30,
        type: "activity",
        recurring: "weekly"
      }
    ]
  },

  // FAMILY CAREGIVING - 3 OPTIONS
  {
    id: 'caregiving_basic',
    title: 'Essential Care Routine',
    category: 'Family Caregiving',
    description: 'Simple, manageable caregiving schedule with built-in breaks',
    icon: Heart,
    color: 'from-green-400 via-emerald-400 to-green-500',
    bgPattern: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
    backgroundImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'nature',
    events: [
      {
        title: "Morning Medication",
        description: "Administer daily medications with breakfast",
        time: "08:00",
        duration: 15,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Evening Medication",
        description: "Evening medications and symptom check",
        time: "18:00",
        duration: 15,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Doctor Appointments",
        description: "Regular medical check-ups - schedule as needed",
        time: "14:00",
        duration: 120,
        type: "appointment",
        recurring: "weekly"
      },
      {
        title: "Caregiver Break",
        description: "Essential self-care time for primary caregiver",
        time: "15:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Family Meeting",
        description: "Weekly coordination and care planning",
        time: "19:00",
        duration: 45,
        type: "meeting",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'caregiving_comprehensive',
    title: 'Comprehensive Care Plan',
    category: 'Family Caregiving',
    description: 'Detailed caregiving schedule with activities and therapies',
    icon: Users,
    color: 'from-blue-400 via-cyan-400 to-blue-500',
    bgPattern: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
    backgroundImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'family',
    events: [
      {
        title: "Morning Care Routine",
        description: "Personal care, medications, and morning activities",
        time: "07:30",
        duration: 90,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Physical Therapy",
        description: "Prescribed exercises and mobility work",
        time: "10:00",
        duration: 45,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Social Activities",
        description: "Games, conversation, or meaningful activities",
        time: "14:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Medical Appointments",
        description: "Specialist visits and regular check-ups",
        time: "09:00",
        duration: 180,
        type: "appointment",
        recurring: "weekly"
      },
      {
        title: "Family Coordination",
        description: "Care team meeting and weekly planning",
        time: "18:00",
        duration: 60,
        type: "meeting",
        recurring: "weekly"
      },
      {
        title: "Evening Wind-Down",
        description: "Relaxation, medication, and bedtime routine",
        time: "20:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Caregiver Support",
        description: "Self-care time and respite for caregivers",
        time: "12:00",
        duration: 90,
        type: "activity",
        recurring: "daily"
      }
    ]
  },
  {
    id: 'caregiving_rotating',
    title: 'Rotating Care Schedule',
    category: 'Family Caregiving',
    description: 'Shared caregiving with rotating responsibilities among family',
    icon: Clock, // Changed from Activity to Clock for visual variety, as Activity isn't a declared icon. If Activity was intended, it needs to be imported.
    color: 'from-orange-400 via-amber-400 to-orange-500',
    bgPattern: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
    backgroundImage: 'https://images.unsplash.com/photo-1516627145497-ae4cf2a1d4ea?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'warm',
    events: [
      {
        title: "Morning Shift (Sibling A)",
        description: "Morning care, breakfast, medications",
        time: "07:00",
        duration: 180,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Afternoon Shift (Sibling B)",
        description: "Lunch, activities, afternoon medications",
        time: "11:00",
        duration: 240,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Evening Shift (Primary Caregiver)",
        description: "Dinner, evening routine, bedtime prep",
        time: "16:00",
        duration: 240,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Weekly Planning Meeting",
        description: "All caregivers coordinate upcoming week",
        time: "18:00",
        duration: 90,
        type: "meeting",
        recurring: "weekly"
      },
      {
        title: "Weekend Recreation (All Family)",
        description: "Family activities and quality time together",
        time: "14:00",
        duration: 120,
        type: "activity",
        recurring: "weekly"
      }
    ]
  },

  // OVERWHELMED PARENT - 3 OPTIONS
  {
    id: 'parent_survival',
    title: 'Survival Mode Schedule',
    category: 'Overwhelmed Parent',
    description: 'Bare essentials for parents in crisis mode - just the basics',
    icon: Coffee,
    color: 'from-red-400 via-pink-400 to-red-500',
    bgPattern: 'bg-gradient-to-br from-red-50 via-pink-50 to-red-100',
    backgroundImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'simple',
    events: [
      {
        title: "Survival Coffee",
        description: "5 minutes of quiet with your coffee/tea before chaos",
        time: "06:30",
        duration: 5,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Kids Fed",
        description: "Get the children fed - anything counts!",
        time: "07:30",
        duration: 30,
        type: "meal",
        recurring: "daily"
      },
      {
        title: "Essential Pickup",
        description: "10-minute house tidy - just the worst areas",
        time: "20:00",
        duration: 10,
        type: "chore",
        recurring: "daily"
      },
      {
        title: "Bedtime Victory",
        description: "Kids in bed = you survived another day!",
        time: "20:30",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Weekend Grocery Run",
        description: "One big shopping trip with simple meals planned",
        time: "09:00",
        duration: 90,
        type: "chore",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'parent_balanced',
    title: 'Balanced Family Flow',
    category: 'Overwhelmed Parent',
    description: 'Structured routine that works for both parents and children',
    icon: Baby,
    color: 'from-teal-400 via-cyan-400 to-teal-500',
    bgPattern: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100',
    backgroundImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'playful',
    events: [
      {
        title: "Parent Prep Time",
        description: "20 minutes for yourself before kids wake up",
        time: "06:30",
        duration: 20,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Morning Routine",
        description: "Structured breakfast and getting ready time",
        time: "07:00",
        duration: 90,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Family Dinner Prep",
        description: "Kids help with simple meal preparation",
        time: "17:00",
        duration: 60,
        type: "meal",
        recurring: "daily"
      },
      {
        title: "Bedtime Stories",
        description: "Calm bedtime routine with reading",
        time: "19:30",
        duration: 45,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Parent Decompression",
        description: "Your time after kids are asleep",
        time: "20:30",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Weekend Family Activity",
        description: "Fun family outing or home activity",
        time: "10:00",
        duration: 120,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Meal Planning Session",
        description: "Plan upcoming week's meals and shopping",
        time: "20:00",
        duration: 30,
        type: "meeting",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'parent_organized',
    title: 'Super-Organized Family',
    category: 'Overwhelmed Parent',
    description: 'Detailed schedule for families who want maximum organization',
    icon: Sparkles, // Changed from Star to Sparkles for visual variety, as Star isn't a declared icon. If Star was intended, it needs to be imported.
    color: 'from-purple-400 via-indigo-400 to-purple-500',
    bgPattern: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100',
    backgroundImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'organized',
    events: [
      {
        title: "Morning Power Hour",
        description: "Exercise, meditation, and planning before family wakes",
        time: "05:30",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Family Morning Meeting",
        description: "Review the day's schedule with everyone",
        time: "07:30",
        duration: 15,
        type: "meeting",
        recurring: "daily"
      },
      {
        title: "Homework & Activity Time",
        description: "Structured time for kids' homework and activities",
        time: "16:00",
        duration: 90,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Family Chore Time",
        description: "Everyone contributes to household tasks",
        time: "18:00",
        duration: 30,
        type: "chore",
        recurring: "daily"
      },
      {
        title: "Educational Bedtime",
        description: "Reading, educational games, or learning activities",
        time: "19:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Weekly Family Meeting",
        description: "Plan upcoming week, discuss goals and challenges",
        time: "18:00",
        duration: 45,
        type: "meeting",
        recurring: "weekly"
      },
      {
        title: "Meal Prep Sunday",
        description: "Prepare meals for the entire upcoming week",
        time: "14:00",
        duration: 180,
        type: "meal",
        recurring: "weekly"
      },
      {
        title: "Parent Planning Session",
        description: "Weekly coordination and relationship check-in",
        time: "21:00",
        duration: 45,
        type: "meeting",
        recurring: "weekly"
      }
    ]
  },

  // HEALTH RECOVERY - 3 OPTIONS
  {
    id: 'recovery_gentle',
    title: 'Gentle Recovery Path',
    category: 'Health Recovery',
    description: 'Soft approach to healing with plenty of rest and gradual progress',
    icon: Flower,
    color: 'from-green-400 via-emerald-400 to-green-500',
    bgPattern: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
    backgroundImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'healing',
    events: [
      {
        title: "Morning Medication & Water",
        description: "Take morning meds with a full glass of water",
        time: "08:00",
        duration: 10,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Gentle Movement",
        description: "5-10 minutes of stretching or slow walking",
        time: "10:30",
        duration: 15,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Rest Period",
        description: "Mandatory rest time - nap or quiet relaxation",
        time: "14:00",
        duration: 60,
        type: "other",
        recurring: "daily"
      },
      {
        title: "Healing Nutrition",
        description: "Nourishing meal or healthy snack",
        time: "12:00",
        duration: 30,
        type: "meal",
        recurring: "daily"
      },
      {
        title: "Doctor Check-in",
        description: "Weekly appointment or virtual visit",
        time: "10:00",
        duration: 45,
        type: "appointment",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'recovery_active',
    title: 'Active Recovery Plan',
    category: 'Health Recovery',
    description: 'Structured approach with physical therapy and gradual activity increases',
    icon: Mountain,
    color: 'from-blue-400 via-cyan-400 to-blue-500',
    bgPattern: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'strength',
    events: [
      {
        title: "Morning Medication Protocol",
        description: "Medications with symptom tracking",
        time: "07:30",
        duration: 15,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Physical Therapy Session",
        description: "Prescribed exercises and movement therapy",
        time: "09:00",
        duration: 60,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Strength Building Activity",
        description: "Gradual strength and endurance building",
        time: "15:00",
        duration: 30,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Medical Appointments",
        description: "Specialist visits and progress check-ups",
        time: "14:00",
        duration: 90,
        type: "appointment",
        recurring: "weekly"
      },
      {
        title: "Recovery Journal",
        description: "Track progress, symptoms, and victories",
        time: "20:00",
        duration: 20,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Nutrition Planning",
        description: "Meal prep and nutrition tracking",
        time: "11:00",
        duration: 45,
        type: "meal",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'recovery_holistic',
    title: 'Holistic Healing Journey',
    category: 'Health Recovery',
    description: 'Integrative approach combining medical treatment with wellness practices',
    icon: Sun,
    color: 'from-orange-400 via-yellow-400 to-orange-500',
    bgPattern: 'bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100',
    backgroundImage: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'wellness',
    events: [
      {
        title: "Mindful Morning Routine",
        description: "Meditation, breathing, and intention setting",
        time: "07:00",
        duration: 30,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Medical Treatment",
        description: "Prescribed medications and medical protocols",
        time: "08:00",
        duration: 30,
        type: "appointment",
        recurring: "daily"
      },
      {
        title: "Healing Movement",
        description: "Yoga, tai chi, or gentle therapeutic exercise",
        time: "10:00",
        duration: 45,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Nourishing Meal",
        description: "Anti-inflammatory, healing foods",
        time: "12:30",
        duration: 45,
        type: "meal",
        recurring: "daily"
      },
      {
        title: "Creative Therapy",
        description: "Art, music, or creative expression for healing",
        time: "15:00",
        duration: 60,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Nature Connection",
        description: "Outdoor time or gardening for mental wellness",
        time: "16:30",
        duration: 30,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Evening Reflection",
        description: "Gratitude practice and healing visualization",
        time: "21:00",
        duration: 20,
        type: "activity",
        recurring: "daily"
      }
    ]
  },

  // NEURODIVERGENT-FRIENDLY - 3 OPTIONS
  {
    id: 'neuro_routine',
    title: 'Structured Sensory Schedule',
    category: 'Neurodivergent-Friendly',
    description: 'Consistent routine with built-in sensory breaks and clear structure',
    icon: Sparkles,
    color: 'from-cyan-400 via-blue-400 to-cyan-500',
    bgPattern: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100',
    backgroundImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'structured',
    events: [
      {
        title: "Morning Routine Checklist",
        description: "Same order every day: shower, breakfast, vitamins, check schedule",
        time: "07:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Sensory Break #1",
        description: "15 minutes: fidgets, music, or quiet space",
        time: "10:00",
        duration: 15,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Focus Work Block",
        description: "Deep work with minimal interruptions - set timer",
        time: "09:00",
        duration: 90,
        type: "other",
        recurring: "daily"
      },
      {
        title: "Sensory Break #2",
        description: "Midday reset: movement, breathing, or stim toys",
        time: "13:00",
        duration: 20,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Evening Routine",
        description: "Consistent wind-down: same activities in same order",
        time: "20:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Weekly Schedule Review",
        description: "What worked well? What needs adjusting?",
        time: "18:00",
        duration: 30,
        type: "meeting",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'neuro_flexible',
    title: 'Flexible Support System',
    category: 'Neurodivergent-Friendly',
    description: 'Adaptable schedule that works with energy levels and sensory needs',
    icon: Waves,
    color: 'from-teal-400 via-green-400 to-teal-500',
    bgPattern: 'bg-gradient-to-br from-teal-50 via-green-50 to-teal-100',
    backgroundImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'adaptive',
    events: [
      {
        title: "Energy Check-in",
        description: "Morning assessment: high/medium/low energy today?",
        time: "08:00",
        duration: 5,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "High Energy Activities",
        description: "Use high energy times for challenging tasks",
        time: "09:00",
        duration: 120,
        type: "other",
        recurring: "daily"
      },
      {
        title: "Sensory Regulation Time",
        description: "As needed: music, movement, fidgets, or quiet space",
        time: "11:30",
        duration: 30,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Low-Demand Time",
        description: "Gentle activities when energy is lower",
        time: "14:00",
        duration: 90,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Interest-Based Activity",
        description: "Spend time on current special interests or hobbies",
        time: "16:00",
        duration: 60,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Accommodation Planning",
        description: "Weekly review of what supports are needed",
        time: "19:00",
        duration: 45,
        type: "meeting",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'neuro_creative',
    title: 'Creative Neurodivergent Flow',
    category: 'Neurodivergent-Friendly',
    description: 'Schedule that celebrates neurodivergent strengths and creativity',
    icon: Music,
    color: 'from-purple-400 via-pink-400 to-purple-500',
    bgPattern: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100',
    backgroundImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'creative',
    events: [
      {
        title: "Creative Morning Pages",
        description: "Free-form writing, drawing, or voice recording",
        time: "07:30",
        duration: 30,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Hyperfocus Time",
        description: "Protected time for deep interests or projects",
        time: "09:00",
        duration: 180,
        type: "other",
        recurring: "daily"
      },
      {
        title: "Movement & Music",
        description: "Dance, sing, or move to favorite music",
        time: "13:00",
        duration: 20,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Art & Expression Time",
        description: "Visual arts, music, writing, or other creative outlets",
        time: "15:00",
        duration: 90,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Sharing & Connection",
        description: "Share creations with supportive friends or online community",
        time: "19:00",
        duration: 45,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Celebration of Progress",
        description: "Weekly acknowledgment of accomplishments and growth",
        time: "18:00",
        duration: 30,
        type: "activity",
        recurring: "weekly"
      }
    ]
  },

  // MINIMAL ROUTINE - 3 OPTIONS
  {
    id: 'minimal_survival',
    title: 'Bare Minimum Survival',
    category: 'Minimal Daily Routine',
    description: 'The absolute essentials when everything feels overwhelming',
    icon: Coffee,
    color: 'from-gray-400 via-slate-400 to-gray-500',
    bgPattern: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100',
    backgroundImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'minimal',
    events: [
      {
        title: "You Woke Up",
        description: "That's enough. You're doing great.",
        time: "08:00",
        duration: 1,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "One Glass of Water",
        description: "Just one glass. That's perfect.",
        time: "09:00",
        duration: 2,
        type: "other",
        recurring: "daily"
      },
      {
        title: "Something to Eat",
        description: "Anything counts. A banana, toast, anything.",
        time: "12:00",
        duration: 10,
        type: "meal",
        recurring: "daily"
      },
      {
        title: "One Kind Thing",
        description: "One kind thing you did for yourself today",
        time: "21:00",
        duration: 5,
        type: "activity",
        recurring: "daily"
      }
    ]
  },
  {
    id: 'minimal_gentle',
    title: 'Gentle Daily Anchors',
    category: 'Minimal Daily Routine',
    description: 'A few simple, nurturing touchpoints throughout the day',
    icon: Heart,
    color: 'from-rose-400 via-pink-400 to-rose-500',
    bgPattern: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100',
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'gentle',
    events: [
      {
        title: "Morning Light",
        description: "Step outside or near a window for 2 minutes",
        time: "08:30",
        duration: 5,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Nourish Yourself",
        description: "One meal or snack that feels caring",
        time: "13:00",
        duration: 20,
        type: "meal",
        recurring: "daily"
      },
      {
        title: "Three Deep Breaths",
        description: "Just three breaths, nothing more needed",
        time: "16:00",
        duration: 2,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Evening Gratitude",
        description: "Name one small thing that wasn't terrible today",
        time: "20:30",
        duration: 3,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Weekend Check-in",
        description: "How are you doing? What do you need?",
        time: "11:00",
        duration: 15,
        type: "activity",
        recurring: "weekly"
      }
    ]
  },
  {
    id: 'minimal_building',
    title: 'Building Block Routine',
    category: 'Minimal Daily Routine',
    description: 'Start small and gradually add more as you feel stronger',
    icon: TreePine,
    color: 'from-emerald-400 via-green-400 to-emerald-500',
    bgPattern: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
    backgroundImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&auto=format&q=60',
    theme: 'growth',
    events: [
      {
        title: "Gentle Wake-up",
        description: "5 minutes of stillness before starting the day",
        time: "07:30",
        duration: 5,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Basic Self-Care",
        description: "Shower, brush teeth, or wash face - pick one",
        time: "08:00",
        duration: 15,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Fuel Your Body",
        description: "One proper meal - whatever feels manageable",
        time: "12:30",
        duration: 30,
        type: "meal",
        recurring: "daily"
      },
      {
        title: "Movement Moment",
        description: "Walk to mailbox, stretch, or dance for 3 minutes",
        time: "15:00",
        duration: 10,
        type: "activity",
        recurring: "daily"
      },
      {
        title: "Connection Point",
        description: "Text a friend, pet an animal, or call someone",
        time: "17:00",
        duration: 15,
        type: "activity",
        recurring: "weekly"
      },
      {
        title: "Reflect & Adjust",
        description: "What's working? What feels like too much?",
        time: "20:00",
        duration: 10,
        type: "activity",
        recurring: "weekly"
      }
    ]
  }
];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
}

export default function ScheduleTemplates() {
  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const previewRef = useRef(null);

  // State for AI customization
  const [editedPreviewTemplate, setEditedPreviewTemplate] = useState(null);
  const [aiInstructions, setAiInstructions] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // New state for event selection
  const [selectedEvents, setSelectedEvents] = useState({});

  useEffect(() => {
    if (previewTemplate && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [previewTemplate]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      setAiInstructions(prev => prev + finalTranscript);
    };
    recognition.onerror = (event) => { console.error("Speech recognition error:", event.error); setIsRecording(false); };
    recognition.onend = () => setIsRecording(false);

    return () => {
      if (recognition) recognition.stop();
    };
  }, []);

  const handleRecording = () => {
    if (!recognition) return alert("Speech recognition is not supported by your browser.");
    if (isRecording) {
      recognition.stop();
    } else {
      setAiInstructions('');
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  const openPreview = (template) => {
    setPreviewTemplate(template);
    setEditedPreviewTemplate(null);
    setAiInstructions('');
    setAiSummary('');

    // Initialize all events as selected by default
    const initialSelection = {};
    template.events.forEach((event, index) => {
      initialSelection[index] = true;
    });
    setSelectedEvents(initialSelection);
  };

  const toggleEventSelection = (eventIndex) => {
    setSelectedEvents(prev => ({
      ...prev,
      [eventIndex]: !prev[eventIndex]
    }));
  };

  const applyMutation = useMutation({
    mutationFn: async ({ tasksToCreate, templateToApply, aiInstructions, aiSummary, selectedEvents }) => {
      if (tasksToCreate.length > 0) {
        await base44.entities.Task.bulkCreate(tasksToCreate);
      }
      await base44.entities.UserTemplate.create({
        template_id: templateToApply.id,
        template_name: templateToApply.title,
        customized_data: {
          applied_date: new Date().toISOString(),
          ai_instructions: aiInstructions.trim() ? aiInstructions : undefined,
          ai_summary: aiSummary.trim() ? aiSummary : undefined,
          selected_event_indices: Object.keys(selectedEvents).filter(key => selectedEvents[key]).map(Number),
          final_applied_events: tasksToCreate
        }
      });
      return tasksToCreate.length;
    },
    onSuccess: (selectedCount, { templateToApply }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['user_templates'] });
      alert(`🎉 ${selectedCount} activities from "${templateToApply.title}" have been added to your Life Organizer! You're building great habits! ⭐`);
      setIsApplying(false);
      setPreviewTemplate(null);
      setEditedPreviewTemplate(null);
      setSelectedEvents({});
      setAiInstructions('');
      setAiSummary('');
    },
    onError: (error) => {
      alert('Error applying template. Please try again.');
      console.error(error);
      setIsApplying(false);
    }
  });

  const applyTemplate = async (templateToApply) => {
    setIsApplying(true);
    const today = new Date();
    const tasksToCreate = [];
    const eventsToProcess = editedPreviewTemplate ? editedPreviewTemplate.events : templateToApply.events;

    eventsToProcess.filter((_, index) => selectedEvents[index]).forEach(event => {
      tasksToCreate.push({
        title: event.title,
        description: event.description || `From template: ${templateToApply.title}`,
        priority: "medium",
        category: event.type || "daily_living",
        due_date: today.toISOString().split('T')[0],
        due_time: event.time,
        recurring: event.recurring,
        status: "pending",
        ai_generated: true,
        tags: [templateToApply.title, "schedule-template"]
      });
    });

    if (tasksToCreate.length === 0) {
      alert('Please select at least one activity to add to your Life Organizer!');
      setIsApplying(false);
      return;
    }

    applyMutation.mutate({ tasksToCreate, templateToApply, aiInstructions, aiSummary, selectedEvents });
  };

  const handleAiEdit = async () => {
    if (!aiInstructions.trim() || !previewTemplate) return;

    setIsAiProcessing(true);
    setAiSummary('');
    try {
      const prompt = `You are a helpful life coach. A user has selected a schedule template and wants to customize it.

      Original Template Events (in JSON format):
      ${JSON.stringify(previewTemplate.events, null, 2)}

      User's Customization Request:
      "${aiInstructions}"

      Your task is to modify the schedule based on the user's request. Return a new schedule.
      - Adhere to the user's instructions as closely as possible.
      - You can add, remove, or modify events. Adjust times and durations as needed.
      - Ensure the final output is a valid JSON object with two keys: "edit_summary" (a short, friendly, first-person summary of the changes you made, like 'I\'ve adjusted this for you...') and "edited_events" (the complete, new list of event objects).
      - Each event object in the "edited_events" array must have keys: title, description, time, duration, type, recurring.`;

      const aiResponse = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            edit_summary: { type: "string" },
            edited_events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  time: { type: "string" },
                  duration: { type: "number" },
                  type: { type: "string" },
                  recurring: { type: "string" }
                },
                required: ["title", "description", "time", "duration", "type", "recurring"]
              }
            }
          },
          required: ["edit_summary", "edited_events"]
        }
      });

      if (aiResponse && aiResponse.edited_events) {
        setEditedPreviewTemplate({ ...previewTemplate, events: aiResponse.edited_events });
        setAiSummary(aiResponse.edit_summary);

        // Reset selection for new events - all selected by default
        const newSelection = {};
        aiResponse.edited_events.forEach((event, index) => {
          newSelection[index] = true;
        });
        setSelectedEvents(newSelection);
      }

    } catch (error) {
      console.error("Error with AI customization:", error);
      setAiSummary("I had a little trouble with that request. Could you try rephrasing it?");
    }
    setIsAiProcessing(false);
  };

  // Group templates by category
  const templatesByCategory = scheduleTemplates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  const categoryIcons = {
    'Grief & Loss Support': Heart,
    'Family Caregiving': Users,
    'Overwhelmed Parent': Baby,
    'Health Recovery': Stethoscope,
    'Neurodivergent-Friendly': Sparkles,
    'Minimal Daily Routine': Coffee
  };

  const categoryColors = {
    'Grief & Loss Support': 'from-rose-500 to-pink-600',
    'Family Caregiving': 'from-blue-500 to-indigo-600',
    'Overwhelmed Parent': 'from-emerald-500 to-green-600',
    'Health Recovery': 'from-purple-500 to-violet-600',
    'Neurodivergent-Friendly': 'from-cyan-500 to-blue-600',
    'Minimal Daily Routine': 'from-amber-500 to-orange-600'
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-purple-100/30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-xl rounded-full border border-purple-200/50 mb-8 shadow-xl"
            >
              <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-pulse">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-semibold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                Schedule Templates
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Beautiful, Ready-Made
              <div className="relative inline-block ml-4">
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent animate-pulse">
                  Life Structures
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-full animate-pulse"></div>
              </div>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Choose from compassionately designed schedules that understand your unique journey.
              Each template offers gentle structure, meaningful routine, and room for healing.
            </p>
          </div>

          {/* Template Categories */}
          {Object.entries(templatesByCategory).map(([category, templates]) => {
            const CategoryIcon = categoryIcons[category];
            const categoryGradient = categoryColors[category];

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 bg-gradient-to-r ${categoryGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <CategoryIcon className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
                    <p className="text-gray-600">Choose the approach that feels right for you</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="group relative"
                    >
                      <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl hover:bg-white/90 transition-all duration-500 shadow-xl hover:shadow-2xl h-full flex flex-col">
                        <div
                          className="absolute inset-0 opacity-10 bg-cover bg-center"
                          style={{ backgroundImage: `url(${template.backgroundImage})` }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${template.bgPattern} opacity-80`} />

                        <CardHeader className="relative z-10 pb-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${template.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                              <template.icon className="w-6 h-6 text-white drop-shadow-lg" />
                            </div>
                            <Badge className="bg-white/80 text-gray-700 border-0 shadow-sm text-xs">
                              {template.events.length} events
                            </Badge>
                          </div>

                          <CardTitle className="text-lg font-bold text-gray-800 mb-2">
                            {template.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {template.description}
                          </p>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-4 flex-1 flex flex-col justify-end">
                          <div className="space-y-3">
                            {template.events.slice(0, 2).map((event, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-800 truncate">{event.title}</div>
                                  <div className="text-xs text-gray-500">{event.time} • {event.duration}min • {event.recurring}</div>
                                </div>
                              </div>
                            ))}
                            <div className="text-center">
                                <span className="text-xs text-gray-500">
                                  +{template.events.length - 2} more events
                                </span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => openPreview(template)}
                              variant="outline"
                              className="flex-1 bg-white/60 hover:bg-white/80 border-0 shadow-sm"
                            >
                              👁️ Customize & Preview
                            </Button>
                          </div>
                        </CardContent>

                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Enhanced Customization Tips */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              💖 Customization & Support Tips
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-emerald-700">🌱 Start Small</h3>
                <p className="text-gray-600 leading-relaxed">Begin with minimal routines if you're feeling overwhelmed. Growth happens one step at a time.</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-blue-700">🕐 Adjust Times</h3>
                <p className="text-gray-600 leading-relaxed">Use the AI editor to move events to times that work better for your natural rhythm.</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-purple-700">👨‍👩‍👧‍👦 Include Family</h3>
                <p className="text-gray-600 leading-relaxed">Add family members to events after applying templates for better coordination and support.</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-amber-700">💝 Be Kind</h3>
                <p className="text-gray-600 leading-relaxed">These are guidelines, not rules. Adjust, skip, or modify anything to fit your healing journey.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Template Preview Modal with Event Selection */}
      {previewTemplate && (
        <div ref={previewRef} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className={`p-6 bg-gradient-to-r ${previewTemplate.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <previewTemplate.icon className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">{previewTemplate.title}</h2>
                    <p className="opacity-90">{previewTemplate.description}</p>
                  </div>
                </div>
                <Button onClick={() => setPreviewTemplate(null)} variant="ghost" className="text-white hover:bg-white/20">
                  ✕
                </Button>
              </div>
            </div>

            <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
              {/* Schedule Preview with Selection Checkboxes */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)] md:max-h-full border-r">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">📅 Choose Your Activities</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const allSelected = {};
                        (editedPreviewTemplate ? editedPreviewTemplate.events : previewTemplate.events).forEach((_, index) => {
                          allSelected[index] = true;
                        });
                        setSelectedEvents(allSelected);
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const noneSelected = {};
                        (editedPreviewTemplate ? editedPreviewTemplate.events : previewTemplate.events).forEach((_, index) => {
                          noneSelected[index] = false;
                        });
                        setSelectedEvents(noneSelected);
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(editedPreviewTemplate ? editedPreviewTemplate.events : previewTemplate.events)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((event, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                          selectedEvents[index]
                            ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center pt-1">
                          <input
                            type="checkbox"
                            checked={selectedEvents[index] || false}
                            onChange={() => toggleEventSelection(index)}
                            className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                          />
                        </div>
                        <div className="text-lg pt-1">⏰</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold">{event.time}</span>
                            <span className="text-sm text-gray-500">({event.duration} min)</span>
                          </div>
                          <h5 className="font-medium text-gray-800">{event.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        </div>
                        <Badge variant="outline" className="capitalize mt-1">{event.type}</Badge>
                      </div>
                    ))}
                </div>
              </div>

              {/* AI Customization Panel */}
              <div className="p-6 bg-gray-50/50 flex flex-col space-y-4 overflow-y-auto max-h-[calc(90vh-250px)] md:max-h-full">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-purple-600" />
                  AI Customization
                </h3>
                <div className="relative">
                  <Textarea
                    value={aiInstructions}
                    onChange={(e) => setAiInstructions(e.target.value)}
                    placeholder="e.g., 'Make my mornings less busy and add a 30-minute walk in the afternoon.'"
                    className="h-28 pr-10"
                    disabled={isAiProcessing}
                  />
                  <Button
                    onClick={handleRecording}
                    variant="ghost" size="icon"
                    className={`absolute top-2 right-2 ${isRecording ? 'text-red-500' : 'text-gray-400'}`}
                    disabled={isAiProcessing}
                  >
                    {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                </div>

                {editedPreviewTemplate && (
                  <Button onClick={() => {
                    setEditedPreviewTemplate(null);
                    setAiSummary('');
                    // Reset to original event selection
                    const originalSelection = {};
                    previewTemplate.events.forEach((event, index) => {
                      originalSelection[index] = true;
                    });
                    setSelectedEvents(originalSelection);
                  }} variant="outline" size="sm" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Reset to Original
                  </Button>
                )}

                <Button onClick={handleAiEdit} disabled={isAiProcessing || !aiInstructions.trim()}>
                  {isAiProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Ask AI to Edit
                    </>
                  )}
                </Button>

                {aiSummary && (
                   <Alert className={isAiProcessing ? 'animate-pulse' : ''}>
                      <BrainCircuit className="h-4 w-4" />
                      <AlertTitle>Life Coach says:</AlertTitle>
                      <AlertDescription>
                        {aiSummary}
                      </AlertDescription>
                    </Alert>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {Object.values(selectedEvents).filter(Boolean).length} of {(editedPreviewTemplate ? editedPreviewTemplate.events : previewTemplate.events).length} activities selected
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setPreviewTemplate(null)} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => applyTemplate(editedPreviewTemplate || previewTemplate)}
                    disabled={isApplying || Object.values(selectedEvents).filter(Boolean).length === 0}
                    className={`bg-gradient-to-r ${previewTemplate.color} hover:scale-105 transition-all duration-300 shadow-lg`}
                  >
                    {isApplying ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...</>
                    ) : (
                      <>🚀 Apply Selected Activities</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
