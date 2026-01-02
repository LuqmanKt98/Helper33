import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  Trophy,
  Award,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function EventCard({ event, myRSVP, onRSVP, isUpcoming = true }) {
  const isGoing = myRSVP?.rsvp_status === 'going';
  const hasAttended = myRSVP?.attended;
  const isLive = event.status === 'live';

  return (
    <Card className={`bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all ${
      isGoing ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-purple-500'
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isLive && (
                <Badge className="bg-red-500 animate-pulse text-white">
                  🔴 LIVE NOW
                </Badge>
              )}
              {hasAttended && (
                <Badge className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Attended
                </Badge>
              )}
              {isGoing && !hasAttended && (
                <Badge className="bg-blue-600">
                  🎫 RSVP'd
                </Badge>
              )}
              <Badge className="bg-purple-600">{event.event_type}</Badge>
              <Badge className="bg-blue-600">{event.category}</Badge>
              {event.is_featured && (
                <Badge className="bg-yellow-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
            
            {/* Gamification Rewards Display */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {event.points_reward > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                  <Trophy className="w-3 h-3 text-yellow-700" />
                  <span className="text-xs font-bold text-yellow-700">
                    {event.points_reward} points
                  </span>
                </div>
              )}
              {event.badge_reward_key && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                  <Award className="w-3 h-3 text-amber-700" />
                  <span className="text-xs font-bold text-amber-700">
                    Badge Unlock
                  </span>
                </div>
              )}
              {!myRSVP && isUpcoming && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
                  <Sparkles className="w-3 h-3 text-blue-700" />
                  <span className="text-xs font-bold text-blue-700">
                    +10pts RSVP bonus
                  </span>
                </div>
              )}
            </div>
            
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
              {event.location_type === 'virtual' && (
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
            </div>
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
          
          {isUpcoming && !myRSVP && (
            <Button
              onClick={() => onRSVP({ eventId: event.id, status: 'going' })}
              className="flex-1 bg-purple-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              RSVP
            </Button>
          )}

          {isLive && isGoing && (
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
}