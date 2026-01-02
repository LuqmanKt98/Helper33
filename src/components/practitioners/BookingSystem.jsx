
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Video, 
  MapPin, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function BookingSystem({ practitioner }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState('telehealth');
  const [clientNotes, setClientNotes] = useState('');
  const [step, setStep] = useState('slots'); // 'slots' or 'confirm'
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['availability', practitioner.id],
    queryFn: () => base44.entities.PractitionerAvailability.filter({ 
      practitioner_id: practitioner.id,
      is_available: true
    }),
    initialData: []
  });

  const { data: bookedAppointments = [] } = useQuery({
    queryKey: ['bookedSlots', practitioner.id, selectedDate],
    queryFn: () => base44.entities.Appointment.filter({ 
      practitioner_id: practitioner.id,
      appointment_date: selectedDate,
      status: { $in: ['pending', 'confirmed'] }
    }),
    initialData: []
  });

  const bookMutation = useMutation({
    mutationFn: async (appointmentData) => {
      return await base44.entities.Appointment.create(appointmentData);
    },
    onSuccess: async (appointment) => {
      queryClient.invalidateQueries(['bookedSlots']);
      
      // Send notification to practitioner
      await base44.entities.Notification.create({
        user_email: practitioner.created_by,
        title: '📅 New Appointment Request',
        message: `${user.full_name || user.email} has requested an appointment on ${selectedDate} at ${selectedSlot}`,
        type: 'new_appointment',
        entity_type: 'Appointment',
        entity_id: appointment.id,
        is_read: false
      });

      toast.success('Appointment requested! The practitioner will confirm shortly. 🎉');
      setStep('slots');
      setSelectedSlot(null);
      setClientNotes('');
    },
    onError: () => {
      toast.error('Failed to book appointment');
    }
  });

  const handleBook = () => {
    if (!user) {
      toast.error('Please log in to book an appointment');
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    bookMutation.mutate({
      practitioner_id: practitioner.id,
      practitioner_name: practitioner.full_name,
      client_email: user.email,
      client_name: user.full_name || user.email,
      client_phone: user.phone_number || '',
      appointment_date: selectedDate,
      appointment_time: selectedSlot,
      appointment_type: appointmentType,
      notes: clientNotes,
      status: 'pending'
    });
  };

  // If practitioner has external scheduling link
  if (practitioner.scheduling_link) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Book an Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ExternalLink className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Book via {practitioner.full_name}'s Scheduler</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Click below to view availability and book your appointment using their preferred scheduling system.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              <a href={practitioner.scheduling_link} target="_blank" rel="noopener noreferrer">
                <Calendar className="w-4 h-4 mr-2" />
                Open Scheduling Link
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Manual booking system
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
      const isBooked = bookedAppointments.some(apt => apt.appointment_time === timeStr);
      
      if (!isBooked) {
        slots.push(timeStr);
      }
      
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

  const availableSlots = generateTimeSlots();

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
    setSelectedSlot(null);
  };

  const goToPrevDay = () => {
    const currentDate = new Date(selectedDate);
    const today = new Date().toISOString().split('T')[0];
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = currentDate.toISOString().split('T')[0];
    if (newDate >= today) {
      setSelectedDate(newDate);
      setSelectedSlot(null);
    }
  };

  if (step === 'confirm') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirm Your Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Practitioner</p>
                <p className="font-bold text-lg">{practitioner.full_name}</p>
                <p className="text-sm text-gray-600">{practitioner.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    {selectedSlot}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Session Type</p>
                <div className="flex gap-2">
                  {practitioner.accepts_telehealth && (
                    <Button
                      variant={appointmentType === 'telehealth' ? 'default' : 'outline'}
                      onClick={() => setAppointmentType('telehealth')}
                      className={appointmentType === 'telehealth' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-2 border-purple-300'}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Telehealth
                    </Button>
                  )}
                  {practitioner.accepts_in_person && (
                    <Button
                      variant={appointmentType === 'in_person' ? 'default' : 'outline'}
                      onClick={() => setAppointmentType('in_person')}
                      className={appointmentType === 'in_person' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-2 border-purple-300'}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      In-Person
                    </Button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-purple-200">
                <label className="text-sm text-gray-600 mb-2 block">Notes (optional)</label>
                <Textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="What brings you to therapy? Any specific concerns?"
                  rows={3}
                  className="border-2 border-purple-300"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('slots')}
                className="flex-1 border-2 border-purple-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleBook}
                disabled={bookMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selector */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Choose a Date</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevDay}
                disabled={selectedDate <= new Date().toISOString().split('T')[0]}
                className="border-2 border-purple-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="border-2 border-purple-300 text-center font-semibold"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextDay}
                className="border-2 border-purple-300"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Time Slots */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Available Time Slots</label>
            {availableSlots.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-purple-200">
                <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No availability on this day</p>
                <p className="text-sm text-gray-500">Try selecting a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence>
                  {availableSlots.map((slot, idx) => (
                    <motion.button
                      key={slot}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSlot === slot
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-lg'
                          : 'bg-white border-purple-300 hover:border-purple-500 hover:shadow-md'
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      <p className="font-semibold text-sm">{slot}</p>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Session Type Options */}
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6 border-t border-purple-200"
            >
              <label className="text-sm font-semibold mb-3 block">Session Type</label>
              <div className="flex gap-3">
                {practitioner.accepts_telehealth && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAppointmentType('telehealth')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      appointmentType === 'telehealth'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg'
                        : 'bg-white border-purple-300 hover:border-blue-400'
                    }`}
                  >
                    <Video className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Telehealth</p>
                    <p className="text-xs opacity-80 mt-1">Video session</p>
                  </motion.button>
                )}
                {practitioner.accepts_in_person && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAppointmentType('in_person')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      appointmentType === 'in_person'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg'
                        : 'bg-white border-purple-300 hover:border-purple-400'
                    }`}
                  >
                    <MapPin className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold text-sm">In-Person</p>
                    <p className="text-xs opacity-80 mt-1">Office visit</p>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Next Button */}
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={() => setStep('confirm')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                Continue to Booking
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
