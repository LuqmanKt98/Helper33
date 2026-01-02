import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Heart, Star, Wind, PenTool, Brain, MessageSquare, Sparkles,
  Search, Calendar, Trash2, Edit, Copy, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SavedInteractions({ coachType = null, supportCoachId = null }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  const { data: savedInteractions = [], isLoading } = useQuery({
    queryKey: ['savedCoachingInteractions', coachType, supportCoachId],
    queryFn: async () => {
      let query = {};
      if (coachType) query.coach_type = coachType;
      if (supportCoachId) query.support_coach_id = supportCoachId;
      return base44.entities.SavedCoachingInteraction.filter(query, '-created_date');
    },
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedCoachingInteraction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['savedCoachingInteractions']);
      setSelectedInteraction(null);
      toast.success('Interaction deleted');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedCoachingInteraction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['savedCoachingInteractions']);
      toast.success('Updated successfully');
    }
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'meditation_script': return <Wind className="w-5 h-5 text-purple-600" />;
      case 'journal_prompt': return <PenTool className="w-5 h-5 text-pink-600" />;
      case 'thought_reframing': return <Brain className="w-5 h-5 text-blue-600" />;
      case 'conversation': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'affirmation': return <Sparkles className="w-5 h-5 text-yellow-600" />;
      default: return <Star className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'meditation_script': return 'from-purple-50 to-indigo-50 border-purple-200';
      case 'journal_prompt': return 'from-pink-50 to-rose-50 border-pink-200';
      case 'thought_reframing': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'conversation': return 'from-green-50 to-emerald-50 border-green-200';
      case 'affirmation': return 'from-yellow-50 to-orange-50 border-yellow-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  // Filter and sort
  const filteredInteractions = savedInteractions
    .filter(item => {
      if (filterType !== 'all' && item.interaction_type !== filterType) return false;
      if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.content?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === 'most_used') return (b.usage_count || 0) - (a.usage_count || 0);
      return 0;
    });

  const handleView = (interaction) => {
    setSelectedInteraction(interaction);
    setEditedNotes(interaction.notes || '');
    setIsEditing(false);
    
    updateMutation.mutate({
      id: interaction.id,
      data: {
        usage_count: (interaction.usage_count || 1) + 1,
        last_accessed: new Date().toISOString()
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedInteraction) return;
    
    updateMutation.mutate({
      id: selectedInteraction.id,
      data: { notes: editedNotes }
    });
    setIsEditing(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-purple-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Saved Favorites</h3>
              <p className="text-sm text-gray-600 font-normal">{filteredInteractions.length} saved interactions</p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved interactions..."
                className="pl-10 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meditation_script">Meditations</SelectItem>
                <SelectItem value="journal_prompt">Prompts</SelectItem>
                <SelectItem value="thought_reframing">Reframings</SelectItem>
                <SelectItem value="conversation">Conversations</SelectItem>
                <SelectItem value="affirmation">Affirmations</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most_used">Most Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Saved Interactions List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {isLoading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto mb-4"
                >
                  <Sparkles className="w-12 h-12 text-purple-600" />
                </motion.div>
                <p className="text-gray-600">Loading your favorites...</p>
              </div>
            ) : filteredInteractions.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No saved interactions yet</p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Try a different search term' : 'Start saving your favorite coaching moments!'}
                </p>
              </div>
            ) : (
              filteredInteractions.map((interaction, index) => (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gradient-to-r ${getTypeColor(interaction.interaction_type)} rounded-xl p-5 border-2 shadow-md hover:shadow-xl transition-all cursor-pointer`}
                  onClick={() => handleView(interaction)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(interaction.interaction_type)}
                      <div>
                        <h4 className="font-bold text-gray-900">{interaction.title || 'Untitled'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {interaction.interaction_type.replace(/_/g, ' ')}
                          </Badge>
                          {interaction.usage_count > 1 && (
                            <Badge variant="outline" className="text-xs">
                              Used {interaction.usage_count}x
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(interaction.content);
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(interaction.id);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {interaction.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(interaction.created_date).toLocaleDateString()}
                    </span>
                    {interaction.context_mood && (
                      <Badge variant="outline" className="text-xs">
                        Mood: {interaction.context_mood}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      {/* View Modal */}
      <Dialog open={!!selectedInteraction} onOpenChange={(open) => !open && setSelectedInteraction(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedInteraction && getTypeIcon(selectedInteraction.interaction_type)}
              {selectedInteraction?.title}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap gap-2 mt-3">
              <Badge className="capitalize">
                {selectedInteraction?.interaction_type.replace(/_/g, ' ')}
              </Badge>
              {selectedInteraction?.context_mood && (
                <Badge variant="outline">Mood: {selectedInteraction.context_mood}</Badge>
              )}
              <Badge variant="outline">
                Accessed {selectedInteraction?.usage_count || 1} times
              </Badge>
              <Badge variant="outline">
                {new Date(selectedInteraction?.created_date).toLocaleDateString()}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {selectedInteraction && (
            <div className="space-y-6">
              {/* Content */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                  {selectedInteraction.content}
                </pre>
              </div>

              {/* Tags */}
              {selectedInteraction.context_tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedInteraction.context_tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs capitalize">
                      {tag.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Personal Notes</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <EyeOff className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add your personal notes about this interaction..."
                      className="min-h-[100px] bg-white"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveNotes}>
                        Save Notes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[60px]">
                    <p className="text-sm text-gray-700 italic">
                      {selectedInteraction.notes || 'No notes yet. Click edit to add some.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleCopy(selectedInteraction.content)}
                  variant="outline"
                  className="flex-1 bg-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>

                <Button
                  onClick={() => {
                    updateMutation.mutate({
                      id: selectedInteraction.id,
                      data: { is_favorite: !selectedInteraction.is_favorite }
                    });
                  }}
                  variant="outline"
                  className="bg-white"
                >
                  <Heart className={`w-4 h-4 mr-2 ${selectedInteraction.is_favorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                  {selectedInteraction.is_favorite ? 'Unfavorite' : 'Favorite'}
                </Button>

                <Button
                  onClick={() => deleteMutation.mutate(selectedInteraction.id)}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 bg-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}