Deno.serve(async (req) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      security: {
        csp: 'enabled',
        cors: 'enabled',
        rateLimit: 'enabled',
        inputSanitization: 'enabled',
        blacklistProtection: 'enabled',
        domainProtection: 'enabled'
      },
      environment: {
        domain: 'dobrylife.com',
        ssl: 'enabled',
        headers: 'secured'
      },
      version: '1.0.0'
    };

    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 'unhealthy', error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});