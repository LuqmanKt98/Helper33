
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Edit, Send, Heart, ArrowRight, Star, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const moodOptions = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#FCD34D', funText: 'Super happy!', prompts: ['What made you smile today?', 'What was the best part of your day?'] },
  { id: 'excited', label: 'Excited', emoji: '🤩', color: '#F59E0B', funText: 'So excited!', prompts: ['What are you looking forward to?', 'What makes you feel this excited?'] },
  { id: 'calm', emoji: '😌', color: '#60A5FA', funText: 'Nice and calm', prompts: ['What helped you feel peaceful?', 'What does feeling calm feel like for you?'] },
  { id: 'okay', label: 'Okay', emoji: '😐', color: '#9CA3AF', funText: 'Just okay', prompts: ['How was your day?', 'Is there anything you want to share?'] },
  { id: 'sad', label: 'Sad', emoji: '😢', color: '#93C5FD', funText: 'Feeling sad', prompts: ['What made you feel sad?', 'Do you want to talk about it?'] },
  { id: 'angry', label: 'Angry', emoji: '😠', color: '#EF4444', funText: 'Kind of angry', prompts: ['What made you feel angry?', 'How does your body feel when you\'re angry?'] },
  { id: 'worried', label: 'Worried', emoji: '😰', color: '#A78BFA', funText: 'A bit worried', prompts: ['What\'s worrying you?', 'What are you thinking about?'] },
  { id: 'silly', label: 'Silly', emoji: '🤪', color: '#F472B6', funText: 'Super silly!', prompts: ['What made you laugh today?', 'Tell me about something funny!'] },
];

const KIDS_VOICE_CONFIG = {
  rate: 0.95,
  pitch: 1.4,
  volume: 1.0,
  lang: 'en-US'
};

export default function KidsJournal({ onComplete, childMember, onOpenGratitudeGame }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('welcome-name');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [inputMode, setInputMode] = useState('write');
  const [journalEntry, setJournalEntry] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false); // Renamed from isRecording
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGratitudePrompt, setShowGratitudePrompt] = useState(false);
  
  const gratitudeSectionRef = useRef(null);
  const audioRef = useRef(null);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const hasIntroducedRef = useRef(false);

  const recognitionRef = useRef(null); // New ref for Web Speech API

  // Define speak function early, before any useEffect that might use it
  const speak = useCallback((text, options = {}) => {
    if (!('speechSynthesis' in window)) {
      if (options.onComplete) options.onComplete();
      return;
    }

    // Prevent speaking the same text twice in a row
    if (text === lastSpokenText) {
      console.log('Skipping duplicate speech');
      if (options.onComplete) options.onComplete();
      return;
    }

    // Cancel any ongoing speech synthesis
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();

    try {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = KIDS_VOICE_CONFIG.rate;
        utterance.pitch = KIDS_VOICE_CONFIG.pitch;
        utterance.volume = KIDS_VOICE_CONFIG.volume;
        utterance.lang = KIDS_VOICE_CONFIG.lang;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = ['Google US English', 'Microsoft Zira', 'Samantha', 'Karen'];
        
        let selectedVoice = voices.find(voice => 
          preferredVoices.some(preferred => voice.name.includes(preferred))
        );
        
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
          );
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
          setLastSpokenText(text); // Update last spoken text when speech completes
          if (options.onComplete) options.onComplete();
        };
        
        utterance.onerror = () => {
          if (options.onComplete) options.onComplete();
        };

        window.speechSynthesis.speak(utterance);
      }, 300); // Longer delay to ensure parent AI is fully cancelled
    } catch (error) {
      if (options.onComplete) options.onComplete();
    }
  }, [lastSpokenText]);

  useEffect(() => {
    // Check if we already have child info
    if (childMember?.child_name && childMember?.child_age) {
      setChildName(childMember.child_name);
      setChildAge(childMember.child_age);
      setStep('mood-select');
      hasIntroducedRef.current = true; // Mark as introduced since we're skipping initial steps
    }
  }, [childMember]);

  // Introduction - AI introduces herself and asks for name
  useEffect(() => {
    // If child info is pre-filled via childMember, we bypass welcome-name and don't need initial intro speech.
    if (childMember?.child_name && childMember?.child_age) {
        return;
    }

    if (step === 'welcome-name' && !hasIntroducedRef.current) {
      hasIntroducedRef.current = true; // Mark as introduced
      
      // Wait a bit longer to ensure parent component's speech is cancelled
      const introTimeout = setTimeout(() => {
        speak("Hi! My name is Luna, and I'm your special feelings friend! 🌟 I'm here to listen to how you're feeling and help you share your thoughts in a safe, private place. Before we start, I'd love to get to know you! What's your name?");
      }, 500);
      
      return () => clearTimeout(introTimeout);
    }
  }, [step, childMember, speak]);

  // Speak prompt when entering journal entry step
  useEffect(() => {
    if (step === 'journal-entry' && currentPrompt && !lastSpokenText.includes(currentPrompt)) {
      const promptTimeout = setTimeout(() => {
        speak(currentPrompt);
      }, 500);
      
      return () => clearTimeout(promptTimeout);
    }
  }, [step, currentPrompt, speak, lastSpokenText]);

  // Web Speech API setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setJournalEntry(prev => (prev ? prev + ' ' : '') + transcript); // Append to existing entry
        setIsVoiceRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        setIsVoiceRecording(false);
        
        // Gentle error handling for kids
        if (event.error === 'not-allowed') {
          speak("Oops! I need permission to use the microphone. Can you ask a grown-up to help?");
        } else if (event.error === 'no-speech') {
          // Don't show error for no-speech - just stop quietly
          console.log('No speech detected - user may have stopped talking');
        } else if (event.error !== 'aborted') {
          // Only speak error for unexpected issues
          speak("Hmm, I couldn't hear that. Want to try typing instead?");
        }
      };

      recognitionRef.current.onend = () => {
        setIsVoiceRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Silently handle cases where recognition might not be active
        }
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Silently handle
        }
      }
    };
  }, []);

  const playSound = (type) => {
    try {
      const audio = new Audio();
      if (type === 'click') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Txt3QfBSuF0PPUgjMHHnC36eWZTgwOUaju8K90IwUzjdXyznosBiR5yO/ekyQLFl623+2qWhELSKPp8bVyIgU1j9T02X0wBiN2xvDglEcLF2K47OusXBIMTKhr87t5JAU3j9Xx2X4yBSNzxfDili4MFmS88vGvYRMOTKjr87t5IwU3j9Tx2n4xBSNzxe/hmC8MF2W88vGvYRMOTKjr87t5IgU3j9Tx2n4xBSJyxe/hmS8MGGa88vCvYhMPTKjr87t5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5Ig==';
      } else if (type === 'complete') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Txt3QfBSuF0PPUgjMHHnC36eWZTgwOUaju8K90IwUzjdXyznosBiR5yO/ekyQLFl623+2qWhELSKPp8bVyIgU1j9T02X0wBiN2xvDglEcLF2K47OusXBIMTKhr87t5JAU3j9Xx2X4yBSNzxfDili4MFmS88vGvYRMOTKjr87t5IwU3j9Tx2n4xBSNzxe/hmC8MF2W88vGvYRMOTKjr87t5IgU3j9Tx2n4xBSJyxe/hmS8MGGa88vCvYhMPTKjr87t5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5IgU3j9Tx2n4xBSJxxe/hmS8MGGa88vCvYhMPTKjr87x5Ig==';
      }
      audioRef.current = audio;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Sound playback not available');
    }
  };

  const handleNameSubmit = () => {
    if (!childName.trim()) {
      speak("Please tell me your name so I can get to know you!");
      return;
    }

    playSound('click');
    speak(`${childName}! That's such a wonderful name! Now, how old are you?`);
    setStep('welcome-age');
  };

  const handleAgeSubmit = () => {
    if (!childAge) {
      speak("Please tell me your age so I can help you better!");
      return;
    }
    
    const age = parseInt(childAge);
    if (age < 3 || age > 17) {
      speak("Please enter an age between 3 and 17");
      return;
    }

    playSound('click');
    
    // Age-appropriate response
    let ageResponse = "";
    if (age <= 7) {
      ageResponse = `Awesome, ${childName}! ${age} is such a cool age! I'm your feelings friend, and I'm here to listen whenever you want to talk about your day!`;
    } else if (age <= 12) {
      ageResponse = `Nice to meet you, ${childName}! ${age} is a great age. I'm here to be your listening friend whenever you need to share your feelings!`;
    } else {
      ageResponse = `Great to meet you, ${childName}! I'm here to listen and support you as you share your thoughts and feelings.`;
    }
    
    speak(ageResponse + " Now, let's talk about how you're feeling today!");
    setStep('mood-select');
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    playSound('click');
    
    // Pick a random prompt for this mood
    const randomPrompt = mood.prompts[Math.floor(Math.random() * mood.prompts.length)];
    setCurrentPrompt(randomPrompt);
    
    speak(`You're feeling ${mood.funText}! ${randomPrompt}`);
    
    setTimeout(() => {
      setStep('journal-entry');
    }, 2000);
  };

  const startVoiceRecording = () => {
    if (!recognitionRef.current) {
      speak("Voice recording isn't available right now. Let's type instead!");
      return;
    }

    try {
      setJournalEntry(''); // Clear previous text when starting new recording
      setLastSpokenText(''); // Clear last spoken text so AI can say "I'm listening!"
      setIsVoiceRecording(true);
      recognitionRef.current.start();
      speak("I'm listening! Tell me about your day!");
    } catch (error) {
      console.log('Could not start voice recording:', error);
      setIsVoiceRecording(false);
      speak("Oops! Let's try typing instead.");
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isVoiceRecording) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recording:', error);
      }
      setIsVoiceRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!journalEntry.trim()) {
      speak("Please write something or record your voice first!");
      return;
    }

    setIsProcessing(true);
    playSound('click');

    try {
      const age = parseInt(childAge);
      const moodEmoji = moodOptions.find(m => m.id === selectedMood.id)?.emoji || '😊';
      
      let aiResponseText = '';
      if (journalEntry.trim()) {
        const safetyGuidelines = `
YOU ARE A CARING, INTELLIGENT FRIEND FOR CHILDREN - NOT A THERAPIST.

RESPONSE VARIETY: Use different phrases and structures each time. Never repeat the same response pattern.

CRITICAL SAFETY PROTOCOL:
1. NEVER give medical, mental health, or crisis advice
2. If child mentions: harm to self/others, abuse, danger, bullying, violence, inappropriate adult behavior, or serious distress
   - Respond ONLY: "That sounds really important and I'm glad you told someone. Please talk to your mom, dad, teacher, or another trusted adult about this right away. They can help you better than I can. 💙"
   - DO NOT discuss the issue further
   - DO NOT ask follow-up questions
   - DO NOT give advice on what to do

YOUR ROLE: Listen, validate feelings with intelligence and empathy, encourage talking to trusted adults
`;

        let ageAppropriatePrompt = '';
        
        if (age <= 7) {
          ageAppropriatePrompt = `${safetyGuidelines}

Child: ${childName}, age ${age}, feeling ${selectedMood.label}.
They wrote: "${journalEntry}"

Respond with 1-2 VERY simple, UNIQUE sentences (5-year-old level):
- Validate their feeling warmly and genuinely.
- Use very simple, clear words.
- Include 1 appropriate emoji.
- Be encouraging, kind, and VARIED in your response.
- Never repeat previous response patterns.
- If anything concerning mentioned, use ONLY the safety response above.

Remember: Be warm, specific to what they wrote, and always different!`;

        } else if (age <= 12) {
          ageAppropriatePrompt = `${safetyGuidelines}

Child: ${childName}, age ${age}, feeling ${selectedMood.label}.
They wrote: "${journalEntry}"

Respond with 2-3 thoughtful, UNIQUE sentences:
- Validate their feelings genuinely and specifically.
- Use age-appropriate language (8-12 year old level).
- Include relevant emojis naturally.
- Be supportive, warm, and INTELLIGENT.
- Show you really understood what they shared.
- Always remind them trusted adults are there for them.
- VARY your response structure and phrases.
- If anything concerning mentioned, use ONLY the safety response above.

Remember: Be thoughtful, specific, and never repetitive!`;

        } else {
          ageAppropriatePrompt = `${safetyGuidelines}

Teen: ${childName}, age ${age}, feeling ${selectedMood.label}.
They wrote: "${journalEntry}"

Respond with 2-3 THOUGHTFUL, UNIQUE sentences:
- Validate feelings genuinely and respectfully.
- Use teen-appropriate language with intelligence.
- Include appropriate emojis thoughtfully.
- Be supportive without being condescending.
- Show real understanding of what they shared.
- Gently remind them of trusted adults.
- VARY your vocabulary and sentence structures.
- If anything concerning mentioned, use ONLY the safety response above.

Remember: Be insightful, respectful, specific, and always different!`;
        }

        aiResponseText = await base44.integrations.Core.InvokeLLM({ prompt: ageAppropriatePrompt });
        
      } else {
        // Fallback, though journalEntry.trim() check should prevent this path for empty entries
        aiResponseText = `Thank you for sharing, ${childName}! I'm here to listen whenever you want to talk! Remember, your mom, dad, or teacher are always there for you too! 💜`;
      }

      // Save journal entry
      const entryData = {
        child_member_id: childMember?.id || 'anonymous',
        child_name: childName,
        child_age: age,
        entry_date: new Date().toISOString().split('T')[0],
        mood: selectedMood.id,
        mood_emoji: moodEmoji,
        prompt: currentPrompt,
        entry_content: journalEntry,
        entry_type: inputMode === 'voice' ? 'voice-to-text' : 'text', // Differentiate if input came from voice recognition
        ai_response: aiResponseText,
        stickers_earned: ['star-sticker'],
        points_earned: 500,
        parent_can_view_content: false,
      };

      await base44.entities.KidsJournalEntry.create(entryData);

      // Show AI feedback
      setAiResponse(aiResponseText);
      setShowFeedback(true);
      
      // Speak the AI response ONCE - with duplicate prevention
      await new Promise((resolve) => {
        speak(aiResponseText, { onComplete: resolve });
      });

      // Confetti and success sound
      playSound('complete');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Award points
      if (onComplete) {
        onComplete(500, 'star-sticker');
      }

      // After 2 seconds, show gratitude prompt and scroll to it
      setTimeout(() => {
        setShowGratitudePrompt(true);
        
        const gratitudeMessage = age <= 7 
          ? `Great job, ${childName}! 🌟 Now, let's play the Gratitude Game! Can you think of three things that made you happy today? It's like a treasure hunt for good feelings! 🌈`
          : age <= 12
          ? `Awesome, ${childName}! 💜 Let's find three things you're thankful for today. It helps us feel even better! ✨`
          : `Nice work, ${childName}! 💙 Let's try the Gratitude Game! Finding things you're thankful for is a great way to end your day on a positive note!`;
        
        speak(gratitudeMessage, {
          onComplete: () => {
            // Scroll to gratitude section after speaking
            setTimeout(() => {
              gratitudeSectionRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }, 500);
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Error processing journal entry:', error);
      speak("Oh no! Something went wrong. But that's okay, we can try again!");
      setAiResponse(`Thanks for sharing with me, ${childName}! You're doing great! 💜 Remember, you can always talk to mom or dad about your feelings too!`);
      setShowFeedback(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {step === 'welcome-name' && (
          <motion.div
            key="welcome-name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                📓
              </motion.div>
              <h2 className="text-3xl font-bold text-purple-800 mb-2">Welcome to Your Feelings Journal! 🌈</h2>
              <p className="text-gray-600 text-lg mb-4">A safe place to share how you feel!</p>
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mb-6">
                <p className="text-lg text-blue-800 font-semibold">
                  Hi! I'm Luna 🌟, your feelings friend!
                </p>
                <p className="text-blue-700 mt-2">
                  I'm here to listen to you and help you share your thoughts. Let's be friends!
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl space-y-4">
              <div>
                <Label htmlFor="childName" className="text-lg font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  👋 What's your name?
                </Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  placeholder="Type your name here..."
                  className="text-lg p-4"
                  maxLength={50}
                  autoFocus
                />
              </div>

              <Button
                onClick={handleNameSubmit}
                disabled={!childName.trim()}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Next
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">🔒 Your journal is private and safe!</p>
              <p>Parents can see your mood emojis to check on you, but they can't read what you write. 💙</p>
              <p className="mt-2 text-xs">Remember: You can always talk to mom, dad, or a teacher about anything! 🤗</p>
            </div>
          </motion.div>
        )}

        {step === 'welcome-age' && (
          <motion.div
            key="welcome-age"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🎂
              </motion.div>
              <h2 className="text-3xl font-bold text-purple-800 mb-2">Nice to meet you, {childName}! 😊</h2>
              <p className="text-gray-600 text-lg">Now I'd like to know...</p>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl space-y-4">
              <div>
                <Label htmlFor="childAge" className="text-lg font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  🎂 How old are you?
                </Label>
                <Input
                  id="childAge"
                  type="number"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAgeSubmit()}
                  placeholder="Enter your age"
                  className="text-lg p-4"
                  min="3"
                  max="17"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleAgeSubmit}
                disabled={!childAge}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                Let's Start! 🚀
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'mood-select' && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Hi {childName}! 👋</h2>
              <p className="text-xl text-gray-600">How are you feeling today?</p>
              <p className="text-gray-500 mt-2">Pick the emoji that matches your mood! 😊</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {moodOptions.map((mood) => (
                <motion.button
                  key={mood.id}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood)}
                  className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-4 border-transparent hover:border-purple-300"
                  style={{ borderTopColor: mood.color }}
                >
                  <motion.span 
                    className="text-6xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {mood.emoji}
                  </motion.span>
                  <span className="text-lg font-bold text-gray-700">{mood.label}</span>
                  <span className="text-sm text-gray-500">{mood.funText}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'journal-entry' && selectedMood && (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.span 
                  className="text-7xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {selectedMood.emoji}
                </motion.span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-gray-800">Feeling {selectedMood.label}!</h3>
                  <p className="text-gray-600">{currentPrompt} ✨</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant={inputMode === 'write' ? 'default' : 'outline'}
                onClick={() => { setInputMode('write'); stopVoiceRecording(); setJournalEntry(''); setLastSpokenText(''); }}
                className="gap-2 text-lg py-6 px-8"
              >
                <Edit className="w-5 h-5" />
                ✏️ Write
              </Button>
              <Button
                variant={inputMode === 'voice' ? 'default' : 'outline'}
                onClick={() => { setInputMode('voice'); setJournalEntry(''); setLastSpokenText(''); }}
                className="gap-2 text-lg py-6 px-8"
              >
                <Mic className="w-5 h-5" />
                🎤 Talk
              </Button>
            </div>

            {inputMode === 'write' ? (
              <div className="space-y-4">
                <Textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder={`Hi ${childName}! ${currentPrompt}

You can write as much or as little as you want... 💭`}
                  className="min-h-[250px] text-lg p-6 rounded-2xl border-4 border-purple-200 focus:border-purple-400 bg-gradient-to-br from-white to-purple-50"
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isProcessing || !journalEntry.trim()}
                  className="w-full py-8 text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  {isProcessing ? (
                    <>Processing... 🌟</>
                  ) : (
                    <>
                      <Send className="w-6 h-6 mr-2" />
                      Share My Feelings! 💜
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-6 p-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-md border-4 border-purple-200">
                  {!isVoiceRecording && !journalEntry.trim() ? (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Mic className="w-24 h-24 text-purple-400" />
                      </motion.div>
                      <p className="text-gray-700 text-xl text-center">Press the button and tell me how you feel, {childName}! 🎤</p>
                      <Button 
                        onClick={startVoiceRecording}
                        size="lg"
                        className="gap-3 py-8 px-12 text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Mic className="w-6 h-6" />
                        Start Talking! 🗣️
                      </Button>
                    </>
                  ) : isVoiceRecording ? (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Mic className="w-24 h-24 text-red-500" />
                      </motion.div>
                      <p className="text-red-600 font-bold text-2xl">I'm listening... 👂</p>
                      <Button 
                        onClick={stopVoiceRecording}
                        variant="destructive"
                        size="lg"
                        className="py-8 px-12 text-xl"
                      >
                        Stop Recording 🛑
                      </Button>
                      {journalEntry.trim() && (
                        <p className="text-gray-600 text-lg mt-4">
                          What I heard so far: "<span className="italic">{journalEntry}</span>"
                        </p>
                      )}
                    </>
                  ) : ( // !isVoiceRecording && journalEntry.trim() (Recording stopped, text is available)
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Sparkles className="w-24 h-24 text-green-500" />
                      </motion.div>
                      <p className="text-green-600 font-bold text-2xl">Got it! Great job, {childName}! 🎉</p>
                      <Textarea
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        placeholder="Your spoken words will appear here. You can edit them too!"
                        className="min-h-[150px] text-lg p-6 rounded-2xl border-4 border-purple-200 focus:border-purple-400 bg-gradient-to-br from-white to-purple-50"
                        rows={5}
                      />
                      <Button 
                        onClick={handleSubmit}
                        disabled={isProcessing || !journalEntry.trim()}
                        size="lg"
                        className="gap-3 py-8 px-12 text-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        {isProcessing ? 'Processing... 🌟' : (
                          <>
                            <Send className="w-6 h-6" />
                            Share My Voice! 🎤
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => { setJournalEntry(''); setLastSpokenText(''); }}
                        variant="outline"
                        size="sm"
                        className="text-lg"
                      >
                        Record Again 🔄
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {showFeedback && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-2xl border-4 border-purple-300"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Sparkles className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
                    </motion.div>
                    <p className="text-gray-800 text-xl leading-relaxed">{aiResponse}</p>
                  </div>
                </motion.div>

                {showGratitudePrompt && (
                  <motion.div
                    ref={gratitudeSectionRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 space-y-4"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex justify-center"
                    >
                      <ArrowDown className="w-12 h-12 text-yellow-500" />
                    </motion.div>

                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-8 rounded-2xl border-4 border-yellow-300 text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-4"
                      >
                        🌟
                      </motion.div>
                      
                      <h2 className="text-3xl font-bold text-orange-800 mb-4">Want to Play a Fun Game? 🎯</h2>
                      <p className="text-xl text-gray-700 leading-relaxed mb-6">
                        {parseInt(childAge) <= 7 
                          ? `${childName}, let's play the Gratitude Game! Can you think of three things that made you happy today? It's like a treasure hunt for good feelings! 🌈`
                          : parseInt(childAge) <= 12
                          ? `${childName}, want to try the Gratitude Game? Let's find three things you're thankful for today. It helps us feel even better! ✨`
                          : `${childName}, try the Gratitude Game! Finding things you're thankful for is a great way to end your day on a positive note! 💙`
                        }
                      </p>
                      
                      {onOpenGratitudeGame && (
                        <Button
                          onClick={() => {
                            speak("Let's play the Gratitude Game now!");
                            setTimeout(() => {
                              onOpenGratitudeGame();
                            }, 500);
                          }}
                          size="lg"
                          className="w-full mb-4 py-8 text-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold shadow-2xl"
                        >
                          <Star className="w-8 h-8 mr-3" />
                          Play Gratitude Game Now! 🎮
                        </Button>
                      )}
                      
                      <div className="bg-white/50 p-4 rounded-xl">
                        <p className="text-base text-gray-700">
                          💡 <strong>Tip:</strong> You can also find the Gratitude Game (yellow star ⭐) in the main menu anytime!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
