import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const SPECIAL_PROMO_CODES = {
  'RUBYFAM45': {
    planToGrant: 'executive_yearly',
    description: 'Family special - Executive Yearly access'
  },
  '34XFLZB6': {
    discount: 0.5, // 50% off
    description: 'Halloween Special - 50% off everything',
    validUntil: new Date('2024-11-01T23:59:59Z') // Valid through Halloween
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const { promoCode } = await req.json();

    if (!promoCode) {
      return new Response(JSON.stringify({ error: 'Promo code is required.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const normalizedCode = promoCode.trim().toUpperCase();
    const promoConfig = SPECIAL_PROMO_CODES[normalizedCode];

    if (!promoConfig) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid promo code.' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Check if promo code has expired
    if (promoConfig.validUntil && new Date() > promoConfig.validUntil) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'This promo code has expired.' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Handle plan grant codes (like RUBYFAM45)
    if (promoConfig.planToGrant) {
      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: 'active',
        plan_type: promoConfig.planToGrant,
      });

      console.log(`User ${user.id} applied code ${normalizedCode} and received ${promoConfig.planToGrant}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Promo code applied! You now have ${promoConfig.description}`,
        planGranted: promoConfig.planToGrant
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // Handle discount codes (like Halloween 34XFLZB6)
    if (promoConfig.discount) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: `${promoConfig.description} - Code ready to use at checkout!`,
        discount: promoConfig.discount,
        discountPercent: Math.round(promoConfig.discount * 100),
        code: normalizedCode
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid promo code configuration.' 
    }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Apply promo code error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});