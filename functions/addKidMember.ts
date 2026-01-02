import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import bcrypt from 'npm:bcryptjs@2.4.3';

Deno.serve(async (req) => {
    try {
        const { adminMemberId, familyId, displayName, pin } = await req.json();
        if (!adminMemberId || !familyId || !displayName || !pin) {
            return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
        }
        
        if (!/^\d{4,6}$/.test(pin)) {
            return new Response(JSON.stringify({ error: 'PIN must be 4 to 6 digits.' }), { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        
        const { data: { user } } = await base44.auth.getUser();
        if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const adminMember = await base44.asServiceRole.entities.Member.get(adminMemberId);

        if (!adminMember) throw new Error('Admin member not found.');

        if (adminMember.role !== 'ADMIN') {
            return new Response(JSON.stringify({ error: 'Action requires ADMIN role.' }), { status: 403 });
        }
        
        if (adminMember.family_id !== familyId) {
            return new Response(JSON.stringify({ error: 'Cannot add member to a different family.' }), { status: 403 });
        }

        const salt = await bcrypt.genSalt(10);
        const pin_code_hash = await bcrypt.hash(pin, salt);

        const defaultProfileControls = {
            ai_guardrails: true,
            kids_mode_active: true,
            screen_time_limits: { daily_minutes: 60, bedtime: '20:00' }
        };

        const { data: newKid, error } = await base44.asServiceRole.entities.Member.create({
            family_id: familyId,
            role: 'KID',
            display_name: displayName,
            pin_code_hash: pin_code_hash,
            profile_controls: defaultProfileControls,
        });

        if (error) throw error;

        return new Response(JSON.stringify(newKid), {
            headers: { 'Content-Type': 'application/json' },
            status: 201,
        });

    } catch (error) {
        console.error('Error adding kid member:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});