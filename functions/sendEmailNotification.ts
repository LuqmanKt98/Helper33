import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import sgMail from 'npm:@sendgrid/mail@8.1.1';

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || 'support@dobry.life';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if SendGrid is configured
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid not configured');
      return Response.json({ 
        success: false,
        error: 'Email service is not configured',
        hint: 'Contact admin to enable email notifications'
      }, { status: 200 });
    }

    const { userId, subject, body } = await req.json();

    if (!subject || !body) {
      return Response.json({ 
        success: false,
        error: 'Subject and body are required' 
      }, { status: 400 });
    }

    // Get user's email
    const targetUserId = userId || currentUser.id;
    const targetUser = await base44.asServiceRole.entities.User.get(targetUserId);

    if (!targetUser.email) {
      return Response.json({ 
        success: false,
        error: 'User does not have an email address',
        hint: 'Please add an email address in settings first'
      }, { status: 200 });
    }

    const msg = {
      to: targetUser.email,
      from: {
        email: FROM_EMAIL,
        name: 'DobryLife'
      },
      subject: subject,
      html: body
    };

    await sgMail.send(msg);

    return Response.json({ 
      success: true,
      recipient: targetUser.email
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    let errorMessage = 'Failed to send email';
    let hint = '';
    
    if (error.code === 401 || error.code === 403) {
      errorMessage = 'Invalid SendGrid API key';
      hint = 'Please check SendGrid configuration';
    } else if (error.response?.body?.errors) {
      errorMessage = error.response.body.errors[0]?.message || errorMessage;
    }
    
    return Response.json({ 
      success: false,
      error: errorMessage,
      hint: hint || error.message
    }, { status: 200 });
  }
});