import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/entities/User';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/SoundManager';
import { Sparkles, Clock, Compass, Moon, Headphones, Heart, AlertTriangle, X } from 'lucide-react';
import MoodCompassModal from './MoodCompassModal';
import GratitudeDropinModal from './GratitudeDropinModal';
import MindfulMoment from '../organizer/MindfulMoment';

const toolConfig = {
  adhdTimebox: { icon: Clock, label: 'Time Box', action: 'navigate', payload: '/tools/timebox' },
  moodCompass: { icon: Compass, label: 'Mood', action: 'modal', payload: 'moodCompass' },
  eveningReset: { icon: Moon, label: 'Reset', action: 'navigate', payload: '/tools/evening-reset' },
  focusSoundscapes: { icon: Headphones, label: 'Focus Sound', action: 'sound' },
  gratitudeDropin: { icon: Heart, label: 'Gratitude', action: 'modal', payload: 'gratitudeDropin' },
  emergencyCalm: { icon: AlertTriangle, label: 'Calm', action: 'modal', payload: 'emergencyCalm' }
};

const DockTool = ({ icon: Icon, label, onClick, onKeyDown }) => (
  <button
    onClick={onClick}
    onKeyDown={onKeyDown}
    className="flex flex-col items-center justify-center gap-2 text-slate-700 hover:text-purple-600 transition-colors group"
  >
    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:border-purple-200">
      <Icon className="w-8 h-8" />
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

export default function WellnessDock() {
  const { playSound, soundEnabled, toggleSound } = useNotifications();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => User.me(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const activeTools = user?.app_settings?.wellness_dock_tools || [];

  const handleToolClick = (tool) => {
    playSound('click');
    switch (tool.action) {
      case 'modal':
        setActiveModal(tool.payload);
        break;
      case 'sound':
        // This is a simplified toggle logic
        if (soundEnabled) {
          playSound('complete'); // Or another sound to indicate it's on
        }
        toggleSound(); // For now, this just toggles master sound
        break;
      case 'navigate':
        alert(`Coming soon: Navigating to ${tool.label}`);
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (e, tool) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleToolClick(tool);
    }
  };
  
  if (activeTools.length === 0) return null;

  return (
    <>
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50 p-4">
        <motion.div layout>
          <AnimatePresence>
            {isExpanded ? (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="p-6 bg-slate-100/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-700">Wellness Tools</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {activeTools.map(toolId => {
                    const tool = toolConfig[toolId];
                    if (!tool) return null;
                    return (
                      <DockTool
                        key={toolId}
                        icon={tool.icon}
                        label={tool.label}
                        onClick={() => handleToolClick(tool)}
                        onKeyDown={(e) => handleKeyDown(e, tool)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={() => setIsExpanded(true)}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg hover:scale-110 transition-transform"
                  aria-label="Open Wellness Dock"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <MoodCompassModal isOpen={activeModal === 'moodCompass'} onClose={() => setActiveModal(null)} />
      <GratitudeDropinModal isOpen={activeModal === 'gratitudeDropin'} onClose={() => setActiveModal(null)} />
      <MindfulMoment isOpen={activeModal === 'emergencyCalm'} onClose={() => setActiveModal(null)} />
    </>
  );
}