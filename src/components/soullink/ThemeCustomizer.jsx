import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Palette, Check, Sparkles, Heart, Moon, Sun, Leaf, Zap, Star, Cloud } from 'lucide-react';
import { toast } from 'sonner';

const themes = [
  {
    id: 'sunset_dream',
    name: 'Sunset Dream',
    icon: Sun,
    colors: {
      primary: 'from-orange-400 via-pink-500 to-purple-600',
      background: 'from-orange-50 via-pink-50 to-purple-50',
      card: 'from-orange-100 to-pink-100',
      accent: 'bg-gradient-to-r from-orange-500 to-pink-500'
    },
    preview: 'linear-gradient(135deg, #fb923c 0%, #ec4899 50%, #9333ea 100%)'
  },
  {
    id: 'midnight_aurora',
    name: 'Midnight Aurora',
    icon: Moon,
    colors: {
      primary: 'from-indigo-500 via-purple-500 to-pink-500',
      background: 'from-indigo-50 via-purple-50 to-pink-50',
      card: 'from-indigo-100 to-purple-100',
      accent: 'bg-gradient-to-r from-indigo-600 to-purple-600'
    },
    preview: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)'
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Breeze',
    icon: Cloud,
    colors: {
      primary: 'from-cyan-400 via-blue-500 to-indigo-600',
      background: 'from-cyan-50 via-blue-50 to-indigo-50',
      card: 'from-cyan-100 to-blue-100',
      accent: 'bg-gradient-to-r from-cyan-500 to-blue-600'
    },
    preview: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #4f46e5 100%)'
  },
  {
    id: 'forest_whisper',
    name: 'Forest Whisper',
    icon: Leaf,
    colors: {
      primary: 'from-emerald-400 via-teal-500 to-cyan-600',
      background: 'from-emerald-50 via-teal-50 to-cyan-50',
      card: 'from-emerald-100 to-teal-100',
      accent: 'bg-gradient-to-r from-emerald-500 to-teal-600'
    },
    preview: 'linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #0891b2 100%)'
  },
  {
    id: 'rose_garden',
    name: 'Rose Garden',
    icon: Heart,
    colors: {
      primary: 'from-rose-400 via-pink-500 to-fuchsia-600',
      background: 'from-rose-50 via-pink-50 to-fuchsia-50',
      card: 'from-rose-100 to-pink-100',
      accent: 'bg-gradient-to-r from-rose-500 to-pink-600'
    },
    preview: 'linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #c026d3 100%)'
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    icon: Star,
    colors: {
      primary: 'from-amber-400 via-orange-500 to-red-500',
      background: 'from-amber-50 via-orange-50 to-red-50',
      card: 'from-amber-100 to-orange-100',
      accent: 'bg-gradient-to-r from-amber-500 to-orange-600'
    },
    preview: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)'
  },
  {
    id: 'lavender_mist',
    name: 'Lavender Mist',
    icon: Sparkles,
    colors: {
      primary: 'from-purple-300 via-violet-400 to-purple-500',
      background: 'from-purple-50 via-violet-50 to-purple-50',
      card: 'from-purple-100 to-violet-100',
      accent: 'bg-gradient-to-r from-purple-400 to-violet-500'
    },
    preview: 'linear-gradient(135deg, #d8b4fe 0%, #a78bfa 50%, #a855f7 100%)'
  },
  {
    id: 'electric_dreams',
    name: 'Electric Dreams',
    icon: Zap,
    colors: {
      primary: 'from-blue-400 via-cyan-500 to-teal-500',
      background: 'from-blue-50 via-cyan-50 to-teal-50',
      card: 'from-blue-100 to-cyan-100',
      accent: 'bg-gradient-to-r from-blue-500 to-cyan-600'
    },
    preview: 'linear-gradient(135deg, #60a5fa 0%, #06b6d4 50%, #14b8a6 100%)'
  }
];

export default function ThemeCustomizer({ settings, onSettingsUpdate }) {
  const [selectedTheme, setSelectedTheme] = useState(settings?.theme || 'sunset_dream');
  const queryClient = useQueryClient();

  const updateThemeMutation = useMutation({
    mutationFn: async (themeId) => {
      return base44.entities.CompanionSettings.update(settings.id, {
        theme: themeId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companion-settings']);
      toast.success('Theme updated! 🎨');
      if (onSettingsUpdate) onSettingsUpdate();
    }
  });

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    updateThemeMutation.mutate(themeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">Choose Your Vibe</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;

          return (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-4 rounded-2xl border-2 transition-all ${
                isSelected 
                  ? 'border-purple-500 shadow-lg shadow-purple-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Theme Preview */}
              <div 
                className="w-full h-20 rounded-xl mb-3"
                style={{ background: theme.preview }}
              />

              {/* Theme Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {theme.name}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your theme changes the mood and colors of your companion space
      </p>
    </div>
  );
}