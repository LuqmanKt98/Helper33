import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Users, Search, Loader2, UserPlus, Globe,
  BookOpen, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function PublicGroupsDirectory({ onJoinSuccess }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: publicGroups = [], isLoading } = useQuery({
    queryKey: ['publicStudyGroups'],
    queryFn: async () => {
      const groups = await base44.entities.StudyGroup.filter({ is_private: false }, '-created_date');
      return groups.filter(g => g.is_active);
    },
    initialData: []
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (group) => {
      if (!user?.email) throw new Error('Please log in to join');
      
      if (group.member_emails?.includes(user.email)) {
        throw new Error('Already a member');
      }
      
      if (group.member_count >= group.max_members) {
        throw new Error('Group is full');
      }

      return await base44.entities.StudyGroup.update(group.id, {
        member_emails: [...(group.member_emails || []), user.email],
        member_count: (group.member_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicStudyGroups'] });
      queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
      toast.success('🎉 Joined study group!');
      onJoinSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to join group');
    }
  });

  const filteredGroups = publicGroups.filter(g => {
    const matchesSearch = g.group_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         g.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || g.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['all', 'math', 'science', 'english', 'history', 'computer_science', 'mixed', 'other'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
        >
          <Globe className="w-9 h-9 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Public Study Groups
        </h2>
        <p className="text-gray-600">Discover and join groups to study together!</p>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 border-blue-200 bg-white/90 backdrop-blur-md">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="pl-10 border-2 border-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Button
                key={subject}
                onClick={() => setFilterSubject(subject)}
                variant={filterSubject === subject ? 'default' : 'outline'}
                size="sm"
                className={filterSubject === subject ? 'bg-blue-600 text-white' : ''}
              >
                {subject === 'all' ? 'All' : subject.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading public groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-white/80 rounded-3xl border-2 border-dashed border-blue-300"
        >
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchQuery || filterSubject !== 'all'
              ? 'No groups match your search'
              : 'No public groups available yet'}
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredGroups.map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all bg-white/90 backdrop-blur-sm h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-2xl"
                        style={{ backgroundColor: group.group_color }}
                      >
                        {group.group_emoji}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{group.group_name}</CardTitle>
                        <p className="text-xs text-gray-500">by {group.creator_name}</p>
                      </div>
                    </div>
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>

                  {group.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-100 text-blue-700">
                      {group.subject}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {group.member_count}/{group.max_members}
                    </Badge>
                    {group.shared_materials?.length > 0 && (
                      <Badge variant="outline">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {group.shared_materials.length} materials
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => joinGroupMutation.mutate(group)}
                    disabled={
                      joinGroupMutation.isPending ||
                      group.member_emails?.includes(user?.email) ||
                      group.member_count >= group.max_members
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white touch-manipulation"
                  >
                    {group.member_emails?.includes(user?.email) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Already Joined
                      </>
                    ) : joinGroupMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : group.member_count >= group.max_members ? (
                      <>Group Full</>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Group
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}