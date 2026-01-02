import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toEmail, testType } = await req.json();
    
    const recipientEmail = toEmail || user.email;

    if (!recipientEmail) {
      return Response.json({ 
        success: false,
        error: 'No email address provided' 
      }, { status: 400 });
    }

    // Test email content
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #3b82f6; text-align: center; margin-bottom: 20px;">✅ Email Test Successful!</h1>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hello ${user.full_name},
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            This is a test email from DobryLife to confirm that the email delivery system is working correctly.
          </p>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Test Type:</strong> ${testType || 'General Test'}</p>
            <p style="margin: 5px 0;"><strong>Sent To:</strong> ${recipientEmail}</p>
            <p style="margin: 5px 0;"><strong>Sent At:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>User:</strong> ${user.full_name} (${user.email})</p>
          </div>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            If you received this email, it means your email notifications are working properly!
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 12px; color: #999;">
              Sent from DobryLife Wellness Platform
            </p>
          </div>
        </div>
      </div>
    `;

    console.log('Sending test email to:', recipientEmail);

    const response = await base44.integrations.Core.SendEmail({
      from_name: "DobryLife",
      to: recipientEmail,
      subject: "✅ Test Email from DobryLife",
      body: emailBody
    });

    console.log('Email sent successfully:', response);

    return Response.json({ 
      success: true,
      recipient: recipientEmail,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to send test email',
      details: error.toString()
    }, { status: 200 }); // Return 200 to handle gracefully in UI
  }
});