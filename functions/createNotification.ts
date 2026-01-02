import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      recipient_email,
      type,
      title,
      message,
      action_url,
      action_text,
      priority = 'normal',
      sender_email,
      sender_name,
      sender_avatar,
      icon,
      related_entity_id,
      related_entity_type,
      metadata,
      send_email = true,
      send_push = true
    } = body;

    // Create notification in database
    const notification = await base44.asServiceRole.entities.Notification.create({
      recipient_email,
      type,
      title,
      message,
      action_url,
      action_text,
      priority,
      sender_email: sender_email || user.email,
      sender_name: sender_name || user.full_name,
      sender_avatar,
      icon,
      related_entity_id,
      related_entity_type,
      metadata,
      email_sent: false,
      push_sent: false
    });

    // Get recipient's notification preferences
    const recipients = await base44.asServiceRole.entities.User.filter({ email: recipient_email });
    const recipient = recipients[0];

    // Send email notification if enabled
    if (send_email && recipient?.notification_preferences?.email_notifications !== false) {
      const notifTypeKey = type.replace('_', '');
      const typeEnabled = recipient?.notification_preferences?.[notifTypeKey];
      
      if (typeEnabled !== false) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: recipient_email,
            subject: title,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f97316;">${title}</h2>
                <p style="color: #374151; line-height: 1.6;">${message}</p>
                ${action_url ? `
                  <a href="${action_url}" style="display: inline-block; background: linear-gradient(to right, #f97316, #dc2626); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                    ${action_text || 'View'}
                  </a>
                ` : ''}
                <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                  You're receiving this because you have notifications enabled for ${type.replace(/_/g, ' ')}.
                  <br/>Manage your notification preferences in your account settings.
                </p>
              </div>
            `
          });
          
          await base44.asServiceRole.entities.Notification.update(notification.id, {
            email_sent: true
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }
    }

    // Send push notification if enabled
    if (send_push && recipient?.notification_preferences?.push_notifications !== false) {
      try {
        await base44.asServiceRole.integrations.Core.SendPushNotification({
          user_email: recipient_email,
          title,
          message,
          data: {
            url: action_url,
            notification_id: notification.id
          }
        });
        
        await base44.asServiceRole.entities.Notification.update(notification.id, {
          push_sent: true
        });
      } catch (pushError) {
        console.error('Failed to send push notification:', pushError);
      }
    }

    return Response.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    console.error('Notification creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});