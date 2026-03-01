import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { Loader2, ArrowLeft, CheckCircle, BookHeart, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isToday, parseISO } from 'date-fns';
import SEO from '@/components/SEO';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

const STORAGE_KEY = 'gratitude_journal_entries';

function loadLocalEntries() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocalEntries(entries) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch { }
}

export default function GratitudeJournalPage() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pastEntries, setPastEntries] = useState([]);
    const [gratefulFor, setGratefulFor] = useState(['', '', '']);
    const [intention, setIntention] = useState('');
    const [todayEntryId, setTodayEntryId] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load entries from localStorage (always available) or Supabase (when logged in)
    useEffect(() => {
        const loadEntries = async () => {
            setIsLoading(true);
            try {
                let entries = [];

                if (authUser) {
                    // Try Supabase first
                    const { data, error } = await supabase
                        .from('gratitude_journals')
                        .select('*')
                        .eq('user_id', authUser.id)
                        .order('created_at', { ascending: false })
                        .limit(100);

                    if (!error && data) {
                        entries = data;
                    } else {
                        // Fall back to localStorage if table doesn't exist or error
                        entries = loadLocalEntries();
                    }
                } else {
                    entries = loadLocalEntries();
                }

                setPastEntries(entries);

                // Find today's entry
                const todayEntry = entries.find(e => {
                    const entryDate = e.created_at || e.date;
                    if (!entryDate) return false;
                    try {
                        return isToday(typeof entryDate === 'string' ? parseISO(entryDate) : new Date(entryDate));
                    } catch {
                        return false;
                    }
                });

                if (todayEntry) {
                    setGratefulFor(todayEntry.gratitude_items || ['', '', '']);
                    setIntention(todayEntry.tomorrow_intention || '');
                    setTodayEntryId(todayEntry.id);
                } else {
                    setGratefulFor(['', '', '']);
                    setIntention('');
                    setTodayEntryId(null);
                }
            } catch (err) {
                // Fallback to localStorage on any error
                const entries = loadLocalEntries();
                setPastEntries(entries);
            } finally {
                setIsLoading(false);
            }
        };

        loadEntries();
    }, [authUser]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        const filteredItems = gratefulFor.filter(item => item.trim() !== '');
        const now = new Date().toISOString();

        const entryData = {
            id: todayEntryId || `local_${Date.now()}`,
            gratitude_items: filteredItems,
            tomorrow_intention: intention,
            entry_title: `Gratitude for ${format(new Date(), 'MMMM d, yyyy')}`,
            created_at: now,
            date: format(new Date(), 'yyyy-MM-dd'),
        };

        try {
            if (authUser) {
                // Try saving to Supabase
                const supabaseData = {
                    user_id: authUser.id,
                    gratitude_items: filteredItems,
                    tomorrow_intention: intention,
                    entry_title: entryData.entry_title,
                    updated_at: now,
                };

                if (todayEntryId && !String(todayEntryId).startsWith('local_')) {
                    const { error } = await supabase
                        .from('gratitude_journals')
                        .update(supabaseData)
                        .eq('id', todayEntryId);

                    if (error) throw error;
                } else {
                    const { data, error } = await supabase
                        .from('gratitude_journals')
                        .insert({ ...supabaseData, created_at: now })
                        .select()
                        .single();

                    if (error) throw error;
                    if (data) {
                        setTodayEntryId(data.id);
                        entryData.id = data.id;
                    }
                }

                // Reload from Supabase
                const { data: refreshed } = await supabase
                    .from('gratitude_journals')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (refreshed) setPastEntries(refreshed);
            } else {
                // Save to localStorage
                const existing = loadLocalEntries();
                let updated;

                if (todayEntryId) {
                    updated = existing.map(e => e.id === todayEntryId ? { ...e, ...entryData } : e);
                } else {
                    updated = [entryData, ...existing];
                    setTodayEntryId(entryData.id);
                }

                saveLocalEntries(updated);
                setPastEntries(updated);
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            // Fallback: save to localStorage even if Supabase fails
            const existing = loadLocalEntries();
            let updated;

            if (todayEntryId) {
                updated = existing.map(e => e.id === todayEntryId ? { ...e, ...entryData } : e);
            } else {
                updated = [entryData, ...existing];
                setTodayEntryId(entryData.id);
            }

            saveLocalEntries(updated);
            setPastEntries(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleGratefulChange = (index, value) => {
        const updated = [...gratefulFor];
        updated[index] = value;
        setGratefulFor(updated);
    };

    const handleDeleteEntry = (entryId) => {
        const updated = pastEntries.filter(e => e.id !== entryId);
        setPastEntries(updated);
        saveLocalEntries(updated);

        if (entryId === todayEntryId) {
            setTodayEntryId(null);
            setGratefulFor(['', '', '']);
            setIntention('');
        }

        if (authUser && !String(entryId).startsWith('local_')) {
            (async () => { try { await supabase.from('gratitude_journals').delete().eq('id', entryId); } catch { } })();
        }
    };

    const getEntryDate = (entry) => {
        const dateStr = entry.created_at || entry.date;
        if (!dateStr) return 'Unknown date';
        try {
            return format(typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr), 'MMMM d, yyyy');
        } catch {
            return 'Unknown date';
        }
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
                title="Gratitude Journal - Helper33 | Daily Gratitude Practice"
                description="Practice daily gratitude with AI-powered prompts and reflections. Build a gratitude habit and improve your mental wellness through thankfulness."
                keywords="gratitude journal, daily gratitude, thankfulness practice, positive thinking, mental wellness, gratitude habit, daily reflection"
            />

            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4 sm:p-6 md:p-8 font-[Poppins]" style={/** @type {any} */({ '--primary': '#f59e0b', '--primary-light': '#fef3c7' })}>
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        {/* Back button — goes back to Wellness page */}
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors mb-4 cursor-pointer bg-transparent border-none p-0"
                            type="button"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </button>
                        <div className="text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block p-4 bg-white rounded-full shadow-md mb-4">
                                <BookHeart className="w-10 h-10 text-amber-500" />
                            </motion.div>
                            <h1 className="text-4xl font-bold text-amber-900 tracking-tight">Gratitude Journal</h1>
                            <p className="text-lg text-amber-700 mt-1">Cultivate joy by focusing on the good in your life.</p>
                            {!authUser && (
                                <p className="text-sm text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
                                    📝 Your entries are saved locally.{' '}
                                    <Link to={createPageUrl('Login')} className="font-semibold underline">Sign in</Link> to sync across devices.
                                </p>
                            )}
                        </div>
                    </header>

                    <Card className="shadow-xl border-amber-200/80 bg-white/70 backdrop-blur-sm">
                        <CardHeader className="bg-amber-100/50">
                            <CardTitle className="text-2xl text-amber-800">Today's Gratitude</CardTitle>
                            <CardDescription>Take a moment to reflect on what brought you light today.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <label className="text-lg font-semibold text-amber-900">What are 3 things you are grateful for today?</label>
                                <div className="mt-3 space-y-4">
                                    {gratefulFor.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold mt-1">
                                                {index + 1}
                                            </div>
                                            <textarea
                                                placeholder="Grateful for..."
                                                value={item}
                                                onChange={(e) => handleGratefulChange(index, e.target.value)}
                                                className="flex-1 min-h-[60px] px-3 py-2 text-base border border-amber-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-y text-gray-800 placeholder:text-gray-400"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="intention" className="text-lg font-semibold text-amber-900">What is your intention for tomorrow?</label>
                                <textarea
                                    id="intention"
                                    placeholder="Tomorrow, I will..."
                                    value={intention}
                                    onChange={(e) => setIntention(e.target.value)}
                                    className="mt-2 w-full min-h-[80px] px-3 py-2 text-base border border-amber-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-y text-gray-800 placeholder:text-gray-400"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center gap-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="sm:w-auto bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60"
                            >
                                {isSaving
                                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                                    : <><CheckCircle className="w-4 h-4 mr-2" />Save Today's Entry</>
                                }
                            </Button>
                            {saveSuccess && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-green-600 font-medium text-sm flex items-center gap-1"
                                >
                                    <CheckCircle className="w-4 h-4" /> Saved!
                                </motion.span>
                            )}
                        </CardFooter>
                    </Card>

                    {pastEntries.length > 0 && (
                        <section className="mt-12">
                            <h2 className="text-2xl font-bold text-center text-amber-900 mb-6">Look Back & Smile</h2>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {pastEntries.map(entry => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            layout
                                        >
                                            <Card className="border-amber-100 bg-white/50">
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                    <CardTitle className="text-lg text-amber-800">{getEntryDate(entry)}</CardTitle>
                                                    <button
                                                        onClick={() => handleDeleteEntry(entry.id)}
                                                        className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                                                        title="Delete entry"
                                                        type="button"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </CardHeader>
                                                <CardContent>
                                                    {(entry.gratitude_items || []).length > 0 && (
                                                        <>
                                                            <h4 className="font-semibold text-amber-900 mb-2">Grateful for:</h4>
                                                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                                                {(entry.gratitude_items || []).map((item, i) => <li key={i}>{item}</li>)}
                                                            </ul>
                                                        </>
                                                    )}
                                                    {entry.tomorrow_intention && (
                                                        <>
                                                            <h4 className="font-semibold text-amber-900 mt-4 mb-2">Intention for the next day:</h4>
                                                            <p className="text-gray-700 italic">"{entry.tomorrow_intention}"</p>
                                                        </>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    )}

                    {pastEntries.length === 0 && (
                        <p className="text-center text-amber-700 mt-8">Your past gratitude entries will appear here once you save your first one.</p>
                    )}
                </div>
            </div>
        </>
    );
}
