import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { webhook_url, trigger_type, data } = body;

    // Validate required fields
    if (!webhook_url || !trigger_type || !data) {
      return Response.json({ 
        error: 'Missing required fields: webhook_url, trigger_type, and data are required' 
      }, { status: 400 });
    }

    // Prepare the payload for Zapier
    const zapierPayload = {
      trigger_type,
      user: {
        email: user.email,
        name: user.full_name || user.email,
        id: user.id
      },
      data,
      timestamp: new Date().toISOString(),
      app: 'Helper33'
    };

    // Send to Zapier webhook
    const zapierResponse = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zapierPayload)
    });

    if (!zapierResponse.ok) {
      const errorText = await zapierResponse.text();
      return Response.json({
        success: false,
        error: 'Failed to send data to Zapier',
        status: zapierResponse.status,
        details: errorText
      }, { status: 500 });
    }

    const responseData = await zapierResponse.json().catch(() => ({}));

    return Response.json({
      success: true,
      message: 'Data sent to Zapier successfully',
      trigger_type,
      zapier_response: responseData
    });

  } catch (error) {
    console.error('Send to Zapier error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});