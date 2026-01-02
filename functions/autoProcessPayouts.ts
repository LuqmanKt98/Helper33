import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is a cron job, no user authentication needed
    // Get all pending payouts
    const pendingPayouts = await base44.asServiceRole.entities.SellerPayout.filter({
      payout_status: 'pending'
    });

    const results = {
      total: pendingPayouts.length,
      processed: 0,
      failed: 0,
      errors: []
    };

    for (const payout of pendingPayouts) {
      try {
        // Get seller profile
        const sellerProfiles = await base44.asServiceRole.entities.SellerProfile.filter({ 
          id: payout.seller_id 
        });
        const sellerProfile = sellerProfiles[0];

        if (!sellerProfile) {
          results.failed++;
          results.errors.push(`Seller ${payout.seller_id} not found`);
          continue;
        }

        const stripeAccountId = sellerProfile.payout_information?.stripe_account_id;

        if (!stripeAccountId) {
          results.failed++;
          results.errors.push(`Seller ${payout.seller_name} has no Stripe account`);
          continue;
        }

        // Check if account is ready for payouts
        const account = await stripe.accounts.retrieve(stripeAccountId);
        
        if (!account.payouts_enabled) {
          await base44.asServiceRole.entities.SellerPayout.update(payout.id, {
            payout_status: 'on_hold',
            hold_reason: 'Stripe account not fully verified'
          });
          results.failed++;
          continue;
        }

        // Get commission settings
        const commissionSettings = await base44.asServiceRole.entities.CommissionSettings.filter({
          seller_id: payout.seller_id
        });
        const settings = commissionSettings[0];

        // Check minimum payout threshold
        const minThreshold = settings?.minimum_payout_threshold || 50;
        if (payout.net_payout < minThreshold) {
          await base44.asServiceRole.entities.SellerPayout.update(payout.id, {
            payout_status: 'on_hold',
            hold_reason: `Minimum payout threshold not met ($${minThreshold})`
          });
          continue;
        }

        // Process the transfer
        const transfer = await stripe.transfers.create({
          amount: Math.round(payout.net_payout * 100),
          currency: 'usd',
          destination: stripeAccountId,
          description: `Payout for ${payout.payout_period_start} to ${payout.payout_period_end}`,
          metadata: {
            seller_id: payout.seller_id,
            payout_id: payout.id
          }
        });

        // Update payout record
        await base44.asServiceRole.entities.SellerPayout.update(payout.id, {
          payout_status: 'paid',
          payout_method: 'stripe_transfer',
          payout_reference: transfer.id,
          paid_at: new Date().toISOString()
        });

        // Send notification to seller
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sellerProfile.contact_email,
          subject: 'Payout Processed - DobryLife Marketplace',
          body: `
            Hi ${payout.seller_name},
            
            Great news! Your payout of $${payout.net_payout.toFixed(2)} has been processed.
            
            Period: ${payout.payout_period_start} to ${payout.payout_period_end}
            Orders included: ${payout.order_count}
            
            The funds should arrive in your bank account within 2-5 business days.
            
            Thank you for being part of DobryLife Marketplace!
            
            Best regards,
            DobryLife Team
          `
        });

        results.processed++;

      } catch (error) {
        console.error(`Error processing payout ${payout.id}:`, error);
        results.failed++;
        results.errors.push(`Payout ${payout.id}: ${error.message}`);
        
        // Mark as failed
        await base44.asServiceRole.entities.SellerPayout.update(payout.id, {
          payout_status: 'failed',
          hold_reason: error.message
        });
      }
    }

    return Response.json({ 
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Error in auto payout processing:', error);
    return Response.json({ 
      error: error.message || 'Failed to process payouts' 
    }, { status: 500 });
  }
});