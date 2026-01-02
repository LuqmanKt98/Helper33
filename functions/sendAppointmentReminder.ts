import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This can be called by a cron job to send reminders
    const { appointment_id } = await req.json();
    
    if (!appointment_id) {
      return Response.json({ error: 'appointment_id is required' }, { status: 400 });
    }
    
    // Get appointment details
    const appointments = await base44.asServiceRole.entities.Appointment.filter({ id: appointment_id });
    const appointment = appointments[0];
    
    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Check if reminder already sent
    if (appointment.reminder_sent) {
      return Response.json({ message: 'Reminder already sent' });
    }
    
    // Send reminder email
    const reminderSubject = `Reminder: Appointment Tomorrow with ${appointment.practitioner_name}`;
    const reminderBody = `
      <h2>Appointment Reminder</h2>
      <p>Hi ${appointment.client_name || 'there'},</p>
      <p>This is a friendly reminder about your upcoming appointment:</p>
      <ul>
        <li><strong>Date:</strong> ${appointment.appointment_date}</li>
        <li><strong>Time:</strong> ${appointment.appointment_time}</li>
        <li><strong>Practitioner:</strong> ${appointment.practitioner_name}</li>
        <li><strong>Type:</strong> ${appointment.appointment_type}</li>
      </ul>
      ${appointment.appointment_type === 'telehealth' && appointment.session_link ? 
        `<p><a href="${appointment.session_link}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Join Video Call</a></p>` 
        : ''}
      <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
      <p>See you soon!</p>
    `;
    
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: appointment.client_email,
      subject: reminderSubject,
      body: reminderBody
    });
    
    // Update appointment to mark reminder as sent
    await base44.asServiceRole.entities.Appointment.update(appointment_id, {
      reminder_sent: true
    });
    
    return Response.json({ 
      success: true, 
      message: 'Appointment reminder sent successfully' 
    });
    
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});