import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, Video, MapPin, Mail, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function AppointmentConfirmation({ appointment, onClose }) {
  const handleAddToCalendar = () => {
    const { appointment_date, appointment_time, duration_minutes, practitioner_name, notes } = appointment;
    
    const startDate = new Date(`${appointment_date}T${appointment_time}`);
    const endDate = new Date(startDate.getTime() + (duration_minutes || 60) * 60000);
    
    const title = `Appointment with ${practitioner_name}`;
    const description = notes || 'Appointment session';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="max-w-2xl w-full shadow-2xl border-4 border-green-300 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-2" />
          </motion.div>
          <CardTitle className="text-2xl">Appointment Confirmed!</CardTitle>
          <p className="text-green-100 text-sm mt-2">
            Your appointment has been successfully scheduled
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Appointment Details */}
          <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-md space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-b-2 border-green-200 pb-2">
              Appointment Details
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">
                    {format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold text-gray-800">
                    {appointment.appointment_time} ({appointment.duration_minutes || 60} minutes)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                {appointment.appointment_type === 'telehealth' ? (
                  <Video className="w-5 h-5 text-green-600 mt-1" />
                ) : (
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {appointment.appointment_type}
                  </p>
                  {appointment.appointment_type === 'telehealth' && (
                    <p className="text-xs text-green-600 mt-1">
                      📹 Video link will be sent via email before your appointment
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Practitioner</p>
                  <p className="font-semibold text-gray-800">{appointment.practitioner_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              What Happens Next?
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Confirmation email sent to {appointment.client_email}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>You'll receive a reminder 24 hours before your appointment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Video link will be provided for telehealth appointments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>You can reschedule or cancel anytime via the AI assistant</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddToCalendar}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-green-300 hover:bg-green-50"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}