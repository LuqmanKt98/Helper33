
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // New import for Button
import { Mic, MicOff, Send } from "lucide-react"; // New imports for icons
import { motion } from "framer-motion";

export default function ReflectionCard({ reflection, onJournal, onSkip }) { // Modified props
  const [userEntry, setUserEntry] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported by your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Set language for better accuracy

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setUserEntry(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setSpeechError("I didn't hear anything. Please try speaking again.");
      } else if (event.error === 'not-allowed') {
        setSpeechError("Microphone access isn't enabled. Please check your browser permissions.");
      } else if (event.error === 'network') {
        setSpeechError("A network error occurred. Please check your internet connection.");
      } else {
        setSpeechError(`A speech error occurred: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup function to stop recognition if component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechError(''); // Clear previous errors
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setSpeechError("Failed to start speech recognition. Please ensure microphone access is granted and try again.");
        setIsListening(false);
      }
    }
  };

  const handleSubmit = () => {
    if (userEntry.trim()) {
      onJournal(userEntry);
      setUserEntry(''); // Clear after submitting
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop(); // Stop listening if still active
      }
      setSpeechError(''); // Clear any errors
    } else {
      setSpeechError("Your entry is empty. Please speak or type something.");
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      setUserEntry(''); // Clear entry on skip
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setSpeechError('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card
        className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full"
        style={{
          background: 'linear-gradient(135deg, rgba(136, 180, 161, 0.1) 0%, rgba(214, 180, 161, 0.1) 100%)',
          borderTop: '3px solid #88b4a1'
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            {reflection?.day_number && (
              <Badge variant="outline" className="text-xs" style={{ borderColor: '#88b4a1', color: '#88b4a1' }}>
                Day {reflection.day_number}
              </Badge>
            )}
            {reflection?.category && (
              <Badge variant="secondary" className="text-xs capitalize">
                {reflection.category.replace('_', ' ')}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg font-bold text-gray-800 mt-2">
            {reflection?.title || "Reflect on Your Day"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[120px] p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            placeholder="Start typing or click the microphone to speak your reflection..."
            value={userEntry}
            onChange={(e) => setUserEntry(e.target.value)}
            disabled={isListening}
          ></textarea>

          <div className="mt-4 flex items-center justify-between">
            <Button
              onClick={handleListen}
              variant="ghost"
              size="sm"
              className={`text-gray-500 hover:text-gray-800 ${isListening ? 'text-red-500' : ''}`}
            >
              {isListening ? <MicOff className="w-4 h-4 mr-2 text-red-500" /> : <Mic className="w-4 h-4 mr-2" />}
              {isListening ? 'Stop Listening' : 'Speak Your Mind'}
            </Button>
            <div className="flex gap-2">
              {onSkip && (
                <Button onClick={handleSkip} variant="outline" size="sm" className="text-gray-500">
                  Skip
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={!userEntry.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </div>
          {speechError && <p className="text-xs text-red-500 mt-2">{speechError}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
