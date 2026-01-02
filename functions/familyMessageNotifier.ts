import { createClient } from 'npm:@base44/sdk@0.7.1';

const base44 = createClient({ serviceRole: true });

Deno.serve(async (req) => {
    try {
        const { messageId, senderId, contextId } = await req.json();

        console.log('💬 Family Message Notifier - Multi-Channel:', { messageId, senderId, contextId });

        // Get the message
        const messages = await base44.entities.ChatMessage.filter({ id: messageId });
        if (!messages || messages.length === 0) {
            return Response.json({ error: 'Message not found' }, { status: 404 });
        }
        const message = messages[0];

        // Get sender info
        const senders = await base44.entities.User.filter({ id: senderId });
        const sender = senders[0];

        // Get all family members except the sender
        const familyMembers = await base44.entities.FamilyMember.filter({
            created_by: message.created_by
        });

        let notificationsSent = 0;

        for (const member of familyMembers) {
            if (member.user_id && member.user_id !== senderId) {
                try {
                    const users = await base44.entities.User.filter({ id: member.user_id });
                    const recipientUser = users[0];

                    if (recipientUser) {
                        // Check if user wants family message notifications
                        const notificationPrefs = recipientUser.notification_settings || {};
                        if (notificationPrefs.family_messages !== false) {
                            await base44.functions.invoke('sendMultiChannelNotification', {
                                userId: recipientUser.id,
                                title: `💬 ${sender?.full_name || 'Family Member'} sent a message`,
                                body: message.content.substring(0, 100),
                                data: {
                                    type: 'family_message',
                                    message_id: messageId,
                                    sender_id: senderId,
                                    url: '/family'
                                },
                                channels: ['push', 'sms', 'email'], // ALL THREE CHANNELS
                                priority: 'normal'
                            });

                            notificationsSent++;
                        }
                    }
                } catch (error) {
                    console.error(`Error notifying member ${member.id}:`, error);
                }
            }
        }

        console.log(`✅ Sent ${notificationsSent} multi-channel family message notifications`);

        return Response.json({
            success: true,
            notifications_sent: notificationsSent
        });

    } catch (error) {
        console.error('❌ Family Message Notifier Error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});