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

    const { account_id } = await req.json();

    // Get account details
    const account = await stripe.accounts.retrieve(account_id);

    // Get balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: account_id
    });

    return Response.json({ 
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
        business_profile: account.business_profile,
        email: account.email
      },
      balance: {
        available: balance.available,
        pending: balance.pending
      },
      success: true 
    });

  } catch (error) {
    console.error('Error getting Stripe account status:', error);
    return Response.json({ 
      error: error.message || 'Failed to get account status' 
    }, { status: 500 });
  }
});