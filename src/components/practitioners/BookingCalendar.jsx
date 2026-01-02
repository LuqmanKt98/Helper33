
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export default function BookingCalendar({ practitionerId }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: profile } = useQuery({
    queryKey: ['practitionerProfile', practitionerId],
    queryFn: async () => {
      const profiles = await base44.entities.PractitionerProfile.filter({ id: practitionerId });
      return profiles[0];
    }
  });

  const { data: availability = [], isLoading: loadingAvailability } = useQuery({
    queryKey: ['availability', practitionerId],
    queryFn: () => base44.entities.PractitionerAvailability.filter({ 
      practitioner_id: practitionerId,
      is_available: true
    }),
    initialData: []
  });

  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['appointments', practitionerId, selectedDate],
    queryFn: () => base44.entities.Appointment.filter({ 
      practitioner_id: practitionerId,
      appointment_date: selectedDate
    }),
    initialData: []
  });

  const generateTimeSlots = () => {
    const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = availability.find(a => a.day_of_week === selectedDay);
    
    if (!dayAvailability) return [];

    const slots = [];
    const startMinutes = timeToMinutes(dayAvailability.start_time);
    const endMinutes = timeToMinutes(dayAvailability.end_time);
    const slotDuration = dayAvailability.slot_duration_minutes || 60;
    const buffer = dayAvailability.buffer_minutes || 15;

    let current = startMinutes;
    while (current + slotDuration <= endMinutes) {
      const timeStr = minutesToTime(current);
      const appointment = appointments.find(apt => apt.appointment_time === timeStr);
      
      slots.push({
        time: timeStr,
        status: appointment ? appointment.status : 'available',
        appointment: appointment
      });
      
      current += slotDuration + buffer;
    }

    return slots;
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  if (loadingAvailability || loadingAppointments) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (profile?.scheduling_link) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            External Booking System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <ExternalLink className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">You're using an external scheduling system.</p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
              <a href={profile.scheduling_link} target="_blank" rel="noopener noreferrer">
                View Your Schedule
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeSlots = generateTimeSlots();

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Booking Calendar Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border-2 border-purple-300 rounded-lg px-3 py-2"
          />
        </div>

        {timeSlots.length === 0 ? (
          <div className="text-center py-8 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-800">No availability set for this day</p>
            <p className="text-sm text-gray-600 mt-1">
              Go to Availability tab to set your working hours
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              {timeSlots.length} time slots • {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {timeSlots.map((slot, idx) => (
                <motion.div
                  key={slot.time}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`p-3 rounded-lg border-2 ${
                    slot.status === 'available'
                      ? 'bg-green-50 border-green-300'
                      : slot.status === 'confirmed'
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-orange-50 border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3" />
                    <p className="font-semibold text-sm">{slot.time}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      slot.status === 'available'
                        ? 'bg-green-100 text-green-700 border-green-400'
                        : slot.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-700 border-blue-400'
                        : 'bg-orange-100 text-orange-700 border-orange-400'
                    }`}
                  >
                    {slot.status === 'available' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Open</>
                    ) : slot.status === 'confirmed' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Booked</>
                    ) : (
                      <><Clock className="w-3 h-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                  {slot.appointment && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {slot.appointment.client_name}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-700">
            <strong>💡 This is how clients see your availability.</strong> They can book open slots directly through the app.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
