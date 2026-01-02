import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    // Verify Stripe is configured first
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl, metadata = {} } = await req.json();

    console.log('Checkout session request:', { priceId, userId: user.id, metadata });

    if (!priceId) {
      return Response.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Fetch price details to determine mode
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
      console.log('Price retrieved:', { id: price.id, type: price.type, amount: price.unit_amount });
    } catch (priceError) {
      console.error('Failed to retrieve price:', priceError);
      return Response.json({ 
        error: `Invalid price ID: ${priceId}. Please contact support.`,
        details: priceError.message 
      }, { status: 400 });
    }
    
    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    // Find or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.full_name,
          metadata: { user_id: user.id }
        });
        customerId = customer.id;
      }
      
      // Save customer ID to user record
      await base44.asServiceRole.entities.User.update(user.id, {
        stripe_customer_id: customerId
      });
    }

    // Determine tier from metadata or price
    const tier = metadata.tier || 'pro';
    const productType = metadata.product_type || (mode === 'subscription' ? 'subscription' : 'one_time');
    
    // Get origin from request or use default
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://helper33.app.base44.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl || `${origin}/Home?payment_success=true&tier=${tier}&type=${productType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/Shop?payment_cancelled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        tier: tier,
        product_type: productType,
        ...metadata
      },
      ...(mode === 'subscription' && {
        subscription_data: {
          metadata: {
            user_id: user.id,
            user_email: user.email,
            tier: tier
          }
        }
      })
    });

    console.log('Checkout session created:', { sessionId: session.id, url: session.url });
    
    return Response.json({ url: session.url, sessionId: session.id, mode });
  } catch (error) {
    console.error('Stripe checkout error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    return Response.json({ 
      error: error.message || 'Failed to create checkout session',
      details: error.type || 'unknown_error'
    }, { status: 500 });
  }
});