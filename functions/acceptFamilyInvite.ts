import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Must be logged in to accept invite' }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || code.length !== 8) {
      return Response.json({ error: 'Invalid invite code format' }, { status: 400 });
    }

    // Find the invite
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter({
      code: { eq: code },
      status: { eq: 'active' }
    });

    if (!invites || invites.length === 0) {
      return Response.json({ error: 'Invalid or expired invite code' }, { status: 404 });
    }

    const invite = invites[0];

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      await base44.asServiceRole.entities.FamilyInvite.update(invite.id, { status: 'expired' });
      return Response.json({ error: 'This invite code has expired' }, { status: 410 });
    }

    // Check if user is already part of this family
    const existingMembers = await base44.entities.FamilyMember.filter({
      user_id: { eq: user.id }
    });

    const alreadyMember = existingMembers.some(m => m.created_by === invite.created_by_user_id);
    
    if (alreadyMember) {
      return Response.json({ 
        success: true,
        message: 'You are already a member of this family',
        familyOwnerId: invite.created_by_user_id
      });
    }

    // Create a family member entry for the new user in the family owner's account
    await base44.asServiceRole.entities.FamilyMember.create({
      name: user.full_name,
      role: 'AdultMember',
      user_id: user.id,
      email: user.email,
      avatar_url: user.avatar_url,
      invitation_status: 'joined',
      created_by: invite.created_by_user_id // Important: created_by is the family owner
    });

    // Also create a reciprocal entry so the new user can see the family
    // This allows the new user to access the shared family data
    const familyMembers = await base44.asServiceRole.entities.FamilyMember.filter({
      created_by: { eq: invite.created_by_user_id }
    });

    // Copy all family members to the new user's account
    for (const member of familyMembers) {
      await base44.asServiceRole.entities.FamilyMember.create({
        name: member.name,
        role: member.role,
        user_id: member.user_id,
        email: member.email,
        phone_number: member.phone_number,
        avatar_url: member.avatar_url,
        age: member.age,
        birthday: member.birthday,
        invitation_status: member.invitation_status,
        created_by: user.email // New user becomes the creator for their copy
      });
    }

    // Decrement uses remaining
    if (invite.uses_remaining > 1) {
      await base44.asServiceRole.entities.FamilyInvite.update(invite.id, {
        uses_remaining: invite.uses_remaining - 1
      });
    } else {
      await base44.asServiceRole.entities.FamilyInvite.update(invite.id, {
        uses_remaining: 0,
        status: 'expired'
      });
    }

    // Send notification to family owner
    try {
      await base44.asServiceRole.functions.invoke('sendFamilyMessage', {
        recipientUserId: invite.created_by_user_id,
        title: 'New Family Member Joined!',
        message: `${user.full_name} has joined your family through an invite code.`,
        type: 'family_join'
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    return Response.json({
      success: true,
      message: `Welcome to ${invite.created_by_name}'s family!`,
      familyOwnerId: invite.created_by_user_id,
      familyOwnerName: invite.created_by_name
    });

  } catch (error) {
    console.error('Error accepting family invite:', error);
    return Response.json({ 
      error: 'Failed to accept invite',
      details: error.message 
    }, { status: 500 });
  }
});