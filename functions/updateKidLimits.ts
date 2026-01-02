import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const { adminMemberId, kidMemberId, dailyMinutes, bedtime } = await req.json();
        if (!adminMemberId || !kidMemberId) {
            return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // This is a privileged operation, so we use asServiceRole after an initial auth check.
         const { data: { user } } = await base44.auth.getUser();
        if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const [adminMember, kidMember] = await Promise.all([
            base44.asServiceRole.entities.Member.get(adminMemberId),
            base44.asServiceRole.entities.Member.get(kidMemberId)
        ]);
        
        if (!adminMember) throw new Error('Admin member not found.');
        if (!kidMember) throw new Error('Kid member not found.');

        if (adminMember.role !== 'ADMIN') {
            return new Response(JSON.stringify({ error: 'Action requires ADMIN role.' }), { status: 403 });
        }
        if (kidMember.role !== 'KID') {
            return new Response(JSON.stringify({ error: 'Can only set limits for KID members.' }), { status: 400 });
        }
        if (adminMember.family_id !== kidMember.family_id) {
            return new Response(JSON.stringify({ error: 'Cross-family operations not allowed.' }), { status: 403 });
        }

        const currentControls = kidMember.profile_controls || {};
        const newLimits = {
            daily_minutes: dailyMinutes,
            bedtime: bedtime,
        };

        const updatedControls = { 
            ...currentControls, 
            screen_time_limits: newLimits 
        };

        await base44.asServiceRole.entities.Member.update(kidMember.id, { profile_controls: updatedControls });

        return new Response(JSON.stringify({ success: true, profile_controls: updatedControls }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});