import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Cron job - no user auth needed
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find completed orders where funds are still in escrow and hold period has passed
    const ordersToRelease = await base44.asServiceRole.entities.MarketplaceOrder.filter({
      order_status: 'completed',
      payment_status: 'held_in_escrow'
    });

    const results = {
      total_checked: ordersToRelease.length,
      released: 0,
      skipped: 0,
      errors: []
    };

    for (const order of ordersToRelease) {
      try {
        const completedDate = new Date(order.delivered_at || order.updated_date);
        
        // Check if 7 days have passed
        if (completedDate > sevenDaysAgo) {
          results.skipped++;
          continue;
        }

        // Release funds from escrow
        await base44.asServiceRole.entities.MarketplaceOrder.update(order.id, {
          payment_status: 'released_to_seller',
          funds_released_at: now.toISOString()
        });

        // Create or update payout record
        const currentDate = new Date();
        const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Check if payout already exists for this period and seller
        const existingPayouts = await base44.asServiceRole.entities.SellerPayout.filter({
          seller_id: order.seller_id,
          payout_period_start: periodStart.toISOString().split('T')[0],
          payout_period_end: periodEnd.toISOString().split('T')[0]
        });

        if (existingPayouts.length > 0) {
          const payout = existingPayouts[0];
          await base44.asServiceRole.entities.SellerPayout.update(payout.id, {
            total_sales_amount: payout.total_sales_amount + order.total_amount,
            platform_fees: payout.platform_fees + order.platform_fee,
            net_payout: payout.net_payout + order.seller_payout,
            order_count: payout.order_count + 1,
            orders_included: [...(payout.orders_included || []), order.id]
          });
        } else {
          await base44.asServiceRole.entities.SellerPayout.create({
            seller_id: order.seller_id,
            seller_name: order.seller_name,
            payout_period_start: periodStart.toISOString().split('T')[0],
            payout_period_end: periodEnd.toISOString().split('T')[0],
            total_sales_amount: order.total_amount,
            platform_fees: order.platform_fee,
            net_payout: order.seller_payout,
            order_count: 1,
            orders_included: [order.id],
            payout_status: 'pending'
          });
        }

        results.released++;

      } catch (error) {
        console.error(`Error releasing funds for order ${order.id}:`, error);
        results.errors.push(`Order ${order.order_number}: ${error.message}`);
      }
    }

    return Response.json({ 
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Error in escrow release:', error);
    return Response.json({ 
      error: error.message || 'Failed to release escrow funds' 
    }, { status: 500 });
  }
});