
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Eye, Heart, ArrowLeft } from 'lucide-react';

const affirmations = [
    "I am calm and centered.",
    "I release what I cannot control.",
    "I am grounded and stable.",
    "This moment is a new beginning.",
    "I have the strength to get through this.",
    "I breathe in peace and exhale stress.",
    "I am doing my best, and that is enough."
];

const BreathingExercise = () => {
    const [step, setStep] = useState(0);
    const steps = ["Breathe In...", "Hold...", "Breathe Out...", "Hold..."];
    const durations = [4000, 4000, 6000, 2000];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prevStep) => (prevStep + 1) % steps.length);
        }, durations[step]);

        return () => clearInterval(timer);
    }, [step]);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-64">
            <motion.div
                key={step}
                animate={{ scale: [1, 1.2, 1], transition:{ duration: durations[step]/1000, ease: "easeInOut", repeat: Infinity} }}
                className="w-32 h-32 bg-gradient-to-br from-sky-200 to-sky-400 rounded-full flex items-center justify-center shadow-lg"
            />
            <motion.p
                key={steps[step]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-xl font-semibold text-sky-800"
            >
                {steps[step]}
            </motion.p>
        </div>
    );
};

const GroundingExercise = () => (
    <div className="p-6 space-y-4 text-slate-700">
        <h3 className="font-bold text-lg text-slate-800">5-4-3-2-1 Grounding Technique</h3>
        <p>Acknowledge the following to bring yourself to the present moment:</p>
        <ul className="space-y-3 list-disc list-inside">
            <li><strong>5 things</strong> you can see around you.</li>
            <li><strong>4 things</strong> you can touch.</li>
            <li><strong>3 things</strong> you can hear right now.</li>
            <li><strong>2 things</strong> you can smell.</li>
            <li><strong>1 thing</strong> you can taste.</li>
        </ul>
    </div>
);

const Affirmation = () => {
    const affirmation = useMemo(() => affirmations[Math.floor(Math.random() * affirmations.length)], []);
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-64">
            <Heart className="w-16 h-16 text-rose-400 mb-6" />
            <p className="text-2xl font-semibold text-rose-800 leading-relaxed">"{affirmation}"</p>
        </div>
    );
};

export default function MindfulMoment({ isOpen, onClose, habitName, onMoodSelect, onSkip }) {
    const [view, setView] = useState('menu'); // 'menu', 'breathe', 'ground', 'affirm'

    const handleClose = () => {
        onClose();
        setTimeout(() => setView('menu'), 300); // Reset view after closing animation
    };

    const handleActionClose = () => {
      // For general mindful moments, just close. For habit-related, trigger skip.
      if (onSkip) {
        onSkip();
      } else {
        handleClose();
      }
    }

    const renderContent = () => {
        switch (view) {
            case 'breathe': return <BreathingExercise />;
            case 'ground': return <GroundingExercise />;
            case 'affirm': return <Affirmation />;
            default: return (
                <div className="p-6 space-y-4">
                    <Button variant="outline" className="w-full h-20 text-lg justify-start p-6" onClick={() => setView('breathe')}>
                        <Wind className="w-6 h-6 mr-4 text-sky-500" /> Guided Breathing
                    </Button>
                    <Button variant="outline" className="w-full h-20 text-lg justify-start p-6" onClick={() => setView('ground')}>
                        <Eye className="w-6 h-6 mr-4 text-emerald-500" /> 5-4-3-2-1 Grounding
                    </Button>
                    <Button variant="outline" className="w-full h-20 text-lg justify-start p-6" onClick={() => setView('affirm')}>
                        <Heart className="w-6 h-6 mr-4 text-rose-500" /> Quick Affirmation
                    </Button>
                </div>
            );
        }
    };

    const moodButtons = [
        { mood: 'calm', label: 'Calm', color: 'bg-blue-100 text-blue-800' },
        { mood: 'proud', label: 'Proud', color: 'bg-purple-100 text-purple-800' },
        { mood: 'focused', label: 'Focused', color: 'bg-yellow-100 text-yellow-800' },
        { mood: 'grateful', label: 'Grateful', color: 'bg-pink-100 text-pink-800' },
        { mood: 'relaxed', label: 'Relaxed', color: 'bg-green-100 text-green-800' },
    ];
    
    // Only render the modal if it's open, to avoid animation issues on page load
    if (!isOpen) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent data-card className="bg-slate-50 border-0 sm:max-w-md">
                <DialogHeader>
                    {habitName ? (
                        <>
                        <DialogTitle className="text-2xl font-bold text-slate-800">Great Job!</DialogTitle>
                        <DialogDescription>You've completed "{habitName}". How do you feel now?</DialogDescription>
                        </>
                    ) : (
                        <>
                        <DialogTitle className="text-2xl font-bold text-slate-800">Mindful Moment</DialogTitle>
                        <DialogDescription>Take a short break to reset and refocus.</DialogDescription>
                        </>
                    )}
                </DialogHeader>
                
                {habitName ? (
                    <div className="py-4 space-y-2">
                        {moodButtons.map(item => (
                            <Button key={item.mood} variant="outline" className={`w-full justify-start h-12 text-base ${item.color}`} onClick={() => onMoodSelect(item.mood)}>
                                {item.label}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, x: view === 'menu' ? 0 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                )}


                <DialogFooter className="flex w-full" style={{ justifyContent: view !== 'menu' && !habitName ? 'space-between' : 'flex-end' }}>
                    {view !== 'menu' && !habitName && (
                        <Button variant="ghost" onClick={() => setView('menu')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    )}
                    {habitName ? (
                        <Button variant="ghost" onClick={handleActionClose}>
                            Skip for now
                        </Button>
                    ) : (
                        <Button onClick={handleActionClose} className="bg-slate-800 hover:bg-slate-700">
                            Done
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
