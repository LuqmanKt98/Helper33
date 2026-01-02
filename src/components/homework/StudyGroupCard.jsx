import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Users, Crown, BookOpen, MessageSquare, TrendingUp, ChevronRight
} from 'lucide-react';

export default function StudyGroupCard({ group, index, onSelect }) {
  const getSubjectColor = (subject) => {
    const colors = {
      math: 'from-blue-500 to-cyan-500',
      science: 'from-green-500 to-emerald-500',
      english: 'from-amber-500 to-orange-500',
      history: 'from-rose-500 to-pink-500',
      languages: 'from-indigo-500 to-purple-500',
      computer_science: 'from-teal-500 to-cyan-500',
      mixed: 'from-purple-500 to-pink-500',
      default: 'from-gray-500 to-slate-500'
    };
    return colors[group.subject] || colors.default;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.03 }}
    >
      <Card className="h-full hover:shadow-2xl transition-all border-2 border-purple-200 bg-white/90 backdrop-blur-sm cursor-pointer group relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getSubjectColor(group.subject)} flex items-center justify-center shadow-lg text-3xl`}
            >
              {group.group_emoji}
            </motion.div>
            
            {group.creator_email === group.created_by && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Owner
              </Badge>
            )}
          </div>

          <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {group.group_name}
          </CardTitle>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {group.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge className={`bg-gradient-to-r ${getSubjectColor(group.subject)} text-white`}>
              {group.subject}
            </Badge>
            {group.is_private && (
              <Badge variant="outline" className="border-purple-400 text-purple-700">
                🔒 Private
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-600">{group.member_count}</p>
              <p className="text-xs text-gray-600">Members</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <BookOpen className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-600">{group.shared_materials?.length || 0}</p>
              <p className="text-xs text-gray-600">Materials</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-600">{group.total_sessions || 0}</p>
              <p className="text-xs text-gray-600">Sessions</p>
            </div>
          </div>

          <Button
            onClick={() => onSelect(group)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white touch-manipulation group/btn"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Group
            <ChevronRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}