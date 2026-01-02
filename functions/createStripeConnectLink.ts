import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { account_id, return_url, refresh_url } = await req.json();

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account_id,
      refresh_url: refresh_url || `${new URL(req.url).origin}/SellerDashboard`,
      return_url: return_url || `${new URL(req.url).origin}/SellerDashboard?stripe_onboarding=success`,
      type: 'account_onboarding',
    });

    return Response.json({ 
      url: accountLink.url,
      success: true 
    });

  } catch (error) {
    console.error('Error creating Stripe Connect link:', error);
    return Response.json({ 
      error: error.message || 'Failed to create onboarding link' 
    }, { status: 500 });
  }
});