import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths,
  addWeeks,
  isSameMonth, 
  isSameDay,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';

const categoryColors = {
  mindfulness: 'bg-purple-100 text-purple-700 border-purple-300',
  wellness: 'bg-green-100 text-green-700 border-green-300',
  grief_support: 'bg-rose-100 text-rose-700 border-rose-300',
  personal_growth: 'bg-blue-100 text-blue-700 border-blue-300',
  family: 'bg-amber-100 text-amber-700 border-amber-300',
  fitness: 'bg-red-100 text-red-700 border-red-300',
  nutrition: 'bg-lime-100 text-lime-700 border-lime-300',
  mental_health: 'bg-indigo-100 text-indigo-700 border-indigo-300'
};

export default function EventCalendar({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  const { data: myRSVPs = [] } = useQuery({
    queryKey: ['my-event-rsvps'],
    queryFn: () => base44.entities.EventRSVP.filter({}),
  });

  const myRSVPEventIds = new Set(myRSVPs.map(r => r.event_id));

  // Month view helpers
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Week view helpers
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else {
      setCurrentDate(addWeeks(currentDate, -1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return isSameDay(startOfDay(eventDate), startOfDay(day));
    });
  };

  // Render month view
  const renderMonthView = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isPast = isBefore(day, startOfDay(new Date()));

                return (
                  <motion.div
                    key={dayIdx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
                    className={`min-h-24 p-2 rounded-lg border-2 transition-all ${
                      isToday(day)
                        ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-200'
                        : isCurrentMonth
                        ? 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                        : 'bg-gray-50 border-gray-100'
                    } ${isPast && !isToday(day) ? 'opacity-60' : ''}`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday(day) ? 'text-purple-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className={`w-full text-left text-xs px-2 py-1 rounded border ${
                            categoryColors[event.category] || 'bg-gray-100 text-gray-700 border-gray-300'
                          } hover:scale-105 transition-transform truncate`}
                        >
                          <div className="flex items-center gap-1">
                            {myRSVPEventIds.has(event.id) && (
                              <span className="text-green-600">✓</span>
                            )}
                            <span className="truncate">{format(new Date(event.event_date), 'h:mm a')}</span>
                          </div>
                          <div className="truncate font-medium">{event.title}</div>
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const days = [];
    let day = weekStart;
    
    while (day <= weekEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="space-y-3">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isPast = isBefore(day, startOfDay(new Date()));

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`${
                isToday(day) 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400' 
                  : 'bg-white border-gray-200'
              } ${isPast && !isToday(day) ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${
                      isToday(day) ? 'bg-purple-600' : 'bg-gray-200'
                    } flex flex-col items-center justify-center`}>
                      <span className={`text-xs ${isToday(day) ? 'text-white' : 'text-gray-600'}`}>
                        {format(day, 'EEE')}
                      </span>
                      <span className={`text-lg font-bold ${isToday(day) ? 'text-white' : 'text-gray-900'}`}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{format(day, 'EEEE')}</div>
                      <div className="text-sm text-gray-600">{format(day, 'MMMM d, yyyy')}</div>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="outline">{dayEvents.length} events</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dayEvents.length > 0 ? (
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className={`w-full text-left p-3 rounded-lg border-2 ${
                            categoryColors[event.category] || 'bg-gray-100 text-gray-700 border-gray-300'
                          } hover:scale-105 hover:shadow-md transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-semibold text-sm mb-1">{event.title}</div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(event.event_date), 'h:mm a')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {event.current_attendees}
                                </span>
                              </div>
                            </div>
                            {myRSVPEventIds.has(event.id) && (
                              <Badge className="bg-green-600 text-white">Going</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No events scheduled
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={prevPeriod} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={goToToday} variant="outline" size="sm">
            Today
          </Button>
          <Button onClick={nextPeriod} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          {viewMode === 'month' 
            ? format(currentDate, 'MMMM yyyy')
            : `Week of ${format(weekStart, 'MMM d, yyyy')}`
          }
        </h2>

        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 border-2 border-purple-400 rounded"></div>
          <span className="text-xs text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-bold">✓</span>
          <span className="text-xs text-gray-600">RSVP'd</span>
        </div>
      </div>
    </div>
  );
}