import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { uses_remaining = 10, expires_in_days = 30 } = body;

    // Generate unique code
    let code = generateCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await base44.entities.FamilyInvite.filter({
        code: { eq: code },
        status: { eq: 'active' }
      });

      if (existing.length === 0) {
        isUnique = true;
      } else {
        code = generateCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return Response.json({ error: 'Failed to generate unique code' }, { status: 500 });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Create invite
    const invite = await base44.entities.FamilyInvite.create({
      code: code,
      created_by_user_id: user.id,
      created_by_name: user.full_name,
      expires_at: expiresAt.toISOString(),
      uses_remaining: uses_remaining,
      status: 'active'
    });

    return Response.json({
      code: invite.code,
      expires_at: invite.expires_at,
      expires_in_days: expires_in_days,
      uses_remaining: invite.uses_remaining,
      invite_url: `${req.headers.get('origin') || 'https://app.base44.com'}/JoinFamily?code=${invite.code}`
    });

  } catch (error) {
    console.error('Error generating invite code:', error);
    return Response.json({ 
      error: 'Failed to generate invite code',
      details: error.message 
    }, { status: 500 });
  }
});