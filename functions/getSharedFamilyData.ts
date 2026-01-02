import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const { familyId } = await req.json();

        if (!familyId) {
            return new Response(JSON.stringify({ error: 'Family ID is required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // This endpoint is for public/shared access, so we use a service role to fetch data.
        // Access control is managed by the frontend, which requires a valid code to get the familyId.
        const base44 = createClientFromRequest(req);

        const [familyEvents, familyProfile] = await Promise.all([
            base44.asServiceRole.entities.FamilyEvent.filter({ created_by: { eq: familyId } }),
            base44.asServiceRole.entities.FamilyProfile.filter({ created_by: { eq: familyId } }).then(p => p[0] || null)
        ]);
        
        return new Response(JSON.stringify({
            events: familyEvents,
            profile: familyProfile,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('Error fetching shared family data:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});