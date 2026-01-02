import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

    if (!code) {
      // Step 1: Redirect to Google OAuth
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=google_calendar_auth`;

      return Response.redirect(authUrl, 302);
    }

    // Step 2: Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get tokens');
    }

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const userInfo = await userInfoResponse.json();

    // Create Base44 client from request
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      const appOrigin = url.origin;
      return Response.redirect(`${appOrigin}/#/Home?error=unauthorized`, 302);
    }

    // Store integration
    const existingIntegrations = await base44.entities.PlatformIntegration.filter({
      created_by: currentUser.email,
      platform_name: 'google'
    });

    if (existingIntegrations.length > 0) {
      await base44.entities.PlatformIntegration.update(existingIntegrations[0].id, {
        is_connected: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        platform_user_id: userInfo.id,
        platform_email: userInfo.email,
        platform_username: userInfo.name,
        platform_avatar_url: userInfo.picture,
        last_sync: new Date().toISOString(),
        sync_status: 'success',
        connection_quality: 'excellent',
        last_health_check: new Date().toISOString()
      });
    } else {
      await base44.entities.PlatformIntegration.create({
        platform_name: 'google',
        platform_display_name: 'Google Calendar',
        is_connected: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        platform_user_id: userInfo.id,
        platform_email: userInfo.email,
        platform_username: userInfo.name,
        platform_avatar_url: userInfo.picture,
        connection_scope: ['calendar', 'userinfo'],
        last_sync: new Date().toISOString(),
        sync_status: 'success',
        features_enabled: ['calendar_sync', 'task_sync'],
        sync_settings: {
          auto_sync_enabled: true,
          sync_frequency: 'daily',
          sync_tasks_to_calendar: true,
          sync_events_from_calendar: true
        },
        connection_quality: 'excellent',
        last_health_check: new Date().toISOString()
      });
    }

    // Redirect back to integrations page
    const appOrigin = url.origin;
    return Response.redirect(`${appOrigin}/#/IntegrationsHub?success=google`, 302);
  } catch (error) {
    console.error('Google auth error:', error);
    const url = new URL(req.url);
    const appOrigin = url.origin;
    return Response.redirect(`${appOrigin}/#/IntegrationsHub?error=${encodeURIComponent(error.message)}`, 302);
  }
});