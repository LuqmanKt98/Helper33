
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Import Alert and AlertDescription
import {
  Sparkles,
  Coffee,
  Wind,
  RefreshCw,
  CheckCircle,
  Battery,
  Heart,
  Lightbulb,
  Shield,
  Volume2,
  Play,
  Loader2,
  Waves,
  Moon,
  Sun,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const colorClasses = {
  purple: 'bg-purple-100 border-purple-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  pink: 'bg-pink-100 border-pink-300',
  amber: 'bg-amber-100 border-amber-300',
  rose: 'bg-rose-100 border-rose-300',
  default: 'bg-gray-100 border-gray-300'
};

export default function PlanSuggestion({
  suggestion,
  onAccept,
  onDecline,
  onPlayAudio,
  audioPlaying,
  selectedSuggestions,
  setSelectedSuggestions
}) {
  const [showSelectionMode, setShowSelectionMode] = useState(false);

  const energyIcons = {
    low: Battery,
    medium: Lightbulb,
    high: Sparkles
  };

  const energyColors = {
    low: 'bg-indigo-100 text-indigo-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-emerald-100 text-emerald-800'
  };

  // Safe audio play handler with better error messaging
  const handlePlayAudio = (script, title) => {
    if (!script || !script.trim()) {
      toast.info('Audio script not available for this section');
      return;
    }

    if (onPlayAudio) {
      onPlayAudio(script, title);
    } else {
      toast.info('Audio playback is not available right now');
    }
  };

  // Toggle ritual selection
  const toggleRitual = (index) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      rituals: prev.rituals.includes(index)
        ? prev.rituals.filter(i => i !== index)
        : [...prev.rituals, index]
    }));
  };

  // Toggle block selection
  const toggleBlock = (index) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      blocks: prev.blocks.includes(index)
        ? prev.blocks.filter(i => i !== index)
        : [...prev.blocks, index]
    }));
  };

  const selectedCount =
    selectedSuggestions.rituals.length +
    selectedSuggestions.blocks.length +
    (selectedSuggestions.wellness ? 1 : 0) +
    (selectedSuggestions.emergency ? 1 : 0);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#2E2E2E] mb-2">
          Your Gentle Flow Plan is Ready!
        </h2>
        <p className="text-gray-600 mb-4">
          A compassionate, flexible plan designed just for you — with audio guidance
        </p>

        {/* Audio Notice */}
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm text-blue-800 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Click the speaker icons to hear audio guides. If unavailable, your browser's text-to-speech will be used automatically.
          </AlertDescription>
        </Alert>

        {/* Selection Mode Toggle */}
        <Button
          onClick={() => setShowSelectionMode(!showSelectionMode)}
          variant="outline"
          className="gap-2"
        >
          {showSelectionMode ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Done Selecting ({selectedCount} selected)
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Customize Selections
            </>
          )}
        </Button>
      </motion.div>

      {/* Welcome Message with Audio */}
      {suggestion.warm_welcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-800 leading-relaxed mb-3">
                    {suggestion.warm_welcome}
                  </p>
                  {suggestion.energy_check_audio_script && (
                    <Button
                      onClick={() => handlePlayAudio(suggestion.energy_check_audio_script, 'Welcome Message')}
                      disabled={audioPlaying !== null}
                      size="sm"
                      variant="outline"
                      className="gap-2 bg-white/50"
                    >
                      {audioPlaying === 'Welcome Message' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Listen to Welcome
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Wellness Integration */}
      {suggestion.wellness_integration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Card className={`bg-gradient-to-r from-teal-50 to-green-50 border-0 shadow-lg ${showSelectionMode ? 'ring-2 ring-offset-2' : ''} ${selectedSuggestions.wellness ? 'ring-[#7AAE9E]' : 'ring-gray-300'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Waves className="w-5 h-5 text-teal-600" />
                  Wellness Support for Today
                </CardTitle>
                {showSelectionMode && (
                  <Checkbox
                    checked={selectedSuggestions.wellness}
                    onCheckedChange={(checked) => setSelectedSuggestions(prev => ({ ...prev, wellness: checked }))}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-sm text-gray-700">Breathing</span>
                </div>
                <p className="text-sm text-gray-600">{suggestion.wellness_integration.breathing_exercise}</p>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold text-sm text-gray-700">Movement</span>
                </div>
                <p className="text-sm text-gray-600">{suggestion.wellness_integration.movement_suggestion}</p>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-sm text-gray-700">Hydration</span>
                </div>
                <p className="text-sm text-gray-600">{suggestion.wellness_integration.hydration_reminder}</p>
              </div>
              <div className="p-3 bg-white/70 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-sm text-gray-700">Rest Permission</span>
                </div>
                <p className="text-sm text-gray-600 italic">{suggestion.wellness_integration.rest_permission}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Micro Rituals with Audio and Selection */}
      {suggestion.micro_rituals && suggestion.micro_rituals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#7AAE9E]" />
                Micro-Rituals (2-5 min each)
                {showSelectionMode && (
                  <Badge variant="outline" className="ml-auto">
                    {selectedSuggestions.rituals.length}/{suggestion.micro_rituals.length} selected
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">Tiny grounding practices with audio guides</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestion.micro_rituals.map((ritual, index) => {
                const isSelected = selectedSuggestions.rituals.includes(index);
                const colorClass = colorClasses[ritual.color_tag || 'default'];

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${colorClass} ${showSelectionMode ? (isSelected ? 'ring-2 ring-[#7AAE9E]' : 'opacity-60') : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {showSelectionMode && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRitual(index)}
                            />
                          )}
                          <h4 className="font-semibold text-gray-800">{ritual.title}</h4>
                        </div>
                        <Badge variant="outline" className="text-xs mb-2">
                          ~{Math.floor(ritual.duration_seconds / 60)} min
                        </Badge>
                      </div>
                      {ritual.audio_script && (
                        <Button
                          onClick={() => handlePlayAudio(ritual.audio_script, ritual.title)}
                          disabled={audioPlaying !== null}
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                        >
                          {audioPlaying === ritual.title ? (
                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          ) : (
                            <Play className="w-4 h-4 text-purple-600" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ritual.description}</p>
                    {ritual.benefit && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        ✨ {ritual.benefit}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Flow Blocks with Audio Guides and Selection */}
      {suggestion.flow_blocks && suggestion.flow_blocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wind className="w-5 h-5 text-[#7AAE9E]" />
                Flow Blocks
                {showSelectionMode && (
                  <Badge variant="outline" className="ml-auto">
                    {selectedSuggestions.blocks.length}/{suggestion.flow_blocks.length} selected
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">Flexible time blocks with audio guidance</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestion.flow_blocks.map((block, index) => {
                const EnergyIcon = energyIcons[block.energy_needed] || Lightbulb;
                const isSelected = selectedSuggestions.blocks.includes(index);
                const colorClass = colorClasses[block.color_tag || 'default'];

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${colorClass} ${showSelectionMode ? (isSelected ? 'ring-2 ring-[#7AAE9E]' : 'opacity-60') : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {showSelectionMode && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleBlock(index)}
                            />
                          )}
                          <h4 className="font-semibold text-gray-800">{block.title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {block.duration}
                          </Badge>
                          <Badge className={`text-xs ${energyColors[block.energy_needed]}`}>
                            <EnergyIcon className="w-3 h-3 mr-1" />
                            {block.energy_needed}
                          </Badge>
                          {block.when_to_do && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {block.when_to_do}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {block.audio_guide_script && (
                        <Button
                          onClick={() => handlePlayAudio(block.audio_guide_script, block.title)}
                          disabled={audioPlaying !== null}
                          size="sm"
                          variant="ghost"
                          className="gap-2 ml-2"
                        >
                          {audioPlaying === block.title ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <Play className="w-4 h-4 text-blue-600" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{block.description}</p>
                    {block.micro_steps && block.micro_steps.length > 0 && (
                      <div className="bg-white/70 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Tiny first steps:</p>
                        <ul className="space-y-1">
                          {block.micro_steps.map((step, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-[#7AAE9E] mt-0.5">→</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Emergency Exits with Audio SOS and Selection */}
      {suggestion.emergency_exits && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className={`bg-gradient-to-r from-red-50 to-orange-50 border-0 shadow-lg ${showSelectionMode ? 'ring-2 ring-offset-2' : ''} ${selectedSuggestions.emergency ? 'ring-[#7AAE9E]' : 'ring-gray-300'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Emergency Exits (If You're Overwhelmed)
                </CardTitle>
                {showSelectionMode && (
                  <Checkbox
                    checked={selectedSuggestions.emergency}
                    onCheckedChange={(checked) => setSelectedSuggestions(prev => ({ ...prev, emergency: checked }))}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm font-semibold text-gray-800 mb-1">Quick Calm (1 minute)</p>
                <p className="text-sm text-gray-600">{suggestion.emergency_exits.quick_calm}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm font-semibold text-gray-800 mb-1">Permission to Pause</p>
                <p className="text-sm text-gray-600 italic">{suggestion.emergency_exits.permission_to_stop}</p>
              </div>
              {suggestion.emergency_exits.audio_sos_script && (
                <Button
                  onClick={() => handlePlayAudio(suggestion.emergency_exits.audio_sos_script, 'Emergency Calm')}
                  disabled={audioPlaying !== null}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2"
                >
                  {audioPlaying === 'Emergency Calm' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Playing Calming Audio...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Play Emergency Calm Audio
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Evening Reflection with Audio */}
      {suggestion.evening_reflection_prompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Evening Reflection</p>
                  <p className="text-sm text-gray-700 mb-3">{suggestion.evening_reflection_prompt}</p>
                  {suggestion.audio_reflection_script && (
                    <Button
                      onClick={() => handlePlayAudio(suggestion.audio_reflection_script, 'Evening Reflection')}
                      disabled={audioPlaying !== null}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      {audioPlaying === 'Evening Reflection' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Listen to Reflection Guide
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          onClick={onDecline}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Generate a Different Plan
        </Button>
        <Button
          onClick={onAccept}
          size="lg"
          disabled={selectedCount === 0}
          className="bg-gradient-to-r from-[#7AAE9E] to-[#A6C48A] hover:from-[#7AAE9E]/90 hover:to-[#A6C48A]/90 text-white gap-2 shadow-xl"
        >
          <CheckCircle className="w-5 h-5" />
          {selectedCount > 0 ? `Accept Plan (${selectedCount} items)` : 'Select at least one item'}
        </Button>
      </motion.div>
    </div>
  );
}
