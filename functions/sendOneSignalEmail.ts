import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '4a4cec27-b1fb-488c-9ebe-59b041079c9c';
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY') || 'igg3qwlcnu4uelwzh6xosfozc';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, subject, body, emails } = await req.json();

    if (!subject || !body) {
      return Response.json({ 
        success: false,
        error: 'Subject and body are required' 
      }, { status: 400 });
    }

    if (!email && (!emails || !Array.isArray(emails))) {
      return Response.json({ 
        success: false,
        error: 'Email or emails array is required' 
      }, { status: 400 });
    }

    // Build email notification payload for OneSignal
    const notification = {
      app_id: ONESIGNAL_APP_ID,
      email_subject: subject,
      email_body: body,
      include_email_tokens: emails || [email]
    };

    // Send email via OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(notification)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', result);
      return Response.json({ 
        success: false,
        error: 'Failed to send email via OneSignal',
        details: result.errors || result 
      }, { status: 200 }); // Return 200 to handle gracefully
    }

    return Response.json({ 
      success: true,
      notification_id: result.id,
      recipients: result.recipients
    });

  } catch (error) {
    console.error('Error sending OneSignal email:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 200 }); // Return 200 to handle gracefully
  }
});