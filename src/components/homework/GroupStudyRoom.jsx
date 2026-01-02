import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Send, Loader2, BookOpen, Copy,
  MessageSquare, Calendar, TrendingUp, Crown, Shield, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import GroupRoleManager from './GroupRoleManager';
import SessionScheduler from './SessionScheduler';
import GroupAnalytics from './GroupAnalytics';
import UpcomingSessions from './UpcomingSessions';

export default function GroupStudyRoom({ group, onBack }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('discussion');
  const [showScheduler, setShowScheduler] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['groupDiscussions', group.id],
    queryFn: () => base44.entities.StudyDiscussion.filter({ group_id: group.id }, '-created_date'),
    initialData: []
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      if (!user?.email) throw new Error('Please log in');
      
      return await base44.entities.StudyDiscussion.create({
        group_id: group.id,
        material_id: null,
        discussion_type: 'general',
        title: 'Group Chat Message',
        content,
        author_email: user.email,
        author_name: user.full_name || user.email.split('@')[0],
        author_avatar: user.avatar_url || '',
        is_resolved: false,
        helpful_count: 0,
        reply_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupDiscussions'] });
      setMessage('');
      toast.success('💬 Message sent!');
    }
  });

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.invite_code);
    toast.success('📋 Invite code copied!');
  };

  const isAdmin = group.creator_email === user?.email;
  const isModerator = group.member_roles?.[user?.email] === 'moderator';
  const canManage = isAdmin || isModerator;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-4 border-2 border-purple-300 hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Groups
        </Button>

        <Card className="border-4 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl text-4xl"
                  style={{ backgroundColor: group.group_color }}
                >
                  {group.group_emoji}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-black text-gray-900">{group.group_name}</h1>
                    {isAdmin && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {isModerator && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Moderator
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{group.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-700">
                      {group.subject}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {group.member_count} members
                    </Badge>
                    {group.is_private ? (
                      <Badge variant="outline" className="border-purple-300">
                        🔒 Private
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-blue-300">
                        🌍 Public
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {group.invite_code && (
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Invite Code:</p>
                  <Button
                    onClick={copyInviteCode}
                    variant="outline"
                    size="sm"
                    className="font-mono font-bold text-lg border-2 border-indigo-300 hover:bg-indigo-50"
                  >
                    {group.invite_code}
                    <Copy className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full bg-white/80 backdrop-blur-md border-2 border-purple-300 p-1">
          <TabsTrigger value="discussion" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          {canManage && (
            <TabsTrigger value="manage" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </TabsTrigger>
          )}
        </TabsList>

        {/* Discussion Tab */}
        <TabsContent value="discussion" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-2 border-purple-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    Group Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {discussions.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      discussions.map((disc, idx) => (
                        <motion.div
                          key={disc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {disc.author_name?.[0] || 'U'}
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-3 border border-purple-200">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 text-sm">{disc.author_name}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(disc.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{disc.content}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1 border-2 border-purple-200 focus:border-purple-400"
                    />
                    <Button
                      onClick={() => sendMessageMutation.mutate(message)}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white self-end touch-manipulation"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-2 border-indigo-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Members ({group.member_count})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.member_emails?.slice(0, 10).map((email) => (
                      <div key={email} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {email[0].toUpperCase()}
                        </div>
                        <span className="text-gray-700 truncate flex-1">{email.split('@')[0]}</span>
                        {group.creator_email === email && (
                          <Crown className="w-3 h-3 text-yellow-600" />
                        )}
                        {group.member_roles?.[email] === 'moderator' && (
                          <Shield className="w-3 h-3 text-blue-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {group.shared_materials && group.shared_materials.length > 0 && (
                <Card className="border-2 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      Shared Materials ({group.shared_materials.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600">
                      {group.shared_materials.length} material{group.shared_materials.length !== 1 ? 's' : ''} shared
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-6">
          <UpcomingSessions 
            groupId={group.id} 
            onScheduleNew={() => setShowScheduler(true)}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <GroupAnalytics group={group} />
        </TabsContent>

        {/* Manage Tab (Admin/Moderator Only) */}
        {canManage && (
          <TabsContent value="manage" className="mt-6">
            <GroupRoleManager group={group} currentUserEmail={user?.email} />
          </TabsContent>
        )}
      </Tabs>

      {/* Session Scheduler Modal */}
      {showScheduler && (
        <SessionScheduler
          group={group}
          onClose={() => setShowScheduler(false)}
        />
      )}
    </div>
  );
}