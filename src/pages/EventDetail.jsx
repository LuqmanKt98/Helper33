import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle,
  Trophy,
  Award,
  Sparkles,
  Download,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PointsNotification from '@/components/gamification/PointsNotification';
import SocialShareModal from '@/components/social/SocialShareModal';

export default function EventDetail() {
  const [pointsNotification, setPointsNotification] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.CommunityEvent.filter({ id: eventId });
      return events[0];
    },
    enabled: !!eventId
  });

  const { data: rsvps = [] } = useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: () => base44.entities.EventRSVP.filter({ event_id: eventId }),
    enabled: !!eventId
  });

  const { data: myRSVP } = useQuery({
    queryKey: ['my-rsvp', eventId],
    queryFn: async () => {
      const myRsvps = await base44.entities.EventRSVP.filter({ event_id: eventId });
      return myRsvps[0];
    },
    enabled: !!eventId && !!user
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status) => {
      if (myRSVP) {
        if (status === 'not_going') {
          await base44.entities.EventRSVP.delete(myRSVP.id);
          return { action: 'deleted' };
        }
        return base44.entities.EventRSVP.update(myRSVP.id, {
          rsvp_status: status
        });
      }

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
    onSuccess: (data) => {
      queryClient.invalidateQueries(['event-rsvps']);
      queryClient.invalidateQueries(['my-rsvp']);
      queryClient.invalidateQueries(['community-events']);
      
      if (data?.action === 'deleted') {
        toast.success('RSVP removed');
      } else {
        toast.success('RSVP updated! ✨');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">This event doesn't exist or has been removed.</p>
            <Link to={createPageUrl('Events')}>
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const goingCount = rsvps.filter(r => r.rsvp_status === 'going').length;
  const isGoing = myRSVP?.rsvp_status === 'going';
  const isLive = event.status === 'live';

  return (
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

      <div className="max-w-4xl mx-auto">
        {/* Event Header with Gamification */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`${isLive ? 'bg-red-500 animate-pulse' : 'bg-purple-800'} text-white`}>
                  {isLive ? '🔴 LIVE NOW' : event.status}
                </Badge>
                <Badge className="bg-white/20 text-white">
                  {event.category}
                </Badge>
                {event.is_featured && (
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-3xl mb-4">{event.title}</CardTitle>
              
              {/* Gamification Rewards Preview */}
              <div className="flex items-center gap-4 flex-wrap">
                {event.points_reward > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/20 backdrop-blur-sm rounded-full border border-yellow-300">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <span className="font-bold">{event.points_reward} Points</span>
                  </div>
                )}
                {event.badge_reward_key && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/20 backdrop-blur-sm rounded-full border border-amber-300">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span className="font-bold">Badge Unlock</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-400/20 backdrop-blur-sm rounded-full border border-green-300">
                  <Sparkles className="w-4 h-4 text-green-300" />
                  <span className="text-sm">Bonuses Available</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* RSVP Action Card */}
        {!myRSVP && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Join This Event</h3>
                    <p className="text-green-100">RSVP now and start earning rewards!</p>
                    <p className="text-sm text-green-100 mt-2">
                      🎁 +10 points for RSVP + Early Bird bonus if 7+ days away
                    </p>
                  </div>
                  <Button
                    onClick={() => rsvpMutation.mutate('going')}
                    disabled={rsvpMutation.isPending}
                    size="lg"
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    RSVP - I'm Going
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isGoing && isLive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Event is Live Now!
                    </h3>
                    <p className="text-red-100">Join now to check in and earn your rewards</p>
                  </div>
                  <Link to={createPageUrl('EventLive') + `?id=${eventId}`}>
                    <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
                      <Video className="w-5 h-5 mr-2" />
                      Join Live Session
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Description */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>

                {event.requirements && event.requirements.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">What You'll Need:</h4>
                    <ul className="space-y-1">
                      {event.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {event.materials && event.materials.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Event Materials</h4>
                    <div className="space-y-2">
                      {event.materials.map((material, idx) => (
                        <a
                          key={idx}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                        >
                          <Download className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900">{material.title}</p>
                            <p className="text-xs text-gray-600">{material.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>About the Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {event.host_avatar ? (
                      <img src={event.host_avatar} alt={event.host_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      event.host_name?.charAt(0) || 'H'
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{event.host_name}</h3>
                    <p className="text-gray-600">{event.host_bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-600">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold text-gray-900">
                      {format(new Date(event.event_date), 'PPP')}
                    </p>
                    <p className="text-sm text-gray-700">
                      {format(new Date(event.event_date), 'p')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{event.duration_minutes} minutes</p>
                  </div>
                </div>

                {event.location_type === 'virtual' && (
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">Virtual Event</p>
                    </div>
                  </div>
                )}

                {event.location_type === 'in_person' && event.physical_location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{event.physical_location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Attending</p>
                    <p className="font-semibold text-gray-900">{goingCount} {goingCount === 1 ? 'person' : 'people'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Trophy className="w-5 h-5" />
                  Earn Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">🎫 RSVP</span>
                  <Badge className="bg-blue-500">+10pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">🐦 Early Bird (7+ days)</span>
                  <Badge className="bg-cyan-500">+5pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">✅ Check-in</span>
                  <Badge className="bg-green-500">+{event.points_reward || 30}pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">💬 Chat (per 5)</span>
                  <Badge className="bg-purple-500">+2pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">⭐ Full Event</span>
                  <Badge className="bg-orange-500">+50pts</Badge>
                </div>

                {event.badge_reward_key && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <p className="text-xs font-bold text-amber-900 mb-1">🏆 BADGE UNLOCK</p>
                      <p className="text-xs text-amber-800">Complete this event to earn a special badge!</p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-yellow-700 mt-4 pt-4 border-t border-yellow-200">
                  💡 First-time bonuses and milestone rewards available!
                </p>
              </CardContent>
            </Card>

            {/* RSVP Actions */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {!myRSVP ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => rsvpMutation.mutate('going')}
                      disabled={rsvpMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      I'm Going
                    </Button>
                    <Button
                      onClick={() => rsvpMutation.mutate('maybe')}
                      disabled={rsvpMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      Maybe
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="font-semibold text-green-900">
                        You're {myRSVP.rsvp_status === 'going' ? 'Going' : 'Interested'}!
                      </p>
                    </div>

                    {isLive && (
                      <Link to={createPageUrl('EventLive') + `?id=${eventId}`}>
                        <Button className="w-full bg-red-600 hover:bg-red-700 animate-pulse">
                          <Video className="w-5 h-5 mr-2" />
                          Join Live Now
                        </Button>
                      </Link>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => rsvpMutation.mutate(isGoing ? 'maybe' : 'going')}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        {isGoing ? 'Change to Maybe' : 'Change to Going'}
                      </Button>
                      <Button
                        onClick={() => rsvpMutation.mutate('not_going')}
                        variant="outline"
                        size="sm"
                      >
                        Cancel RSVP
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendees Preview */}
            {goingCount > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-purple-600" />
                    {goingCount} Attending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2">
                    {rsvps.filter(r => r.rsvp_status === 'going').slice(0, 5).map((rsvp) => (
                      <div
                        key={rsvp.id}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white"
                      >
                        {rsvp.user_avatar ? (
                          <img src={rsvp.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          rsvp.user_name?.charAt(0) || 'U'
                        )}
                      </div>
                    ))}
                    {goingCount > 5 && (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs border-2 border-white">
                        +{goingCount - 5}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}