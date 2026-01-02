
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Heart, AlertTriangle } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function KidsJournalProgress({ familyMembers }) {
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  const childMembers = familyMembers?.filter(m => 
    m.role === 'ChildMember' && m.age && m.age >= 3 && m.age <= 17
  ) || [];

  useEffect(() => {
    if (childMembers.length > 0) {
      setSelectedChild(childMembers[0]);
    }
  }, [childMembers.length]);

  useEffect(() => {
    loadJournalEntries();
  }, [selectedChild]);

  const loadJournalEntries = async () => {
    if (!selectedChild) return;
    
    setIsLoading(true);
    try {
      const entries = await base44.entities.KidsJournalEntry.filter({
        child_member_id: selectedChild.id
      }, '-entry_date', 30);
      setJournalEntries(entries || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setJournalEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get last 7 days for mood calendar
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  // Mood statistics
  const moodCounts = journalEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b, 'happy'
  );

  // Check for concerning patterns
  const recentNegativeMoods = journalEntries.slice(0, 3).filter(e => 
    ['sad', 'angry', 'worried'].includes(e.mood)
  );

  const needsAttention = journalEntries.some(e => e.needs_attention);

  if (childMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📓 Kids Journal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No children in the family yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📓 {selectedChild?.name}'s Feelings Journal
        </CardTitle>
        <p className="text-sm text-gray-600">Track your child's emotional well-being</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Child Selector */}
        {childMembers.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {childMembers.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedChild?.id === child.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {/* Alerts */}
        {needsAttention && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Check-In Recommended</p>
              <p className="text-sm text-amber-700">
                Your child's recent journal entries suggest they might need extra support. 
                Consider having a gentle conversation or reaching out to a counselor.
              </p>
            </div>
          </div>
        )}

        {recentNegativeMoods.length >= 2 && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex items-start gap-3">
            <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800">More Attention Needed</p>
              <p className="text-sm text-blue-700">
                {selectedChild.name} has been experiencing some difficult emotions lately. 
                A caring conversation might help.
              </p>
            </div>
          </div>
        )}

        {/* 7-Day Mood Calendar */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last 7 Days
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {last7Days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const entry = journalEntries.find(e => e.entry_date === dayStr);
              
              return (
                <motion.div
                  key={dayStr}
                  className="flex flex-col items-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                    entry ? 'bg-purple-100 border-2 border-purple-300' : 'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    {entry?.mood_emoji || '•'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {format(day, 'd')}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mood Summary */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Mood Summary (Last 30 Days)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(moodCounts).map(([mood, count]) => {
              const moodData = {
                happy: { emoji: '😊', color: 'bg-yellow-100 border-yellow-300' },
                excited: { emoji: '🤩', color: 'bg-orange-100 border-orange-300' },
                calm: { emoji: '😌', color: 'bg-blue-100 border-blue-300' },
                okay: { emoji: '😐', color: 'bg-gray-100 border-gray-300' },
                sad: { emoji: '😢', color: 'bg-blue-200 border-blue-400' },
                angry: { emoji: '😠', color: 'bg-red-100 border-red-300' },
                worried: { emoji: '😰', color: 'bg-purple-100 border-purple-300' },
                silly: { emoji: '🤪', color: 'bg-pink-100 border-pink-300' },
              }[mood] || { emoji: '😊', color: 'bg-gray-100 border-gray-300' };

              return (
                <div
                  key={mood}
                  className={`p-3 rounded-lg border-2 ${moodData.color} text-center`}
                >
                  <div className="text-3xl mb-1">{moodData.emoji}</div>
                  <div className="text-lg font-bold text-gray-800">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">{mood}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Journaling Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{journalEntries.length}</div>
            <div className="text-xs text-gray-600">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">
              {journalEntries.filter(e => format(new Date(e.created_date), 'yyyy-MM') === format(new Date(), 'yyyy-MM')).length}
            </div>
            <div className="text-xs text-gray-600">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">
              {moodCounts[mostCommonMood] ? 
                { happy: '😊', excited: '🤩', calm: '😌', okay: '😐', sad: '😢', angry: '😠', worried: '😰', silly: '🤪' }[mostCommonMood]
                : '😊'
              }
            </div>
            <div className="text-xs text-gray-600">Most Common</div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <p className="font-semibold mb-1">🔒 Privacy Protected</p>
          <p>You can see {selectedChild?.name}'s mood patterns, but their journal entries are private to help them feel safe sharing their feelings.</p>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
