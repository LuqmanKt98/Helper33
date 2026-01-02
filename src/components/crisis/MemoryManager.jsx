import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  Star,
  Target,
  AlertCircle,
  User,
  Calendar,
  Lightbulb,
  Sparkles,
  Trash2,
  X,
  Plus,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function MemoryManager({ onClose }) {
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [newMemory, setNewMemory] = useState({
    memory_type: 'user_preference',
    memory_content: '',
    context: '',
    importance_score: 5,
    related_tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const queryClient = useQueryClient();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['companionMemories'],
    queryFn: () => base44.entities.CompanionMemory.list('-importance_score')
  });

  const createMemoryMutation = useMutation({
    mutationFn: (data) => base44.entities.CompanionMemory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companionMemories']);
      setShowAddMemory(false);
      setNewMemory({
        memory_type: 'user_preference',
        memory_content: '',
        context: '',
        importance_score: 5,
        related_tags: []
      });
      toast.success('Memory saved! The AI will remember this.');
    }
  });

  const updateMemoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CompanionMemory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companionMemories']);
      setEditingMemory(null);
      toast.success('Memory updated');
    }
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (id) => base44.entities.CompanionMemory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companionMemories']);
      toast.success('Memory deleted');
    }
  });

  const toggleActiveMemory = (memory) => {
    updateMemoryMutation.mutate({
      id: memory.id,
      data: { is_active: !memory.is_active }
    });
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setNewMemory({
      ...newMemory,
      related_tags: [...(newMemory.related_tags || []), tagInput.trim()]
    });
    setTagInput('');
  };

  const removeTag = (index) => {
    setNewMemory({
      ...newMemory,
      related_tags: newMemory.related_tags.filter((_, i) => i !== index)
    });
  };

  const getMemoryIcon = (type) => {
    const icons = {
      user_preference: Sparkles,
      important_person: User,
      life_event: Calendar,
      goal: Target,
      challenge: AlertCircle,
      interest: Heart,
      routine: Brain,
      emotional_trigger: AlertCircle,
      coping_strategy: Lightbulb,
      achievement: Star
    };
    return icons[type] || Brain;
  };

  const getMemoryColor = (type) => {
    const colors = {
      user_preference: 'from-purple-500 to-pink-500',
      important_person: 'from-blue-500 to-cyan-500',
      life_event: 'from-amber-500 to-orange-500',
      goal: 'from-green-500 to-emerald-500',
      challenge: 'from-red-500 to-rose-500',
      interest: 'from-pink-500 to-rose-500',
      routine: 'from-indigo-500 to-purple-500',
      emotional_trigger: 'from-orange-500 to-red-500',
      coping_strategy: 'from-teal-500 to-cyan-500',
      achievement: 'from-yellow-500 to-amber-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Brain className="w-8 h-8 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            AI Memory System
          </h2>
          <p className="text-gray-600 text-sm">
            Help the AI remember what matters to you ({memories.filter(m => m.is_active).length} active memories)
          </p>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900">
            <p className="font-semibold mb-1">How Memory Works:</p>
            <ul className="space-y-1 text-purple-800">
              <li>• The AI remembers important details you share</li>
              <li>• Memories help personalize your support experience</li>
              <li>• You have full control - view, edit, or delete anytime</li>
              <li>• More context = more helpful conversations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Memory Button */}
      <Button
        onClick={() => setShowAddMemory(true)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Memory
      </Button>

      {/* Add/Edit Memory Form */}
      <AnimatePresence>
        {(showAddMemory || editingMemory) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-purple-300 shadow-xl">
              <CardHeader>
                <CardTitle>{editingMemory ? 'Edit Memory' : 'Add New Memory'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Memory Type</Label>
                  <select
                    value={newMemory.memory_type}
                    onChange={(e) => setNewMemory({ ...newMemory, memory_type: e.target.value })}
                    className="w-full p-3 border rounded-lg mt-1"
                  >
                    <option value="user_preference">Preference</option>
                    <option value="important_person">Important Person</option>
                    <option value="life_event">Life Event</option>
                    <option value="goal">Goal</option>
                    <option value="challenge">Challenge</option>
                    <option value="interest">Interest</option>
                    <option value="routine">Routine</option>
                    <option value="emotional_trigger">Emotional Trigger</option>
                    <option value="coping_strategy">Coping Strategy</option>
                    <option value="achievement">Achievement</option>
                  </select>
                </div>

                <div>
                  <Label>What should the AI remember?</Label>
                  <Textarea
                    value={newMemory.memory_content}
                    onChange={(e) => setNewMemory({ ...newMemory, memory_content: e.target.value })}
                    placeholder="e.g., I prefer gentle encouragement over tough love, My dog Max helps me feel calm, I lost my mother in 2023"
                    className="mt-1 h-24"
                  />
                </div>

                <div>
                  <Label>Additional Context (Optional)</Label>
                  <Input
                    value={newMemory.context}
                    onChange={(e) => setNewMemory({ ...newMemory, context: e.target.value })}
                    placeholder="When or why this is important..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Importance (1-10)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newMemory.importance_score}
                      onChange={(e) => setNewMemory({ ...newMemory, importance_score: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-purple-600">{newMemory.importance_score}</span>
                  </div>
                </div>

                <div>
                  <Label>Tags (for easy organization)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newMemory.related_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newMemory.related_tags.map((tag, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-800">
                          {tag}
                          <button onClick={() => removeTag(idx)} className="ml-2">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowAddMemory(false);
                      setEditingMemory(null);
                      setNewMemory({
                        memory_type: 'user_preference',
                        memory_content: '',
                        context: '',
                        importance_score: 5,
                        related_tags: []
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!newMemory.memory_content.trim()) {
                        toast.error('Please enter memory content');
                        return;
                      }
                      createMemoryMutation.mutate(newMemory);
                    }}
                    disabled={createMemoryMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Memory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memories List */}
      <div className="space-y-3">
        {memories.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Memories Yet</h3>
              <p className="text-gray-500 mb-4">
                Start adding memories to help the AI provide more personalized support
              </p>
              <Button
                onClick={() => setShowAddMemory(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Memory
              </Button>
            </CardContent>
          </Card>
        ) : (
          memories.map((memory, idx) => {
            const MemoryIcon = getMemoryIcon(memory.memory_type);
            
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-2 ${memory.is_active ? 'border-purple-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'} hover:shadow-lg transition-all`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getMemoryColor(memory.memory_type)} flex-shrink-0`}>
                        <MemoryIcon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <Badge className="bg-purple-100 text-purple-800 text-xs mb-1">
                              {memory.memory_type.replace(/_/g, ' ')}
                            </Badge>
                            <p className="text-gray-900 font-medium">{memory.memory_content}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              onClick={() => toggleActiveMemory(memory)}
                              size="sm"
                              variant="ghost"
                              title={memory.is_active ? 'Disable memory' : 'Enable memory'}
                            >
                              {memory.is_active ? (
                                <Eye className="w-4 h-4 text-purple-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              onClick={() => deleteMemoryMutation.mutate(memory.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {memory.context && (
                          <p className="text-sm text-gray-600 mb-2">{memory.context}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-current" />
                            Importance: {memory.importance_score}/10
                          </div>
                          {memory.reference_count > 0 && (
                            <div>Used {memory.reference_count} times</div>
                          )}
                          {memory.last_referenced && (
                            <div>Last used {new Date(memory.last_referenced).toLocaleDateString()}</div>
                          )}
                        </div>

                        {memory.related_tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {memory.related_tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Statistics */}
      {memories.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Memory Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{memories.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{memories.filter(m => m.is_active).length}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">
                  {memories.reduce((sum, m) => sum + (m.reference_count || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">References</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}