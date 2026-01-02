import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, MessageSquare, BookOpen, Trophy, Star,
  Calendar, Target, Zap, Clock, Flame
} from 'lucide-react';

export default function GroupAnalytics({ group }) {
  const { data: sessions = [] } = useQuery({
    queryKey: ['groupSessions', group.id],
    queryFn: () => base44.entities.StudySession.filter({ group_id: group.id }),
    initialData: []
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['groupDiscussions', group.id],
    queryFn: () => base44.entities.StudyDiscussion.filter({ group_id: group.id }),
    initialData: []
  });

  // Calculate analytics
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgSessionDuration = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0) / completedSessions.length)
    : 0;

  // Calculate most active members
  const memberActivity = {};
  discussions.forEach(d => {
    memberActivity[d.author_email] = (memberActivity[d.author_email] || 0) + 1;
  });
  const mostActiveMembers = Object.entries(memberActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([email, count]) => ({ email, activity_score: count }));

  // Calculate popular topics
  const topicCounts = {};
  discussions.forEach(d => {
    if (d.topic) {
      topicCounts[d.topic] = (topicCounts[d.topic] || 0) + 1;
    }
  });
  const popularTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, discussion_count: count }));

  const stats = [
    { icon: Users, label: 'Active Members', value: group.member_count, color: 'from-blue-500 to-cyan-500', emoji: '👥' },
    { icon: Calendar, label: 'Sessions Held', value: completedSessions.length, color: 'from-green-500 to-emerald-500', emoji: '📅' },
    { icon: MessageSquare, label: 'Discussions', value: discussions.length, color: 'from-purple-500 to-pink-500', emoji: '💬' },
    { icon: BookOpen, label: 'Materials', value: group.shared_materials?.length || 0, color: 'from-orange-500 to-amber-500', emoji: '📚' },
    { icon: Trophy, label: 'Questions Solved', value: group.total_questions_solved || 0, color: 'from-yellow-500 to-orange-500', emoji: '🏆' },
    { icon: Clock, label: 'Avg Session', value: `${avgSessionDuration}m`, color: 'from-indigo-500 to-purple-500', emoji: '⏱️' }
  ];

  return (
    <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Group Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -3 }}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                <div className="text-2xl mb-1">{stat.emoji}</div>
                <p className="text-2xl font-black mb-1">{stat.value}</p>
                <p className="text-xs opacity-90 font-semibold">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Most Active Members */}
        {mostActiveMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900">Most Active Members</h3>
            </div>
            <div className="space-y-2">
              {mostActiveMembers.map((member, idx) => (
                <motion.div
                  key={member.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-orange-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <span className="font-medium text-gray-700 text-sm">{member.email.split('@')[0]}</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">
                    <Star className="w-3 h-3 mr-1" />
                    {member.activity_score} posts
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Topics */}
        {popularTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Popular Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((topic, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    {topic.topic} ({topic.discussion_count})
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Group Activity Summary:
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-blue-700 font-semibold">Total Engagement:</p>
              <p className="text-blue-900 font-bold text-lg">
                {(discussions.length || 0) + (completedSessions.length || 0)}
              </p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Materials Shared:</p>
              <p className="text-blue-900 font-bold text-lg">
                {group.shared_materials?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}