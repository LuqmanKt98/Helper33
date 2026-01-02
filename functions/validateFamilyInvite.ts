import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { code } = await req.json();

    if (!code || code.length !== 8) {
      return Response.json({ 
        valid: false,
        error: 'Invalid code format' 
      }, { status: 400 });
    }

    // Find the invite using service role to access any user's invites
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter({
      code: { eq: code.toUpperCase() },
      status: { eq: 'active' }
    });

    if (!invites || invites.length === 0) {
      return Response.json({ 
        valid: false,
        error: 'Invite code not found or has expired' 
      });
    }

    const invite = invites[0];

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      await base44.asServiceRole.entities.FamilyInvite.update(invite.id, { 
        status: 'expired' 
      });
      return Response.json({ 
        valid: false,
        error: 'This invite code has expired' 
      });
    }

    // Check if there are uses remaining
    if (invite.uses_remaining <= 0) {
      await base44.asServiceRole.entities.FamilyInvite.update(invite.id, { 
        status: 'expired' 
      });
      return Response.json({ 
        valid: false,
        error: 'This invite code has no uses remaining' 
      });
    }

    return Response.json({
      valid: true,
      familyOwnerId: invite.created_by_user_id,
      familyOwnerName: invite.created_by_name,
      expiresAt: invite.expires_at,
      usesRemaining: invite.uses_remaining
    });

  } catch (error) {
    console.error('Error validating invite:', error);
    return Response.json({ 
      valid: false,
      error: 'Failed to validate invite code',
      details: error.message 
    }, { status: 500 });
  }
});