import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '4a798c34-90cc-47d2-9c0f-bb350eafb514';
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ONESIGNAL_REST_API_KEY) {
      return Response.json({ 
        success: false,
        error: 'OneSignal not configured' 
      }, { status: 200 });
    }

    const { userId, title, message, data, url, userIds, emails } = await req.json();

    if (!title || !message) {
      return Response.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // Build notification payload
    const notification = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
    };

    // Add optional data
    if (data) {
      notification.data = data;
    }

    if (url) {
      notification.url = url;
    }

    // Target specific users
    if (userId) {
      // Single user by external ID
      notification.include_external_user_ids = [userId];
    } else if (userIds && Array.isArray(userIds)) {
      // Multiple users by external IDs
      notification.include_external_user_ids = userIds;
    } else if (emails && Array.isArray(emails)) {
      // Target by email
      notification.include_email_tokens = emails;
    } else {
      // Get user's player ID from database
      const user = await base44.entities.User.get(currentUser.id);
      if (user.onesignal_player_id) {
        notification.include_player_ids = [user.onesignal_player_id];
      } else {
        return Response.json({ 
          error: 'User does not have OneSignal player ID. Please enable notifications first.' 
        }, { status: 400 });
      }
    }

    // Use correct auth header format
    const authHeader = ONESIGNAL_REST_API_KEY.startsWith('os_v2_')
      ? `Key ${ONESIGNAL_REST_API_KEY}`
      : `Basic ${ONESIGNAL_REST_API_KEY}`;

    // Send notification via OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(notification)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', result);
      return Response.json({ 
        error: 'Failed to send notification',
        details: result 
      }, { status: response.status });
    }

    return Response.json({ 
      success: true,
      notification_id: result.id,
      recipients: result.recipients
    });

  } catch (error) {
    console.error('Error sending OneSignal notification:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});