import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/base44Client';
import { Wind, Sparkles, Volume2, Download, Heart, Copy, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function MeditationScriptGenerator({ 
  coachType = 'grief_coach', 
  supportCoachId = null,
  userMood = null,
  recentContext = null,
  onSave 
}) {
  const [duration, setDuration] = useState([10]);
  const [focusArea, setFocusArea] = useState('stress_relief');
  const [voiceStyle, setVoiceStyle] = useState('calm');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const focusAreas = {
    grief_coach: [
      { value: 'grief_processing', label: 'Processing Grief & Loss', icon: '💔' },
      { value: 'emotional_healing', label: 'Emotional Healing', icon: '💙' },
      { value: 'letting_go', label: 'Letting Go with Love', icon: '🕊️' },
      { value: 'finding_peace', label: 'Finding Inner Peace', icon: '☮️' },
      { value: 'self_compassion', label: 'Self-Compassion', icon: '🤗' },
      { value: 'gratitude_memories', label: 'Gratitude for Memories', icon: '🌟' }
    ],
    life_coach: [
      { value: 'stress_relief', label: 'Stress Relief', icon: '🌊' },
      { value: 'clarity_focus', label: 'Mental Clarity & Focus', icon: '🎯' },
      { value: 'confidence_building', label: 'Building Confidence', icon: '💪' },
      { value: 'goal_visualization', label: 'Goal Visualization', icon: '✨' },
      { value: 'letting_go_anxiety', label: 'Releasing Anxiety', icon: '🦋' },
      { value: 'gratitude_abundance', label: 'Gratitude & Abundance', icon: '🙏' }
    ]
  };

  const currentFocusAreas = focusAreas[coachType] || focusAreas.life_coach;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedScript('');

    try {
      const selectedFocus = currentFocusAreas.find(f => f.value === focusArea);
      const contextInfo = recentContext ? `\n\nRecent Context: ${recentContext}` : '';
      const moodInfo = userMood ? `\n\nCurrent Mood: ${userMood}` : '';

      const prompt = `You are an expert meditation guide and ${coachType === 'grief_coach' ? 'grief counselor' : 'life coach'}. 
Create a personalized ${duration[0]}-minute guided meditation script focused on: ${selectedFocus?.label}.${moodInfo}${contextInfo}

Requirements:
- Duration: Exactly ${duration[0]} minutes when read at a calm, slow pace
- Tone: ${voiceStyle === 'calm' ? 'Deeply calming and gentle' : voiceStyle === 'soothing' ? 'Warm and soothing' : 'Peaceful and serene'}
- Include: Opening (1 min), body scan/breathing (2-3 min), main meditation (most of the time), gentle closing (1 min)
- Use second person ("you") and present tense
- Include specific breathing cues and pauses [PAUSE 5 SECONDS] where appropriate
- Make it deeply therapeutic and healing
${coachType === 'grief_coach' ? '- Address grief gently, honor the loss, and provide comfort\n- Include gentle reminders that healing is not linear' : '- Focus on empowerment, growth, and positive transformation\n- Include visualization elements for goal achievement'}

Format the script with clear sections:
[OPENING]
[BREATHING & GROUNDING]
[MAIN MEDITATION]
[CLOSING]

Create a beautiful, transformative meditation experience.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      setGeneratedScript(response);
      toast.success('✨ Meditation script created!');
    } catch (error) {
      console.error('Error generating meditation:', error);
      toast.error('Failed to generate meditation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeakScript = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlaying(false);
      return;
    }

    if (!generatedScript) return;

    const scriptWithoutPauses = generatedScript.replace(/\[PAUSE.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(scriptWithoutPauses);
    utterance.rate = 0.75;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const calmVoice = voices.find(voice => 
      voice.name.includes('Samantha') || 
      voice.name.includes('Karen') ||
      (voice.lang.startsWith('en') && voice.name.includes('Female'))
    );
    if (calmVoice) utterance.voice = calmVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    toast.success('Script copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meditation_${focusArea}_${duration[0]}min.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Script downloaded!');
  };

  const handleSaveFavorite = async () => {
    if (!generatedScript) return;

    try {
      await base44.entities.SavedCoachingInteraction.create({
        coach_type: coachType,
        support_coach_id: supportCoachId,
        interaction_type: 'meditation_script',
        title: `${currentFocusAreas.find(f => f.value === focusArea)?.label} - ${duration[0]} min`,
        content: generatedScript,
        context_mood: userMood,
        context_tags: [focusArea, `${duration[0]}_min`, voiceStyle],
        is_favorite: true,
        last_accessed: new Date().toISOString()
      });

      if (onSave) onSave();
      toast.success('💜 Saved to your favorites!');
    } catch (error) {
      console.error('Error saving meditation:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-purple-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Personalized Meditation</h3>
            <p className="text-sm text-gray-600 font-normal">AI-generated guided meditation just for you</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Focus Area
              </label>
              <Select value={focusArea} onValueChange={setFocusArea}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentFocusAreas.map(area => (
                    <SelectItem key={area.value} value={area.value}>
                      <span className="flex items-center gap-2">
                        <span>{area.icon}</span>
                        <span>{area.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Voice Style
              </label>
              <Select value={voiceStyle} onValueChange={setVoiceStyle}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Deeply Calming</SelectItem>
                  <SelectItem value="soothing">Warm & Soothing</SelectItem>
                  <SelectItem value="serene">Peaceful & Serene</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">
                Duration: {duration[0]} minutes
              </label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                min={5}
                max={30}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5 min</span>
                <span>15 min</span>
                <span>30 min</span>
              </div>
            </div>

            {userMood && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Adapting to your mood:</strong> {userMood}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg shadow-xl"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Crafting Your Meditation...
            </>
          ) : (
            <>
              <Wind className="w-5 h-5 mr-2" />
              Generate Meditation Script
            </>
          )}
        </Button>

        {/* Generated Script */}
        <AnimatePresence>
          {generatedScript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-purple-600" />
                  Your Meditation Script
                </h4>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    {duration[0]} minutes
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {currentFocusAreas.find(f => f.value === focusArea)?.icon} {currentFocusAreas.find(f => f.value === focusArea)?.label}
                  </Badge>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                  {generatedScript}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSpeakScript}
                  variant="outline"
                  className="bg-white"
                >
                  {isSpeaking ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen (Text-to-Speech)
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="bg-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                <Button
                  onClick={handleSaveFavorite}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save to Favorites
                </Button>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Pro Tip:</strong> Find a quiet space, use headphones, and allow yourself to fully immerse in this experience. 
                    Pause whenever you need to breathe and be present.
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}