import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REMINDER_ICONS = {
  water: '💧',
  breaks: '🧘',
  mindfulness: '🌸',
  eye_rest: '👀',
  posture: '💪',
  gratitude: '💖',
  bedtime: '🌙',
  morning: '☀️'
};

const REMINDER_GRADIENTS = {
  water: 'from-blue-400 to-cyan-500',
  breaks: 'from-green-400 to-emerald-500',
  mindfulness: 'from-purple-400 to-pink-500',
  eye_rest: 'from-amber-400 to-orange-500',
  posture: 'from-indigo-400 to-blue-500',
  gratitude: 'from-rose-400 to-pink-500',
  bedtime: 'from-indigo-500 to-purple-600',
  morning: 'from-yellow-400 to-orange-500'
};

const REMINDER_MESSAGES = {
  water: [
    "Time for a refreshing glass of water! 💧",
    "Your body needs hydration - drink some water! 🌊",
    "Stay healthy - have a glass of water now! 💙"
  ],
  breaks: [
    "Time to stretch! Stand up and move for 2 minutes 🧘",
    "Take a quick movement break - your body will thank you! 💪",
    "Stretch time! Move around and refresh yourself 🌿"
  ],
  mindfulness: [
    "Take 3 deep breaths and center yourself 🧘‍♀️",
    "Mindful moment: Notice your breath for 30 seconds 🌸",
    "Pause and breathe - you deserve this moment 💜"
  ],
  eye_rest: [
    "Look away from the screen - focus on something 20 feet away 👀",
    "Eye rest time! Give your eyes a break 🌅",
    "Screen break: Look out the window for a moment 🪟"
  ],
  posture: [
    "Posture check! Sit up straight and roll your shoulders back 💪",
    "How's your posture? Adjust and feel better! 🧍",
    "Straighten up - your spine will thank you! ✨"
  ],
  gratitude: [
    "What's one thing you're grateful for right now? 💖",
    "Take a moment to appreciate something beautiful today 🌸",
    "Gratitude moment: Notice something good in your life 🙏"
  ],
  bedtime: [
    "Time to start winding down for better sleep 🌙",
    "Begin your bedtime routine for restful sleep 😴",
    "Wind-down time - prepare for a peaceful night 💤"
  ],
  morning: [
    "Good morning! How are you feeling today? ☀️",
    "Rise and shine! Take a moment to set your intention 🌅",
    "Morning check-in: What's your focus for today? ✨"
  ]
};

const isInQuietHours = (currentTime, startTime, endTime) => {
  if (!startTime || !endTime) return false;
  
  if (startTime < endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    return currentTime >= startTime || currentTime <= endTime;
  }
};

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 800;

    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  } catch (error) {
    console.warn('Sound error:', error);
  }
};

export default function InAppReminder() {
  const [currentReminder, setCurrentReminder] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  useEffect(() => {
    if (!user) return;

    const showReminder = (type) => {
      const messages = REMINDER_MESSAGES[type];
      if (!messages) return;

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const reminder = {
        type,
        message: randomMessage,
        icon: REMINDER_ICONS[type],
        gradient: REMINDER_GRADIENTS[type]
      };

      setCurrentReminder(reminder);

      // Play sound if enabled
      const settings = user.wellness_reminder_settings?.[type];
      if (settings?.sound_enabled !== false) {
        playNotificationSound();
      }

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setCurrentReminder(null);
      }, 10000);
    };

    const checkReminders = () => {
      const settings = user.wellness_reminder_settings || {};
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      // Check quiet hours
      const quietHours = settings.quiet_hours;
      if (quietHours?.enabled) {
        const inQuiet = isInQuietHours(currentTime, quietHours.start, quietHours.end);
        if (inQuiet) return;
      }

      // Check each reminder type
      Object.keys(settings).forEach(key => {
        if (key === 'quiet_hours') return;
        
        const reminderConfig = settings[key];
        if (!reminderConfig?.enabled) return;

        // Time-based reminders
        if (reminderConfig.time) {
          const [targetHour, targetMinute] = reminderConfig.time.split(':').map(Number);
          if (currentHour === targetHour && currentMinute === targetMinute) {
            showReminder(key);
          }
        }
        // Interval-based reminders
        else if (reminderConfig.interval) {
          const lastReminderTime = localStorage.getItem(`reminder_last_${key}`);
          const timeSinceLast = lastReminderTime 
            ? (now - new Date(lastReminderTime)) / 1000 / 60 
            : Infinity;

          if (timeSinceLast >= reminderConfig.interval) {
            showReminder(key);
            localStorage.setItem(`reminder_last_${key}`, now.toISOString());
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(interval);
  }, [user]);

  const handleDismiss = () => {
    setCurrentReminder(null);
  };

  const handleComplete = () => {
    const event = new CustomEvent('reminderCompleted', { 
      detail: { type: currentReminder?.type } 
    });
    window.dispatchEvent(event);
    
    setCurrentReminder(null);
  };

  return (
    <AnimatePresence>
      {currentReminder && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-20 right-4 z-40 max-w-sm"
        >
          <div className={`bg-gradient-to-br ${currentReminder.gradient} rounded-2xl shadow-2xl overflow-hidden border-2 border-white/50`}>
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <div className="relative p-6 text-white">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-4xl mb-3">{currentReminder.icon}</div>

              <p className="text-lg font-semibold mb-4 pr-6">
                {currentReminder.message}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleComplete}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Done
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}