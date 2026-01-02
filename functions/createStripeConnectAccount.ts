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

    const { seller_id, email, business_type = 'individual' } = await req.json();

    // Get seller profile
    const sellerProfiles = await base44.asServiceRole.entities.SellerProfile.filter({ id: seller_id });
    const sellerProfile = sellerProfiles[0];

    if (!sellerProfile) {
      return Response.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    // Check if already has Stripe account
    if (sellerProfile.payout_information?.stripe_account_id) {
      return Response.json({ 
        account_id: sellerProfile.payout_information.stripe_account_id,
        already_exists: true 
      });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      business_type: business_type,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        seller_id: seller_id,
        dobrylife_seller: 'true'
      }
    });

    // Update seller profile with Stripe account ID
    await base44.asServiceRole.entities.SellerProfile.update(seller_id, {
      payout_information: {
        ...sellerProfile.payout_information,
        stripe_account_id: account.id
      }
    });

    return Response.json({ 
      account_id: account.id,
      success: true 
    });

  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return Response.json({ 
      error: error.message || 'Failed to create Connect account' 
    }, { status: 500 });
  }
});