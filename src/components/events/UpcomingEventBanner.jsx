
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { useTranslation } from '@/components/Translations';

export default function UpcomingEventBanner() {
  const { user } = useAuth();
  const { t } = useTranslation(user);

  const { data: myUpcomingEvents = [] } = useQuery({
    queryKey: ['my-upcoming-events', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Step 1: Get my RSVPs
        const { data: myRSVPs } = await supabase
          .from('event_rsvps')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('rsvp_status', 'going');

        if (!myRSVPs || myRSVPs.length === 0) return [];

        const eventIds = myRSVPs.map(r => r.event_id);
        const now = new Date().toISOString();

        // Step 2: Get the actual events that are upcoming
        const { data: events } = await supabase
          .from('community_events')
          .select('*')
          .in('id', eventIds)
          .eq('status', 'published')
          .gt('event_date', now)
          .order('event_date', { ascending: true })
          .limit(1);

        return events || [];
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        return [];
      }
    },
    enabled: !!user
  });

  if (myUpcomingEvents.length === 0) return null;

  const nextEvent = myUpcomingEvents[0];
  const eventDate = new Date(nextEvent.event_date);
  const hoursUntil = differenceInHours(eventDate, new Date());
  const minutesUntil = differenceInMinutes(eventDate, new Date());

  const isStartingSoon = hoursUntil < 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={`bg-gradient-to-r ${isStartingSoon
          ? 'from-orange-500 to-red-500 animate-pulse'
          : 'from-purple-500 to-pink-500'
        } text-white border-0 shadow-2xl`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bell className="w-8 h-8" />
              </motion.div>
              <div>
                <p className="text-sm text-purple-100 mb-1">
                  {isStartingSoon ? '🔴 ' + t('dashboard.liveSoon') : t('dashboard.upcomingEventBanner')}
                </p>
                <h3 className="font-bold text-lg mb-1">{nextEvent.title}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isStartingSoon
                      ? `${t('dashboard.startsIn')} ${minutesUntil} ${t('dashboard.minutes')}`
                      : `${t('dashboard.inHours')} ${hoursUntil} ${t('dashboard.hours')}`
                    }
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(eventDate, 'h:mm a')}
                  </span>
                </div>
              </div>
            </div>
            <Link to={createPageUrl(isStartingSoon ? 'EventLive' : 'EventDetail') + `?id=${nextEvent.id}`}>
              <Button
                variant="secondary"
                className="gap-2"
              >
                {isStartingSoon ? t('dashboard.joinNow') : t('dashboard.viewEvent')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
