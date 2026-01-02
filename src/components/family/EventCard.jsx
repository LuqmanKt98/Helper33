import React from 'react';
import { Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EVENT_COLORS = {
  appointment: 'bg-blue-500 border-blue-600',
  activity: 'bg-green-500 border-green-600',
  meal: 'bg-orange-500 border-orange-600',
  chore: 'bg-purple-500 border-purple-600',
  meeting: 'bg-red-500 border-red-600',
  celebration: 'bg-pink-500 border-pink-600',
  other: 'bg-gray-500 border-gray-600'
};

export default function EventCard({ event, onClick, compact = false, familyMembers = [] }) {
    const startTime = new Date(event.start_date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
    });
    
    const endTime = event.end_date ? new Date(event.end_date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
    }) : null;

    // Get participant details
    const participants = event.participants ? 
        familyMembers.filter(m => event.participants.includes(m.id)) : [];

    if (compact) {
        return (
            <div 
                onClick={onClick}
                className={`${EVENT_COLORS[event.event_type]} text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity border-l-4`}
            >
                <div className="font-medium truncate">{event.title}</div>
                <div className="flex items-center gap-1 text-[10px] opacity-90">
                    <Clock className="w-2.5 h-2.5" />
                    {startTime}
                    {participants.length > 0 && (
                        <span className="ml-1 flex items-center gap-0.5">
                            {participants.slice(0, 3).map(p => p.emoji || '👤').join('')}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={onClick}
            className={`${EVENT_COLORS[event.event_type]} text-white p-3 rounded-lg cursor-pointer hover:opacity-90 transition-all hover:shadow-lg border-l-4`}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm">{event.title}</h4>
                <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
                    {event.event_type}
                </Badge>
            </div>
            
            {event.description && (
                <p className="text-xs opacity-90 mb-2 line-clamp-2">{event.description}</p>
            )}

            <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{startTime}{endTime && ` - ${endTime}`}</span>
                </div>
                
                {event.location && (
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                    </div>
                )}
                
                {participants.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        <div className="flex items-center gap-1">
                            {participants.map((p, idx) => (
                                <div 
                                    key={idx}
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                    style={{ backgroundColor: `${p.color}40`, color: p.color }}
                                    title={p.name}
                                >
                                    {p.emoji || p.name.charAt(0)}
                                </div>
                            ))}
                            {participants.length > 3 && (
                                <span className="text-[10px] opacity-75 ml-1">
                                    +{participants.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}