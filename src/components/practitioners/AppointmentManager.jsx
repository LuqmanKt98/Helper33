
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, X, Video, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AppointmentManager({ practitionerId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['practitionerAppointments', practitionerId],
    queryFn: () => base44.entities.Appointment.filter({ practitioner_id: practitionerId }, '-created_date'),
    initialData: []
  });

  const handleStatusUpdate = async (appointment, newStatus) => {
    try {
      await base44.entities.Appointment.update(appointment.id, { status: newStatus });
      
      // Send notification on confirmation
      if (newStatus === 'confirmed') {
        const practitionerName = user?.full_name || 'Your Practitioner'; // Use user's full_name if available, otherwise a generic name
        
        await base44.entities.Notification.create({
          user_email: appointment.client_email,
          title: '✅ Appointment Confirmed',
          message: `Your appointment with ${practitionerName} on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time} has been confirmed!`,
          type: 'appointment_confirmed',
          entity_type: 'Appointment',
          entity_id: appointment.id,
          is_read: false
        });

        await base44.integrations.Core.SendEmail({
          to: appointment.client_email,
          subject: '✅ Appointment Confirmed',
          body: `Hello ${appointment.client_name},\n\nYour appointment has been confirmed!\n\nPractitioner: ${practitionerName}\nDate: ${new Date(appointment.appointment_date).toLocaleDateString()}\nTime: ${appointment.appointment_time}\nType: ${appointment.appointment_type}\n\nWe look forward to seeing you!\n\nBest regards,\n${practitionerName}`
        });
      }

      queryClient.invalidateQueries(['practitionerAppointments']);
      toast.success(`Appointment ${newStatus}! 📅`);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const completedAppointments = appointments.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status));

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Manage Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-purple-100">
            <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedAppointments.length})</TabsTrigger>
            <TabsTrigger value="completed">Past ({completedAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingAppointments.map((apt, idx) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                index={idx}
                onConfirm={() => handleStatusUpdate(apt, 'confirmed')}
                onCancel={() => handleStatusUpdate(apt, 'cancelled')}
                showActions
              />
            ))}
            {pendingAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending appointments</p>
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-3 mt-4">
            {confirmedAppointments.map((apt, idx) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                index={idx}
                onComplete={() => handleStatusUpdate(apt, 'completed')}
                onNoShow={() => handleStatusUpdate(apt, 'no_show')}
                showComplete
              />
            ))}
            {confirmedAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No confirmed appointments</p>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedAppointments.map((apt, idx) => (
              <AppointmentCard key={apt.id} appointment={apt} index={idx} />
            ))}
            {completedAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No past appointments</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AppointmentCard({ appointment, index, onConfirm, onCancel, onComplete, onNoShow, showActions, showComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-2 border-purple-200 hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold">{appointment.client_name}</h4>
              <p className="text-sm text-gray-600">{appointment.client_email}</p>
              {appointment.client_phone && (
                <p className="text-sm text-gray-600">{appointment.client_phone}</p>
              )}
            </div>
            <Badge className={
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              appointment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }>
              {appointment.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              {new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              {appointment.appointment_time}
            </div>
            <div className="flex items-center gap-2">
              {appointment.appointment_type === 'telehealth' ? (
                <><Video className="w-4 h-4 text-blue-600" /> Telehealth</>
              ) : (
                <><MapPin className="w-4 h-4 text-green-600" /> In-Person</>
              )}
            </div>
          </div>

          {appointment.notes && (
            <div className="text-sm bg-purple-50 p-2 rounded-lg mb-3">
              <p className="font-semibold text-gray-700">Notes:</p>
              <p className="text-gray-600">{appointment.notes}</p>
            </div>
          )}

          {showActions && (
            <div className="flex gap-2">
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                className="flex-1 border-red-300"
              >
                <X className="w-3 h-3 mr-1" />
                Decline
              </Button>
              <Button
                onClick={onConfirm}
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirm
              </Button>
            </div>
          )}

          {showComplete && (
            <div className="flex gap-2">
              <Button
                onClick={onNoShow}
                variant="outline"
                size="sm"
                className="flex-1 border-orange-300"
              >
                No Show
              </Button>
              <Button
                onClick={onComplete}
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Mark Complete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
