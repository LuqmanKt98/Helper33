import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return user information for Zapier authentication
    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || user.email,
        role: user.role,
        subscription_tier: user.subscription_tier || 'free'
      },
      app: 'Helper33',
      authenticated: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Zapier auth error:', error);
    return Response.json({ 
      error: error.message || 'Authentication failed',
      authenticated: false
    }, { status: 401 });
  }
});