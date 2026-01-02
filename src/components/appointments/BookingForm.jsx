import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Loader2,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { createZoomMeeting } from '@/functions/createZoomMeeting';

export default function BookingForm({ appointmentType, selectedDate, selectedTime, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_notes: ''
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: zoomIntegration } = useQuery({
    queryKey: ['zoomIntegration'],
    queryFn: async () => {
      const integrations = await base44.entities.PlatformIntegration.filter({
        platform_name: 'zoom',
        is_connected: true
      });
      return integrations[0] || null;
    }
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      // Create appointment
      const appointment = await base44.entities.Appointment.create(appointmentData);
      
      // If Zoom is connected, create meeting automatically
      if (zoomIntegration?.is_connected) {
        try {
          const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
          
          const meetingResult = await createZoomMeeting({
            appointmentId: appointment.id,
            title: `${appointmentType.service_name} - ${formData.client_name}`,
            startTime: startDateTime.toISOString(),
            duration: appointmentType.duration_minutes,
            attendeeEmail: formData.client_email,
            attendeeName: formData.client_name
          });

          if (meetingResult.data?.meeting_url) {
            toast.success('📹 Zoom meeting created automatically!');
          }
        } catch (error) {
          console.error('Failed to create Zoom meeting:', error);
          toast.warning('Appointment booked, but Zoom meeting creation failed');
        }
      }

      return appointment;
    },
    onSuccess: (appointment) => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('✅ Appointment booked successfully!');
      if (onSuccess) onSuccess(appointment);
    },
    onError: (error) => {
      toast.error('Failed to book appointment');
      console.error(error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const endTime = new Date(`${selectedDate}T${selectedTime}`);
    endTime.setMinutes(endTime.getMinutes() + appointmentType.duration_minutes);

    const appointmentData = {
      client_name: formData.client_name,
      client_email: formData.client_email,
      client_phone: formData.client_phone || '',
      provider_name: appointmentType.provider_name,
      provider_email: appointmentType.provider_email,
      appointment_type_id: appointmentType.id,
      service_name: appointmentType.service_name,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      end_time: endTime.toTimeString().slice(0, 5),
      duration_minutes: appointmentType.duration_minutes,
      location_type: zoomIntegration?.is_connected ? 'virtual' : appointmentType.location_type,
      client_notes: formData.client_notes,
      status: 'pending',
      price: appointmentType.price || 0
    };

    bookAppointmentMutation.mutate(appointmentData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="border-4 border-purple-300 shadow-2xl bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Complete Your Booking
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Appointment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-purple-200">
            <h3 className="font-bold text-gray-900 mb-3">📋 Appointment Details:</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700"><strong>Service:</strong> {appointmentType.service_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700"><strong>Duration:</strong> {appointmentType.duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-gray-700"><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-gray-700"><strong>Time:</strong> {selectedTime}</span>
              </div>
              {zoomIntegration?.is_connected && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    <strong className="text-blue-600">Zoom meeting will be created automatically</strong> 📹
                  </span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Information */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Full Name *
              </label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="Your full name"
                required
                className="border-2 border-purple-200 focus:border-purple-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="your.email@example.com"
                required
                className="border-2 border-purple-200 focus:border-purple-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                {zoomIntegration?.is_connected 
                  ? '📧 Zoom meeting link will be sent to this email'
                  : '📧 Confirmation will be sent to this email'}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="border-2 border-purple-200 focus:border-purple-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4" />
                Additional Notes
              </label>
              <Textarea
                value={formData.client_notes}
                onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
                placeholder="Tell us what you'd like to discuss or any special requirements..."
                className="h-24 border-2 border-purple-200 focus:border-purple-400"
              />
            </div>

            {/* Zoom Notice */}
            {zoomIntegration?.is_connected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 border-2 border-blue-300"
              >
                <div className="flex items-start gap-3">
                  <Video className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-bold mb-1">📹 Virtual Meeting Ready!</p>
                    <p>A Zoom meeting will be created automatically and the join link will be sent to your email.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-2 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={bookAppointmentMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl"
              >
                {bookAppointmentMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}