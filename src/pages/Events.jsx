
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Video,
  CheckCircle,
  BookmarkPlus,
  Bookmark,
  Trophy,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EventCalendar from '@/components/events/EventCalendar';
import RecommendedEvents from '@/components/events/RecommendedEvents';
import PointsNotification from '@/components/gamification/PointsNotification';
import SocialShareModal from '@/components/social/SocialShareModal';
import SEO from '@/components/SEO';

export default function Events() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [pointsNotification, setPointsNotification] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['community-events'],
    queryFn: () => base44.entities.CommunityEvent.filter({
      status: { $in: ['published', 'live'] }
    }, '-event_date')
  });

  const { data: myRSVPs = [] } = useQuery({
    queryKey: ['my-event-rsvps'],
    queryFn: () => base44.entities.EventRSVP.filter({}),
    enabled: !!user
  });

  const { data: savedEvents = [] } = useQuery({
    queryKey: ['saved-events'],
    queryFn: () => base44.entities.SavedEvent.filter({}),
    enabled: !!user
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }) => {
      const existingRSVP = myRSVPs.find(r => r.event_id === eventId);

      if (existingRSVP) {
        if (status === 'not_going') {
          await base44.entities.EventRSVP.delete(existingRSVP.id);
          return { action: 'deleted' };
        }
        return base44.entities.EventRSVP.update(existingRSVP.id, {
          rsvp_status: status
        });
      }

      const event = allEvents.find(e => e.id === eventId);
      const eventDate = new Date(event.event_date);
      const daysUntilEvent = Math.floor((eventDate - new Date()) / (1000 * 60 * 60 * 24));
      
      const rsvp = await base44.entities.EventRSVP.create({
        event_id: eventId,
        user_name: user.full_name,
        user_avatar: user.avatar_url,
        rsvp_status: status
      });

      // Award points for RSVP
      if (status === 'going') {
        try {
          const pointsResult = await base44.functions.invoke('awardPoints', {
            activity_type: 'event_rsvp',
            activity_data: {
              event_id: eventId,
              event_title: event.title,
              days_until_event: daysUntilEvent
            }
          });

          if (pointsResult.data.success) {
            setPointsNotification(pointsResult.data);
            queryClient.invalidateQueries(['user']);
          }
        } catch (error) {
          console.error('Error awarding RSVP points:', error);
        }
      }

      return rsvp;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['my-event-rsvps']);
      queryClient.invalidateQueries(['community-events']);
      
      if (data?.action === 'deleted' || variables.status === 'not_going') {
        toast.success('RSVP removed');
      } else if (variables.status === 'going') {
        toast.success('RSVP confirmed! You\'re going! 🎉');
      } else {
        toast.success('Marked as maybe');
      }
    }
  });

  const saveEventMutation = useMutation({
    mutationFn: async (eventId) => {
      const existingSave = savedEvents.find(s => s.event_id === eventId);
      
      if (existingSave) {
        await base44.entities.SavedEvent.delete(existingSave.id);
        return { action: 'removed' };
      }

      const event = allEvents.find(e => e.id === eventId);
      return base44.entities.SavedEvent.create({
        event_id: eventId,
        event_title: event.title,
        event_date: event.event_date,
        event_category: event.category
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['saved-events']);
      toast.success(data.action === 'removed' ? 'Event removed from saved' : 'Event saved! 📌');
    }
  });

  const upcomingEvents = allEvents.filter(e => new Date(e.event_date) > new Date());
  const pastEvents = allEvents.filter(e => new Date(e.event_date) <= new Date());
  const myRSVPEvents = allEvents.filter(e => myRSVPs.some(r => r.event_id === e.id && r.rsvp_status === 'going'));

  const stats = user?.gamification_stats || {};

  return (
    <>
      <SEO 
        title="Community Events - DobryLife | Wellness Workshops & Group Activities"
        description="Join live community events including guided meditations, wellness workshops, expert Q&As, and group challenges. Connect with others and grow together."
        keywords="wellness events, meditation workshops, mental health events, community activities, wellness webinars, group meditation, expert wellness talks"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        {/* Points Notification */}
        {pointsNotification && (
          <PointsNotification
            points={pointsNotification.points_earned}
            breakdown={pointsNotification.breakdown}
            leveledUp={pointsNotification.leveled_up}
            newLevel={pointsNotification.new_level}
            achievements={pointsNotification.achievements_earned}
            perfectDay={pointsNotification.perfect_day}
            activityType="event_rsvp"
            onClose={() => setPointsNotification(null)}
            onShare={(data) => {
              setShareData(data);
              setShareModalOpen(true);
            }}
          />
        )}

        {/* Social Share Modal */}
        <SocialShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareType={shareData?.type}
          shareData={shareData}
        />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-block mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                <Calendar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Community Events
            </h1>
            <p className="text-gray-600 text-lg">Join live sessions, workshops, and wellness activities</p>
          </motion.div>

          {/* Event Gamification Stats */}
          {(stats.events_attended > 0 || stats.events_rsvp_count > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8" />
                      <div>
                        <h3 className="text-xl font-bold">Your Event Journey</h3>
                        <p className="text-sm text-purple-100">Participation earns points & badges</p>
                      </div>
                    </div>
                    <Link to={createPageUrl('GamificationDashboard')}>
                      <Button variant="secondary" size="sm">
                        <Trophy className="w-4 h-4 mr-2" />
                        View All Rewards
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="text-2xl mb-1">🎫</div>
                      <div className="text-2xl font-bold">{stats.events_rsvp_count || 0}</div>
                      <div className="text-xs text-white/80">RSVPs</div>
                    </div>
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="text-2xl mb-1">✅</div>
                      <div className="text-2xl font-bold">{stats.events_attended || 0}</div>
                      <div className="text-xs text-white/80">Attended</div>
                    </div>
                    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="text-2xl mb-1">💬</div>
                      <div className="text-2xl font-bold">{stats.event_chat_messages || 0}</div>
                      <div className="text-xs text-white/80">Messages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Rewards Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 mb-2">How to Earn Points & Badges</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500 text-white">+10</Badge>
                        <span className="text-gray-700">RSVP to event</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 text-white">+30</Badge>
                        <span className="text-gray-700">Check in live</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500 text-white">+2</Badge>
                        <span className="text-gray-700">Chat (per 5 msgs)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500 text-white">+50</Badge>
                        <span className="text-gray-700">Full participation</span>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">
                      🏆 Unlock special badges: Event Explorer, Early Bird, Community Champion & more!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="upcoming">
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="my-events">
                <CheckCircle className="w-4 h-4 mr-2" />
                My RSVPs ({myRSVPEvents.length})
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="past">
                Past Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <RecommendedEvents />
              
              <div className="mt-8 grid gap-6">
                {upcomingEvents.map((event, idx) => {
                  const myRSVP = myRSVPs.find(r => r.event_id === event.id);
                  const isSaved = savedEvents.some(s => s.event_id === event.id);
                  const isGoing = myRSVP?.rsvp_status === 'going';

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all border-l-4 border-l-purple-500">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className="bg-purple-600">
                                  {event.event_type}
                                </Badge>
                                <Badge className="bg-blue-600">
                                  {event.category}
                                </Badge>
                                {event.is_featured && (
                                  <Badge className="bg-yellow-500">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                {event.points_reward > 0 && (
                                  <Badge className="bg-green-600">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    {event.points_reward} pts
                                  </Badge>
                                )}
                                {event.badge_reward_key && (
                                  <Badge className="bg-amber-600">
                                    🏆 Badge Unlock
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-2xl text-gray-900 mb-2">
                                {event.title}
                              </CardTitle>
                              <p className="text-gray-600 mb-3">{event.description}</p>
                              
                              <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-600" />
                                  <span>{format(new Date(event.event_date), 'PPP p')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-purple-600" />
                                  <span>{event.duration_minutes} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-purple-600" />
                                  <span>Hosted by {event.host_name}</span>
                                </div>
                                {event.location_type === 'virtual' && event.meeting_link && (
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 text-purple-600" />
                                    <span>Virtual Event</span>
                                  </div>
                                )}
                                {event.location_type === 'in_person' && event.physical_location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-600" />
                                    <span>{event.physical_location}</span>
                                  </div>
                                )}
                                {event.current_attendees > 0 && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold text-green-600">
                                      {event.current_attendees} attending
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => saveEventMutation.mutate(event.id)}
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                            >
                              {isSaved ? (
                                <Bookmark className="w-5 h-5 text-purple-600 fill-purple-600" />
                              ) : (
                                <BookmarkPlus className="w-5 h-5 text-gray-600" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-3">
                            <Link to={createPageUrl('EventDetail') + `?id=${event.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                View Details
                              </Button>
                            </Link>
                            
                            {!myRSVP ? (
                              <Button
                                onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'going' })}
                                disabled={rsvpMutation.isPending}
                                className="flex-1 bg-purple-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                RSVP - Going
                              </Button>
                            ) : (
                              <div className="flex-1 flex gap-2">
                                <Button
                                  variant={isGoing ? "default" : "outline"}
                                  onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'going' })}
                                  className={`flex-1 ${isGoing ? 'bg-green-600' : ''}`}
                                  size="sm"
                                >
                                  Going
                                </Button>
                                <Button
                                  variant={myRSVP.rsvp_status === 'maybe' ? "default" : "outline"}
                                  onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'maybe' })}
                                  className={`flex-1 ${myRSVP.rsvp_status === 'maybe' ? 'bg-yellow-600' : ''}`}
                                  size="sm"
                                >
                                  Maybe
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'not_going' })}
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {upcomingEvents.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No Upcoming Events
                      </h3>
                      <p className="text-gray-600">
                        Check back soon for new community events!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-events">
              <div className="grid gap-6">
                {myRSVPEvents.map((event) => {
                  const myRSVP = myRSVPs.find(r => r.event_id === event.id);
                  const hasAttended = myRSVP?.attended;

                  return (
                    <Card key={event.id} className="bg-white/80 backdrop-blur-sm border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={hasAttended ? 'bg-green-600' : 'bg-blue-600'}>
                                {hasAttended ? '✅ Attended' : '🎫 Going'}
                              </Badge>
                              {event.points_reward > 0 && (
                                <Badge className="bg-yellow-600">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {event.points_reward} pts
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{event.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-2">
                              {format(new Date(event.event_date), 'PPP p')}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-3">
                          <Link to={createPageUrl('EventDetail') + `?id=${event.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          {event.status === 'live' && (
                            <Link to={createPageUrl('EventLive') + `?id=${event.id}`} className="flex-1">
                              <Button className="w-full bg-red-600 animate-pulse">
                                <Video className="w-4 h-4 mr-2" />
                                Join Live
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {myRSVPEvents.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No RSVPs Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Browse upcoming events and RSVP to start earning points!
                      </p>
                      <Button
                        onClick={() => setActiveTab('upcoming')}
                        className="bg-purple-600"
                      >
                        Browse Events
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <EventCalendar events={allEvents} myRSVPs={myRSVPs} />
            </TabsContent>

            <TabsContent value="past">
              <div className="grid gap-6">
                {pastEvents.map((event) => {
                  const myRSVP = myRSVPs.find(r => r.event_id === event.id);
                  const hasAttended = myRSVP?.attended;

                  return (
                    <Card key={event.id} className="bg-white/80 backdrop-blur-sm opacity-75">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Past Event</Badge>
                          {hasAttended && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              You Attended
                            </Badge>
                          )}
                        </div>
                        <CardTitle>{event.title}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.event_date), 'PPP')}
                        </p>
                      </CardHeader>
                      {event.session_recording_url && (
                        <CardContent>
                          <a href={event.session_recording_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full">
                              <Video className="w-4 h-4 mr-2" />
                              Watch Recording
                            </Button>
                          </a>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}

                {pastEvents.length === 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No Past Events
                      </h3>
                      <p className="text-gray-600">
                        Past events will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
