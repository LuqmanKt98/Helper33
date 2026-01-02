import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Users,
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  Trophy,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import PointsNotification from '@/components/gamification/PointsNotification';
import SocialShareModal from '@/components/social/SocialShareModal';

export default function EventLive() {
  const [message, setMessage] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [messagesSent, setMessagesSent] = useState(0);
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

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => base44.entities.CommunityEvent.filter({ id: eventId }).then(events => events[0]),
    enabled: !!eventId
  });

  const { data: myRSVP } = useQuery({
    queryKey: ['my-event-rsvp', eventId],
    queryFn: async () => {
      const rsvps = await base44.entities.EventRSVP.filter({ event_id: eventId });
      return rsvps[0];
    },
    enabled: !!eventId && !!user
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['event-chat', eventId],
    queryFn: () => base44.entities.ChatMessage.filter({ 
      context_id: eventId,
      context_type: 'event'
    }, '-created_date'),
    enabled: !!eventId,
    refetchInterval: 3000
  });

  const { data: attendees = [] } = useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () => base44.entities.EventRSVP.filter({ 
      event_id: eventId,
      attended: true
    }),
    enabled: !!eventId,
    refetchInterval: 10000
  });

  useEffect(() => {
    if (myRSVP?.attended) {
      setHasCheckedIn(true);
    }
  }, [myRSVP]);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!myRSVP) throw new Error('Please RSVP first');

      return base44.entities.EventRSVP.update(myRSVP.id, {
        attended: true,
        attendance_checked_in: new Date().toISOString()
      });
    },
    onSuccess: async () => {
      setHasCheckedIn(true);
      queryClient.invalidateQueries(['my-event-rsvp']);
      queryClient.invalidateQueries(['event-attendees']);
      
      // Award points for attendance
      try {
        const pointsResult = await base44.functions.invoke('awardPoints', {
          activity_type: 'event_attendance',
          activity_data: { 
            event_id: eventId, 
            event_title: event.title,
            points: event.points_reward || 30
          }
        });

        if (pointsResult.data.success) {
          setPointsNotification(pointsResult.data);
          queryClient.invalidateQueries(['user']);
        }
        
        const pointsEarned = pointsResult.data?.points_earned || event.points_reward || 30;
        toast.success(`Checked in! +${pointsEarned} points earned! 🎉`);
      } catch (error) {
        console.error('Error awarding points:', error);
        toast.success('Checked in successfully! 🎉');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to check in');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.ChatMessage.create({
        sender_id: user.id,
        sender_name: user.full_name,
        sender_avatar_url: user.avatar_url,
        content: message,
        message_type: 'text',
        context_id: eventId,
        context_type: 'event'
      });
    },
    onSuccess: async () => {
      setMessage('');
      const newMessageCount = messagesSent + 1;
      setMessagesSent(newMessageCount);
      queryClient.invalidateQueries(['event-chat']);

      // Award points for chat participation (every 5 messages)
      if (newMessageCount % 5 === 0) {
        try {
          const pointsResult = await base44.functions.invoke('awardPoints', {
            activity_type: 'event_chat_message',
            activity_data: {
              event_id: eventId,
              total_messages: newMessageCount
            }
          });

          if (pointsResult.data.success) {
            queryClient.invalidateQueries(['user']);
            toast.success('Active participant! +2 points 💬');
          }
        } catch (error) {
          console.error('Error awarding chat points:', error);
        }
      }
    }
  });

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

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
          activityType="event_attendance"
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

      <div className="max-w-6xl mx-auto">
        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${isLive ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'} text-white`}>
                      {isLive ? '🔴 LIVE NOW' : '⏰ Upcoming'}
                    </Badge>
                    {event.points_reward > 0 && (
                      <Badge className="bg-yellow-400 text-yellow-900">
                        <Trophy className="w-3 h-3 mr-1" />
                        {event.points_reward} points
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl text-white mb-2">
                    {event.title}
                  </CardTitle>
                  <p className="text-purple-100">
                    {format(new Date(event.event_date), 'PPP p')}
                  </p>
                  <p className="text-purple-100 text-sm mt-2">
                    Hosted by {event.host_name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-bold">{attendees.length}</span>
                  </div>
                  <p className="text-xs text-purple-100">attending</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Check-in Section */}
        {!hasCheckedIn && myRSVP && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Ready to Join?
                    </h3>
                    <p className="text-green-100">Check in to confirm your attendance and earn rewards!</p>
                    {event.points_reward > 0 && (
                      <p className="text-sm text-green-100 mt-2">
                        🎁 Earn {event.points_reward} points + bonus rewards
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => checkInMutation.mutate()}
                    disabled={checkInMutation.isPending}
                    size="lg"
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    {checkInMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Check In Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {hasCheckedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <p className="font-bold">You're checked in!</p>
                    <p className="text-sm text-blue-100">Enjoy the event and participate in the chat below</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video/Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Stream/Meeting */}
            {event.meeting_link && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    {isLive ? 'Live Session' : 'Event Meeting'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                    <iframe
                      src={event.meeting_link}
                      className="w-full h-full rounded-lg"
                      allow="camera; microphone; fullscreen"
                    />
                  </div>
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-purple-600">
                      <Video className="w-4 h-4 mr-2" />
                      Open in New Window
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Event Chat */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    Event Chat
                  </div>
                  <Badge variant="outline">
                    {chatMessages.length} messages
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No messages yet. Be the first to say hi! 👋</p>
                      <p className="text-xs mt-2 text-purple-600">💬 Earn +2 points for every 5 messages!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {msg.sender_avatar_url ? (
                            <img src={msg.sender_avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            msg.sender_name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className={`flex-1 ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                          <p className="text-xs font-semibold text-gray-700">{msg.sender_name}</p>
                          <div className={`inline-block p-3 rounded-lg mt-1 ${
                            msg.sender_id === user?.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(msg.created_date), 'h:mm a')}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                {hasCheckedIn ? (
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && message.trim()) {
                          sendMessageMutation.mutate();
                        }
                      }}
                      placeholder="Share your thoughts..."
                      className="flex-1"
                    />
                    <Button
                      onClick={() => sendMessageMutation.mutate()}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-purple-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      Check in to participate in the chat
                    </p>
                  </div>
                )}

                {/* Chat Participation Stats */}
                {messagesSent > 0 && (
                  <div className="mt-3 p-2 bg-purple-50 rounded-lg text-center">
                    <p className="text-xs text-purple-700">
                      💬 You've sent {messagesSent} message{messagesSent > 1 ? 's' : ''}
                      {messagesSent >= 5 && ' - Active Participant! 🌟'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendees List */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Attendees ({attendees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendees.length > 0 ? (
                    attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {attendee.user_avatar ? (
                            <img src={attendee.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            attendee.user_name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{attendee.user_name}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No check-ins yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-600">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{event.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700">{event.points_reward || 30} points reward</span>
                </div>
                {event.badge_reward_key && (
                  <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-800">🏆 Badge Unlock Available</p>
                    <p className="text-xs text-yellow-700">Complete this event to earn a special badge!</p>
                  </div>
                )}
                {event.description && (
                  <div className="pt-3 border-t">
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rewards Info */}
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Trophy className="w-5 h-5" />
                  Earn Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">✅ Check-in</span>
                  <Badge className="bg-yellow-500">+{event.points_reward || 30}pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">💬 Chat (per 5 msgs)</span>
                  <Badge className="bg-green-500">+2pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">⭐ Full Participation</span>
                  <Badge className="bg-purple-500">+50pts</Badge>
                </div>
                {!hasCheckedIn && (
                  <p className="text-xs text-yellow-700 mt-3 pt-3 border-t border-yellow-200">
                    💡 First event? Earn bonus points and unlock special badges!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}