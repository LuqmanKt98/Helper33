import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, Moon, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DailyMotivation({ goals, checkIn, timeOfDay = 'morning' }) {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateMessage = async (regenerate = false) => {
    if (!regenerate && checkIn?.[`${timeOfDay}_message`]) {
      setMessage(checkIn[`${timeOfDay}_message`]);
      return;
    }

    setIsLoading(true);
    try {
      const dayNumber = checkIn?.day_number || Math.ceil((new Date() - new Date('2026-01-01')) / (1000 * 60 * 60 * 24)) + 1;
      const currentStreak = goals.reduce((max, g) => Math.max(max, g.current_streak || 0), 0);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a ${timeOfDay === 'morning' ? 'motivational morning' : 'reflective evening'} message for 2026 transformation journey.

DAY: ${dayNumber} of 366
CURRENT STREAK: ${currentStreak} days
ACTIVE GOALS: ${goals.map(g => g.goal_title).join(', ')}
RECENT MOOD: ${checkIn?.mood_rating || 7}/10
ENERGY LEVEL: ${checkIn?.energy_level || 7}/10

${timeOfDay === 'morning' ? 
  `Create an uplifting, actionable morning message that:
  - Acknowledges their progress
  - Gives today specific meaning
  - Provides micro-action focus
  - Inspires without overwhelming
  - References their specific goals
  - 2-3 sentences max` 
  : 
  `Create a gentle, reflective evening message that:
  - Celebrates today's efforts
  - Prompts reflection
  - Prepares mindset for tomorrow
  - Acknowledges challenges with compassion
  - 2-3 sentences max`
}

Make it personal, warm, and science-backed.`,
      });

      setMessage(response);
      
      if (checkIn) {
        await base44.entities.Year2026DailyCheckIn.update(checkIn.id, {
          [`${timeOfDay}_message`]: response
        });
      }
      
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Failed to generate message');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateMessage();
  }, []);

  const speakMessage = () => {
    if (!message) return;
    
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const Icon = timeOfDay === 'morning' ? Sun : Moon;
  const gradient = timeOfDay === 'morning' ? 'from-yellow-400 to-orange-500' : 'from-indigo-500 to-purple-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={`bg-gradient-to-br ${gradient} border-none shadow-2xl text-white overflow-hidden relative`}>
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex-shrink-0"
            >
              <Icon className="w-12 h-12" />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg">
                  {timeOfDay === 'morning' ? '☀️ Good Morning!' : '🌙 Evening Reflection'}
                </h3>
                <Badge className="bg-white/20 text-white border-white/30">
                  Day {checkIn?.day_number || '?'}
                </Badge>
              </div>
              
              {isLoading ? (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-20 bg-white/20 rounded-lg flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 animate-spin" />
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg leading-relaxed mb-4"
                  >
                    {message || 'Loading your personalized message...'}
                  </motion.p>
                </AnimatePresence>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => generateMessage(true)}
                  disabled={isLoading}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border border-white/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Message
                </Button>
                <Button
                  onClick={speakMessage}
                  disabled={!message || isLoading}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border border-white/30"
                >
                  {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}