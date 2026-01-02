import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import bcrypt from 'npm:bcryptjs@2.4.3';

Deno.serve(async (req) => {
    try {
        const { adminMemberId, kidMemberId, pin } = await req.json();
        if (!adminMemberId || !kidMemberId || !pin) {
            return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
        }
        
        if (!/^\d{4,6}$/.test(pin)) {
            return new Response(JSON.stringify({ error: 'PIN must be 4 to 6 digits.' }), { status: 400 });
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
            return new Response(JSON.stringify({ error: 'Can only set PIN for KID members.' }), { status: 400 });
        }
        if (adminMember.family_id !== kidMember.family_id) {
            return new Response(JSON.stringify({ error: 'Cross-family operations not allowed.' }), { status: 403 });
        }

        const salt = await bcrypt.genSalt(10);
        const pin_code_hash = await bcrypt.hash(pin, salt);

        await base44.asServiceRole.entities.Member.update(kidMember.id, { pin_code_hash });

        return new Response(JSON.stringify({ success: true, message: "PIN updated successfully." }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});