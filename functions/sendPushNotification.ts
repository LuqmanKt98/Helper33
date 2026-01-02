import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import webpush from 'npm:web-push';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BEl62iUYgUivxIkbtas6ssbtKLispob5Rh8ZlsgyJHimBDSTdhmYTckIXO3-8YGE3x3qYQhN5wvdMCyWkZI5Qkc';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'your-private-key-here';

webpush.setVapidDetails(
  'mailto:support@helper33.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // For webhook or admin use - verify service role or admin
    const user = await base44.auth.me().catch(() => null);
    
    const body = await req.json();
    const { user_email, title, message, body: notifBody, url, tag, icon, requireInteraction } = body;

    if (!user_email || (!message && !notifBody)) {
      return Response.json({
        error: 'Missing required fields: user_email and message/body'
      }, { status: 400 });
    }

    // Get user's active push subscriptions
    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({
      created_by: user_email,
      is_active: true
    });

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json({
        success: false,
        message: 'No active push subscriptions for user',
        user_email
      });
    }

    const payload = JSON.stringify({
      title: title || 'Helper33',
      body: notifBody || message,
      icon: icon || '/logo192.png',
      badge: '/badge-72x72.png',
      url: url || '/dashboard',
      tag: tag || 'notification',
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    });

    const results = [];
    let successCount = 0;

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.subscription_endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);

        await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
          last_sent_at: new Date().toISOString(),
          last_send_status: 'success'
        });

        successCount++;
        results.push({ subscription_id: sub.id, status: 'success' });

      } catch (error) {
        console.error('Push send failed:', error);
        
        if (error.statusCode === 410 || error.statusCode === 404) {
          await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
            is_active: false,
            last_send_status: 'expired'
          });
        } else {
          await base44.asServiceRole.entities.PushSubscription.update(sub.id, {
            last_send_status: `error_${error.statusCode}`
          });
        }

        results.push({ 
          subscription_id: sub.id, 
          status: 'failed',
          error: error.message 
        });
      }
    }

    return Response.json({
      success: true,
      message: `Sent to ${successCount}/${subscriptions.length} device(s)`,
      results
    });

  } catch (error) {
    console.error('Send push error:', error);
    return Response.json({
      error: error.message
    }, { status: 500 });
  }
});