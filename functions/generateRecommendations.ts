import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { limit = 10 } = await req.json();

    // Get user's browsing history
    const browsingHistory = await base44.entities.BrowsingHistory.filter(
      { created_by: user.email },
      '-viewed_at',
      50
    );

    // Get user's past purchases
    const pastOrders = await base44.entities.MarketplaceOrder.filter(
      { buyer_email: user.email },
      '-created_date',
      20
    );

    // Get all active products and courses
    const [products, courses] = await Promise.all([
      base44.asServiceRole.entities.MarketplaceProduct.filter({ status: 'active' }),
      base44.asServiceRole.entities.Course.filter({ status: 'published' })
    ]);

    // Build recommendation context
    const viewedCategories = [...new Set(browsingHistory.map(h => h.item_category).filter(Boolean))];
    const viewedSellers = [...new Set(browsingHistory.map(h => h.seller_id).filter(Boolean))];
    const purchasedCategories = [...new Set(
      pastOrders.flatMap(order => 
        order.items.map(item => item.item_category || '')
      ).filter(Boolean)
    )];
    
    const viewedPriceRange = browsingHistory.length > 0 ? {
      min: Math.min(...browsingHistory.map(h => h.item_price || 0)),
      max: Math.max(...browsingHistory.map(h => h.item_price || 0))
    } : { min: 0, max: 100 };

    // Get existing recommendations to avoid duplicates
    const existingRecs = await base44.entities.ProductRecommendation.filter(
      { created_by: user.email },
      '-shown_at',
      100
    );
    const alreadyRecommended = new Set(existingRecs.map(r => r.item_id));

    // Generate recommendations using AI
    const recommendations = [];
    
    // Combine all items
    const allItems = [
      ...products.map(p => ({ ...p, type: 'product' })),
      ...courses.map(c => ({ ...c, type: 'course' }))
    ];

    // Filter out already purchased and already recommended
    const purchasedItemIds = new Set(
      pastOrders.flatMap(o => o.items.map(i => i.item_id))
    );
    
    const viewedItemIds = new Set(browsingHistory.map(h => h.item_id));

    const candidateItems = allItems.filter(item => 
      !purchasedItemIds.has(item.id) &&
      !alreadyRecommended.has(item.id)
    );

    // Score each item
    const scoredItems = candidateItems.map(item => {
      let score = 0;
      let reason = 'personalized_ai';
      let basedOn = [];

      // Category match with browsing history
      if (viewedCategories.includes(item.category)) {
        score += 0.4;
        reason = 'browsing_history';
      }

      // Category match with purchase history
      if (purchasedCategories.includes(item.category)) {
        score += 0.3;
        reason = 'similar_purchases';
        basedOn.push('past_purchases');
      }

      // Seller match (liked this seller before)
      if (viewedSellers.includes(item.seller_id)) {
        score += 0.2;
        basedOn.push('seller');
      }

      // Price range match
      const itemPrice = item.price || 0;
      if (itemPrice >= viewedPriceRange.min * 0.7 && itemPrice <= viewedPriceRange.max * 1.3) {
        score += 0.15;
      }

      // High rating boost
      if (item.average_rating >= 4.5) {
        score += 0.2;
        basedOn.push('highly_rated');
      }

      // Trending boost
      if (item.total_sales > 50) {
        score += 0.1;
        reason = 'trending';
      }

      // New items boost
      const createdDate = new Date(item.created_date);
      const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 30) {
        score += 0.05;
      }

      // Random factor for diversity
      score += Math.random() * 0.1;

      return {
        item,
        score,
        reason,
        basedOn
      };
    });

    // Sort by score and take top recommendations
    const topRecommendations = scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Create recommendation records
    for (const rec of topRecommendations) {
      const recommendationData = {
        item_id: rec.item.id,
        item_type: rec.item.type,
        item_name: rec.item.type === 'product' ? rec.item.product_name : rec.item.title,
        item_image: rec.item.type === 'product' 
          ? rec.item.images?.[0]?.url 
          : rec.item.cover_image_url,
        item_price: rec.item.price,
        seller_id: rec.item.seller_id,
        seller_name: rec.item.seller_name,
        recommendation_reason: rec.reason,
        recommendation_score: rec.score,
        based_on_items: rec.basedOn,
        shown_at: new Date().toISOString()
      };

      recommendations.push(recommendationData);
      
      // Save to database
      await base44.entities.ProductRecommendation.create(recommendationData);
    }

    return Response.json({ 
      success: true,
      recommendations: recommendations,
      total_count: recommendations.length
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate recommendations' 
    }, { status: 500 });
  }
});