import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all confirmed appointments for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const appointments = await base44.asServiceRole.entities.Appointment.filter({
      status: 'confirmed',
      appointment_date: tomorrowStr
    });

    let sentCount = 0;

    for (const apt of appointments) {
      try {
        // Create notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: apt.client_email,
          title: '📅 Appointment Reminder',
          message: `Your appointment with ${apt.practitioner_name} is tomorrow at ${apt.appointment_time}. Please arrive on time or join your session if it's telehealth.`,
          type: 'appointment_reminder',
          entity_type: 'Appointment',
          entity_id: apt.id,
          is_read: false
        });

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: apt.client_email,
          subject: '📅 Appointment Reminder - Tomorrow',
          body: `Hello ${apt.client_name},\n\nThis is a reminder that you have an appointment with ${apt.practitioner_name} tomorrow (${new Date(apt.appointment_date).toLocaleDateString()}) at ${apt.appointment_time}.\n\nAppointment Type: ${apt.appointment_type}\n\nPlease arrive on time or join your session if it's a telehealth appointment.\n\nBest regards,\nHelper33 Team`
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${apt.id}:`, error);
      }
    }

    return Response.json({ 
      success: true, 
      reminders_sent: sentCount,
      appointments_checked: appointments.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});