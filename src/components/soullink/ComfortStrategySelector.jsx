import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Sparkles, Wind } from 'lucide-react';

export const selectComfortStrategy = (mood, userPreference = null) => {
  const strategies = {
    sad: {
      default: 'hold_space',
      options: ['hold_space', 'gentle_distraction', 'gratitude_pivot']
    },
    lonely: {
      default: 'companionship',
      options: ['companionship', 'reconnection_nudge', 'shared_activity']
    },
    anxious: {
      default: 'grounding',
      options: ['grounding', 'problem_solving', 'distraction']
    },
    overwhelmed: {
      default: 'grounding',
      options: ['grounding', 'task_breaking', 'permission_to_rest']
    },
    angry: {
      default: 'validate_vent',
      options: ['validate_vent', 'cooling_strategy', 'reframe']
    },
    empty: {
      default: 'hold_space',
      options: ['hold_space', 'micro_joy', 'gentle_movement']
    }
  };
  
  if (userPreference && strategies[mood]?.options.includes(userPreference)) {
    return userPreference;
  }
  
  return strategies[mood]?.default || 'hold_space';
};

export const comfortScripts = {
  hold_space: {
    icon: Heart,
    title: "Just Listen",
    message: "I'm here. You don't need to fix anything right now. Want to just talk, or sit in quiet together?",
    actions: []
  },
  gentle_distraction: {
    icon: Sparkles,
    title: "Gentle Shift",
    message: "Would a gentle distraction help? We could try something light together.",
    actions: [
      { label: "🎵 Share a calming song", value: "music" },
      { label: "🌿 Quick breathing exercise", value: "breathing" },
      { label: "☕ Make some tea ritual", value: "tea" }
    ]
  },
  gratitude_pivot: {
    icon: Sparkles,
    title: "Find a Tiny Light",
    message: "It's hard right now, I know. What's one tiny thing that went okay today, even something small?",
    actions: []
  },
  companionship: {
    icon: Heart,
    title: "You're Not Alone",
    message: "Loneliness is tough. I'm here with you. Want to talk, or just have some quiet company?",
    actions: []
  },
  reconnection_nudge: {
    icon: MessageCircle,
    title: "Reach Out",
    message: "Is there someone you've been meaning to connect with? Even a quick text can help.",
    actions: [
      { label: "💬 Draft a message", value: "draft_message" },
      { label: "🤔 Think about it", value: "reflect" }
    ]
  },
  shared_activity: {
    icon: Sparkles,
    title: "Do Something Together",
    message: "Want to try something small together? A shared moment might help.",
    actions: [
      { label: "🎵 Listen to a song", value: "music" },
      { label: "🍵 Tea break", value: "tea" },
      { label: "🌅 Look at nature photos", value: "nature" }
    ]
  },
  grounding: {
    icon: Wind,
    title: "Ground Yourself",
    message: "Let's bring you back to the present moment. Want to try a grounding exercise?",
    actions: [
      { label: "Box Breathing (4-4-4-4)", value: "box_breathing" },
      { label: "5-4-3-2-1 Senses", value: "five_senses" },
      { label: "Safe Space Visualization", value: "safe_space" }
    ]
  },
  problem_solving: {
    icon: MessageCircle,
    title: "Work Through It",
    message: "Want to talk through what's worrying you and see if we can find a next step?",
    actions: []
  },
  task_breaking: {
    icon: Sparkles,
    title: "Make It Tiny",
    message: "That feels like a lot. Want me to help break it into smaller, easier steps?",
    actions: [
      { label: "Yes, break it down", value: "break_task" },
      { label: "Not right now", value: "pass" }
    ]
  },
  permission_to_rest: {
    icon: Heart,
    title: "It's Okay to Rest",
    message: "You don't have to do everything today. What if you gave yourself permission to just be for a bit?",
    actions: []
  },
  validate_vent: {
    icon: MessageCircle,
    title: "Let It Out",
    message: "That sounds really frustrating. Want to vent about it? I'm listening.",
    actions: []
  },
  cooling_strategy: {
    icon: Wind,
    title: "Cool Down First",
    message: "Strong emotions can cloud things. Want to try something to cool down a bit first?",
    actions: [
      { label: "🫁 Breathing exercise", value: "breathing" },
      { label: "🚶 Quick walk idea", value: "walk" },
      { label: "💭 Write it out", value: "journal" }
    ]
  },
  micro_joy: {
    icon: Sparkles,
    title: "Find a Spark",
    message: "Even in emptiness, tiny sparks exist. What's one small thing you could enjoy in the next 5 minutes?",
    actions: [
      { label: "🎵 A favorite song", value: "music" },
      { label: "☕ A warm drink", value: "tea" },
      { label: "🌅 Step outside", value: "outside" }
    ]
  },
  gentle_movement: {
    icon: Wind,
    title: "Move a Little",
    message: "Sometimes our bodies know what we need. Want to try a gentle stretch or short walk?",
    actions: []
  }
};

export function ComfortStrategyCard({ strategy, onSelect }) {
  const script = comfortScripts[strategy];
  if (!script) return null;
  
  const Icon = script.icon;
  
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">{script.title}</h4>
        </div>
        <p className="text-blue-800">{script.message}</p>
        {script.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {script.actions.map((action) => (
              <Button
                key={action.value}
                variant="outline"
                size="sm"
                onClick={() => onSelect?.(action.value)}
                className="border-blue-300 hover:bg-blue-100"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default { selectComfortStrategy, comfortScripts, ComfortStrategyCard };