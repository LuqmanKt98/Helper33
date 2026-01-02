import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const { access_code } = await req.json();

    if (!access_code) {
      return new Response(JSON.stringify({ success: false, error: 'Access code is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use service role to check for the code across all users
    const base44 = createClientFromRequest(req);
    const { data: members, error } = await base44.asServiceRole.entities.FamilyMember.filter({
      access_code: { eq: access_code }
    }, '', 1);

    if (error) {
      throw error;
    }

    if (members && members.length > 0) {
      const member = members[0];
      // Return the family identifier (created_by) and the member's name
      return new Response(JSON.stringify({ 
        success: true, 
        familyId: member.created_by,
        memberName: member.name
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Invalid access code.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('Error validating access code:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});