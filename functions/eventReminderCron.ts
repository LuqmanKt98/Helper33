import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get events happening in the next 24 hours
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const next1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    const upcomingEvents = await base44.asServiceRole.entities.CommunityEvent.filter({
      status: 'published'
    });

    let remindersSent = 0;

    for (const event of upcomingEvents) {
      const eventDate = new Date(event.event_date);

      // Send 24-hour reminder
      if (!event.reminder_sent_24h && eventDate <= next24Hours && eventDate > now) {
        const rsvps = await base44.asServiceRole.entities.EventRSVP.filter({
          event_id: event.id,
          rsvp_status: 'going',
          reminder_24h_sent: false
        });

        for (const rsvp of rsvps) {
          try {
            await base44.functions.invoke('sendMultiChannelNotification', {
              userEmail: rsvp.created_by,
              title: '📅 Event Tomorrow!',
              body: `${event.title} is happening tomorrow at ${format(eventDate, 'h:mm a')}`,
              url: `/event-detail?id=${event.id}`,
              channels: ['push', 'email']
            });

            await base44.asServiceRole.entities.EventRSVP.update(rsvp.id, {
              reminder_24h_sent: true
            });

            remindersSent++;
          } catch (error) {
            console.error(`Failed to send 24h reminder to ${rsvp.created_by}:`, error);
          }
        }

        await base44.asServiceRole.entities.CommunityEvent.update(event.id, {
          reminder_sent_24h: true
        });
      }

      // Send 1-hour reminder
      if (!event.reminder_sent_1h && eventDate <= next1Hour && eventDate > now) {
        const rsvps = await base44.asServiceRole.entities.EventRSVP.filter({
          event_id: event.id,
          rsvp_status: 'going',
          reminder_1h_sent: false
        });

        for (const rsvp of rsvps) {
          try {
            await base44.functions.invoke('sendMultiChannelNotification', {
              userEmail: rsvp.created_by,
              title: '🔔 Event Starting Soon!',
              body: `${event.title} starts in 1 hour! Get ready to join.`,
              url: `/event-live?id=${event.id}`,
              channels: ['push', 'sms']
            });

            await base44.asServiceRole.entities.EventRSVP.update(rsvp.id, {
              reminder_1h_sent: true
            });

            remindersSent++;
          } catch (error) {
            console.error(`Failed to send 1h reminder to ${rsvp.created_by}:`, error);
          }
        }

        await base44.asServiceRole.entities.CommunityEvent.update(event.id, {
          reminder_sent_1h: true
        });
      }

      // Auto-mark events as completed
      if (event.status === 'published' && eventDate < new Date(now.getTime() - event.duration_minutes * 60 * 1000)) {
        await base44.asServiceRole.entities.CommunityEvent.update(event.id, {
          status: 'completed'
        });
      }
    }

    return Response.json({
      success: true,
      events_checked: upcomingEvents.length,
      reminders_sent: remindersSent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Event reminder cron error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});