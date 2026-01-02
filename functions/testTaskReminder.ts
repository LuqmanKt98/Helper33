import { createClient } from 'npm:@base44/sdk@0.7.1';

const base44 = createClient({ serviceRole: true });

Deno.serve(async (req) => {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return Response.json({
                success: false,
                error: 'userId is required'
            }, { status: 400 });
        }

        console.log('🧪 Testing task reminder for user:', userId);

        // Get user
        const users = await base44.entities.User.filter({ id: userId }, '', 1);
        if (!users || users.length === 0) {
            return Response.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        const user = users[0];
        console.log('User found:', {
            email: user.email,
            phone: user.phone_number,
            onesignal: user.onesignal_player_id ? 'Yes' : 'No'
        });

        // Send test notification
        const result = await base44.functions.invoke('sendMultiChannelNotification', {
            userId: user.id,
            title: '🧪 Test Task Reminder',
            body: 'This is a test reminder from DobryLife. If you receive this via SMS, push, or email, your notifications are working correctly!',
            data: {
                type: 'test_reminder',
                url: '/Organizer'
            },
            channels: ['push', 'sms', 'email'],
            priority: 'high',
            force: true
        });

        console.log('Test result:', result?.data);

        return Response.json({
            success: true,
            user: {
                email: user.email,
                phone: user.phone_number,
                has_onesignal: !!user.onesignal_player_id
            },
            notification_result: result?.data
        });

    } catch (error) {
        console.error('❌ Test Error:', error);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});