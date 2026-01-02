import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to create stickers (bypasses RLS)
    const existingStickers = await base44.asServiceRole.entities.Sticker.list();
    
    // Only create if no stickers exist
    if (existingStickers.length > 0) {
      return Response.json({ 
        success: true, 
        message: 'Stickers already exist',
        count: existingStickers.length 
      });
    }

    // Create the sticker collection
    const stickersToCreate = [
      { name: "Golden Star", image_url: "⭐", description: "A shining golden star for amazing work!", rarity: "common" },
      { name: "Rainbow Heart", image_url: "💖", description: "A colorful heart full of love!", rarity: "common" },
      { name: "Happy Sunflower", image_url: "🌻", description: "A cheerful sunflower to brighten your day!", rarity: "common" },
      { name: "Magic Unicorn", image_url: "🦄", description: "A magical unicorn for creative minds!", rarity: "rare" },
      { name: "Wise Owl", image_url: "🦉", description: "A smart owl for clever students!", rarity: "rare" },
      { name: "Rocket Ship", image_url: "🚀", description: "Blast off to success!", rarity: "rare" },
      { name: "Trophy Champion", image_url: "🏆", description: "You're a champion!", rarity: "rare" },
      { name: "Rainbow Bridge", image_url: "🌈", description: "A beautiful rainbow of achievement!", rarity: "common" },
      { name: "Celebration Party", image_url: "🎉", description: "Party time for your success!", rarity: "common" },
      { name: "Sparkle Fairy", image_url: "✨", description: "Magical sparkles of wonder!", rarity: "common" },
      { name: "Crown Royalty", image_url: "👑", description: "You rule your learning!", rarity: "epic" },
      { name: "Dragon Master", image_url: "🐉", description: "A legendary dragon for epic achievements!", rarity: "epic" },
      { name: "Diamond Gem", image_url: "💎", description: "A rare diamond for precious moments!", rarity: "epic" },
      { name: "Butterfly Beauty", image_url: "🦋", description: "Transform and grow!", rarity: "common" },
      { name: "Book Lover", image_url: "📚", description: "For reading champions!", rarity: "common" },
      { name: "Art Palette", image_url: "🎨", description: "Creative artist sticker!", rarity: "common" },
      { name: "Music Note", image_url: "🎵", description: "For musical talents!", rarity: "common" },
      { name: "Planet Explorer", image_url: "🪐", description: "Explore the universe of knowledge!", rarity: "rare" },
      { name: "Cupcake Delight", image_url: "🧁", description: "Sweet success!", rarity: "common" },
      { name: "Fire Phoenix", image_url: "🔥", description: "Rise from challenges stronger!", rarity: "epic" }
    ];

    // Create stickers using service role
    const createdStickers = await base44.asServiceRole.entities.Sticker.bulkCreate(stickersToCreate);

    return Response.json({
      success: true,
      message: 'Stickers initialized successfully',
      count: createdStickers.length,
      stickers: createdStickers
    });

  } catch (error) {
    console.error('Error initializing stickers:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});