import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Video, MapPin, Users,
  UserCheck, UserX, Loader2, ExternalLink, Bell
} from 'lucide-react';
import { toast } from 'sonner';

export default function UpcomingSessions({ groupId, onScheduleNew }) {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['groupSessions', groupId],
    queryFn: () => base44.entities.StudySession.filter({ group_id: groupId }, '-scheduled_start'),
    initialData: []
  });

  const updateRSVPMutation = useMutation({
    mutationFn: async ({ sessionId, status }) => {
      const session = sessions.find(s => s.id === sessionId);
      const attendeeIndex = session.attendees?.findIndex(a => a.email === user.email);
      
      let updatedAttendees = [...(session.attendees || [])];
      
      if (attendeeIndex >= 0) {
        updatedAttendees[attendeeIndex].rsvp_status = status;
      } else {
        updatedAttendees.push({
          email: user.email,
          name: user.full_name || user.email.split('@')[0],
          rsvp_status: status,
          attended: false
        });
      }

      return await base44.entities.StudySession.update(sessionId, {
        attendees: updatedAttendees
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupSessions'] });
      toast.success('✅ RSVP updated!');
    }
  });

  const upcomingSessions = sessions.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduled_start) > new Date()
  );

  if (isLoading) {
    return (
      <Card className="border-2 border-indigo-200">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading sessions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Upcoming Study Sessions
          </CardTitle>
          <Button
            onClick={onScheduleNew}
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Schedule New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session, idx) => (
              <SessionCard
                key={session.id}
                session={session}
                index={idx}
                currentUserEmail={user?.email}
                onUpdateRSVP={(status) => updateRSVPMutation.mutate({ sessionId: session.id, status })}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SessionCard({ session, index, currentUserEmail, onUpdateRSVP }) {
  const [expanded, setExpanded] = useState(false);
  
  const startDate = new Date(session.scheduled_start);
  const isToday = startDate.toDateString() === new Date().toDateString();
  const isSoon = (startDate - new Date()) < 3600000; // Within 1 hour
  
  const userRSVP = session.attendees?.find(a => a.email === currentUserEmail);
  const goingCount = session.attendees?.filter(a => a.rsvp_status === 'going').length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`border-2 ${isSoon ? 'border-orange-400 bg-orange-50' : 'border-indigo-200 bg-white'} hover:shadow-lg transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isToday && (
                  <Badge className="bg-orange-500 text-white animate-pulse">
                    Today
                  </Badge>
                )}
                {isSoon && (
                  <Badge className="bg-red-500 text-white">
                    <Bell className="w-3 h-3 mr-1 animate-pulse" />
                    Starting Soon!
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{session.session_title}</h3>
              <p className="text-sm text-gray-600 mb-2">{session.description}</p>
              
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {startDate.toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1">
                  {session.session_type === 'virtual' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {session.session_type}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {goingCount} going
                </span>
              </div>
            </div>
          </div>

          {/* RSVP Buttons */}
          <div className="flex gap-2 mb-3">
            <Button
              onClick={() => onUpdateRSVP('going')}
              variant={userRSVP?.rsvp_status === 'going' ? 'default' : 'outline'}
              size="sm"
              className={userRSVP?.rsvp_status === 'going' ? 'bg-green-600 text-white' : 'border-green-300 hover:bg-green-50'}
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Going
            </Button>
            <Button
              onClick={() => onUpdateRSVP('maybe')}
              variant={userRSVP?.rsvp_status === 'maybe' ? 'default' : 'outline'}
              size="sm"
              className={userRSVP?.rsvp_status === 'maybe' ? 'bg-yellow-600 text-white' : 'border-yellow-300 hover:bg-yellow-50'}
            >
              Maybe
            </Button>
            <Button
              onClick={() => onUpdateRSVP('not_going')}
              variant={userRSVP?.rsvp_status === 'not_going' ? 'default' : 'outline'}
              size="sm"
              className={userRSVP?.rsvp_status === 'not_going' ? 'bg-red-600 text-white' : 'border-red-300 hover:bg-red-50'}
            >
              <UserX className="w-3 h-3 mr-1" />
              Can't Go
            </Button>
          </div>

          {/* Meeting Link */}
          {session.meeting_link && userRSVP?.rsvp_status === 'going' && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full border-2 border-blue-300 hover:bg-blue-50 text-blue-600"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Join Meeting
              </Button>
            </a>
          )}

          {/* Topics */}
          {session.topics && session.topics.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Topics:</p>
              <div className="flex flex-wrap gap-1">
                {session.topics.map((topic, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-purple-300">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}