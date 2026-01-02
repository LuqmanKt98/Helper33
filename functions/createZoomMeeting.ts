import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, title, startTime, duration, attendeeEmail, attendeeName } = await req.json();

    if (!appointmentId || !title || !startTime || !duration) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's Zoom access token from PlatformIntegration
    const integrations = await base44.entities.PlatformIntegration.filter({
      created_by: user.email,
      platform_name: 'zoom',
      is_connected: true
    });

    if (!integrations || integrations.length === 0) {
      return Response.json({ 
        error: 'Zoom not connected',
        message: 'Please connect your Zoom account in Settings > Integrations'
      }, { status: 400 });
    }

    const zoomIntegration = integrations[0];
    let accessToken = zoomIntegration.access_token;

    // Check if token needs refresh
    if (new Date(zoomIntegration.token_expires_at) <= new Date()) {
      // Refresh the token
      const refreshResponse = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${Deno.env.get('ZOOM_CLIENT_ID')}:${Deno.env.get('ZOOM_CLIENT_SECRET')}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: zoomIntegration.refresh_token
        })
      });

      if (!refreshResponse.ok) {
        return Response.json({ error: 'Failed to refresh Zoom token' }, { status: 500 });
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update stored tokens
      await base44.entities.PlatformIntegration.update(zoomIntegration.id, {
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token || zoomIntegration.refresh_token,
        token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
      });
    }

    // Create Zoom meeting
    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: title,
        type: 2, // Scheduled meeting
        start_time: new Date(startTime).toISOString(),
        duration: duration,
        timezone: 'America/New_York',
        agenda: `Consultation appointment with ${attendeeName || attendeeEmail}`,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0, // Automatically approve
          audio: 'both',
          auto_recording: 'none',
          waiting_room: true
        }
      })
    });

    if (!meetingResponse.ok) {
      const errorData = await meetingResponse.json();
      console.error('Zoom API error:', errorData);
      return Response.json({ 
        error: 'Failed to create Zoom meeting',
        details: errorData
      }, { status: 500 });
    }

    const meetingData = await meetingResponse.json();

    // Update appointment with Zoom link
    if (appointmentId) {
      await base44.entities.Appointment.update(appointmentId, {
        meeting_link: meetingData.join_url,
        location_type: 'virtual'
      });
    }

    return Response.json({
      success: true,
      meeting_url: meetingData.join_url,
      meeting_id: meetingData.id,
      start_url: meetingData.start_url,
      password: meetingData.password
    });

  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
});