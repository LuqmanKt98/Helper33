import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Heart, Briefcase, DollarSign, Users, Home as HomeIcon, Paintbrush } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ConfettiParticle = ({ x, y, angle, distance }) => (
    <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{ 
            x, y,
            background: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#22c55e', '#facc15'][Math.floor(Math.random() * 6)]
        }}
        initial={{ opacity: 1, scale: 1 }}
        animate={{
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance,
            opacity: 0,
            scale: 0.5
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
    />
);

export default function VisionCardDisplay({ card, themeColor = '#7C3AED' }) {
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);

  const deleteCardMutation = useMutation({
    mutationFn: (cardId) => base44.entities.VisionCard.delete(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visionCards', card.board_id] });
    },
  });

  const updateCardMutation = useMutation({
      mutationFn: (updatedCard) => base44.entities.VisionCard.update(updatedCard.id, updatedCard),
      onSuccess: (data) => {
          queryClient.setQueryData(['visionCards', card.board_id], (oldData) => 
              oldData.map(c => c.id === data.id ? data : c)
          );
      }
  });

  const handleToggleAction = (actionId) => {
      const newActions = card.micro_actions.map(action => 
          action.action_id === actionId ? { ...action, is_done: !action.is_done } : action
      );
      updateCardMutation.mutate({ ...card, micro_actions: newActions });
  };

  const totalActions = card.micro_actions?.filter(a => a.label).length || 0;
  const completedActions = card.micro_actions?.filter(a => a.is_done && a.label).length || 0;
  const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  useEffect(() => {
    if (progressPercent === 100 && totalActions > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [progressPercent, totalActions]);
  
  const areaDetails = {
    Wellness: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100' },
    Career: { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100' },
    Finances: { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    Relationships: { icon: Users, color: 'text-pink-500', bg: 'bg-pink-100' },
    Home: { icon: HomeIcon, color: 'text-amber-500', bg: 'bg-amber-100' },
    Creativity: { icon: Paintbrush, color: 'text-purple-500', bg: 'bg-purple-100' },
    Default: { icon: Heart, color: 'text-gray-500', bg: 'bg-gray-100' },
  };

  const AreaIcon = areaDetails[card.area]?.icon || areaDetails.Default.icon;
  const areaColors = areaDetails[card.area] || areaDetails.Default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="h-full"
    >
      <Card data-card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative border-0">
        <AnimatePresence>
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-10">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <ConfettiParticle key={i} x={Math.random() * 300} y={Math.random() * 400} angle={Math.random() * 2 * Math.PI} distance={Math.random() * 150 + 50} />
                    ))}
                </div>
            )}
        </AnimatePresence>
        
        <CardHeader className="p-0 relative">
          <img src={card.image_url} alt={card.title} className="w-full h-48 object-cover" />
          {card.area && (
            <div className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${areaColors.bg} ${areaColors.color} shadow-md`}>
                <AreaIcon className="w-4 h-4" />
                <span>{card.area}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <CardTitle className="text-lg font-bold mb-2">{card.title}</CardTitle>
          <p className="text-sm text-gray-600 italic mb-3">"{card.affirmation || card.outcome_statement}"</p>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Micro-Actions:</h4>
            {card.micro_actions?.filter(s => s.label).map((step, i) => (
                <div key={step.action_id || i} className="flex items-center gap-2 group">
                    <Checkbox 
                        id={`action-${step.action_id}`} 
                        checked={step.is_done}
                        onCheckedChange={() => handleToggleAction(step.action_id)}
                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <label 
                        htmlFor={`action-${step.action_id}`}
                        className={`text-sm cursor-pointer transition-colors ${step.is_done ? 'line-through text-gray-400' : 'text-gray-700 group-hover:text-black'}`}
                    >
                        {step.label}
                    </label>
                </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-gray-50/50 flex flex-col items-start gap-3">
            <div className="w-full">
                 <div className="text-xs font-semibold text-gray-600 mb-1 flex justify-between">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                        className="h-2.5 rounded-full" 
                        style={{ backgroundColor: themeColor }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                </div>
            </div>
          <div className="w-full flex justify-end items-center gap-1 pt-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-500">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={() => deleteCardMutation.mutate(card.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}