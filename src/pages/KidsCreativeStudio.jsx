import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { initializeStickers } from '@/functions/initializeStickers';

// New/Updated UI component imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// New/Updated Lucide icons
import {
  Sparkles, Star, Volume2, VolumeX, Baby,
  Palette, Gamepad2, Play, HandHeart, HelpCircle, BarChart3, Target, Brain, X, Shield
} from 'lucide-react';

// Existing Kids Studio components
import TracingGame from '@/components/kids_studio/TracingGame';
import ColoringBook from '@/components/kids_studio/ColoringBook';
import AIStoryCreator from '@/components/kids_studio/AIStoryCreator';
import StickerBook from '@/components/kids_studio/StickerBook';
import HomeworkHelper from '@/components/kids_studio/HomeworkHelper';
import Calculator from '@/components/kids_studio/Calculator';
import MontessoriSpace from '@/components/kids_studio/MontessoriSpace';
import HandTracingProgress from '@/components/kids_studio/HandTracingProgress';
import KidsJournal from '@/components/kids_studio/KidsJournal';
import KidsGratitudeJournal from '@/components/kids_studio/KidsGratitudeJournal';

// New game components (moved from games folder, or updated)
import BreathingQuest from '@/components/games/BreathingQuest';
import FocusMemory from '@/components/games/FocusMemory';
import FidgetBubbles from '@/components/games/FidgetBubbles';

// Import new toddler games
import ColorMatch from '@/components/kids_studio/toddler_games/ColorMatch';
import AnimalSounds from '@/components/kids_studio/toddler_games/AnimalSounds';
import ShapeSorter from '@/components/kids_studio/toddler_games/ShapeSorter';
import CountingFun from '@/components/kids_studio/toddler_games/CountingFun';
import BigButtonFun from '@/components/kids_studio/toddler_games/BigButtonFun';

import OnboardingTour from '@/components/kids_studio/OnboardingTour';
import AIActivitySuggestions from '@/components/kids_studio/AIActivitySuggestions';
import KidsJournalProgress from '@/components/kids_studio/KidsJournalProgress';
import AITutor from '@/components/kids_studio/AITutor';
import ParentMessageCenter from '@/components/kids_studio/ParentMessageCenter';
import SEO from '@/components/SEO';

// NEW IMPORTS - 4 new modules
import CreativeStorytelling from '@/components/kids_studio/CreativeStorytelling';
import MusicRhythmMaker from '@/components/kids_studio/MusicRhythmMaker';
import DigitalArtStudio from '@/components/kids_studio/DigitalArtStudio';
import ScienceExplorer from '@/components/kids_studio/ScienceExplorer';
import CreativeWritingPrompts from '@/components/kids_studio/CreativeWritingPrompts';
import SimpleAnimationCreator from '@/components/kids_studio/SimpleAnimationCreator';
import VirtualPet from '@/components/kids_studio/VirtualPet';
import CodeBlocks from '@/components/kids_studio/CodeBlocks';

// Add new imports
import MathChallengeGame from '@/components/kids_studio/MathChallengeGame';
import LetterTracingChallenge from '@/components/kids_studio/LetterTracingChallenge';
import ParentProgressDashboard from '@/components/kids_studio/ParentProgressDashboard';
import DailyChallengeSystem from '@/components/kids_studio/DailyChallengeSystem';

// New COPPA and enhanced learning imports
import COPPACompliance from '@/components/kids_studio/COPPACompliance';
import InteractiveAITutorSubject from '@/components/kids_studio/InteractiveAITutorSubject';
import AgeFriendlyDrawingStudio from '@/components/kids_studio/AgeFriendlyDrawingStudio';

// Helper function to calculate age - MOVED BEFORE COMPONENT
function calculateAge(user) {
  if (!user?.birthday) return null;
  const birthDate = new Date(user.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Floating Sparkles Component
const FloatingSparkle = ({ delay = 0, x = 0, y = 0 }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 3,
    }}
  >
    <Sparkles className="w-6 h-6 text-yellow-400" />
  </motion.div>
);

// AI Guide Character
const AIGuideCharacter = ({ speaking, onToggleVoice, voiceEnabled }) => (
  <motion.div
    className="fixed bottom-6 right-6 z-50"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
  >
    <motion.div
      className="relative"
      animate={{
        y: speaking ? [-2, 2, -2] : [0, -8, 0],
      }}
      transition={{
        duration: speaking ? 0.5 : 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div 
        className="relative w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center shadow-xl border-4 border-white cursor-pointer group"
        onClick={onToggleVoice}
        title={voiceEnabled ? "Click to mute voice" : "Click to enable voice"}
      >
        {voiceEnabled ? (
          <Volume2 className="w-7 h-7 text-white drop-shadow-lg" />
        ) : (
          <VolumeX className="w-7 h-7 text-white drop-shadow-lg" />
        )}

        <motion.div
          className="absolute inset-0 rounded-full border-4 border-purple-300"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  </motion.div>
);

// Helper Hint Component
const HelperHint = ({ message, show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-yellow-300 to-orange-300 text-gray-800 px-6 py-3 rounded-full shadow-2xl border-2 border-white max-w-md text-center"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-lg">{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Animated Pointer Component
const AnimatedPointer = ({ targetRef, show }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (show && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 50
      });
    }
  }, [show, targetRef]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{ left: position.x, top: position.y }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          exit={{ opacity: 0 }}
          transition={{ y: { duration: 1, repeat: Infinity } }}
        >
          <div className="text-6xl">👇</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function KidsCreativeStudio() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ points: 0, unlocked_stickers: [], total_activities: 0, stickers_earned: 0 });
  const [stickers, setStickers] = useState([]);
  const [showReward, setShowReward] = useState(null);
  const [isInitializingStickers, setIsInitializingStickers] = useState(false);

  const [currentActivity, setCurrentActivity] = useState(null);
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [selectedLetterFromProgress, setSelectedLetterFromProgress] = useState(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechQueue = useRef([]);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [showPointer, setShowPointer] = useState(false);
  const [activeTab, setActiveTab] = useState('activities');
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  const suggestedActivityRef = useRef(null);
  const isProcessingSpeechRef = useRef(false);
  const hasSpokenWelcomeRef = useRef(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [learningGaps, setLearningGaps] = useState([]);

  const [childProgress, setChildProgress] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);

  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showDailyChallenges, setShowDailyChallenges] = useState(false);
  const [showMathChallenge, setShowMathChallenge] = useState(false);
  const [showTracingChallenge, setShowTracingChallenge] = useState(false);
  const [showCOPPA, setShowCOPPA] = useState(false);
  const [coppaAccepted, setCoppaAccepted] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);
  const [selectedTutorSubject, setSelectedTutorSubject] = useState(null);

  // Check COPPA consent on load
  useEffect(() => {
    const consent = localStorage.getItem('helper33_coppa_consent');
    if (consent === 'accepted') {
      setCoppaAccepted(true);
    } else if (user && !consent) {
      // Show COPPA notice for new users
      setShowCOPPA(true);
    }
  }, [user]);

  const handleCOPPAAccept = () => {
    localStorage.setItem('helper33_coppa_consent', 'accepted');
    localStorage.setItem('helper33_coppa_consent_date', new Date().toISOString());
    setCoppaAccepted(true);
    setShowCOPPA(false);
    toast.success('Thank you! Your child can now explore safely.');
  };

  const handleCOPPADecline = () => {
    setShowCOPPA(false);
    toast.info('COPPA consent is required to use Kids Creative Studio');
    window.history.back();
  };

  const cancelAllSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    isProcessingSpeechRef.current = false;
    setIsSpeaking(false);
    setShowHint(false);
    setCurrentHint('');
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!soundEnabled || !text || !('speechSynthesis' in window)) {
      if (options.onComplete) options.onComplete();
      return;
    }

    cancelAllSpeech();
    isProcessingSpeechRef.current = true;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      const priorityVoices = [
        'Google US English',
        'Microsoft Zira Desktop',
        'Samantha',
        'Karen',
        'Google UK English Female',
        'Microsoft David Desktop'
      ];
      
      let selectedVoice = voices.find(voice => 
        priorityVoices.some(preferred => voice.name.includes(preferred))
      );
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
        );
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = options.isEmphatic ? 1.0 : 0.95;
      utterance.pitch = options.isEmphatic ? 1.5 : 1.4;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      const enhancedText = text
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ')
        .replace(/\./g, '. ')
        .replace(/,/g, ', ');

      utterance.text = enhancedText;

      utterance.onstart = () => {
        setIsSpeaking(true);
        isProcessingSpeechRef.current = true;
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        isProcessingSpeechRef.current = false;
        utteranceRef.current = null;
        if (options.onComplete) options.onComplete();
      };
      
      utterance.onerror = (error) => {
        console.log('Voice synthesis unavailable', error);
        setIsSpeaking(false);
        isProcessingSpeechRef.current = false;
        utteranceRef.current = null;
        if (options.onComplete) options.onComplete();
      };

      utteranceRef.current = utterance;
      
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.log('Could not start voice', err);
          setIsSpeaking(false);
          isProcessingSpeechRef.current = false;
          if (options.onComplete) options.onComplete();
        }
      }, 100);
    } catch (err) {
      console.log('Voice feature unavailable', err);
      setIsSpeaking(false);
      isProcessingSpeechRef.current = false;
      if (options.onComplete) options.onComplete();
    }
  }, [soundEnabled, cancelAllSpeech]);

  useEffect(() => {
    return () => {
      cancelAllSpeech();
    };
  }, [cancelAllSpeech]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('✅ High-quality voices loaded:', voices.length);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const showHintWithVoice = useCallback((message, duration = 5000) => {
    cancelAllSpeech();
    
    setCurrentHint(message);
    setShowHint(true);
    speak(message);

    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
      setCurrentHint('');
    }, duration);
  }, [speak, cancelAllSpeech]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      let stickerData = await base44.entities.Sticker.list();
      
      if (!stickerData || stickerData.length === 0) {
        console.log('📌 No stickers found, auto-initializing...');
        setIsInitializingStickers(true);
        try {
          const response = await initializeStickers();
          console.log('✅ Initialization response:', response.data);
          
          stickerData = await base44.entities.Sticker.list();
          console.log('✅ Stickers loaded after init:', stickerData.length);
          
          if (stickerData.length > 0) {
            toast.success('🎨 Sticker collection loaded!');
          }
        } catch (err) {
          console.error('Failed to initialize stickers:', err);
          toast.error('Could not load stickers. Please refresh the page.');
        } finally {
          setIsInitializingStickers(false);
        }
      }
      
      setStickers(stickerData || []);
      console.log('🎨 Total stickers loaded:', stickerData?.length);

      const kidMember = userData;

      let progressRecord = null;
      if (kidMember?.id) {
        const progressRecords = await base44.entities.ChildProgress.filter({
          child_member_id: kidMember.id
        });

        if (progressRecords.length > 0) {
          progressRecord = progressRecords[0];

          if (kidMember.id && !progressRecord.child_user_id) {
            progressRecord = await base44.entities.ChildProgress.update(progressRecord.id, {
              child_user_id: kidMember.id
            });
          }
        } else {
          progressRecord = await base44.entities.ChildProgress.create({
            child_member_id: kidMember.id,
            child_user_id: kidMember.id,
            child_name: kidMember.full_name || 'My Little Star',
            child_age: calculateAge(kidMember),
            guardians: [{
              guardian_email: userData.email,
              guardian_name: userData.full_name,
              role: 'primary',
              permissions: {
                can_edit_goals: true,
                can_add_communication: true,
                can_view_private_notes: true,
                can_manage_guardians: true,
                can_delete_entries: true
              },
              added_date: new Date().toISOString(),
              invitation_status: 'accepted'
            }]
          });
        }
        setChildProgress(progressRecord);

        const entries = await base44.entities.KidsJournalEntry.filter({
          child_member_id: kidMember.id
        });
        setJournalEntries(entries);

        if (kidMember?.id) {
          try {
            const childUsers = await base44.entities.User.filter({ id: kidMember.id });
            if (childUsers.length > 0) {
              const childUserData = childUsers[0];
              if (childUserData.hand_tracing_progress) {
                if (progressRecord && childUserData.hand_tracing_progress.completed_letters) {
                  const updatedProgressRecord = await base44.entities.ChildProgress.update(progressRecord.id, {
                    module_progress: {
                      ...(progressRecord.module_progress || {}),
                      tracing: {
                        letters_traced: childUserData.hand_tracing_progress.completed_letters,
                        last_practiced: new Date().toISOString()
                      }
                    }
                  });
                  setChildProgress(updatedProgressRecord);
                }
              }
            }
          } catch (err) {
            console.log('Could not load child user data for hand tracing:', err);
          }
        }
      }

      const userStats = userData.kids_studio_stats || { points: 0, unlocked_stickers: [], total_activities: 0, stickers_earned: 0 };
      setStats(userStats);
      
      console.log('📊 User stats loaded:', {
        points: userStats.points,
        unlocked_count: userStats.unlocked_stickers?.length,
        total_activities: userStats.total_activities,
        stickers_earned: userStats.stickers_earned,
        unlocked_ids: userStats.unlocked_stickers
      });
      
      if (userStats.has_seen_tour) {
        setHasSeenTour(true);
      } else {
        setHasSeenTour(false);
        if (userData.id && !userStats.has_seen_tour) {
          setShowOnboarding(true);
        }
      }
    } catch (e) {
      console.warn("User not authenticated or error loading data:", e);
      setUser(null);
      setStats({ points: 0, unlocked_stickers: [], total_activities: 0, stickers_earned: 0 });
      setChildProgress(null);
      setJournalEntries([]);
      const localTourSeen = localStorage.getItem('kids_studio_tour_seen');
      if (!localTourSeen) {
        setShowOnboarding(true);
      } else {
        setHasSeenTour(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isLoading && hasSeenTour && !showOnboarding && !hasSpokenWelcomeRef.current) {
      hasSpokenWelcomeRef.current = true;

      const welcomeDelay = setTimeout(() => {
        speak("Welcome back to Kids Studio! I'm your magical helper. Click on any activity that looks fun!");
        
        setTimeout(() => {
          showHintWithVoice("Try the colorful activities below! They're all really fun!", 6000);
        }, 4000);
      }, 1000);

      return () => clearTimeout(welcomeDelay);
    }
  }, [isLoading, hasSeenTour, showOnboarding, speak, showHintWithVoice]);

  useEffect(() => {
    if (!hasSeenTour || currentActivity || showGame || showOnboarding) return;

    const inactivityTimer = setTimeout(() => {
      const hints = [
        "Need help choosing? Try the colorful tracing game!",
        "The story creator is really fun! Want to make a story?",
        "How about some coloring? It's super relaxing!",
        "The counting game has fun sounds! Give it a try!"
      ];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      showHintWithVoice(randomHint, 6000);
    }, 15000);

    return () => clearTimeout(inactivityTimer);
  }, [currentActivity, showGame, showOnboarding, hasSpokenWelcomeRef, hasSeenTour, showHintWithVoice]);

  const awardPrize = useCallback(async (points, stickerId) => {
    let rewardSticker = null;
    
    if (stickerId) {
      rewardSticker = stickers.find(s => s.id === stickerId);
      if (!rewardSticker) {
        rewardSticker = { id: stickerId, name: 'New Sticker!', image_url: '✨' };
      }
    } else {
      const unearnedStickers = stickers.filter(s => !stats.unlocked_stickers.includes(s.id));
      if (unearnedStickers.length > 0) {
        rewardSticker = unearnedStickers[Math.floor(Math.random() * unearnedStickers.length)];
        stickerId = rewardSticker.id;
      }
    }

    let currentStats = stats;
    let newTotalPoints = currentStats.points + points;
    let newUnlockedStickers = [...(currentStats.unlocked_stickers || [])];
    let newTotalActivities = (currentStats.total_activities || 0) + 1;
    let newStickersEarned = (currentStats.stickers_earned || 0);

    if (stickerId && !newUnlockedStickers.includes(stickerId)) {
        newUnlockedStickers.push(stickerId);
        newStickersEarned++;
    }

    const stickerMilestonesReached = Math.floor(newTotalPoints / 500);
    const previousMilestones = Math.floor(currentStats.points / 500);
    const bonusMilestonesEarned = stickerMilestonesReached - previousMilestones;
    
    let bonusStickers = [];
    let finalPoints = newTotalPoints;
    let isMilestone = false;

    if (bonusMilestonesEarned > 0) {
      isMilestone = true;
      let availableBonusStickers = stickers.filter(s => !newUnlockedStickers.includes(s.id));
      
      for (let i = 0; i < bonusMilestonesEarned; i++) {
        if (availableBonusStickers.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableBonusStickers.length);
          const bonusSticker = availableBonusStickers.splice(randomIndex, 1)[0];
          bonusStickers.push(bonusSticker);
          newUnlockedStickers.push(bonusSticker.id);
          newStickersEarned++;
        } else {
          console.warn("No more unique stickers available for bonus.");
          break;
        }
      }
      
      finalPoints = newTotalPoints % 500;
    }

    const updatedStats = {
      ...currentStats,
      points: finalPoints,
      unlocked_stickers: newUnlockedStickers.filter((v, i, a) => a.indexOf(v) === i),
      total_activities: newTotalActivities,
      stickers_earned: newStickersEarned,
      has_seen_tour: currentStats.has_seen_tour
    };
    
    console.log('🎁 Awarding prize:', {
      points,
      stickerId,
      stickerName: rewardSticker?.name,
      newStats: updatedStats
    });

    setStats(updatedStats);

    if (user) {
      try {
        await base44.auth.updateMe({ kids_studio_stats: updatedStats });
        setUser(prevUser => ({
          ...prevUser,
          kids_studio_stats: updatedStats
        }));
      } catch (error) {
        console.warn("Could not save stats, but continuing:", error);
      }
    }

    if (isMilestone) {
      setShowReward({ 
        points, 
        sticker: rewardSticker,
        milestone: true,
        bonusStickers: bonusStickers,
        newPoints: finalPoints
      });
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB']
      });
      
      speak(`WOW! Amazing! You reached a milestone! You earned ${bonusMilestonesEarned} special bonus ${bonusMilestonesEarned === 1 ? 'sticker' : 'stickers'}! You're incredible! Keep going!`);
      
      setTimeout(() => setShowReward(null), 5000);
    } else {
      setShowReward({ points, sticker: rewardSticker });
      speak(`Awesome! You earned ${points} points${rewardSticker ? ' and a new sticker' : ''}! You're doing great!`);
      setTimeout(() => setShowReward(null), 3000);
    }
  }, [stats, stickers, user, speak]);

  const handleActivityComplete = useCallback(async (activity, points, stickerId) => {
    setCompletedActivities(prev => [...prev, activity.title]);
    awardPrize(points, stickerId);
    
    if (window.aiTutorProvideFeedback) {
      window.aiTutorProvideFeedback(activity.title, 'completed successfully');
    }

    if (activity.id === 'tracing' && childProgress && selectedLetterFromProgress) {
        const updatedLetters = [...(childProgress.module_progress?.tracing?.letters_traced || []), selectedLetterFromProgress]
                                 .filter((v, i, a) => a.indexOf(v) === i);
        const updatedModuleProgress = {
            ...(childProgress.module_progress || {}),
            tracing: {
                letters_traced: updatedLetters,
                last_practiced: new Date().toISOString()
            }
        };
        try {
            const updatedRecord = await base44.entities.ChildProgress.update(childProgress.id, {
                module_progress: updatedModuleProgress
            });
            setChildProgress(updatedRecord);
        } catch (error) {
            console.error("Failed to update tracing progress in ChildProgress:", error);
        }
    }
  }, [awardPrize, childProgress, selectedLetterFromProgress]);

  const handleLetterComplete = useCallback((letter) => {
    speak(`Amazing! You finished letter ${letter}! Keep going!`);
    setCompletedActivities(prev => [...prev, `Letter ${letter} Tracing`]);

    if (childProgress) {
        const updatedLetters = [...(childProgress.module_progress?.tracing?.letters_traced || []), letter]
                                 .filter((v, i, a) => a.indexOf(v) === i);
        const updatedModuleProgress = {
            ...(childProgress.module_progress || {}),
            tracing: {
                letters_traced: updatedLetters,
                last_practiced: new Date().toISOString()
            }
        };
        try {
            base44.entities.ChildProgress.update(childProgress.id, {
                module_progress: updatedModuleProgress
            }).then(updatedRecord => {
              setChildProgress(updatedRecord);
            }).catch(error => {
              console.error("Failed to update tracing progress in ChildProgress:", error);
            });
        } catch (error) {
            console.error("Failed to update tracing progress in ChildProgress:", error);
        }
    }
  }, [speak, childProgress]);

  const handleTourComplete = useCallback(async () => {
    setShowOnboarding(false);
    setHasSeenTour(true);
    
    const updatedStats = {
      ...(user?.kids_studio_stats || stats),
      has_seen_tour: true
    };

    if (user) {
      try {
        await base44.auth.updateMe({ kids_studio_stats: updatedStats });
        setUser(prevUser => ({
          ...prevUser,
          kids_studio_stats: updatedStats
        }));
      } catch (error) {
        console.warn("Could not save tour completion:", error);
      }
    } else {
      localStorage.setItem('kids_studio_tour_seen', 'true');
    }

    setStats(updatedStats);
    setTimeout(() => {
      speak("Fantastic! You've completed the tour! Now, pick any activity you like and let's have fun!");
    }, 500);
  }, [user, stats, speak]);

  const handleTourSkip = useCallback(() => {
    setShowOnboarding(false);
    setHasSeenTour(true);
    
    const updatedStats = {
      ...(user?.kids_studio_stats || stats),
      has_seen_tour: true
    };

    if (user) {
      try {
        base44.auth.updateMe({ kids_studio_stats: updatedStats });
        setUser(prevUser => ({
          ...prevUser,
          kids_studio_stats: updatedStats
        }));
      } catch (error) {
        console.warn("Could not save tour skip:", error);
      }
    } else {
      localStorage.setItem('kids_studio_tour_seen', 'true');
    }
    setStats(updatedStats);
    speak("No worries! Feel free to explore on your own!");
  }, [user, stats, speak]);

  const handleActivityClick = useCallback((activity) => {
    cancelAllSpeech();
    
    // Special handling for AI Tutor - show subject selection
    if (activity.id === 'ai_tutor') {
      setShowAITutor(true);
      speak('Which subject would you like to learn about?');
      return;
    }
    
    setCurrentActivity(activity);
  }, [cancelAllSpeech, speak]);

  const handleActivityHover = useCallback((activity) => {
    if (!activity) return;
    setHoveredActivity(activity);
    if (soundEnabled && !isSpeaking && !isProcessingSpeechRef.current && !currentActivity && !showGame && !showOnboarding) {
      speak(activity.voiceHint);
    }
  }, [soundEnabled, isSpeaking, currentActivity, showGame, showOnboarding, speak]);

  const tutorSubjects = [
    { name: 'Math', icon: '🔢', color: 'from-blue-500 to-purple-500' },
    { name: 'Reading', icon: '📖', color: 'from-green-500 to-teal-500' },
    { name: 'Science', icon: '🔬', color: 'from-orange-500 to-red-500' },
    { name: 'History', icon: '🏛️', color: 'from-amber-500 to-yellow-500' },
    { name: 'Art', icon: '🎨', color: 'from-pink-500 to-purple-500' }
  ];

  const activities = [
    {
      id: 'ai_tutor',
      title: '🤖 AI Subject Tutor',
      description: 'Ask questions and learn about any subject with your personal AI tutor!',
      icon: '🧠',
      color: 'from-indigo-400 to-purple-600',
      component: null, // Special handling
      minAge: 5,
      voiceHint: 'Ask me anything and I\'ll help you learn!',
      points: 5,
      glowColor: 'shadow-indigo-400/50'
    },
    {
      id: 'drawing_studio',
      title: '🎨 Drawing Studio',
      description: 'Draw with colors, add AI magic, and save your artwork!',
      icon: '🖌️',
      color: 'from-pink-400 to-rose-600',
      component: AgeFriendlyDrawingStudio,
      minAge: 3,
      voiceHint: 'Create amazing artwork and add AI magic!',
      points: 10,
      glowColor: 'shadow-pink-400/50'
    },
    {
      id: 'math_challenge',
      title: '🎮 Math Challenge Game',
      description: 'Level-based math game with lives, streaks, and instant feedback!',
      icon: '🔢',
      color: 'from-blue-400 to-cyan-600',
      component: MathChallengeGame,
      minAge: 5,
      voiceHint: 'Play the math challenge game! Answer questions and level up!',
      points: 50,
      glowColor: 'shadow-blue-400/50',
      isChallenge: true
    },
    {
      id: 'tracing_challenge',
      title: '✨ Letter Tracing Challenge',
      description: 'Trace letters perfectly and earn stars for accuracy!',
      icon: '✏️',
      color: 'from-purple-400 to-indigo-600',
      component: LetterTracingChallenge,
      minAge: 3,
      voiceHint: 'Practice tracing letters and earn stars!',
      points: 30,
      glowColor: 'shadow-purple-400/50',
      isChallenge: true
    },
    {
      id: 'virtual_pet',
      title: 'Virtual Pet Care',
      description: 'Take care of your own digital pet and watch it grow!',
      icon: '🐾',
      color: 'from-pink-400 to-rose-600',
      component: VirtualPet,
      minAge: 4,
      voiceHint: 'Care for your very own virtual pet!',
      points: 20,
      glowColor: 'shadow-pink-400/50'
    },
    {
      id: 'code_blocks',
      title: 'Code Blocks',
      description: 'Learn coding by making a robot move!',
      icon: '🤖',
      color: 'from-green-400 to-teal-600',
      component: CodeBlocks,
      minAge: 6,
      voiceHint: 'Learn to code like a real programmer!',
      points: 20,
      glowColor: 'shadow-green-400/50'
    },
    {
      id: 'storytelling',
      title: 'Creative Storytelling',
      description: 'Make magical stories with AI from your ideas or drawings!',
      icon: '📚',
      color: 'from-green-400 to-teal-600',
      component: CreativeStorytelling,
      minAge: 4,
      voiceHint: 'Let\'s create amazing stories together!',
      points: 15,
      glowColor: 'shadow-green-400/50'
    },
    {
      id: 'writing_prompts',
      title: 'Writing Challenges',
      description: 'Get fun story ideas and write creative stories!',
      icon: '✍️',
      color: 'from-indigo-400 to-purple-600',
      component: CreativeWritingPrompts,
      minAge: 5,
      voiceHint: 'Get creative writing ideas and challenges!',
      points: 15,
      glowColor: 'shadow-indigo-400/50'
    },
    {
      id: 'animation',
      title: 'Animation Maker',
      description: 'Create your own animated scenes and stories!',
      icon: '🎬',
      color: 'from-red-400 to-pink-600',
      component: SimpleAnimationCreator,
      minAge: 5,
      voiceHint: 'Make your own animations!',
      points: 25,
      glowColor: 'shadow-red-400/50'
    },
    {
      id: 'music',
      title: 'Music & Rhythm Maker',
      description: 'Create your own music and fun beats!',
      icon: '🎵',
      color: 'from-blue-400 to-indigo-600',
      component: MusicRhythmMaker,
      minAge: 4,
      voiceHint: 'Make music and create your own songs!',
      points: 20,
      glowColor: 'shadow-blue-400/50'
    },
    {
      id: 'art',
      title: 'Digital Art Studio',
      description: 'Draw and add AI magic to your artwork!',
      icon: '🖌️',
      color: 'from-pink-400 to-purple-600',
      component: DigitalArtStudio,
      minAge: 3,
      voiceHint: 'Draw beautiful art and add AI magic!',
      points: 15,
      glowColor: 'shadow-pink-400/50'
    },
    {
      id: 'science',
      title: 'Science Explorer',
      description: 'Fun science experiments you can do virtually!',
      icon: '🧪',
      color: 'from-teal-400 to-cyan-600',
      component: ScienceExplorer,
      minAge: 5,
      voiceHint: 'Explore science with fun experiments!',
      points: 12,
      glowColor: 'shadow-teal-400/50'
    },
    {
      id: 'homework',
      title: 'Homework Helper',
      description: 'Get help with math, reading, and more!',
      icon: '📝',
      color: 'from-blue-400 to-blue-600',
      component: HomeworkHelper,
      minAge: 5,
      voiceHint: 'Need help with homework? I can help you!',
      points: 15,
      glowColor: 'shadow-indigo-400/50'
    },
    {
      id: 'journal',
      title: 'My Feelings Journal',
      description: 'Write about your day and feelings',
      icon: '📓',
      color: 'from-purple-400 to-purple-600',
      component: KidsJournal,
      minAge: 4,
      voiceHint: 'Write about your feelings in a safe space!',
      points: 5,
      glowColor: 'shadow-purple-400/50'
    },
    {
      id: 'gratitude',
      title: 'Gratitude Game',
      description: 'Find 3 things that make you happy today!',
      icon: '🌟',
      color: 'from-yellow-400 to-orange-500',
      component: KidsGratitudeJournal,
      minAge: 3,
      voiceHint: 'Let\'s find happy things today!',
      points: 10,
      glowColor: 'shadow-yellow-400/50'
    },
    {
      id: 'story',
      title: 'AI Story Creator',
      description: 'Make up magical stories with AI!',
      icon: '📖',
      color: 'from-pink-400 to-rose-600',
      component: AIStoryCreator,
      minAge: 4,
      voiceHint: 'Let\'s create an amazing story together!',
      points: 10,
      glowColor: 'shadow-green-400/50'
    },
    {
      id: 'coloring',
      title: 'Digital Coloring Book',
      description: 'Color beautiful pictures!',
      icon: '🎨',
      color: 'from-green-400 to-emerald-600',
      component: ColoringBook,
      minAge: 3,
      voiceHint: 'Time to color something beautiful!',
      points: 5,
      glowColor: 'shadow-purple-400/50'
    },
    {
      id: 'calculator',
      title: 'Fun Calculator',
      description: 'Practice math in a fun way!',
      icon: '🔢',
      color: 'from-indigo-400 to-purple-600',
      component: Calculator,
      minAge: 6,
      voiceHint: 'Let\'s do some fun math!',
      points: 5,
      glowColor: 'shadow-teal-400/50'
    },
    {
      id: 'tracing',
      title: 'Letter & Shape Tracing',
      description: 'Learn to write letters and shapes!',
      icon: '✏️',
      color: 'from-teal-400 to-cyan-600',
      component: TracingGame,
      minAge: 3,
      voiceHint: 'Let\'s practice writing letters!',
      points: 5,
      glowColor: 'shadow-blue-400/50'
    },
    {
      id: 'stickers',
      title: 'Sticker Collection',
      description: 'See all the stickers you\'ve earned!',
      icon: '⭐',
      color: 'from-yellow-400 to-amber-600',
      component: StickerBook,
      minAge: 2,
      voiceHint: 'Check out your awesome sticker collection!',
      points: 3,
      glowColor: 'shadow-yellow-400/50'
    }
  ];

  const handleAIActivitySelect = useCallback((activityName) => {
    const activity = activities.find(a => a.title === activityName);
    if (activity) {
      handleActivityClick(activity);
      speak(`Great choice! Let's try ${activityName}!`);
    } else {
      speak(`I couldn't find an activity called ${activityName}. Please try another!`);
    }
  }, [handleActivityClick, speak]);

  const handleOpenGratitudeGame = useCallback(() => {
    const gratitudeActivity = activities.find(a => a.id === 'gratitude');
    if (gratitudeActivity) {
      setCurrentActivity(gratitudeActivity);
      speak(`Yay! Let's play the gratitude game!`);
    }
  }, [speak]);

  const handleLetterSelectFromProgress = useCallback((letter) => {
    setSelectedLetterFromProgress(letter);
    const tracingActivity = activities.find(a => a.id === 'tracing');
    if (tracingActivity) {
      setCurrentActivity(tracingActivity);
      speak(`Let's practice letter ${letter}!`);
    }
  }, [speak]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hoveredActivity && !event.target.closest('.activity-card')) {
        setHoveredActivity(null);
      }
      if (hoveredGame && !event.target.closest('.game-card')) {
        setHoveredGame(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [hoveredActivity, hoveredGame]);

  useEffect(() => {
    if (!isLoading && user && !hasSpokenWelcomeRef.current && !hasSeenTour) {
      setShowOnboarding(true);
      hasSpokenWelcomeRef.current = true;
    }
    if (!isLoading && !user && !hasSpokenWelcomeRef.current && localStorage.getItem('kids_studio_tour_seen') !== 'true') {
      setShowOnboarding(true);
      hasSpokenWelcomeRef.current = true;
    }
  }, [isLoading, user, hasSeenTour]);

  const kidsGames = [
    {
      id: 'knowledge-quest',
      title: 'Knowledge Quest',
      description: 'Learn cool facts in a fun adventure!',
      icon: '🧠',
      path: '/knowledge-quest',
      color: 'from-purple-400 to-indigo-600',
      minAge: 6,
      voiceHint: 'Go on a learning adventure!',
      points: 10
    },
    {
      id: "breathing",
      title: "Triangle Breathing",
      description: "Simple 4-4-4 breathing pattern - great for calming down!",
      icon: '🔺',
      color: "from-emerald-500 to-teal-600",
      component: BreathingQuest,
      points: 5,
      minAge: 5,
      voiceHint: "This breathing game helps you feel calm and peaceful!"
    },
    {
      id: "memory",
      title: "Memory Match",
      description: "Find matching pairs to improve your memory and focus.",
      icon: '🧠',
      color: "from-purple-500 to-indigo-500",
      component: FocusMemory,
      points: 7,
      minAge: 4,
      voiceHint: "Can you remember where all the cards are? Let's find out!"
    },
    {
      id: "bubbles",
      title: "Pop the Bubbles",
      description: "Satisfying bubble popping for relaxation and focus.",
      icon: '🫧',
      color: "from-pink-500 to-rose-500",
      component: FidgetBubbles,
      points: 3,
      minAge: 3,
      voiceHint: "Pop all the bubbles! It's super fun and relaxing!"
    }
  ];

  const toddlerGames = [
    {
      id: "color-match",
      title: "Color Match",
      description: "Find the matching colors! Perfect for little ones learning colors.",
      icon: '🌈',
      color: "from-pink-400 to-purple-500",
      component: ColorMatch,
      points: 8,
      ageRange: "2-4 years",
      voiceHint: "Can you find the matching colors? Tap them!"
    },
    {
      id: "animal-sounds",
      title: "Animal Sounds",
      description: "Touch animals to hear what sounds they make!",
      icon: '🐾',
      color: "from-green-400 to-blue-500",
      component: AnimalSounds,
      points: 6,
      ageRange: "2-4 years",
      voiceHint: "Touch each animal to hear their sounds! Moo! Woof! Meow!"
    },
    {
      id: "shape-sorter",
      title: "Shape Sorter",
      description: "Find and sort different shapes! Great for learning basic shapes.",
      icon: '🔴',
      color: "from-orange-400 to-red-500",
      component: ShapeSorter,
      points: 7,
      ageRange: "2-4 years",
      voiceHint: "Let's find all the shapes! Can you find the circle?"
    },
    {
      id: "counting",
      title: "Counting Fun",
      description: "Count objects by touching them! Learn numbers 1-5.",
      icon: '🔢',
      color: "from-yellow-400 to-orange-500",
      component: CountingFun,
      points: 10,
      ageRange: "2-4 years",
      voiceHint: "Let's count together! Touch each one and I'll count with you!"
    },
    {
      id: "big-buttons",
      title: "Big Button Fun",
      description: "Press big colorful buttons to make fun sounds and see animations!",
      icon: '🎈',
      color: "from-purple-400 to-pink-500",
      component: BigButtonFun,
      points: 5,
      ageRange: "2-4 years",
      voiceHint: "Press the big colorful buttons! Each one makes a different sound!"
    }
  ];

  const handleGameHover = useCallback((game) => {
    if (!game) return;
    setHoveredGame(game);
    if (soundEnabled && !isSpeaking && !isProcessingSpeechRef.current && !currentActivity && !showGame && !showOnboarding) {
      speak(game.voiceHint);
    }
  }, [soundEnabled, isSpeaking, currentActivity, showGame, showOnboarding, speak]);

  const openGame = useCallback((game) => {
    cancelAllSpeech();

    if (game.path) {
      window.location.href = game.path;
      return;
    }
    
    setSelectedGame(game);
    setShowGame(true);
    
    setTimeout(() => {
      speak(`Let's play ${game.title}! This is going to be fun!`);
    }, 200);
  }, [cancelAllSpeech, speak]);

  const closeGame = useCallback(() => {
    cancelAllSpeech();

    setSelectedGame(null);
    setShowGame(false);
    
    setTimeout(() => {
      speak("Great job playing! Want to try something else?");
    }, 200);
  }, [cancelAllSpeech, speak]);

  const handleTabChange = useCallback((tab) => {
    cancelAllSpeech();

    setActiveTab(tab);
    const messages = {
      activities: "Here are all the creative activities! Pick one that looks fun!",
      games: "These games are so much fun! They help you relax and focus!",
      toddler: "These games are perfect for little kids! Big buttons and fun sounds!",
      montessori: "Coming soon! More hands-on learning activities!",
      progress: "Look at all the letters you've learned! Great job!"
    };
    
    setTimeout(() => {
      speak(messages[tab] || "Pick something fun to do!");
    }, 200);
  }, [cancelAllSpeech, speak]);

  if (isLoading || isInitializingStickers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');
          .font-comic-sans { font-family: 'Comic Neue', cursive; }
        `}</style>
        <div className="text-center font-comic-sans">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🎨
          </motion.div>
          <h2 className="text-2xl font-bold text-purple-800">
            {isInitializingStickers ? 'Initializing Stickers...' : 'Loading Creative Studio...'}
          </h2>
        </div>
      </div>
    );
  }

  const childAge = childProgress?.child_age || user?.kids_studio_stats?.child_age || null;
  const childName = childProgress?.child_name || user?.full_name || user?.kids_studio_stats?.child_name || 'Friend';

  return (
    <>
      <SEO 
        title="Kids Creative Studio - Helper33 | COPPA-Compliant Educational Platform"
        description="Safe, COPPA-compliant educational platform for children. AI tutors, interactive games, creative tools, and learning activities. Parent-controlled, privacy-focused, and ad-free."
        keywords="COPPA compliant kids app, safe kids learning, children education platform, parent controlled app, kids privacy, educational games, AI tutor for kids, child-safe learning, parental controls, kids creative tools, homework help for kids, safe online learning"
      />

      {/* COPPA Compliance Modal */}
      {showCOPPA && (
        <COPPACompliance
          onAccept={handleCOPPAAccept}
          onDecline={handleCOPPADecline}
          childAge={childAge}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-x-hidden pb-12">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');
            .font-comic-sans { font-family: 'Comic Neue', cursive; }
            
            @keyframes magical-glow {
              0%, 100% {
                box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
                            0 0 40px rgba(236, 72, 153, 0.3),
                            0 0 60px rgba(59, 130, 246, 0.2);
              }
              50% {
                box-shadow: 0 0 30px rgba(168, 85, 247, 0.6),
                            0 0 60px rgba(236, 72, 153, 0.5),
                            0 0 90px rgba(59, 130, 246, 0.4);
              }
            }
            
            .activity-card-glow:hover {
              animation: magical-glow 2s infinite;
            }
            
            @keyframes float-sparkle {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            .floating-sparkle {
              animation: float-sparkle 3s ease-in-out infinite;
            }
            
            @keyframes pulse-glow {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
              }
              50% {
                box-shadow: 0 0 0 15px rgba(168, 85, 247, 0);
              }
            }
            
            .pulse-glow-ring {
              animation: pulse-glow 2s infinite;
            }
            
            .kids-studio-container {
              min-height: 100vh;
              overflow-y: auto;
              overflow-x: hidden;
              -webkit-overflow-scrolling: touch;
              position: relative;
            }
            
            .kids-studio-content {
              padding-bottom: 150px;
              min-height: 100vh;
            }
            
            @media (min-width: 1024px) {
              .kids-studio-content {
                padding-bottom: 80px;
              }
            }
          `}</style>

        <AnimatePresence>
          {showOnboarding && (
            <OnboardingTour 
              onComplete={handleTourComplete}
              onSkip={handleTourSkip}
            />
          )}
        </AnimatePresence>

        <FloatingSparkle delay={0} x={10} y={20} />
        <FloatingSparkle delay={0.5} x={80} y={15} />
        <FloatingSparkle delay={1} x={20} y={70} />
        <FloatingSparkle delay={1.5} x={90} y={60} />
        <FloatingSparkle delay={2} x={50} y={40} />

        {(!hasSeenTour || showOnboarding) && (
          <AIGuideCharacter 
            speaking={isSpeaking} 
            onToggleVoice={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                speak("Hi! I'm back to help you!");
              } else {
                cancelAllSpeech();
              }
            }}
            voiceEnabled={soundEnabled}
          />
        )}

        {hasSeenTour && !showOnboarding && (
          <ParentMessageCenter childName={childName} />
        )}

        {hasSeenTour && !showOnboarding && (
          <AITutor
            childName={childName}
            childAge={childAge}
            currentModule="creative studio"
            currentActivity={{
              name: currentActivity?.title || selectedGame?.title || 'Exploring activities',
              concept: currentActivity?.description || 'Creative learning'
            }}
            learningGaps={learningGaps}
            interests={user?.kids_studio_stats?.favorite_topics || ['art', 'stories', 'games']}
            recentProgress={{
              points: stats.points,
              activities_completed: stats.total_activities,
              stickers_earned: stats.stickers_earned,
              completed_today: completedActivities
            }}
            onSpeakResponse={speak}
            compact={true}
          />
        )}

        <HelperHint message={currentHint} show={showHint} />
        <AnimatedPointer targetRef={suggestedActivityRef} show={showPointer} />

        <div className="kids-studio-container">
          <div className="max-w-6xl mx-auto font-comic-sans relative z-10 kids-studio-content px-4 py-6 pb-24">
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-purple-200 mb-4 shadow-lg">
                <Palette className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-bold text-purple-800">Kids Creative Studio</span>
                <Sparkles className="w-5 h-5 text-pink-500" />
              </div>
              
              <motion.h1 
                className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎨 Kids Creative Studio - Safe & Fun Learning! 🎮
              </motion.h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-2">
                COPPA-compliant, parent-controlled educational platform. Learn, play, and create amazing things!
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Safe for Kids • Parent Verified • Privacy Protected</span>
              </div>
              
              {user?.id && (
                <motion.div 
                  className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <div className="bg-white/70 rounded-2xl px-4 sm:px-6 py-3 border border-yellow-200 shadow-lg">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.points || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">⭐ Points</div>
                  </div>
                  <div className="bg-white/70 rounded-2xl px-4 sm:px-6 py-3 border border-blue-200 shadow-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total_activities || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">🎨 Activities</div>
                  </div>
                  <div className="bg-white/70 rounded-2xl px-4 sm:px-6 py-3 border border-pink-200 shadow-lg">
                    <div className="text-xl sm:text-2xl font-bold text-pink-600">{stats.unlocked_stickers?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">🎯 Stickers</div>
                  </div>
                </motion.div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="mt-4 text-gray-600 hover:text-purple-600 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="sr-only">{soundEnabled ? "Mute voice guide" : "Unmute voice guide"}</span>
              </Button>
            </motion.div>

            {user?.id && hasSeenTour && !showOnboarding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap justify-center gap-3 mb-6"
              >
                <Button
                  onClick={() => setShowParentDashboard(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  📊 Parent Dashboard
                </Button>
                <Button
                  onClick={() => setShowDailyChallenges(true)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-xl"
                >
                  <Target className="w-5 h-5 mr-2" />
                  🎯 Daily Challenges
                </Button>
                <Button
                  onClick={() => setShowMathChallenge(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  🔢 Math Challenge
                </Button>
                <Button
                  onClick={() => setShowTracingChallenge(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  ✏️ Tracing Challenge
                </Button>
              </motion.div>
            )}

            {hasSeenTour && !currentActivity && !showGame && !showOnboarding && (
              <AIActivitySuggestions
                childAge={childAge}
                childName={childName}
                completedActivities={completedActivities}
                onActivitySelect={handleAIActivitySelect}
              />
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 sm:grid-cols-5 h-auto mb-8 bg-white/70 backdrop-blur-lg p-2 rounded-xl gap-1 sm:gap-2 shadow-lg overflow-x-auto">
                <TabsTrigger value="activities" className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center text-xs sm:text-base py-2 sm:py-3 data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:font-extrabold data-[state=active]:shadow-lg rounded-lg transition-all whitespace-nowrap">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Creative</span>
                  <span className="sm:hidden">Create</span>
                </TabsTrigger>
                <TabsTrigger value="games" className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center text-xs sm:text-base py-2 sm:py-3 data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:font-extrabold data-[state=active]:shadow-lg rounded-lg transition-all whitespace-nowrap">
                  <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Games</span>
                  <span className="sm:hidden">Play</span>
                </TabsTrigger>
                <TabsTrigger value="toddler" className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center text-xs sm:text-base py-2 sm:py-3 data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:font-extrabold data-[state=active]:shadow-lg rounded-lg transition-all whitespace-nowrap">
                  <Baby className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Toddler</span>
                  <span className="sm:hidden">Little</span>
                </TabsTrigger>
                <TabsTrigger value="montessori" className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center text-xs sm:text-base py-2 sm:py-3 data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:font-extrabold data-[state=active]:shadow-lg rounded-lg transition-all whitespace-nowrap">
                  <HandHeart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Learn</span>
                  <span className="sm:hidden">Learn</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center text-xs sm:text-base py-2 sm:py-3 data-[state=active]:bg-purple-800 data-[state=active]:text-white data-[state=active]:font-extrabold data-[state=active]:shadow-lg rounded-lg transition-all whitespace-nowrap">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Progress</span>
                  <span className="sm:hidden">Me</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activities" className="mt-6 p-2 bg-white/50 backdrop-blur-md rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      ref={index === 0 ? suggestedActivityRef : null}
                      whileHover={{ 
                        scale: 1.08, 
                        y: -12,
                        rotate: [0, -2, 2, 0]
                      }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={() => handleActivityHover(activity)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.1,
                        hover: { duration: 0.3, type: "spring", stiffness: 300 }
                      }}
                    >
                      <Card 
                        className={`group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 transition-all duration-300 h-full shadow-lg hover:shadow-2xl activity-card-glow ${activity.glowColor} cursor-pointer`}
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-10 group-hover:opacity-25 transition-opacity duration-300`} />
                        
                        <>
                          <motion.div
                            className="absolute top-2 left-2 text-yellow-400 opacity-0 group-hover:opacity-100"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            ✨
                          </motion.div>
                          <motion.div
                            className="absolute bottom-2 right-2 text-pink-400 opacity-0 group-hover:opacity-100"
                            animate={{ rotate: [360, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            💫
                          </motion.div>
                        </>
                        
                        <motion.div
                          className="absolute top-2 right-2 floating-sparkle"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <Sparkles className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                        </motion.div>

                        <CardContent className="p-4 sm:p-6 relative z-10">
                          <div className="text-center">
                            <motion.div 
                              className="text-6xl sm:text-7xl mb-4 filter drop-shadow-lg"
                              whileHover={{ 
                                scale: 1.3, 
                                rotate: [0, -10, 10, -10, 10, 0],
                                y: [0, -10, 0]
                              }}
                              transition={{ 
                                type: 'spring',
                                stiffness: 300,
                                damping: 10
                              }}
                            >
                              {activity.icon}
                            </motion.div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                              {activity.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-4 text-xs sm:text-sm leading-relaxed">
                              {activity.description}
                            </p>
                            
                            <div className="flex items-center justify-center gap-2">
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs sm:text-sm font-bold shadow-md px-3 py-1">
                                ⭐ +{activity.points} points
                              </Badge>
                            </div>
                            
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              whileHover={{ opacity: 1, y: 0 }}
                              className="text-purple-600 text-xs mt-3 font-semibold italic"
                            >
                              ✨ Click to play! ✨
                            </motion.p>
                          </div>
                        </CardContent>
                        
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          style={{
                            background: `linear-gradient(45deg, transparent 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)`,
                            pointerEvents: 'none'
                          }}
                        />
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="games" className="mt-6 p-2 bg-white/50 backdrop-blur-md rounded-2xl">
                <div className="text-center mb-6">
                  <p className="text-base sm:text-lg text-gray-600">Fun games to help you relax, focus, and have fun!</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {kidsGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      whileHover={{ scale: 1.05, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => handleGameHover(game)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 cursor-pointer h-full shadow-lg hover:shadow-2xl"
                        onClick={() => openGame(game)}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        <CardContent className="p-4 sm:p-6 relative z-10">
                          <div className="text-center">
                            <motion.div 
                              className="text-5xl sm:text-6xl mb-4"
                              whileHover={{ scale: 1.2, rotate: -5 }}
                            >
                              {game.icon}
                            </motion.div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
                            <p className="text-gray-600 mb-4 text-xs sm:text-sm leading-relaxed">{game.description}</p>
                            <div className="flex items-center justify-center gap-2">
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs sm:text-sm">
                                +{game.points} points
                              </Badge>
                              <Button 
                                size="sm" 
                                className={`bg-gradient-to-r ${game.color} text-white hover:scale-105 transition-transform`} 
                                onClick={(e) => { e.stopPropagation(); openGame(game); }}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Play
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="toddler" className="mt-6 p-2 bg-white/50 backdrop-blur-md rounded-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-2">👶 Toddler Games (Ages 2-4) 👶</h2>
                  <p className="text-base sm:text-lg text-gray-600">Simple, educational games perfect for little hands and growing minds!</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {toddlerGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      whileHover={{ scale: 1.05, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => handleGameHover(game)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 cursor-pointer h-full shadow-lg hover:shadow-2xl"
                        onClick={() => openGame(game)}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        <CardContent className="p-4 sm:p-6 relative z-10">
                          <div className="text-center">
                            <motion.div 
                              className="text-5xl sm:text-6xl mb-4"
                              whileHover={{ scale: 1.3, rotate: 10 }}
                            >
                              {game.icon}
                            </motion.div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
                            <p className="text-gray-600 mb-3 text-xs sm:text-sm leading-relaxed">{game.description}</p>
                            <Badge className="mb-3 bg-purple-100 text-purple-700 border-purple-200 text-xs sm:text-sm">
                              {game.ageRange}
                            </Badge>
                            <div className="flex items-center justify-center gap-2">
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs sm:text-sm">
                                +{game.points} points
                              </Badge>
                              <Button 
                                size="sm" 
                                className={`bg-gradient-to-r ${game.color} text-white hover:scale-105 transition-transform`} 
                                onClick={(e) => { e.stopPropagation(); openGame(game); }}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Play
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="montessori" className="mt-6 p-2 bg-white/50 backdrop-blur-md rounded-2xl">
                <MontessoriSpace />
              </TabsContent>

              <TabsContent value="progress" className="mt-6 p-2 bg-white/50 backdrop-blur-md rounded-2xl">
                <HandTracingProgress 
                  onLetterSelect={handleLetterSelectFromProgress}
                  mode="child"
                  completedLetters={childProgress?.module_progress?.tracing?.letters_traced || []}
                />
                <KidsJournalProgress journalEntries={journalEntries} />
              </TabsContent>
            </Tabs>

            {/* AI Tutor Subject Selection Dialog */}
            <Dialog open={showAITutor} onOpenChange={() => {
              setShowAITutor(false);
              setSelectedTutorSubject(null);
            }}>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-indigo-800">
                    🤖 Choose Your Subject
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-2">
                  {!selectedTutorSubject ? (
                    <div className="grid grid-cols-2 gap-4">
                      {tutorSubjects.map((subject) => (
                        <motion.button
                          key={subject.name}
                          onClick={() => setSelectedTutorSubject(subject)}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-6 rounded-2xl bg-gradient-to-br ${subject.color} text-white shadow-xl hover:shadow-2xl transition-all`}
                        >
                          <div className="text-6xl mb-3">{subject.icon}</div>
                          <h3 className="text-xl font-bold">{subject.name}</h3>
                          <p className="text-sm text-white/90">Ask me anything!</p>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <InteractiveAITutorSubject
                      subject={selectedTutorSubject.name}
                      childAge={childAge}
                      icon={selectedTutorSubject.icon}
                      color={selectedTutorSubject.color}
                      onComplete={(points) => {
                        handleActivityComplete({ title: `${selectedTutorSubject.name} Tutor` }, points, null);
                      }}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={!!currentActivity} onOpenChange={() => {
              cancelAllSpeech();
              
              if (currentActivity) {
                setCompletedActivities(prev => [...prev, currentActivity.title]);
              }
              
              setCurrentActivity(null);
              setSelectedLetterFromProgress(null);
              
              setTimeout(() => {
                speak("Okay! Want to try something else?");
              }, 200);
            }}>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-purple-800">
                    {currentActivity?.icon} {currentActivity?.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-2">
                  {currentActivity && currentActivity.component && (
                    <currentActivity.component 
                      onComplete={(points, stickerId) => handleActivityComplete(currentActivity, points, stickerId || null)} 
                      onLetterComplete={currentActivity.id === 'tracing' ? handleLetterComplete : undefined}
                      allStickers={currentActivity.id === 'stickers' ? stickers : undefined}
                      unlockedStickers={currentActivity.id === 'stickers' ? stats.unlocked_stickers : undefined} 
                      selectedLetter={currentActivity.id === 'tracing' ? selectedLetterFromProgress : undefined}
                      onOpenGratitudeGame={currentActivity.id === 'journal' ? handleOpenGratitudeGame : undefined}
                      childName={childName}
                      childAge={childAge}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showGame} onOpenChange={() => {
              if (selectedGame) {
                setCompletedActivities(prev => [...prev, selectedGame.title]);
              }
              closeGame();
            }}>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-blue-800">
                    {selectedGame?.icon} {selectedGame?.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-2">
                  {selectedGame && selectedGame.component && (
                    <selectedGame.component onComplete={(points, stickerId) => awardPrize(points, stickerId || null)} />
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl shadow-2xl border-4 border-white text-center z-50 max-w-md"
                        initial={{ scale: 0, opacity: 0, rotate: -30 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: showReward.milestone ? 5 : 2 }}
                        >
                          <h3 className="text-2xl font-bold text-white drop-shadow-md">
                            {showReward.milestone ? '🎉 MILESTONE REACHED! 🎉' : "You're a Star!"}
                          </h3>
                        </motion.div>
                        
                        {showReward.milestone ? (
                          <div className="space-y-3 mt-4">
                            <p className="text-white text-xl font-bold">You earned {showReward.points} points!</p>
                            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border-2 border-white">
                              <p className="text-white font-bold text-lg mb-2">🌟 500 POINT BONUS! 🌟</p>
                              <p className="text-white">You got {showReward.bonusStickers?.length || 0} special bonus {showReward.bonusStickers?.length === 1 ? 'sticker' : 'stickers'}!</p>
                              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                                {showReward.bonusStickers?.map((sticker, i) => (
                                  <motion.div
                                    key={sticker?.id || i}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: i * 0.2, type: 'spring' }}
                                    className="text-5xl"
                                  >
                                    {typeof sticker?.image_url === 'string' && sticker.image_url.startsWith('http') ? (
                                      <img src={sticker.image_url} alt={sticker.name} className="w-16 h-16 object-contain" />
                                    ) : (
                                      <div>{sticker?.image_url || '⭐'}</div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                            <p className="text-white/90 text-sm">Points reset! New count: {showReward.newPoints} points</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-white/90">You earned {showReward.points} points!</p>
                            {showReward.sticker && (
                              <div className="mt-2 flex flex-col items-center">
                                {typeof showReward.sticker.image_url === 'string' && showReward.sticker.image_url.startsWith('http') ? (
                                  <img src={showReward.sticker.image_url} alt={showReward.sticker.name} className="w-20 h-20 object-contain" />
                                ) : (
                                  <div className="text-6xl">{showReward.sticker.image_url}</div>
                                )}
                                <p className="font-semibold text-white">New Sticker: {showReward.sticker.name}!</p>
                              </div>
                            )}
                          </>
                        )}
                        
                        {!showReward.milestone && (
                          <div className="mt-3 text-sm text-white/80 bg-white/20 rounded-lg p-2">
                            <p>{stats.points || 0}/500 points to next bonus sticker! 🎯</p>
                          </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {showParentDashboard && user?.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4"
              onClick={() => setShowParentDashboard(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-6xl mx-auto my-8"
              >
                <Card className="bg-white shadow-2xl border-4 border-purple-400">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">Parent Progress Dashboard</CardTitle>
                      <Button
                        onClick={() => setShowParentDashboard(false)}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ParentProgressDashboard 
                      childMemberId={user.id}
                      childName={childName}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDailyChallenges && user?.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4"
              onClick={() => setShowDailyChallenges(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-5xl mx-auto my-8"
              >
                <Card className="bg-white shadow-2xl border-4 border-orange-400">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">🎯 Daily Challenges</CardTitle>
                      <Button
                        onClick={() => setShowDailyChallenges(false)}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DailyChallengeSystem
                      childMemberId={user.id}
                      onChallengeComplete={(reward) => {
                        awardPrize(reward.points, null);
                        setShowDailyChallenges(false);
                      }}
                      completedToday={completedActivities}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMathChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4"
              onClick={() => setShowMathChallenge(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl mx-auto my-8"
              >
                <Card className="bg-white shadow-2xl border-4 border-blue-400">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">🔢 Math Challenge Game</CardTitle>
                      <Button
                        onClick={() => setShowMathChallenge(false)}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <MathChallengeGame
                      onComplete={(points, stickerId) => {
                        awardPrize(points, stickerId);
                        setShowMathChallenge(false);
                        setCompletedActivities(prev => [...prev, 'Math Challenge']);
                      }}
                      childAge={childAge}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTracingChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4"
              onClick={() => setShowTracingChallenge(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl mx-auto my-8"
              >
                <Card className="bg-white shadow-2xl border-4 border-purple-400">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">✏️ Letter Tracing Challenge</CardTitle>
                      <Button
                        onClick={() => setShowTracingChallenge(false)}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <LetterTracingChallenge
                      onComplete={(points, stickerId) => {
                        awardPrize(points, stickerId);
                        setShowTracingChallenge(false);
                        setCompletedActivities(prev => [...prev, 'Letter Tracing Challenge']);
                      }}
                      completedLetters={childProgress?.module_progress?.tracing?.letters_traced || []}
                      onLetterComplete={handleLetterComplete}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}