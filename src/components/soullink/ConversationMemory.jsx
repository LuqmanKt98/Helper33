
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Trash2, Star, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ConversationMemory() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [newMemory, setNewMemory] = useState({
    memory_type: 'user_preference',
    memory_content: '',
    context: '',
    importance_score: 5
  });

  const queryClient = useQueryClient();

  const { data: memories = [] } = useQuery({
    queryKey: ['companion-memories'],
    queryFn: () => base44.entities.CompanionMemory.filter({ is_active: true }, '-importance_score')
  });

  const createMemoryMutation = useMutation({
    mutationFn: (memoryData) => base44.entities.CompanionMemory.create(memoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['companion-memories']);
      setIsAdding(false);
      setNewMemory({
        memory_type: 'user_preference',
        memory_content: '',
        context: '',
        importance_score: 5
      });
      toast.success('Memory saved! SoulLink will remember this. 💜');
    },
    onError: () => {
      toast.error('Failed to save memory');
    }
  });

  const updateMemoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CompanionMemory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companion-memories']);
      setEditingMemory(null);
      toast.success('Memory updated!');
    }
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (id) => base44.entities.CompanionMemory.update(id, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries(['companion-memories']);
      toast.success('Memory removed');
    }
  });

  const handleSaveMemory = () => {
    if (!newMemory.memory_content.trim()) {
      toast.error('Please add memory content');
      return;
    }

    createMemoryMutation.mutate(newMemory);
  };

  const memoryTypeIcons = {
    user_preference: '⚙️',
    important_person: '👤',
    life_event: '📅',
    goal: '🎯',
    challenge: '💪',
    interest: '💡',
    routine: '🔄',
    emotional_trigger: '⚠️',
    coping_strategy: '🛡️',
    achievement: '🏆'
  };

  const memoryTypeLabels = {
    user_preference: 'Preference',
    important_person: 'Important Person',
    life_event: 'Life Event',
    goal: 'Goal',
    challenge: 'Challenge',
    interest: 'Interest',
    routine: 'Routine',
    emotional_trigger: 'Trigger',
    coping_strategy: 'Coping Strategy',
    achievement: 'Achievement'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-purple-900 mb-2">
                Conversation Memory
              </h3>
              <p className="text-sm text-purple-800 leading-relaxed">
                SoulLink remembers important details you share to provide more personalized, 
                contextually-aware support. You can also manually add memories you want the AI to remember.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Memory Button */}
      {!isAdding && (
        <Button
          onClick={() => setIsAdding(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
      )}

      {/* Add Memory Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Add New Memory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Memory Type</Label>
                  <Select
                    value={newMemory.memory_type}
                    onValueChange={(value) => setNewMemory({ ...newMemory, memory_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(memoryTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {memoryTypeIcons[key]} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>What to Remember</Label>
                  <Textarea
                    value={newMemory.memory_content}
                    onChange={(e) => setNewMemory({ ...newMemory, memory_content: e.target.value })}
                    placeholder="e.g., 'I love morning walks in the park' or 'My mom passed away in 2023'"
                    className="h-20"
                  />
                </div>

                <div>
                  <Label>Context (Optional)</Label>
                  <Input
                    value={newMemory.context}
                    onChange={(e) => setNewMemory({ ...newMemory, context: e.target.value })}
                    placeholder="When or why this is important..."
                  />
                </div>

                <div>
                  <Label>Importance (1-10)</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newMemory.importance_score}
                      onChange={(e) => setNewMemory({ ...newMemory, importance_score: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-purple-600 w-8">
                      {newMemory.importance_score}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveMemory}
                    disabled={createMemoryMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Memory
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAdding(false);
                      setNewMemory({
                        memory_type: 'user_preference',
                        memory_content: '',
                        context: '',
                        importance_score: 5
                      });
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory List */}
      <div className="space-y-3">
        {memories.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                No memories saved yet. Add important details you want SoulLink to remember.
              </p>
            </CardContent>
          </Card>
        ) : (
          memories.map((memory, idx) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 hover:border-purple-400 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{memoryTypeIcons[memory.memory_type]}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="text-xs mb-2">
                            {memoryTypeLabels[memory.memory_type]}
                          </Badge>
                          <p className="text-gray-800 leading-relaxed">
                            {memory.memory_content}
                          </p>
                          {memory.context && (
                            <p className="text-xs text-gray-500 mt-1">
                              Context: {memory.context}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-gray-600">
                              {memory.importance_score}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Referenced {memory.reference_count || 0} times
                        </div>
                        <Button
                          onClick={() => deleteMemoryMutation.mutate(memory.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <CardContent className="p-4">
          <p className="text-sm text-amber-900">
            <strong>💡 How Memory Works:</strong> SoulLink automatically extracts and remembers 
            important details from your conversations, journal entries, and mood patterns. You can 
            also manually add memories to ensure the AI remembers what matters most to you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Export utility function to get relevant memories
export function getRelevantMemories(memories, currentContext) {
  if (!memories || memories.length === 0) return [];
  
  // Sort by importance and reference count
  return memories
    .filter(m => m.is_active)
    .sort((a, b) => {
      const scoreA = (a.importance_score || 0) + (a.reference_count || 0) * 0.1;
      const scoreB = (b.importance_score || 0) + (b.reference_count || 0) * 0.1;
      return scoreB - scoreA;
    })
    .slice(0, 10); // Return top 10 most relevant
}

// Export utility to extract memories from conversation
export function extractMemoriesFromConversation(messages) {
  // This would use AI to extract important details from conversation
  // For now, return empty array
  return [];
}

// Export memory type configuration
export const memoryTypeConfig = {
  user_preference: { icon: '⚙️', label: 'Preference' },
  important_person: { icon: '👤', label: 'Important Person' },
  life_event: { icon: '📅', label: 'Life Event' },
  goal: { icon: '🎯', label: 'Goal' },
  challenge: { icon: '💪', label: 'Challenge' },
  interest: { icon: '💡', label: 'Interest' },
  routine: { icon: '🔄', label: 'Routine' },
  emotional_trigger: { icon: '⚠️', label: 'Trigger' },
  coping_strategy: { icon: '🛡️', label: 'Coping Strategy' },
  achievement: { icon: '🏆', label: 'Achievement' }
};
