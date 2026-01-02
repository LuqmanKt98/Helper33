import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    const clientId = Deno.env.get('ZOOM_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');
    const redirectUri = Deno.env.get('ZOOM_REDIRECT_URI');

    if (!code) {
      // Step 1: Redirect to Zoom OAuth
      const authUrl = `https://zoom.us/oauth/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}`;

      return Response.redirect(authUrl, 302);
    }

    // Step 2: Exchange code for tokens
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get Zoom tokens');
    }

    // Get Zoom user info
    const userInfoResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const zoomUser = await userInfoResponse.json();

    // Create Base44 client
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      const appOrigin = url.origin;
      return Response.redirect(`${appOrigin}/#/Home?error=unauthorized`, 302);
    }

    // Store integration
    const existingIntegrations = await base44.entities.PlatformIntegration.filter({
      created_by: currentUser.email,
      platform_name: 'zoom'
    });

    if (existingIntegrations.length > 0) {
      await base44.entities.PlatformIntegration.update(existingIntegrations[0].id, {
        is_connected: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        platform_user_id: zoomUser.id,
        platform_email: zoomUser.email,
        platform_username: zoomUser.first_name + ' ' + zoomUser.last_name,
        platform_avatar_url: zoomUser.pic_url,
        last_sync: new Date().toISOString(),
        sync_status: 'success',
        connection_quality: 'excellent',
        last_health_check: new Date().toISOString()
      });
    } else {
      await base44.entities.PlatformIntegration.create({
        platform_name: 'zoom',
        platform_display_name: 'Zoom',
        is_connected: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        platform_user_id: zoomUser.id,
        platform_email: zoomUser.email,
        platform_username: zoomUser.first_name + ' ' + zoomUser.last_name,
        platform_avatar_url: zoomUser.pic_url,
        connection_scope: ['meeting:write', 'meeting:read'],
        last_sync: new Date().toISOString(),
        sync_status: 'success',
        features_enabled: ['video_calls', 'meeting_scheduling'],
        connection_quality: 'excellent',
        last_health_check: new Date().toISOString()
      });
    }

    const appOrigin = url.origin;
    return Response.redirect(`${appOrigin}/#/IntegrationsHub?success=zoom`, 302);
  } catch (error) {
    console.error('Zoom auth error:', error);
    const url = new URL(req.url);
    const appOrigin = url.origin;
    return Response.redirect(`${appOrigin}/#/IntegrationsHub?error=${encodeURIComponent(error.message)}`, 302);
  }
});