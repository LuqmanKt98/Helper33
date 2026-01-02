
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Download, Sparkles, BookHeart, Lock, CheckCircle, Mic, Square, Flame, Play, Pause, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useNotifications } from '@/components/SoundManager';

const fetchHeartShiftData = async () => {
    const [reflections, entries, user, supportCoaches] = await Promise.all([
        base44.entities.JournalReflection.filter({ journal_type: 'heart_shift' }, '-day_number', 500),
        base44.entities.UserJournalEntry.filter({ journal_type: 'heart_shift' }, '-created_date', 500),
        base44.auth.me(),
        base44.entities.SupportCoach.list(),
    ]);
    return { reflections, entries, user, supportCoaches };
};

const HeartShiftJournalPage = () => {
    const queryClient = useQueryClient();
    const { playSound, showNotification } = useNotifications();

    const { data, isLoading, error } = useQuery({
        queryKey: ['heartShiftData'],
        queryFn: fetchHeartShiftData,
    });

    const [currentDay, setCurrentDay] = useState(1);
    const [activePhase, setActivePhase] = useState('1');
    const [currentEntryContent, setCurrentEntryContent] = useState('');
    const [currentMantra, setCurrentMantra] = useState('');
    const [currentMood, setCurrentMood] = useState('😐');
    const [isAiCoachEnabled, setIsAiCoachEnabled] = useState(data?.user?.app_settings?.journal_settings?.heart_shift_ai_enabled ?? false);
    const [isPersonaIntegrationEnabled, setIsPersonaIntegrationEnabled] = useState(data?.user?.app_settings?.journal_settings?.heart_shift_persona_integration_enabled ?? false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [dayStreak, setDayStreak] = useState(0);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Voice playback state
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const audioRef = useRef(null);
    const progressIntervalRef = useRef(null);

    const hasGriefPersona = useMemo(() => data?.supportCoaches && data.supportCoaches.length > 0, [data?.supportCoaches]);

    const uniqueReflections = useMemo(() => {
        if (!data?.reflections) return [];
        const reflectionMap = new Map();
        // The fetch is sorted by -created_date, so the first one we see for a day_number is the newest.
        // Or if backend ensures uniqueness per day_number, this step deduplicates to a single reflection.
        for (const reflection of data.reflections) {
            if (!reflectionMap.has(reflection.day_number)) {
                reflectionMap.set(reflection.day_number, reflection);
            }
        }
        // Re-sort by day_number for chronological UI display.
        return Array.from(reflectionMap.values()).sort((a,b) => a.day_number - b.day_number);
    }, [data?.reflections]);

    const phases = useMemo(() => {
        if (!uniqueReflections) return [];
        const phaseMap = uniqueReflections.reduce((acc, reflection) => {
            const { phase_number, phase_title } = reflection;
            if (!acc[phase_number]) {
                acc[phase_number] = {
                    number: phase_number,
                    title: phase_title,
                    prompts: [],
                };
            }
            acc[phase_number].prompts.push(reflection);
            return acc;
        }, {});
        return Object.values(phaseMap).sort((a, b) => a.number - b.number);
    }, [uniqueReflections]);

    const completedDays = useMemo(() => {
        if (!data?.entries) return new Set();
        return new Set(data.entries.map(e => e.reflection_day));
    }, [data?.entries]);

    useEffect(() => {
        if (data) {
            const lastCompletedDay = Math.max(0, ...Array.from(completedDays));
            const nextDay = Math.min(lastCompletedDay + 1, 66);
            setCurrentDay(nextDay);
            
            const currentReflection = uniqueReflections.find(r => r.day_number === nextDay);
            if (currentReflection) {
                setActivePhase(String(currentReflection.phase_number));
            }

            const existingEntry = data.entries.find(e => e.reflection_day === nextDay);
            if (existingEntry) {
                 const [content, mantraPart] = existingEntry.entry_content.split('\n\nMantra: ');
                 setCurrentEntryContent(content || '');
                 setCurrentMantra(mantraPart || '');
                 setCurrentMood(existingEntry.mood || '😐');
            } else {
                setCurrentEntryContent('');
                setCurrentMantra('');
                setCurrentMood('😐');
            }

            setIsAiCoachEnabled(data.user?.app_settings?.journal_settings?.heart_shift_ai_enabled ?? false);
            setIsPersonaIntegrationEnabled(data.user?.app_settings?.journal_settings?.heart_shift_persona_integration_enabled ?? false);

            // Calculate streak
            let currentStreak = 0;
            if (completedDays.has(lastCompletedDay)) {
                for (let i = lastCompletedDay; i > 0; i--) {
                    if (completedDays.has(i)) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
            setDayStreak(currentStreak);
        }
    }, [data, completedDays, uniqueReflections]);
    
    const handleVoiceRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            showNotification("Recording stopped.", { body: "Processing your voice entry..." });
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], `heartshift_day_${currentDay}.webm`, { type: 'audio/webm' });
                    
                    try {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
                        
                        saveEntryMutation.mutate({
                            journal_type: 'heart_shift',
                            reflection_day: currentDay,
                            entry_title: `Voice Journal - Day ${currentDay}`,
                            entry_content: currentEntryContent || "Listen to my voice journal.",
                            mood: currentMood,
                            voice_recording_url: file_url,
                        });

                    } catch (uploadError) {
                        console.error("Error uploading voice recording:", uploadError);
                        showNotification("Failed to upload recording.", { variant: "destructive" });
                    }
                };
                
                mediaRecorderRef.current.start();
                setIsRecording(true);
                showNotification("Recording started...", { body: "Speak your truth. Click the button again to stop." });

            } catch (err) {
                console.error("Error accessing microphone:", err);
                showNotification("Microphone access denied.", { variant: "destructive", body: "Please enable microphone permissions in your browser settings." });
            }
        }
    };

    const handlePlayVoice = useCallback((voiceUrl) => {
        // If an audio is already playing and it's the same URL, toggle pause/play
        if (audioRef.current && audioRef.current.src === voiceUrl) {
            if (audioRef.current.paused) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
            return;
        }

        // If a different audio is playing, stop it first
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset time for the old audio
            audioRef.current = null;
        }

        // Create new audio instance
        audioRef.current = new Audio(voiceUrl);
        
        audioRef.current.onplay = () => {
            setIsPlayingVoice(true);
            progressIntervalRef.current = setInterval(() => {
                if (audioRef.current) {
                    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                    setAudioProgress(progress);
                }
            }, 100);
        };
        
        audioRef.current.onpause = () => {
            setIsPlayingVoice(false);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
        
        audioRef.current.onended = () => {
            setIsPlayingVoice(false);
            setAudioProgress(0);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            audioRef.current = null; // Clear the audio ref when playback ends
        };
        
        audioRef.current.play();
    }, []);

    useEffect(() => {
        // Cleanup function for when component unmounts or dependencies change
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    const updateCoachSettingMutation = useMutation({
        mutationFn: async (isEnabled) => {
            const currentSettings = data.user.app_settings || {};
            const journalSettings = currentSettings.journal_settings || {};
            await base44.auth.updateMe({ 
                app_settings: {
                    ...currentSettings,
                    journal_settings: {
                        ...journalSettings,
                        heart_shift_ai_enabled: isEnabled,
                    },
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['heartShiftData']);
            showNotification("Privacy setting updated!");
        },
        onError: () => {
            showNotification("Failed to update setting.", { variant: 'destructive' });
        }
    });

    const handleToggleAiCoach = (isEnabled) => {
        setIsAiCoachEnabled(isEnabled);
        updateCoachSettingMutation.mutate(isEnabled);
    };

    const updatePersonaIntegrationMutation = useMutation({
        mutationFn: async (isEnabled) => {
            const currentSettings = data.user.app_settings || {};
            const journalSettings = currentSettings.journal_settings || {};
            await base44.auth.updateMe({
                app_settings: {
                    ...currentSettings,
                    journal_settings: {
                        heart_shift_persona_integration_enabled: isEnabled,
                    },
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['heartShiftData']);
            showNotification("Persona integration setting updated!");
        },
        onError: () => {
            showNotification("Failed to update setting.", { variant: 'destructive' });
        }
    });

    const handleTogglePersonaIntegration = (isEnabled) => {
        if (!hasGriefPersona) return; // Prevent interaction if no persona exists
        setIsPersonaIntegrationEnabled(isEnabled);
        updatePersonaIntegrationMutation.mutate(isEnabled);
    };

    const saveEntryMutation = useMutation({
        mutationFn: async (newEntry) => {
            const existingEntry = data.entries.find(e => e.reflection_day === newEntry.reflection_day);
            const contentToSave = newEntry.voice_recording_url 
                ? newEntry.entry_content 
                : `${newEntry.entry_content}\n\nMantra: ${currentMantra}`;

            const payload = {
                ...newEntry,
                entry_content: contentToSave,
                shared_with_coach: isPersonaIntegrationEnabled
            };

            if (existingEntry) {
                return base44.entities.UserJournalEntry.update(existingEntry.id, payload);
            } else {
                return base44.entities.UserJournalEntry.create(payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['heartShiftData']);
            playSound('success');
            showNotification("Your reflection has been saved.", { body: "Healing is a journey, not a destination." });
        },
        onError: () => {
            playSound('error');
            showNotification("Couldn't save your entry. Please try again.", { variant: 'destructive' });
        }
    });

    const handleSaveEntry = () => {
        if (!currentEntryContent.trim() && !currentMantra.trim()) return;
        saveEntryMutation.mutate({
            journal_type: 'heart_shift',
            reflection_day: currentDay,
            entry_title: `HeartShift - Day ${currentDay}`,
            entry_content: currentEntryContent,
            mood: currentMood,
        });
    };
    
    const handleSelectDay = (day) => {
        // Stop any playing audio when switching days
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setIsPlayingVoice(false);
        setAudioProgress(0);
        
        setCurrentDay(day);
        const existingEntry = data.entries.find(e => e.reflection_day === day);
        if (existingEntry) {
            const [content, mantraPart] = (existingEntry.entry_content || '').split('\n\nMantra: ');
            setCurrentEntryContent(content || '');
            setCurrentMantra(mantraPart || '');
            setCurrentMood(existingEntry.mood || '😐');
        } else {
            setCurrentEntryContent('');
            setCurrentMantra('');
            setCurrentMood('😐');
        }
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        setShowSummaryModal(true);
        setSummary('');

        const allEntriesContent = data.entries
            .sort((a,b) => a.reflection_day - b.reflection_day)
            .map(e => `Day ${e.reflection_day}: ${e.entry_content}`)
            .join('\n\n');

        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a highly empathetic AI therapist specializing in narrative analysis. Your task is to generate a Personal Growth Summary for a user based *exclusively* on the provided journal entries from their "HeartShift Journal". It is critical that you do not invent, infer beyond the text, or add any information not present in the user's writing.

                Your summary must be accurate, compassionate, and directly tied to the user's expressed thoughts and feelings. Follow these steps precisely:

                1.  **Acknowledge their Journey:** Begin with a warm, acknowledging sentence that references their dedication to journaling through their heartbreak.
                2.  **Identify Key Themes (Strictly from Text):** Analyze the entries to find 2-3 recurring emotional themes or patterns. You MUST ground these themes in the text. For example: "A key theme I noticed was your journey with anger. On Day [X], you wrote '[quote]', and by Day [Y], your perspective shifted to '[quote]'."
                3.  **Highlight a Moment of Strength:** Find a specific entry where the user showed resilience, self-compassion, or a significant insight. Quote it directly. For example: "A particularly powerful moment was on Day [Z], when you wrote, '[direct quote of their insight]'. This shows remarkable self-awareness."
                4.  **Offer a Forward-Looking Reflection:** End with an encouraging statement that reflects their progress *as seen in the entries* and empowers them for their continued journey.
                5.  **Maintain Tone:** The tone must be supportive, non-judgemental, and deeply respectful of the user's vulnerability.

                CRITICAL INSTRUCTION: Do not make up summaries. Your entire analysis must be derived from the following journal entries provided by the user. If the entries are brief or not present, your summary should reflect that limitation.

                User's Journal Entries:
                ${allEntriesContent}`,
            });
            setSummary(result);
        } catch (e) {
            setSummary("There was an error generating your summary. Please try again later.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handlePdfExport = async () => {
        showNotification("Generating your PDF...", { body: "This may take a moment." });
        try {
            const response = await base44.functions.invoke('generatePDF', {
                content_type: 'heart_shift_journal',
                data: {
                    entries: data.entries,
                    reflections: uniqueReflections,
                },
                title: "My HeartShift Journal",
                options: {
                    paperSize: "A4",
                    font: "Poppins",
                    includeCoverPage: true,
                    includeDate: true,
                    margin: "1in"
                }
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'HeartShift-Journal.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (pdfError) {
            showNotification("Failed to generate PDF.", { variant: 'destructive' });
            console.error("PDF Export Error:", pdfError);
        }
    };

    const currentReflection = useMemo(() => {
        return uniqueReflections.find(r => r.day_number === currentDay);
    }, [uniqueReflections, currentDay]);

    const currentEntry = useMemo(() => {
        return data?.entries.find(e => e.reflection_day === currentDay);
    }, [data?.entries, currentDay]);
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f9f8f7]">
                <Loader2 className="w-12 h-12 text-[#b7c6b1] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f9f8f7] p-4">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message || "Failed to load journal data."}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const moodOptions = ["😢","😔","😐","🙂","🌸"];
    const moodMap = { "😢": "sad", "😔": "confused", "😐": "mixed", "🙂": "hopeful", "🌸": "peaceful"};
    const emojiMap = {"sad": "😢", "confused": "😔", "mixed": "😐", "hopeful": "🙂", "peaceful": "🌸", "grateful": "🌸", "angry": "😔", "numb": "😔"};

    return (
        <div style={{'--primary-color': '#b7c6b1', '--secondary-color': '#f9f8f7', '--accent-color': '#dcbfac', '--text-color': '#2f2f2f', background: 'linear-gradient(to bottom, #fffdfb, #f9f8f7)'}} className="min-h-screen p-4 sm:p-6 md:p-8 font-[Poppins]">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <Link to={createPageUrl('JournalStudio')} className="inline-flex items-center text-sm font-medium text-[var(--text-color)] hover:opacity-70 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Journal Studio
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-[var(--text-color)] tracking-tight">HeartShift Journal</h1>
                            <p className="text-lg text-gray-500 mt-1">A 66-Day Journey from Grief to Growth</p>
                        </div>
                         <div className="flex items-center gap-2">
                            {dayStreak > 1 && (
                                <Badge variant="secondary" className="bg-[var(--accent-color)] text-white gap-1 text-sm py-1.5 px-3">
                                    <Flame className="w-4 h-4" /> {dayStreak} Day Streak!
                                </Badge>
                            )}
                             <Button variant="outline" onClick={handlePdfExport} disabled={data?.entries.length === 0} className="border-[var(--primary-color)] text-[var(--text-color)] hover:bg-[var(--primary-color)] hover:text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button onClick={handleGenerateSummary} disabled={completedDays.size < 5} className="bg-[var(--primary-color)] hover:opacity-90 text-white">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Growth Summary
                            </Button>
                        </div>
                    </div>
                </header>

                 {completedDays.size === 0 && (
                    <Card className="mb-8 bg-white/50 border-[var(--accent-color)]/30 text-center shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[var(--text-color)]">HeartShift: 66 Days from Grief to Growth</CardTitle>
                            <CardDescription className="text-gray-600 text-base max-w-3xl mx-auto">Navigate heartbreak through daily reflections, healing science, and emotional renewal.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
                                This 66-day breakup recovery journal helps you gently move through pain using proven psychology tools: CBT, self-compassion, mindfulness, and narrative therapy. Each prompt encourages clarity, forgiveness, and rediscovery of self.
                            </p>
                            <Button onClick={() => handleSelectDay(1)} className="bg-[var(--primary-color)] hover:opacity-90 text-white px-8 py-6 text-lg">
                                Begin My Healing
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {completedDays.size === 66 && (
                    <Alert className="mb-8 bg-green-50 border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <AlertTitle className="text-green-800 text-lg font-bold">Congratulations!</AlertTitle>
                        <AlertDescription className="text-green-700">
                           You have completed all 66 days of HeartShift. Healing is not forgetting—it's remembering with peace.
                           <div className="mt-4 flex gap-2">
                               <Button size="sm" onClick={handlePdfExport} className="bg-green-600 hover:bg-green-700 text-white">
                                   <Download className="w-4 h-4 mr-2"/> Export as Printable Journal
                               </Button>
                               <Button size="sm" variant="outline" onClick={handleGenerateSummary}>
                                   <Sparkles className="w-4 h-4 mr-2"/> View Growth Summary
                               </Button>
                           </div>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    <main className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentDay}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                                <Card className="shadow-lg border-[var(--primary-color)]/30 bg-white/70">
                                     <CardHeader className="bg-white/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant="secondary" className="bg-[var(--accent-color)]/20 text-[var(--text-color)] border-[var(--accent-color)]/30">Day {currentDay} of 66</Badge>
                                                <CardTitle className="text-2xl font-bold text-[var(--text-color)] mt-2">{currentReflection?.title || currentReflection?.goal}</CardTitle>
                                            </div>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Button size="icon" onClick={handleVoiceRecording} variant={isRecording ? "destructive" : "outline"} className="rounded-full w-12 h-12">
                                                    {isRecording ? <Square className="w-5 h-5"/> : <Mic className="w-5 h-5 text-[var(--text-color)]"/>}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {/* Voice Recording Playback Section */}
                                        {currentEntry?.voice_recording_url && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Volume2 className="w-5 h-5 text-purple-600" />
                                                    <h3 className="text-base font-semibold text-purple-900">Voice Journal Entry</h3>
                                                    <Badge className="bg-purple-100 text-purple-700 border-purple-300">Audio</Badge>
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        size="lg"
                                                        onClick={() => handlePlayVoice(currentEntry.voice_recording_url)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                                                    >
                                                        {isPlayingVoice && audioRef.current && audioRef.current.src === currentEntry.voice_recording_url ? (
                                                            <Pause className="w-6 h-6" />
                                                        ) : (
                                                            <Play className="w-6 h-6 ml-0.5" />
                                                        )}
                                                    </Button>
                                                    
                                                    <div className="flex-1">
                                                        <div className="relative h-2 bg-purple-200 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                                style={{ width: `${isPlayingVoice && audioRef.current && audioRef.current.src === currentEntry.voice_recording_url ? audioProgress : 0}%` }}
                                                                transition={{ duration: 0.1 }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-purple-600 mt-1">
                                                            {isPlayingVoice && audioRef.current && audioRef.current.src === currentEntry.voice_recording_url ? 'Playing...' : 'Click play to listen to your voice entry'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="prose prose-lg max-w-none text-gray-600 mb-6">
                                            <p>{currentReflection?.reflective_prompt}</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="journal-entry" className="text-base font-semibold text-[var(--text-color)]">Reflection Prompt</Label>
                                                <Textarea
                                                    id="journal-entry"
                                                    placeholder="Write freely. There's no right answer, only your truth."
                                                    className="h-48 text-base border-[var(--primary-color)]/40 focus:ring-[var(--primary-color)] mt-1"
                                                    value={currentEntryContent}
                                                    onChange={(e) => setCurrentEntryContent(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="journal-mantra" className="text-base font-semibold text-[var(--text-color)]">Today's Mantra</Label>
                                                <Input
                                                    id="journal-mantra"
                                                    placeholder={currentReflection?.affirmation || "Write your personal affirmation here."}
                                                    className="text-base border-[var(--primary-color)]/40 focus:ring-[var(--primary-color)] mt-1"
                                                    value={currentMantra}
                                                    onChange={(e) => setCurrentMantra(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-base font-semibold text-[var(--text-color)]">Mood Check</Label>
                                                <div className="flex gap-2 mt-2">
                                                    {moodOptions.map(mood => (
                                                        <button 
                                                            key={mood}
                                                            onClick={() => setCurrentMood(mood)}
                                                            className={`p-2 rounded-full text-3xl transition-all duration-200 ${currentMood === mood ? 'bg-[var(--accent-color)]/30 scale-125 ring-2 ring-[var(--accent-color)]' : 'hover:scale-110'}`}
                                                        >
                                                            {mood}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={handleSaveEntry} disabled={saveEntryMutation.isLoading} className="mt-6 w-full sm:w-auto bg-[var(--primary-color)] hover:opacity-90 text-white">
                                            {saveEntryMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <BookHeart className="w-4 h-4 mr-2"/>}
                                            Save Reflection
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    <aside className="space-y-6">
                        <Card className="shadow-md border-[var(--primary-color)]/30 bg-white/70">
                            <CardHeader>
                                <CardTitle className="text-[var(--text-color)]">Your Progress</CardTitle>
                                <CardDescription>{completedDays.size} of 66 days completed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-2">
                                    {Array.from({ length: 66 }, (_, i) => i + 1).map(day => (
                                        <button
                                            key={day}
                                            onClick={() => handleSelectDay(day)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all
                                                ${currentDay === day ? 'bg-[var(--primary-color)] text-white ring-2 ring-offset-2 ring-[var(--primary-color)]' : ''}
                                                ${completedDays.has(day) ? 'bg-[var(--accent-color)]/50 text-[var(--text-color)]' : 'bg-gray-100 text-gray-500'}
                                                ${currentDay !== day ? 'hover:bg-[var(--accent-color)]/30' : ''}
                                            `}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="shadow-md border-[var(--primary-color)]/30 bg-white/70">
                             <CardHeader>
                                <CardTitle className="text-[var(--text-color)]">Healing Phases</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible value={activePhase} onValueChange={setActivePhase} className="w-full">
                                    {phases.map(phase => (
                                        <AccordionItem key={phase.number} value={phase.number.toString()} className="border-b-[var(--primary-color)]/20">
                                            <AccordionTrigger className="text-base hover:no-underline text-[var(--text-color)] font-semibold">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${phase.prompts.every(p => completedDays.has(p.day_number)) ? 'bg-green-500' : 'bg-[var(--primary-color)]'}`}>
                                                        {phase.prompts.every(p => completedDays.has(p.day_number)) ? <CheckCircle className="w-3 h-3"/> : phase.number}
                                                    </div>
                                                    <span>Phase {phase.number}: {phase.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="space-y-2 pl-4">
                                                    {phase.prompts.sort((a,b) => a.day_number - b.day_number).map(prompt => (
                                                        <li key={prompt.id}>
                                                             <button onClick={() => handleSelectDay(prompt.day_number)} className="flex items-center gap-2 text-left text-sm text-gray-600 hover:text-[var(--primary-color)] w-full">
                                                                {completedDays.has(prompt.day_number) ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0"/> : <div className="w-4 h-4 flex-shrink-0" />}
                                                                <span>Day {prompt.day_number}: {prompt.title || prompt.goal}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                         <Card className="shadow-md border-[var(--primary-color)]/30 bg-white/70 p-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="ai-coach-toggle" className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-[var(--text-color)]">Enable AI Reflection Coach</span>
                                    <span className="text-xs text-gray-500">Allows AI to gently summarize or reflect on your entries.</span>
                                </Label>
                                <Switch
                                    id="ai-coach-toggle"
                                    checked={isAiCoachEnabled}
                                    onCheckedChange={handleToggleAiCoach}
                                    className="data-[state=checked]:bg-[var(--primary-color)]"
                                />
                            </div>
                        </Card>
                        <Card className={`shadow-md border-[var(--primary-color)]/30 bg-white/70 p-4 transition-opacity ${!hasGriefPersona ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="persona-toggle" className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-[var(--text-color)] flex items-center gap-2">
                                        {hasGriefPersona ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-gray-500"/>}
                                        Persona Integration
                                    </span>
                                    <span className="text-xs text-gray-500">Allows your grief persona to read your journal for emotional mirroring.</span>
                                </Label>
                                <Switch
                                    id="persona-toggle"
                                    checked={isPersonaIntegrationEnabled}
                                    onCheckedChange={handleTogglePersonaIntegration}
                                    disabled={!hasGriefPersona}
                                    className="data-[state=checked]:bg-[var(--primary-color)]"
                                />
                            </div>
                            {!hasGriefPersona && <p className="text-xs text-gray-500 mt-2">This feature is unlocked after setting up a grief persona.</p>}
                        </Card>
                    </aside>
                </div>
            </div>
            
            <AnimatePresence>
                {showSummaryModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSummaryModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                        >
                            <CardHeader className="bg-[var(--secondary-color)]">
                                <CardTitle className="flex items-center gap-2 text-2xl text-[var(--text-color)]">
                                    <Sparkles className="text-[var(--primary-color)]"/> Personal Growth Summary
                                </CardTitle>
                                <CardDescription>A compassionate reflection on your journey so far.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto px-6 pb-6">
                                {isGeneratingSummary ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <Loader2 className="w-10 h-10 text-[var(--primary-color)] animate-spin mb-4" />
                                        <p className="text-lg font-semibold text-gray-700">Generating your summary...</p>
                                        <p className="text-sm text-gray-500">The AI is compassionately reviewing your reflections.</p>
                                    </div>
                                ) : (
                                    <div className="prose whitespace-pre-wrap">{summary}</div>
                                )}
                            </CardContent>
                            <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
                                <Button variant="outline" onClick={() => setShowSummaryModal(false)}>Close</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HeartShiftJournalPage;
