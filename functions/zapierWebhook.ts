import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, data, webhook_url } = await req.json();

    // Validate required fields
    if (!event_type || !data) {
      return Response.json({ 
        error: 'Missing required fields: event_type and data are required' 
      }, { status: 400 });
    }

    // If webhook_url is provided, send the data
    if (webhook_url) {
      const zapierResponse = await fetch(webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type,
          data,
          user_email: user.email,
          user_name: user.full_name,
          timestamp: new Date().toISOString(),
          app: 'Helper33'
        })
      });

      if (!zapierResponse.ok) {
        return Response.json({
          error: 'Failed to send data to Zapier',
          status: zapierResponse.status
        }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: 'Data sent to Zapier successfully',
        event_type
      });
    }

    // If no webhook_url, just validate the data format
    return Response.json({
      success: true,
      message: 'Webhook data validated',
      event_type,
      data_received: true
    });

  } catch (error) {
    console.error('Zapier webhook error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});