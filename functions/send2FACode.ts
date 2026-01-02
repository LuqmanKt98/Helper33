import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { email, method = 'email' } = body;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    // Get or create 2FA record
    const existing = await base44.asServiceRole.entities.TwoFactorAuth.filter({ user_email: email });
    
    let twoFARecord;
    if (existing.length > 0) {
      twoFARecord = await base44.asServiceRole.entities.TwoFactorAuth.update(existing[0].id, {
        pending_code: code,
        code_expires_at: expiresAt
      });
    } else {
      twoFARecord = await base44.asServiceRole.entities.TwoFactorAuth.create({
        user_email: email,
        is_enabled: false,
        method,
        pending_code: code,
        code_expires_at: expiresAt
      });
    }

    // Send code via chosen method
    if (method === 'email') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Your Helper33 Verification Code',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f97316;">Your Verification Code</h2>
            <p style="font-size: 16px; color: #374151;">Enter this code to verify your identity:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });
    } else if (method === 'sms' && twoFARecord.phone_number) {
      // Send SMS via Twilio
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('To', twoFARecord.phone_number);
      formData.append('From', twilioPhone);
      formData.append('Body', `Your Helper33 verification code is: ${code}. Valid for 5 minutes.`);

      await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
    }

    return Response.json({ 
      success: true,
      message: `Verification code sent via ${method}`
    });
  } catch (error) {
    console.error('2FA code generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});