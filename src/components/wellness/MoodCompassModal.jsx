import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😕', label: 'Unsure' },
  { emoji: '😥', label: 'Sad' },
  { emoji: '😠', label: 'Frustrated' },
  { emoji: '😴', label: 'Tired' },
];

export default function MoodCompassModal({ isOpen, onClose }) {
  const [selectedMood, setSelectedMood] = useState(null);

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    // In a real app, you would save this mood data
    setTimeout(() => {
      onClose();
      setSelectedMood(null);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-50 border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">How are you feeling?</DialogTitle>
          <DialogDescription>A quick check-in can make a big difference.</DialogDescription>
        </DialogHeader>
        <div className="py-6 grid grid-cols-3 gap-4">
          {moods.map((mood, index) => (
            <motion.div
              key={mood.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => handleSelectMood(mood.label)}
                className={`w-full p-4 rounded-xl text-center transition-all duration-200 border-2 ${
                  selectedMood === mood.label
                    ? 'bg-purple-100 border-purple-400 scale-105'
                    : 'bg-white hover:bg-slate-100 border-transparent'
                }`}
              >
                <div className="text-4xl">{mood.emoji}</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{mood.label}</div>
              </button>
            </motion.div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}