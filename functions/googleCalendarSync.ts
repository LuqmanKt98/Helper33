import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, event_data } = body; // action: 'sync_to_google', 'sync_from_google', 'two_way_sync'

    // Get Google integration
    const integrations = await base44.entities.PlatformIntegration.filter({
      created_by: user.email,
      platform_name: 'google'
    });

    if (integrations.length === 0 || !integrations[0].is_connected) {
      return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    const integration = integrations[0];

    // Refresh token if needed
    let accessToken = integration.access_token;
    if (new Date(integration.token_expires_at) < new Date()) {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token'
        })
      });

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      await base44.entities.PlatformIntegration.update(integration.id, {
        access_token: accessToken,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      });
    }

    if (action === 'sync_to_google' && event_data) {
      // Create event in Google Calendar
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: event_data.title,
          description: event_data.description,
          start: {
            dateTime: event_data.start_date,
            timeZone: 'UTC'
          },
          end: {
            dateTime: event_data.end_date || event_data.start_date,
            timeZone: 'UTC'
          },
          location: event_data.location
        })
      });

      const googleEvent = await calendarResponse.json();

      await base44.entities.PlatformIntegration.update(integration.id, {
        last_sync: new Date().toISOString(),
        sync_status: 'success'
      });

      return Response.json({ 
        success: true, 
        google_event_id: googleEvent.id,
        message: 'Event synced to Google Calendar'
      });
    }

    if (action === 'sync_from_google') {
      // Fetch events from Google Calendar
      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + new Date().toISOString(),
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const calendarData = await calendarResponse.json();
      const events = calendarData.items || [];

      // Create FamilyEvents from Google Calendar events
      const createdEvents = [];
      for (const event of events.slice(0, 10)) { // Limit to 10 for now
        try {
          const familyEvent = await base44.entities.FamilyEvent.create({
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            start_date: event.start?.dateTime || event.start?.date,
            end_date: event.end?.dateTime || event.end?.date,
            location: event.location || '',
            scope: 'private',
            event_type: 'other'
          });
          createdEvents.push(familyEvent);
        } catch (err) {
          console.error('Failed to create event:', err);
        }
      }

      await base44.entities.PlatformIntegration.update(integration.id, {
        last_sync: new Date().toISOString(),
        sync_status: 'success'
      });

      return Response.json({ 
        success: true, 
        events_synced: createdEvents.length,
        message: `${createdEvents.length} events synced from Google Calendar`
      });
    }

    return Response.json({ 
      success: true,
      message: 'Sync complete'
    });
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});