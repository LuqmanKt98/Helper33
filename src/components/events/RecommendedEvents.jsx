
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users, ArrowRight, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';
import { useTranslation } from '@/components/Translations';

const categoryColors = {
  mindfulness: 'from-purple-500 to-indigo-500',
  wellness: 'from-green-500 to-emerald-500',
  grief_support: 'from-rose-500 to-pink-500',
  personal_growth: 'from-blue-500 to-cyan-500',
  family: 'from-amber-500 to-orange-500',
  fitness: 'from-red-500 to-pink-500',
  nutrition: 'from-lime-500 to-green-500',
  mental_health: 'from-indigo-500 to-purple-500'
};

export default function RecommendedEvents({ limit = 3 }) {
  const { user } = useAuth();
  const { t } = useTranslation(user);

  const { data: recommendedEvents = [], isLoading } = useQuery({
    queryKey: ['recommended-events', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's interests from various sources
      const userInterests = new Set();

      try {
        // From wellness entries (last 10)
        const { data: wellnessEntries } = await supabase
          .from('wellness_entries')
          .select('meditation_minutes, exercise_minutes')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (wellnessEntries) {
          wellnessEntries.forEach(entry => {
            if (entry.meditation_minutes > 0) userInterests.add('mindfulness');
            if (entry.exercise_minutes > 0) userInterests.add('fitness');
          });
        }

        // From journal entries (last 10)
        const { data: journalEntries } = await supabase
          .from('journal_entries')
          .select('journal_type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (journalEntries) {
          if (journalEntries.some(e => e.journal_type === 'heart_shift')) {
            userInterests.add('grief_support');
          }
        }

        // From completed challenges
        const { data: completedChallenges } = await supabase
          .from('challenge_participants')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (completedChallenges && completedChallenges.length > 0) {
          userInterests.add('wellness');
          userInterests.add('personal_growth');
        }

        // From past RSVPs
        const { data: pastRSVPs } = await supabase
          .from('event_rsvps')
          .select('event_id')
          .eq('user_id', user.id);

        const pastEventIds = pastRSVPs?.map(r => r.event_id) || [];

        if (pastEventIds.length > 0) {
          const { data: pastEvents } = await supabase
            .from('community_events')
            .select('category')
            .in('id', pastEventIds);

          pastEvents?.forEach(e => userInterests.add(e.category));
        }

        // Get all upcoming published events
        const now = new Date().toISOString();
        const { data: allEvents } = await supabase
          .from('community_events')
          .select('*')
          .eq('status', 'published')
          .gt('event_date', now);

        if (!allEvents) return [];

        // Score events based on user interests
        const scoredEvents = allEvents.map(event => {
          let score = 0;

          // Match category to interests
          if (userInterests.has(event.category)) score += 10;

          // Boost featured events
          if (event.is_featured) score += 5;

          // Boost events with rewards
          if (event.points_reward > 0) score += 3;
          if (event.badge_reward_key) score += 3;

          // Prefer events happening soon
          const eventDate = new Date(event.event_date);
          const daysUntil = (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          if (daysUntil <= 7) score += 5;
          if (daysUntil <= 3) score += 3;

          // Prefer events with good attendance
          if (event.current_attendees > 10) score += 2;

          // Boost if has capacity
          if (event.capacity === 0 || event.current_attendees < event.capacity) score += 2;

          return { ...event, recommendationScore: score };
        });

        // Sort by score and return top recommendations
        return scoredEvents
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, limit);

      } catch (error) {
        console.error("Error fetching recommended events:", error);
        return [];
      }
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (recommendedEvents.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-300 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          {t('dashboard.recommendedForYou')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendedEvents.map((event, idx) => {
            const eventDate = new Date(event.event_date);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white hover:shadow-lg transition-all border-2 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${categoryColors[event.category] || 'from-gray-500 to-gray-600'} flex items-center justify-center flex-shrink-0`}>
                        <Calendar className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{event.title}</h4>
                          {event.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`bg-gradient-to-r ${categoryColors[event.category] || 'from-gray-500 to-gray-600'} text-white text-xs`}>
                            {event.category.replace('_', ' ')}
                          </Badge>

                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            {isToday(eventDate) ? 'Today' : isTomorrow(eventDate) ? 'Tomorrow' : format(eventDate, 'MMM d')}
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            {event.current_attendees}
                          </div>

                          {event.points_reward > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{event.points_reward} pts
                            </Badge>
                          )}
                        </div>

                        <Link to={createPageUrl('EventDetail') + `?id=${event.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            View Event
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Link to={createPageUrl('Events')}>
          <Button variant="ghost" className="w-full mt-4 text-purple-600 hover:text-purple-700">
            {t('dashboard.browseAllEvents')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
