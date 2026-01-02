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

    const { seller_id, amount, payout_id } = await req.json();

    // Get seller profile
    const sellerProfiles = await base44.asServiceRole.entities.SellerProfile.filter({ id: seller_id });
    const sellerProfile = sellerProfiles[0];

    if (!sellerProfile) {
      return Response.json({ error: 'Seller not found' }, { status: 404 });
    }

    const stripeAccountId = sellerProfile.payout_information?.stripe_account_id;

    if (!stripeAccountId) {
      return Response.json({ error: 'Stripe account not connected' }, { status: 400 });
    }

    // Create transfer to seller's connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: stripeAccountId,
      description: `Payout for period ending ${new Date().toISOString().split('T')[0]}`,
      metadata: {
        seller_id: seller_id,
        payout_id: payout_id || 'manual'
      }
    });

    // Update payout record
    if (payout_id) {
      await base44.asServiceRole.entities.SellerPayout.update(payout_id, {
        payout_status: 'paid',
        payout_reference: transfer.id,
        paid_at: new Date().toISOString()
      });
    }

    return Response.json({ 
      transfer_id: transfer.id,
      amount: amount,
      success: true,
      message: 'Payout processed successfully'
    });

  } catch (error) {
    console.error('Error processing payout:', error);
    
    // Update payout as failed if payout_id exists
    if (req.json && req.json().payout_id) {
      try {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.entities.SellerPayout.update(req.json().payout_id, {
          payout_status: 'failed',
          hold_reason: error.message
        });
      } catch (updateError) {
        console.error('Error updating failed payout:', updateError);
      }
    }

    return Response.json({ 
      error: error.message || 'Failed to process payout' 
    }, { status: 500 });
  }
});