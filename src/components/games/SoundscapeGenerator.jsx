
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Waves, Wind, Zap, Bird, Bug, Sparkles, Play, Pause, Square, Music, Loader2
} from 'lucide-react';
import { InvokeLLM, GenerateImage } from '@/integrations/Core';

// --- Visualizer Components ---

const OceanVisuals = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-blue-400 rounded-full"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.3, 0], scale: 1 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: i * 0.8,
          ease: 'easeInOut'
        }}
        style={{
          width: `${100 + i * 50}px`,
          height: `${100 + i * 50}px`,
          top: `${Math.random() * 80}%`,
          left: `${Math.random() * 80}%`,
        }}
      />
    ))}
  </div>
);

const CricketsVisuals = () => (
  <div className="absolute inset-0 bg-gray-900 overflow-hidden">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-yellow-300 rounded-full"
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
          delay: Math.random() * 3
        }}
        style={{
          width: '5px',
          height: '5px',
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

const HummingbirdVisuals = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
            animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut'}}
        >
            <Bird className="w-16 h-16 text-emerald-500" />
            <motion.div 
                className="absolute top-1/2 left-0 w-8 h-4 bg-emerald-300/50 rounded-full"
                animate={{ scaleX: [1, 0, 1], x: -20 }}
                transition={{ duration: 0.1, repeat: Infinity }}
            />
            <motion.div 
                className="absolute top-1/2 right-0 w-8 h-4 bg-emerald-300/50 rounded-full"
                animate={{ scaleX: [1, 0, 1], x: 20 }}
                transition={{ duration: 0.1, repeat: Infinity }}
            />
        </motion.div>
    </div>
);

const NoiseVisuals = () => (
  <div className="absolute inset-0 overflow-hidden bg-gray-200">
    {[...Array(100)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-gray-400"
        style={{
          width: '2px',
          height: '2px',
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.5
        }}
      />
    ))}
  </div>
);


const soundLibrary = [
  {
    id: 'ocean',
    title: 'Ocean Waves',
    description: 'Calm waves washing over a sandy shore.',
    icon: Waves,
    audioSrc: 'https://www.kozco.com/tech/ocean.mp3', // More reliable source
    fallbackTone: { frequency: 200, type: 'sine', volume: 0.3 },
    Visualizer: OceanVisuals
  },
  {
    id: 'crickets',
    title: 'Evening Crickets',
    description: 'The peaceful chirping of crickets on a warm night.',
    icon: Bug,
    audioSrc: 'https://www.kozco.com/tech/crickets.mp3',
    fallbackTone: { frequency: 1000, type: 'square', volume: 0.1 },
    Visualizer: CricketsVisuals
  },
  {
    id: 'hummingbird',
    title: 'Forest Birds',
    description: 'Gentle bird songs from a lush forest.',
    icon: Bird,
    audioSrc: 'https://www.kozco.com/tech/birds.mp3',
    fallbackTone: { frequency: 800, type: 'sine', volume: 0.2 },
    Visualizer: HummingbirdVisuals
  },
  {
    id: 'vacuum',
    title: 'Brown Noise',
    description: 'A deep, consistent hum for focus and relaxation.',
    icon: Wind,
    audioSrc: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAC', // Empty WAV, relies on fallback
    fallbackTone: { frequency: 150, type: 'sawtooth', volume: 0.4 },
    Visualizer: NoiseVisuals
  },
  {
    id: 'white_noise',
    title: 'White Noise',
    description: 'A mix of all sound frequencies for masking distractions.',
    icon: Zap,
    audioSrc: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAC', // Empty WAV, relies on fallback
    fallbackTone: { frequency: 400, type: 'triangle', volume: 0.3 },
    Visualizer: NoiseVisuals
  },
];

export default function SoundscapeGenerator() {
  const [selectedSound, setSelectedSound] = useState(null);
  const [customSoundDescription, setCustomSoundDescription] = useState('');
  const [generatedCustomSound, setGeneratedCustomSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300); // 5 minutes default
  const [timeLeft, setTimeLeft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null); // Ref for Web Audio API context
  const oscillatorRef = useRef(null);   // Ref for Web Audio API oscillator

  const activeSound = generatedCustomSound || selectedSound;
  const ActiveVisualizer = activeSound?.Visualizer;

  // Cleanup effect
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioElement) {
        audioElement.pause();
      }
      // Cleanup audio context
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft !== null && timeLeft <= 0) {
      setIsPlaying(false);
      setTimeLeft(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      stopToneAudio(); // Stop any active tone as well
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [timeLeft, isPlaying]);

  const createToneAudio = (sound) => {
    try {
      // Stop any existing oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const fallback = sound.fallbackTone;
      oscillator.frequency.value = fallback.frequency;
      oscillator.type = fallback.type;
      gainNode.gain.value = fallback.volume;
      
      oscillator.start();
      oscillatorRef.current = oscillator;
      
      return true;
    } catch (error) {
      console.error('Failed to create tone audio:', error);
      return false;
    }
  };

  const stopToneAudio = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleSelectSound = (sound) => {
    setGeneratedCustomSound(null);
    setSelectedSound(sound);
    if (isPlaying) {
      handlePlayPause(); // Pause current sound
      setTimeout(() => handlePlayPause(sound), 100); // Play new one after a short delay
    }
  };

  const handlePlayPause = (soundToPlay = activeSound) => {
    if (!soundToPlay) return;

    if (isPlaying) {
      audioRef.current?.pause();
      stopToneAudio(); // Stop any active tone
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsPlaying(false);
    } else {
      let playbackStarted = false;

      // Try to play the audio file first
      if (audioRef.current) {
        audioRef.current.src = soundToPlay.audioSrc;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.8; // Default volume for audio files
        audioRef.current.play()
          .then(() => {
            playbackStarted = true;
          })
          .catch(error => {
            console.warn("Audio file failed to load or play:", error);
            // If audio file fails, attempt to use fallback tone generation
            if (soundToPlay.fallbackTone && createToneAudio(soundToPlay)) {
              console.log("Successfully started fallback tone.");
              playbackStarted = true;
            } else {
              console.error("Both audio file and fallback tone failed.");
              alert("Unable to play this sound. Please try another one.");
              playbackStarted = false;
            }
          })
          .finally(() => {
            if (playbackStarted) {
              setTimeLeft(timerDuration);
              timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prev => (prev !== null ? prev - 1 : null));
              }, 1000);
              setIsPlaying(true);
            }
          });
      } else if (soundToPlay.fallbackTone) {
        // If no audio element (shouldn't happen with audioRef), or if audioRef is somehow null,
        // directly try to create tone audio.
        if (createToneAudio(soundToPlay)) {
          console.log("AudioRef not available, started fallback tone directly.");
          playbackStarted = true;
        } else {
          console.error("No audio element and fallback tone failed.");
          alert("Unable to play this sound. Please try another one.");
        }
      }

      if (playbackStarted) {
        // This part might be executed multiple times if the promise chain in audio.play()
        // also leads to fallback starting. We ensure timer and state update only once.
        if (!isPlaying) { // Only set timer and state if not already playing from a fallback
            setTimeLeft(timerDuration);
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prev => (prev !== null ? prev - 1 : null));
            }, 1000);
            setIsPlaying(true);
        }
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    stopToneAudio(); // Stop any active tone
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsPlaying(false);
    setTimeLeft(null);
  };
  
  const handleGenerateSound = async () => {
    if (!customSoundDescription) return;
    setIsGenerating(true);
    setGeneratedCustomSound(null);
    setSelectedSound(null);
    
    try {
      // Step 1: Use LLM to generate a rich prompt for image generation
      const imagePromptResponse = await InvokeLLM({
        prompt: `Based on the user's sound description: "${customSoundDescription}", create a vivid, artistic prompt for an AI image generator. The prompt should capture the mood, environment, and feeling of the sound. Focus on visual elements.`
      });

      // Step 2: Generate the image
      const imageResult = await GenerateImage({ prompt: imagePromptResponse });
      
      // Step 3: Create the custom sound object with fallback tone
      setGeneratedCustomSound({
        id: 'custom',
        title: customSoundDescription,
        description: 'Your custom AI-generated soundscape.',
        icon: Sparkles,
        audioSrc: 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAC', // Empty audio, relies on fallback
        fallbackTone: { frequency: 300, type: 'sine', volume: 0.25 }, // Gentle tone for custom sounds
        Visualizer: () => (
            <img src={imageResult.url} alt={customSoundDescription} className="absolute inset-0 w-full h-full object-cover"/>
        ),
        imageUrl: imageResult.url
      });
      
    } catch (error) {
      console.error("Failed to generate custom soundscape:", error);
      alert("Failed to generate custom soundscape. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <audio ref={audioRef} />
      
      {/* Left Panel: Sound Library & Custom Generation */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Music className="w-5 h-5 text-purple-600" />
              Sound Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {soundLibrary.map(sound => (
              <button
                key={sound.id}
                onClick={() => handleSelectSound(sound)}
                className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                  selectedSound?.id === sound.id 
                  ? 'bg-purple-100 border-purple-300' 
                  : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md shadow-sm">
                    <sound.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{sound.title}</h4>
                    <p className="text-sm text-gray-500">{sound.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Create Your Own Soundscape
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Can't find what you're looking for? Describe a sound, and our AI will create a visual soundscape for you.</p>
            <Textarea
              value={customSoundDescription}
              onChange={(e) => setCustomSoundDescription(e.target.value)}
              placeholder="e.g., 'Rain falling on a tin roof', 'A crackling fireplace in a cozy cabin'..."
              className="h-24"
            />
            <Button onClick={handleGenerateSound} disabled={isGenerating} className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : "Generate with AI"}
            </Button>
             {generatedCustomSound && (
                <div className="p-3 rounded-lg border-2 bg-amber-50 border-amber-300 text-center">
                    <p className="text-sm font-semibold text-amber-800">Your custom soundscape is ready!</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Player & Visualizer */}
      <div className="lg:col-span-2">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg h-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                      {activeSound ? activeSound.title : 'Soundscape Player'}
                  </CardTitle>
                  <p className="text-gray-600">
                      {activeSound ? activeSound.description : 'Select a sound or create one to begin.'}
                  </p>
              </div>
              {activeSound && <div className="p-3 bg-white rounded-lg shadow-inner"><activeSound.icon className="w-6 h-6 text-purple-600"/></div>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-inner">
              {ActiveVisualizer ? <ActiveVisualizer /> : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Music className="w-16 h-16 mb-4" />
                  <p>Visualizer will appear here</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="timer-select" className="text-gray-700">Set Timer</Label>
                  <Select
                      value={timerDuration.toString()}
                      onValueChange={(val) => setTimerDuration(Number(val))}
                      disabled={isPlaying}
                  >
                      <SelectTrigger id="timer-select" className="w-[180px]">
                          <SelectValue placeholder="Set duration" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="60">1 Minute</SelectItem>
                          <SelectItem value="300">5 Minutes</SelectItem>
                          <SelectItem value="600">10 Minutes</SelectItem>
                          <SelectItem value="900">15 Minutes</SelectItem>
                          <SelectItem value="1800">30 Minutes</SelectItem>
                          <SelectItem value="3600">1 Hour</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => handlePlayPause()}
                    disabled={!activeSound}
                    size="lg"
                    className={`w-32 transition-all ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    {isPlaying ? (
                      <><Pause className="w-5 h-5 mr-2" /> Pause</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" /> Play</>
                    )}
                  </Button>
                  <Button onClick={handleStop} variant="outline" size="lg" disabled={!isPlaying}>
                      <Square className="w-5 h-5 mr-2" /> Stop
                  </Button>
                  <div className="text-4xl font-mono font-bold text-gray-700 w-32 text-center p-2 bg-gray-100 rounded-lg shadow-inner">
                      {formatTime(timeLeft)}
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
