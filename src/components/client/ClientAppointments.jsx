import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientAppointments({ appointments, user }) {
  const upcomingAppointments = appointments.filter(a => 
    ['pending', 'confirmed'].includes(a.status) && 
    new Date(a.appointment_date) >= new Date()
  ).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

  const pastAppointments = appointments.filter(a => 
    new Date(a.appointment_date) < new Date() || 
    ['completed', 'cancelled', 'no_show'].includes(a.status)
  ).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

  return (
    <div className="space-y-6">
      <Card className="bg-yellow-50 border-2 border-yellow-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Appointment Reminder</p>
              <p>These appointments are scheduled through Helper33's directory. Please contact your practitioner directly if you need to reschedule or have questions about your treatment.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((apt, idx) => (
                <AppointmentCard key={apt.id} appointment={apt} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No upcoming appointments</p>
              <Link to={createPageUrl('FindPractitioners')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Find Practitioners
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Appointment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length > 0 ? (
            <div className="space-y-3">
              {pastAppointments.map((apt, idx) => (
                <AppointmentCard key={apt.id} appointment={apt} index={idx} isPast />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No appointment history</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppointmentCard({ appointment, index, isPast = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`border-2 ${isPast ? 'border-gray-200 opacity-75' : 'border-purple-300'} hover:shadow-lg transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold text-lg">{appointment.practitioner_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  appointment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {appointment.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {appointment.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-medium">
                {new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              {appointment.appointment_time}
              {appointment.duration_minutes && ` (${appointment.duration_minutes} min)`}
            </div>
            <div className="flex items-center gap-2">
              {appointment.appointment_type === 'telehealth' ? (
                <>
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Telehealth Session</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>In-Person Visit</span>
                </>
              )}
            </div>
          </div>

          {appointment.notes && (
            <div className="text-sm bg-purple-50 p-3 rounded-lg mb-3">
              <p className="font-semibold text-gray-700 mb-1">Your Notes:</p>
              <p className="text-gray-600">{appointment.notes}</p>
            </div>
          )}

          {!isPast && appointment.status === 'confirmed' && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-green-700 mb-1">✓ Confirmed</p>
              <p className="text-gray-600">Your appointment is confirmed. Please arrive on time or join the session link if telehealth.</p>
            </div>
          )}

          {!isPast && appointment.status === 'pending' && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-orange-700 mb-1">⏳ Awaiting Confirmation</p>
              <p className="text-gray-600">Your practitioner will confirm this appointment soon.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}