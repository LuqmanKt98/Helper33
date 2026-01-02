import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@15.12.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000'; // Fallback for local dev

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { price_id } = await req.json();

    if (!price_id) {
      return new Response(JSON.stringify({ error: 'Missing price_id' }), { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) {
        return new Response(JSON.stringify({ error: 'User must be logged in to subscribe' }), { status: 401 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: user.stripe_customer_id, // Use existing customer ID if available
      customer_email: !user.stripe_customer_id ? user.email : undefined, // Or create new customer with email
      line_items: [{ price: price_id, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { 
        kind: 'subscription',
        user_id: user.id
      },
      success_url: `${APP_BASE_URL}${createPageUrl('Account')}?subscription=success`,
      cancel_url: `${APP_BASE_URL}${createPageUrl('subscribe')}?canceled=true`,
    });

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error("Unable to create subscription session:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});