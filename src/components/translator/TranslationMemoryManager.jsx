import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Database, Search, Edit, Trash2, Save, X, Star, Check,
  TrendingUp, Plus, BookMarked, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function TranslationMemoryManager({ languages, onMemoryUpdate }) {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterLanguagePair, setFilterLanguagePair] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showAddNew, setShowAddNew] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    source_text: '',
    translated_text: '',
    source_language: 'en',
    target_language: 'es',
    domain: 'general',
    context: '',
    tags: []
  });

  // Fetch translation memory
  const { data: memoryEntries = [], isLoading } = useQuery({
    queryKey: ['translationMemory'],
    queryFn: () => base44.entities.TranslationMemory.list('-usage_count', 500),
    initialData: []
  });

  // Mutations
  const createMemoryMutation = useMutation({
    mutationFn: (data) => base44.entities.TranslationMemory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationMemory'] });
      setShowAddNew(false);
      setNewEntry({
        source_text: '',
        translated_text: '',
        source_language: 'en',
        target_language: 'es',
        domain: 'general',
        context: '',
        tags: []
      });
      toast.success('Translation saved to memory!');
      if (onMemoryUpdate) onMemoryUpdate();
    }
  });

  const updateMemoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TranslationMemory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationMemory'] });
      setEditingEntry(null);
      toast.success('Translation memory updated!');
      if (onMemoryUpdate) onMemoryUpdate();
    }
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: (id) => base44.entities.TranslationMemory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationMemory'] });
      toast.success('Translation deleted from memory');
      if (onMemoryUpdate) onMemoryUpdate();
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.TranslationMemory.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationMemory'] });
      if (onMemoryUpdate) onMemoryUpdate();
    }
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ id, isVerified }) => 
      base44.entities.TranslationMemory.update(id, { is_verified: !isVerified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationMemory'] });
      if (onMemoryUpdate) onMemoryUpdate();
    }
  });

  // Filter memory entries
  const filteredEntries = useMemo(() => {
    return memoryEntries.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.source_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.translated_text.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDomain = filterDomain === 'all' || entry.domain === filterDomain;
      
      const matchesLanguagePair = filterLanguagePair === 'all' || 
        `${entry.source_language}-${entry.target_language}` === filterLanguagePair;
      
      return matchesSearch && matchesDomain && matchesLanguagePair;
    });
  }, [memoryEntries, searchTerm, filterDomain, filterLanguagePair]);

  // Get unique language pairs
  const languagePairs = useMemo(() => {
    const pairs = new Set();
    memoryEntries.forEach(entry => {
      pairs.add(`${entry.source_language}-${entry.target_language}`);
    });
    return Array.from(pairs);
  }, [memoryEntries]);

  // Stats
  const stats = useMemo(() => ({
    total: memoryEntries.length,
    verified: memoryEntries.filter(e => e.is_verified).length,
    favorites: memoryEntries.filter(e => e.is_favorite).length,
    mostUsed: memoryEntries.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))[0]
  }), [memoryEntries]);

  const handleSaveNew = () => {
    if (!newEntry.source_text.trim() || !newEntry.translated_text.trim()) {
      toast.error('Please fill in both source and translated text');
      return;
    }
    createMemoryMutation.mutate(newEntry);
  };

  const handleUpdateEntry = (entry) => {
    if (!entry.source_text.trim() || !entry.translated_text.trim()) {
      toast.error('Please fill in both source and translated text');
      return;
    }
    updateMemoryMutation.mutate({ id: entry.id, data: entry });
  };

  const getLangFlag = (code) => languages.find(l => l.code === code)?.flag || '🌐';
  const getLangName = (code) => languages.find(l => l.code === code)?.name || code;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Database className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-90">Total Entries</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Check className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.verified}</p>
            <p className="text-sm opacity-90">Verified</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.favorites}</p>
            <p className="text-sm opacity-90">Favorites</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.mostUsed?.usage_count || 0}</p>
            <p className="text-sm opacity-90">Most Used</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* Domain Filter */}
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>

            {/* Language Pair Filter */}
            <Select value={filterLanguagePair} onValueChange={setFilterLanguagePair}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Language Pairs</SelectItem>
                {languagePairs.map(pair => {
                  const [src, tgt] = pair.split('-');
                  return (
                    <SelectItem key={pair} value={pair}>
                      {getLangFlag(src)} → {getLangFlag(tgt)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Add New Button */}
            <Button
              onClick={() => setShowAddNew(!showAddNew)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry Form */}
      <AnimatePresence>
        {showAddNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Plus className="w-5 h-5" />
                  Add New Translation Memory Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Source Language</label>
                    <Select 
                      value={newEntry.source_language} 
                      onValueChange={(val) => setNewEntry({...newEntry, source_language: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Target Language</label>
                    <Select 
                      value={newEntry.target_language} 
                      onValueChange={(val) => setNewEntry({...newEntry, target_language: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Source Text</label>
                  <Textarea
                    value={newEntry.source_text}
                    onChange={(e) => setNewEntry({...newEntry, source_text: e.target.value})}
                    placeholder="Enter original text..."
                    className="bg-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Translated Text</label>
                  <Textarea
                    value={newEntry.translated_text}
                    onChange={(e) => setNewEntry({...newEntry, translated_text: e.target.value})}
                    placeholder="Enter translation..."
                    className="bg-white"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Domain</label>
                    <Select 
                      value={newEntry.domain} 
                      onValueChange={(val) => setNewEntry({...newEntry, domain: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Context (Optional)</label>
                    <Input
                      value={newEntry.context}
                      onChange={(e) => setNewEntry({...newEntry, context: e.target.value})}
                      placeholder="e.g., 'medical report', 'contract'..."
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddNew(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveNew}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Memory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Entries List */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            Translation Memory ({filteredEntries.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-gray-600">Loading translation memory...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No translation memory entries found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? 'Try different search terms' : 'Start translating to build your memory'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredEntries.map((entry, index) => {
                const isEditing = editingEntry?.id === entry.id;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className={`${
                      entry.is_favorite ? 'ring-2 ring-yellow-400' : ''
                    } hover:shadow-lg transition-all`}>
                      <CardContent className="p-4">
                        {isEditing ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Source</label>
                                <Textarea
                                  value={editingEntry.source_text}
                                  onChange={(e) => setEditingEntry({...editingEntry, source_text: e.target.value})}
                                  className="bg-white text-sm"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Translation</label>
                                <Textarea
                                  value={editingEntry.translated_text}
                                  onChange={(e) => setEditingEntry({...editingEntry, translated_text: e.target.value})}
                                  className="bg-white text-sm"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingEntry(null)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleUpdateEntry(editingEntry)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-50">
                                  {getLangFlag(entry.source_language)} {getLangName(entry.source_language)}
                                </Badge>
                                <span className="text-gray-400">→</span>
                                <Badge variant="outline" className="bg-purple-50">
                                  {getLangFlag(entry.target_language)} {getLangName(entry.target_language)}
                                </Badge>
                                <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                                  {entry.domain}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavoriteMutation.mutate({ id: entry.id, isFavorite: entry.is_favorite })}
                                  className={entry.is_favorite ? 'text-yellow-500' : 'text-gray-400'}
                                >
                                  <Star className={`w-4 h-4 ${entry.is_favorite ? 'fill-yellow-500' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleVerifiedMutation.mutate({ id: entry.id, isVerified: entry.is_verified })}
                                  className={entry.is_verified ? 'text-green-600' : 'text-gray-400'}
                                >
                                  <Check className={`w-4 h-4 ${entry.is_verified ? 'text-green-600' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingEntry(entry)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Delete this translation from memory?')) {
                                      deleteMemoryMutation.mutate(entry.id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs font-semibold text-blue-800 mb-1">Source:</p>
                                <p className="text-sm text-gray-800">{entry.source_text}</p>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs font-semibold text-purple-800 mb-1">Translation:</p>
                                <p className="text-sm text-gray-800">{entry.translated_text}</p>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-3">
                                {entry.context && (
                                  <span className="flex items-center gap-1">
                                    <BookMarked className="w-3 h-3" />
                                    {entry.context}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Used {entry.usage_count || 1}x
                                </span>
                              </div>
                              {entry.is_verified && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Translation Memory Benefits
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Consistency:</strong> Same phrase always translated the same way</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Speed:</strong> Instant suggestions for previously translated segments</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Quality:</strong> Build your own verified translation database</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Context:</strong> Tag by domain (medical, legal, technical, etc.)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}