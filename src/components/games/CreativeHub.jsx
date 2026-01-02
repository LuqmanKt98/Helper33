
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Palette,
  Sparkles,
  Upload,
  Mic,
  MicOff,
  Play,
  Pause,
  Video,
  Volume2,
  Image as ImageIcon,
  BookOpen,
  Music,
  Lightbulb,
  Heart,
  Loader2,
  Download,
  Copy,
  Award,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InvokeLLM, GenerateImage, UploadFile } from "@/integrations/Core";

const creativeTypes = [
  { value: "story", label: "Short Story", icon: BookOpen, description: "Create an engaging short story" },
  { value: "poem", label: "Poem", icon: Heart, description: "Write a beautiful poem" },
  { value: "art_idea", label: "Art Concept", icon: Palette, description: "Generate art and craft ideas" },
  { value: "song", label: "Song & Music Video", icon: Music, description: "Compose song lyrics with custom video" },
  { value: "character", label: "Character", icon: Sparkles, description: "Create a fictional character" },
  { value: "invention", label: "Invention", icon: Lightbulb, description: "Design a creative invention" }
];

const musicVideoStyles = [
  { value: "nature", label: "Nature & Landscapes", description: "Scenic outdoor settings with natural beauty" },
  { value: "urban", label: "Urban & City", description: "Modern city scenes with dynamic lighting" },
  { value: "abstract", label: "Abstract & Artistic", description: "Colorful, flowing abstract visuals" },
  { value: "performance", label: "Performance Stage", description: "Concert stage with dramatic lighting" },
  { value: "animated", label: "Animated Fantasy", description: "Whimsical animated characters and scenes" },
  { value: "retro", label: "Retro & Vintage", description: "Classic vintage aesthetics and colors" }
];

const musicGenres = [
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "folk", label: "Folk" },
  { value: "electronic", label: "Electronic" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "country", label: "Country" },
  { value: "indie", label: "Indie" }
];

const allAchievements = [
    { id: 'novice_poet', label: 'Novice Poet', description: 'Write your first poem.', icon: Heart },
    { id: 'story_starter', label: 'Story Starter', description: 'Write your first story.', icon: BookOpen },
    { id: 'artful_idea', label: 'Artful Idea', description: 'Generate your first art concept.', icon: Palette },
    { id: 'lyricist', label: 'Lyricist', description: 'Write your first song.', icon: Music },
    { id: 'world_builder', label: 'World Builder', description: 'Create your first character.', icon: Sparkles },
    { id: 'innovator', label: 'Innovator', description: 'Design your first invention.', icon: Lightbulb },
    { id: 'visual_thinker', label: 'Visual Thinker', description: 'Use an image for inspiration.', icon: ImageIcon },
    { id: 'sound_weaver', label: 'Sound Weaver', description: 'Use audio for inspiration.', icon: Mic },
    { id: 'creative_spree', label: 'Creative Spree', description: 'Create 3 things in one session.', icon: Award },
];

const dailyChallenges = [
    "Describe a city where the buildings are made of candy.",
    "Write a short story about a misplaced magical remote control.",
    "Invent a machine that can translate animal thoughts.",
    "Compose a poem about the color of the sky just before a storm.",
    "Design a friendly robot whose only purpose is to tell jokes.",
    "Create a character who lives in a library and can talk to books."
];

export default function CreativeHub({ onBack }) {
  const [creativeType, setCreativeType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [inspirationImage, setInspirationImage] = useState(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [conversation, setConversation] = useState([]);

  // Gamification State
  const [creativityScore, setCreativityScore] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [sessionCreations, setSessionCreations] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState("");

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);

  // Song-specific states
  const [musicGenre, setMusicGenre] = useState("");
  const [videoStyle, setVideoStyle] = useState("");
  const [songMood, setSongMood] = useState("");

  // Music generation and playback states
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState("");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicTitle, setMusicTitle] = useState("");
  const musicPlayerRef = useRef(null);

  // Enhanced song customization states
  const [songTempo, setSongTempo] = useState("medium");
  const [songInstruments, setSongInstruments] = useState([]);
  const [songLength, setSongLength] = useState("short");

  useEffect(() => {
    // Load gamification data from localStorage
    const savedScore = localStorage.getItem('creativityScore');
    const savedAchievementIds = localStorage.getItem('achievements');

    if (savedScore) setCreativityScore(parseInt(savedScore, 10));
    if (savedAchievementIds) {
      const unlockedAchievements = JSON.parse(savedAchievementIds)
        .map(id => allAchievements.find(ach => ach.id === id))
        .filter(Boolean);
      setAchievements(unlockedAchievements);
    }

    // Set daily challenge
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyChallenge(dailyChallenges[dayOfYear % dailyChallenges.length]);
  }, []);

  const updateGamification = (creativeType, usedImage, usedAudio) => {
    // Update score
    const newScore = creativityScore + 10;
    setCreativityScore(newScore);
    localStorage.setItem('creativityScore', newScore.toString());

    // Update achievements
    let currentAchievementIds = achievements.map(a => a.id);
    const addAchievement = (achievementId) => {
        if (!currentAchievementIds.includes(achievementId)) {
            const achievement = allAchievements.find(a => a.id === achievementId);
            if (achievement) {
                currentAchievementIds.push(achievementId);
            }
        }
    };
    
    // Type-specific achievements
    if (creativeType === 'poem') addAchievement('novice_poet');
    else if (creativeType === 'story') addAchievement('story_starter');
    else if (creativeType === 'art_idea') addAchievement('artful_idea');
    else if (creativeType === 'song') addAchievement('lyricist');
    else if (creativeType === 'character') addAchievement('world_builder');
    else if (creativeType === 'invention') addAchievement('innovator');

    // General inspiration achievements
    if (usedImage) addAchievement('visual_thinker');
    if (usedAudio) addAchievement('sound_weaver');

    // Session-based achievements
    const newSessionCreations = sessionCreations + 1;
    setSessionCreations(newSessionCreations);
    if (newSessionCreations >= 3) {
        addAchievement('creative_spree');
    }

    const updatedAchievements = currentAchievementIds
      .map(id => allAchievements.find(ach => ach.id === id))
      .filter(Boolean);
    setAchievements(updatedAchievements);
    localStorage.setItem('achievements', JSON.stringify(currentAchievementIds));
  };


  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await UploadFile({ file });
      setInspirationImage(result.file_url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  };

  const generateMusic = async () => {
    if (!generatedContent || !musicGenre) {
      alert("Please generate song lyrics first and select a music genre!");
      return;
    }

    setIsGeneratingMusic(true);
    try {
      // Create a detailed music generation prompt
      const musicPrompt = `Create a ${songLength} ${musicGenre} song with ${songTempo} tempo. 
        Instruments: ${songInstruments.join(', ') || 'mixed arrangement'}.
        Mood: ${songMood || 'uplifting'}.
        
        Lyrics preview: ${generatedContent.substring(0, 200)}...
        
        Generate audio that matches these lyrics with appropriate melody, harmony, and rhythm.
        Make it suitable for all ages and emotionally engaging.`;

      // Note: In a real implementation, you'd use a music generation API
      // For now, we'll create a placeholder music experience
      const musicResponse = await InvokeLLM({
        prompt: `Based on these song details: ${musicPrompt}
        
        Create a detailed description of how this song would sound, including:
        - Main melody characteristics
        - Rhythm and beat pattern
        - Instrumental arrangement
        - Emotional progression
        - Key musical moments
        
        Make it vivid and specific so someone could imagine hearing it.`
      });

      // Simulate music generation (in a real app, this would be actual audio)
      setGeneratedMusicUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"); // Placeholder
      setMusicTitle(`${userInput.substring(0, 30)}... (${musicGenre.toUpperCase()})`);
      
      // Store music description for the user
      setConversation(prev => [...prev, {
        role: "assistant",
        content: `🎵 Music Generated! ${musicResponse}`,
        type: "music_description"
      }]);

    } catch (error) {
      console.error("Error generating music:", error);
      alert("Sorry, I couldn't generate music right now. Please try again!");
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const playMusic = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  const pauseMusic = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  const handleMusicEnded = () => {
    setIsPlayingMusic(false);
  };

  const downloadMusic = () => {
    if (generatedMusicUrl) {
      const a = document.createElement('a');
      a.href = generatedMusicUrl;
      a.download = `${musicTitle}.wav`;
      a.click();
    }
  };

  const generateCreativeContent = async () => {
    if (!creativeType || !userInput.trim()) return;

    setIsGenerating(true);
    const selectedType = creativeTypes.find(t => t.value === creativeType);

    try {
      let prompt = `You are a creative AI assistant helping someone create a ${selectedType.label.toLowerCase()}. 
        
Here's what they want to create: "${userInput}"

${inspirationImage ? "They've also shared an image for inspiration. Use the visual elements you see to enhance the creative work." : ""}
${audioBlob ? "They've also recorded audio inspiration. Consider this adds personal emotion and context to their request." : ""}`;

      // Enhanced prompts for songs
      if (creativeType === "song") {
        prompt += `

This is a song creation request with these preferences:
- Genre: ${musicGenre || "flexible"}
- Tempo: ${songTempo || "medium"}
- Mood: ${songMood || "uplifting"}
- Length: ${songLength || "short"}
- Instruments: ${songInstruments.join(', ') || "mixed"}
- Video Style: ${videoStyle || "artistic"}

Please create engaging song lyrics that fit the genre and mood. Include:
- Verse 1
- Chorus
- Verse 2  
- Chorus
- Bridge
- Final Chorus

Make it meaningful, catchy, and appropriate for all ages.`;
      }

      prompt += `

Please create an engaging, creative, and original ${selectedType.label.toLowerCase()} based on their input. Make it:
- Appropriate for all ages
- Inspiring and positive
- Creative and unique
- About 150-300 words

Be encouraging and mention what inspired you about their idea.`;

      const response = await InvokeLLM({
        prompt,
        file_urls: inspirationImage ? [inspirationImage] : undefined
      });

      setGeneratedContent(response);
      setConversation(prev => [...prev, 
        { role: "user", content: userInput, type: creativeType },
        { role: "assistant", content: response }
      ]);
      
      updateGamification(creativeType, !!inspirationImage, !!audioBlob);

      // Generate visuals based on type
      if (creativeType === "art_idea") {
        try {
          const imagePrompt = `Create a beautiful, inspiring artwork based on this concept: ${userInput.substring(0, 100)}. Style: whimsical, colorful, family-friendly, artistic`;
          const imageResult = await GenerateImage({ prompt: imagePrompt });
          setGeneratedImage(imageResult.url);
        } catch (error) {
          console.log("Could not generate image:", error);
        }
      }

      // Generate music video concept for songs
      if (creativeType === "song") {
        try {
          const videoPrompt = `Create a music video scene for a ${musicGenre || 'pop'} song with ${videoStyle || 'artistic'} style. 
            Theme: ${userInput.substring(0, 80)}. 
            Tempo: ${songTempo}. Instruments: ${songInstruments.join(', ') || 'mixed'}.
            Make it visually stunning, ${songMood || 'uplifting'}, and suitable for all audiences. 
            Style: cinematic, colorful, engaging`;
          const videoResult = await GenerateImage({ prompt: videoPrompt });
          setGeneratedVideo(videoResult.url);
        } catch (error) {
          console.log("Could not generate video concept:", error);
        }
      }

    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent("I'm having trouble being creative right now. Please try again in a moment!");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const startNew = () => {
    setCreativeType("");
    setUserInput("");
    setInspirationImage(null);
    setGeneratedContent("");
    setGeneratedImage("");
    setGeneratedVideo("");
    setAudioBlob(null);
    setAudioUrl(null);
    setMusicGenre("");
    setVideoStyle("");
    setSongMood("");
    // Reset music generation states
    setIsGeneratingMusic(false);
    setGeneratedMusicUrl("");
    setIsPlayingMusic(false);
    setMusicTitle("");
    setSongTempo("medium");
    setSongInstruments([]);
    setSongLength("short");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600">
          <ChevronLeft className="w-5 h-5" />
          Back to Games
        </Button>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Creative Hub</h2>
            <p className="text-gray-600">Unleash your creativity with AI!</p>
        </div>
        <div className="flex items-center gap-4 p-2 px-4 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300">
            <Award className="w-6 h-6 text-amber-600" />
            <span className="text-xl font-bold text-amber-700">{creativityScore}</span>
            <span className="text-sm text-amber-600">Points</span>
        </div>
      </div>
      
      {/* Daily Challenge & Achievements */}
       <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Lightbulb className="w-5 h-5" />
                        Today's Creative Challenge
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 italic">"{dailyChallenge}"</p>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => setUserInput(dailyChallenge)}>
                        Try this challenge
                    </Button>
                </CardFooter>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                        <Award className="w-5 h-5" />
                        Your Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {achievements.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {achievements.map(ach => (
                                <Badge key={ach.id} className="bg-green-100 text-green-800 border-green-200 py-1 px-3">
                                    <ach.icon className="w-3 h-3 mr-1.5" />
                                    {ach.label}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Create something to unlock your first achievement!</p>
                    )}
                </CardContent>
            </Card>
       </div>


      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              What would you like to create?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="creative-type">Creative Type</Label>
              <Select value={creativeType} onValueChange={setCreativeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose what to create..." />
                </SelectTrigger>
                <SelectContent>
                  {creativeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {creativeType && (
                <p className="text-sm text-gray-500 mt-1">
                  {creativeTypes.find(t => t.value === creativeType)?.description}
                </p>
              )}
            </div>

            {/* Enhanced Song-specific options */}
            {creativeType === "song" && (
              <div className="grid grid-cols-1 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Song & Music Customization
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Music Genre</Label>
                    <Select value={musicGenre} onValueChange={setMusicGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose genre..." />
                      </SelectTrigger>
                      <SelectContent>
                        {musicGenres.map((genre) => (
                          <SelectItem key={genre.value} value={genre.value}>
                            {genre.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tempo</Label>
                    <Select value={songTempo} onValueChange={setSongTempo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose tempo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow & Relaxed</SelectItem>
                        <SelectItem value="medium">Medium Pace</SelectItem>
                        <SelectItem value="fast">Fast & Energetic</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Song Mood</Label>
                  <Input
                    value={songMood}
                    onChange={(e) => setSongMood(e.target.value)}
                    placeholder="e.g., uplifting, romantic, energetic, peaceful, nostalgic..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Song Length</Label>
                    <Select value={songLength} onValueChange={setSongLength}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose length..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (2-3 min)</SelectItem>
                        <SelectItem value="medium">Medium (3-4 min)</SelectItem>
                        <SelectItem value="long">Long (4-5 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Primary Instruments</Label>
                    <Input
                      value={songInstruments.join(', ')}
                      onChange={(e) => setSongInstruments(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="guitar, piano, drums, violin..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Music Video Style</Label>
                  <Select value={videoStyle} onValueChange={setVideoStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose video style..." />
                    </SelectTrigger>
                    <SelectContent>
                      {musicVideoStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="user-input">Describe your idea</Label>
              <Textarea
                id="user-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tell me about your creative vision... For example: 'A story about a magical garden where flowers sing' or 'A love song about finding hope in difficult times'"
                className="h-24"
              />
            </div>

            {/* Audio Recording Section */}
            <div className="space-y-2">
              <Label>Audio Inspiration (Optional)</Label>
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <Button
                    variant="outline"
                    onClick={startRecording}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Record Audio Inspiration
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={stopRecording}
                    className="flex-1"
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {audioUrl && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Audio recorded!</span>
                  </div>
                  <div className="flex gap-2">
                    {!isPlayingAudio ? (
                      <Button size="sm" variant="outline" onClick={playAudio}>
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={pauseAudio}>
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}>
                      Remove
                    </Button>
                  </div>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <div>
              <Label>Visual Inspiration (Optional)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload').click()}
                  disabled={isUploadingImage}
                  className="flex-1"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploadingImage ? "Uploading..." : "Upload Image"}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {inspirationImage && (
                <div className="mt-2">
                  <img 
                    src={inspirationImage} 
                    alt="Inspiration" 
                    className="w-full h-32 object-cover rounded-lg border-2 border-purple-200"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspirationImage(null)}
                    className="mt-1"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={generateCreativeContent}
              disabled={!creativeType || !userInput.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create with AI (10 Points)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Your Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {generatedContent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                      {generatedContent}
                    </pre>
                  </div>

                  {/* Music Generation and Player for Songs */}
                  {creativeType === "song" && (
                    <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        Your Song
                      </h4>
                      
                      {!generatedMusicUrl ? (
                        <Button 
                          onClick={generateMusic}
                          disabled={isGeneratingMusic || !generatedContent || !musicGenre}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        >
                          {isGeneratingMusic ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Composing music...
                            </>
                          ) : (
                            <>
                              <Music className="w-4 h-4 mr-2" />
                              Generate Music
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200">
                            <div>
                              <h5 className="font-medium text-gray-800">{musicTitle}</h5>
                              <p className="text-sm text-gray-500">{musicGenre} • {songTempo} tempo • {songLength}</p>
                            </div>
                            <div className="flex gap-2">
                              {!isPlayingMusic ? (
                                <Button size="sm" onClick={playMusic}>
                                  <Play className="w-4 h-4 mr-1" />
                                  Play
                                </Button>
                              ) : (
                                <Button size="sm" onClick={pauseMusic}>
                                  <Pause className="w-4 h-4 mr-1" />
                                  Pause
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={downloadMusic}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <audio
                            ref={musicPlayerRef}
                            src={generatedMusicUrl}
                            onEnded={handleMusicEnded}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {generatedImage && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Generated Artwork:</h4>
                      <img 
                        src={generatedImage} 
                        alt="Generated artwork" 
                        className="w-full rounded-lg border-2 border-purple-200"
                      />
                    </div>
                  )}

                  {generatedVideo && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Music Video Concept:
                      </h4>
                      <img 
                        src={generatedVideo} 
                        alt="Music video concept" 
                        className="w-full rounded-lg border-2 border-blue-200"
                      />
                      <p className="text-sm text-gray-600 italic">
                        This visual represents the concept for your music video in {videoStyle || 'artistic'} style
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generatedContent)}
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      variant="outline"
                      onClick={startNew}
                      size="sm"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Another
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Your creative masterpiece will appear here!</p>
                  <p className="text-sm mt-2">Choose a type and describe your idea to get started.</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Creative Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-50 border-l-4 border-blue-400' 
                    : 'bg-green-50 border-l-4 border-green-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === 'user' ? (
                    <>
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">You</span>
                      </div>
                      {message.type && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {creativeTypes.find(t => t.value === message.type)?.label}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      {message.type === "music_description" ? (
                        <Music className="w-3 h-3 text-white" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
