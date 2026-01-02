
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, BookOpen, Mic, Volume2, Download, Printer, PenSquare, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications as useSounds } from '../SoundManager';
import { useToast } from "@/components/ui/use-toast"; // ADDED: Import useToast for notifications
import AITutor from './AITutor'; // NEW: Import AITutor component

const storyOptions = {
  heroes: [
    { name: 'Brave Knight', icon: '🛡️' },
    { name: 'Magical Unicorn', icon: '🦄' },
    { name: 'Curious Astronaut', icon: '🧑‍🚀' },
    { name: 'Friendly Dragon', icon: '🐲' },
  ],
  places: [
    { name: 'an Enchanted Forest', icon: '🌳' },
    { name: 'a Crystal Cave', icon: '💎' },
    { name: 'a Sparkle Planet', icon: '🪐' },
    { name: 'an Underwater Castle', icon: '🏰' },
  ],
  items: [
    { name: 'a Flying Carpet', icon: '🪄' },
    { name: 'a Wishing Star', icon: '🌟' },
    { name: 'an Invisible Hat', icon: '🎩' },
    { name: 'a Talking Animal', icon: '🦜' },
  ],
};

const SelectCard = ({ option, onSelect, isSelected }) => (
    <motion.div
        onClick={() => onSelect(option.name)}
        className={`p-4 rounded-xl cursor-pointer border-4 transition-all duration-200 ${isSelected ? 'border-yellow-400 bg-yellow-100 shadow-lg' : 'border-transparent bg-white hover:bg-yellow-50'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className="text-5xl text-center mb-2">{option.icon}</div>
        <p className="text-center font-semibold text-gray-700">{option.name}</p>
    </motion.div>
);

const CelebrationSparkles = () => {
    const confettiPieces = useMemo(() => Array.from({ length: 100 }).map((_, i) => {
        const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c56e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6"];
        return {
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            rotate: Math.random() * 360,
            scale: Math.random() * 0.7 + 0.5,
            duration: Math.random() * 2 + 2.5,
            delay: Math.random() * 1.5,
            drift: Math.random() * 60 - 30,
        };
    }), []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 1, delay: 2.5 } }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none"
        >
            <div className="absolute inset-0 overflow-hidden">
                {confettiPieces.map(piece => (
                    <motion.div
                        key={piece.id}
                        className="absolute w-3 h-5 rounded-sm"
                        style={{ left: `${piece.x}%`, top: `${piece.y}%`, backgroundColor: piece.color, rotate: piece.rotate, scale: piece.scale }}
                        animate={{
                            y: [piece.y, 120],
                            x: `calc(${piece.x}% + ${piece.drift}px)`,
                            rotate: piece.rotate + (Math.random() > 0.5 ? 360 : -360) * 2,
                            opacity: [1, 1, 0.8, 0],
                        }}
                        transition={{ duration: piece.duration, ease: "linear", delay: piece.delay }}
                    />
                ))}
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.5, type: 'spring' } }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5, delay: 2 } }}
                className="text-center p-8 bg-white/90 rounded-2xl shadow-2xl"
            >
                <h2 className="text-4xl font-bold text-purple-800 drop-shadow-md">You did it!</h2>
                <p className="text-xl text-purple-700 mt-2">What a wonderful story! ✨</p>
            </motion.div>
        </motion.div>
    );
};

// HIGH-QUALITY Voice Configuration for Kids
const KIDS_VOICE_CONFIG = {
  voiceId: 'pFZP5JQG7iQjIQuC4Bku', // Lily - Sweet, gentle, perfect for kids
  stability: 0.4,
  similarity_boost: 0.85, // MODIFIED from 0.8 to 0.85
  style: 0.6,             // MODIFIED from 0.5 to 0.6
  use_speaker_boost: true
};

export default function AIStoryCreator({ onComplete }) {
  const [creationMode, setCreationMode] = useState('pick');
  const [selectedHero, setSelectedHero] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedItem, setSelecetedItem] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [story, setStory] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isReading, setIsReading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const { playSound } = useSounds();
  const { toast } = useToast(); // ADDED: Initialize useToast hook
  
  const [guidanceStep, setGuidanceStep] = useState('hero');
  const [pointerStyle, setPointerStyle] = useState({ opacity: 0 });
  const heroSectionRef = useRef(null);
  const placeSectionRef = useRef(null);
  const itemSectionRef = useRef(null);
  const generateButtonRef = useRef(null);
  const isGuidingRef = useRef(true);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const audioRef = useRef(null);

  // NEW: State for AI Tutor
  const [learningGaps, setLearningGaps] = useState([]);
  const [childInterests, setChildInterests] = useState(['adventures', 'animals', 'magic']);
  const [storiesGeneratedCount, setStoriesGeneratedCount] = useState(0); // For AITutor recentProgress

  useEffect(() => {
    // Load child's interests and learning gaps from user stats
    const loadProgress = async () => {
      try {
        const user = await base44.auth.me(); // Assuming base44.auth.me() is available
        const gaps = [];
        
        // Analyze story complexity over time
        if (user?.kids_studio_stats?.story_progression) {
          const progression = user.kids_studio_stats.story_progression;
          if (progression.vocabulary_level < 3) gaps.push('vocabulary building');
          if (progression.creativity_score < 5) gaps.push('creative thinking');
        }
        
        setLearningGaps(gaps);
        if (user?.kids_studio_stats?.favorite_topics && user.kids_studio_stats.favorite_topics.length > 0) {
          setChildInterests(user.kids_studio_stats.favorite_topics);
        } else {
          // Fallback to default interests if none are found or array is empty
          setChildInterests(['adventures', 'animals', 'magic']);
        }
      } catch (error) {
        console.log('Could not load user progress for AI Tutor:', error);
        // Fallback to default values for learningGaps and childInterests
        setLearningGaps([]);
        setChildInterests(['adventures', 'animals', 'magic']);
      }
    };
    loadProgress();
  }, []); // Run once on component mount

  const speak = useCallback(async (text, options = {}) => {
    if (!text) return;
    
    try {
      // Try ElevenLabs first
      const response = await base44.functions.invoke('generateStandardSpeech', {
        text: text,
        voiceId: KIDS_VOICE_CONFIG.voiceId,
        stability: KIDS_VOICE_CONFIG.stability,
        similarity_boost: KIDS_VOICE_CONFIG.similarity_boost,
        style: options.isEmphatic ? 0.8 : KIDS_VOICE_CONFIG.style,
        use_speaker_boost: KIDS_VOICE_CONFIG.use_speaker_boost
      });

      if (response.data?.audio_base64) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(response.data.audio_base64), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.play();
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (options.onComplete) options.onComplete();
        };
        return;
      }
    } catch (error) {
      // Silently fall back to browser TTS
      console.log("ElevenLabs unavailable, using browser TTS", error);
    }
    
    // Browser TTS fallback with improved error handling
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Wait a bit to ensure cancellation is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = options.isEmphatic ? 1.5 : 1.3;
        utterance.rate = 1.0;
        utterance.volume = 0.9;
        utterance.lang = 'en-US';
        
        utterance.onend = () => {
          if (options.onComplete) options.onComplete();
        };
        
        utterance.onerror = (event) => {
          // Silently handle TTS errors - don't show to user
          console.log("TTS error:", event.error);
          if (options.onComplete) options.onComplete();
        };
        
        window.speechSynthesis.speak(utterance);
      } catch (ttsError) {
        // Silently fail - voice is optional
        console.log("Voice synthesis unavailable in browser", ttsError);
        if (options.onComplete) options.onComplete();
      }
    } else {
      // Browser doesn't support TTS - that's okay
      console.log("Browser does not support Speech Synthesis API.");
      if (options.onComplete) options.onComplete();
    }
  }, []);

  const speakGuidance = useCallback((text) => {
    if (isGuidingRef.current) {
      speak(text);
    }
  }, [speak]);

  const calculatePointerPosition = (ref) => {
    if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPointerStyle({
            opacity: 1,
            top: rect.top + window.scrollY + rect.height / 2 - 20,
            left: rect.left + window.scrollX - 60,
            transition: { type: 'spring', stiffness: 200, damping: 20 }
        });
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCustomPrompt(transcript);
        playSound('success');
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError("I didn't hear that. Could you please try again?");
        playSound('error');
      };
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      
      recognitionRef.current = recognition;
    }
  }, [playSound]);

  useEffect(() => {
    isGuidingRef.current = (creationMode === 'pick' && !story);

    if (!isGuidingRef.current) {
      setPointerStyle({ opacity: 0 });
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }
    
    let timeoutId;
    
    const runGuidance = () => {
        switch (guidanceStep) {
            case 'hero':
                speakGuidance("First, choose a hero for your story!");
                calculatePointerPosition(heroSectionRef);
                break;
            case 'place':
                speakGuidance("Great! Now, where does the story happen?");
                calculatePointerPosition(placeSectionRef);
                break;
            case 'item':
                speakGuidance("Awesome! Let's add a magical item!");
                calculatePointerPosition(itemSectionRef);
                break;
            case 'generate':
                speakGuidance("Let's make some magic!");
                calculatePointerPosition(generateButtonRef);
                timeoutId = setTimeout(() => {
                    if (selectedHero && selectedPlace && selectedItem && generateButtonRef.current) {
                        // Automatically click the button only if it's visible and enabled.
                        // For a real app, perhaps call generateStory directly to avoid UI race conditions.
                        // Or ensure the button click is safe. For now, rely on click event.
                        if (!isLoading) { // Only auto-click if not already loading
                            generateButtonRef.current.click();
                            setGuidanceStep('done');
                        }
                    }
                }, 2000);
                break;
            default:
                setPointerStyle({ opacity: 0 });
        }
    }
    
    timeoutId = setTimeout(runGuidance, 500);

    return () => {
        clearTimeout(timeoutId);
    };

  }, [guidanceStep, creationMode, story, speakGuidance, selectedHero, selectedPlace, selectedItem, isLoading]); // Added isLoading to dependencies

  useEffect(() => {
      if(selectedHero && guidanceStep === 'hero') setGuidanceStep('place');
  }, [selectedHero, guidanceStep]);

  useEffect(() => {
      if(selectedPlace && guidanceStep === 'place') setGuidanceStep('item');
  }, [selectedPlace, guidanceStep]);

  useEffect(() => {
      if(selectedItem && guidanceStep === 'item') setGuidanceStep('generate');
  }, [selectedItem, guidanceStep]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
        setError("Sorry, your browser doesn't support voice input.");
        return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setCustomPrompt('');
      setError(null);
      recognitionRef.current.start();
      playSound('click');
    }
  };

  const generateStory = async () => {
    isGuidingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPointerStyle({ opacity: 0 });

    let finalPrompt = '';
    if (creationMode === 'pick') {
        if (!selectedHero || !selectedPlace || !selectedItem) { 
            setError('Please pick a hero, a place, and a magic item!');
            return;
        }
        finalPrompt = `A story about a ${selectedHero} in ${selectedPlace} who finds ${selectedItem}.`; 
    } else {
        if (!customPrompt.trim()) {
            setError('Please type or say an idea for your story!');
            return;
        }
        finalPrompt = customPrompt;
    }

    setIsLoading(true);
    setError(null);
    setStory('');
    setImage('');
    setAudioUrl(null);

    try {
      const storyPrompt = `Create a very short, simple, and happy children's story (about 4-5 sentences) for a 5-year-old based on this idea: "${finalPrompt}". Make it whimsical and fun.`;
      const storyResponse = await base44.integrations.Core.InvokeLLM({ prompt: storyPrompt });
      const generatedStory = storyResponse;
      
      onComplete(10, 'story-sticker');

      const imagePrompt = `A cute, cartoon-style illustration for a children's book based on this story: "${generatedStory}". Style: vibrant, colorful, friendly, simple shapes.`;
      const imageResponse = await base44.integrations.Core.GenerateImage({ prompt: imagePrompt });
      
      setIsLoading(false);
      playSound('complete');
      setCelebrationVisible(true);
      setStoriesGeneratedCount(prev => prev + 1); // NEW: Increment stories generated count

      setTimeout(() => {
        setCelebrationVisible(false);
        setStory(generatedStory);
        setImage(imageResponse.url);
      }, 3500);

    } catch (err) {
      console.error("Error generating story or image:", err);
      setError('Oops! My storybook seems to be stuck. Please try again!');
      setStory('');
      setImage('');
      setIsLoading(false);
    }
  };

  const readStory = async () => {
    if (!story || isReading) return;

    setIsReading(true);
    setAudioUrl(null);
    setError(null);

    try {
      const audioResponse = await base44.functions.invoke('generateStandardSpeech', { 
        text: story, 
        voiceId: KIDS_VOICE_CONFIG.voiceId,
        stability: KIDS_VOICE_CONFIG.stability,
        similarity_boost: KIDS_VOICE_CONFIG.similarity_boost,
        style: KIDS_VOICE_CONFIG.style, // Using KIDS_VOICE_CONFIG.style for consistency
        use_speaker_boost: KIDS_VOICE_CONFIG.use_speaker_boost
      });
      
      if (audioResponse.data && audioResponse.data.audio_base64) {
        const audioDataUrl = `data:audio/mpeg;base64,${audioResponse.data.audio_base64}`;
        setAudioUrl(audioDataUrl);
      } else {
        throw new Error("Audio data not received from the server.");
      }

    } catch (err) {
      console.error("Failed to generate audio:", err);
      setError("I couldn't read the story out loud right now. Please try again.");
      toast({
        title: "Audio Error",
        description: "I couldn't read the story out loud right now.",
        variant: "destructive",
      }); // MODIFIED: Use toast for notification
    } finally {
      setIsReading(false);
    }
  };

  const startOver = () => {
    setCreationMode('pick');
    setSelectedHero(null);
    setSelectedPlace(null);
    setSelecetedItem(null);
    setCustomPrompt('');
    setStory('');
    setImage('');
    setError(null);
    setAudioUrl(null);
    setGuidanceStep('hero');
    isGuidingRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCelebrationVisible(false);
  };

  const downloadStory = () => {
    if (!story) return;

    const storyTitle = `My AI Story`;
    const storyContent = `${storyTitle}\n\n${story}\n\nCreated with DobryLife Kids Studio`;

    const blob = new Blob([storyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${storyTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const printStory = () => {
    if (!story) return;

    const storyTitle = `My AI Story`;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${storyTitle}</title>
          <style>
            body {
              font-family: 'Comic Sans MS', cursive, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.8;
            }
            h1 {
              color: #7c3aed;
              text-align: center;
              margin-bottom: 30px;
              font-size: 28px;
            }
            .story-image {
              width: 100%;
              max-width: 500px;
              height: auto;
              display: block;
              margin: 20px auto;
              border: 4px solid #fbbf24;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .story-text {
              font-size: 18px;
              color: #374151;
              text-align: justify;
              margin: 30px 0;
              padding: 20px;
              background: #fef3c7;
              border-radius: 12px;
              border: 2px dashed #fbbf24;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #9ca3af;
              font-size: 14px;
            }
            @media print {
              body {
                margin: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>✨ ${storyTitle} ✨</h1>
          ${image ? `<img src="${image}" alt="Story illustration" class="story-image" />` : ''}
          <div class="story-text">${story}</div>
          <div class="footer">Created with ❤️ using DobryLife Kids Studio</div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const getHighlightStyle = (step) => {
    if (creationMode !== 'pick' || guidanceStep !== step || !isGuidingRef.current) return {};
    return {
        scale: 1.03,
        boxShadow: '0 0 30px 5px rgba(250, 204, 21, 0.7)',
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
        }
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6"> {/* Main wrapper div as per outline */}
      {/* AI Tutor Integration */}
      <AITutor
        childName="friend" // Placeholder, can be dynamically fetched
        childAge={8} // Placeholder, can be dynamically fetched
        currentModule="creative writing"
        currentActivity={{
          name: 'Story Creation',
          concept: 'Writing and storytelling'
        }}
        learningGaps={learningGaps}
        interests={childInterests}
        recentProgress={{
          stories_created: storiesGeneratedCount // Use the new state variable
        }}
        onSpeakResponse={speak}
        compact={true}
      />

      <AnimatePresence>
        {celebrationVisible && <CelebrationSparkles />}
      </AnimatePresence>
      <AnimatePresence>
      {isGuidingRef.current && (
          <motion.div
              className="fixed z-50 pointer-events-none"
              animate={pointerStyle}
              initial={{ opacity: 0 }}
          >
              <Wand2 className="w-12 h-12 text-yellow-400 drop-shadow-lg" style={{ transform: 'rotate(-45deg)' }} />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-pink-400 animate-ping" />
          </motion.div>
      )}
      </AnimatePresence>
      <div className="flex flex-col items-center p-4 sm:p-8 font-comic-sans bg-blue-50 rounded-2xl shadow-inner w-full h-full">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-3xl font-bold text-center text-blue-700">Let's Create a Story!</h2>
        </div>

        {!story ? (
          <Tabs value={creationMode} onValueChange={(value) => { 
            setCreationMode(value); 
            if (value === 'custom') {
              isGuidingRef.current = false;
              if (audioRef.current) audioRef.current.pause();
              setPointerStyle({ opacity: 0 });
            } else {
              isGuidingRef.current = true;
              setGuidanceStep('hero');
            }
          }} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2 bg-blue-200/50">
              <TabsTrigger value="pick" className="gap-2"><Sparkles className="w-4 h-4"/>Pick My Story</TabsTrigger>
              <TabsTrigger value="custom" className="gap-2"><PenSquare className="w-4 h-4"/>My Own Idea</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pick" className="mt-6 space-y-6">
              <motion.div ref={heroSectionRef} animate={getHighlightStyle('hero')} className="p-2 rounded-2xl">
                <h4 className="font-bold text-gray-800 mb-2 text-lg">1. Choose a Hero</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {storyOptions.heroes.map(hero => <SelectCard key={hero.name} option={hero} onSelect={setSelectedHero} isSelected={selectedHero === hero.name} />)}
                </div>
              </motion.div>
              <motion.div ref={placeSectionRef} animate={getHighlightStyle('place')} className="p-2 rounded-2xl">
                <h4 className="font-bold text-gray-800 mb-2 text-lg">2. Choose a Place</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {storyOptions.places.map(place => <SelectCard key={place.name} option={place} onSelect={setSelectedPlace} isSelected={selectedPlace === place.name} />)}
                </div>
              </motion.div>
              <motion.div ref={itemSectionRef} animate={getHighlightStyle('item')} className="p-2 rounded-2xl">
                <h4 className="font-bold text-gray-800 mb-2 text-lg">3. Add a Magic Item</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {storyOptions.items.map(item => <SelectCard key={item.name} option={item} onSelect={setSelecetedItem} isSelected={selectedItem === item.name} />)}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              <div className="p-4 rounded-lg shadow-sm bg-yellow-100 space-y-4">
                <h4 className="font-bold text-gray-800">Tell me an idea for a story!</h4>
                <Input
                  type="text"
                  placeholder="E.g., A brave squirrel finds a giant acorn"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full bg-white border-yellow-300 focus:border-yellow-500 text-base"
                />
                <div className="flex items-center justify-center">
                    <Button onClick={handleVoiceInput} variant="outline" className={`gap-2 ${isRecording ? 'bg-red-100 text-red-700' : ''}`}>
                        {isRecording ? <><Loader2 className="w-4 h-4 animate-spin" />Listening...</> : <><Mic className="w-4 h-4" />Use My Voice</>}
                    </Button>
                </div>
              </div>
            </TabsContent>

            <div className="mt-6 text-center" ref={generateButtonRef}>
              <AnimatePresence>
              {creationMode === 'pick' && guidanceStep === 'generate' && (
                  <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1.2, transition: { duration: 0.5, type: 'spring' } }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center justify-center text-center text-purple-700 mb-4"
                  >
                      <Sparkles className="w-16 h-16 text-yellow-500 animate-spin-slow" />
                      <p className="mt-4 text-xl font-bold">Creating your magical story...</p>
                  </motion.div>
              )}
              </AnimatePresence>
              <Button 
                  onClick={generateStory} 
                  disabled={isLoading || (creationMode === 'pick' && (!selectedHero || !selectedPlace || !selectedItem)) || (creationMode === 'custom' && !customPrompt.trim())} 
                  className={`w-full max-w-sm bg-yellow-500 hover:bg-yellow-600 text-lg py-6 ${creationMode === 'pick' && (!selectedHero || !selectedPlace || !selectedItem) ? 'opacity-50' : ''}`}
              >
                {isLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <><Sparkles className="w-6 h-6 mr-2" />Make Magic!</>}
              </Button>
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </div>
          </Tabs>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center w-full max-w-2xl">
            {image && (
              <motion.img 
                src={image} 
                alt="Story illustration" 
                className="w-full max-w-md h-auto object-cover rounded-xl shadow-lg mx-auto mb-4 border-4 border-white"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              />
            )}
            <motion.div 
              className="p-4 bg-white rounded-lg shadow-md max-w-lg mx-auto relative group"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-700 leading-relaxed text-lg">{story}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={readStory}
                disabled={isReading || !story}
                className="absolute -top-4 -right-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title={isReading ? "Generating Audio..." : "Read story aloud"}
              >
                {isReading ? <Loader2 className="w-5 h-5 animate-spin text-yellow-600" /> : <Volume2 className="w-5 h-5 text-yellow-600" />}
              </Button>
              {audioUrl && (
                <audio src={audioUrl} controls autoPlay className="mt-4 w-full"></audio>
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </motion.div>

            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <Button onClick={downloadStory} className="bg-blue-500 hover:bg-blue-600">
                <Download className="w-4 h-4 mr-2" />
                Download Story
              </Button>
              <Button onClick={printStory} className="bg-purple-500 hover:bg-purple-600">
                <Printer className="w-4 h-4 mr-2" />
                Print Story
              </Button>
              <Button onClick={startOver} variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-100">
                <BookOpen className="w-4 h-4 mr-2" />
                Create New Story
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
