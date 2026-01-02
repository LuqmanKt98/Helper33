import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  MessageSquare, CheckCircle, Clock, ThumbsUp, Search,
  Filter, Loader2, AlertCircle
} from 'lucide-react';

export default function DiscussionsList({ materialId, onSelectDiscussion }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['materialDiscussions', materialId],
    queryFn: () => base44.entities.StudyDiscussion.filter({ material_id: materialId }, '-created_date'),
    initialData: []
  });

  const filteredDiscussions = discussions.filter(d => {
    const matchesSearch = d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || d.discussion_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'resolved' && d.is_resolved) ||
                          (filterStatus === 'open' && !d.is_resolved);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type) => {
    const colors = {
      question: 'from-blue-500 to-cyan-500',
      concept_clarification: 'from-yellow-500 to-orange-500',
      study_tip: 'from-green-500 to-emerald-500',
      resource_share: 'from-purple-500 to-pink-500',
      general: 'from-gray-500 to-slate-500'
    };
    return colors[type] || colors.general;
  };

  const getTypeEmoji = (type) => {
    const emojis = {
      question: '❓',
      concept_clarification: '💡',
      study_tip: '📚',
      resource_share: '🔗',
      general: '💬'
    };
    return emojis[type] || emojis.general;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-3" />
        <p className="text-gray-600">Loading discussions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur-md">
        <CardContent className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="pl-10 border-2 border-purple-200 focus:border-purple-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">Type:</span>
              {['all', 'question', 'concept_clarification', 'study_tip', 'resource_share'].map((type) => (
                <Button
                  key={type}
                  onClick={() => setFilterType(type)}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  className={filterType === type ? 'bg-purple-600 text-white' : ''}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setFilterStatus('all')}
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              className={filterStatus === 'all' ? 'bg-purple-600 text-white' : ''}
            >
              All
            </Button>
            <Button
              onClick={() => setFilterStatus('open')}
              variant={filterStatus === 'open' ? 'default' : 'outline'}
              size="sm"
              className={filterStatus === 'open' ? 'bg-orange-600 text-white' : ''}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Open
            </Button>
            <Button
              onClick={() => setFilterStatus('resolved')}
              variant={filterStatus === 'resolved' ? 'default' : 'outline'}
              size="sm"
              className={filterStatus === 'resolved' ? 'bg-green-600 text-white' : ''}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Resolved
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discussions List */}
      {filteredDiscussions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-white/80 rounded-3xl border-2 border-dashed border-purple-300"
        >
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'No discussions match your filters'
              : 'No discussions yet. Start the conversation!'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredDiscussions.map((discussion, idx) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => onSelectDiscussion(discussion)}
            >
              <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {discussion.author_name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">
                          {discussion.title}
                        </h3>
                        {discussion.is_resolved && (
                          <Badge className="bg-green-600 text-white flex-shrink-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Solved
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {discussion.content}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`bg-gradient-to-r ${getTypeColor(discussion.discussion_type)} text-white`}>
                          {getTypeEmoji(discussion.discussion_type)} {discussion.discussion_type.replace('_', ' ')}
                        </Badge>
                        
                        {discussion.topic && (
                          <Badge variant="outline" className="border-purple-300">
                            {discussion.topic}
                          </Badge>
                        )}

                        {discussion.specific_page && (
                          <Badge variant="outline" className="border-blue-300">
                            📄 {discussion.specific_page}
                          </Badge>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-500 ml-auto">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {discussion.reply_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {discussion.helpful_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(discussion.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}