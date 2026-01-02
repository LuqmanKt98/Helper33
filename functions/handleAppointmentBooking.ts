import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const appointmentData = await req.json();
    
    // Validate required fields
    const requiredFields = ['practitioner_id', 'appointment_date', 'appointment_time'];
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        return Response.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    
    // Get practitioner details
    const practitioners = await base44.entities.PractitionerProfile.filter({ 
      id: appointmentData.practitioner_id 
    });
    const practitioner = practitioners[0];
    
    if (!practitioner) {
      return Response.json({ error: 'Practitioner not found' }, { status: 404 });
    }
    
    // Create appointment
    const appointment = await base44.entities.Appointment.create({
      practitioner_id: appointmentData.practitioner_id,
      practitioner_name: practitioner.full_name,
      client_email: user.email,
      client_name: user.full_name,
      client_phone: appointmentData.client_phone || '',
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      appointment_type: appointmentData.appointment_type || 'telehealth',
      duration_minutes: appointmentData.duration_minutes || 60,
      notes: appointmentData.notes || '',
      status: 'confirmed'
    });
    
    // Send confirmation email to client
    const confirmationSubject = `Appointment Confirmed with ${practitioner.full_name}`;
    const confirmationBody = `
      <h2>Your Appointment is Confirmed!</h2>
      <p>Hi ${user.full_name},</p>
      <p>Your appointment has been successfully scheduled:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <ul style="list-style: none; padding: 0;">
          <li><strong>📅 Date:</strong> ${appointmentData.appointment_date}</li>
          <li><strong>🕐 Time:</strong> ${appointmentData.appointment_time}</li>
          <li><strong>👨‍⚕️ Practitioner:</strong> ${practitioner.full_name}</li>
          <li><strong>📍 Type:</strong> ${appointmentData.appointment_type}</li>
          <li><strong>⏱️ Duration:</strong> ${appointmentData.duration_minutes || 60} minutes</li>
        </ul>
      </div>
      <p>You'll receive a reminder 24 hours before your appointment.</p>
      ${appointmentData.appointment_type === 'telehealth' ? 
        '<p>A video call link will be provided closer to your appointment time.</p>' 
        : ''}
      <p>If you need to reschedule or cancel, please use our AI assistant or contact us directly.</p>
      <p>We look forward to seeing you!</p>
    `;
    
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: confirmationSubject,
      body: confirmationBody
    });
    
    // Send notification to practitioner
    if (practitioner.contact_email) {
      const practitionerSubject = `New Appointment: ${user.full_name}`;
      const practitionerBody = `
        <h2>New Appointment Scheduled</h2>
        <p>Hi ${practitioner.full_name},</p>
        <p>You have a new appointment scheduled:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <ul style="list-style: none; padding: 0;">
            <li><strong>👤 Client:</strong> ${user.full_name}</li>
            <li><strong>📧 Email:</strong> ${user.email}</li>
            <li><strong>📅 Date:</strong> ${appointmentData.appointment_date}</li>
            <li><strong>🕐 Time:</strong> ${appointmentData.appointment_time}</li>
            <li><strong>📍 Type:</strong> ${appointmentData.appointment_type}</li>
            <li><strong>⏱️ Duration:</strong> ${appointmentData.duration_minutes || 60} minutes</li>
          </ul>
        </div>
        ${appointmentData.notes ? `<p><strong>Client Notes:</strong> ${appointmentData.notes}</p>` : ''}
        <p>Please log into Helper33 to manage this appointment.</p>
      `;
      
      await base44.integrations.Core.SendEmail({
        to: practitioner.contact_email,
        subject: practitionerSubject,
        body: practitionerBody
      });
    }
    
    // Mark confirmation as sent
    await base44.entities.Appointment.update(appointment.id, {
      confirmation_sent: true
    });
    
    return Response.json({ 
      success: true, 
      appointment,
      message: 'Appointment booked successfully. Confirmation emails sent.' 
    });
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});