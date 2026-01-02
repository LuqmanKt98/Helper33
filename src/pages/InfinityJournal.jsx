
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, BookHeart, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useNotifications } from '@/components/SoundManager';
import { journalPrompts } from '@/components/journal/InfinityJournalPrompts';
import SubscriptionGate from '@/components/SubscriptionGate';
import SEO from '@/components/SEO'; // Added import

const fetchInfinityJournalData = async () => {
    const [entries, user] = await Promise.all([
        base44.entities.UserJournalEntry.filter({ journal_type: 'infinity' }, '-created_date', 100),
        base44.auth.me(),
    ]);
    return { entries, user };
};

function InfinityJournalContent() {
    const queryClient = useQueryClient();
    const { playSound, showNotification } = useNotifications();

    const { data, isLoading, error } = useQuery({
        queryKey: ['infinityJournalData'],
        queryFn: fetchInfinityJournalData,
    });

    const [currentDay, setCurrentDay] = useState(1);
    const [currentEntryContent, setCurrentEntryContent] = useState('');

    const completedDays = useMemo(() => {
        if (!data?.entries) return new Set();
        return new Set(data.entries.map(e => e.reflection_day));
    }, [data?.entries]);

    useEffect(() => {
        if (data) {
            // Find the first uncompleted day
            let firstUncompleted = 1;
            while(completedDays.has(firstUncompleted) && firstUncompleted < 21) {
                firstUncompleted++;
            }
            handleSelectDay(firstUncompleted);
        }
    }, [data, completedDays]);
    
    const saveEntryMutation = useMutation({
        mutationFn: async (newEntry) => {
            const existingEntry = data.entries.find(e => e.reflection_day === newEntry.reflection_day);
            if (existingEntry) {
                return base44.entities.UserJournalEntry.update(existingEntry.id, newEntry);
            } else {
                return base44.entities.UserJournalEntry.create(newEntry);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['infinityJournalData']);
            playSound('success');
            showNotification("Your reflection is saved.", { body: "One breath at a time. You are healing." });
        },
        onError: () => {
            playSound('error');
            showNotification("Couldn't save your entry.", { variant: 'destructive' });
        }
    });

    const handleSaveEntry = () => {
        if (!currentEntryContent.trim()) return;
        saveEntryMutation.mutate({
            journal_type: 'infinity',
            reflection_day: currentDay,
            entry_title: `Infinity Journal - Day ${currentDay}: ${journalPrompts[currentDay-1].theme}`,
            entry_content: currentEntryContent,
        });
    };
    
    const handleSelectDay = useCallback((day) => {
        setCurrentDay(day);
        const existingEntry = data?.entries.find(e => e.reflection_day === day);
        setCurrentEntryContent(existingEntry?.entry_content || '');
    }, [data?.entries]);

    const currentPrompt = journalPrompts[currentDay - 1];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-emerald-50">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
                <Alert variant="destructive">
                    <AlertTitle>Error Loading Journal</AlertTitle>
                    <AlertDescription>{error.message || "Could not load your journal data. Please try again."}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
                {/* New introductory Card */}
                <Card className="p-8 mb-8 shadow-md border-emerald-200/50 bg-white/60 backdrop-blur-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <BookHeart className="w-8 h-8 text-emerald-600" />
                        <h1 className="text-3xl font-bold text-emerald-900">Infinity Journal</h1>
                    </div>
                    <p className="text-emerald-700">
                        Welcome to your Infinity Journal - a safe space for deep reflection and emotional exploration.
                    </p>
                </Card>

                <header className="mb-8">
                    <Link to={createPageUrl('JournalStudio')} className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Journal Studio
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">The Infinity Journal</h1>
                            <p className="text-lg text-teal-700 mt-1">A 21-Day Guided Journey Through Grief</p>
                        </div>
                         <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="bg-white border-emerald-200 text-emerald-800 gap-1 text-sm py-1.5 px-3 shadow-sm">
                                <BookHeart className="w-4 h-4" /> {completedDays.size} / 21 Days Completed
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content: Current Day's Prompt */}
                    <main className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentDay}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                <Card className="shadow-xl border-emerald-200/50 bg-white/60 backdrop-blur-lg overflow-hidden">
                                     <CardHeader className="bg-white/70 p-6">
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 w-fit">Day {currentDay}</Badge>
                                        <CardTitle className="text-3xl font-bold text-emerald-900 mt-2">{currentPrompt.theme}</CardTitle>
                                        <CardDescription className="text-teal-700 italic text-base">"{currentPrompt.affirmation}"</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="prose prose-lg max-w-none text-gray-700 mb-6">
                                            <p className="font-semibold text-lg">{currentPrompt.prompt}</p>
                                        </div>
                                        <Textarea
                                            id="journal-entry"
                                            placeholder="Let your thoughts flow. No judgment. No filters."
                                            className="h-64 text-base border-emerald-200 focus:ring-emerald-400 bg-white/50"
                                            value={currentEntryContent}
                                            onChange={(e) => setCurrentEntryContent(e.target.value)}
                                        />
                                    </CardContent>
                                    <CardFooter className="bg-white/70 p-6">
                                        <Button onClick={handleSaveEntry} disabled={saveEntryMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                                            {saveEntryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                                            Save Today's Reflection
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {/* Sidebar: Progress Tracker */}
                    <aside className="space-y-6 lg:sticky lg:top-8">
                        <Card className="shadow-lg border-emerald-200/30 bg-white/60 backdrop-blur-lg">
                            <CardHeader>
                                <CardTitle className="text-emerald-900">Your Journey</CardTitle>
                                <CardDescription className="text-teal-800">Select a day to view or edit.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {journalPrompts.map(prompt => (
                                        <motion.button
                                            key={prompt.day}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSelectDay(prompt.day)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200
                                                ${currentDay === prompt.day 
                                                    ? 'bg-emerald-600 text-white ring-2 ring-offset-2 ring-emerald-500 shadow-lg' 
                                                    : completedDays.has(prompt.day) 
                                                        ? 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300' 
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            {prompt.day}
                                        </motion.button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default function InfinityJournal() {
  return (
    <>
      <SEO 
        title="Infinity Journal - DobryLife | 21-Day Guided Grief Journey"
        description="Experience the Infinity Journal - a 21-day guided journey through grief and healing. Compassionate prompts, AI support, and therapeutic writing exercises."
        keywords="grief journal, 21-day journal, guided grief journey, healing journal, bereavement journal, loss journal, therapeutic writing, grief recovery"
      />
      
      <SubscriptionGate requiredPlan="pro_monthly" feature="Infinity Journal">
        <InfinityJournalContent />
      </SubscriptionGate>
    </>
  );
}
