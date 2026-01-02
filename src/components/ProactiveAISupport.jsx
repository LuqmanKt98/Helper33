import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sparkles, HelpCircle } from 'lucide-react';
import { useNotifications } from '@/components/SoundManager';

const ProactiveAISupport = ({ currentPageName, onOpenAI }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasShownForPage, setHasShownForPage] = useState({});
  const inactivityTimerRef = useRef(null);
  const activityCountRef = useRef(0);
  const { playSound } = useNotifications();

  // Page-specific proactive messages
  const getProactiveMessage = (pageName) => {
    const messages = {
      Organizer: {
        title: "Need help with tasks? 🎯",
        message: "I can create tasks for you, set priorities, add due dates, or organize your schedule. Just tell me what you need!",
        suggestions: ["Create a task for me", "Show my tasks", "Help me prioritize"]
      },
      Wellness: {
        title: "Track your wellness? 💚",
        message: "I can log your mood, energy level, sleep, water intake, and more. Want me to create a wellness entry for you?",
        suggestions: ["Log my mood", "Track today's wellness", "Show my trends"]
      },
      Family: {
        title: "Managing family activities? 👨‍👩‍👧‍👦",
        message: "I can add family events, create tasks for members, or help coordinate schedules. What would you like to do?",
        suggestions: ["Add family event", "Create family task", "Show calendar"]
      },
      Dashboard: {
        title: "Looking for something? 🔍",
        message: "I can help you navigate, check your tasks, appointments, wellness, or guide you to any feature. What do you need?",
        suggestions: ["Show my tasks", "Check appointments", "Wellness overview"]
      },
      Year2026Hub: {
        title: "Planning your 2026? 🎯",
        message: "I can help you set goals, track daily progress, review achievements, or provide motivation. Let's make 2026 amazing!",
        suggestions: ["Set a new goal", "Log today's check-in", "Show my progress"]
      },
      ClientPortal: {
        title: "Managing appointments? 📅",
        message: "I can help you schedule, reschedule, or view your appointments with practitioners. Need assistance?",
        suggestions: ["Show appointments", "Find practitioners", "Check messages"]
      },
      PractitionerDashboard: {
        title: "Need help with clients? 👥",
        message: "I can help manage appointments, generate session notes, or coordinate with clients. What would you like?",
        suggestions: ["Today's appointments", "Create session notes", "Message client"]
      },
      SellerDashboard: {
        title: "Growing your business? 📈",
        message: "I can help you create product listings, manage orders, or analyze sales. What do you need?",
        suggestions: ["Create product", "Check orders", "Sales insights"]
      },
      HomeworkHub: {
        title: "Need homework help? 📚",
        message: "I can help explain concepts, check your work, create study schedules, or generate practice questions. Just ask!",
        suggestions: ["Explain this topic", "Create study schedule", "Generate quiz"]
      },
      MealPlanner: {
        title: "Planning meals? 🍳",
        message: "I can suggest recipes, create meal plans, generate grocery lists, or help with dietary needs. What sounds good?",
        suggestions: ["Suggest a recipe", "Plan this week", "Grocery list"]
      },
      KidsCreativeStudio: {
        title: "Looking for activities? 🎨",
        message: "I can suggest creative projects, games, learning activities, or stories for kids. What would they enjoy?",
        suggestions: ["Suggest an activity", "Tell a story", "Play a game"]
      }
    };

    return messages[pageName] || {
      title: "Can I help you? 💡",
      message: "I'm here to assist! I can answer questions, guide you through features, or take action for you. What do you need?",
      suggestions: ["Show me around", "What can you do?", "Help me get started"]
    };
  };

  // Reset activity tracking when page changes
  useEffect(() => {
    activityCountRef.current = 0;
    setShowPrompt(false);
    
    // Don't show again on same page during this session
    if (hasShownForPage[currentPageName]) {
      return;
    }

    // Start inactivity timer
    const startInactivityTimer = () => {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        // Only show if user hasn't been very active
        if (activityCountRef.current < 10 && !hasShownForPage[currentPageName]) {
          setShowPrompt(true);
          setHasShownForPage(prev => ({ ...prev, [currentPageName]: true }));
          playSound('notification');
        }
      }, 35000); // 35 seconds of low activity
    };

    startInactivityTimer();

    // Track user activity
    const trackActivity = () => {
      activityCountRef.current += 1;
      
      // If user becomes active, reset timer
      if (activityCountRef.current > 2) {
        startInactivityTimer();
      }
    };

    window.addEventListener('mousedown', trackActivity);
    window.addEventListener('keydown', trackActivity);
    window.addEventListener('scroll', trackActivity);
    window.addEventListener('touchstart', trackActivity);

    return () => {
      clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousedown', trackActivity);
      window.removeEventListener('keydown', trackActivity);
      window.removeEventListener('scroll', trackActivity);
      window.removeEventListener('touchstart', trackActivity);
    };
  }, [currentPageName, hasShownForPage, playSound]);

  const handleClose = () => {
    setShowPrompt(false);
    playSound('click');
  };

  const handleSuggestionClick = (suggestion) => {
    setShowPrompt(false);
    onOpenAI(suggestion);
    playSound('click');
  };

  const proactiveData = getProactiveMessage(currentPageName);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 right-6 z-[9998] max-w-sm"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 10px 40px rgba(168, 85, 247, 0.4)',
                '0 10px 60px rgba(236, 72, 153, 0.5)',
                '0 10px 40px rgba(168, 85, 247, 0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white rounded-2xl border-2 border-purple-300 overflow-hidden"
          >
            {/* Animated gradient header */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-4 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <h4 className="text-white font-bold text-sm">{proactiveData.title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-6 w-6 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {proactiveData.message}
              </p>

              {/* Quick suggestion buttons */}
              <div className="space-y-2">
                {proactiveData.suggestions.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.03, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 transition-all text-sm font-medium text-purple-900"
                  >
                    ✨ {suggestion}
                  </motion.button>
                ))}
              </div>

              {/* Main action button */}
              <Button
                onClick={() => {
                  setShowPrompt(false);
                  onOpenAI();
                  playSound('click');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Open AI Assistant
              </Button>

              <p className="text-xs text-center text-gray-500">
                💡 I'm always here to help - just click the sparkle button!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProactiveAISupport;