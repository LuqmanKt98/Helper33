
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return { 
      showNotification: (title, options) => {
        if (typeof toast !== 'undefined') {
          toast(title, options);
        }
      }, 
      soundEnabled: false, 
      toggleSound: () => {},
      playSound: () => {},
      playUISound: () => {},
      vibrate: () => {}
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Try to get from localStorage first for immediate state
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('soundEnabled');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });
  
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});

  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Sync with user settings when they load
  useEffect(() => {
    if (user?.app_settings?.sound_enabled !== undefined) {
      const userSetting = user.app_settings.sound_enabled;
      setSoundEnabled(userSetting);
      if (typeof window !== 'undefined') {
        localStorage.setItem('soundEnabled', userSetting.toString());
      }
    }
  }, [user?.app_settings?.sound_enabled]);

  const initAudio = useCallback(() => {
    if (audioInitialized || typeof window === 'undefined') return true;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return false;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const sounds = {
        notification: { type: 'beep', frequency: 800, duration: 0.15 },
        success: { type: 'chime', frequencies: [523, 659, 784], duration: 0.3 },
        click: { type: 'click', frequency: 600, duration: 0.05 },
        tap: { type: 'tap', frequency: 700, duration: 0.06 },
        select: { type: 'select', frequency: 880, duration: 0.08 },
        toggle: { type: 'toggle', frequencies: [440, 660], duration: 0.12 },
        error: { type: 'error', frequency: 200, duration: 0.2 }
      };

      audioBuffersRef.current = sounds;
      setAudioInitialized(true);
      return true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      return false;
    }
  }, [audioInitialized]);

  const playSoundBuffer = useCallback((soundConfig, forcePlay = false) => {
    if (!audioContextRef.current || (!soundEnabled && !forcePlay) || typeof window === 'undefined') return;

    try {
      const context = audioContextRef.current;
      
      if (context.state === 'suspended') {
        context.resume();
      }

      if (soundConfig.type === 'chime' || soundConfig.type === 'toggle') {
        soundConfig.frequencies.forEach((freq, index) => {
          const osc = context.createOscillator();
          const gain = context.createGain();
          
          osc.connect(gain);
          gain.connect(context.destination);
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          const volume = soundConfig.type === 'toggle' ? 0.15 : 0.1;
          gain.gain.setValueAtTime(volume, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + soundConfig.duration);
          
          osc.start(context.currentTime + (index * 0.05));
          osc.stop(context.currentTime + soundConfig.duration + (index * 0.05));
        });
      } else {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = soundConfig.frequency;

        let volume = 0.15;
        if (soundConfig.type === 'click') volume = 0.05;
        if (soundConfig.type === 'tap') volume = 0.06;
        if (soundConfig.type === 'select') volume = 0.08;
        if (soundConfig.type === 'error') volume = 0.12;

        gainNode.gain.setValueAtTime(volume, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + soundConfig.duration);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + soundConfig.duration);
      }
    } catch (error) {
      console.warn('Sound playback error:', error);
    }
  }, [soundEnabled]);

  const playSound = useCallback((soundName, forcePlay = false) => {
    if (!audioInitialized) {
      initAudio();
    }

    const soundConfig = audioBuffersRef.current[soundName];
    if (soundConfig) {
      playSoundBuffer(soundConfig, forcePlay);
    }
  }, [audioInitialized, initAudio, playSoundBuffer]);

  const playUISound = useCallback((soundType = 'click') => {
    playSound(soundType);
  }, [playSound]);

  const vibrate = useCallback((pattern = 10) => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(pattern);
    }
  }, [isMobile]);

  const showNotification = useCallback((title, options = {}) => {
    if (options.type === 'success') {
      playSound('success');
    } else if (options.type === 'error') {
      playSound('error');
    } else {
      playSound('notification');
    }
    
    toast(title, options);
  }, [playSound]);

  const toggleSound = useCallback(() => {
    // Initialize audio on first interaction if needed
    initAudio();
    
    const newState = !soundEnabled;
    
    // Update state immediately
    setSoundEnabled(newState);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', newState.toString());
    }
    
    // Update user settings in background
    if (user) {
      base44.auth.updateMe({
        app_settings: {
          ...(user?.app_settings || {}),
          sound_enabled: newState
        }
      }).then(() => {
        queryClient.invalidateQueries(['user']);
        queryClient.invalidateQueries(['currentUser']); // Invalidate current user query as well
      }).catch(err => console.error('Failed to update sound setting:', err));
    }
    
    // Play confirmation sound when enabling (force play even if previous state was disabled)
    if (newState) {
      setTimeout(() => {
        const soundConfig = audioBuffersRef.current['toggle'];
        if (soundConfig && audioContextRef.current) {
          try {
            const context = audioContextRef.current;
            if (context.state === 'suspended') {
              context.resume();
            }
            
            soundConfig.frequencies.forEach((freq, index) => {
              const osc = context.createOscillator();
              const gain = context.createGain();
              
              osc.connect(gain);
              gain.connect(context.destination);
              
              osc.type = 'sine';
              osc.frequency.value = freq;
              
              gain.gain.setValueAtTime(0.2, context.currentTime); // Adjusted volume for toggle
              gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + soundConfig.duration);
              
              osc.start(context.currentTime + (index * 0.05));
              osc.stop(context.currentTime + soundConfig.duration + (index * 0.05));
            });
          } catch (error) {
            console.warn('Error playing toggle sound:', error);
          }
        }
      }, 150); // Slightly adjusted delay
    }
  }, [soundEnabled, user, initAudio, queryClient]);

  // Listen for global UI sound events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUISound = (e) => {
      if (e.detail?.type) {
        playUISound(e.detail.type);
      }
    };

    window.addEventListener('playUISound', handleUISound);
    return () => window.removeEventListener('playUISound', handleUISound);
  }, [playUISound]);

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      soundEnabled, 
      toggleSound,
      playSound, 
      playUISound,
      vibrate 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function NotificationToggles() {
  const { soundEnabled, toggleSound } = useNotifications();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSound}
        className="relative group"
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        enableSound={false}
      >
        <AnimatePresence mode="wait">
          {soundEnabled ? (
            <motion.div
              key="volume-on"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Volume2 className="h-5 w-5 text-orange-600" />
            </motion.div>
          ) : (
            <motion.div
              key="volume-off"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <VolumeX className="h-5 w-5 text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sound wave animation when enabled */}
        {soundEnabled && (
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-500/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Tooltip */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      </Button>
    </motion.div>
  );
}

export default NotificationProvider;
