
import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Palette, Calculator, Sparkles, Loader2, Printer, Mic, MicOff, Volume2, Trophy, Star, Zap, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvokeLLM, GenerateImage } from '@/integrations/Core';
import { useNotifications as useSounds } from '../SoundManager';
import CalculatorComponent from './Calculator';
import { motion, AnimatePresence } from 'framer-motion';
// Assuming base44 is an integration providing the functions.invoke API
import * as base44 from '@/integrations/base44';
import AITutor from './AITutor';
import { useToast } from "@/components/ui/use-toast"; // NEW IMPORT

function ResearchHelper({ onComplete }) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [answer, setAnswer] = useState('');
    const [questionsAsked, setQuestionsAsked] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [speechError, setSpeechError] = useState('');

    const { playSound } = useSounds();
    const recognitionRef = useRef(null);

    const KIDS_VOICE = {
        voiceId: 'pFZP5JQG7iQjIQuC4Bku', // Lily
        stability: 0.4,
        similarity_boost: 0.8,
        style: 0.5
    };

    const speak = async (text) => {
        // Silently skip if text is empty
        if (!text) return;

        try {
            const response = await base44.functions.invoke('generateStandardSpeech', {
                text: text,
                voiceId: KIDS_VOICE.voiceId,
                stability: KIDS_VOICE.stability,
                similarity_boost: KIDS_VOICE.similarity_boost,
                style: KIDS_VOICE.style,
                use_speaker_boost: true
            });

            if (response.data?.audio_base64) {
                const audioBlob = new Blob(
                    [Uint8Array.from(atob(response.data.audio_base64), c => c.charCodeAt(0))],
                    { type: 'audio/mpeg' }
                );
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play().catch(() => {
                    // Silently fail audio playback (e.g., user interaction required)
                });
                audio.onended = () => URL.revokeObjectURL(audioUrl);
                return;
            }
        } catch (error) {
            // Silently fall back to browser TTS
        }

        // Browser TTS fallback
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.pitch = 1.3;
                    utterance.rate = 1.0;
                    utterance.lang = 'en-US';
                    utterance.onerror = () => {
                        // Silently fail without interrupting user experience
                    };
                    window.speechSynthesis.speak(utterance);
                }, 100);
            } catch (ttsError) {
                // Silently continue without audio
            }
        }
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // We want a single phrase
            recognition.interimResults = false; // Only final results
            recognition.lang = 'en-US';
            
            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setQuery(transcript);
                setSpeechError(''); // Clear error on successful recognition
                playSound('success'); // Play success sound when speech recognized
            };
            
            recognition.onerror = (event) => {
                console.log("Speech recognition error:", event.error); // Changed to log for less aggressive console output
                if (event.error === 'no-speech') {
                    setSpeechError("I didn't hear anything. Try speaking louder!");
                } else if (event.error === 'not-allowed') {
                    setSpeechError("Please allow microphone access to use voice input.");
                } else if (event.error === 'network') {
                    setSpeechError("Network error. Please check your connection.");
                } else {
                    setSpeechError("Couldn't hear you. Please try typing instead.");
                }
                setIsRecording(false);
                playSound('error');
            };

            recognition.onstart = () => {
                setSpeechError(''); // Clear error before starting
                setIsRecording(true);
                playSound('click');
            };

            recognition.onend = () => {
                setIsRecording(false);
            };
            
            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
            // No need to set speechError here, as the button will be disabled
        }
    }, [playSound]);

    const handleVoiceSearch = () => {
        if (!recognitionRef.current) {
            setSpeechError("Voice input isn't available on this device. Please type your question.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop(); // Stop listening. onend will handle setIsRecording(false)
        } else {
            setQuery(''); // Clear previous query before starting new recognition
            setSpeechError(''); // Clear previous errors
            try {
                recognitionRef.current.start(); // Start listening. onstart will handle setIsRecording(true), playSound, and clear error
            } catch (error) {
                console.error("Error starting speech recognition:", error);
                setSpeechError("Couldn't start microphone. Please try again or type your question.");
                setIsRecording(false); // Ensure recording state is off if start fails
            }
        }
    };


    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setAnswer('');
        setSpeechError(''); // Clear speech error when performing text search
        playSound('click');

        try {
            const prompt = `You are a friendly and encouraging homework helper for a child. Explain the answer to "${query}" in a simple, safe, and easy-to-understand way suitable for kids aged 5-12. Use short sentences, fun examples, and maybe an analogy. Make it educational but fun!`;
            const result = await InvokeLLM({ prompt });
            setAnswer(result);
            speak(result); // Speak the answer aloud
            setQuestionsAsked(prev => prev + 1);
            
            // Award points for asking questions
            if (questionsAsked === 0) {
                onComplete(5, 'book-sticker', { subject: 'Research', needs_help: false }); // First question bonus
            } else {
                onComplete(3, null, { subject: 'Research', needs_help: false }); // Regular points
            }
            
            playSound('success');
        } catch (error) {
            console.error("Error fetching research:", error);
            setAnswer("Oops! I got a little stuck. Maybe try asking in a different way?");
            onComplete(0, null, { subject: 'Research', needs_help: true }); // Mark as needing help if error
            playSound('error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetResearch = () => {
        setQuery('');
        setAnswer('');
        setSpeechError(''); // Clear speech error on reset
        playSound('click');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-blue-800">Research Helper</h3>
                        <p className="text-sm text-blue-700">Ask me anything you're curious about!</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                        <Trophy className="w-4 h-4 mr-1" />
                        {questionsAsked} Questions
                    </Badge>
                    {questionsAsked > 0 && (
                        <Button onClick={resetResearch} variant="outline" size="sm">
                            <RefreshCcw className="w-4 h-4 mr-1" />
                            New Question
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Voice Recording Section */}
            <div className="mb-4 p-3 bg-white/50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Speak your question!</span>
                </div>
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleVoiceSearch}
                            variant={isRecording ? "destructive" : "outline"}
                            className="gap-2"
                            disabled={!recognitionRef.current} // Disable button if speech recognition not supported
                        >
                            {isRecording ? <><MicOff className="w-4 h-4"/>Listening...</> : <><Mic className="w-4 h-4"/>Ask a Question</>}
                        </Button>
                        {isRecording && <p className="text-sm text-blue-700 animate-pulse">Listening... Speak now!</p>}
                    </div>
                    {speechError && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        >
                            <span>💡</span> {speechError}
                        </motion.p>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <Textarea 
                    value={query} 
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Or type your question here... e.g., Why is the sky blue? How do airplanes fly?"
                    className="flex-grow text-lg"
                    rows={2}
                />
                <Button onClick={handleSearch} disabled={isLoading || !query.trim()} className="bg-blue-500 hover:bg-blue-600 self-end">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
                </Button>
            </div>

            <AnimatePresence>
                {answer && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <Card className="p-4 bg-white border-2 border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-semibold text-blue-800">Here's what I found!</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-base">{answer}</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function PicturePainter({ onComplete }) {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageURL, setImageURL] = useState('');
    const [creationsCount, setCreationsCount] = useState(0);
    const [isRecording, setIsRecording] = useState(false); // Still needed for UI state
    const { playSound } = useSounds();
    const recognitionRef = useRef(null); // For speech recognition

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setPrompt(transcript);
                playSound('success'); // Play success sound when speech recognized
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'no-speech') {
                    alert("I didn't catch that! Please try again and speak clearly.");
                } else if (event.error === 'not-allowed') {
                    alert("Looks like I can't use the microphone. Please check your browser's permissions for this site.");
                } else {
                    alert("Sorry, I couldn't hear that. Something went wrong with the microphone.");
                }
                setIsRecording(false); // Stop recording state on error
                playSound('error');
            };

            recognition.onend = () => {
                setIsRecording(false); // Stop recording state when recognition ends
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, [playSound]);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Sorry, your browser doesn't support voice commands.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop(); // Stop listening
        } else {
            setPrompt(''); // Clear previous prompt before starting new recognition
            recognitionRef.current.start(); // Start listening
            setIsRecording(true);
            playSound('click'); // Play sound when recording starts
        }
    };


    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        playSound('click');

        try {
            const imagePrompt = `Coloring book page for a child, simple black outlines, white background, fun and cartoonish. The picture should be of: ${prompt}. Make it kid-friendly, engaging, and perfect for coloring with crayons or markers.`;
            const result = await GenerateImage({ prompt: imagePrompt });
            setImageURL(result.url);
            setCreationsCount(prev => prev + 1);
            
            // Award points based on creation count
            if (creationsCount === 0) {
                onComplete(20, 'art-sticker', { subject: 'Art', needs_help: false }); // First creation bonus
            } else {
                onComplete(15, null, { subject: 'Art', needs_help: false }); // Regular points
            }
            
            playSound('complete');
        } catch (error) {
            console.error("Error generating image:", error);
            onComplete(0, null, { subject: 'Art', needs_help: true }); // Mark as needing help if error
            playSound('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Print Coloring Page</title></head>
                <body style="text-align: center; margin: 20px;">
                    <h2>My Creation: ${prompt}</h2>
                    <img src="${imageURL}" style="max-width: 100%; max-height: 80vh;" />
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
        playSound('success');
    };

    const resetCreator = () => {
        setPrompt('');
        setImageURL('');
        // No audio playback related states to reset with speech recognition
        playSound('click');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 text-center"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-green-800">Art Creator</h3>
                        <p className="text-sm text-green-700">Turn your ideas into coloring pages!</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                        <Zap className="w-4 h-4 mr-1" />
                        {creationsCount} Created
                    </Badge>
                    {(prompt || imageURL) && (
                        <Button onClick={resetCreator} variant="outline" size="sm">
                            <RefreshCcw className="w-4 h-4 mr-1" />
                            Start Fresh
                        </Button>
                    )}
                </div>
            </div>

            {!imageURL ? (
                <>
                    {/* Voice Recording Section */}
                    <div className="mb-4 p-3 bg-white/50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2 justify-center">
                            <Volume2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Tell me what you want to draw!</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                             <Button onClick={toggleRecording} className={isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-green-500 hover:bg-green-600"}>
                                {isRecording ? (
                                    <><MicOff className="w-4 h-4 mr-2" /> Stop</>
                                ) : (
                                    <><Mic className="w-4 h-4 mr-2" /> Record Idea</>
                                )}
                            </Button>
                            {isRecording && <p className="text-sm text-green-700 animate-pulse">Listening...</p>}
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4 max-w-md mx-auto">
                        <Textarea 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Or type your idea here... e.g., A cat flying a rocketship, A magical garden with singing flowers"
                            className="flex-grow text-lg"
                            rows={2}
                        />
                        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="bg-green-500 hover:bg-green-600 self-end">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
                        </Button>
                    </div>
                    
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-2" />
                            <p className="text-green-700 font-medium">Creating your magical coloring page...</p>
                        </motion.div>
                    )}
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-4 bg-white inline-block border-2 border-green-200">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 justify-center mb-2">
                                <Star className="w-6 h-6 text-yellow-500" />
                                <h4 className="text-lg font-bold text-green-800">Your Creation is Ready!</h4>
                                <Star className="w-6 h-6 text-yellow-500" />
                            </div>
                            <p className="text-green-600 text-sm mb-3">"{prompt}"</p>
                        </div>
                        
                        <img 
                            src={imageURL} 
                            alt={prompt} 
                            className="w-80 h-80 object-contain rounded-lg shadow-md mb-4 border-2 border-green-200" 
                        />
                        
                        <div className="flex gap-2 justify-center">
                            <Button onClick={handlePrint} className="bg-orange-500 hover:bg-orange-600">
                                <Printer className="w-4 h-4 mr-2" />
                                Print & Color!
                            </Button>
                            <Button onClick={resetCreator} variant="outline">
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Create Another
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function HomeworkHelper({ onComplete: parentOnComplete, onSpeakText }) {
    const [homeworkHistory, setHomeworkHistory] = useState([]); // State for tracking homework activities
    const [learningGaps, setLearningGaps] = useState([]);
    const [isRecordingQuestion, setIsRecordingQuestion] = useState(false);
    const [currentHomework, setCurrentHomework] = useState({ question: '' });

    // NEW STATES for the getHelp functionality
    const [generalQuestion, setGeneralQuestion] = useState('');
    const [isGeneralLoading, setIsGeneralLoading] = useState(false);
    const [generalAnswer, setGeneralAnswer] = useState('');
    
    const { toast } = useToast(); // NEW HOOK

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Analyze homework history to identify gaps
        const gaps = [];
        if (homeworkHistory.length > 0) {
            // Consider recent homeworks (e.g., last 5 entries) to identify gaps
            const recentHomework = homeworkHistory.slice(-5); // Get the last 5 entries

            const subjects = {};
            
            recentHomework.forEach(hw => {
                if (hw.subject && typeof hw.needs_help === 'boolean') {
                    if (!subjects[hw.subject]) subjects[hw.subject] = { total: 0, needsHelp: 0 };
                    subjects[hw.subject].total++;
                    if (hw.needs_help) subjects[hw.subject].needsHelp++;
                }
            });
            
            Object.entries(subjects).forEach(([subject, stats]) => {
                if (stats.total > 0 && stats.needsHelp / stats.total > 0.5) {
                    gaps.push(subject);
                }
            });
        }
        setLearningGaps(gaps);
    }, [homeworkHistory]);

    // This localSpeak function is specific to the AITutor interaction within HomeworkHelper
    const _localSpeak = (text) => {
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.pitch = 1.2;
                utterance.rate = 0.95;
                utterance.onerror = () => console.log('Voice not available');
                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.log('Voice synthesis unavailable');
            }
        }
    };

    // Use onSpeakText prop if provided, otherwise use localSpeak for HomeworkHelper's own voice interactions
    const speak = onSpeakText || _localSpeak;

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (isRecordingQuestion) {
                  setCurrentHomework(prev => ({
                    ...prev,
                    question: (prev.question || '') + ' ' + transcript
                  }));
                }
                setIsRecordingQuestion(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                setIsRecordingQuestion(false);
                
                // Gentle error handling
                if (event.error === 'not-allowed') {
                  speak("I need permission to use the microphone. Can you ask a grown-up to help?");
                } else if (event.error === 'no-speech') {
                  // Silently handle no-speech - user may have paused
                  console.log('No speech detected');
                } else if (event.error !== 'aborted') {
                  speak("I couldn't hear that clearly. Want to try typing?");
                }
            };

            recognitionRef.current.onend = () => {
                setIsRecordingQuestion(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                try {
                  recognitionRef.current.stop();
                } catch (e) {
                  // Silently handle
                }
            }
        };
    }, [isRecordingQuestion, speak]); // Dependency on 'speak'

    const startVoiceInput = () => {
        if (!recognitionRef.current) {
            speak("Voice input isn't available. Let's type instead!");
            return;
        }

        try {
            setIsRecordingQuestion(true);
            recognitionRef.current.start();
            speak("I'm listening! What's your homework question?");
        } catch (error) {
            console.log('Could not start voice input:', error);
            setIsRecordingQuestion(false);
            speak("Let's try typing your question instead.");
        }
    };

    const stopVoiceInput = () => {
        if (recognitionRef.current && isRecordingQuestion) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log('Error stopping voice:', error);
            }
            setIsRecordingQuestion(false);
        }
    };

    // New getHelp function as per the outline
    const getHelp = async () => {
        if (!generalQuestion.trim()) {
            toast({
                title: "Uh oh! No question!",
                description: "Please describe what you need help with!",
                variant: "destructive",
            });
            return;
        }

        setIsGeneralLoading(true);
        setGeneralAnswer(''); // Clear previous answer

        // Notify AI Tutor that help was requested
        if (window.aiTutorRequestHint) {
            window.aiTutorRequestHint(generalQuestion, []);
        }

        try {
            const prompt = `You are a helpful and encouraging AI assistant for a child. Provide guidance or answer the following homework question or topic: "${generalQuestion}". Explain it in a simple, safe, and easy-to-understand way suitable for kids aged 5-12. Use short sentences, fun examples, and maybe an analogy. Make it educational but fun! If it's a general request for study tips, provide some simple and actionable advice.`;
            const result = await InvokeLLM({ prompt });
            setGeneralAnswer(result);
            speak(result); // Speak the answer aloud
            
            setIsGeneralLoading(false);
            
            // Report success to AI Tutor
            if (window.aiTutorReportSuccess) {
                window.aiTutorReportSuccess();
            }
            toast({
                title: "Help received!",
                description: "Your AI Tutor has some guidance for you.",
            });
        } catch (error) {
            console.error("Error getting general homework help:", error);
            setGeneralAnswer("Oops! I got a little stuck. Can you try again or ask a grown-up?");
            speak("Oops! I got a little stuck. Can you try again or ask a grown-up?");

            setIsGeneralLoading(false);
            
            // Report error to AI Tutor
            if (window.aiTutorReportError) {
                window.aiTutorReportError();
            }
            toast({
                title: "Oh no! Error!",
                description: "Couldn't get help right now. Please try again!",
                variant: "destructive",
            });
        }
    };

    // Modified onComplete handler to capture activity details and update homeworkHistory
    const handleChildComplete = (points, stickerType, activityDetails = {}) => {
        if (parentOnComplete) {
            parentOnComplete(points, stickerType); // Call the parent's onComplete for points/stickers
        }
        // Update homeworkHistory with new activity details
        setHomeworkHistory(prev => [...prev, { ...activityDetails, timestamp: new Date() }]);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* AI Tutor Integration */}
            <AITutor
                childName="friend"
                childAge={10}
                currentModule="homework help"
                currentActivity={{
                    name: 'Homework', // Using generic fallback as currentHomework is not defined
                    concept: 'General learning' // Using generic fallback as currentHomework is not defined
                }}
                learningGaps={learningGaps}
                interests={['learning', 'problem solving']}
                recentProgress={{
                    completed_homework: homeworkHistory.filter(h => h.needs_help === false).length, // Assuming not needing help means completed successfully
                    total_homework: homeworkHistory.length
                }}
                onSpeakResponse={speak} // Use the unified speak function
                compact={true}
            />

            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border-2 border-purple-200 mb-4"
                >
                    <Trophy className="w-6 h-6 text-purple-600" />
                    <span className="text-lg font-bold text-purple-800">Homework Adventure Zone</span>
                    <Trophy className="w-6 h-6 text-purple-600" />
                </motion.div>
                <p className="text-gray-600">Learn, create, and earn points while having fun!</p>
            </div>

            {/* NEW UI for the general getHelp functionality */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-purple-800">Ask Your AI Tutor for Help!</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <Textarea
                        value={generalQuestion}
                        onChange={e => setGeneralQuestion(e.target.value)}
                        placeholder="Ask your AI Tutor anything about your homework! e.g., How do I start a science project? What's a good way to study for a test?"
                        className="flex-grow text-lg"
                        rows={2}
                        disabled={isGeneralLoading}
                    />
                    <Button onClick={getHelp} disabled={isGeneralLoading || !generalQuestion.trim()} className="bg-purple-500 hover:bg-purple-600 self-end sm:self-auto">
                        {isGeneralLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
                        Ask for Help
                    </Button>
                </div>
                <AnimatePresence>
                    {generalAnswer && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mt-4 p-4 bg-white border-2 border-indigo-200 rounded-lg"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-semibold text-purple-800">Here's some guidance!</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-base">{generalAnswer}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>


            <Tabs defaultValue="research" className="w-full mt-8">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="research" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Research
                    </TabsTrigger>
                    <TabsTrigger value="art" className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Art Creator
                    </TabsTrigger>
                    <TabsTrigger value="calc" className="flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Calculator
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="research" className="mt-4">
                    <ResearchHelper onComplete={handleChildComplete} />
                </TabsContent>
                <TabsContent value="art" className="mt-4">
                    <PicturePainter onComplete={handleChildComplete} />
                </TabsContent>
                <TabsContent value="calc" className="mt-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 p-4">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-yellow-800">Math Helper</h3>
                                <p className="text-sm text-yellow-700">Solve math problems with ease!</p>
                            </div>
                        </div>
                        <CalculatorComponent />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
