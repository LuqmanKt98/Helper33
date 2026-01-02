
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Plus, X, Search, Star, TrendingUp, Clock,
  Tag, Edit2, Trash2, CheckCircle, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function MemoryManagement({ coachId, coachName }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("importance");

  const [newMemory, setNewMemory] = useState({
    memory_type: 'user_preference',
    memory_content: '',
    context: '',
    importance_score: 5,
    related_tags: []
  });

  const [newTag, setNewTag] = useState('');

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['companionMemories', coachId],
    queryFn: async () => {
      const allMemories = await base44.entities.CompanionMemory.list('-importance_score');
      return allMemories;
    },
  });

  const createMemoryMutation = useMutation({
    mutationFn: (memoryData) => base44.entities.CompanionMemory.create(memoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companionMemories', coachId] });
      setIsCreating(false);
      setNewMemory({
        memory_type: 'user_preference',
        memory_content: '',
        context: '',
        importance_score: 5,
        related_tags: []
      });
      toast.success('✨ Memory saved!');
    },
  });

  const updateMemoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CompanionMemory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companionMemories', coachId] });
      setEditingMemory(null);
      toast.success('💾 Memory updated!');
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (id) => base44.entities.CompanionMemory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companionMemories', coachId] });
      toast.success('🗑️ Memory deleted');
    },
  });

  const addTag = () => {
    if (newTag.trim() && !newMemory.related_tags.includes(newTag.trim())) {
      setNewMemory({
        ...newMemory,
        related_tags: [...newMemory.related_tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setNewMemory({
      ...newMemory,
      related_tags: newMemory.related_tags.filter(t => t !== tag)
    });
  };

  const handleSaveMemory = () => {
    if (!newMemory.memory_content.trim()) {
      toast.error('Please enter memory content');
      return;
    }

    if (editingMemory) {
      updateMemoryMutation.mutate({
        id: editingMemory.id,
        data: newMemory
      });
    } else {
      createMemoryMutation.mutate(newMemory);
    }
  };

  const startEdit = (memory) => {
    setEditingMemory(memory);
    setNewMemory({
      memory_type: memory.memory_type,
      memory_content: memory.memory_content,
      context: memory.context || '',
      importance_score: memory.importance_score,
      related_tags: memory.related_tags || []
    });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingMemory(null);
    setIsCreating(false);
    setNewMemory({
      memory_type: 'user_preference',
      memory_content: '',
      context: '',
      importance_score: 5,
      related_tags: []
    });
  };

  const filteredMemories = memories
    .filter(m => {
      if (filterType !== 'all' && m.memory_type !== filterType) return false;
      if (searchQuery && !m.memory_content.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !m.related_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'importance') return b.importance_score - a.importance_score;
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'referenced') return (b.reference_count || 0) - (a.reference_count || 0);
      return 0;
    });

  const memoryTypes = [
    { value: 'user_preference', label: '⚙️ Preference', color: 'bg-blue-100 text-blue-800' },
    { value: 'important_person', label: '👤 Person', color: 'bg-purple-100 text-purple-800' },
    { value: 'life_event', label: '🎯 Life Event', color: 'bg-green-100 text-green-800' },
    { value: 'goal', label: '🎖️ Goal', color: 'bg-amber-100 text-amber-800' },
    { value: 'challenge', label: '⚡ Challenge', color: 'bg-red-100 text-red-800' },
    { value: 'interest', label: '❤️ Interest', color: 'bg-pink-100 text-pink-800' },
    { value: 'routine', label: '📅 Routine', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'emotional_trigger', label: '💭 Trigger', color: 'bg-orange-100 text-orange-800' },
    { value: 'coping_strategy', label: '🛡️ Coping', color: 'bg-teal-100 text-teal-800' },
    { value: 'achievement', label: '🏆 Achievement', color: 'bg-yellow-100 text-yellow-800' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Memory Knowledge Base</CardTitle>
                <p className="text-sm text-gray-600">
                  Help {coachName} remember important details about you
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
              <p className="text-2xl font-bold text-blue-900">{memories.length}</p>
              <p className="text-xs text-blue-700">Total Memories</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
              <p className="text-2xl font-bold text-purple-900">
                {memories.filter(m => m.importance_score >= 8).length}
              </p>
              <p className="text-xs text-purple-700">High Priority</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
              <p className="text-2xl font-bold text-green-900">
                {memories.filter(m => m.user_confirmed).length}
              </p>
              <p className="text-xs text-green-700">Confirmed</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border-2 border-amber-200">
              <p className="text-2xl font-bold text-amber-900">
                {memories.reduce((sum, m) => sum + (m.reference_count || 0), 0)}
              </p>
              <p className="text-xs text-amber-700">Times Referenced</p>
            </div>
          </div>

          {/* Create/Edit Memory Form */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300"
              >
                <h3 className="font-bold text-lg text-purple-900 mb-4">
                  {editingMemory ? '✏️ Edit Memory' : '✨ Create New Memory'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Memory Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMemory.memory_type}
                      onChange={(e) => setNewMemory({ ...newMemory, memory_type: e.target.value })}
                      className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      {memoryTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Memory Content <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={newMemory.memory_content}
                      onChange={(e) => setNewMemory({ ...newMemory, memory_content: e.target.value })}
                      className="h-32 border-2 border-purple-300 focus:border-purple-500"
                      placeholder="e.g., 'User's mother passed away in June 2023. They were very close and talked every day.'"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Context (Optional)
                    </label>
                    <Textarea
                      value={newMemory.context}
                      onChange={(e) => setNewMemory({ ...newMemory, context: e.target.value })}
                      className="h-20 border-2 border-purple-300 focus:border-purple-500"
                      placeholder="When/how was this shared? Additional context..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Importance Score: <strong className="text-purple-600">{newMemory.importance_score}/10</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newMemory.importance_score}
                      onChange={(e) => setNewMemory({ ...newMemory, importance_score: parseInt(e.target.value) })}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low Priority</span>
                      <span>Critical</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Add tag (e.g., family, work, health)"
                        className="border-2 border-purple-300 focus:border-purple-500"
                      />
                      <Button onClick={addTag} className="bg-purple-600 hover:bg-purple-700">
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newMemory.related_tags.map((tag, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                            {tag}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-red-600"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveMemory}
                      disabled={createMemoryMutation.isPending || updateMemoryMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {(createMemoryMutation.isPending || updateMemoryMutation.isPending) ? (
                        <>Saving...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-2" />{editingMemory ? 'Update' : 'Save'} Memory</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories or tags..."
                className="pl-10 border-2 border-gray-300 focus:border-purple-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              {memoryTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="importance">⭐ By Importance</option>
              <option value="recent">🕐 Most Recent</option>
              <option value="referenced">📊 Most Used</option>
            </select>
          </div>

          {/* Memory List */}
          <div className="space-y-3">
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500">Loading memories...</p>
              </div>
            )}

            {!isLoading && filteredMemories.length === 0 && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-2">No memories yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start building the AI's knowledge base about you
                </p>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Memory
                </Button>
              </div>
            )}

            {filteredMemories.map((memory) => {
              const memoryType = memoryTypes.find(t => t.value === memory.memory_type);
              const isHighPriority = memory.importance_score >= 8;
              const isFrequentlyUsed = (memory.reference_count || 0) >= 5;

              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white rounded-xl p-5 border-2 transition-all hover:shadow-lg ${
                    isHighPriority ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={memoryType?.color || 'bg-gray-100 text-gray-800'}>
                        {memoryType?.label || memory.memory_type}
                      </Badge>
                      {isHighPriority && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                          <Star className="w-3 h-3 mr-1" />
                          High Priority
                        </Badge>
                      )}
                      {isFrequentlyUsed && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Often Used
                        </Badge>
                      )}
                      {memory.user_confirmed && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirmed
                        </Badge>
                      )}
                      {!memory.is_active && (
                        <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(memory)}
                        className="hover:bg-purple-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this memory?')) {
                            deleteMemoryMutation.mutate(memory.id);
                          }
                        }}
                        className="hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">{memory.memory_content}</p>
                    {memory.context && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        📝 <strong>Context:</strong> {memory.context}
                      </p>
                    )}

                    {memory.related_tags && memory.related_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {memory.related_tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        Importance: {memory.importance_score}/10
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        Referenced: {memory.reference_count || 0}x
                      </span>
                      {memory.last_referenced && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          Last used: {new Date(memory.last_referenced).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-3">
                      {!memory.user_confirmed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            updateMemoryMutation.mutate({
                              id: memory.id,
                              data: { user_confirmed: true }
                            });
                          }}
                          className="text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirm Accurate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateMemoryMutation.mutate({
                            id: memory.id,
                            data: { is_active: !memory.is_active }
                          });
                        }}
                        className="text-xs"
                      >
                        {memory.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newScore = Math.min(10, memory.importance_score + 1);
                          updateMemoryMutation.mutate({
                            id: memory.id,
                            data: { importance_score: newScore }
                          });
                        }}
                        className="text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Boost Priority
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info Box */}
          {memories.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-purple-900 mb-1">How Memory Recall Works:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• The AI automatically references high-priority memories in conversations</li>
                    <li>• Tag-based retrieval brings up relevant memories based on context</li>
                    <li>• Frequently referenced memories are strengthened over time</li>
                    <li>• You can confirm, edit, or deactivate memories anytime</li>
                    <li>• Memories help the AI provide more personalized and meaningful support</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
