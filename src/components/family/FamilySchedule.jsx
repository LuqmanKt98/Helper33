import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import EventModal from './EventModal';
import { toast } from 'sonner';

export default function FamilySchedule() {
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['familyEvents'],
    queryFn: () => base44.entities.FamilyEvent.list(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.FamilyEvent.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyEvents'] });
      toast.success('Event deleted');
    },
  });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const eventsThisWeek = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.filter(event => {
      if (!event?.start_date) return false;
      try {
        const eventDate = parseISO(event.start_date);
        return weekDays.some(day => isSameDay(eventDate, day));
      } catch (e) {
        return false;
      }
    });
  }, [events, weekDays]);

  const getEventsForDay = (day) => {
    if (!eventsThisWeek || eventsThisWeek.length === 0) return [];
    
    return eventsThisWeek.filter(event => {
      if (!event?.start_date) return false;
      try {
        return isSameDay(parseISO(event.start_date), day);
      } catch (e) {
        return false;
      }
    }).sort((a, b) => {
      try {
        return parseISO(a.start_date) - parseISO(b.start_date);
      } catch (e) {
        return 0;
      }
    });
  };

  const handleAddEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const getEventColor = (eventType) => {
    const colors = {
      appointment: 'from-blue-500 to-cyan-500',
      activity: 'from-purple-500 to-pink-500',
      meal: 'from-orange-500 to-amber-500',
      chore: 'from-green-500 to-emerald-500',
      meeting: 'from-indigo-500 to-purple-500',
      celebration: 'from-rose-500 to-pink-500',
      other: 'from-gray-500 to-slate-500'
    };
    return colors[eventType] || colors.other;
  };

  const getMemberColor = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member?.color || '#3b82f6';
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Family Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Week of {format(currentWeekStart, 'MMM d, yyyy')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border-2 rounded-xl p-3 min-h-[200px] ${
                    isToday 
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-400' 
                      : 'bg-white/60 border-gray-200'
                  }`}
                >
                  <div className="text-center mb-3">
                    <p className={`text-xs font-semibold uppercase ${
                      isToday ? 'text-purple-700' : 'text-gray-600'
                    }`}>
                      {format(day, 'EEE')}
                    </p>
                    <p className={`text-2xl font-bold ${
                      isToday ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-2 rounded-lg bg-gradient-to-r ${getEventColor(event.event_type)} text-white text-xs cursor-pointer group relative`}
                        onClick={() => handleEditEvent(event)}
                      >
                        <div className="font-semibold line-clamp-1 mb-1">
                          {event.title}
                        </div>
                        <div className="flex items-center gap-1 text-white/90">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(event.start_date), 'h:mm a')}
                        </div>
                        {event.participants && event.participants.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {event.participants.slice(0, 3).map((pId) => (
                              <div
                                key={pId}
                                className="w-4 h-4 rounded-full border-2 border-white"
                                style={{ backgroundColor: getMemberColor(pId) }}
                                title={getMemberName(pId)}
                              />
                            ))}
                            {event.participants.length > 3 && (
                              <span className="text-white/90 text-xs">+{event.participants.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 rounded p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddEvent(day)}
                    className="w-full mt-2 text-xs text-gray-600 hover:text-purple-600"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          selectedDate={selectedDate}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}