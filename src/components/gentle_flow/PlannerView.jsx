
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wind,
  Sun,
  Moon,
  Zap,
  Heart,
  Target,
  Users,
  Sparkles,
  CheckCircle,
  Coffee,
  RefreshCw,
  Clock,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  Volume2, // Added Volume2 import
  Play // Added Play import
} from 'lucide-react';
import { toast } from 'sonner';
import TodoList from './TodoList';
import Notes from './Notes';

const energyLevels = {
  low: { icon: Moon, label: 'Low Energy', color: 'bg-indigo-100 text-indigo-800', gradient: 'from-indigo-400 to-purple-500' },
  medium: { icon: Sun, label: 'Medium Energy', color: 'bg-amber-100 text-amber-800', gradient: 'from-amber-400 to-orange-500' },
  high: { icon: Zap, label: 'High Energy', color: 'bg-emerald-100 text-emerald-800', gradient: 'from-emerald-400 to-teal-500' }
};

const priorityLenses = [
  { id: 'wellness', label: 'Wellness', icon: Heart, color: 'from-rose-400 to-pink-500' },
  { id: 'productivity', label: 'Productivity', icon: Target, color: 'from-blue-400 to-cyan-500' },
  { id: 'connection', label: 'Connection', icon: Users, color: 'from-purple-400 to-indigo-500' },
  { id: 'creativity', label: 'Creativity', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
  { id: 'rest', label: 'Rest', icon: Moon, color: 'from-indigo-400 to-violet-500' }
];

// Define colorClasses for micro-rituals
const colorClasses = {
  default: 'bg-white border-gray-200 hover:border-[#7AAE9E]',
  wellness: 'bg-rose-50 border-rose-200 hover:border-rose-300',
  productivity: 'bg-blue-50 border-blue-200 hover:border-blue-300',
  connection: 'bg-purple-50 border-purple-200 hover:border-purple-300',
  creativity: 'bg-amber-50 border-amber-200 hover:border-amber-300',
  rest: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
};


export default function PlannerView({ user, settings, onRegeneratePlan, isGenerating, todayWellness, onPlayAudio, audioPlaying, onSavePlan }) {
  const queryClient = useQueryClient();
  
  const [selectedEnergy, setSelectedEnergy] = useState(settings.energy || 'medium');
  const [selectedPriorities, setSelectedPriorities] = useState(settings.priorityLens || ['wellness']);
  const [showMicroRituals, setShowMicroRituals] = useState(true);
  const [showFlowBlocks, setShowFlowBlocks] = useState(true);
  const [completedRituals, setCompletedRituals] = useState([]);
  const [completedBlocks, setCompletedBlocks] = useState([]);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [planName, setPlanName] = useState('');

  const currentPlan = settings.currentPlan || {};

  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) => base44.auth.updateMe({
      gentle_flow_settings: {
        ...settings,
        ...newSettings
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Handle energy change
  const handleEnergyChange = (energy) => {
    setSelectedEnergy(energy);
    updateSettingsMutation.mutate({ energy });
    toast.success(`Energy level set to ${energyLevels[energy].label}`);
  };

  // Handle priority toggle
  const handlePriorityToggle = (priorityId) => {
    let newPriorities;
    if (selectedPriorities.includes(priorityId)) {
      newPriorities = selectedPriorities.filter(p => p !== priorityId);
    } else {
      newPriorities = [...selectedPriorities, priorityId];
    }
    setSelectedPriorities(newPriorities);
    updateSettingsMutation.mutate({ priorityLens: newPriorities });
  };

  // Toggle ritual completion
  const toggleRitualCompletion = (index) => {
    if (completedRituals.includes(index)) {
      setCompletedRituals(completedRituals.filter(i => i !== index));
    } else {
      setCompletedRituals([...completedRituals, index]);
      toast.success('🌟 Micro-ritual completed!');
    }
  };

  // Toggle block completion
  const toggleBlockCompletion = (index) => {
    if (completedBlocks.includes(index)) {
      setCompletedBlocks(completedBlocks.filter(i => i !== index));
    } else {
      setCompletedBlocks([...completedBlocks, index]);
      toast.success('✨ Flow block completed!');
    }
  };

  const handleSaveAsFavorite = () => {
    if (!planName.trim()) {
      toast.error('Please enter a name for this plan');
      return;
    }
    
    onSavePlan(planName);
    setShowSaveModal(false);
    setPlanName('');
  };

  // Safe audio play handler
  const handlePlayAudio = (script, title) => {
    if (!script || !script.trim()) {
      toast.info('Audio script not available');
      return;
    }
    
    if (onPlayAudio) {
      onPlayAudio(script, title);
    } else {
      // Fallback to browser's SpeechSynthesis API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.onend = () => {
          // You might want to signal that playback finished here if you manage a local audioPlaying state
        };
        utterance.onerror = (event) => {
          console.error('SpeechSynthesisUtterance.onerror', event);
          toast.error('Browser speech failed: ' + event.error);
        };
        window.speechSynthesis.speak(utterance);
        toast.info('Playing audio via browser speech synthesis.');
      } else {
        toast.info('Audio playback not available (no browser speech synthesis).');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Welcome Message & Energy Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Motivational Note with Audio */}
        {currentPlan.motivational_note && (
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-800 leading-relaxed mb-3">
                    {currentPlan.motivational_note}
                  </p>
                  {currentPlan.energy_check_audio_script && (
                    <Button
                      onClick={() => handlePlayAudio(currentPlan.energy_check_audio_script, 'Motivational Note')}
                      disabled={audioPlaying !== null && audioPlaying !== 'Motivational Note'} // Disable if any other audio is playing
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      {audioPlaying === 'Motivational Note' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Listen
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Energy & Priority Selectors */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Energy Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Energy Level</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(energyLevels).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = selectedEnergy === key;
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEnergyChange(key)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#7AAE9E] bg-[#7AAE9E]/10 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-[#7AAE9E]' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${isSelected ? 'text-[#7AAE9E]' : 'text-gray-600'}`}>
                        {config.label}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Priority Lenses */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Today's Focus
                <span className="text-xs text-gray-500 ml-2">(Select one or more)</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {priorityLenses.map((priority) => {
                  const Icon = priority.icon;
                  const isSelected = selectedPriorities.includes(priority.id);
                  return (
                    <motion.button
                      key={priority.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePriorityToggle(priority.id)}
                      className={`p-3 rounded-lg transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br ' + priority.color + ' text-white shadow-lg'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs font-medium">{priority.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Plan Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Button
          onClick={() => setShowSaveModal(true)}
          variant="outline"
          className="bg-white/60 backdrop-blur-sm hover:bg-white gap-2"
        >
          <Heart className="w-4 h-4" />
          Save This Plan as Favorite
        </Button>
      </motion.div>

      {/* Micro-Rituals Section with Audio */}
      {currentPlan.micro_rituals && currentPlan.micro_rituals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="cursor-pointer" onClick={() => setShowMicroRituals(!showMicroRituals)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-[#7AAE9E]" />
                  Micro-Rituals
                  <Badge variant="outline" className="ml-2">{completedRituals.length}/{currentPlan.micro_rituals.length}</Badge>
                </CardTitle>
                {showMicroRituals ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
              <p className="text-sm text-gray-600">Quick 2-5 minute grounding practices</p>
            </CardHeader>
            <AnimatePresence>
              {showMicroRituals && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-3">
                    {currentPlan.micro_rituals.map((ritual, index) => {
                      const isCompleted = completedRituals.includes(index);
                      const baseColorClass = colorClasses[ritual.color_tag] || colorClasses.default;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isCompleted
                              ? 'bg-emerald-50 border-emerald-300'
                              : baseColorClass
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleRitualCompletion(index)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : 'border-gray-300 hover:border-[#7AAE9E]'
                              }`}
                            >
                              {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                            <div className="flex-1">
                              <h4 className={`font-semibold mb-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {ritual.title}
                              </h4>
                              <p className={`text-sm mb-2 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                {ritual.description}
                              </p>
                              {ritual.audio_script && (
                                <Button
                                  onClick={() => handlePlayAudio(ritual.audio_script, ritual.title)}
                                  disabled={audioPlaying !== null && audioPlaying !== ritual.title} // Disable if any other audio is playing
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                >
                                  {audioPlaying === ritual.title ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Playing...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4" />
                                      Listen
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}

      {/* Flow Blocks Section */}
      {currentPlan.flow_blocks && currentPlan.flow_blocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="cursor-pointer" onClick={() => setShowFlowBlocks(!showFlowBlocks)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wind className="w-5 h-5 text-[#7AAE9E]" />
                  Flow Blocks
                  <Badge variant="outline" className="ml-2">{completedBlocks.length}/{currentPlan.flow_blocks.length}</Badge>
                </CardTitle>
                {showFlowBlocks ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
              <p className="text-sm text-gray-600">Flexible time blocks for your day</p>
            </CardHeader>
            <AnimatePresence>
              {showFlowBlocks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-3">
                    {currentPlan.flow_blocks.map((block, index) => {
                      const isCompleted = completedBlocks.includes(index);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-200 hover:border-[#7AAE9E]'
                          }`}
                          onClick={() => toggleBlockCompletion(index)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isCompleted
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                  {block.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {block.duration}
                                </Badge>
                              </div>
                              <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                {block.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions & Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodoList settings={settings} />
        <Notes settings={settings} />
      </div>

      {/* Regenerate Plan Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Button
          onClick={onRegeneratePlan}
          disabled={isGenerating}
          variant="outline"
          className="bg-white/60 backdrop-blur-sm hover:bg-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Plan
            </>
          )}
        </Button>
      </motion.div>

      {/* Helper Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>Tip:</strong> This planner adapts to your energy and priorities. Update them anytime to refresh your suggestions!
        </AlertDescription>
      </Alert>

      {/* Save Plan Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-[#2E2E2E] mb-4">Save Plan as Favorite</h3>
              <p className="text-sm text-gray-600 mb-4">
                Give this plan a name so you can quickly load it later
              </p>
              <Input
                placeholder="e.g., 'Morning Routine' or 'Low Energy Days'"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveAsFavorite()}
                className="mb-4"
              />
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => {
                    setShowSaveModal(false);
                    setPlanName('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAsFavorite}
                  disabled={!planName.trim()}
                  className="bg-[#7AAE9E] hover:bg-[#7AAE9E]/90"
                >
                  Save Plan
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
