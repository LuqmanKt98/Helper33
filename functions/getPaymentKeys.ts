Deno.serve((_req) => {
  try {
    const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
    
    console.log('getPaymentKeys called');
    console.log('STRIPE_PUBLISHABLE_KEY exists:', !!publishableKey);
    
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Stripe publishable key is not configured. Please contact support.',
          details: 'Missing STRIPE_PUBLISHABLE_KEY environment variable'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log first few characters for debugging (safely)
    console.log('Key starts with:', publishableKey.substring(0, 7));

    return new Response(
      JSON.stringify({ 
        stripePublishableKey: publishableKey,
        publishableKey: publishableKey // Include both for compatibility
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in getPaymentKeys:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to retrieve payment configuration',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});