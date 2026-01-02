import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // CRITICAL: Authenticate user FIRST
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { return_url } = await req.json();
    
    if (!Deno.env.get('STRIPE_SECRET_KEY')) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    let customerId = user.stripe_customer_id;

    // Self-healing: If customer ID is missing on the user record, find it on Stripe via email
    if (!customerId) {
      console.log(`Stripe customer ID missing for user ${user.id}. Searching by email...`);
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log(`Found customer ID: ${customerId}. Updating user record.`);
        // Save the found ID back to the user's profile for future use
        await base44.asServiceRole.entities.User.update(user.id, { stripe_customer_id: customerId });
      } else {
        return new Response(JSON.stringify({ error: 'No active subscription customer found for this email address.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url,
    });

    return Response.json({ url: portalSession.url });

  } catch (error) {
    console.error('Error creating Stripe portal session:', error.message);
    return Response.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
});