import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return Response.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    // Get appointment details
    const appointments = await base44.entities.Appointment.filter({ id: appointmentId });
    const appointment = appointments[0];

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Format date and time nicely
    const aptDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const formattedDate = aptDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = aptDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    // Create confirmation message
    const confirmationMessage = `
✅ Appointment Confirmed!

Service: ${appointment.service_name}
Provider: ${appointment.provider_name}
Date: ${formattedDate}
Time: ${formattedTime}
Duration: ${appointment.duration_minutes} minutes
Location: ${appointment.location_type === 'virtual' ? 'Virtual Meeting' : appointment.location_type === 'phone' ? 'Phone Call' : 'In Person'}
${appointment.meeting_link ? '\nJoin Link: ' + appointment.meeting_link : ''}
${appointment.location_address ? '\nAddress: ' + appointment.location_address : ''}

${appointment.preparation_notes ? '\n📝 Please prepare: ' + appointment.preparation_notes : ''}

You'll receive reminders:
• 24 hours before your appointment
• 1 hour before your appointment

To reschedule or cancel, please contact us at least 24 hours in advance.

Looking forward to seeing you!
    `.trim();

    // Send multi-channel notification
    await base44.functions.invoke('sendMultiChannelNotification', {
      user_email: appointment.client_email,
      title: '✅ Appointment Confirmed',
      message: confirmationMessage,
      priority: 'normal',
      action_url: '/AppointmentScheduler'
    });

    // Update appointment
    await base44.entities.Appointment.update(appointmentId, {
      confirmation_sent: true,
      confirmation_sent_at: new Date().toISOString(),
      status: 'confirmed'
    });

    return Response.json({
      success: true,
      message: 'Confirmation sent successfully'
    });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});