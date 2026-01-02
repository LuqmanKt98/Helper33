import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// This function notifies all family members about a new group video call.
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roomUrl } = await req.json();
        if (!roomUrl) {
            return Response.json({ error: 'roomUrl is required' }, { status: 400 });
        }

        const serviceRole = base44.asServiceRole;

        // 1. Create a special message in the family group chat
        await serviceRole.entities.ChatMessage.create({
            sender_id: user.id,
            sender_name: 'System', // Or user.full_name
            sender_avatar_url: 'https://img.clerk.com/preview.png', // A generic icon
            content: `${user.full_name} started a group video call.`,
            message_type: 'video_call_link',
            media_url: roomUrl,
            context_id: 'family_group_chat',
            context_type: 'family',
        });

        // 2. Get all family members to notify them
        const members = await serviceRole.entities.FamilyMember.filter({
            // Optionally filter out the caller if they don't need a notification
            // user_id: { $ne: user.id } 
        });

        const notificationPromises = members.map(member => {
            // Don't notify the person who started the call
            if (member.user_id === user.id) return Promise.resolve();

            const notificationMessage = `${user.full_name} started a family video call. Tap to join!`;

            // 3. Send notifications (Push and/or SMS)
            if (member.phone_number) { // Assume SMS for now, push is more complex
                 return serviceRole.functions.invoke('sendSMS', {
                    to: member.phone_number,
                    body: `${notificationMessage}\n${roomUrl}`
                });
            }
            return Promise.resolve();
        });

        await Promise.all(notificationPromises);

        return Response.json({ success: true, message: 'Family notified' });

    } catch (error) {
        console.error('Error notifying family of group call:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});