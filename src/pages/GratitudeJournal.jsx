
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, CheckCircle, BookHeart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useNotifications } from '@/components/SoundManager';
import { format, isToday, parseISO } from 'date-fns';
import SEO from '@/components/SEO';

const fetchGratitudeData = async () => {
    return base44.entities.UserJournalEntry.filter({ journal_type: 'gratitude' }, '-created_date', 100);
};

export default function GratitudeJournalPage() {
    const queryClient = useQueryClient();
    const { playSound, showNotification } = useNotifications();

    const { data: pastEntries = [], isLoading, error } = useQuery({
        queryKey: ['gratitudeJournalData'],
        queryFn: fetchGratitudeData,
    });

    const [gratefulFor, setGratefulFor] = useState(['', '', '']);
    const [intention, setIntention] = useState('');
    const [todayEntryId, setTodayEntryId] = useState(null);

    useEffect(() => {
        const todayEntry = pastEntries.find(entry => isToday(parseISO(entry.created_date)));
        if (todayEntry) {
            setGratefulFor(todayEntry.gratitude_items || ['', '', '']);
            setIntention(todayEntry.tomorrow_intention || '');
            setTodayEntryId(todayEntry.id);
        } else {
            setGratefulFor(['', '', '']);
            setIntention('');
            setTodayEntryId(null);
        }
    }, [pastEntries]);

    const saveEntryMutation = useMutation({
        mutationFn: (entryData) => {
            if (todayEntryId) {
                return base44.entities.UserJournalEntry.update(todayEntryId, entryData);
            } else {
                return base44.entities.UserJournalEntry.create(entryData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['gratitudeJournalData']);
            playSound('success');
            showNotification("Gratitude saved.", { body: "Your positive focus is a gift to yourself." });
        },
        onError: () => {
            playSound('error');
            showNotification("Couldn't save your entry.", { variant: 'destructive' });
        }
    });

    const handleSave = () => {
        const entryData = {
            journal_type: 'gratitude',
            entry_title: `Gratitude for ${format(new Date(), 'MMMM d, yyyy')}`,
            gratitude_items: gratefulFor.filter(item => item.trim() !== ''),
            tomorrow_intention: intention,
        };
        saveEntryMutation.mutate(entryData);
    };

    const handleGratefulChange = (index, value) => {
        const newGratefulFor = [...gratefulFor];
        newGratefulFor[index] = value;
        setGratefulFor(newGratefulFor);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-amber-50">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Gratitude Journal - DobryLife | Daily Gratitude Practice"
                description="Practice daily gratitude with AI-powered prompts and reflections. Build a gratitude habit and improve your mental wellness through thankfulness."
                keywords="gratitude journal, daily gratitude, thankfulness practice, positive thinking, mental wellness, gratitude habit, daily reflection"
            />

            <div style={{ '--primary': '#f59e0b', '--primary-light': '#fef3c7' }} className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4 sm:p-6 md:p-8 font-[Poppins]">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <Link to={createPageUrl('JournalStudio')} className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Journal Studio
                        </Link>
                        <div className="text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block p-4 bg-white rounded-full shadow-md mb-4">
                                <BookHeart className="w-10 h-10 text-amber-500" />
                            </motion.div>
                            <h1 className="text-4xl font-bold text-amber-900 tracking-tight">Gratitude Journal</h1>
                            <p className="text-lg text-amber-700 mt-1">Cultivate joy by focusing on the good in your life.</p>
                        </div>
                    </header>

                    <Card className="shadow-xl border-amber-200/80 bg-white/70 backdrop-blur-sm">
                        <CardHeader className="bg-amber-100/50">
                            <CardTitle className="text-2xl text-amber-800">Today's Gratitude</CardTitle>
                            <CardDescription>Take a moment to reflect on what brought you light today.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <Label className="text-lg font-semibold text-amber-900">What are 3 things you are grateful for today?</Label>
                                <div className="mt-3 space-y-4">
                                    {gratefulFor.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold">{index + 1}</div>
                                            <Textarea
                                                placeholder={`Grateful for...`}
                                                value={item}
                                                onChange={(e) => handleGratefulChange(index, e.target.value)}
                                                className="text-base border-amber-200 focus:ring-amber-500"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="intention" className="text-lg font-semibold text-amber-900">What is your intention for tomorrow?</Label>
                                <Textarea
                                    id="intention"
                                    placeholder="Tomorrow, I will..."
                                    value={intention}
                                    onChange={(e) => setIntention(e.target.value)}
                                    className="mt-2 text-base border-amber-200 focus:ring-amber-500"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} disabled={saveEntryMutation.isPending} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white">
                                {saveEntryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Save Today's Entry
                            </Button>
                        </CardFooter>
                    </Card>

                    <section className="mt-12">
                        <h2 className="text-2xl font-bold text-center text-amber-900 mb-6">Look Back & Smile</h2>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {pastEntries.length > 0 ? (
                                    pastEntries.map(entry => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            layout
                                        >
                                            <Card className="border-amber-100 bg-white/50">
                                                <CardHeader>
                                                    <CardTitle className="text-lg text-amber-800">{format(parseISO(entry.created_date), 'MMMM d, yyyy')}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <h4 className="font-semibold text-amber-900 mb-2">Grateful for:</h4>
                                                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                        {(entry.gratitude_items || []).map((item, i) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                    {entry.tomorrow_intention && (
                                                        <>
                                                            <h4 className="font-semibold text-amber-900 mt-4 mb-2">Intention for the next day:</h4>
                                                            <p className="text-gray-700 italic">"{entry.tomorrow_intention}"</p>
                                                        </>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-center text-amber-700">Your past gratitude entries will appear here.</p>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

