
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { memberId, pin } = await req.json();

        if (!memberId || !pin) {
            return Response.json({ error: 'Member ID and PIN required' }, { status: 400 });
        }

        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const members = await base44.entities.FamilyMember.filter({ id: memberId });
        
        if (!members || members.length === 0) {
            return Response.json({ error: 'Family member not found' }, { status: 404 });
        }

        const member = members[0];

        if (!member.kids_pin) {
            return Response.json({ 
                error: 'No PIN set for this child. Please ask a parent to set up a PIN in the Helper33 Family Hub.' 
            }, { status: 400 });
        }

        if (member.kids_pin !== pin) {
            return Response.json({ error: 'Incorrect PIN' }, { status: 401 });
        }

        return Response.json({
            success: true,
            memberData: {
                id: member.id,
                name: member.name,
                avatar_url: member.avatar_url,
                role: member.role,
                time_limits: member.kids_time_limits || {}
            }
        });

    } catch (error) {
        console.error('Error in kidsEnter:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
