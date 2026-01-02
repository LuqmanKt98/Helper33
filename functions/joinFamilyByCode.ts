import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Helper to generate a random string
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: User not authenticated.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: 'Invite code is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Use service role to find the access code
    const accessCodes = await base44.asServiceRole.entities.AccessCode.filter({ code: code.toUpperCase() });
    
    if (!accessCodes || accessCodes.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid invite code.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    const accessCode = accessCodes[0];

    if (accessCode.status !== 'active' || accessCode.uses_remaining <= 0) {
      return new Response(JSON.stringify({ error: 'This invite code has expired or has no uses left.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { family_id } = accessCode;

    // Check if user is already a member of any family
    const existingMemberships = await base44.asServiceRole.entities.Member.filter({ user_id: user.id });
    if (existingMemberships && existingMemberships.length > 0) {
        if(existingMemberships[0].family_id === family_id) {
            return new Response(JSON.stringify({ message: 'You are already a member of this family.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: 'You are already part of another family.' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }


    // Get the primary user's subscription details to grant access
    const families = await base44.asServiceRole.entities.Family.filter({ id: family_id });
    if (!families || families.length === 0) {
        return new Response(JSON.stringify({ error: 'Associated family not found.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    const family = families[0];

    const primaryUsers = await base44.asServiceRole.entities.User.filter({ id: family.primary_user_id });
     if (!primaryUsers || primaryUsers.length === 0) {
        return new Response(JSON.stringify({ error: 'Primary family account holder not found.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    const primaryUser = primaryUsers[0];

    // Create a new member record
    await base44.asServiceRole.entities.Member.create({
      family_id: family_id,
      user_id: user.id,
      display_name: user.full_name,
      email: user.email,
      profile_picture_url: user.profile_picture_url,
      role: 'ADULT',
    });

    // Decrement the uses_remaining on the access code
    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      uses_remaining: accessCode.uses_remaining - 1,
    });
    
    // Update the joining user's account to reflect the new subscription status
    await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: 'active',
        plan_type: primaryUser.plan_type
    });

    return new Response(JSON.stringify({ message: 'Successfully joined the family!' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in joinFamilyByCode:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});