
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { v4 as uuidv4 } from 'npm:uuid@9.0.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { receiverId } = await req.json();
        if (!receiverId) {
            return Response.json({ success: false, error: 'Receiver ID is required.' }, { status: 400 });
        }
        
        if (receiverId === user.id) {
            return Response.json({ success: false, error: 'You cannot call yourself.' }, { status: 400 });
        }

        // Generate a unique room name based on sorted user IDs to ensure consistency
        const ids = [user.id, receiverId].sort();
        const roomName = `family-call-${ids[0]}-${ids[1]}`;

        // Create a call invitation record
        const invitation = await base44.asServiceRole.entities.CallInvitation.create({
            caller_id: user.id,
            caller_name: user.full_name,
            caller_avatar: user.avatar_url,
            receiver_id: receiverId,
            room_name: roomName,
            status: 'ringing'
        });

        // (Optional but recommended) Send a push notification to the receiver
        await base44.asServiceRole.functions.invoke('sendWebPush', {
            targetUserId: receiverId,
            title: `${user.full_name} is calling you`,
            body: 'Tap to answer the video call.',
            url: `/family`, // URL to open when notification is clicked
            data: {
                type: 'INCOMING_CALL',
                invitationId: invitation.id,
                callerId: user.id,
                callerName: user.full_name,
                callerAvatar: user.avatar_url,
                receiverId: receiverId,
                roomName: roomName
            }
        });

        return Response.json({ success: true, invitation });

    } catch (error) {
        console.error("Initiate call error:", error);
        return Response.json({ success: false, error: error.message || "Failed to initiate call." }, { status: 500 });
    }
});
