import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@15.12.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try {
        user = await base44.auth.me();
    } catch(e) {
        // User not logged in, can still donate
    }

    const { amount, note, success_url, cancel_url } = await req.json();

    if (!amount || amount < 500) { // Minimum $5 donation
      return new Response(JSON.stringify({ error: 'Donation amount must be at least $5.00.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Donation to The Dobry Foundation',
            description: 'Your contribution supports free grief resources and compassionate AI development.',
            images: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/c76a5b90a_logo-square-transparent.png'],
          },
          unit_amount: amount, // Amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      client_reference_id: user ? user.id : 'anonymous_donation',
      customer_email: user ? user.email : undefined,
      submit_type: 'donate',
      metadata: note ? { dedication_note: note.substring(0, 500) } : undefined, // Add note to metadata if it exists
    });

    return new Response(JSON.stringify({ sessionId: session.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Stripe donation session creation error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});