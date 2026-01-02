import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star, Heart, Target, Shield, Sparkles, Flame } from 'lucide-react';

const PERSONALITIES = {
  visionary: {
    label: 'The Visionary',
    emoji: '🌟',
    icon: Star,
    color: 'from-yellow-400 to-orange-500',
    description: 'You dream big and think in possibilities. Your strength is seeing the future before it happens.',
    approach: 'Focus on bold milestones and creative freedom'
  },
  rebuilder: {
    label: 'The Rebuilder',
    emoji: '🏗️',
    icon: Target,
    color: 'from-blue-400 to-cyan-500',
    description: 'You rise from challenges stronger. Your strength is transformation through renewal.',
    approach: 'Build strong foundations with consistent small wins'
  },
  caregiver: {
    label: 'The Caregiver',
    emoji: '💝',
    icon: Heart,
    color: 'from-pink-400 to-rose-500',
    description: 'You lead with love and put others first. Your strength is compassion and connection.',
    approach: 'Balance giving to others while nurturing yourself'
  },
  overwhelmed: {
    label: 'The Overwhelmed',
    emoji: '🌊',
    icon: Shield,
    color: 'from-indigo-400 to-purple-500',
    description: 'You carry a lot. Your strength is showing up despite the weight.',
    approach: 'Micro-steps, deep rest, and radical self-compassion'
  },
  achiever: {
    label: 'The Achiever',
    emoji: '🎯',
    icon: Target,
    color: 'from-green-400 to-emerald-500',
    description: 'You set goals and make them happen. Your strength is discipline and determination.',
    approach: 'Clear metrics, progress tracking, and challenge yourself'
  },
  healer: {
    label: 'The Healer',
    emoji: '🌿',
    icon: Sparkles,
    color: 'from-emerald-400 to-teal-500',
    description: 'You find peace in healing—yours and others. Your strength is gentleness and wisdom.',
    approach: 'Mind-body connection, rituals, and intuitive growth'
  },
  quiet_fighter: {
    label: 'The Quiet Fighter',
    emoji: '🔥',
    icon: Flame,
    color: 'from-orange-400 to-red-500',
    description: 'You push through silently. Your strength is resilience and quiet determination.',
    approach: 'Acknowledge your battles, celebrate small victories'
  }
};

export default function PersonalityBadge({ personalityType, showFull = false }) {
  const personality = PERSONALITIES[personalityType] || PERSONALITIES.achiever;
  const Icon = personality.icon;

  if (!showFull) {
    return (
      <Badge className={`bg-gradient-to-r ${personality.color} text-white px-4 py-1.5 text-sm`}>
        {personality.emoji} {personality.label}
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={`bg-gradient-to-br ${personality.color} border-none shadow-2xl text-white overflow-hidden relative`}>
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <div className="w-full h-full bg-white/10 rounded-full blur-3xl" />
        </motion.div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-4xl">{personality.emoji}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">{personality.label}</h3>
              <p className="text-white/90 text-sm">Your 2026 Personality Type</p>
            </div>
          </div>
          
          <p className="text-white/95 mb-4 leading-relaxed">{personality.description}</p>
          
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              Your 2026 Approach:
            </p>
            <p className="text-white/90 text-sm">{personality.approach}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}