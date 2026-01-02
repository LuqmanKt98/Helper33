import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            recipientMemberId,
            message,
            contextId,
            contextType,
            notifyExternal = false // Whether to send SMS/push to external members
        } = await req.json();

        // Create chat message
        const chatMessage = await base44.entities.ChatMessage.create({
            sender_name: user.full_name,
            content: message,
            context_id: contextId || 'family_chat_main',
            context_type: contextType || 'family'
        });

        // Get recipient member
        const recipient = await base44.asServiceRole.entities.FamilyMember.get(recipientMemberId);

        if (recipient && notifyExternal) {
            // Send push notification if they have app installed
            if (recipient.user_id) {
                try {
                    await base44.functions.invoke('sendPushNotification', {
                        userId: recipient.user_id,
                        title: `Message from ${user.full_name}`,
                        body: message.substring(0, 100),
                        data: {
                            type: 'family_message',
                            contextId,
                            url: '/family?tab=chat'
                        }
                    });
                } catch (error) {
                    console.log('Push notification failed:', error);
                }
            }

            // Send SMS if they don't have app or prefer SMS
            if (recipient.phone_number && (!recipient.user_id || recipient.prefers_sms)) {
                try {
                    await base44.functions.invoke('sendSMS', {
                        to: recipient.phone_number,
                        message: `${user.full_name}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}\n\nReply in the DobryLife app`
                    });
                } catch (error) {
                    console.log('SMS notification failed:', error);
                }
            }
        }

        return Response.json({ 
            success: true, 
            messageId: chatMessage.id 
        });

    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});